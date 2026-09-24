from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import require_seller
from app.database import get_db
from app.models.deal import Deal, DealStatus
from app.models.participation import (
    Participation,
    ParticipationStatus,
)
from app.models.user import User
from app.services.deal_service import (
    get_participant_count,
    update_deal_status,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ==========================================
# 1. DEAL OUTCOME REPORT
# ==========================================
@router.get("/deal-outcomes")
def deal_outcome_report(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    deals = db.scalars(
        select(Deal)
        .where(
            Deal.seller_id == current_user.id
        )
        .order_by(Deal.created_at.desc())
    ).all()

    report = []

    for deal in deals:
        # Make sure deadline status is updated
        update_deal_status(
            db,
            deal
        )

        participant_count = get_participant_count(
            db,
            deal.id
        )

        report.append({
            "deal_id": deal.id,
            "product_name": deal.product_name,
            "minimum_buyers": deal.minimum_buyers,
            "maximum_quantity": deal.maximum_quantity,
            "participant_count": participant_count,
            "deadline": deal.deadline,
            "status": deal.status,
        })

    db.commit()

    return {
        "report": "Deal Outcome Report",
        "total_deals": len(deals),
        "deals": report,
    }


# ==========================================
# 2. PARTICIPATION / CONVERSION REPORT
# ==========================================
@router.get("/participation")
def participation_report(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    deals = db.scalars(
        select(Deal).where(
            Deal.seller_id == current_user.id
        )
    ).all()

    total_deals = len(deals)
    total_participations = 0

    successful_deals = 0
    failed_deals = 0
    active_deals = 0

    target_reached_deals = 0

    for deal in deals:
        update_deal_status(
            db,
            deal
        )

        participant_count = get_participant_count(
            db,
            deal.id
        )

        total_participations += participant_count

        if participant_count >= deal.minimum_buyers:
            target_reached_deals += 1

        if deal.status == DealStatus.SUCCESSFUL:
            successful_deals += 1

        elif deal.status == DealStatus.FAILED:
            failed_deals += 1

        else:
            active_deals += 1

    # Average participants per deal
    if total_deals > 0:
        average_participants = (
            total_participations / total_deals
        )
    else:
        average_participants = 0

    # Percentage of deals currently meeting
    # their minimum buyer target
    if total_deals > 0:
        target_reached_percentage = (
            target_reached_deals / total_deals
        ) * 100
    else:
        target_reached_percentage = 0

    db.commit()

    return {
        "report": "Participation / Conversion Report",
        "total_deals": total_deals,
        "total_participations": total_participations,
        "average_participants_per_deal": round(
            average_participants,
            2
        ),
        "target_reached_deals": target_reached_deals,
        "target_reached_percentage": round(
            target_reached_percentage,
            2
        ),
        "active_deals": active_deals,
        "successful_deals": successful_deals,
        "failed_deals": failed_deals,
    }


# ==========================================
# 3. SELLER SALES SUMMARY
# ==========================================
@router.get("/seller-sales")
def seller_sales_summary(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    deals = db.scalars(
        select(Deal).where(
            Deal.seller_id == current_user.id
        )
    ).all()

    successful_deals = 0
    successful_participants = 0

    total_sales_value = Decimal("0.00")

    deal_summary = []

    for deal in deals:
        update_deal_status(
            db,
            deal
        )

        participant_count = get_participant_count(
            db,
            deal.id
        )

        # Only completed successful deals count
        # toward committed sales value.
        if deal.status == DealStatus.SUCCESSFUL:
            successful_deals += 1
            successful_participants += participant_count

            sales_value = (
                deal.group_price
                * participant_count
            )

            total_sales_value += sales_value

            deal_summary.append({
                "deal_id": deal.id,
                "product_name": deal.product_name,
                "group_price": deal.group_price,
                "participants": participant_count,
                "sales_value": sales_value,
            })

    db.commit()

    return {
        "report": "Seller Sales Summary",
        "seller_id": current_user.id,
        "seller_name": current_user.name,
        "successful_deals": successful_deals,
        "successful_participants": successful_participants,

        # This project has no payment system,
        # so this is deal value, not verified paid revenue.
        "committed_sales_value": total_sales_value,

        "deals": deal_summary,
    }