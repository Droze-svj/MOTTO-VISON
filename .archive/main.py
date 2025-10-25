import httpx
import firebase_admin
from firebase_admin import credentials, messaging as fcm_messaging
from fastapi import FastAPI, Request, Depends, HTTPException, Body, status, Response, Cookie, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from fastapi.responses import RedirectResponse
from integrations.google import get_google_flow, SCOPES as GOOGLE_SCOPES
from integrations.microsoft import get_msal_app, MS_SCOPES, MS_REDIRECT_URI
from integrations.notion import get_notion_client
from googleapiclient.discovery import build as google_build
from google.oauth2.credentials import Credentials as GoogleCredentials
import requests
from notion_client import Client as NotionClient
import os
import openai
from deep_translator import GoogleTranslator
import deepl
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, engine
from sqlalchemy import select
import asyncio
import logging
from prometheus_fastapi_instrumentator import Instrumentator
import sentry_sdk
from backend.cache import cache_get, cache_set
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from fastapi import Request
from passlib.context import CryptContext
import jwt
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import base64
import json
import time
from backend.metrics import onboarding_step_counter, feature_usage_counter

app = FastAPI()
scheduler = BackgroundScheduler()
scheduler.start()

# Monitoring and logging setup (must be after app is defined)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger(__name__)

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", ""),
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "production")
)

Instrumentator().instrument(app).expose(app)

load_dotenv()

# Firebase Admin initialization
cred = credentials.Certificate("firebase_service_account.json")
firebase_admin.initialize_app(cred)

Base.metadata.create_all(bind=engine)

# Refactor get_db to be async and yield an async session
async def get_db():
    async with AsyncSessionLocal() as db:
        yield db

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response: Response = await call_next(request)
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'same-origin'
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Restrict CORS origins to trusted domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Add your trusted frontend domains here
        "https://your-frontend-domain.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# Advanced rate limiting: burst and sustained
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

REFRESH_TOKEN_EXPIRE_DAYS = 7

# Add refresh_token column to User if not present
# (see models.py for actual DB field)

# Issue both access and refresh tokens on login
@limiter.limit("5/minute;100/hour", key_func=get_remote_address)
@app.post("/login")
async def login(request: UserAuth, db: AsyncSession = Depends(get_db), response: Response = None):
    user = await db.execute(select(User).filter(User.user_id == request.username))
    user = user.scalars().first()
    if not user or not hasattr(user, "hashed_password") or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.user_id})
    refresh_token = create_access_token(data={"sub": user.user_id, "type": "refresh"}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    user.refresh_token = refresh_token
    await db.commit()
    if response:
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=REFRESH_TOKEN_EXPIRE_DAYS*24*3600)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Refresh endpoint
@app.post("/refresh")
async def refresh_token_endpoint(refresh_token: Optional[str] = Cookie(None), db: AsyncSession = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token type")
        username = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await db.execute(select(User).filter(User.user_id == username))
    user = user.scalars().first()
    if not user or user.refresh_token != refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token (not found)")
    access_token = create_access_token(data={"sub": user.user_id})
    return {"access_token": access_token, "token_type": "bearer"}

# Logout endpoint
@app.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db), response: Response = None):
    current_user.refresh_token = None
    await db.commit()
    if response:
        response.delete_cookie("refresh_token")
    return {"msg": "Logged out"}

# Google OAuth callback issues JWTs
@app.get("/auth/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db), user_id: str = None, response: Response = None, mobile_redirect_uri: str = Query(None)):
    flow = get_google_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    if user_id is None:
        return {"error": "user_id required"}
    user = await db.execute(select(User).filter(User.user_id == user_id))
    user = user.scalars().first()
    if not user:
        user = User(user_id=user_id)
        db.add(user)
    user.google_access_token = credentials.token
    user.google_refresh_token = credentials.refresh_token
    # Issue JWTs
    access_token = create_access_token(data={"sub": user.user_id})
    refresh_token = create_access_token(data={"sub": user.user_id, "type": "refresh"}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    user.refresh_token = refresh_token
    await db.commit()
    if mobile_redirect_uri:
        url = f"{mobile_redirect_uri}?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url)
    if response:
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=REFRESH_TOKEN_EXPIRE_DAYS*24*3600)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Microsoft OAuth callback issues JWTs
@app.get("/auth/microsoft/callback")
async def microsoft_callback(code: str, db: AsyncSession = Depends(get_db), user_id: str = None, response: Response = None, mobile_redirect_uri: str = Query(None)):
    msal_app = get_msal_app()
    result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=MS_SCOPES,
        redirect_uri=MS_REDIRECT_URI
    )
    if user_id is None:
        return {"error": "user_id required"}
    user = await db.execute(select(User).filter(User.user_id == user_id))
    user = user.scalars().first()
    if not user:
        user = User(user_id=user_id)
        db.add(user)
    user.ms_access_token = result.get('access_token')
    user.ms_refresh_token = result.get('refresh_token')
    # Issue JWTs
    access_token = create_access_token(data={"sub": user.user_id})
    refresh_token = create_access_token(data={"sub": user.user_id, "type": "refresh"}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    user.refresh_token = refresh_token
    await db.commit()
    if mobile_redirect_uri:
        url = f"{mobile_redirect_uri}?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url)
    if response:
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=REFRESH_TOKEN_EXPIRE_DAYS*24*3600)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Notion OAuth2 endpoints
@app.get("/auth/notion")
def notion_auth():
    NOTION_CLIENT_ID = os.getenv("NOTION_CLIENT_ID")
    NOTION_REDIRECT_URI = os.getenv("NOTION_REDIRECT_URI")
    auth_url = (
        f"https://api.notion.com/v1/oauth/authorize"
        f"?owner=user&client_id={NOTION_CLIENT_ID}&redirect_uri={NOTION_REDIRECT_URI}&response_type=code"
    )
    return RedirectResponse(auth_url)

@app.get("/auth/notion/callback")
async def notion_callback(code: str, db: AsyncSession = Depends(get_db), user_id: str = None):
    # TODO: Exchange code for access token (see Notion docs)
    # For demonstration, store a placeholder
    if user_id is None:
        return {"error": "user_id required"}
    user = await db.execute(select(User).filter(User.user_id == user_id))
    user = user.scalars().first()
    if not user:
        user = User(user_id=user_id)
        db.add(user)
    user.notion_access_token = "notion_access_token_placeholder"
    await db.commit()
    return {"success": True}

# Apple OAuth endpoints (placeholder logic)
@app.get("/auth/apple")
def apple_auth():
    # Redirect to Apple OAuth2 authorization URL
    APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "apple-client-id")
    APPLE_REDIRECT_URI = os.getenv("APPLE_REDIRECT_URI", "http://localhost:8000/auth/apple/callback")
    auth_url = f"https://appleid.apple.com/auth/authorize?client_id={APPLE_CLIENT_ID}&redirect_uri={APPLE_REDIRECT_URI}&response_type=code&scope=name email"
    return RedirectResponse(auth_url)

@app.get("/auth/apple/callback")
async def apple_callback(code: str, db: AsyncSession = Depends(get_db), response: Response = None, mobile_redirect_uri: str = Query(None)):
    # Exchange code for tokens
    APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID", "apple-client-id")
    APPLE_CLIENT_SECRET = os.getenv("APPLE_CLIENT_SECRET", "apple-client-secret")
    APPLE_REDIRECT_URI = os.getenv("APPLE_REDIRECT_URI", "http://localhost:8000/auth/apple/callback")
    token_url = "https://appleid.apple.com/auth/token"
    data = {
        "client_id": APPLE_CLIENT_ID,
        "client_secret": APPLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": APPLE_REDIRECT_URI,
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=data)
        token_resp.raise_for_status()
        tokens = token_resp.json()
    id_token = tokens.get("id_token")
    # Decode id_token (JWT) to get user info
    if not id_token:
        return {"error": "No id_token from Apple"}
    payload_part = id_token.split(".")[1]
    # Pad base64 if needed
    payload_part += '=' * (-len(payload_part) % 4)
    payload = json.loads(base64.urlsafe_b64decode(payload_part.encode()).decode())
    user_id = payload.get("sub")
    email = payload.get("email")
    if not user_id:
        return {"error": "No user_id in Apple id_token"}
    user_id = f"apple_{user_id}"
    user = await db.execute(select(User).filter(User.user_id == user_id))
    user = user.scalars().first()
    if not user:
        user = User(user_id=user_id, email=email)
        db.add(user)
    # Issue JWTs
    access_token = create_access_token(data={"sub": user.user_id})
    refresh_token = create_access_token(data={"sub": user.user_id, "type": "refresh"}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    user.refresh_token = refresh_token
    await db.commit()
    if mobile_redirect_uri:
        url = f"{mobile_redirect_uri}?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url)
    if response:
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=REFRESH_TOKEN_EXPIRE_DAYS*24*3600)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Facebook OAuth endpoints (placeholder logic)
@app.get("/auth/facebook")
def facebook_auth():
    FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID", "facebook-client-id")
    FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/auth/facebook/callback")
    auth_url = f"https://www.facebook.com/v12.0/dialog/oauth?client_id={FACEBOOK_CLIENT_ID}&redirect_uri={FACEBOOK_REDIRECT_URI}&scope=email"
    return RedirectResponse(auth_url)

@app.get("/auth/facebook/callback")
async def facebook_callback(code: str, db: AsyncSession = Depends(get_db), response: Response = None, mobile_redirect_uri: str = Query(None)):
    FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID", "facebook-client-id")
    FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET", "facebook-client-secret")
    FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/auth/facebook/callback")
    # Exchange code for access_token
    token_url = "https://graph.facebook.com/v12.0/oauth/access_token"
    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "client_secret": FACEBOOK_CLIENT_SECRET,
        "code": code,
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.get(token_url, params=params)
        token_resp.raise_for_status()
        tokens = token_resp.json()
        access_token_fb = tokens.get("access_token")
        if not access_token_fb:
            return {"error": "No access_token from Facebook"}
        # Fetch user info
        userinfo_url = "https://graph.facebook.com/me"
        userinfo_params = {"fields": "id,email", "access_token": access_token_fb}
        userinfo_resp = await client.get(userinfo_url, params=userinfo_params)
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()
    user_id = f"facebook_{userinfo.get('id')}"
    email = userinfo.get("email")
    user = await db.execute(select(User).filter(User.user_id == user_id))
    user = user.scalars().first()
    if not user:
        user = User(user_id=user_id, email=email)
        db.add(user)
    # Issue JWTs
    access_token = create_access_token(data={"sub": user.user_id})
    refresh_token = create_access_token(data={"sub": user.user_id, "type": "refresh"}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    user.refresh_token = refresh_token
    await db.commit()
    if mobile_redirect_uri:
        url = f"{mobile_redirect_uri}?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url)
    if response:
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=REFRESH_TOKEN_EXPIRE_DAYS*24*3600)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@app.middleware("http")
async def log_request_time(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = (time.time() - start_time) * 1000  # ms
    path = request.url.path
    method = request.method
    import logging
    logging.info(f"{method} {path} took {duration:.2f}ms")
    return response

@app.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    start = time.time()
    # Only return minimal fields
    result = {
        "user_id": current_user.user_id,
        "email": getattr(current_user, "email", None),
        "onboarded": bool(getattr(current_user, "onboarded", 0))
    }
    duration = time.time() - start
    import logging
    logging.info(f"/me endpoint response time: {duration:.3f}s for user {current_user.user_id}")
    return result

@app.post("/user/{user_id}/onboarded")
async def set_onboarded(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    user = await db.execute(select(User).filter(User.user_id == user_id))
    user = user.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.onboarded = 1
    await db.commit()
    onboarding_step_counter.labels(step="onboarding_complete").inc()
    return {"msg": "Onboarding complete"}

# Example: increment onboarding step for each step if you have a dedicated endpoint
# @app.post("/onboarding/step")
# async def onboarding_step(step: str):
#     onboarding_step_counter.labels(step=step).inc()
#     return {"msg": f"Step {step} completed"}

# Example: increment feature usage in a feature endpoint
@app.post("/ai_chat")
async def ai_chat(data: dict = Body(...), db: AsyncSession = Depends(get_db)):
    feature_usage_counter.labels(feature="ai_chat").inc()
    import logging
    cache_key = f"ai_chat:{data.get('user_id')}:{hash(str(data))}"
    try:
        cached = await cache_get(cache_key)
        if cached:
            import json
            return json.loads(cached)
        user = await db.execute(select(User).filter(User.user_id == data.get("user_id")))
        user = user.scalars().first()
        language = data.get("language", "en")
        DEEPL_API_KEY = os.getenv("DEEPL_API_KEY")
        translator = deepl.Translator(DEEPL_API_KEY) if DEEPL_API_KEY else None
        # Step 1: Try Rasa NLU
        async with httpx.AsyncClient() as client:
            rasa_response = await client.post(
                "http://rasa:5005/model/parse",
                json={"text": data["text"], "sender": data.get("user_id", "default"), "language": language}
            )
            rasa_result = rasa_response.json()
            intent = rasa_result.get("intent", {}).get("name")
            confidence = rasa_result.get("intent", {}).get("confidence", 0)
            # Step 2: If high confidence, handle as before
            if intent != "nlu_fallback" and confidence > 0.7:
                if user:
                    user.last_interaction = data["text"]
                    await db.commit()
                rasa_text = rasa_result.get("text")
                if rasa_text:
                    if language != "en" and translator:
                        try:
                            rasa_text = translator.translate_text(rasa_text, target_lang=language.upper()).text
                        except Exception:
                            pass
                    result = {"type": "rasa", "intent": intent, "entities": rasa_result.get("entities", []), "text": rasa_text}
                    import json
                    await cache_set(cache_key, json.dumps(result), expire=60)
                    return result
                result = {"type": "rasa", "intent": intent, "entities": rasa_result.get("entities", []), "text": None}
                import json
                await cache_set(cache_key, json.dumps(result), expire=60)
                return result
            # Step 3: Otherwise, use LLM (OpenAI, etc.)
            OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
            openai.api_key = OPENAI_API_KEY
            profile = f"User name: {user.user_id if user else ''}. Preferences: {user.preferences if user else ''}."
            last_interaction = user.last_interaction if user else ''
            from datetime import datetime
            now = datetime.now().strftime('%A, %B %d, %H:%M')
            system_prompt = f"You are a helpful, friendly assistant. Current time: {now}. {profile} Last user message: {last_interaction} Respond in {language}."
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data["text"]}
            ]
            completion = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages
            )
            answer = completion.choices[0].message["content"]
            if language != "en" and translator:
                try:
                    answer = translator.translate_text(answer, target_lang=language.upper()).text
                except Exception:
                    pass
            if user:
                user.last_interaction = data["text"]
                await db.commit()
            result = {"type": "llm", "text": answer}
            import json
            await cache_set(cache_key, json.dumps(result), expire=60)
            return result
    except Exception as e:
        logging.error(f"/ai_chat error: {e}")
        return {"error": "AI chat unavailable"}

@app.get("/user/{user_id}/preferences")
async def get_user_preferences(user_id: str, db: AsyncSession = Depends(get_db)):
    import logging
    cache_key = f"preferences:{user_id}"
    try:
        cached = await cache_get(cache_key)
        if cached:
            import json
            return json.loads(cached)
        user = await db.execute(select(User).filter(User.user_id == user_id))
        user = user.scalars().first()
        if not user:
            return {"preferences": None}
        result = {"preferences": user.preferences}
        import json
        await cache_set(cache_key, json.dumps(result), expire=120)
        return result
    except Exception as e:
        logging.error(f"/user/{user_id}/preferences error: {e}")
        return {"error": "Preferences unavailable"}

@app.post("/user/{user_id}/preferences")
async def set_user_preferences(user_id: str, data: dict = Body(...), db: AsyncSession = Depends(get_db)):
    feature_usage_counter.labels(feature="set_preferences").inc()
    import logging
    try:
        user = await db.execute(select(User).filter(User.user_id == user_id))
        user = user.scalars().first()
        if not user:
            user = User(user_id=user_id)
            db.add(user)
        user.preferences = data.get("preferences", "")
        await db.commit()
        return {"success": True}
    except Exception as e:
        logging.error(f"/user/{user_id}/preferences POST error: {e}")
        return {"error": "Failed to set preferences"}

@app.get("/test_deepl_key")
def test_deepl_key():
    import os
    import deepl
    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        return {"success": False, "error": "DEEPL_API_KEY not set"}
    try:
        translator = deepl.Translator(api_key)
        usage = translator.get_usage()
        return {"success": True, "character_count": usage.character_count, "character_limit": usage.character_limit}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    import logging
    try:
        cached = await cache_get(f"profile:{user_id}")
        if cached:
            return {"profile": cached}
        user = await db.execute(select(User).filter(User.user_id == user_id))
        user = user.scalars().first()
        if not user:
            return {"profile": None}
        profile_json = {"user_id": user.user_id, "preferences": user.preferences}
        await cache_set(f"profile:{user_id}", str(profile_json), expire=300)
        return {"profile": profile_json}
    except Exception as e:
        logging.error(f"/user/{user_id}/profile error: {e}")
        return {"error": "Profile unavailable"} 

@app.get("/user/{user_id}/google/calendar")
async def get_google_calendar(user_id: str, db: AsyncSession = Depends(get_db)):
    feature_usage_counter.labels(feature="google_calendar").inc()
    # ...existing logic...

@app.get("/user/{user_id}/google/gmail")
async def get_gmail_messages(user_id: str, db: AsyncSession = Depends(get_db)):
    feature_usage_counter.labels(feature="gmail").inc()
    # ...existing logic...

@app.get("/user/{user_id}/microsoft/calendar")
async def get_ms_calendar(user_id: str, db: AsyncSession = Depends(get_db)):
    feature_usage_counter.labels(feature="ms_calendar").inc()
    # ...existing logic...

@app.get("/user/{user_id}/notion/pages")
async def get_notion_pages(user_id: str, db: AsyncSession = Depends(get_db)):
    feature_usage_counter.labels(feature="notion_pages").inc()
    # ...existing logic... 