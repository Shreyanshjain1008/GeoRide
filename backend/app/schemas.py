from pydantic import BaseModel
from typing import Optional


class EstimateResponse(BaseModel):
    distance_meters: int
    duration_secs: int
    fare: float


class RideCreate(BaseModel):
    rider_id: int
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float


class RideResponse(BaseModel):
    id: int
    rider_id: int
    driver_id: Optional[int]
    status: str
    fare_estimate: float