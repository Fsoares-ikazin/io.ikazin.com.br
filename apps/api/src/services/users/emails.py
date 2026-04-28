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
        <h1 style="{STYLES['h1']}">Welcome, {safe_username}!</h1>
        <p style="{STYLES['p']}">
            Your Ikazin.io account is ready. Get started by creating your own organization or joining one.
        </p>
        <a href="https://io.ikazin.com.br" style="{STYLES['button']}">
            Get Started
        </a>
    """

    return send_email(
        to=email,
        subject=f"Welcome to Ikazin.io, {safe_username}!",
        body=_email_layout(
            title="Welcome",
            body_content=body_content,
            footer_note="Need help? Visit <a href=\"https://io.ikazin.com.br\" style=\"color: rgba(0,0,0,0.35); text-decoration: underline;\">Ikazin.io</a> to learn the basics.",
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
        <h1 style="{STYLES['h1']}">Reset your password</h1>
        <p style="{STYLES['p']}">
            Hi {safe_username}, we received a request to reset your password. Use the code below or click the button.
        </p>
        <div style="margin: 28px 0;">
            <span style="{STYLES['code']}">{safe_code}</span>
        </div>
        <a href="{reset_url}" style="{STYLES['button']}">
            Reset Password
        </a>
    """

    return send_email(
        to=email,
        subject="Reset your password",
        body=_email_layout(
            title="Reset Password",
            body_content=body_content,
            footer_note="If you didn't request a password reset, you can safely ignore this email. This link will expire shortly.",
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
        <h1 style="{STYLES['h1']}">Reset your password</h1>
        <p style="{STYLES['p']}">
            Hi {safe_username}, we received a request to reset your password. Use the code below or click the button.
        </p>
        <div style="margin: 28px 0;">
            <span style="{STYLES['code']}">{safe_code}</span>
        </div>
        <a href="{reset_url}" style="{STYLES['button']}">
            Reset Password
        </a>
    """

    return send_email(
        to=email,
        subject="Reset your password",
        body=_email_layout(
            title="Reset Password",
            body_content=body_content,
            footer_note="If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.",
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
            Use the invite code above, or click the button below to sign up.
        </p>"""
    else:
        code_section = f"""
        <p style="{STYLES['p']}">
            Click the button below to get started.
        </p>"""

    body_content = f"""
        <h1 style="{STYLES['h1']}">You've been invited!</h1>
        <p style="{STYLES['p']}">
            <strong>@{safe_inviter}</strong> has invited you to join <strong>{safe_org_name}</strong> on Ikazin.io.
        </p>
        {code_section}
        <a href="{signup_url}" style="{STYLES['button']}">
            Join {safe_org_name}
        </a>
    """

    return send_email(
        to=email,
        subject=f"You've been invited to join {safe_org_name}",
        body=_email_layout(
            title="Invitation",
            body_content=body_content,
            footer_note=f"This invitation was sent by @{safe_inviter}. If you weren't expecting this, you can safely ignore it.",
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
        <h1 style="{STYLES['h1']}">Your role has been updated</h1>
        <p style="{STYLES['p']}">
            Hi {safe_username}, your role in <strong>{safe_org_name}</strong> has been changed to <strong>{safe_role_name}</strong>.
        </p>
        <p style="{STYLES['p']}">
            This may affect what you can access and manage within the organization. If you have any questions, please reach out to your organization administrator.
        </p>
    """

    return send_email(
        to=email,
        subject=f"Your role in {safe_org_name} has been updated",
        body=_email_layout(
            title="Role Updated",
            body_content=body_content,
            footer_note=f"You received this email because your role was changed in {safe_org_name} on Ikazin.io.",
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
        <h1 style="{STYLES['h1']}">Verify your email</h1>
        <p style="{STYLES['p']}">
            Hi {safe_username}, welcome to Ikazin.io! Click the button below to verify your email address and activate your account.
        </p>
        <a href="{verification_url}" style="{STYLES['button']}">
            Verify Email Address
        </a>
        <p style="{STYLES['link_text']}">
            Or copy and paste this link:<br />{verification_url}
        </p>
    """

    return send_email(
        to=email,
        subject="Verify your email address",
        body=_email_layout(
            title="Verify Email",
            body_content=body_content,
            footer_note="This link expires in 1 hour. If you didn't create an Ikazin.io account, you can safely ignore this email.",
        ),
    )
