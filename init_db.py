import os
import sys
from sqlalchemy import create_engine, text
from database import Base, engine, SQLALCHEMY_DATABASE_URL
from models import User, Topic, Quiz, Question, QuizResult

def init_database():
    """Initialize the database with all tables"""
    print("Creating database tables...")
    
    # Drop all existing tables
    Base.metadata.drop_all(bind=engine)
    print("✓ Dropped existing tables")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Created all tables")
    
    # Test the connection based on database type
    try:
        with engine.connect() as conn:
            if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            else:
                result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [row[0] for row in result]
            print(f"✓ Database initialized successfully with tables: {tables}")
    except Exception as e:
        print(f"✗ Error testing database connection: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Initializing AI Quiz Generator Database...")
    print("=" * 50)
    
    if init_database():
        print("\n🎉 Database initialization completed successfully!")
        print("You can now start the application.")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1) 