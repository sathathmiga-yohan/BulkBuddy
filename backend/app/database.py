from sqlalchemy import create_engine, URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# DATABASE URL

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=settings.DATABASE_USER,
    password=settings.DATABASE_PASSWORD,
    host=settings.DATABASE_HOST,
    port=settings.DATABASE_PORT,
    database=settings.DATABASE_NAME,
)

# DATABASE ENGINE

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# DATABASE SESSION

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# BASE CLASS FOR MODELs

class Base(DeclarativeBase):
    pass

# DATABASE DEPENDENCY

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()