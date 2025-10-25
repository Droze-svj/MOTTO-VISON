"""
Database Configuration
Supports both PostgreSQL (production) and SQLite (development)
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)

# Import settings
try:
    from backend.config import settings
except ImportError:
    # Fallback for development
    class FallbackSettings:
        DATABASE_URL = "sqlite+aiosqlite:///./tokens.db"
        DATABASE_ECHO = False
        DATABASE_POOL_SIZE = 5
        DATABASE_MAX_OVERFLOW = 10
    
    settings = FallbackSettings()

# Determine if we're using SQLite or PostgreSQL
is_sqlite = "sqlite" in settings.DATABASE_URL.lower()

# Configure engine based on database type
if is_sqlite:
    # SQLite configuration
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DATABASE_ECHO,
        future=True,
        poolclass=NullPool,  # SQLite doesn't support connection pooling
        connect_args={"check_same_thread": False}  # Allow multiple threads
    )
    logger.info("🗄️  Using SQLite database (development mode)")
else:
    # PostgreSQL configuration (recommended for production)
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DATABASE_ECHO,
        future=True,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
    )
    logger.info("🐘 Using PostgreSQL database (production mode)")

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database session dependency for FastAPI
    
    Usage:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    from backend.models import Base
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("✅ Database tables initialized")


async def close_db():
    """Close database connections"""
    await engine.dispose()
    logger.info("🔌 Database connections closed")


# Health check function
async def check_db_health() -> bool:
    """Check if database is reachable"""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
