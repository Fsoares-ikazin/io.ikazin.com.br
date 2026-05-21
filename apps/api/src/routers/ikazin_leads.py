import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import sentry_sdk
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from config.config import get_learnhouse_config

router = APIRouter()

PDF_BYTES = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 87 >>
stream
BT
/F1 24 Tf
72 760 Td
(Guia Build 14 - em breve) Tj
0 -40 Td
/F1 14 Tf
(Ikazin.io lead magnet placeholder) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000378 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
458
%%EOF
"""


class LeadMagnetRequest(BaseModel):
    email: EmailStr
    lang: str = "pt"
    source: str = "blog"
    path: str = ""
    build_number: int = 14
    title: str = "SINAMICS S120"


def _send_lead_magnet_email(payload: LeadMagnetRequest) -> None:
    config = get_learnhouse_config().mailing_config
    if config.email_provider != "smtp" or not config.smtp_host:
        raise HTTPException(status_code=503, detail="SMTP provider is not configured")

    subject = (
        f"Seu guia do Build {payload.build_number} esta pronto"
        if payload.lang == "pt"
        else f"Your Build {payload.build_number} guide is ready"
    )
    body = (
        f"<p>Segue o placeholder do guia do Build {payload.build_number} ({payload.title}).</p>"
        "<p>Versao completa em breve.</p>"
        "<p>- Time Ikazin</p>"
        if payload.lang == "pt"
        else f"<p>Here is the placeholder for Build {payload.build_number} ({payload.title}).</p><p>Full version coming soon.</p><p>- Ikazin team</p>"
    )

    message = MIMEMultipart("mixed")
    message["From"] = f"Ikazin.io <{config.system_email_address}>"
    message["To"] = str(payload.email)
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    attachment = MIMEApplication(PDF_BYTES, _subtype="pdf")
    attachment.add_header("Content-Disposition", "attachment", filename="guia-build-14-placeholder.pdf")
    message.attach(attachment)

    server = None
    try:
        server = smtplib.SMTP(config.smtp_host, config.smtp_port, timeout=15)
        if config.smtp_use_tls:
            server.starttls()
        if config.smtp_username and config.smtp_password:
            server.login(config.smtp_username, config.smtp_password)
        server.sendmail(config.system_email_address, str(payload.email), message.as_string())
    except Exception as exc:
        sentry_sdk.capture_exception(exc)
        raise HTTPException(status_code=503, detail="Could not send lead magnet email") from exc
    finally:
        if server is not None:
            try:
                server.quit()
            except Exception:
                pass


@router.post("/lead-magnet", summary="Send the Ikazin lead magnet email")
async def send_lead_magnet(payload: LeadMagnetRequest) -> dict:
    _send_lead_magnet_email(payload)
    return {"ok": True}
