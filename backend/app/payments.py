# payments.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import stripe
import logging

logger = logging.getLogger("uvicorn.error")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")  

router = APIRouter()

class CreatePaymentIntentRequest(BaseModel):
    amount: int                   # in paise (INR) or cents (USD)
    currency: str = "inr"         # default INR

@router.post("/create-payment-intent")
async def create_payment_intent(payload: CreatePaymentIntentRequest):
    logger.info(f"create_payment_intent called with: {payload}")

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be > 0")

    try:
        intent = stripe.PaymentIntent.create(
            amount=payload.amount,      # integer amount
            currency=payload.currency,
        )
        return {
            "client_secret": intent.client_secret,
            "clientSecret": intent.client_secret
        }

    except stripe.error.StripeError as e:
        logger.exception("Stripe error")
        raise HTTPException(status_code=400, detail=str(e))
