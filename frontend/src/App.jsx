import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Entry from "./components/Entry";
import MapView from "./components/MapView";
import Payment from "./components/Payment";
import "./components/auth.css";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [ride, setRide] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      if (window.location.pathname === "/login" || window.location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setRide(null);
    navigate("/login", { replace: true });
  };

  const handleRideAssigned = (r) => {
    setRide(r);
    // navigate to ride view (use route with id)
    if (r && r.id) navigate(`/ride/${r.id}`);
    else navigate("/ride");
  };

  const handleLoginSuccess = () => {
    setLoggedIn(true);
    navigate("/dashboard", { replace: true });
  };

  return (
    <Routes>
      {/* Public: login */}
      <Route
        path="/login"
        element={<Login onLogin={handleLoginSuccess} />}
      />

      {/* Protected: dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard
              onLogout={handleLogout}
              onStartRide={() => navigate("/entry")}
            />
          </PrivateRoute>
        }
      />

      {/* Protected: entry (book a ride) */}
      <Route
        path="/entry"
        element={
          <PrivateRoute>
            <Entry
              onLogout={handleLogout}
              onRideAssigned={handleRideAssigned}
            />
          </PrivateRoute>
        }
      />

      {/* Protected: map / ride view (uses ride state if available) */}
      <Route
        path="/ride/:rideId"
        element={
          <PrivateRoute>
            <MapView fare={ride?.fare_estimate ?? ride?.fare ?? 0} ride={ride} />
          </PrivateRoute>
        }
      />

      {/* Protected: payment view for a ride */}
      <Route
        path="/payment/:rideId"
        element={
          <PrivateRoute>
            <Payment
              ride={ride}
              onPaid={() => {
                alert("Payment successful — ride confirmed!");
                // optionally clear ride or reload rides
                setRide(null);
                navigate("/dashboard");
              }}
            />
          </PrivateRoute>
        }
      />

      {/* catch-all: go to dashboard if logged in, else login */}
      <Route
        path="*"
        element={loggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
