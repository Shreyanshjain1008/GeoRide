import React, { useState, useEffect, useRef } from "react";
import "./auth.css";
import PageShell from "./PageShell";

import entryGif from "./assets/entry.gif";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const NOMINATIM_EMAIL = "shreyanshjain0514@gmail.com";

function debounce(fn, wait = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function Entry({ onLogout, onRideAssigned }) {
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropQuery, setDropQuery] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const fetchPlace = async (q, setResult) => {
    if (!q || q.trim().length < 2) {
      setResult([]);
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&addressdetails=1&limit=6&email=${encodeURIComponent(
        NOMINATIM_EMAIL
      )}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) return setResult([]);
      const data = await res.json();
      setResult(data || []);
    } catch (e) {
      setResult([]);
    }
  };

  const debouncedPickup = useRef(
    debounce((q) => fetchPlace(q, setPickupSuggestions), 600)
  ).current;
  const debouncedDrop = useRef(
    debounce((q) => fetchPlace(q, setDropSuggestions), 600)
  ).current;

  useEffect(() => {
    debouncedPickup(pickupQuery);
  }, [pickupQuery, debouncedPickup]);

  useEffect(() => {
    debouncedDrop(dropQuery);
  }, [dropQuery, debouncedDrop]);

  function pickSuggestion(sugg, isPickup = true) {
    const obj = {
      lat: parseFloat(sugg.lat),
      lng: parseFloat(sugg.lon),
      display_name: sugg.display_name,
    };
    if (isPickup) {
      setPickup(obj);
      setPickupQuery(sugg.display_name);
      setPickupSuggestions([]);
    } else {
      setDrop(obj);
      setDropQuery(sugg.display_name);
      setDropSuggestions([]);
    }
  }

  async function estimateRide() {
    if (!pickup || !drop) return alert("Select pickup & drop from suggestions first.");
    setEstimating(true);
    setEstimate(null);
    try {
      const origin = `${pickup.lat},${pickup.lng}`;
      const dest = `${drop.lat},${drop.lng}`;
      const res = await fetch(`${API_BASE}/api/rides/estimate?origin=${origin}&dest=${dest}`);
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Estimate failed (${res.status})`);
      }
      const data = await res.json();
      setEstimate(data);
    } catch (e) {
      alert("Estimate error: " + (e.message || e));
    } finally {
      setEstimating(false);
    }
  }

  async function requestRide() {
    if (!pickup || !drop) return alert("Select pickup & drop first.");
    setRequesting(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        drop_lat: drop.lat,
        drop_lng: drop.lng,
      };

      if (estimate && (estimate.fare_estimate || estimate.fare)) {
        body.fare_estimate = estimate.fare_estimate ?? estimate.fare;
      }

      const res = await fetch(`${API_BASE}/api/rides/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        throw new Error("Unauthorized — please login again.");
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Request failed (${res.status})`);
      }

      const ride = await res.json();
      if (onRideAssigned) onRideAssigned(ride);
    } catch (e) {
      alert("Request error: " + (e.message || e));
    } finally {
      setRequesting(false);
    }
  }

  return (
    <PageShell title="GeoRide" closeTo="/dashboard">
      <div className="entry-root">
        <main className="entry-main">
          <section className="card big">
            <h2>Book a ride</h2>
            <p className="muted">Search addresses or paste coordinates.</p>

            <div className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <input
                  placeholder="Pickup — start typing address or paste lat,lng"
                  value={pickupQuery}
                  onChange={(e) => { setPickupQuery(e.target.value); setPickup(null); }}
                />
                {pickupSuggestions.length > 0 && (
                  <ul style={{ position: "absolute", left: 0, right: 0, top: "100%", background: "#021428", zIndex: 40, padding: 8, borderRadius: 8 }}>
                    {pickupSuggestions.map((s) => (
                      <li key={s.place_id} style={{ padding: "6px 8px", cursor: "pointer" }} onClick={() => pickSuggestion(s, true)}>
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <input
                  placeholder="Drop — start typing address or paste lat,lng"
                  value={dropQuery}
                  onChange={(e) => { setDropQuery(e.target.value); setDrop(null); }}
                />
                {dropSuggestions.length > 0 && (
                  <ul style={{ position: "absolute", left: 0, right: 0, top: "100%", background: "#021428", zIndex: 40, padding: 8, borderRadius: 8 }}>
                    {dropSuggestions.map((s) => (
                      <li key={s.place_id} style={{ padding: "6px 8px", cursor: "pointer" }} onClick={() => pickSuggestion(s, false)}>
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="primary" onClick={estimateRide} disabled={estimating}>
                  {estimating ? "Estimating…" : "Estimate fare"}
                </button>
                <button className="primary" onClick={requestRide} disabled={requesting}>
                  {requesting ? "Requesting…" : "Request ride"}
                </button>
              </div>

              {estimate && (
                <div style={{ marginTop: 12 }}>
                  <strong>Estimate:</strong>
                  <div className="muted">Distance: {estimate.distance_meters ?? estimate.distance} meters</div>
                  <div className="muted">Duration: {estimate.duration_secs ?? estimate.duration} secs</div>
                  <div className="muted">Fare: {estimate.fare_estimate ?? estimate.fare}</div>
                </div>
              )}
            </div>

            {/* GIF on the right side (no behavior changes) */}
            <div className="entry-anim">
              <img src={entryGif} alt="Entry animation" />
            </div>

          </section>

          <section className="card">
            <h3>Your recent rides</h3>
            <ul className="list">
              <li>Ride #1 — 2.4 km — ₹56</li>
              <li>Ride #2 — 5.1 km — ₹120</li>
              <li>Ride #3 — 1.3 km — ₹34</li>
            </ul>
          </section>
        </main>

        <aside className="entry-side">
          <div className="card small">
            <h4>Driver nearby</h4>
            <p className="muted">Driver Ramesh — 4 min away</p>
            <button className="ghost">Track</button>
          </div>

          <div className="card small">
            <h4>Promotions</h4>
            <p className="muted">Use code GEO10 for 10% off</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
