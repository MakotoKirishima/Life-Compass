import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, RefreshToken
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    hash_token, verify_refresh_token, get_current_user, verify_google_token,
    verify_secrets
)
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email,
        display_name=req.display_name or req.email.split("@")[0],
        password_hash=hash_password(req.password),
        auth_provider="email",
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    at = create_access_token({"user_id": user.id, "email": user.email})
    rt = create_refresh_token({"user_id": user.id})
    db.add(RefreshToken(user_id=user.id, token_hash=hash_token(rt), expires_at=datetime.utcnow()))
    db.commit()
    return TokenResponse(access_token=at, refresh_token=rt, user_id=user.id)

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = None
    if req.google_token:
        google_payload = verify_google_token(req.google_token)
        if not google_payload:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        email = google_payload.get("email", "")
        google_id = google_payload.get("sub", "")
        name = google_payload.get("name", "")
        user = db.query(User).filter(
            (User.email == email) | (User.google_id == google_id)
        ).first()
        if not user:
            user = User(email=email, google_id=google_id, display_name=name, auth_provider="google")
            db.add(user)
            db.commit()
            db.refresh(user)
    elif req.email and req.password:
        user = db.query(User).filter(User.email == req.email, User.deleted_at.is_(None)).first()
        if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
    else:
        raise HTTPException(status_code=400, detail="Email/password or Google token required")
    at = create_access_token({"user_id": user.id, "email": user.email})
    rt = create_refresh_token({"user_id": user.id})
    db.add(RefreshToken(user_id=user.id, token_hash=hash_token(rt), expires_at=datetime.utcnow()))
    db.commit()
    response = JSONResponse({
        "access_token": at, "refresh_token": rt,
        "token_type": "bearer", "user_id": user.id
    })
    response.set_cookie(
        key="refresh_token",
        value=rt,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/auth"
    )
    return response

@router.post("/refresh")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    token = None
    body = {}
    try:
        body = asyncio.run(request.json())
        token = body.get("refresh_token")
    except Exception:
        pass
    if not token:
        token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token required")
    payload = verify_refresh_token(token, db)
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_access = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    new_refresh = create_refresh_token({"user_id": user.id, "email": user.email, "role": user.role})
    
    token_hash = hash_token(new_refresh)
    db.add(RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)))
    db.commit()
    
    response = JSONResponse({
        "access_token": new_access, "refresh_token": new_refresh,
        "token_type": "bearer", "user_id": user.id, "email": user.email, "display_name": user.display_name
    })
    response.set_cookie(key="refresh_token", value=new_refresh, httponly=True, secure=settings.APP_ENV == "production", samesite="lax", max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, path="/api/auth")
    return response

@router.post("/logout")
def logout(req: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(req.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored:
        db.delete(stored)
        db.commit()
    return {"message": "Logged out"}

@router.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Account deleted"}

@router.get("/export")
def export_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models import UserProfile, CareerMatch, ExperimentPlan, Payment, ChatLog
    profiles = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()
    matches = db.query(CareerMatch).filter(CareerMatch.user_id == current_user.id).all()
    plans = db.query(ExperimentPlan).filter(ExperimentPlan.user_id == current_user.id).all()
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).all()
    chats = db.query(ChatLog).filter(ChatLog.user_id == current_user.id).all()
    return {
        "user": {"id": current_user.id, "email": current_user.email, "display_name": current_user.display_name, "created_at": str(current_user.created_at)},
        "profiles": [{"stage": p.stage, "interests": p.interests, "skills": p.skills, "created_at": str(p.created_at)} for p in profiles],
        "matches": [{"id": m.id, "created_at": str(m.created_at)} for m in matches],
        "experiment_plans": [{"career_title": p.career_title, "tasks": p.tasks, "status": p.status} for p in plans],
        "payments": [{"amount": p.amount, "status": p.status, "product_type": p.product_type} for p in payments],
        "chat_logs": [{"question": c.question[:100], "created_at": str(c.created_at)} for c in chats],
    }
