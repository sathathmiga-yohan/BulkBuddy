
import csv
import io

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.auth.security import require_seller
from app.database import get_db

from app.models.deal import Deal
from app.models.user import User

from app.schemas.deal import DealCreate

from app.services.deal_service import (
    validate_deal_values,
)

# CSV IMPORT ROUTER

router = APIRouter(
    prefix="/deals",
    tags=["CSV Import"]
)

# REQUIRED CSV HEADERS

REQUIRED_COLUMNS = {
    "product_name",
    "description",
    "normal_price",
    "group_price",
    "minimum_buyers",
    "maximum_quantity",
    "deadline",
}

# IMPORT DEALS FROM CSV

@router.post(
    "/import-csv",
    status_code=status.HTTP_200_OK
)
async def import_deals_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    # CHECK FILE EXTENSION

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a valid CSV file"
        )

    # READ AND DECODE FILE

    try:

        file_content = await file.read()

        decoded_content = file_content.decode(
            "utf-8-sig"
        )

    except UnicodeDecodeError:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file must use UTF-8 encoding"
        )

    finally:

        await file.close()

    if not decoded_content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty"
        )

    # PARSE CSV

    csv_reader = csv.DictReader(
        io.StringIO(decoded_content)
    )

    if not csv_reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV headers are missing"
        )

    # Remove accidental whitespace from header names.
    csv_reader.fieldnames = [
        header.strip()
        for header in csv_reader.fieldnames
    ]

    # CHECK REQUIRED COLUMNS

    missing_columns = REQUIRED_COLUMNS - set(
        csv_reader.fieldnames
    )

    if missing_columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Required CSV columns are missing",
                "missing_columns": sorted(missing_columns),
            }
        )

    # PROCESS EACH CSV ROW

    created_count = 0
    errors = []

    for row_number, row in enumerate(
        csv_reader,
        start=2
    ):

        # Ignore completely empty lines.
        if not any(
            str(value).strip()
            for value in row.values()
            if value is not None
        ):
            continue

        try:

            # Extra unnamed CSV values indicate a
            # malformed row.
            if None in row:
                raise ValueError(
                    "Row contains more values than the CSV headers"
                )

            # Required values must not be missing.
            missing_values = [
                column
                for column in REQUIRED_COLUMNS
                if row.get(column) is None
                or not str(row[column]).strip()
                and column != "description"
            ]

            if missing_values:
                raise ValueError(
                    "Missing required values: "
                    + ", ".join(sorted(missing_values))
                )

            # VALIDATE USING EXISTING DEAL SCHEMA

            deal_data = DealCreate.model_validate({
                "product_name": row["product_name"],
                "description": row.get("description") or None,
                "normal_price": row["normal_price"],
                "group_price": row["group_price"],
                "minimum_buyers": row["minimum_buyers"],
                "maximum_quantity": row["maximum_quantity"],
                "deadline": row["deadline"],
            })

            validate_deal_values(
                normal_price=deal_data.normal_price,
                group_price=deal_data.group_price,
                minimum_buyers=deal_data.minimum_buyers,
                maximum_quantity=deal_data.maximum_quantity,
                deadline=deal_data.deadline
            )

            # CREATE DEAL

            new_deal = Deal(
                seller_id=current_user.id,
                product_name=deal_data.product_name,
                description=deal_data.description,
                normal_price=deal_data.normal_price,
                group_price=deal_data.group_price,
                minimum_buyers=deal_data.minimum_buyers,
                maximum_quantity=deal_data.maximum_quantity,
                deadline=deal_data.deadline,
            )

            # Save each row independently so that
            # a failed row does not undo valid rows.
            with db.begin_nested():
                db.add(new_deal)
                db.flush()

            created_count += 1

        except ValidationError as exc:

            errors.append({
                "row": row_number,
                "errors": [
                    {
                        "field": ".".join(
                            str(part)
                            for part in error["loc"]
                        ),
                        "message": error["msg"],
                    }
                    for error in exc.errors()
                ],
            })

        except (ValueError, TypeError) as exc:

            errors.append({
                "row": row_number,
                "errors": [
                    {
                        "message": str(exc)
                    }
                ],
            })

    # COMMIT VALID ROWS

    try:

        db.commit()

    except Exception:

        db.rollback()
        raise

    return {
        "message": "CSV import completed",
        "created_count": created_count,
        "failed_count": len(errors),
        "errors": errors,
    }
