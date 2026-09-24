from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ParticipationStatus(str, Enum):
    JOINED = "JOINED"
    CANCELLED = "CANCELLED"


class Participation(Base):
    __tablename__ = "participations"

    __table_args__ = (
        UniqueConstraint(
            "deal_id",
            "customer_id",
            name="uq_deal_customer"
        ),
    )

    id: Mapped[int] = mapped_column(
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
        default=ParticipationStatus.JOINED,
        nullable=False
    )

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

    deal = relationship(
        "Deal",
        back_populates="participations"
    )

    customer = relationship(
        "User",
        back_populates="participations"
    )