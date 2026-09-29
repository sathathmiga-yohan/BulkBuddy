from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import require_seller
from app.database import get_db

from app.models.deal import Deal
from app.models.user import User

from app.schemas.deal import (
    DealCreate,
    DealUpdate,
    DealResponse,
)

from app.services.deal_service import (
    build_deal_response,
    get_deal_or_404,
    validate_seller_ownership,
    validate_deal_values,
    validate_deal_update,
    validate_deal_deletion,
)


# ==========================================
# DEALS ROUTER
# ==========================================

router = APIRouter(
    prefix="/deals",
    tags=["Deals"]
)


# ==========================================
# GET ALL DEALS - PUBLIC
# ==========================================

@router.get(
    "",
    response_model=list[DealResponse]
)
def get_all_deals(
    db: Session = Depends(get_db)
):

    deals = db.scalars(
        select(Deal).order_by(
            Deal.created_at.desc(),
            Deal.id.desc()
        )
    ).all()

    return [
        build_deal_response(db, deal)
        for deal in deals
    ]


# ==========================================
# GET SELLER'S OWN DEALS
# ==========================================

@router.get(
    "/seller/my-deals",
    response_model=list[DealResponse]
)
def get_my_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    deals = db.scalars(
        select(Deal).where(
            Deal.seller_id == current_user.id
        ).order_by(
            Deal.created_at.desc(),
            Deal.id.desc()
        )
    ).all()

    return [
        build_deal_response(db, deal)
        for deal in deals
    ]


# ==========================================
# GET DEAL BY ID - PUBLIC
# ==========================================

@router.get(
    "/{deal_id}",
    response_model=DealResponse
)
def get_deal_by_id(
    deal_id: int,
    db: Session = Depends(get_db)
):

    deal = get_deal_or_404(
        db,
        deal_id
    )

    return build_deal_response(
        db,
        deal
    )


# ==========================================
# CREATE DEAL - SELLER ONLY
# ==========================================

@router.post(
    "",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED
)
def create_deal(
    deal_data: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    validate_deal_values(
        normal_price=deal_data.normal_price,
        group_price=deal_data.group_price,
        minimum_buyers=deal_data.minimum_buyers,
        maximum_quantity=deal_data.maximum_quantity,
        deadline=deal_data.deadline
    )

    new_deal = Deal(
        seller_id=current_user.id,
        product_name=deal_data.product_name,
        description=deal_data.description,
        normal_price=deal_data.normal_price,
        group_price=deal_data.group_price,
        minimum_buyers=deal_data.minimum_buyers,
        maximum_quantity=deal_data.maximum_quantity,
        deadline=deal_data.deadline
    )

    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)

    return build_deal_response(
        db,
        new_deal
    )


# ==========================================
# UPDATE DEAL - OWNER ONLY
# ==========================================

@router.patch(
    "/{deal_id}",
    response_model=DealResponse
)
def update_deal(
    deal_id: int,
    update_data: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    deal = get_deal_or_404(
        db,
        deal_id
    )

    validate_seller_ownership(
        deal,
        current_user.id
    )

    changes = validate_deal_update(
        db,
        deal,
        update_data
    )

    for field, value in changes.items():
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)

    return build_deal_response(
        db,
        deal
    )


# ==========================================
# DELETE DEAL - OWNER ONLY
# ==========================================

@router.delete(
    "/{deal_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    deal = get_deal_or_404(
        db,
        deal_id
    )

    validate_seller_ownership(
        deal,
        current_user.id
    )

    validate_deal_deletion(
        db,
        deal
    )

    db.delete(deal)
    db.commit()

    return None