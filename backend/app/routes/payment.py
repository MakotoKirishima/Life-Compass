from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Payment, UserEntitlement, CareerMatch
from app.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/payment", tags=["payment"])

@router.post("/create")
def create_payment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = Payment(
        user_id=current_user.id,
        amount=25000,
        product_type="full_report",
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    mayar_url = f"https://app.mayar.id/checkout?reference=LC-{payment.id}&amount=25000"

    return {
        "payment_id": payment.id,
        "amount": 25000,
        "checkout_url": mayar_url,
        "status": "pending"
    }

@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}

    ref = body.get("reference", "")
    status = body.get("status", "success")

    if ref and ref.startswith("LC-"):
        pid = int(ref.replace("LC-", ""))
        payment = db.query(Payment).filter(Payment.id == pid).first()
        if payment and payment.status == "pending":
            payment.status = "completed" if status == "success" else "failed"
            db.commit()

            if payment.status == "completed":
                existing = db.query(UserEntitlement).filter(
                    UserEntitlement.user_id == payment.user_id,
                    UserEntitlement.product_type == "full_report"
                ).first()
                if not existing:
                    entitlement = UserEntitlement(
                        user_id=payment.user_id,
                        product_type="full_report",
                        status="active"
                    )
                    db.add(entitlement)
                    db.commit()

    return {"message": "OK"}

@router.get("/status")
def payment_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entitlement = db.query(UserEntitlement).filter(
        UserEntitlement.user_id == current_user.id,
        UserEntitlement.product_type == "full_report",
        UserEntitlement.status == "active"
    ).first()

    return {
        "has_access": bool(entitlement),
        "product": "full_report" if entitlement else None
    }

@router.post("/admin/unlock/{user_id}")
def admin_unlock(user_id: int, admin: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if admin.email not in ["admin@lifecompass.app"]:
        return {"error": "Forbidden"}, 403
    entitlement = UserEntitlement(
        user_id=user_id,
        product_type="full_report",
        status="active"
    )
    db.add(entitlement)
    db.commit()
    return {"message": "Unlocked"}
