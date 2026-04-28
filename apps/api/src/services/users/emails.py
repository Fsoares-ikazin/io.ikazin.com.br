import html
import logging
from typing import Optional
from urllib.parse import quote

from pydantic import EmailStr
from src.db.organizations import OrganizationRead
from src.db.users import UserRead
from src.services.email.utils import send_email

logger = logging.getLogger(__name__)


# Hosted Ikazin.io logo for email clients.
LOGO_SVG = """<img src="https://io.ikazin.com.br/logo.png" alt="Ikazin.io" width="140" style="display: inline-block; height: auto;" />"""

# Shared email styles matching the platform's design system
STYLES = {
    "body": "margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
    "wrapper": "padding: 48px 24px;",
    "container": "max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;",
    "header": "padding: 48px 48px 0 48px; text-align: center;",
    "content": "padding: 36px 48px 48px 48px; text-align: center;",
    "h1": "margin: 0 0 12px 0; font-size: 22px; font-weight: 900; color: #000000; letter-spacing: -0.02em; line-height: 1.3;",
    "p": "margin: 0 0 20px 0; font-size: 14px; color: rgba(0,0,0,0.45); font-weight: 500; line-height: 1.7;",
    "button": "display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700; line-height: 1;",
    "link_text": "margin: 24px 0 0 0; font-size: 11px; color: rgba(0,0,0,0.2); word-break: break-all; font-weight: 500; line-height: 1.6;",
    "divider": "margin: 28px 0; border: none; border-top: 1px solid #f0f0f0;",
    "footer": "padding: 0 48px 40px 48px; text-align: center;",
    "footer_text": "margin: 0; font-size: 12px; color: rgba(0,0,0,0.2); font-weight: 500; line-height: 1.6;",
    "code": "display: inline-block; padding: 14px 28px; background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 28px; font-weight: 900; letter-spacing: 0.12em; color: #000000; font-family: monospace;",
}


def _email_layout(title: str, body_content: str, footer_note: str = "") -> str:
    """Wrap content in the standard email layout."""
    footer_html = ""
    if footer_note:
        footer_html = f"""
        <div style="{STYLES['footer']}">
            <hr style="{STYLES['divider']}" />
            <p style="{STYLES['footer_text']}">{footer_note}</p>
        </div>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="{STYLES['body']}">
    <div style="{STYLES['wrapper']}">
        <div style="{STYLES['container']}">
            <div style="{STYLES['header']}">
                {LOGO_SVG}
            </div>
            <div style="{STYLES['content']}">
                {body_content}
            </div>
            {footer_html}
        </div>
    </div>
</body>
</html>"""


def send_account_creation_email(
    user: UserRead,
    email: EmailStr,
):
    safe_username = html.escape(user.username)

    body_content = f"""
        <h1 style="{STYLES['h1']}">Bem-vindo, {safe_username}!</h1>
        <p style="{STYLES['p']}">
            Sua conta Ikazin.io está pronta. Comece criando sua própria organização ou entrando em uma existente.
        </p>
        <a href="https://io.ikazin.com.br" style="{STYLES['button']}">
            Começar
        </a>
    """

    return send_email(
        to=email,
        subject=f"Bem-vindo à Ikazin.io, {safe_username}!",
        body=_email_layout(
            title="Bem-vindo",
            body_content=body_content,
            footer_note="Precisa de ajuda? Acesse <a href=\"https://io.ikazin.com.br\" style=\"color: rgba(0,0,0,0.35); text-decoration: underline;\">Ikazin.io</a> para conhecer o básico.",
        ),
    )


def send_password_reset_email(
    generated_reset_code: str,
    user: UserRead,
    organization: OrganizationRead,
    email: EmailStr,
    base_url: str,
):
    safe_username = html.escape(user.username)
    safe_code = html.escape(generated_reset_code)
    safe_email = quote(str(email), safe='')
    safe_code_param = quote(generated_reset_code, safe='')
    reset_url = f"{base_url}/reset?email={safe_email}&amp;resetCode={safe_code_param}"

    body_content = f"""
        <h1 style="{STYLES['h1']}">Redefinir sua senha</h1>
        <p style="{STYLES['p']}">
            Olá {safe_username}, recebemos uma solicitação para redefinir sua senha. Use o código abaixo ou clique no botão.
        </p>
        <div style="margin: 28px 0;">
            <span style="{STYLES['code']}">{safe_code}</span>
        </div>
        <a href="{reset_url}" style="{STYLES['button']}">
            Redefinir Senha
        </a>
    """

    return send_email(
        to=email,
        subject="Redefinir sua senha",
        body=_email_layout(
            title="Redefinir Senha",
            body_content=body_content,
            footer_note="Se você não solicitou a redefinição de senha, ignore este e-mail. Este link expira em breve.",
        ),
    )


def send_password_reset_email_platform(
    generated_reset_code: str,
    user: UserRead,
    email: EmailStr,
    base_url: str,
):
    safe_username = html.escape(user.username)
    safe_code = html.escape(generated_reset_code)
    safe_email = quote(str(email), safe='')
    safe_code_param = quote(generated_reset_code, safe='')
    reset_url = f"{base_url}/reset-password?email={safe_email}&amp;resetCode={safe_code_param}"

    body_content = f"""
        <h1 style="{STYLES['h1']}">Redefinir sua senha</h1>
        <p style="{STYLES['p']}">
            Olá {safe_username}, recebemos uma solicitação para redefinir sua senha. Use o código abaixo ou clique no botão.
        </p>
        <div style="margin: 28px 0;">
            <span style="{STYLES['code']}">{safe_code}</span>
        </div>
        <a href="{reset_url}" style="{STYLES['button']}">
            Redefinir Senha
        </a>
    """

    return send_email(
        to=email,
        subject="Redefinir sua senha",
        body=_email_layout(
            title="Redefinir Senha",
            body_content=body_content,
            footer_note="Se você não solicitou a redefinição de senha, ignore este e-mail. Este link expira em 1 hora.",
        ),
    )


def send_invitation_email(
    email: EmailStr,
    org_name: str,
    inviter_username: str,
    signup_url: str,
    invite_code: Optional[str] = None,
):
    safe_org_name = html.escape(org_name)
    safe_inviter = html.escape(inviter_username)

    code_section = ""
    if invite_code:
        safe_code = html.escape(invite_code)
        code_section = f"""
        <div style="margin: 28px 0;">
            <span style="{STYLES['code']}">{safe_code}</span>
        </div>
        <p style="{STYLES['p']}">
            Use o código de convite acima ou clique no botão abaixo para se cadastrar.
        </p>"""
    else:
        code_section = f"""
        <p style="{STYLES['p']}">
            Clique no botão abaixo para começar.
        </p>"""

    body_content = f"""
        <h1 style="{STYLES['h1']}">Você recebeu um convite!</h1>
        <p style="{STYLES['p']}">
            <strong>@{safe_inviter}</strong> convidou você para entrar em <strong>{safe_org_name}</strong> na Ikazin.io.
        </p>
        {code_section}
        <a href="{signup_url}" style="{STYLES['button']}">
            Entrar em {safe_org_name}
        </a>
    """

    return send_email(
        to=email,
        subject=f"Você recebeu um convite para entrar em {safe_org_name}",
        body=_email_layout(
            title="Convite",
            body_content=body_content,
            footer_note=f"Este convite foi enviado por @{safe_inviter}. Se você não esperava por isso, pode ignorá-lo.",
        ),
    )


def send_role_changed_email(
    email: EmailStr,
    username: str,
    org_name: str,
    new_role_name: str,
):
    """
    Send an email notifying a user that their role has changed in an organization.
    """
    safe_username = html.escape(username)
    safe_org_name = html.escape(org_name)
    safe_role_name = html.escape(new_role_name)

    body_content = f"""
        <h1 style="{STYLES['h1']}">Sua função foi atualizada</h1>
        <p style="{STYLES['p']}">
            Olá {safe_username}, sua função em <strong>{safe_org_name}</strong> foi alterada para <strong>{safe_role_name}</strong>.
        </p>
        <p style="{STYLES['p']}">
            Isso pode afetar o que você pode acessar e gerenciar dentro da organização. Em caso de dúvidas, fale com o administrador da organização.
        </p>
    """

    return send_email(
        to=email,
        subject=f"Sua função em {safe_org_name} foi atualizada",
        body=_email_layout(
            title="Função atualizada",
            body_content=body_content,
            footer_note=f"Você recebeu este e-mail porque sua função foi alterada em {safe_org_name} na Ikazin.io.",
        ),
    )


def send_email_verification_email(
    token: str,
    user: UserRead,
    organization: OrganizationRead | None,
    email: EmailStr,
    base_url: str,
):
    """
    Send email verification email with verification link.

    Args:
        token: Verification token
        user: User receiving the email
        organization: Organization context (can be None for no-org signups)
        email: Email address to send to
        base_url: Base URL for constructing the verification link

    Returns:
        Boolean indicating if email was sent successfully
    """
    safe_username = html.escape(user.username)
    safe_token = quote(token, safe='')
    safe_user_uuid = quote(user.user_uuid, safe='')
    org_uuid = organization.org_uuid if organization else "none"
    safe_org_uuid = quote(org_uuid, safe='')
    verification_url = f"{base_url}/verify-email?token={safe_token}&amp;user={safe_user_uuid}&amp;org={safe_org_uuid}"

    body_content = f"""
        <h1 style="{STYLES['h1']}">Verificar E-mail</h1>
        <p style="{STYLES['p']}">
            Olá {safe_username}, bem-vindo à Ikazin.io! Clique no botão abaixo para verificar seu e-mail e ativar sua conta.
        </p>
        <a href="{verification_url}" style="{STYLES['button']}">
            Verificar E-mail
        </a>
        <p style="{STYLES['link_text']}">
            Ou copie e cole este link:<br />{verification_url}
        </p>
    """

    return send_email(
        to=email,
        subject="Verifique seu e-mail",
        body=_email_layout(
            title="Verificar E-mail",
            body_content=body_content,
            footer_note="Este link expira em 1 hora. Se você não criou uma conta Ikazin.io, pode ignorar este e-mail.",
        ),
    )
