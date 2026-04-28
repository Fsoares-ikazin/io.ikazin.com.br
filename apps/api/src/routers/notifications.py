"""
Notification router — Meta WhatsApp Business Cloud API integration.

Endpoints:
  GET  /notifications/meta/webhook   — Meta verification challenge
  POST /notifications/meta/webhook   — Inbound Meta messages (optional, ack only)
  POST /notifications/webhook        — Receives Ikazin platform webhook events → sends WhatsApp

Configure a webhook in the LMS admin pointing to:
  https://io.ikazin.com.br/api/v1/notifications/webhook
"""

import hmac
import hashlib
import logging
from fastapi import APIRouter, Request, Response, HTTPException, Query
from config.config import get_learnhouse_config
from src.services.notifications.whatsapp import (
    notify_course_enrolled,
    notify_course_completed,
    notify_certificate_claimed,
    notify_member_joined,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_verify_token() -> str:
    cfg = get_learnhouse_config()
    wc = getattr(cfg, "whatsapp_config", None)
    return getattr(wc, "meta_verify_token", "") if wc else ""


def _get_webhook_secret() -> str:
    cfg = get_learnhouse_config()
    wc = getattr(cfg, "whatsapp_config", None)
    return getattr(wc, "ikazin_webhook_secret", "") if wc else ""


def _verify_ikazin_signature(body: bytes, signature_header: str | None, secret: str) -> bool:
    """Verify HMAC-SHA256 signature from Ikazin webhook dispatcher."""
    if not secret:
        return True  # No secret configured — allow (dev mode)
    if not signature_header:
        return False
    expected = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


# ---------------------------------------------------------------------------
# Meta webhook verification (GET)
# ---------------------------------------------------------------------------

@router.get(
    "/meta/webhook",
    summary="Meta WhatsApp webhook verification",
    description="Handles Meta's hub.challenge verification handshake.",
    include_in_schema=False,
)
async def meta_webhook_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    verify_token = _get_verify_token()
    if hub_mode == "subscribe" and hub_verify_token == verify_token:
        logger.info("Meta webhook verified successfully")
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")


# ---------------------------------------------------------------------------
# Meta inbound messages (POST) — just acknowledge
# ---------------------------------------------------------------------------

@router.post(
    "/meta/webhook",
    summary="Meta WhatsApp inbound messages",
    include_in_schema=False,
)
async def meta_webhook_inbound(request: Request):
    # Always return 200 to Meta immediately
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Ikazin platform webhook receiver (POST)
# ---------------------------------------------------------------------------

@router.post(
    "/webhook",
    summary="Receive Ikazin platform events and dispatch WhatsApp notifications",
    description=(
        "Register this URL as a webhook endpoint in the LMS admin panel. "
        "Handles: course_enrolled, course_completed, certificate_claimed, member_joined."
    ),
)
async def platform_webhook_receiver(request: Request):
    body = await request.body()
    sig = request.headers.get("X-LearnHouse-Signature")
    secret = _get_webhook_secret()

    if not _verify_ikazin_signature(body, sig, secret):
        logger.warning("Invalid webhook signature — rejecting")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event")
    data = payload.get("data", {})
    user_data = data.get("user", {})

    # Phone number stored in user.profile.phone_number (E.164: +5511999999999)
    phone: str | None = (
        user_data.get("profile", {}).get("phone_number")
        if isinstance(user_data.get("profile"), dict)
        else None
    )
    username: str = user_data.get("username", "aluno")

    if not phone:
        logger.debug("Event %s: user %s has no phone_number — skipping WhatsApp", event, username)
        return {"status": "skipped", "reason": "no_phone"}

    sent = False

    if event == "course_enrolled":
        course_name = data.get("course", {}).get("name", "curso")
        org_name = data.get("org", {}).get("name", "Ikazin.io")
        sent = await notify_course_enrolled(phone, username, course_name, org_name)

    elif event == "course_completed":
        course_name = data.get("course", {}).get("name", "curso")
        sent = await notify_course_completed(phone, username, course_name)

    elif event == "certificate_claimed":
        course_name = data.get("course", {}).get("name", "curso")
        cert_uuid = data.get("certificate", {}).get("user_certification_uuid", "")
        sent = await notify_certificate_claimed(phone, username, course_name, cert_uuid)

    elif event == "member_joined":
        org_name = data.get("org", {}).get("name", "Ikazin.io")
        sent = await notify_member_joined(phone, username, org_name)

    else:
        logger.debug("Unhandled event type: %s", event)
        return {"status": "ignored", "event": event}

    return {"status": "sent" if sent else "failed", "event": event, "to": phone}
