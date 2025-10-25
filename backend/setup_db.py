"""
Database Setup Utility
Run this to initialize or reset the database
"""

import asyncio
import sys
from sqlalchemy import text

from database import engine, AsyncSessionLocal, is_sqlite
from models import Base
from config import settings, generate_secret_key

async def create_tables():
    """Create all database tables"""
    print("📊 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created successfully")


async def drop_tables():
    """Drop all database tables"""
    print("⚠️  Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("✅ Tables dropped")


async def check_connection():
    """Check database connection"""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


async def show_tables():
    """Show all tables in database"""
    try:
        async with AsyncSessionLocal() as session:
            if is_sqlite:
                result = await session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            else:
                result = await session.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
            
            tables = result.fetchall()
            if tables:
                print("\n📋 Database Tables:")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("ℹ️  No tables found")
    except Exception as e:
        print(f"❌ Error listing tables: {e}")


async def main():
    """Main setup function"""
    print("=" * 50)
    print("MOTTO-VISON Database Setup")
    print("=" * 50)
    print(f"\n🔧 Environment: {settings.ENVIRONMENT}")
    print(f"🗄️  Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    print()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "init":
            # Initialize database
            if await check_connection():
                await create_tables()
                await show_tables()
        
        elif command == "reset":
            # Reset database (drop and recreate)
            confirm = input("⚠️  This will DELETE ALL DATA. Type 'yes' to confirm: ")
            if confirm.lower() == "yes":
                if await check_connection():
                    await drop_tables()
                    await create_tables()
                    await show_tables()
                    print("\n✅ Database reset complete")
            else:
                print("❌ Reset cancelled")
        
        elif command == "check":
            # Check connection and show tables
            if await check_connection():
                await show_tables()
        
        elif command == "generate-key":
            # Generate a new SECRET_KEY
            key = generate_secret_key()
            print("\n🔑 Generated SECRET_KEY:")
            print(key)
            print("\n💡 Add this to your .env file:")
            print(f"SECRET_KEY={key}")
        
        else:
            print(f"❌ Unknown command: {command}")
            print_help()
    
    else:
        print_help()


def print_help():
    """Print help message"""
    print("""
Available commands:

  python setup_db.py init           Initialize database (create tables)
  python setup_db.py reset          Reset database (drop and recreate all tables)
  python setup_db.py check          Check database connection and list tables
  python setup_db.py generate-key   Generate a new SECRET_KEY

Examples:
  python setup_db.py init
  python setup_db.py check
    """)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

