const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function createPaymentIntent(amount, currency = "inr", options = { unit: "rupees" }) {
  const unit = (options && options.unit) || "rupees";
  const n = Number(amount);
  if (Number.isNaN(n) || n <= 0) {
    throw new Error("amount must be a positive number");
  }

  // Determine paise exactly
  let paise;
  if (unit === "rupees") {
    paise = Math.round(n * 100);
  } else if (unit === "paise") {
    paise = Math.round(n);
  } else {
    throw new Error("Unknown unit, use 'rupees' or 'paise'");
  }

  // Strict sanity checks
  if (!Number.isFinite(paise) || paise <= 0) {
    throw new Error("Computed paise is invalid: " + String(paise));
  }
  // Log what we will send
  console.log("createPaymentIntent -> sending to backend (paise):", paise, "currency:", currency, "original:", amount, "unit:", unit);

  const url = `${API_BASE.replace(/\/$/, "")}/api/payments/create-payment-intent`;
  const body = JSON.stringify({ amount: paise, currency });

  console.log("createPaymentIntent -> POST body:", body);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`createPaymentIntent failed: ${res.status} ${res.statusText} — ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
