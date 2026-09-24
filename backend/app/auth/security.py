from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole


# ==========================================
# PASSWORD HASHING
# ==========================================
password_hash = PasswordHash.recommended()


# ==========================================
# OAUTH2 / BEARER TOKEN
# ==========================================
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ==========================================
# HASH PASSWORD
# ==========================================
def hash_password(password: str) -> str:
    return password_hash.hash(password)


# ==========================================
# VERIFY PASSWORD
# ==========================================
def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password
    )


# ==========================================
# CREATE ACCESS TOKEN
# ==========================================
def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


# ==========================================
# DECODE ACCESS TOKEN
# ==========================================
def decode_access_token(token: str) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        return int(user_id)

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    except (InvalidTokenError, ValueError):
        raise credentials_exception


# ==========================================
# GET CURRENT USER
# ==========================================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

    user_id = decode_access_token(
        token
    )

    user = db.get(
        User,
        user_id
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


# ==========================================
# CUSTOMER ACCESS
# ==========================================
def require_customer(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )

    return current_user


# ==========================================
# SELLER ACCESS
# ==========================================
def require_seller(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required"
        )

    return current_user


# ==========================================
# ADMIN ACCESS
# ==========================================
def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user