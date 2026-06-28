from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/payment", tags=["payment"])

@router.post("/create")
def create_payment(current_user: User = Depends(get_current_user)):
    return {"message": "Life Compass is 100% free. No payment needed.", "status": "free"}

@router.post("/webhook")
async def webhook():
    return {"message": "Payments disabled — Life Compass is free", "status": "free"}

@router.get("/status")
def payment_status(current_user: User = Depends(get_current_user)):
    return {"has_access": True, "product": "full_report", "message": "All features are free"}
