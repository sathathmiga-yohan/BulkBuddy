
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import (
    get_current_user,
    require_customer,
    require_seller,
)

from app.database import get_db

from app.models.deal import Deal
from app.models.order import Order
from app.models.user import User

from app.schemas.order import (
    OrderResponse,
    OrderStatusUpdate,
    PaymentStatusUpdate,
)

from app.services.order_service import (
    get_order_or_404,
    validate_order_access,
    validate_order_seller,
    build_order_response,
    update_order_status,
    update_order_payment_status,
    cancel_customer_order,
)

# ORDERS ROUTER

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

# GET CUSTOMER'S OWN ORDERS

@router.get(
    "/my",
    response_model=list[OrderResponse]
)
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):

    orders = db.scalars(
        select(Order).where(
            Order.customer_id == current_user.id
        ).order_by(
            Order.created_at.desc(),
            Order.id.desc()
        )
    ).all()

    return [
        build_order_response(order)
        for order in orders
    ]

# GET SELLER'S DEAL ORDERS

@router.get(
    "/seller/my-orders",
    response_model=list[OrderResponse]
)
def get_seller_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    orders = db.scalars(
        select(Order)
        .join(
            Deal,
            Order.deal_id == Deal.id
        )
        .where(
            Deal.seller_id == current_user.id
        )
        .order_by(
            Order.created_at.desc(),
            Order.id.desc()
        )
    ).all()

    return [
        build_order_response(order)
        for order in orders
    ]

# GET ORDER BY ID
# CUSTOMER OR DEAL OWNER

@router.get(
    "/{order_id}",
    response_model=OrderResponse
)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    order = get_order_or_404(
        db,
        order_id
    )

    validate_order_access(
        order,
        current_user
    )

    return build_order_response(order)

# UPDATE ORDER STATUS
# SELLER ONLY

@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse
)
def change_order_status(
    order_id: int,
    update_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    try:

        # Lock the order to prevent concurrent
        # status/payment/cancellation changes.
        order = db.scalar(
            select(Order).where(
                Order.id == order_id
            ).with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        validate_order_seller(
            order,
            current_user.id
        )

        updated_order = update_order_status(
            db=db,
            order=order,
            new_status=update_data.status
        )

        db.commit()
        db.refresh(updated_order)

        return build_order_response(updated_order)

    except Exception:
        db.rollback()
        raise

# UPDATE COD PAYMENT STATUS
# SELLER ONLY

@router.patch(
    "/{order_id}/payment-status",
    response_model=OrderResponse
)
def change_payment_status(
    order_id: int,
    update_data: PaymentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    try:

        order = db.scalar(
            select(Order).where(
                Order.id == order_id
            ).with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        validate_order_seller(
            order,
            current_user.id
        )

        updated_order = update_order_payment_status(
            db=db,
            order=order,
            new_payment_status=update_data.payment_status
        )

        db.commit()
        db.refresh(updated_order)

        return build_order_response(updated_order)

    except Exception:
        db.rollback()
        raise

# CANCEL ORDER
# CUSTOMER ONLY

@router.patch(
    "/{order_id}/cancel",
    response_model=OrderResponse
)
def cancel_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):

    try:

        order = db.scalar(
            select(Order).where(
                Order.id == order_id
            ).with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        cancelled_order = cancel_customer_order(
            db=db,
            order=order,
            customer_id=current_user.id
        )

        db.commit()
        db.refresh(cancelled_order)

        return build_order_response(cancelled_order)

    except Exception:
        db.rollback()
        raise
