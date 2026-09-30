
from datetime import datetime, timezone
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

from app.models.deal import DealStatus

# COMMON DEAL FIELDS

class DealBase(BaseModel):

    product_name: str = Field(
        min_length=2,
        max_length=200
    )

    description: str | None = None

    normal_price: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    group_price: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    minimum_buyers: int = Field(gt=0)

    maximum_quantity: int = Field(gt=0)

    deadline: datetime

    # Deadline must contain timezone information
    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, value: datetime):

        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError(
                "Deadline must include timezone information"
            )

        return value.astimezone(timezone.utc)

    # Validate price and capacity
    @model_validator(mode="after")
    def validate_deal_rules(self):

        if self.group_price >= self.normal_price:
            raise ValueError(
                "Group price must be less than normal price"
            )

        if self.maximum_quantity < self.minimum_buyers:
            raise ValueError(
                "Maximum quantity must be greater than or equal to minimum buyers"
            )

        return self

# CREATE DEAL

class DealCreate(DealBase):

    @field_validator("deadline")
    @classmethod
    def validate_future_deadline(cls, value: datetime):

        if value <= datetime.now(timezone.utc):
            raise ValueError(
                "Deadline must be in the future"
            )

        return value

# UPDATE DEAL

class DealUpdate(BaseModel):

    product_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    description: str | None = None

    normal_price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    group_price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    minimum_buyers: int | None = Field(
        default=None,
        gt=0
    )

    maximum_quantity: int | None = Field(
        default=None,
        gt=0
    )

    deadline: datetime | None = None

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, value: datetime | None):

        if value is None:
            return value

        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError(
                "Deadline must include timezone information"
            )

        value = value.astimezone(timezone.utc)

        if value <= datetime.now(timezone.utc):
            raise ValueError(
                "Deadline must be in the future"
            )

        return value

class DealResponse(DealBase):

    id: int

    seller_id: int

    status: DealStatus

    participant_count: int   

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
