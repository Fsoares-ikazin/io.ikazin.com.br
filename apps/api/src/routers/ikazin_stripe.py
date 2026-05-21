from __future__ import annotations

import logging
import os

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session

from src.core.events.database import get_db_session
from src.db.users import PublicUser
from src.security.auth import get_authenticated_user
from src.services.ikazin.access import activate_ikazin_plan_from_stripe_checkout
from src.services.ikazin.builds import VALID_TIER_NAMES

router = APIRouter()
logger = logging.getLogger(__name__)

_PRICE_IDS: dict[str, str] = {
    "basic": os.getenv("STRIPE_PRICE_BASIC", ""),
    "essentials": os.getenv("STRIPE_PRICE_ESSENTIALS", ""),
    "advanced": os.getenv("STRIPE_PRICE_ADVANCED", ""),
    "premium": os.getenv("STRIPE_PRICE_PREMIUM", ""),
}


def _client() -> stripe.StripeClient:
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    return stripe.StripeClient(key)


class CheckoutRequest(BaseModel):
    plan: str


def _normalize_plan(plan: str) -> str:
    normalized = plan.strip().lower()
    if normalized not in VALID_TIER_NAMES:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {normalized}")
    return normalized


def _resolve_org_slug() -> str:
    return os.getenv("IKAZIN_DEFAULT_ORG_SLUG", "default").strip() or "default"


def _build_checkout_metadata(current_user: PublicUser, plan: str) -> dict[str, str]:
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "ikazin_plan": plan,
        "org_slug": _resolve_org_slug(),
    }


@router.post("/checkout", summary="Create Stripe Checkout Session for an Ikazin plan")
async def create_checkout_session(
    payload: CheckoutRequest,
    request: Request,
    current_user: PublicUser = Depends(get_authenticated_user),
) -> dict:
    plan = _normalize_plan(payload.plan)

    price_id = _PRICE_IDS.get(plan, "")
    if not price_id:
        raise HTTPException(status_code=503, detail=f"Stripe price not configured for plan: {plan}")

    client = _client()
    base = str(request.base_url).rstrip("/")
    org_slug = _resolve_org_slug()
    success_url = f"{base}/orgs/{org_slug}/welcome?plan={plan}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{base}/planos"

    session = client.v1.checkout.sessions.create(
        params={
            "mode": "payment",
            "line_items": [{"price": price_id, "quantity": 1}],
            "customer_email": current_user.email,
            "metadata": _build_checkout_metadata(current_user, plan),
            "success_url": success_url,
            "cancel_url": cancel_url,
        }
    )
    return {"session_url": session.url}


@router.post("/webhook", summary="Stripe webhook receiver", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(None, alias="stripe-signature"),
    db_session: Session = Depends(get_db_session),
) -> dict:
    key = os.getenv("STRIPE_SECRET_KEY", "")
    secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    if not key:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    if not secret:
        raise HTTPException(status_code=503, detail="Stripe webhook not configured")

    raw_body = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload=raw_body,
            sig_header=stripe_signature or "",
            secret=secret,
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook error")

    event_type = event.get("type")
    if event_type != "checkout.session.completed":
        return {"ok": True, "status": "ignored", "event_type": event_type}

    checkout_session = event["data"]["object"]
    checkout_metadata = dict(checkout_session.get("metadata") or {})
    checkout_metadata["stripe_customer_id"] = checkout_session.get("customer")
    checkout_metadata["stripe_payment_status"] = checkout_session.get("payment_status")

    result = activate_ikazin_plan_from_stripe_checkout(
        db_session,
        event_id=event.get("id"),
        session_id=checkout_session.get("id"),
        metadata=checkout_metadata,
    )
    if result["status"] != "activated":
        logger.warning("Stripe Ikazin webhook finished with status=%s payload=%s", result["status"], result)

    return {"ok": True, **result}
