
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# ORDER STATUS

class OrderStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# PAYMENT STATUS

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"


# PAYMENT METHOD

class PaymentMethod(str, Enum):
    COD = "COD"

# ORDER MODEL

class Order(Base):

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    deal_id: Mapped[int] = mapped_column(
        ForeignKey("deals.id"),
        nullable=False,
        index=True
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ORDER DETAILS

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    total_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    # DELIVERY SNAPSHOT

    delivery_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    delivery_phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    delivery_address: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    delivery_city: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    delivery_postal_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    # ORDER AND PAYMENT STATUS

    status: Mapped[OrderStatus] = mapped_column(
        SQLEnum(OrderStatus),
        default=OrderStatus.CONFIRMED,
        nullable=False
    )

    payment_status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        SQLEnum(PaymentMethod),
        default=PaymentMethod.COD,
        nullable=False
    )

    # TIMESTAMPS

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # DATABASE CONSTRAINTS

    __table_args__ = (
        UniqueConstraint(
            "deal_id",
            "customer_id",
            name="uq_order_deal_customer"
        ),
        CheckConstraint(
            "quantity > 0",
            name="check_order_quantity_positive"
        ),
        CheckConstraint(
            "total_price > 0",
            name="check_order_total_price_positive"
        ),
    )

    # RELATIONSHIPS

    deal = relationship(
        "Deal",
        back_populates="orders"
    )

    customer = relationship(
        "User",
        back_populates="orders"
    )
