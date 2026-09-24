from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.models.deal import DealStatus


class DealCreate(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    description: str | None = None

    normal_price: Decimal = Field(gt=0)
    group_price: Decimal = Field(gt=0)

    minimum_buyers: int = Field(gt=0)
    maximum_quantity: int = Field(gt=0)

    deadline: datetime

    @model_validator(mode="after")
    def validate_deal(self):
        if self.group_price >= self.normal_price:
            raise ValueError(
                "Group price must be less than normal price"
            )

        if self.maximum_quantity < self.minimum_buyers:
            raise ValueError(
                "Maximum quantity must be greater than or equal to minimum buyers"
            )

        return self


class DealUpdate(BaseModel):
    product_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200
    )

    description: str | None = None

    normal_price: Decimal | None = Field(
        default=None,
        gt=0
    )

    group_price: Decimal | None = Field(
        default=None,
        gt=0
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


class DealResponse(BaseModel):
    id: int
    seller_id: int

    product_name: str
    description: str | None

    normal_price: Decimal
    group_price: Decimal

    minimum_buyers: int
    maximum_quantity: int

    deadline: datetime
    status: DealStatus
    is_active: bool

    current_participants: int = 0
    remaining_target: int = 0
    available_capacity: int = 0
    is_joined: bool = False

    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }