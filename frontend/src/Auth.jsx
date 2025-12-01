import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function register() {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
      alert("Registered! Now login.");
    } else {
      alert("Registration failed.");
    }
  }

  async function login() {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) return alert("Invalid login");

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    onLogin();
  }

  return (
    <div style={{ padding: 20, maxWidth: 320, margin: "auto" }}>
      <h2>GeoRide Login</h2>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password"
             onChange={(e) => setPassword(e.target.value)} />

      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>
    </div>
  );
}
