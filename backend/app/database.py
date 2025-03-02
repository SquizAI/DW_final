from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variables
# For local testing, use SQLite if PostgreSQL connection fails
try:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    # Test if PostgreSQL is available
    if DATABASE_URL.startswith("postgresql"):
        import psycopg2
        # If import succeeds but we want to use SQLite anyway for testing
        if os.getenv("USE_SQLITE_FOR_TESTING", "true").lower() == "true":
            DATABASE_URL = "sqlite:///./app.db"
except ImportError:
    # If psycopg2 is not available, fall back to SQLite
    DATABASE_URL = "sqlite:///./app.db"
    print("PostgreSQL driver not available, falling back to SQLite")

# Force SQLite for local development
DATABASE_URL = "sqlite:///./app.db"
print(f"Using database URL: {DATABASE_URL}")

DATABASE_ECHO = os.getenv("DATABASE_ECHO", "true").lower() == "true"

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, 
    echo=DATABASE_ECHO,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 