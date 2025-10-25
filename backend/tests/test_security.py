import pytest
from httpx import AsyncClient
from backend.main import app

@pytest.mark.asyncio
async def test_security_headers():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.get("/health")
        assert resp.headers["Strict-Transport-Security"].startswith("max-age=")
        assert resp.headers["X-Content-Type-Options"] == "nosniff"
        assert resp.headers["X-Frame-Options"] == "DENY"
        assert resp.headers["X-XSS-Protection"] == "1; mode=block"
        assert resp.headers["Referrer-Policy"] == "same-origin"

@pytest.mark.asyncio
async def test_cors():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.options("/health", headers={
            "Origin": "https://your-frontend-domain.com",
            "Access-Control-Request-Method": "GET"
        })
        assert resp.headers["access-control-allow-origin"] == "https://your-frontend-domain.com" 