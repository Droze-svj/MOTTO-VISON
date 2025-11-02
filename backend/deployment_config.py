"""
Deployment Configuration Helper
Generates configuration for different deployment platforms
"""

import os
from pathlib import Path

def get_deployment_config():
    """Get deployment configuration based on environment"""
    env = os.getenv('ENVIRONMENT', 'development')
    
    config = {
        'development': {
            'database_url': os.getenv('DATABASE_URL', 'sqlite:///./motto.db'),
            'debug': True,
            'reload': True,
            'host': '127.0.0.1',
            'port': 8000,
        },
        'staging': {
            'database_url': os.getenv('DATABASE_URL'),
            'debug': False,
            'reload': False,
            'host': '0.0.0.0',
            'port': int(os.getenv('PORT', 8000)),
        },
        'production': {
            'database_url': os.getenv('DATABASE_URL'),
            'debug': False,
            'reload': False,
            'host': '0.0.0.0',
            'port': int(os.getenv('PORT', 8000)),
        }
    }
    
    return config.get(env, config['development'])


def generate_railway_config():
    """Generate Railway-specific configuration"""
    return {
        'build': {
            'builder': 'NIXPACKS',
        },
        'deploy': {
            'startCommand': 'cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT',
            'restartPolicyType': 'ON_FAILURE',
            'restartPolicyMaxRetries': 10,
        }
    }


def generate_render_config():
    """Generate Render-specific configuration"""
    return {
        'buildCommand': 'cd backend && pip install -r requirements.txt',
        'startCommand': 'cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT',
        'envVars': [
            'DATABASE_URL',
            'SECRET_KEY',
            'SENTRY_DSN',
            'ENVIRONMENT',
        ]
    }


def check_required_env_vars():
    """Check if all required environment variables are set"""
    required = [
        'SECRET_KEY',
        'DATABASE_URL',
    ]
    
    missing = []
    for var in required:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    return True


if __name__ == '__main__':
    # Generate configs
    print("Deployment Configuration")
    print("=" * 50)
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Config: {get_deployment_config()}")
    print("\nRailway Config:")
    print(generate_railway_config())
    print("\nRender Config:")
    print(generate_render_config())
    
    # Check environment
    try:
        check_required_env_vars()
        print("\n✅ All required environment variables are set")
    except ValueError as e:
        print(f"\n⚠️  {e}")

