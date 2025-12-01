import React, { useState, useEffect } from "react";
import "./auth.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const RAW_API_BASE = import.meta.env.VITE_API_BASE;
  const API_BASE =
    typeof RAW_API_BASE === "string" &&
    RAW_API_BASE &&
    RAW_API_BASE !== "undefined"
      ? RAW_API_BASE.replace(/\/$/, "")
      : "http://localhost:8000";

  function buildApi(path) {
    return `${API_BASE}/${path.replace(/^\//, "")}`;
  }

  useEffect(() => {
    console.log("Resolved API_BASE:", API_BASE);
  }, []);

  async function handleRegister() {
    if (!name || !email || !password) return alert("Please fill all fields.");
    setBusy(true);
    try {
      const res = await fetch(buildApi("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Register failed (${res.status})`);
      }
      alert("Registered — please login");
      setMode("login");
      setName("");
      setPassword("");
      setEmail("");
    } catch (e) {
      alert(e.message || "Register error");
      console.error("Register error:", e);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) return alert("Enter email & password");
    setBusy(true);
    try {
      const res = await fetch(buildApi("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Invalid credentials (${res.status})`);
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onLogin();
    } catch (e) {
      alert(e.message || "Login error");
      console.error("Login error:", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-root centered">
      <div className="auth-card modern" role="main" aria-label="Authentication card">
        <div className="auth-left modern-left">
          <div>
            <div className="brand">GeoRide</div>
            <p className="tag">Rides that follow your route.</p>
            <div className="left-cta" style={{ marginTop: 12 }}>
              {mode === "login" ? (
                <>
                  <div className="muted small">New here?</div>
                  <button
                    className="ghost small"
                    onClick={() => setMode("register")}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  <div className="muted small">Already have an account?</div>
                  <button
                    className="ghost small"
                    onClick={() => setMode("login")}
                  >
                    Back to login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="auth-right modern-right">
          <div className="auth-header">
            <h3 style={{ margin: 0 }}>{mode === "login" ? "Welcome back" : "Create account"}</h3>
            <p className="muted" style={{ marginTop: 6 }}>
              {mode === "login" ? "Sign in to access GeoRide" : "Fill details to create an account"}
            </p>
          </div>

          <div className="form" role="form">
            {mode === "register" && (
              <>
                <label htmlFor="name">Name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </>
            )}

            <label htmlFor="email">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />

            <div className="row-between" style={{ marginTop: 8 }}>
              {mode === "login" && <label className="small"><input type="checkbox" /> Remember me</label>}
              <div />
            </div>

            <div style={{ marginTop: 14 }}>
              {mode === "login" ? (
                <button className="primary" onClick={handleLogin} disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              ) : (
                <button className="primary" onClick={handleRegister} disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="auth-foot">Built with ❤️ • GeoRide</footer>
    </div>
  );
}
