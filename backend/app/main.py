from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    deals,
    participations,
    orders,
    csv_import,
    reports,
    notifications,
)

from app.services.deadline_service import (
    process_expired_deals,
)

# Register all SQLAlchemy models
from app.models.user import User
from app.models.deal import Deal
from app.models.participation import Participation
from app.models.order import Order
from app.models.notification import Notification

# DEADLINE SCHEDULER

scheduler = BackgroundScheduler(
    timezone="UTC"
)

scheduler.add_job(
    process_expired_deals,
    trigger="interval",
    seconds=60,
    id="bulkbuddy_deadline_checker",
    replace_existing=True,
    max_instances=1,
    coalesce=True,
)

# APPLICATION LIFESPAN

@asynccontextmanager
async def lifespan(app: FastAPI):

    # Start scheduler when the application starts.
    scheduler.start()

    try:
        yield

    finally:
        # Stop scheduler when the application shuts down.
        scheduler.shutdown(wait=False)


# CREATE FASTAPI APPLICATION

app = FastAPI(
    title="BulkBuddy API",
    description="Group Buying Marketplace API",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS CONFIGURATION

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# INCLUDE ALL ROUTERS

app.include_router(auth.router)

app.include_router(deals.router)

app.include_router(participations.router)

app.include_router(orders.router)

app.include_router(csv_import.router)

app.include_router(reports.router)

app.include_router(notifications.router)


# ROOT ENDPOINT

@app.get("/")
def root():

    return {
        "message": "BulkBuddy API is running"
    }