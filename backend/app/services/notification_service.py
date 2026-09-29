from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.deal import Deal, DealStatus
from app.models.order import Order
from app.models.participation import (
    Participation,
    ParticipationStatus,
)

from app.utils.datetime_utils import (
    normalize_datetime,
    utc_now,
)

# CREATE NOTIFICATION

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str
) -> Notification:

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        is_read=False,
        created_at=utc_now(),
    )

    db.add(notification)

    db.flush()

    return notification


# ==========================================
# WAITING LIST NOTIFICATION
# ==========================================

def notify_waiting_customer(
    db: Session,
    participation: Participation,
    product_name: str
) -> Notification:

    return create_notification(
        db=db,
        user_id=participation.customer_id,
        title="Added to Waiting List",
        message=(
            f"The deal '{product_name}' is currently full. "
            "You have been added to the waiting list."
        ),
    )


# ==========================================
# WAITING CUSTOMER PROMOTED
# ==========================================

def notify_promoted_customer(
    db: Session,
    participation: Participation,
    product_name: str
) -> Notification:

    return create_notification(
        db=db,
        user_id=participation.customer_id,

        # Deal ID is included so the seller report
        # can count historical promotions per deal.
        title=(
            f"You Have Been Promoted! "
            f"(Deal #{participation.deal_id})"
        ),

        message=(
            f"A slot is now available for '{product_name}'. "
            "You have been moved from WAITING to JOINED."
        ),
    )


# ==========================================
# DEAL FINALIZATION NOTIFICATIONS
# ==========================================

def notify_deal_finalized(
    db: Session,
    deal: Deal
) -> list[Notification]:

    """
    Notify customers after a deal is finalized.

    SUCCESSFUL:
        Notify JOINED and EXPIRED customers.

    FAILED:
        Notify JOINED and EXPIRED customers.

    CANCELLED customers are not notified.
    """

    if deal.status not in (
        DealStatus.SUCCESSFUL,
        DealStatus.FAILED,
    ):
        return []

    participations = db.scalars(
        select(Participation).where(
            Participation.deal_id == deal.id,
            Participation.status.in_([
                ParticipationStatus.JOINED,
                ParticipationStatus.EXPIRED,
            ])
        )
    ).all()

    notifications = []

    for participation in participations:

        if participation.status == ParticipationStatus.EXPIRED:

            title = "Waiting List Expired"

            message = (
                f"The deadline for '{deal.product_name}' "
                "has ended. Your waiting-list participation "
                "has expired."
            )

        elif deal.status == DealStatus.SUCCESSFUL:

            title = "Deal Successful!"

            message = (
                f"The deal '{deal.product_name}' has "
                "successfully reached its minimum buyers."
            )

        else:

            title = "Deal Failed"

            message = (
                f"The deal '{deal.product_name}' did not "
                "reach its minimum buyers before the deadline."
            )

        notification = create_notification(
            db=db,
            user_id=participation.customer_id,
            title=title,
            message=message,
        )

        notifications.append(notification)

    return notifications


# ==========================================
# COD ORDER CREATED NOTIFICATION
# ==========================================

def notify_order_created(
    db: Session,
    order: Order,
    product_name: str
) -> Notification:

    return create_notification(
        db=db,
        user_id=order.customer_id,
        title="COD Order Confirmed",
        message=(
            f"Your order for '{product_name}' has been "
            "created successfully. Payment method: "
            "Cash on Delivery (COD)."
        ),
    )


# ==========================================
# ORDER CANCELLED NOTIFICATION
# ==========================================

def notify_order_cancelled(
    db: Session,
    order: Order,
    product_name: str
) -> Notification:

    return create_notification(
        db=db,
        user_id=order.customer_id,
        title="Order Cancelled",
        message=(
            f"Your order for '{product_name}' "
            "has been cancelled."
        ),
    )


# ==========================================
# GET USER NOTIFICATIONS
# ==========================================

def get_user_notifications(
    db: Session,
    user_id: int
) -> list[Notification]:

    return db.scalars(
        select(Notification).where(
            Notification.user_id == user_id
        ).order_by(
            Notification.created_at.desc(),
            Notification.id.desc()
        )
    ).all()


# ==========================================
# GET UNREAD NOTIFICATION COUNT
# ==========================================

def get_unread_notification_count(
    db: Session,
    user_id: int
) -> int:

    count = db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read.is_(False)
        )
    )

    return count or 0


# ==========================================
# MARK NOTIFICATION AS READ
# ==========================================

def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int
) -> Notification | None:

    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )

    if notification is None:
        return None

    if not notification.is_read:

        notification.is_read = True

        db.flush()

    return notification


# ==========================================
# BUILD NOTIFICATION RESPONSE
# ==========================================

def build_notification_response(
    notification: Notification
) -> dict:

    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": normalize_datetime(
            notification.created_at
        ),
    }