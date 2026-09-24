from datetime import datetime, timezone
from enum import Enum
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DealStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUCCESSFUL = "SUCCESSFUL"
    FAILED = "FAILED"


class Deal(Base):
    __tablename__ = "deals"

    __table_args__ = (
        CheckConstraint(
            "normal_price > 0",
            name="check_normal_price_positive"
        ),
        CheckConstraint(
            "group_price > 0",
            name="check_group_price_positive"
        ),
        CheckConstraint(
            "group_price < normal_price",
            name="check_group_price_less_than_normal"
        ),
        CheckConstraint(
            "minimum_buyers > 0",
            name="check_minimum_buyers_positive"
        ),
        CheckConstraint(
            "maximum_quantity >= minimum_buyers",
            name="check_maximum_quantity"
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    product_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    normal_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    group_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    minimum_buyers: Mapped[int] = mapped_column(
        nullable=False
    )

    maximum_quantity: Mapped[int] = mapped_column(
        nullable=False
    )

    deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    status: Mapped[DealStatus] = mapped_column(
        SQLEnum(DealStatus),
        default=DealStatus.ACTIVE,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

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

    seller = relationship(
        "User",
        back_populates="deals"
    )

    participations = relationship(
        "Participation",
        back_populates="deal"
    )