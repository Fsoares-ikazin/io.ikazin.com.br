"""
Meta WhatsApp Business Cloud API client.

Sends transactional WhatsApp messages on platform events:
  - course_enrolled    → welcome message
  - course_completed   → congratulations + certificate link
  - certificate_claimed → certificate issued
  - member_joined      → org welcome

Phone numbers are stored in user.profile["phone_number"] (E.164 format, e.g. +5511999999999).
"""

import logging
import httpx
from typing import Optional
from config.config import get_learnhouse_config

logger = logging.getLogger(__name__)

META_API_VERSION = "v20.0"
META_API_BASE = f"https://graph.facebook.com/{META_API_VERSION}"


def _get_config():
    cfg = get_learnhouse_config()
    wc = getattr(cfg, "whatsapp_config", None)
    if not wc:
        return None, None
    token = getattr(wc, "meta_access_token", None)
    phone_id = getattr(wc, "meta_phone_number_id", None)
    if not token or not phone_id:
        return None, None
    return token, phone_id


def _build_text_message(to: str, body: str) -> dict:
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": body},
    }


def _build_template_message(to: str, template_name: str, lang: str, components: list) -> dict:
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": lang},
            "components": components,
        },
    }


async def send_whatsapp_message(to: str, payload: dict) -> bool:
    """POST message payload to Meta Cloud API. Returns True on success."""
    token, phone_id = _get_config()
    if not token or not phone_id:
        logger.debug("WhatsApp not configured — skipping notification to %s", to)
        return False

    url = f"{META_API_BASE}/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                logger.info("WhatsApp sent to %s", to)
                return True
            else:
                logger.warning("WhatsApp API error %s: %s", resp.status_code, resp.text[:200])
                return False
    except Exception as exc:
        logger.error("WhatsApp send failed for %s: %s", to, exc)
        return False


# ---------------------------------------------------------------------------
# Event handlers — called from the notifications router
# ---------------------------------------------------------------------------

async def notify_course_enrolled(phone: str, username: str, course_name: str, org_name: str) -> bool:
    body = (
        f"Olá, {username}! 👋\n\n"
        f"Sua matrícula no curso *{course_name}* foi confirmada.\n\n"
        f"Acesse agora: https://io.ikazin.com.br\n\n"
        f"_Ikazin.io — {org_name}_"
    )
    return await send_whatsapp_message(phone, _build_text_message(phone, body))


async def notify_course_completed(phone: str, username: str, course_name: str) -> bool:
    body = (
        f"🎉 Parabéns, {username}!\n\n"
        f"Você concluiu o curso *{course_name}*.\n\n"
        f"Acesse seu certificado em: https://io.ikazin.com.br/account\n\n"
        f"_Ikazin.io_"
    )
    return await send_whatsapp_message(phone, _build_text_message(phone, body))


async def notify_certificate_claimed(phone: str, username: str, course_name: str, cert_uuid: str) -> bool:
    verify_url = f"https://io.ikazin.com.br/certificates/{cert_uuid}/verify"
    body = (
        f"🏆 Certificado emitido, {username}!\n\n"
        f"Curso: *{course_name}*\n\n"
        f"Verificar certificado: {verify_url}\n\n"
        f"_Ikazin.io_"
    )
    return await send_whatsapp_message(phone, _build_text_message(phone, body))


async def notify_member_joined(phone: str, username: str, org_name: str) -> bool:
    body = (
        f"Bem-vindo à *{org_name}*, {username}! 🚀\n\n"
        f"Explore os cursos disponíveis: https://io.ikazin.com.br\n\n"
        f"Dúvidas? suporte@ikazin.com.br\n\n"
        f"_Ikazin.io_"
    )
    return await send_whatsapp_message(phone, _build_text_message(phone, body))
