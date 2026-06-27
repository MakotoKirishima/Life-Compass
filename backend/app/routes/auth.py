from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse
from app.auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if req.google_token:
        import jwt as pyjwt
        try:
            payload = pyjwt.decode(req.google_token, options={"verify_signature": False})
            email = payload.get("email", "")
            name = payload.get("name", "")
            google_id = payload.get("sub", "")
        except Exception:
            email = req.email or "guest@lifecompass.app"
            google_id = email
            name = "User"
    else:
        email = req.email or "guest@lifecompass.app"
        google_id = email
        name = "User"

    user = db.query(User).filter(
        (User.email == email) | (User.google_id == google_id)
    ).first()

    if not user:
        user = User(email=email, google_id=google_id, display_name=name, auth_provider="google" if req.google_token else "email")
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email})
    return TokenResponse(access_token=token, user_id=user.id)

@router.delete("/account")
def delete_account(user_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Account deleted"}
