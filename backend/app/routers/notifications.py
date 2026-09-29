
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db

from app.models.user import User

from app.schemas.notification import NotificationResponse

from app.services.notification_service import (
    get_user_notifications,
    get_unread_notification_count,
    mark_notification_as_read,
    build_notification_response,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

# GET MY NOTIFICATIONS

@router.get(
    "/my",
    response_model=list[NotificationResponse]
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = get_user_notifications(
        db=db,
        user_id=current_user.id
    )

    return [
        build_notification_response(notification)
        for notification in notifications
    ]

# GET UNREAD NOTIFICATION COUNT

@router.get(
    "/unread-count"
)
def get_my_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    unread_count = get_unread_notification_count(
        db=db,
        user_id=current_user.id
    )

    return {
        "unread_count": unread_count
    }

# MARK NOTIFICATION AS READ

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        notification = mark_notification_as_read(
            db=db,
            notification_id=notification_id,
            user_id=current_user.id
        )

        if notification is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        db.commit()
        db.refresh(notification)

        return build_notification_response(
            notification
        )

    except Exception:
        db.rollback()
        raise
