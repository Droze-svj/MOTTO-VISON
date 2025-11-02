"""
App Updates API Endpoint
Handles version checking and update notifications
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class AppVersion(BaseModel):
    version: str
    build: str
    minRequiredVersion: Optional[str] = None
    updateAvailable: bool
    forceUpdate: bool
    updateUrl: Optional[str] = None
    releaseNotes: Optional[str] = None


# Configuration - Update these with your actual versions
LATEST_VERSION = "1.0.0"
LATEST_BUILD = "1"
MIN_REQUIRED_VERSION = "1.0.0"  # Minimum version that must be updated
TESTFLIGHT_URL = "https://testflight.apple.com/join/XXXXXXXX"  # Replace with your TestFlight link


@router.get("/api/updates/check", response_model=AppVersion)
async def check_for_updates(
    platform: str = Query(..., description="Platform: ios or android"),
    version: str = Query(..., description="Current app version"),
    build: str = Query(..., description="Current build number")
):
    """
    Check if app update is available
    """
    try:
        # Simple version comparison (for production, use proper semver comparison)
        current_version_tuple = tuple(map(int, version.split('.')))
        latest_version_tuple = tuple(map(int, LATEST_VERSION.split('.')))
        
        # Check if update is available
        update_available = current_version_tuple < latest_version_tuple
        
        # Check if force update is required
        min_version_tuple = tuple(map(int, MIN_REQUIRED_VERSION.split('.')))
        force_update = current_version_tuple < min_version_tuple
        
        # Build update URL based on platform
        update_url = None
        if platform == "ios":
            update_url = TESTFLIGHT_URL
        elif platform == "android":
            # Android Play Store URL
            update_url = "https://play.google.com/apps/internaltest/XXXXXXXX"
        
        release_notes = ""
        if update_available:
            release_notes = "New version available with bug fixes and improvements"
        
        return AppVersion(
            version=LATEST_VERSION,
            build=LATEST_BUILD,
            minRequiredVersion=MIN_REQUIRED_VERSION,
            updateAvailable=update_available,
            forceUpdate=force_update,
            updateUrl=update_url,
            releaseNotes=release_notes
        )
        
    except Exception as e:
        logger.error(f"Error checking updates: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check for updates")


# Add this router to your main app
# from updates_endpoint import router as updates_router
# app.include_router(updates_router)

