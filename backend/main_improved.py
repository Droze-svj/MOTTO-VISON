"""
MOTTO-VISON Backend API - Improved Security & Architecture
Updated with OpenAPI documentation
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import FastAPI, Request, Depends, HTTPException, status, Response, Cookie, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

# Import our improved modules
from config import settings
from database import get_db, init_db, close_db, check_db_health
from models import User, AuditLog
from passlib.context import CryptContext
import jwt

# Import chat endpoint
from endpoints.chat import router as chat_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ============================================
# Application Lifecycle
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"📍 Environment: {settings.ENVIRONMENT}")
    
    try:
        await init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise
    
    yield
    
    logger.info("🛑 Shutting down application")
    await close_db()
    logger.info("✅ Cleanup complete")


# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
# MOTTO-VISON API

A Personal AI Assistant API with enterprise-grade security and OAuth integrations.

## Features

* 🔐 **Secure Authentication** - JWT tokens with bcrypt hashing
* 🤖 **AI Integration** - OpenAI GPT-4 support
* 🔗 **OAuth** - Google, Microsoft, Notion, Apple, Facebook
* 📊 **Monitoring** - Built-in metrics and health checks
* 🚀 **Performance** - PostgreSQL with connection pooling
* 📝 **Audit Log** - Full security compliance

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Get your token by:
1. Register at `/auth/register`
2. Login at `/auth/login`
    """,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_tags=[
        {"name": "auth", "description": "Authentication endpoints"},
        {"name": "users", "description": "User management"},
        {"name": "health", "description": "Health checks and status"},
    ]
)


# ============================================
# Middleware
# ============================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['X-API-Version'] = settings.APP_VERSION
        return response


app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# Include Chat Router
app.include_router(chat_router, prefix="/api", tags=["AI Chat"])


# ============================================
# Pydantic Models
# ============================================

class UserLogin(BaseModel):
    """Login request model"""
    username: str
    password: str
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "johndoe",
                    "password": "Secure123!"
                }
            ]
        }
    }


class UserRegister(BaseModel):
    """Registration request model"""
    username: str
    email: EmailStr
    password: str
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "johndoe",
                    "email": "john@example.com",
                    "password": "Secure123!"
                }
            ]
        }
    }


class UserAuth(BaseModel):
    """User authentication model"""
    username: str
    password: str


class Token(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


# ============================================
# Security Utilities
# ============================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.get_secret_key(),
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.get_secret_key(),
            algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).filter(User.user_id == username))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user


async def log_audit(
    db: AsyncSession,
    user_id: Optional[str],
    action: str,
    resource: Optional[str],
    status: str,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
):
    """Log an audit event"""
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            status=status,
            details=details,
            ip_address=ip_address
        )
        db.add(audit_log)
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to log audit event: {e}")


# ============================================
# Health & Status Endpoints
# ============================================

@app.get("/", tags=["health"])
async def root():
    """Root endpoint - API information"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "healthy",
        "docs": "/docs" if settings.DEBUG else "disabled in production"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint
    
    Returns the current health status of the API and its dependencies.
    """
    db_healthy = await check_db_health()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database": "connected" if db_healthy else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================
# Authentication Endpoints
# ============================================

@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED, tags=["auth"])
async def register(
    user_data: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user
    
    Creates a new user account with the provided credentials.
    Returns access and refresh tokens for immediate use.
    """
    try:
        # Check if user exists
        result = await db.execute(
            select(User).filter(
                (User.user_id == user_data.username) | (User.email == user_data.email)
            )
        )
        existing_user = result.scalars().first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Create new user
        new_user = User(
            user_id=user_data.username,
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            is_active=True,
            is_verified=False
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        # Log audit
        await log_audit(
            db=db,
            user_id=new_user.user_id,
            action="register",
            resource="user",
            status="success",
            ip_address=request.client.host
        )
        
        # Generate tokens
        access_token = create_access_token(data={"sub": new_user.user_id})
        refresh_token = create_access_token(
            data={"sub": new_user.user_id, "type": "refresh"},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        new_user.refresh_token = refresh_token
        await db.commit()
        
        logger.info(f"✅ New user registered: {new_user.user_id}")
        
        return Token(access_token=access_token, refresh_token=refresh_token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
@app.post("/auth/login", response_model=Token, tags=["auth"])
async def login(
    user_auth: UserAuth,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    User login
    
    Authenticate with username and password.
    Returns access token and refresh token.
    """
    try:
        result = await db.execute(select(User).filter(User.user_id == user_auth.username))
        user = result.scalars().first()
        
        if not user or not user.hashed_password or not verify_password(user_auth.password, user.hashed_password):
            await log_audit(
                db=db,
                user_id=user_auth.username,
                action="login",
                resource="auth",
                status="failure",
                details="Invalid credentials",
                ip_address=request.client.host
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user.user_id})
        refresh_token = create_access_token(
            data={"sub": user.user_id, "type": "refresh"},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Update user
        user.refresh_token = refresh_token
        user.last_login = datetime.utcnow()
        await db.commit()
        
        # Set secure cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
        )
        
        # Log successful login
        await log_audit(
            db=db,
            user_id=user.user_id,
            action="login",
            resource="auth",
            status="success",
            ip_address=request.client.host
        )
        
        logger.info(f"✅ User logged in: {user.user_id}")
        
        return Token(access_token=access_token, refresh_token=refresh_token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@app.post("/auth/logout", tags=["auth"])
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    User logout
    
    Invalidates the current refresh token and clears cookies.
    """
    current_user.refresh_token = None
    await db.commit()
    
    response.delete_cookie("refresh_token")
    
    await log_audit(
        db=db,
        user_id=current_user.user_id,
        action="logout",
        resource="auth",
        status="success"
    )
    
    return {"message": "Successfully logged out"}


# ============================================
# User Endpoints
# ============================================

@app.get("/me", tags=["users"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user profile
    
    Returns the profile of the currently authenticated user.
    """
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "onboarded": current_user.onboarded,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


# ============================================
# Error Handlers
# ============================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_improved:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
