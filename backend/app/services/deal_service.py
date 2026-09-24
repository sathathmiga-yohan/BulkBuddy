from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.deal import Deal, DealStatus
from app.models.participation import (
    Participation,
    ParticipationStatus,
)


# CURRENT TIME
def get_current_time() -> datetime:
    return datetime.now(timezone.utc)


# 
# NORMALIZE DATETIME
def normalize_datetime(
    value: datetime
) -> datetime:

    if value.tzinfo is None:
        return value.replace(
            tzinfo=timezone.utc
        )

    return value.astimezone(
        timezone.utc
    )


# DEADLINE CHECK
def is_deadline_passed(
    deal: Deal
) -> bool:

    deadline = normalize_datetime(
        deal.deadline
    )

    return get_current_time() >= deadline


# COUNT JOINED CUSTOMERS
def get_participant_count(
    db: Session,
    deal_id: int
) -> int:

    count = db.scalar(
        select(
            func.count(Participation.id)
        )
        .where(
            Participation.deal_id == deal_id,
            Participation.status == ParticipationStatus.JOINED
        )
    )

    return count or 0


# UPDATE DEAL STATUS

def update_deal_status(
    db: Session,
    deal: Deal
) -> DealStatus:

    if not deal.is_active:
        return deal.status

    if not is_deadline_passed(deal):

        if deal.status != DealStatus.ACTIVE:
            deal.status = DealStatus.ACTIVE
            db.flush()

        return DealStatus.ACTIVE

    # Deadline has passed.
    participant_count = get_participant_count(
        db,
        deal.id
    )

    if participant_count >= deal.minimum_buyers:
        new_status = DealStatus.SUCCESSFUL

    else:
        new_status = DealStatus.FAILED

    if deal.status != new_status:
        deal.status = new_status
        db.flush()

    return new_status

# DEAL PROGRESS

def get_deal_progress(
    db: Session,
    deal: Deal
) -> dict:

    current_participants = get_participant_count(
        db,
        deal.id
    )

    remaining_target = max(
        deal.minimum_buyers
        - current_participants,
        0
    )

    available_capacity = max(
        deal.maximum_quantity
        - current_participants,
        0
    )

    return {
        "current_participants":
            current_participants,

        "remaining_target":
            remaining_target,

        "available_capacity":
            available_capacity,
    }


# =========================
# CHECK CUSTOMER JOINED
# =========================
def customer_has_joined(
    db: Session,
    deal_id: int,
    customer_id: int
) -> bool:

    participation = db.scalar(
        select(Participation).where(
            Participation.deal_id == deal_id,
            Participation.customer_id == customer_id,
            Participation.status == ParticipationStatus.JOINED
        )
    )

    return participation is not None


# BUILD DEAL RESPONSE

def build_deal_response(
    db: Session,
    deal: Deal,
    customer_id: int | None = None
) -> dict:

    # Update ACTIVE / SUCCESSFUL / FAILED
    update_deal_status(
        db,
        deal
    )

    # Calculate current progress
    progress = get_deal_progress(
        db,
        deal
    )

    is_joined = False

    if customer_id is not None:
        is_joined = customer_has_joined(
            db,
            deal.id,
            customer_id
        )

    return {
        "id": deal.id,

        "seller_id":
            deal.seller_id,

        "product_name":
            deal.product_name,

        "description":
            deal.description,

        "normal_price":
            deal.normal_price,

        "group_price":
            deal.group_price,

        "minimum_buyers":
            deal.minimum_buyers,

        "maximum_quantity":
            deal.maximum_quantity,

        "deadline":
            deal.deadline,

        "status":
            deal.status,

        "is_active":
            deal.is_active,

        "current_participants":
            progress["current_participants"],

        "remaining_target":
            progress["remaining_target"],

        "available_capacity":
            progress["available_capacity"],

        "is_joined":
            is_joined,

        "created_at":
            deal.created_at,

        "updated_at":
            deal.updated_at,
    }