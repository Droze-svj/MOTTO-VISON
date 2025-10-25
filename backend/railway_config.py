"""
Railway Deployment Configuration
Auto-configures app for Railway environment
"""

import os
from pathlib import Path

def configure_for_railway():
    """Configure application for Railway deployment"""
    
    # Check if running on Railway
    if not os.getenv('RAILWAY_ENVIRONMENT'):
        return False
    
    print("🚂 Configuring for Railway deployment...")
    
    # Set up environment variables
    config = {
        'ENVIRONMENT': 'staging',
        'DEBUG': 'false',
        'LOG_LEVEL': 'INFO',
    }
    
    # Auto-configure database if Railway PostgreSQL plugin is used
    if os.getenv('DATABASE_URL'):
        # Railway provides DATABASE_URL automatically
        print(f"✅ Database URL configured: {os.getenv('DATABASE_URL')[:30]}...")
    else:
        # Use SQLite as fallback
        db_path = Path(__file__).parent / 'tokens.db'
        os.environ['DATABASE_URL'] = f'sqlite+aiosqlite:///{db_path}'
        print(f"✅ Using SQLite database")
    
    # Ensure SECRET_KEY is set
    if not os.getenv('SECRET_KEY'):
        print("⚠️  WARNING: SECRET_KEY not set!")
        print("   Set it with: railway variables set SECRET_KEY=<your-key>")
        print("   Generate key with: python setup_db.py generate-key")
        return False
    
    print("✅ SECRET_KEY configured")
    
    # Configure allowed origins
    if not os.getenv('ALLOWED_ORIGINS'):
        railway_url = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
        if railway_url:
            os.environ['ALLOWED_ORIGINS'] = f'https://{railway_url},http://localhost:8081'
            print(f"✅ CORS configured for: {railway_url}")
    
    # Set port from Railway
    port = os.getenv('PORT', '8000')
    print(f"✅ Port configured: {port}")
    
    print("🚂 Railway configuration complete!")
    return True

if __name__ == '__main__':
    if configure_for_railway():
        print("\n✅ Ready for Railway deployment!")
    else:
        print("\n⚠️  Not running on Railway or configuration incomplete")

