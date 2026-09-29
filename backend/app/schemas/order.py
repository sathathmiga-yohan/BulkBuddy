
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import (
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
)

# ORDER STATUS UPDATE

class OrderStatusUpdate(BaseModel):

    status: OrderStatus

# PAYMENT STATUS UPDATE

class PaymentStatusUpdate(BaseModel):

    payment_status: PaymentStatus

class OrderResponse(BaseModel):

    id: int

    deal_id: int

    customer_id: int

    quantity: int = Field(gt=0)

    total_price: Decimal

    # Delivery snapshot
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    delivery_city: str
    delivery_postal_code: str | None

    # Order and payment details
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
