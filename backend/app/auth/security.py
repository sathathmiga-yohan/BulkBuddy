# security.py எழுதினது user password-ஐ பாதுகாப்பாக handle பண்ண, login ஆன user-ஐ JWT மூலம் identify பண்ண, CUSTOMER/SELLER/ADMIN permission control பண்ண.
from datetime import datetime, timedelta, timezone

import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from jwt.exceptions import InvalidTokenError

from pwdlib import PasswordHash

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole

# PASSWORD HASHING
# Register பண்ணும்போது → password-ஐ hash பண்ணும்.
# Login பண்ணும்போது → user கொடுத்த password correct-ஆ என்று verify பண்ணும்.
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


# plain password User இப்ப login form-ல் type பண்ணிய password
# hashed password Database-ல் ஏற்கனவே save ஆகி இருக்கும் hash

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return password_hash.verify(
        plain_password, 
        hashed_password
    )

# OAUTH2 SCHEME
# protected API request வரும்போது Authorization header-ல இருக்கிற Bearer token-ஐ எடுத்துத் தருவது.
oauth2_scheme = OAuth2PasswordBearer(
# User token பெற வேண்டுமென்றால் நம்ம authentication login endpoint /auth/login
    tokenUrl="/auth/login"
)

# CREATE ACCESS TOKEN
# Login ஆன user-ன் ID மற்றும் token expiry time-ஐ payload-ல் வைத்து, secret key + algorithm பயன்படுத்தி signed JWT access token உருவாக்கி return செய்கிறது.

# Login ஆன user யார் என்பதை அடுத்த protected API requests-ல் கண்டுபிடிக்க temporary JWT token உருவாக்குகிறது.
def create_access_token(user_id: int) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    encoded_token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_token

# GET CURRENT USER
# get_current_user() = “இந்த token அனுப்பிய logged-in user யார்?” என்று கண்டுபிடிக்கும் function.
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_exception

    user = db.scalar(
        select(User).where(
            User.id == user_id
        )
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    return user

# REQUIRE CUSTOMER

def require_customer(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )

    return current_user

# REQUIRE SELLER

def require_seller(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required"
        )

    return current_user

def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user
