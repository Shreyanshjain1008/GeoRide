import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { createPaymentIntent } from "../utils/payments";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const MIN_RUPEES = 50;

function parseRupees(raw) {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "string") {
    const cleaned = raw.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  }
  if (typeof raw === "number") return raw;
  return 0;
}

export default function RidePayment({ amount }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const rupees = parseRupees(amount);
  const displayAmount = rupees > 0 ? rupees : 0;

  const handleRequestRide = async () => {
    setError(null);

    console.log("RidePayment: raw amount prop:", amount);
    console.log("RidePayment: parsed rupees:", rupees);

    if (rupees <= 0) {
      setError("Invalid fare amount. Fare must be greater than 0.");
      return;
    }
    if (rupees < MIN_RUPEES) {
      setError(`Minimum allowed payment is ₹${MIN_RUPEES}. Please increase the fare.`);
      return;
    }

    setLoading(true);
    const paise = Math.round(rupees * 100);
    console.log("RidePayment: paise computed:", paise);

    try {
      const resp = await createPaymentIntent(paise, "inr", { unit: "paise" });
      console.log("RidePayment: createPaymentIntent response:", resp);
      const secret = resp.client_secret || resp.clientSecret;
      if (!secret) throw new Error("Server did not return client secret");
      setClientSecret(secret);
    } catch (err) {
      console.error("RidePayment: createPaymentIntent error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setClientSecret(null);
    setError(null);
  };

  return (
    <div style={{ padding: 12 }}>
      {displayAmount > 0 ? (
        <button onClick={handleRequestRide} disabled={loading}>
          {loading ? "Preparing payment..." : `Request a Ride — Pay ₹${displayAmount}`}
        </button>
      ) : null}

      {error && <div style={{ color: "red", marginTop: 8 }}>Payment error: {error}</div>}

      {clientSecret && (
        <div style={{ marginTop: 12 }}>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} onCancel={handleCancelPayment} />
          </Elements>
        </div>
      )}
    </div>
  );
}
