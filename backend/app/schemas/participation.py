from datetime import datetime

from pydantic import BaseModel

from app.models.participation import ParticipationStatus


class ParticipationResponse(BaseModel):
    id: int
    deal_id: int
    customer_id: int
    status: ParticipationStatus
    joined_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }