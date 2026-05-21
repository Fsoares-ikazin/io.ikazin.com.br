from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import HTTPException, Request
from pydantic import EmailStr
from sqlmodel import Session, select

from src.db.organizations import Organization
from src.db.users import User
from src.services.email.utils import get_base_url_from_request
from src.services.ikazin.builds import VALID_TIER_NAMES

_TIER_ORDER = {"basic": 0, "essentials": 1, "advanced": 2, "premium": 3}
logger = logging.getLogger(__name__)


def resolve_user_for_ikazin_activation(
    db_session: Session,
    *,
    user_id: Optional[int] = None,
    email: Optional[EmailStr] = None,
) -> User:
    has_id = user_id is not None
    has_email = email is not None
    if has_id == has_email:
        raise HTTPException(status_code=400, detail="Provide exactly one of user_id or email")

    stmt = select(User)
    if user_id is not None:
        stmt = stmt.where(User.id == user_id)
    else:
        stmt = stmt.where(User.email == str(email))

    user = db_session.exec(stmt).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def assign_ikazin_plan(
    db_session: Session,
    user: User,
    *,
    plan: str,
    source: str = "manual_admin",
    metadata: Optional[dict[str, Any]] = None,
) -> User:
    normalized_plan = plan.strip().lower()
    valid_with_none = VALID_TIER_NAMES | frozenset({"none"})
    if normalized_plan not in valid_with_none:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Valid: {sorted(valid_with_none)}")

    details = dict(user.details or {})
    if normalized_plan == "none":
        details.pop("ikazin_plan", None)
        details.pop("ikazin_plan_assigned_at", None)
        details.pop("ikazin_plan_source", None)
        details.pop("ikazin_plan_metadata", None)
    else:
        details["ikazin_plan"] = normalized_plan
        details["ikazin_plan_assigned_at"] = datetime.now(timezone.utc).isoformat()
        details["ikazin_plan_source"] = source
        if metadata:
            details["ikazin_plan_metadata"] = metadata

        # Track highest tier ever reached — never decrements (permanent identity)
        current_max = details.get("ikazin_max_tier_ever")
        current_rank = _TIER_ORDER.get(current_max or "", -1)
        new_rank = _TIER_ORDER.get(normalized_plan, -1)
        if new_rank > current_rank:
            details["ikazin_max_tier_ever"] = normalized_plan

    user.details = details
    user.update_date = str(datetime.now())
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def activate_ikazin_user(
    db_session: Session,
    *,
    user_id: Optional[int] = None,
    email: Optional[EmailStr] = None,
    plan: str,
    source: str = "manual_admin",
    metadata: Optional[dict[str, Any]] = None,
) -> User:
    user = resolve_user_for_ikazin_activation(
        db_session,
        user_id=user_id,
        email=email,
    )
    return assign_ikazin_plan(
        db_session,
        user,
        plan=plan,
        source=source,
        metadata=metadata,
    )


def activate_ikazin_plan_from_stripe_checkout(
    db_session: Session,
    *,
    event_id: Optional[str],
    session_id: Optional[str],
    metadata: Optional[dict[str, Any]],
) -> dict[str, Any]:
    checkout_metadata = dict(metadata or {})
    raw_user_id = checkout_metadata.get("user_id")
    raw_plan = checkout_metadata.get("ikazin_plan")

    if not raw_user_id or not raw_plan:
        return {
            "status": "ignored",
            "reason": "Missing metadata.user_id or metadata.ikazin_plan",
        }

    try:
        user_id = int(str(raw_user_id))
    except (TypeError, ValueError):
        return {
            "status": "ignored",
            "reason": "Invalid metadata.user_id",
        }

    normalized_plan = str(raw_plan).strip().lower()
    user = resolve_user_for_ikazin_activation(db_session, user_id=user_id)
    user_details = dict(user.details or {})
    current_plan = user_details.get("ikazin_plan")
    current_metadata = user_details.get("ikazin_plan_metadata") or {}

    if (
        current_plan == normalized_plan
        and (
            (event_id and current_metadata.get("stripe_event_id") == event_id)
            or (session_id and current_metadata.get("stripe_session_id") == session_id)
        )
    ):
        return {
            "status": "already_activated",
            "user_id": user.id,
            "plan": current_plan,
        }

    activation_metadata = dict(checkout_metadata)
    if session_id:
        activation_metadata["stripe_session_id"] = session_id
    if event_id:
        activation_metadata["stripe_event_id"] = event_id

    try:
        user = activate_ikazin_user(
            db_session,
            user_id=user_id,
            plan=normalized_plan,
            source="stripe",
            metadata=activation_metadata,
        )
    except HTTPException as exc:
        logger.warning(
            "Ignoring Stripe Ikazin activation for user_id=%s plan=%s: %s",
            user_id,
            normalized_plan,
            exc.detail,
        )
        return {
            "status": "ignored",
            "reason": str(exc.detail),
            "user_id": user_id,
            "plan": normalized_plan,
        }

    return {
        "status": "activated",
        "user_id": user.id,
        "plan": (user.details or {}).get("ikazin_plan"),
    }


def save_ikazin_onboarding(
    db_session: Session,
    user: User,
    *,
    profile: str,
    experience: str,
    interest: str,
    recommended_build_number: int,
    recommended_build_id: Optional[str],
    reason: str,
) -> User:
    details = dict(user.details or {})
    details["ikazin_onboarding"] = {
        "profile": profile,
        "experience": experience,
        "interest": interest,
        "recommended_build_number": recommended_build_number,
        "recommended_build_id": recommended_build_id,
        "reason": reason,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    user.details = details
    user.update_date = str(datetime.now())
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def build_ikazin_welcome_link(
    request: Request,
    db_session: Session,
    user: User,
    *,
    org_slug: str,
    redirect_to: Optional[str] = None,
    ttl_seconds: int = 3600,
) -> str:
    org = db_session.exec(select(Organization).where(Organization.slug == org_slug)).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    target = redirect_to or f"/orgs/{org_slug}/welcome"
    if "://" in target or not target.startswith("/"):
        raise HTTPException(status_code=400, detail="redirect_to must be a same-origin path")

    base = get_base_url_from_request(request).rstrip("/")
    return f"{base}{target}"
