import hmac
import hashlib
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Payment, UserEntitlement
from app.auth import get_current_user, get_admin_user
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/api/payment", tags=["payment"])

@router.post("/create")
def create_payment(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Payment).filter(
        Payment.user_id == current_user.id, Payment.status == "pending"
    ).first()
    if not existing:
        payment = Payment(
            user_id=current_user.id, amount=settings.MAYAR_PRODUCT_PRICE,
            product_type=settings.MAYAR_PRODUCT_TYPE, status="pending"
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        pid = payment.id
    else:
        pid = existing.id
    ref = f"LC-{pid}"
    checkout_url = f"https://app.mayar.id/checkout?reference={ref}&amount={settings.MAYAR_PRODUCT_PRICE}"
    return {"payment_id": pid, "amount": settings.MAYAR_PRODUCT_PRICE, "checkout_url": checkout_url, "status": "pending"}

def verify_mayar_webhook(body: dict, headers: dict) -> bool:
    if not settings.MAYAR_WEBHOOK_SECRET:
        return False
    signature = headers.get("x-mayar-signature", "")
    if not signature:
        return False
    payload_str = "".join(sorted(f"{k}={v}" for k, v in sorted(body.items())))
    expected = hmac.new(settings.MAYAR_WEBHOOK_SECRET.encode(), payload_str.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        body = {}
    headers_dict = dict(request.headers)

    ref = body.get("reference", "")
    status = body.get("status", "")
    is_verified = verify_mayar_webhook(body, headers_dict)

    if is_verified and ref and ref.startswith("LC-"):
        try:
            pid = int(ref.replace("LC-", ""))
            payment = db.query(Payment).filter(Payment.id == pid).first()
            if payment and payment.status == "pending":
                payment.status = "completed" if status == "success" else "failed"
                payment.raw_webhook = body
                db.commit()
                if payment.status == "completed":
                    existing = db.query(UserEntitlement).filter(
                        UserEntitlement.user_id == payment.user_id,
                        UserEntitlement.product_type == "full_report"
                    ).first()
                    if not existing:
                        db.add(UserEntitlement(
                            user_id=payment.user_id, product_type="full_report", status="active"
                        ))
                        db.commit()
        except (ValueError, Exception):
            pass
    return {"message": "OK"}

@router.get("/status")
def payment_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entitlement = db.query(UserEntitlement).filter(
        UserEntitlement.user_id == current_user.id,
        UserEntitlement.product_type == "full_report",
        UserEntitlement.status == "active"
    ).first()
    return {"has_access": bool(entitlement), "product": "full_report" if entitlement else None}

@router.post("/admin/unlock/{user_id}")
def admin_unlock(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    existing = db.query(UserEntitlement).filter(
        UserEntitlement.user_id == user_id,
        UserEntitlement.product_type == "full_report"
    ).first()
    if not existing:
        db.add(UserEntitlement(user_id=user_id, product_type="full_report", status="active"))
        db.commit()
    return {"message": "Unlocked"}
