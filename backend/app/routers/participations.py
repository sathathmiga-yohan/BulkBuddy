from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import (
    require_customer,
    require_seller,
)
from app.database import get_db
from app.models.deal import Deal
from app.models.participation import (
    Participation,
    ParticipationStatus,
)
from app.models.user import User
from app.schemas.deal import DealResponse
from app.schemas.participation import ParticipationResponse
from app.services.deal_service import (
    is_deadline_passed,
    get_participant_count,
    build_deal_response,
    update_deal_status,
)


router = APIRouter(
    tags=["Participations"]
)


# CUSTOMER - JOIN DEAL
@router.post(
    "/deals/{deal_id}/join",
    response_model=ParticipationResponse,
    status_code=status.HTTP_201_CREATED
)
def join_deal(
    deal_id: int,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):

    deal = db.scalar(
        select(Deal)
        .where(Deal.id == deal_id)
        .with_for_update()
    )

    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    # Deal must be active
    if not deal.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal is not active"
        )

    # Deadline check
    if is_deadline_passed(deal):
        update_deal_status(
            db,
            deal
        )
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal deadline has passed"
        )

    # Check previous participation
    participation = db.scalar(
        select(Participation).where(
            Participation.deal_id == deal.id,
            Participation.customer_id == current_user.id
        )
    )

    # Customer already joined
    if (
        participation is not None
        and participation.status == ParticipationStatus.JOINED
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already joined this deal"
        )

    # Count only currently JOINED customers
    current_count = get_participant_count(
        db,
        deal.id
    )

    # Maximum capacity reached
    if current_count >= deal.maximum_quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Deal has reached maximum capacity"
        )

    # Customer joined before and cancelled.
    # Reuse the same participation record.
    if participation is not None:
        participation.status = ParticipationStatus.JOINED

        db.commit()
        db.refresh(participation)

        return participation

    # First-time join
    new_participation = Participation(
        deal_id=deal.id,
        customer_id=current_user.id,
        status=ParticipationStatus.JOINED
    )

    db.add(new_participation)
    db.commit()
    db.refresh(new_participation)

    return new_participation


# CUSTOMER - LEAVE DEAL
@router.delete(
    "/deals/{deal_id}/leave",
    response_model=ParticipationResponse
)
def leave_deal(
    deal_id: int,
    current_user: User = Depends(require_customer),
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

    # Deal must be active
    if not deal.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal is not active"
        )

    # Cannot leave after deadline
    if is_deadline_passed(deal):
        update_deal_status(
            db,
            deal
        )
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot leave after the deadline"
        )

    participation = db.scalar(
        select(Participation).where(
            Participation.deal_id == deal.id,
            Participation.customer_id == current_user.id
        )
    )

    if participation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You have not joined this deal"
        )

    if participation.status == ParticipationStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already left this deal"
        )

    # Do not delete participation.
    # Keep it as history.
    participation.status = ParticipationStatus.CANCELLED

    db.commit()
    db.refresh(participation)

    return participation


# CUSTOMER - MY JOINED DEALS
@router.get(
    "/participations/my-deals",
    response_model=list[DealResponse]
)
def get_my_joined_deals(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    deals = db.scalars(
        select(Deal)
        .join(
            Participation,
            Participation.deal_id == Deal.id
        )
        .where(
            Participation.customer_id == current_user.id,
            Participation.status == ParticipationStatus.JOINED
        )
        .order_by(Participation.joined_at.desc())
    ).all()

    return [
        build_deal_response(
            db,
            deal,
            customer_id=current_user.id
        )
        for deal in deals
    ]

# SELLER - VIEW PARTICIPANTS OF OWN DEAL
@router.get(
    "/deals/{deal_id}/participants",
    response_model=list[ParticipationResponse]
)
def get_deal_participants(
    deal_id: int,
    current_user: User = Depends(require_seller),
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

    # Seller can view participants
    # only for their own deal.
    if deal.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view participants of your own deals"
        )

    participations = db.scalars(
        select(Participation)
        .where(
            Participation.deal_id == deal.id,
            Participation.status == ParticipationStatus.JOINED
        )
        .order_by(Participation.joined_at.desc())
    ).all()

    return participations