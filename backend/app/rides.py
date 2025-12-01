# backend/app/rides.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")  # adjust if different

class EstimateResp(BaseModel):
    distance_meters: int
    duration_secs: int
    fare_estimate: float

class RideRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    # optional human-friendly addresses
    pickup_addr: Optional[str] = None
    drop_addr: Optional[str] = None
    # client may optionally provide a fare estimate (in rupees)
    fare_estimate: Optional[float] = None

class RideResp(BaseModel):
    id: int
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    driver: Optional[dict] = None
    status: str
    fare_amount: Optional[int] = None        # paise (smallest unit)
    fare_estimate: Optional[float] = None    # rupees (for display)

# helper: compute fare (same formula used by /estimate)
def compute_fare_rupees(o_lat, o_lng, d_lat, d_lng):
    import math
    km = math.hypot(d_lat - o_lat, d_lng - o_lng) * 111  # approx deg->km
    meters = int(km * 1000)
    # base + per km
    fare = round(30 + (meters/1000) * 15, 2)
    return meters, max(60, int(meters / 5)), fare


@router.get("/estimate", response_model=EstimateResp)
def estimate(origin: str, dest: str):
    # origin & dest expected as "lat,lng"
    try:
        o_lat, o_lng = map(float, origin.split(","))
        d_lat, d_lng = map(float, dest.split(","))
    except Exception:
        raise HTTPException(status_code=400, detail="origin & dest must be lat,lng")

    meters, secs, fare = compute_fare_rupees(o_lat, o_lng, d_lat, d_lng)
    return {"distance_meters": meters, "duration_secs": secs, "fare_estimate": fare}



@router.post("/request", response_model=RideResp, status_code=201)
def request_ride(payload: RideRequest, token: str = Depends(oauth2)):
    # NOTE: This is a demo. In your real app you should verify token -> user.
    # Compute/normalize fare estimate (in rupees) if not provided
    try:
        if payload.fare_estimate is not None:
            # client may send rupees (typical). Use as rupees.
            fare_rupees = float(payload.fare_estimate)
            # defensive: if client accidentally sent paise (very large), convert heuristically
            if fare_rupees >= 1000:
                # looks like paise: convert to rupees
                fare_rupees = fare_rupees / 100.0
        else:
            # compute using coordinates
            _, _, fare_rupees = compute_fare_rupees(
                payload.pickup_lat, payload.pickup_lng, payload.drop_lat, payload.drop_lng
            )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid fare estimate or coordinates")

    # convert rupees -> paise (integer)
    fare_paise = int(round(fare_rupees * 100))

    # Simulate creating a ride and assigning a nearby driver:
    ride_id = 123  # generate or DB insert in your real code
    driver = {"id": 5, "name": "Ramesh", "lat": payload.pickup_lat + 0.003, "lng": payload.pickup_lng + 0.003}

    ride = {
        "id": ride_id,
        "pickup_lat": payload.pickup_lat,
        "pickup_lng": payload.pickup_lng,
        "drop_lat": payload.drop_lat,
        "drop_lng": payload.drop_lng,
        "driver": driver,
        "status": "assigned",
        "fare_amount": fare_paise,       # paise
        "fare_estimate": round(fare_rupees, 2)  # rupees for display
    }

    return ride
