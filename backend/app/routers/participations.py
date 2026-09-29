from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import (
    require_customer,
    require_seller,
)

from app.database import get_db

from app.models.deal import Deal
from app.models.participation import Participation
from app.models.user import User

from app.schemas.participation import (
    ParticipationJoin,
    ParticipationDetailResponse,
)

from app.services.participation_service import (
    join_deal,
    leave_deal,
    get_customer_participation,
    build_participation_response,
)


# ==========================================
# PARTICIPATION ROUTER
# ==========================================

router = APIRouter(
    prefix="/participations",
    tags=["Participations"]
)


# ==========================================
# GET MY PARTICIPATIONS - CUSTOMER ONLY
# ==========================================

@router.get(
    "/my",
    response_model=list[ParticipationDetailResponse]
)
def get_my_participations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):

    participations = db.scalars(
        select(Participation).where(
            Participation.customer_id == current_user.id
        ).order_by(
            Participation.joined_at.desc(),
            Participation.id.desc()
        )
    ).all()

    return [
        build_participation_response(db, participation)
        for participation in participations
    ]


# ==========================================
# GET MY PARTICIPATION FOR A DEAL
# ==========================================

@router.get(
    "/deals/{deal_id}/mine",
    response_model=ParticipationDetailResponse
)
def get_my_deal_participation(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):

    participation = get_customer_participation(
        db=db,
        deal_id=deal_id,
        customer_id=current_user.id
    )

    if participation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You have no participation in this deal"
        )

    return build_participation_response(
        db,
        participation
    )


# ==========================================
# JOIN / REJOIN DEAL - CUSTOMER ONLY
# ==========================================

@router.post(
    "/{deal_id}/join",
    response_model=ParticipationDetailResponse,
    status_code=status.HTTP_200_OK
)
def join_or_rejoin_deal(
    deal_id: int,
    join_data: ParticipationJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):

    participation = join_deal(
        db=db,
        deal_id=deal_id,
        customer=current_user,
        join_data=join_data
    )

    return build_participation_response(
        db,
        participation
    )


# ==========================================
# LEAVE DEAL - CUSTOMER ONLY
# ==========================================

@router.post(
    "/{deal_id}/leave",
    response_model=ParticipationDetailResponse
)
def leave_my_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):

    participation = leave_deal(
        db=db,
        deal_id=deal_id,
        customer=current_user
    )

    return build_participation_response(
        db,
        participation
    )


# ==========================================
# GET SELLER DEAL PARTICIPANTS
# ==========================================

@router.get(
    "/seller/deals/{deal_id}"
)
def get_seller_deal_participants(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):

    # Check whether this deal belongs to the seller.

    deal = db.scalar(
        select(Deal).where(
            Deal.id == deal_id,
            Deal.seller_id == current_user.id
        )
    )

    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found or you do not own this deal"
        )

    # Get all participation records for this deal.

    participations = db.scalars(
        select(Participation)
        .where(
            Participation.deal_id == deal_id
        )
        .order_by(
            Participation.joined_at.asc(),
            Participation.id.asc()
        )
    ).all()

    result = []

    for participation in participations:

        customer = participation.customer

        result.append({
            "id": participation.id,
            "deal_id": participation.deal_id,
            "customer_id": participation.customer_id,

            "customer_name": customer.name,
            "customer_email": customer.email,

            "status": participation.status.value,

            "delivery_name": participation.delivery_name,
            "delivery_phone": participation.delivery_phone,
            "delivery_address": participation.delivery_address,
            "delivery_city": participation.delivery_city,
            "delivery_postal_code": participation.delivery_postal_code,

            "joined_at": participation.joined_at,
            "updated_at": participation.updated_at,
        })

    return {
        "deal_id": deal.id,
        "product_name": deal.product_name,
        "minimum_buyers": deal.minimum_buyers,
        "maximum_quantity": deal.maximum_quantity,
        "participants": result,
    }