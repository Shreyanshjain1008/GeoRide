import React from "react";
import "./auth.css";
import PageShell from "./PageShell";

import dashboardGif from "./assets/dashboard.gif";

export default function Dashboard({ onLogout, onStartRide }) {
  return (
    <PageShell title="GeoRide" closeTo="/login">
      <div className="dashboard-root">
        <header className="dashboard-header" style={{ display: "none" }}>
          {/* header intentionally hidden because PageShell provides header */}
        </header>
        <div className="dashboard-title">
          <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        </div>

        <main className="dashboard-main card big">
          <h1 style={{ marginTop: 0 }}>WELCOME</h1>
          <p className="muted">Fast. Reliable. Local rides — ready when you are.</p>

          <div className="dashboard-actions row" style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button className="primary" onClick={onStartRide}>Book a Ride</button>
            <button className="ghost" onClick={() => alert("Profile coming soon")}>Profile</button>
            <button className="ghost" onClick={onLogout}>Logout</button>
          </div>

          <section style={{ marginTop: 18 }}>
            <h4>Your recent rides</h4>
            <ul className="list">
              <li>Ride #1 — 2.4 km — ₹56</li>
              <li>Ride #2 — 5.1 km — ₹120</li>
              <li>Ride #3 — 1.3 km — ₹34</li>
            </ul>
          </section>

          <div className="dashboard-anim">
            <img src={dashboardGif} alt="Dashboard animation" />
          </div>
        </main>
      </div>
    </PageShell>
  );
}
