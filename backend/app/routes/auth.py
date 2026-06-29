import secrets
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, RefreshToken
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    hash_token, verify_refresh_token, get_current_user, verify_secrets
)
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _set_auth_cookies(response: JSONResponse, access_token: str, refresh_token: str):
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    domain = settings.COOKIE_DOMAIN if settings.APP_ENV == "production" else None
    secure = settings.APP_ENV == "production"
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=secure, samesite="lax", max_age=max_age, path="/", domain=domain)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=secure, samesite="lax", max_age=max_age, path="/api/auth", domain=domain)

def _make_user_response(user: User, db: Session):
    at = create_access_token({"user_id": user.id, "email": user.email, "role": user.role, "display_name": user.display_name})
    rt = create_refresh_token({"user_id": user.id, "email": user.email, "role": user.role})
    db.add(RefreshToken(user_id=user.id, token_hash=hash_token(rt), expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)))
    db.commit()
    response = JSONResponse({
        "access_token": at, "refresh_token": rt, "token_type": "bearer",
        "user_id": user.id, "email": user.email, "display_name": user.display_name
    })
    _set_auth_cookies(response, at, rt)
    return response

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email, display_name=req.display_name or req.email.split("@")[0],
        password_hash=hash_password(req.password), auth_provider="email", role="user"
    )
    db.add(user); db.commit(); db.refresh(user)
    return _make_user_response(user, db)

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if req.email and req.password:
        user = db.query(User).filter(User.email == req.email, User.deleted_at.is_(None)).first()
        if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return _make_user_response(user, db)
    raise HTTPException(status_code=400, detail="Email and password required")

@router.get("/google/status")
def google_status():
    missing = []
    if not settings.GOOGLE_CLIENT_ID:
        missing.append("GOOGLE_CLIENT_ID")
    if not settings.GOOGLE_CLIENT_SECRET:
        missing.append("GOOGLE_CLIENT_SECRET")
    if not settings.GOOGLE_REDIRECT_URI:
        missing.append("GOOGLE_REDIRECT_URI")
    return {"configured": len(missing) == 0, "missing": missing, "count": len(missing)}

@router.get("/google/login")
def google_login(request: Request):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return JSONResponse(status_code=501, content={"detail": "Google login is not configured"})
    state = secrets.token_urlsafe(32)
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    resp = RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri={redirect_uri}&state={state}&response_type=code&scope=openid%20email%20profile", status_code=302)
    secure = settings.APP_ENV == "production"
    domain = settings.COOKIE_DOMAIN if secure else None
    resp.set_cookie(key="oauth_state", value=state, httponly=True, secure=secure, samesite="lax", max_age=300, path="/", domain=domain)
    return resp

@router.get("/google/callback")
def google_callback(request: Request, code: str = None, state: str = None, error: str = None, db: Session = Depends(get_db)):
    if error:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google_auth_failed", status_code=302)
    if not code:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=no_code", status_code=302)
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google_not_configured", status_code=302)
    stored_state = request.cookies.get("oauth_state")
    if stored_state and state and stored_state != state:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=state_mismatch", status_code=302)
    try:
        token_resp = httpx.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }, timeout=10)
        if token_resp.status_code != 200:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=token_exchange_failed", status_code=302)
        token_data = token_resp.json()
        id_token = token_data.get("id_token")
        if not id_token:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=no_id_token", status_code=302)
        userinfo_resp = httpx.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=10)
        if userinfo_resp.status_code != 200:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=userinfo_failed", status_code=302)
        payload = userinfo_resp.json()
        if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=invalid_audience", status_code=302)
        email = payload.get("email", "")
        google_id = payload.get("sub", "")
        name = payload.get("name", "")
        user = db.query(User).filter((User.email == email) | (User.google_id == google_id)).first()
        if not user:
            user = User(email=email, google_id=google_id, display_name=name, auth_provider="google")
            db.add(user); db.commit(); db.refresh(user)
        at = create_access_token({"user_id": user.id, "email": user.email, "role": user.role, "display_name": user.display_name})
        rt = create_refresh_token({"user_id": user.id, "email": user.email, "role": user.role})
        db.add(RefreshToken(user_id=user.id, token_hash=hash_token(rt), expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)))
        db.commit()
        resp = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?token={at}", status_code=302)
        max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        domain = settings.COOKIE_DOMAIN if settings.APP_ENV == "production" else None
        secure = settings.APP_ENV == "production"
        resp.set_cookie(key="access_token", value=at, httponly=True, secure=secure, samesite="lax", max_age=max_age, path="/", domain=domain)
        resp.set_cookie(key="refresh_token", value=rt, httponly=True, secure=secure, samesite="lax", max_age=max_age, path="/api/auth", domain=domain)
        resp.delete_cookie(key="oauth_state", path="/", domain=domain)
        return resp
    except Exception as e:
        import logging
        logging.getLogger("lifecompass").error("Google OAuth error", exc_info=True)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=server_error", status_code=302)

@router.get("/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        from app.auth import verify_access_token
        payload = verify_access_token(token)
        user = db.query(User).filter(User.id == payload.get("user_id"), User.deleted_at.is_(None)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user.id, "email": user.email, "display_name": user.display_name, "role": user.role}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/refresh")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        body = {}
        try:
            body = await request.json()
            token = body.get("refresh_token")
        except Exception:
            pass
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token required")
    payload = verify_refresh_token(token, db)
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _make_user_response(user, db)

@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    rt = request.cookies.get("refresh_token")
    if rt:
        token_hash = hash_token(rt)
        stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if stored:
            db.delete(stored)
            db.commit()
    resp = JSONResponse({"message": "Logged out"})
    domain = settings.COOKIE_DOMAIN if settings.APP_ENV == "production" else None
    resp.delete_cookie(key="access_token", path="/", domain=domain)
    resp.delete_cookie(key="refresh_token", path="/api/auth", domain=domain)
    return resp

@router.delete("/account")
def delete_account(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.deleted_at = datetime.utcnow()
    db.commit()
    resp = JSONResponse({"message": "Account deleted"})
    domain = settings.COOKIE_DOMAIN if settings.APP_ENV == "production" else None
    resp.delete_cookie(key="access_token", path="/", domain=domain)
    resp.delete_cookie(key="refresh_token", path="/api/auth", domain=domain)
    return resp

@router.get("/export")
def export_data(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models import UserProfile, CareerMatch, ExperimentPlan, ChatLog
    profiles = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()
    matches = db.query(CareerMatch).filter(CareerMatch.user_id == current_user.id).all()
    plans = db.query(ExperimentPlan).filter(ExperimentPlan.user_id == current_user.id).all()
    chats = db.query(ChatLog).filter(ChatLog.user_id == current_user.id).all()
    return {
        "user": {"id": current_user.id, "email": current_user.email, "display_name": current_user.display_name, "created_at": str(current_user.created_at)},
        "profiles": [{"stage": p.stage, "interests": p.interests, "skills": p.skills, "created_at": str(p.created_at)} for p in profiles],
        "matches": [{"id": m.id, "created_at": str(m.created_at)} for m in matches],
        "experiment_plans": [{"career_title": p.career_title, "tasks": p.tasks, "status": p.status} for p in plans],
        "chat_logs": [{"question": c.question[:100], "created_at": str(c.created_at)} for c in chats],
    }
