import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class SecurityConfig:
    # Encryption settings
    ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key())
    SALT = os.environ.get('SALT', os.urandom(16))
    ITERATIONS = 100000
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', os.urandom(32))
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION = 24  # hours
    
    # Rate limiting
    RATE_LIMIT = {
        'login': '5 per minute',
        'chat': '60 per minute',
        'api': '200 per day'
    }
    
    # Password policy
    PASSWORD_POLICY = {
        'min_length': 12,
        'require_uppercase': True,
        'require_lowercase': True,
        'require_numbers': True,
        'require_special': True
    }
    
    # Session settings
    SESSION_TIMEOUT = 30 * 60  # 30 minutes
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 15 * 60  # 15 minutes
    
    @classmethod
    def generate_key(cls, password: str) -> bytes:
        """Generate encryption key from password"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=cls.SALT,
            iterations=cls.ITERATIONS
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))
    
    @classmethod
    def validate_password(cls, password: str) -> bool:
        """Validate password against policy"""
        if len(password) < cls.PASSWORD_POLICY['min_length']:
            return False
        if cls.PASSWORD_POLICY['require_uppercase'] and not any(c.isupper() for c in password):
            return False
        if cls.PASSWORD_POLICY['require_lowercase'] and not any(c.islower() for c in password):
            return False
        if cls.PASSWORD_POLICY['require_numbers'] and not any(c.isdigit() for c in password):
            return False
        if cls.PASSWORD_POLICY['require_special'] and not any(not c.isalnum() for c in password):
            return False
        return True
    
    @classmethod
    def get_encryption_key(cls) -> bytes:
        """Get or generate encryption key"""
        if isinstance(cls.ENCRYPTION_KEY, str):
            return base64.urlsafe_b64decode(cls.ENCRYPTION_KEY)
        return cls.ENCRYPTION_KEY 