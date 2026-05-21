from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from sqlmodel import Session

from src.core.events.database import get_db_session
from src.db.users import PublicUser
from src.security.auth import get_authenticated_user
from src.services.ikazin.access import (
    activate_ikazin_user as activate_ikazin_user_service,
    build_ikazin_welcome_link,
)

router = APIRouter()


class IkazinActivateUserRequest(BaseModel):
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None
    plan: str
    source: str = "manual_admin"
    metadata: Optional[dict[str, Any]] = None
    org_slug: Optional[str] = None
    issue_welcome_link: bool = False
    redirect_to: Optional[str] = None


def _require_superadmin(user: PublicUser) -> None:
    if not getattr(user, "is_superadmin", False):
        raise HTTPException(status_code=403, detail="Superadmin access required")


@router.post("/activate", summary="Assign Ikazin plan and optionally issue a welcome link")
async def activate_ikazin_user(
    payload: IkazinActivateUserRequest,
    request: Request,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    _require_superadmin(current_user)

    user = activate_ikazin_user_service(
        db_session,
        user_id=payload.user_id,
        email=payload.email,
        plan=payload.plan,
        source=payload.source,
        metadata=payload.metadata,
    )

    welcome_url = None
    if payload.issue_welcome_link:
        if not payload.org_slug:
            raise HTTPException(status_code=400, detail="org_slug is required when issue_welcome_link is true")
        welcome_url = build_ikazin_welcome_link(
            request,
            db_session,
            user,
            org_slug=payload.org_slug,
            redirect_to=payload.redirect_to,
        )

    return {
        "ok": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "ikazin_plan": (user.details or {}).get("ikazin_plan"),
        },
        "welcome_url": welcome_url,
    }


@router.get("/plan", summary="List users with active ikazin_plan (superadmin only)")
async def list_ikazin_plans(
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    _require_superadmin(current_user)

    rows = db_session.execute(
        text(
            """
            SELECT id, email, details->>'ikazin_plan' AS plan_tier
            FROM users
            WHERE details->>'ikazin_plan' IS NOT NULL
              AND details->>'ikazin_plan' != 'null'
            ORDER BY email
            """
        )
    ).mappings().all()

    return {"users": [dict(row) for row in rows]}
