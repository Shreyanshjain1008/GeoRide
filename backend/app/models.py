# backend/app/models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="rider", nullable=False)  # 'rider' or 'driver'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rides = relationship("Ride", back_populates="rider", foreign_keys="Ride.rider_id")

class Driver(Base):
    __tablename__ = "driver"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    vehicle = Column(String, nullable=True)
    status = Column(String, default="available", nullable=False)  # available, on_trip, offline
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rides = relationship("Ride", back_populates="driver", foreign_keys="Ride.driver_id")

class Ride(Base):
    __tablename__ = "ride"
    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("driver.id"), nullable=True)

    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    drop_lat = Column(Float, nullable=True)
    drop_lng = Column(Float, nullable=True)

    pickup_address = Column(String, nullable=True)
    drop_address = Column(String, nullable=True)

    distance_meters = Column(Integer, default=0, nullable=False)
    duration_secs = Column(Integer, default=0, nullable=False)
    fare_estimate = Column(Float, default=0.0, nullable=False)
    status = Column(String, default="requested", nullable=False)  # requested, assigned, enroute, completed, cancelled

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rider = relationship("User", back_populates="rides", foreign_keys=[rider_id])
    driver = relationship("Driver", back_populates="rides", foreign_keys=[driver_id])
