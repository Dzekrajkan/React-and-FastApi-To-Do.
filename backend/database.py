# backend/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# берем DATABASE_URL из .env или дефолт (локально)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://to_do_admin:30032009Aa@localhost:5432/to_do"
)

# Если запускаешь в Docker, в .env укажи host как db и DATABASE_URL должно содержать db
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
