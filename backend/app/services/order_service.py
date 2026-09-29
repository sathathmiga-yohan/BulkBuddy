
from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.deal import Deal

from app.models.order import (
    Order,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
)

from app.models.participation import (
    Participation,
    ParticipationStatus,
)

from app.models.user import User

from app.services.notification_service import (
    notify_order_cancelled,
)

from app.utils.datetime_utils import (
    normalize_datetime,
    utc_now,
)

# GET ORDER BY ID

def get_order_or_404(
    db: Session,
    order_id: int
) -> Order:

    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return order

# VALIDATE ORDER ACCESS

def validate_order_access(
    order: Order,
    current_user: User
) -> None:

    is_customer = (
        order.customer_id == current_user.id
    )

    is_seller = (
        order.deal.seller_id == current_user.id
    )

    if not is_customer and not is_seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order"
        )

# VALIDATE SELLER OWNERSHIP

def validate_order_seller(
    order: Order,
    seller_id: int
) -> None:

    if order.deal.seller_id != seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage orders for your own deals"
        )

# BUILD ORDER RESPONSE

def build_order_response(
    order: Order
) -> dict:

    return {
        "id": order.id,
        "deal_id": order.deal_id,
        "customer_id": order.customer_id,
        "quantity": order.quantity,
        "total_price": order.total_price,

        "delivery_name": order.delivery_name,
        "delivery_phone": order.delivery_phone,
        "delivery_address": order.delivery_address,
        "delivery_city": order.delivery_city,
        "delivery_postal_code": order.delivery_postal_code,

        "status": order.status,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,

        "created_at": normalize_datetime(
            order.created_at
        ),
        "updated_at": normalize_datetime(
            order.updated_at
        ),
    }

# GENERATE ORDERS FOR SUCCESSFUL DEAL

def generate_orders_for_deal(
    db: Session,
    deal: Deal
) -> list[Order]:

    """
    Generate one COD order per JOINED customer.

    Called by deadline_service.

    Does not commit. The deadline service controls
    the complete finalization transaction.
    """

    participations = db.scalars(
        select(Participation).where(
            Participation.deal_id == deal.id,
            Participation.status == ParticipationStatus.JOINED
        ).order_by(
            Participation.id.asc()
        )
    ).all()

    created_orders = []

    for participation in participations:

        # PREVENT DUPLICATE ORDERS

        existing_order = db.scalar(
            select(Order).where(
                Order.deal_id == deal.id,
                Order.customer_id == participation.customer_id
            )
        )

        if existing_order is not None:
            continue

        # VALIDATE DELIVERY DETAILS

        if not all([
            participation.delivery_name,
            participation.phone,
            participation.address,
            participation.city,
        ]):
            raise ValueError(
                "Missing delivery details for "
                f"participation {participation.id}"
            )

        # CREATE COD ORDER
    
        new_order = Order(
            deal_id=deal.id,
            customer_id=participation.customer_id,

            quantity=1,
            total_price=deal.group_price,

            # Copy delivery details from Participation.
            delivery_name=participation.delivery_name,
            delivery_phone=participation.phone,
            delivery_address=participation.address,
            delivery_city=participation.city,
            delivery_postal_code=participation.postal_code,

            status=OrderStatus.CONFIRMED,
            payment_status=PaymentStatus.PENDING,
            payment_method=PaymentMethod.COD,

            created_at=utc_now(),
            updated_at=utc_now(),
        )

        db.add(new_order)

        created_orders.append(new_order)

    # Send INSERT statements to the database.
    # The deadline service performs the final commit.
    db.flush()

    return created_orders

# UPDATE ORDER STATUS - SELLER

def update_order_status(
    db: Session,
    order: Order,
    new_status: OrderStatus
) -> Order:

    allowed_transitions = {
        OrderStatus.CONFIRMED: {
            OrderStatus.PROCESSING,
        },

        OrderStatus.PROCESSING: {
            OrderStatus.COMPLETED,
        },

        OrderStatus.COMPLETED: set(),

        OrderStatus.CANCELLED: set(),
    }

    # Repeating the current status changes nothing.
    if order.status == new_status:
        return order

    allowed = allowed_transitions.get(
        order.status,
        set()
    )

    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Cannot change order status from "
                f"{order.status.value} to {new_status.value}"
            )
        )

    order.status = new_status
    order.updated_at = utc_now()

    db.flush()

    return order

# UPDATE COD PAYMENT STATUS - SELLER

def update_order_payment_status(
    db: Session,
    order: Order,
    new_payment_status: PaymentStatus
) -> Order:

    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update payment for a cancelled order"
        )

    if order.payment_status == new_payment_status:
        return order

    # COD payment can only move:
    # PENDING -> PAID

    if (
        order.payment_status != PaymentStatus.PENDING
        or new_payment_status != PaymentStatus.PAID
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invalid payment status transition"
        )

    order.payment_status = PaymentStatus.PAID
    order.updated_at = utc_now()

    db.flush()

    return order

# CANCEL ORDER - CUSTOMER

def cancel_customer_order(
    db: Session,
    order: Order,
    customer_id: int
) -> Order:

    # CHECK OWNERSHIP

    if order.customer_id != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own orders"
        )

    # IDEMPOTENT CANCELLATION
    if order.status == OrderStatus.CANCELLED:
        return order

    # VALIDATE CANCELLATION RULES

    if order.status != OrderStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only confirmed orders can be cancelled"
        )

    if order.payment_status != PaymentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Paid orders cannot be cancelled"
        )
    # CANCEL ORDER

    order.status = OrderStatus.CANCELLED
    order.updated_at = utc_now()

    db.flush()

    # CREATE CANCELLATION NOTIFICATION

    notify_order_cancelled(
        db=db,
        order=order,
        product_name=order.deal.product_name
    )
    
    return order
