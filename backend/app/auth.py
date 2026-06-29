import datetime
import hashlib
import os
import secrets
import time
from collections import defaultdict
from jose import jwt as jose_jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RefreshToken
from app.config import settings

rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 20

async def rate_limit_middleware(request: Request, call_next):
    forwarded = request.headers.get("X-Forwarded-For", "")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    now = time.time()
    window = rate_limit_store[client_ip]
    window[:] = [t for t in window if t > now - RATE_LIMIT_WINDOW]
    if len(window) >= RATE_LIMIT_MAX:
        return JSONResponse(status_code=429, content={"detail": "Too many requests"})
    window.append(now)
    return await call_next(request)

try:
    from cryptography.fernet import Fernet
    import base64
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def verify_secrets():
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is required")
    if not settings.REFRESH_TOKEN_SECRET:
        raise RuntimeError("REFRESH_TOKEN_SECRET is required")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hash_str: str) -> bool:
    return pwd_context.verify(password, hash_str)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.datetime.utcnow(), "type": "access"})
    return jose_jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.datetime.utcnow(), "type": "refresh"})
    return jose_jwt.encode(to_encode, settings.REFRESH_TOKEN_SECRET, algorithm=settings.ALGORITHM)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def verify_access_token(token: str) -> dict:
    try:
        payload = jose_jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload
    except jose_jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def verify_refresh_token(token: str, db: Session) -> dict:
    try:
        payload = jose_jwt.decode(token, settings.REFRESH_TOKEN_SECRET, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    except jose_jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    token_hash = hash_token(token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if not stored:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")
    return payload

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = verify_access_token(credentials.credentials)
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

def get_fernet() -> Fernet | None:
    key = settings.REFLECTION_ENCRYPTION_KEY
    if not key:
        return None
    try:
        key_bytes = base64.urlsafe_b64decode(key.encode())
        return Fernet(key_bytes)
    except Exception:
        try:
            if len(key) < 32:
                return None
            padded = key.ljust(32, '0')[:32]
            key_bytes = base64.urlsafe_b64encode(padded.encode())
            return Fernet(key_bytes)
        except Exception:
            return None

def encrypt_reflection(text: str) -> str | None:
    f = get_fernet()
    if not f:
        return None
    return f.encrypt(text.encode()).decode()

def decrypt_reflection(token: str) -> str | None:
    f = get_fernet()
    if not f:
        return None
    try:
        return f.decrypt(token.encode()).decode()
    except Exception:
        return None


