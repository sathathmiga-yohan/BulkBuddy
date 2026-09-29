
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

from app.models.participation import ParticipationStatus

# JOIN / REJOIN REQUEST

class ParticipationJoin(BaseModel):

    delivery_name: str = Field(
        min_length=2,
        max_length=100
    )

    delivery_phone: str = Field(
        min_length=7,
        max_length=30
    )

    delivery_address: str = Field(
        min_length=5,
        max_length=500
    )

    delivery_city: str = Field(
        min_length=2,
        max_length=100
    )

    delivery_postal_code: str | None = Field(
        default=None,
        max_length=20
    )

    @field_validator(
        "delivery_name",
        "delivery_phone",
        "delivery_address",
        "delivery_city"
    )
    @classmethod
    def validate_required_text(cls, value: str):

        value = value.strip()

        if not value:
            raise ValueError(
                "This field cannot be empty"
            )

        return value

    @field_validator("delivery_postal_code")
    @classmethod
    def validate_postal_code(cls, value: str | None):

        if value is None:
            return None

        return value.strip() or None

# PARTICIPATION RESPONSE

class ParticipationResponse(BaseModel):

    id: int

    deal_id: int

    customer_id: int

    status: ParticipationStatus

    delivery_name: str | None

    delivery_phone: str | None

    delivery_address: str | None

    delivery_city: str | None

    delivery_postal_code: str | None

    joined_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

# PARTICIPATION WITH WAITING POSITION

class ParticipationDetailResponse(ParticipationResponse):

    waiting_position: int | None = None
