# GeoRide — Minimal Full‑Stack Ride Booking Starter

GeoRide is a minimal, extendable starter for a ride-booking platform using **FastAPI (Python)** as the backend and **React (Vite)** as the frontend. This template demonstrates essential ride-hailing features such as fare estimation, ride creation, and real‑time tracking.

---

## 🚀 Features

* 🌍 **FastAPI backend** with distance estimation using Haversine formula
* 🗄️ **SQLite + SQLModel** (simple local database)
* 🔌 **WebSocket channels** for rider & driver
* 🗺️ **React + Leaflet map UI**
* 🚗 **Simulated driver movement**
* 📦 Clean project structure

---

## 📁 Project Structure

```
georide/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🛠️ Requirements

* Python **3.11+**
* Node.js **18+**

---

## 🧩 Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
./venv/biScripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at **[http://localhost:8000](http://localhost:8000)**.

---

## 🎨 Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔧 Environment Variables

| Variable        | Purpose                | Default                                        |
| --------------- | ---------------------- | ---------------------------------------------- |
| `DATABASE_URL`  | Override SQLite DB     | sqlite:///./georide.db                         |
| `VITE_API_BASE` | Frontend → Backend URL | [http://localhost:8000](http://localhost:8000) |

---

## 🧪 Demo Flow

1. Enter pickup & drop coordinates
2. Click **Get Estimate**
3. Click **Request Ride** → Creates a ride in DB
4. Click **Simulate Driver** → WebSocket sends live driver location updates

---

## 🧭 Roadmap

* Real driver assignment
* Live navigation UI
* Payment gateway integration
* Notifications
* Admin panel

