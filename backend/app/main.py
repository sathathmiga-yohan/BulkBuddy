from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    deals,
    participations,
    csv_import,
    reports,
)


app = FastAPI(
    title="BulkBuddy API",
    description="Group-Buying Marketplace API",
    version="1.0.0"
)


# =========================
# CORS
# =========================
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


# =========================
# ROUTERS
# =========================
app.include_router(auth.router)
app.include_router(deals.router)
app.include_router(participations.router)
app.include_router(csv_import.router)
app.include_router(reports.router)


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {
        "message": "BulkBuddy API is running"
    }