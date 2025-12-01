import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";

export default function CheckoutForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardStyleOptions = {
    style: {
      base: {
        color: "#ffffff",
        fontSize: "16px",
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        "::placeholder": { color: "#cccccc" },
      },
      invalid: {
        color: "#ff8080",
      },
    },
    hidePostalCode: true,
  };

  useEffect(() => {
    console.log("[CheckoutForm] mounted with clientSecret:", clientSecret);
    setTimeout(() => {
      try {
        const card = elements?.getElement(CardElement);
        if (card && typeof card.focus === "function") card.focus();
      } catch (_) {}
    }, 300);
  }, [clientSecret, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    if (!stripe || !elements) {
      setStatus("Stripe failed to load.");
      setLoading(false);
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setStatus("Card input not found.");
      setLoading(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        console.error("[Stripe Error]:", result.error);
        setStatus(result.error.message || "Payment failed.");
        setLoading(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        setStatus("Payment successful! 🚀");
        setLoading(false);
        onSuccess?.(result.paymentIntent);
        return;
      }

      setStatus("Payment not completed.");
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Unexpected payment error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 12, maxWidth: 520, background: "#071022", color: "#fff" }}>
      <h4 style={{ marginTop: 0 }}>Pay to confirm ride</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "10px 0" }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.15)", padding: 12, borderRadius: 6, background: "transparent" }}>
            <CardElement options={cardStyleOptions} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ghost"
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", cursor: "pointer" }}
          >
            Back
          </button>

          <button type="submit" disabled={!stripe || loading} className="primary" style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
            {loading ? "Processing…" : "Pay"}
          </button>
        </div>
      </form>

      {status && (
        <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: status.includes("successful") ? "rgba(0,255,0,0.08)" : "rgba(255,0,0,0.08)", color: status.includes("successful") ? "lightgreen" : "#ffb3b3" }}>
          {status}
        </div>
      )}
    </div>
  );
}
