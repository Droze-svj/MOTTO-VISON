"""
Backend Configuration with Pydantic Settings
Ensures all required environment variables are present and valid
"""

from pydantic import Field, validator, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import secrets


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # Application
    APP_NAME: str = "MOTTO-VISON API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = Field(default="production", pattern="^(development|staging|production)$")
    
    # Security
    SECRET_KEY: SecretStr = Field(
        ...,  # Required, no default
        min_length=32,
        description="Secret key for JWT tokens. Must be at least 32 characters."
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://motto_user:secure_password@localhost:5432/motto_db",
        description="PostgreSQL database URL"
    )
    DATABASE_ECHO: bool = False  # SQL query logging
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Redis Cache
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis cache URL"
    )
    REDIS_TTL: int = 300  # 5 minutes default
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:19006",  # Expo
        ],
        description="Allowed CORS origins"
    )
    
    # API Keys
    OPENAI_API_KEY: Optional[SecretStr] = None
    DEEPL_API_KEY: Optional[SecretStr] = None
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[SecretStr] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    
    # OAuth - Microsoft
    MS_CLIENT_ID: Optional[str] = None
    MS_CLIENT_SECRET: Optional[SecretStr] = None
    MS_TENANT_ID: str = "common"
    MS_REDIRECT_URI: str = "http://localhost:8000/auth/microsoft/callback"
    
    # OAuth - Notion
    NOTION_CLIENT_ID: Optional[str] = None
    NOTION_CLIENT_SECRET: Optional[SecretStr] = None
    NOTION_REDIRECT_URI: str = "http://localhost:8000/auth/notion/callback"
    
    # OAuth - Apple
    APPLE_CLIENT_ID: Optional[str] = None
    APPLE_CLIENT_SECRET: Optional[SecretStr] = None
    APPLE_REDIRECT_URI: str = "http://localhost:8000/auth/apple/callback"
    
    # OAuth - Facebook
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[SecretStr] = None
    FACEBOOK_REDIRECT_URI: str = "http://localhost:8000/auth/facebook/callback"
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "firebase_service_account.json"
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", pattern="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v):
        """Ensure SECRET_KEY is strong"""
        if v is None:
            raise ValueError(
                "SECRET_KEY must be set in environment variables. "
                "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
        if isinstance(v, str) and len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v):
        """Ensure using PostgreSQL in production"""
        if "sqlite" in v.lower():
            import warnings
            warnings.warn(
                "SQLite is not recommended for production. Use PostgreSQL instead.",
                UserWarning
            )
        return v
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    def get_secret_key(self) -> str:
        """Get the actual secret key string"""
        return self.SECRET_KEY.get_secret_value()
    
    def get_openai_key(self) -> Optional[str]:
        """Get OpenAI API key if set"""
        return self.OPENAI_API_KEY.get_secret_value() if self.OPENAI_API_KEY else None
    
    def get_deepl_key(self) -> Optional[str]:
        """Get DeepL API key if set"""
        return self.DEEPL_API_KEY.get_secret_value() if self.DEEPL_API_KEY else None


# Create settings instance
# This will automatically load from .env and validate
try:
    settings = Settings()
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    print("\n📝 Required environment variables:")
    print("  - SECRET_KEY (min 32 chars)")
    print("  - DATABASE_URL (PostgreSQL recommended)")
    print("\n💡 Generate a SECRET_KEY:")
    print("  python -c 'import secrets; print(secrets.token_urlsafe(32))'")
    raise


# Helper function to generate secure keys
def generate_secret_key() -> str:
    """Generate a secure random key"""
    return secrets.token_urlsafe(32)


if __name__ == "__main__":
    # Generate a new secret key
    print("Generated SECRET_KEY:")
    print(generate_secret_key())

