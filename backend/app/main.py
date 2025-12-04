# GeoRide/backend/app/main.py
from dotenv import load_dotenv
load_dotenv()   # load .env
from .rides import router as rides_router
from .payments import router as payments_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db, SessionLocal
from .models import User, Driver, Ride
from .auth import router as auth_router

app = FastAPI(title="GeoRide")
app.include_router(rides_router, prefix="/api/rides")
app.include_router(payments_router, prefix="/api/payments")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "https://geo-ride.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create DB
init_db()

# auth routes
app.include_router(auth_router, prefix="/api/auth")

@app.get("/")
def read_root():
    return {"message": "GeoRide backend up"}