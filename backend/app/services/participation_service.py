
from fastapi import HTTPException, status

from sqlalchemy import func, or_, and_, select
from sqlalchemy.orm import Session

from app.models.deal import Deal

from app.models.participation import (
    Participation,
    ParticipationStatus,
)

from app.models.user import User

from app.schemas.participation import ParticipationJoin

from app.services.deal_service import (
    get_participant_count,
    validate_deal_is_open,
)

from app.services.notification_service import (
    notify_waiting_customer,
    notify_promoted_customer,
)

from app.utils.datetime_utils import (
    normalize_datetime,
    utc_now,
)

# GET CUSTOMER PARTICIPATION

def get_customer_participation(
    db: Session,
    deal_id: int,
    customer_id: int
) -> Participation | None:

    return db.scalar(
        select(Participation).where(
            Participation.deal_id == deal_id,
            Participation.customer_id == customer_id
        )
    )

# GET WAITING POSITION

def get_waiting_position(
    db: Session,
    participation: Participation
) -> int | None:

    if participation.status != ParticipationStatus.WAITING:
        return None

    # MySQL stores our UTC DATETIME values without
    # timezone information.
    joined_at = normalize_datetime(
        participation.joined_at
    ).replace(tzinfo=None)

    earlier_count = db.scalar(
        select(func.count(Participation.id)).where(
            Participation.deal_id == participation.deal_id,
            Participation.status == ParticipationStatus.WAITING,
            or_(
                Participation.joined_at < joined_at,
                and_(
                    Participation.joined_at == joined_at,
                    Participation.id < participation.id
                )
            )
        )
    )

    return (earlier_count or 0) + 1

# BUILD PARTICIPATION RESPONSE

def build_participation_response(
    db: Session,
    participation: Participation
) -> dict:


    return {
        "id": participation.id,
        "deal_id": participation.deal_id,
        "customer_id": participation.customer_id,
        "status": participation.status,

        "delivery_name": participation.delivery_name,
        "delivery_phone": participation.delivery_phone,
        "delivery_address": participation.delivery_address,
        "delivery_city": participation.delivery_city,
        "delivery_postal_code": participation.delivery_postal_code,

        "joined_at": normalize_datetime(
            participation.joined_at
        ),
        "updated_at": normalize_datetime(
            participation.updated_at
        ),

        "waiting_position": get_waiting_position(
            db,
            participation
        ),
    }
  
    }

# CLEAR DELIVERY DETAILS


def clear_delivery_details(
    participation: Participation
) -> None:

    participation.delivery_name = None
    participation.delivery_phone = None
    participation.delivery_address = None
    participation.delivery_city = None
    participation.delivery_postal_code = None
  

# GET FIRST WAITING CUSTOMER - FIFO

def get_first_waiting_customer(
    db: Session,
    deal_id: int
) -> Participation | None:

    return db.scalar(
        select(Participation).where(
            Participation.deal_id == deal_id,
            Participation.status == ParticipationStatus.WAITING
        ).order_by(
            Participation.joined_at.asc(),
            Participation.id.asc()
        ).limit(1)
    )

# JOIN / REJOIN DEAL

def join_deal(
    db: Session,
    deal_id: int,
    customer: User,
    join_data: ParticipationJoin
) -> Participation:

    try:

        deal = db.scalar(
            select(Deal).where(
                Deal.id == deal_id
            ).with_for_update()
        )

        if deal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deal not found"
            )

        validate_deal_is_open(deal)

        # A seller cannot join their own deal.
        if deal.seller_id == customer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot join your own deal"
            )

        existing = get_customer_participation(
            db=db,
            deal_id=deal_id,
            customer_id=customer.id
        )

        if existing is not None:

            if existing.status in (
                ParticipationStatus.JOINED,
                ParticipationStatus.WAITING
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You have already joined this deal"
                )

            if existing.status == ParticipationStatus.EXPIRED:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Expired participation cannot be rejoined"
                )

        # CHECK CAPACITY AND WAITING QUEUE

        joined_count = get_participant_count(
            db,
            deal_id
        )

        first_waiting = get_first_waiting_customer(
            db,
            deal_id
        )

        # A new customer must not bypass customers
        # who are already waiting.
        if (
            joined_count < deal.maximum_quantity
            and first_waiting is None
        ):
            new_status = ParticipationStatus.JOINED

        else:
            new_status = ParticipationStatus.WAITING

        now = utc_now()

        # CREATE OR REUSE PARTICIPATION

        if existing is None:

            participation = Participation(
                deal_id=deal_id,
                customer_id=customer.id,
                status=new_status,
                joined_at=now,
                updated_at=now
            )

            db.add(participation)

        else:

            # Rejoin updates the existing row.
            # The customer receives a fresh queue time.
            participation = existing
            participation.status = new_status
            participation.joined_at = now
            participation.updated_at = now

        # SAVE FRESH DELIVERY DETAILS

                participation.delivery_name = (
            join_data.delivery_name
        )

        participation.delivery_phone = (
            join_data.delivery_phone
        )

        participation.delivery_address = (
            join_data.delivery_address
        )

        participation.delivery_city = (
            join_data.delivery_city
        )

        participation.delivery_postal_code = (
            join_data.delivery_postal_code
        )

        db.flush()

        # WAITING NOTIFICATION

        if new_status == ParticipationStatus.WAITING:

            notify_waiting_customer(
                db=db,
                participation=participation,
                product_name=deal.product_name
            )

        # Participation and notification are
        # committed together.
        db.commit()
        db.refresh(participation)

        return participation

    except Exception:
        db.rollback()
        raise

# LEAVE DEAL + FIFO PROMOTION

def leave_deal(
    db: Session,
    deal_id: int,
    customer: User
) -> Participation:

    try:

        # Use the same Deal lock as JOIN.
        deal = db.scalar(
            select(Deal).where(
                Deal.id == deal_id
            ).with_for_update()
        )

        if deal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deal not found"
            )

        validate_deal_is_open(deal)

        participation = get_customer_participation(
            db=db,
            deal_id=deal_id,
            customer_id=customer.id
        )

        if participation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You have not joined this deal"
            )

        if participation.status not in (
            ParticipationStatus.JOINED,
            ParticipationStatus.WAITING
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You do not have an active participation"
            )

        was_joined = (
            participation.status == ParticipationStatus.JOINED
        )

        # CANCEL CURRENT PARTICIPATION

        participation.status = ParticipationStatus.CANCELLED
        participation.updated_at = utc_now()

        clear_delivery_details(participation)

        db.flush()

        # PROMOTE FIRST WAITING CUSTOMER

        if was_joined:

            first_waiting = get_first_waiting_customer(
                db=db,
                deal_id=deal_id
            )

            if first_waiting is not None:

                first_waiting.status = ParticipationStatus.JOINED
                first_waiting.updated_at = utc_now()

                db.flush()

                # PROMOTION NOTIFICATIOn

                notify_promoted_customer(
                    db=db,
                    participation=first_waiting,
                    product_name=deal.product_name
                )

        db.commit()
        db.refresh(participation)

        return participation

    except Exception:
        db.rollback()
        raise
