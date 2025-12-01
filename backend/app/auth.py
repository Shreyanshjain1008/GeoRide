# GeoRide/backend/app/auth.py
import os
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from .db import engine
from .models import User
from pydantic import BaseModel, EmailStr
from passlib.hash import pbkdf2_sha256
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()

# env
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY missing. Add it to .env")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

class RegisterPayload(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

def get_password_hash(password: str):
    return pbkdf2_sha256.hash(password)

def verify_password(plain: str, hashed: str):
    return pbkdf2_sha256.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
def register(payload: RegisterPayload):
    with Session(engine) as session:
        q = select(User).where(User.email == payload.email)
        if session.exec(q).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(name=payload.name, email=payload.email, hashed_password=get_password_hash(payload.password))
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"status":"ok", "user_id": user.id}

@router.post("/login")
def login(payload: LoginPayload):
    with Session(engine) as session:
        q = select(User).where(User.email == payload.email)
        user = session.exec(q).first()
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return {"access_token": token, "token_type":"bearer"}
