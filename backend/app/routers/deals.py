from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import require_seller
from app.database import get_db
from app.models.deal import Deal, DealStatus
from app.models.user import User
from app.schemas.deal import (
    DealCreate,
    DealUpdate,
    DealResponse,
)
from app.services.deal_service import (
    build_deal_response,
    get_participant_count,
    normalize_datetime,
)


router = APIRouter(
    prefix="/deals",
    tags=["Deals"]
)


# ==========================================
# GET ALL DEALS
# PUBLIC MARKETPLACE
# ==========================================
@router.get(
    "",
    response_model=list[DealResponse]
)
def get_all_deals(
    db: Session = Depends(get_db)
):
    deals = db.scalars(
        select(Deal)
        .where(Deal.is_active == True)
        .order_by(Deal.created_at.desc())
    ).all()

    return [
        build_deal_response(
            db,
            deal
        )
        for deal in deals
    ]


# ==========================================
# SELLER - GET MY DEALS
# Keep this before /{deal_id}
# ==========================================
@router.get(
    "/seller/my-deals",
    response_model=list[DealResponse]
)
def get_my_deals(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    deals = db.scalars(
        select(Deal)
        .where(
            Deal.seller_id == current_user.id
        )
        .order_by(Deal.created_at.desc())
    ).all()

    return [
        build_deal_response(
            db,
            deal
        )
        for deal in deals
    ]


# ==========================================
# GET ONE DEAL
# PUBLIC
# ==========================================
@router.get(
    "/{deal_id}",
    response_model=DealResponse
)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db)
):
    deal = db.get(
        Deal,
        deal_id
    )

    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    return build_deal_response(
        db,
        deal
    )


# ==========================================
# SELLER - CREATE DEAL
# ==========================================
@router.post(
    "",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED
)
def create_deal(
    deal_data: DealCreate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)

    # Deadline must be in the future
    if deal_data.deadline <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline must be in the future"
        )

    new_deal = Deal(
        seller_id=current_user.id,
        product_name=deal_data.product_name,
        description=deal_data.description,
        normal_price=deal_data.normal_price,
        group_price=deal_data.group_price,
        minimum_buyers=deal_data.minimum_buyers,
        maximum_quantity=deal_data.maximum_quantity,
        deadline=deal_data.deadline,
        status=DealStatus.ACTIVE,
        is_active=True,
    )

    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)

    return build_deal_response(
        db,
        new_deal
    )


# ==========================================
# SELLER - UPDATE OWN DEAL
# ==========================================
@router.patch(
    "/{deal_id}",
    response_model=DealResponse
)
def update_deal(
    deal_id: int,
    deal_data: DealUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    deal = db.get(
        Deal,
        deal_id
    )

    # Deal must exist
    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    # Seller can update only own deal
    if deal.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own deals"
        )

    now = datetime.now(timezone.utc)

    # Cannot edit after deadline
    if now >= normalize_datetime(deal.deadline):
       raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Expired deal cannot be updated"
    )

    update_data = deal_data.model_dump(
        exclude_unset=True
    )

    # ======================================
    # FINAL VALUES AFTER UPDATE
    # ======================================

    final_normal_price = update_data.get(
        "normal_price",
        deal.normal_price
    )

    final_group_price = update_data.get(
        "group_price",
        deal.group_price
    )

    final_minimum_buyers = update_data.get(
        "minimum_buyers",
        deal.minimum_buyers
    )

    final_maximum_quantity = update_data.get(
        "maximum_quantity",
        deal.maximum_quantity
    )

    final_deadline = update_data.get(
        "deadline",
        deal.deadline
    )

    # ======================================
    # VALIDATION
    # ======================================

    # Group price must be cheaper
    if final_group_price >= final_normal_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group price must be less than normal price"
        )

    # Maximum cannot be below minimum
    if final_maximum_quantity < final_minimum_buyers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Maximum quantity must be greater than "
                "or equal to minimum buyers"
            )
        )

    # Deadline must stay in future
    if normalize_datetime(final_deadline) <= now:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Deadline must be in the future"
    )

    # ======================================
    # CURRENT PARTICIPANT CHECK
    # ======================================

    current_participants = get_participant_count(
        db,
        deal.id
    )

    # Example:
    # 18 customers already joined
    # Seller cannot change maximum quantity to 10
    if final_maximum_quantity < current_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Maximum quantity cannot be less than "
                "the current participant count"
            )
        )

    # ======================================
    # SAVE UPDATE
    # ======================================

    for field, value in update_data.items():
        setattr(
            deal,
            field,
            value
        )

    db.commit()
    db.refresh(deal)

    return build_deal_response(
        db,
        deal
    )