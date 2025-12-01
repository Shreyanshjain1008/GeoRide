# app/db.py
import os
from typing import Generator, Optional
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./georide.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Create DB tables.
    This tries to support two common patterns you may have in models.py:
    - SQLAlchemy declarative Base named `Base` (Base.metadata.create_all)
    - SQLModel models (SQLModel.metadata.create_all)
    If your models file defines one of these, tables will be created.
    """
    try:
        from .models import Base  # type: ignore
    except Exception:
        Base = None

    if Base is not None:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception:
            pass

    try:
        SQLModel.metadata.create_all(engine)
    except Exception:
        # if this fails, let caller handle or logs will show the issue
        pass

def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a sqlmodel.Session.
    Use like:
        from fastapi import Depends
        def endpoint(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
