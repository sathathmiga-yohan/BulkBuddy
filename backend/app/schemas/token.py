
from pydantic import BaseModel

# TOKEN RESPONSE SCHEMA

class TokenResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"
