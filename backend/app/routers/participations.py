
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import require_customer
from app.database import get_db

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

# PARTICIPATION ROUTER

router = APIRouter(
    prefix="/participations",
    tags=["Participations"]
)

# GET MY PARTICIPATIONS

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

# GET MY PARTICIPATION FOR A DEAL

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

# JOIN / REJOIN DEAL

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

# LEAVE DEAL

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
