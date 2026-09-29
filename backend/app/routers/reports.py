
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.security import require_seller
from app.database import get_db

from app.models.user import User

from app.schemas.report import SellerReportResponse

from app.services.report_service import (
    generate_seller_report,
)

# REPORTS ROUTER

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# GET COMPLETE SELLER 

@router.get(
    "/seller",
    response_model=SellerReportResponse
)
def get_seller_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller)
):

    report = generate_seller_report(
        db=db,
        seller=current_user
    )

    return report
