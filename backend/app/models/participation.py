
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# PARTICIPATION STATUS

class ParticipationStatus(str, Enum):
    JOINED = "JOINED"
    WAITING = "WAITING"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

# PARTICIPATION MODEL

class Participation(Base):

    __tablename__ = "participations"

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

    status: Mapped[ParticipationStatus] = mapped_column(
        SQLEnum(ParticipationStatus),
        nullable=False,
        default=ParticipationStatus.JOINED
    )

    # DELIVERY DETAILS

    delivery_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    delivery_phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    delivery_address: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    delivery_city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    delivery_postal_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    # TIMESTAMPS

    joined_at: Mapped[datetime] = mapped_column(
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
            name="uq_participation_deal_customer"
        ),
    )

    # RELATIONSHIPS

    deal = relationship(
        "Deal",
        back_populates="participations"
    )

    customer = relationship(
        "User",
        back_populates="participations"
    )
