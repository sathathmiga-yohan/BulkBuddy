
from decimal import Decimal

from pydantic import BaseModel, Field

# DEAL PERFORMANCE

class DealPerformanceResponse(BaseModel):

    total_deals: int = 0

    active_deals: int = 0

    successful_deals: int = 0

    failed_deals: int = 0

# PARTICIPATION STATISTICS

class ParticipationStatisticsResponse(BaseModel):

    total_participations: int = 0

    joined_count: int = 0

    waiting_count: int = 0

    cancelled_count: int = 0

    expired_count: int = 0

    promoted_count: int = 0

# COD SALES SUMMARY

class SalesSummaryResponse(BaseModel):

    total_orders: int = 0

    confirmed_orders: int = 0

    processing_orders: int = 0

    completed_orders: int = 0

    cancelled_orders: int = 0

    total_sales_value: Decimal = Field(
        default=Decimal("0.00")
    )

    paid_amount: Decimal = Field(
        default=Decimal("0.00")
    )

    pending_amount: Decimal = Field(
        default=Decimal("0.00")
    )

# COMPLETE SELLER REPORT

class SellerReportResponse(BaseModel):

    deal_performance: DealPerformanceResponse

    participation_statistics: ParticipationStatisticsResponse

    sales_summary: SalesSummaryResponse
