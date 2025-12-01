from sqlmodel import Session, select
import math
from .models import Driver, Ride
from .db import engine

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2*R*math.asin(math.sqrt(a))

def find_nearest_driver(session: Session, pick_lat: float, pick_lng: float, max_meters=5000):
    stmt = select(Driver).where(Driver.available == True)
    drivers = session.exec(stmt).all()
    best = None; best_dist = float('inf')
    for d in drivers:
        dist = haversine(pick_lat, pick_lng, d.lat, d.lng)
        if dist < best_dist and dist <= max_meters:
            best = d; best_dist = dist
    return best, int(best_dist)

def assign_driver(session: Session, ride: Ride):
    driver, dist = find_nearest_driver(session, ride.pickup_lat, ride.pickup_lng)
    if not driver:
        return None
    driver.available = False
    ride.driver_id = driver.id
    ride.status = "assigned"
    session.add(driver); session.add(ride)
    session.commit(); session.refresh(ride)
    return ride
