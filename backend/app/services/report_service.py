from decimal import Decimal

import pandas as pd

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.deal import Deal, DealStatus

from app.models.participation import (
    Participation,
    ParticipationStatus,
)

from app.models.order import (
    Order,
    OrderStatus,
    PaymentStatus,
)

from app.models.notification import Notification
from app.models.user import User


# ==========================================
# DECIMAL HELPER
# ==========================================

def to_decimal(value) -> Decimal:

    if value is None:
        return Decimal("0.00")

    return Decimal(str(value)).quantize(
        Decimal("0.01")
    )


# ==========================================
# DEAL PERFORMANCE
# ==========================================

def get_deal_performance(
    db: Session,
    seller_id: int
) -> dict:

    deals = db.scalars(
        select(Deal).where(
            Deal.seller_id == seller_id
        )
    ).all()

    if not deals:
        return {
            "total_deals": 0,
            "active_deals": 0,
            "successful_deals": 0,
            "failed_deals": 0,
        }

    df = pd.DataFrame([
        {
            "id": deal.id,
            "status": deal.status.value,
        }
        for deal in deals
    ])

    status_counts = df["status"].value_counts()

    return {
        "total_deals": len(df),

        "active_deals": int(
            status_counts.get(
                DealStatus.ACTIVE.value,
                0
            )
        ),

        "successful_deals": int(
            status_counts.get(
                DealStatus.SUCCESSFUL.value,
                0
            )
        ),

        "failed_deals": int(
            status_counts.get(
                DealStatus.FAILED.value,
                0
            )
        ),
    }


# ==========================================
# PARTICIPATION STATISTICS
# ==========================================

def get_participation_statistics(
    db: Session,
    seller_id: int
) -> dict:

    participations = db.scalars(
        select(Participation)
        .join(
            Deal,
            Participation.deal_id == Deal.id
        )
        .where(
            Deal.seller_id == seller_id
        )
    ).all()

    if participations:

        df = pd.DataFrame([
            {
                "id": participation.id,
                "status": participation.status.value,
            }
            for participation in participations
        ])

        status_counts = df["status"].value_counts()

        total_participations = len(df)

        joined_count = int(
            status_counts.get(
                ParticipationStatus.JOINED.value,
                0
            )
        )

        waiting_count = int(
            status_counts.get(
                ParticipationStatus.WAITING.value,
                0
            )
        )

        cancelled_count = int(
            status_counts.get(
                ParticipationStatus.CANCELLED.value,
                0
            )
        )

        expired_count = int(
            status_counts.get(
                ParticipationStatus.EXPIRED.value,
                0
            )
        )

    else:

        total_participations = 0
        joined_count = 0
        waiting_count = 0
        cancelled_count = 0
        expired_count = 0

    # ==========================================
    # HISTORICAL PROMOTION COUNT
    # ==========================================

    # Get only this seller's Deal IDs.
    seller_deal_ids = db.scalars(
        select(Deal.id).where(
            Deal.seller_id == seller_id
        )
    ).all()

    promoted_count = 0

    for deal_id in seller_deal_ids:

        # The notification title includes the
        # exact Deal ID:
        #
        # You Have Been Promoted! (Deal #5)
        #
        # This prevents promotions from unrelated
        # deals being counted for this seller.

        promotion_title = (
            f"You Have Been Promoted! "
            f"(Deal #{deal_id})"
        )

        deal_promotion_count = db.scalar(
            select(func.count(Notification.id)).where(
                Notification.title == promotion_title
            )
        ) or 0

        promoted_count += deal_promotion_count

    return {
        "total_participations": total_participations,
        "joined_participations": joined_count,
        "waiting_participations": waiting_count,
        "cancelled_participations": cancelled_count,
        "expired_participations": expired_count,
        "promoted_participations": promoted_count,
    }


# ==========================================
# COD SALES SUMMARY
# ==========================================

def get_sales_summary(
    db: Session,
    seller_id: int
) -> dict:

    orders = db.scalars(
        select(Order)
        .join(
            Deal,
            Order.deal_id == Deal.id
        )
        .where(
            Deal.seller_id == seller_id
        )
    ).all()

    empty_summary = {
        "total_orders": 0,
        "confirmed_orders": 0,
        "processing_orders": 0,
        "completed_orders": 0,
        "cancelled_orders": 0,
        "total_sales_value": Decimal("0.00"),
        "paid_amount": Decimal("0.00"),
        "pending_amount": Decimal("0.00"),
    }

    if not orders:
        return empty_summary

    df = pd.DataFrame([
        {
            "id": order.id,
            "status": order.status.value,
            "payment_status": order.payment_status.value,
            "total_price": to_decimal(
                order.total_price
            ),
        }
        for order in orders
    ])

    status_counts = df["status"].value_counts()

    # Cancelled orders do not contribute
    # to active sales value.
    active_orders = df[
        df["status"] != OrderStatus.CANCELLED.value
    ]

    paid_orders = active_orders[
        active_orders["payment_status"]
        == PaymentStatus.PAID.value
    ]

    pending_orders = active_orders[
        active_orders["payment_status"]
        == PaymentStatus.PENDING.value
    ]

    total_sales_value = sum(
        active_orders["total_price"],
        Decimal("0.00")
    )

    paid_amount = sum(
        paid_orders["total_price"],
        Decimal("0.00")
    )

    pending_amount = sum(
        pending_orders["total_price"],
        Decimal("0.00")
    )

    return {
        "total_orders": len(df),

        "confirmed_orders": int(
            status_counts.get(
                OrderStatus.CONFIRMED.value,
                0
            )
        ),

        "processing_orders": int(
            status_counts.get(
                OrderStatus.PROCESSING.value,
                0
            )
        ),

        "completed_orders": int(
            status_counts.get(
                OrderStatus.COMPLETED.value,
                0
            )
        ),

        "cancelled_orders": int(
            status_counts.get(
                OrderStatus.CANCELLED.value,
                0
            )
        ),

        "total_sales_value": to_decimal(
            total_sales_value
        ),

        "paid_amount": to_decimal(
            paid_amount
        ),

        "pending_amount": to_decimal(
            pending_amount
        ),
    }


# ==========================================
# COMPLETE SELLER REPORT
# ==========================================

def generate_seller_report(
    db: Session,
    seller: User
) -> dict:

    return {
        "deal_performance": get_deal_performance(
            db=db,
            seller_id=seller.id
        ),

        "participation_statistics": get_participation_statistics(
            db=db,
            seller_id=seller.id
        ),

        "sales_summary": get_sales_summary(
            db=db,
            seller_id=seller.id
        ),
    }