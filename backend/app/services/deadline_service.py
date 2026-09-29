
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.deal import (
    Deal,
    DealStatus,
)

from app.models.participation import (
    Participation,
    ParticipationStatus,
)

from app.services.order_service import (
    generate_orders_for_deal,
)

from app.services.participation_service import (
    clear_delivery_details,
)

from app.services.notification_service import (
    notify_deal_finalized,
    notify_order_created,
)

from app.utils.datetime_utils import (
    normalize_datetime,
    utc_now,
)

# FINALIZE ONE DEAL

def finalize_deal(
    db: Session,
    deal_id: int
) -> Deal | None:

    """
    Finalize an expired ACTIVE deal.

    Deal finalization, waiting-list expiry,
    COD orders and notifications are saved
    in one database transaction.
    """

    try:

        # Use the same Deal row lock as JOIN/LEAVE.
        deal = db.scalar(
            select(Deal).where(
                Deal.id == deal_id
            ).with_for_update()
        )

        if deal is None:
            db.rollback()
            return None

        # Prevent duplicate finalization.
        if deal.status != DealStatus.ACTIVE:
            db.rollback()
            return None

        now = utc_now()

        # Do not finalize before the deadline.
        if now < normalize_datetime(deal.deadline):
            db.rollback()
            return None

        # COUNT JOINED CUSTOMERS

        joined_count = db.scalar(
            select(func.count(Participation.id)).where(
                Participation.deal_id == deal.id,
                Participation.status == ParticipationStatus.JOINED
            )
        ) or 0

        # DECIDE DEAL OUTCOME

        if joined_count >= deal.minimum_buyers:
            deal.status = DealStatus.SUCCESSFUL
        else:
            deal.status = DealStatus.FAILED

        # EXPIRE WAITING CUSTOMERS

        waiting_participations = db.scalars(
            select(Participation).where(
                Participation.deal_id == deal.id,
                Participation.status == ParticipationStatus.WAITING
            )
        ).all()

        for participation in waiting_participations:

            participation.status = ParticipationStatus.EXPIRED
            participation.updated_at = now

            clear_delivery_details(participation)

        db.flush()

        # NOTIFY DEAL OUTCOME / WAITING EXPIRY

        notify_deal_finalized(
            db=db,
            deal=deal
        )

        # GENERATE ORDERS FOR SUCCESSFUL DEAL

        if deal.status == DealStatus.SUCCESSFUL:

            created_orders = generate_orders_for_deal(
                db=db,
                deal=deal
            )

            # Notify customers whose new COD orders
            # were successfully generated.
            for order in created_orders:

                notify_order_created(
                    db=db,
                    order=order,
                    product_name=deal.product_name
                )

        # FAILED deals never generate orders.

        # UPDATE DEAL TIMESTAMP

        deal.updated_at = now

        # SINGLE TRANSACTION COMMIT

        db.commit()
        db.refresh(deal)

        return deal

    except Exception:

        db.rollback()
        raise

# PROCESS ALL EXPIRED ACTIVE DEALS

def process_expired_deals() -> dict:

    """
    Called periodically by the scheduler.

    Also processes overdue deals after
    the backend restarts.
    """

    db = SessionLocal()

    processed = 0
    successful = 0
    failed = 0
    errors = []

    try:

        # MySQL DATETIME values in this project
        # are stored as naive UTC.
        database_now = utc_now().replace(
            tzinfo=None
        )

        expired_deal_ids = db.scalars(
            select(Deal.id).where(
                Deal.status == DealStatus.ACTIVE,
                Deal.deadline <= database_now
            ).order_by(
                Deal.deadline.asc(),
                Deal.id.asc()
            )
        ).all()

        # Finish the discovery transaction.
        db.rollback()

        for deal_id in expired_deal_ids:

            try:

                deal = finalize_deal(
                    db=db,
                    deal_id=deal_id
                )

                if deal is None:
                    continue

                processed += 1

                if deal.status == DealStatus.SUCCESSFUL:
                    successful += 1

                elif deal.status == DealStatus.FAILED:
                    failed += 1

                db.rollback()

            except Exception as exc:

                db.rollback()

                errors.append({
                    "deal_id": deal_id,
                    "error": str(exc)
                })

        return {
            "processed": processed,
            "successful": successful,
            "failed": failed,
            "errors": errors,
        }

    finally:

        db.close()
