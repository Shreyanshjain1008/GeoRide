# GeoRide – Real-Time Ride Booking Website (FastAPI + React + Stripe)

GeoRide is a modern full-stack ride-booking web application built with FastAPI, React (Vite), Stripe Payments, SQLModel, and Leaflet Maps.
Users can search locations, estimate fares, book rides, and pay securely using Stripe — all in real time.

# Features:

🧭 Ride Booking

• Search pickup and drop locations using OpenStreetMap Nominatim API

• Auto-suggestions with debounce optimization

• Real-time ride assignment

💳 Integrated Payments (Stripe)

• Secure card payments with Stripe Payment Intent API

• Works with INR (₹) using Stripe

• Payment required before confirming ride

🗺️ Interactive Maps (Leaflet)

• Live pickup & drop visualization

• Auto-fit map bounds

• Clean & responsive UI

🔐 Authentication

# User login / registration

• JWT-based authentication

• Password hashing using Passlib + bcrypt

# 🧩 Modern Frontend

• Vite + React

• Dark UI theme

• Smooth animations & custom UX elements

• Swipe-down payment animation

• Dashboard and Entry page animations (GIFs)

# 🛠️ Tech Stack:

--> 1.Frontend

• React (Vite)

• Stripe.js + @stripe/react-stripe-js

• Leaflet.js

• Modern CSS (custom)

• Vite environment variables

--> 2. Backend

• FastAPI

• SQLModel + SQLAlchemy

• JWT authentication

• Stripe Python SDK

• SQLite database

• CORS enabled

# 📁 Project Structure

GeoRide/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── payments.py
│   │   ├── auth.py
│   │   ├── rides.py
│   │   └── utils/
│   ├── venv/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── .env
│   └── package.json
│
└── README.md

# ⚙️ Environment Variables
--> Backend .env

STRIPE_SECRET_KEY=sk_test_**********************
JWT_SECRET=my_jwt_secret

--> Frontend .env

VITE_API_BASE= http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_*********************

# 🔧 Installation & Setup

-->🖥️ Backend Setup

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs at:

http://localhost:8000

--> 🌐 Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs at:   http://localhost:5173

# 💳 Stripe Test Cards

4242 4242 4242 4242
Expiry: Any future date
CVV: 123

# 🎥 Live Animations Included

• Dashboard GIF on dashboard page

• Entry GIF beside “Book a Ride”

• Swipe-down payment animation on payment page

# 🧪 Testing

Check backend status:  http://localhost:8000/docs


# Use Swagger to test:

• Authentication

• Ride estimation

• Payment Intent

• Ride confirmation

# 🚀 Future Enhancements

• Live driver tracking

• Push notifications

• Ride history page

• Profiles & settings

• Google Maps integration

# 🧑‍💻 Author

Shreyansh Jain
Backend Developer • AI & ML • Full-Stack Projects

⭐ Support

If you like this project, consider ⭐ starring the repo!