import pytest
import asyncio
from httpx import AsyncClient
from backend.main import app
import jwt
import os

@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register
        resp = await ac.post("/register", json={"username": "testuser", "password": "testpass", "email": "test@example.com"})
        assert resp.status_code == 200
        # Login
        resp = await ac.post("/login", json={"username": "testuser", "password": "testpass"})
        assert resp.status_code == 200
        token = resp.json()["access_token"]
        # /me endpoint
        headers = {"Authorization": f"Bearer {token}"}
        resp = await ac.get("/me", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["user_id"] == "testuser"

@pytest.mark.asyncio
async def test_rate_limit():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        for _ in range(4):
            resp = await ac.post("/register", json={"username": f"user{_}", "password": "testpass", "email": f"user{_}@example.com"})
        assert resp.status_code == 429 

@pytest.mark.asyncio
async def test_refresh_and_logout():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register and login
        await ac.post("/register", json={"username": "refreshuser", "password": "testpass", "email": "refresh@example.com"})
        resp = await ac.post("/login", json={"username": "refreshuser", "password": "testpass"})
        refresh_token = resp.json()["refresh_token"]
        # Refresh
        cookies = {"refresh_token": refresh_token}
        resp = await ac.post("/refresh", cookies=cookies)
        assert resp.status_code == 200
        assert "access_token" in resp.json()
        # Logout
        resp = await ac.post("/logout", cookies=cookies)
        assert resp.status_code == 200
        # Refresh after logout should fail
        resp = await ac.post("/refresh", cookies=cookies)
        assert resp.status_code == 401

@pytest.mark.asyncio
async def test_social_login_placeholder():
    # This is a placeholder for social login integration tests
    # In real tests, you would mock the OAuth flow and callback
    assert True 