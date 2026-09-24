import csv
import io
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.auth.security import require_seller
from app.database import get_db
from app.models.deal import Deal, DealStatus
from app.models.user import User


router = APIRouter(
    prefix="/deals",
    tags=["CSV Import"]
)


REQUIRED_COLUMNS = {
    "product_name",
    "description",
    "normal_price",
    "group_price",
    "minimum_buyers",
    "maximum_quantity",
    "deadline",
}


@router.post("/import-csv")
async def import_deals_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    # =========================
    # CHECK FILE TYPE
    # =========================
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is required"
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )

    # =========================
    # READ FILE
    # =========================
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty"
        )

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file must use UTF-8 encoding"
        )

    reader = csv.DictReader(
        io.StringIO(text)
    )

    # =========================
    # CHECK HEADERS
    # =========================
    if reader.fieldnames is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV headers are missing"
        )

    headers = {
        header.strip()
        for header in reader.fieldnames
        if header
    }

    missing_columns = REQUIRED_COLUMNS - headers

    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Required CSV columns are missing",
                "missing_columns": sorted(missing_columns),
            }
        )

    new_deals = []
    errors = []

    now = datetime.now(timezone.utc)

    # =========================
    # VALIDATE EACH ROW
    # =========================
    for row_number, row in enumerate(
        reader,
        start=2
    ):
        try:
            product_name = (
                row["product_name"] or ""
            ).strip()

            description = (
                row["description"] or ""
            ).strip() or None

            if not product_name:
                raise ValueError(
                    "Product name is required"
                )

            try:
                normal_price = Decimal(
                    row["normal_price"]
                )

                group_price = Decimal(
                    row["group_price"]
                )

                minimum_buyers = int(
                    row["minimum_buyers"]
                )

                maximum_quantity = int(
                    row["maximum_quantity"]
                )

            except (
                InvalidOperation,
                ValueError,
                TypeError
            ):
                raise ValueError(
                    "Invalid price or quantity value"
                )

            # Example:
            # 2026-09-24T20:00:00+05:30
            try:
                deadline = datetime.fromisoformat(
                    row["deadline"].strip()
                )
            except (ValueError, AttributeError):
                raise ValueError(
                    "Invalid deadline format. "
                    "Use ISO format such as "
                    "2026-09-24T20:00:00+05:30"
                )

            # If timezone is not provided,
            # reject it to avoid ambiguity.
            if deadline.tzinfo is None:
                raise ValueError(
                    "Deadline must include timezone"
                )

            if normal_price <= 0:
                raise ValueError(
                    "Normal price must be greater than 0"
                )

            if group_price <= 0:
                raise ValueError(
                    "Group price must be greater than 0"
                )

            if group_price >= normal_price:
                raise ValueError(
                    "Group price must be less than normal price"
                )

            if minimum_buyers <= 0:
                raise ValueError(
                    "Minimum buyers must be greater than 0"
                )

            if maximum_quantity < minimum_buyers:
                raise ValueError(
                    "Maximum quantity must be greater than "
                    "or equal to minimum buyers"
                )

            if deadline <= now:
                raise ValueError(
                    "Deadline must be in the future"
                )

            deal = Deal(
                seller_id=current_user.id,
                product_name=product_name,
                description=description,
                normal_price=normal_price,
                group_price=group_price,
                minimum_buyers=minimum_buyers,
                maximum_quantity=maximum_quantity,
                deadline=deadline,
                status=DealStatus.ACTIVE,
                is_active=True,
            )

            new_deals.append(deal)

        except Exception as error:
            errors.append({
                "row": row_number,
                "error": str(error),
            })

    # =========================
    # NO VALID DATA
    # =========================
    if not new_deals and not errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV contains no data rows"
        )

    # =========================
    # VALIDATION ERRORS
    # =========================
    # All-or-nothing import:
    # if one row is invalid, nothing is inserted.
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "CSV validation failed",
                "errors": errors,
            }
        )

    # =========================
    # SAVE ALL DEALS
    # =========================
    try:
        db.add_all(new_deals)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import deals"
        )

    return {
        "message": "Deals imported successfully",
        "imported_count": len(new_deals),
    }