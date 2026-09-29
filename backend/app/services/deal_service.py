
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.deal import Deal, DealStatus
from app.models.participation import (
    Participation,
    ParticipationStatus,
)
from app.schemas.deal import DealUpdate
from app.utils.datetime_utils import (
    is_deadline_passed,
    normalize_datetime,
)

# GET JOINED PARTICIPANT COUNT

def get_participant_count(
    db: Session,
    deal_id: int
) -> int:

    count = db.scalar(
        select(func.count(Participation.id)).where(
            Participation.deal_id == deal_id,
            Participation.status == ParticipationStatus.JOINED
        )
    )

    return count or 0

# GET WAITING CUSTOMER COUNT

def get_waiting_count(
    db: Session,
    deal_id: int
) -> int:

    count = db.scalar(
        select(func.count(Participation.id)).where(
            Participation.deal_id == deal_id,
            Participation.status == ParticipationStatus.WAITING
        )
    )

    return count or 0

# GET DEAL BY ID

def get_deal_or_404(
    db: Session,
    deal_id: int
) -> Deal:

    deal = db.get(Deal, deal_id)

    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found"
        )

    return deal

# CHECK SELLER OWNERSHIP

def validate_seller_ownership(
    deal: Deal,
    seller_id: int
) -> None:

    if deal.seller_id != seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage your own deals"
        )

# CHECK DEAL IS ACTIVE AND OPEN

def validate_deal_is_open(
    deal: Deal
) -> None:

    if deal.status != DealStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Deal is no longer active"
        )

    if is_deadline_passed(deal.deadline):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Deal deadline has passed"
        )

# VALIDATE DEAL PRICE AND CAPACITY

def validate_deal_values(
    normal_price: Decimal,
    group_price: Decimal,
    minimum_buyers: int,
    maximum_quantity: int,
    deadline: datetime
) -> None:

    if normal_price <= 0 or group_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Prices must be greater than zero"
        )

    if group_price >= normal_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Group price must be less than normal price"
        )

    if minimum_buyers <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Minimum buyers must be greater than zero"
        )

    if maximum_quantity < minimum_buyers:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Maximum quantity must be greater than or equal to minimum buyers"
        )

    if is_deadline_passed(deadline):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Deadline must be in the future"
        )

# VALIDATE DEAL UPDATE

def validate_deal_update(
    db: Session,
    deal: Deal,
    update_data: DealUpdate
) -> dict:

    validate_deal_is_open(deal)

    changes = update_data.model_dump(
        exclude_unset=True
    )

    if not changes:
        return {}

    # These fields cannot be explicitly set to null.
    required_fields = {
        "product_name",
        "normal_price",
        "group_price",
        "minimum_buyers",
        "maximum_quantity",
        "deadline",
    }

    for field in required_fields:
        if field in changes and changes[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null"
            )

    # Once participation history exists, preserve
    # the deal's important terms.
    restricted_fields = {
        "normal_price",
        "group_price",
        "minimum_buyers",
        "maximum_quantity",
        "deadline",
    }

    participation_exists = db.scalar(
        select(Participation.id).where(
            Participation.deal_id == deal.id
        ).limit(1)
    )

    if participation_exists is not None:
        for field in restricted_fields:
            if (
                field in changes
                and changes[field] != getattr(deal, field)
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Price, capacity and deadline cannot "
                        "be changed after participation exists"
                    )
                )

    # Validate the final combined values, not just
    # individual fields in a partial PATCH request.
    normal_price = changes.get(
        "normal_price",
        deal.normal_price
    )

    group_price = changes.get(
        "group_price",
        deal.group_price
    )

    minimum_buyers = changes.get(
        "minimum_buyers",
        deal.minimum_buyers
    )

    maximum_quantity = changes.get(
        "maximum_quantity",
        deal.maximum_quantity
    )

    deadline = changes.get(
        "deadline",
        deal.deadline
    )

    validate_deal_values(
        normal_price=normal_price,
        group_price=group_price,
        minimum_buyers=minimum_buyers,
        maximum_quantity=maximum_quantity,
        deadline=deadline
    )

    return changes

# VALIDATE DEAL DELETION

def validate_deal_deletion(
    db: Session,
    deal: Deal
) -> None:

    validate_deal_is_open(deal)

    participation_exists = db.scalar(
        select(Participation.id).where(
            Participation.deal_id == deal.id
        ).limit(1)
    )

    if participation_exists is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a deal with participation history"
        )

# BUILD DEAL RESPONSE

def build_deal_response(
    db: Session,
    deal: Deal
) -> dict:

    return {
        "id": deal.id,
        "seller_id": deal.seller_id,
        "product_name": deal.product_name,
        "description": deal.description,
        "normal_price": deal.normal_price,
        "group_price": deal.group_price,
        "minimum_buyers": deal.minimum_buyers,
        "maximum_quantity": deal.maximum_quantity,
        "deadline": normalize_datetime(deal.deadline),
        "status": deal.status,
        "created_at": normalize_datetime(deal.created_at),
        "updated_at": normalize_datetime(deal.updated_at),
    }
