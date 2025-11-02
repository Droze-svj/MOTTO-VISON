"""
Health Check Endpoint for Production Monitoring
"""

from fastapi import APIRouter, status
from datetime import datetime
import psutil
import os
from database import SessionLocal

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint for monitoring
    Returns basic system health status
    """
    try:
        # Check database connection
        db = SessionLocal()
        try:
            db.execute("SELECT 1")
            db_status = "healthy"
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        finally:
            db.close()
        
        # Get system metrics
        memory = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=0.1)
        
        health_status = {
            "status": "healthy" if db_status == "healthy" else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "version": os.getenv("API_VERSION", "v1"),
            "environment": os.getenv("ENVIRONMENT", "unknown"),
            "database": {
                "status": db_status
            },
            "system": {
                "memory_percent": memory.percent,
                "cpu_percent": cpu,
                "memory_available_mb": memory.available / (1024 * 1024)
            }
        }
        
        status_code = status.HTTP_200_OK if health_status["status"] == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
        
        return health_status
    
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }, status.HTTP_503_SERVICE_UNAVAILABLE


@router.get("/health/live", tags=["health"])
async def liveness_check():
    """
    Kubernetes liveness probe endpoint
    Simple check that service is running
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}


@router.get("/health/ready", tags=["health"])
async def readiness_check():
    """
    Kubernetes readiness probe endpoint
    Checks if service is ready to accept traffic
    """
    try:
        db = SessionLocal()
        try:
            db.execute("SELECT 1")
            return {
                "status": "ready",
                "timestamp": datetime.utcnow().isoformat()
            }
        finally:
            db.close()
    except Exception as e:
        return {
            "status": "not_ready",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }, status.HTTP_503_SERVICE_UNAVAILABLE

