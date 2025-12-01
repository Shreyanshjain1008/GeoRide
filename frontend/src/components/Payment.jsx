import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import PageShell from "./PageShell";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const stripePromise = loadStripe(STRIPE_PK);

function PaymentForm({ ride, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!ride) return;

    async function createIntent() {
      try {
        let amountPaise = 0;
        if (ride.fare_amount) {
          amountPaise = Number(ride.fare_amount);
        } else if (ride.fare_estimate) {
          const fe = Number(ride.fare_estimate);
          amountPaise = fe >= 1000 ? Math.round(fe) : Math.round(fe * 100);
        }

        console.log("Payment.jsx createIntent: normalized amountPaise =", amountPaise, "ride:", ride);

        if (!amountPaise || amountPaise <= 0) {
          setErr("Invalid fare — cannot initiate payment.");
          return;
        }

        const res = await fetch(`${API_BASE}/api/payments/create-payment-intent`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({
            ride_id: ride.id,
            amount: amountPaise,
            currency: "inr"
          })
        });
        if (!res.ok) {
          const txt = await res.text().catch(()=>null);
          throw new Error(txt || "Failed to create payment");
        }
        const data = await res.json();
        const secret = data.client_secret || data.clientSecret || data.clientSecret;
        if (!secret) throw new Error("No client secret returned from server");
        setClientSecret(secret);
      } catch(e) {
        console.error("Payment.jsx createIntent error:", e);
        setErr(e.message || "Create intent error");
      }
    }
    createIntent();
  }, [ride]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErr("");
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element missing");
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });
      if (error) throw error;
      if (paymentIntent.status !== "succeeded") throw new Error("Payment not successful");
      const res = await fetch(`${API_BASE}/api/payments/confirm-ride`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ride_id: ride.id, payment_intent_id: paymentIntent.id })
      });
      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(txt || "Failed to confirm ride on server");
      }
      onPaid?.(paymentIntent);
    } catch(e) {
      console.error("Payment.jsx handleSubmit error:", e);
      setErr(e.message || "Payment error");
    } finally {
      setLoading(false);
    }
  }

  if (!ride) return null;
  if (err) return <div className="card"><strong>Payment error:</strong> {err}</div>;
  if (!clientSecret) return <div className="card">Preparing payment…</div>;

  return (
    <div className="card" style={{marginTop:12}}>
      <h4>Pay to confirm ride</h4>
      <div className="muted">Amount: {( (ride.fare_amount ?? 0) / 100 ).toFixed(2)} INR</div>
      <form onSubmit={handleSubmit} style={{marginTop:10}}>
        <div style={{padding:'10px 0'}}>
          <CardElement options={{style:{base:{fontSize:'16px', color:'#fff', "::placeholder": { color: "#ccc" }}}}} />
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="primary" type="submit" disabled={!stripe || loading}>
            {loading ? "Processing…" : "Pay & Confirm Ride"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PaymentWrapper(props) {
  return (
    <PageShell title="Payment" closeTo="/ride">
      <Elements stripe={stripePromise}>
        <PaymentForm {...props} />
      </Elements>
    </PageShell>
  );
}
