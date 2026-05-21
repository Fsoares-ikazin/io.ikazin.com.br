from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from src.core.events.database import get_db_session
from src.db.ikazin_builds import IkazinBuild
from src.db.users import PublicUser, User
from src.security.auth import get_authenticated_user
from src.services.ikazin.access import save_ikazin_onboarding
from src.services.ikazin.recommendation import recommend_build

router = APIRouter()


class RecommendationRequest(BaseModel):
    profile: str
    experience: str
    interest: str


def _serialize_recommendation(db_session: Session, build_number: int, reason: str) -> dict:
    build = db_session.exec(
        select(IkazinBuild).where(
            IkazinBuild.build_number == build_number,
            IkazinBuild.is_published == True,  # noqa: E712
        )
    ).first()

    return {
        "build_id": build.uuid if build else None,
        "build_number": build_number,
        "title": build.title if build else f"Build {build_number}",
        "reason": reason,
    }


@router.get("", summary="Get current Ikazin onboarding recommendation")
async def get_ikazin_recommendation(
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    user = db_session.exec(select(User).where(User.id == current_user.id)).first()
    details = dict(user.details or {}) if user else {}
    onboarding = details.get("ikazin_onboarding")

    if not isinstance(onboarding, dict):
        return {"completed": False, "recommendation": None, "answers": None}

    recommendation = _serialize_recommendation(
        db_session,
        int(onboarding.get("recommended_build_number") or 1),
        str(onboarding.get("reason") or "ele dá a melhor base para começar a trilha."),
    )
    return {
        "completed": True,
        "answers": {
            "profile": onboarding.get("profile"),
            "experience": onboarding.get("experience"),
            "interest": onboarding.get("interest"),
        },
        "recommendation": recommendation,
    }


@router.post("", summary="Persist Ikazin onboarding answers and return recommendation")
async def create_ikazin_recommendation(
    payload: RecommendationRequest,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    build_number, reason = recommend_build(payload.profile, payload.experience, payload.interest)
    recommendation = _serialize_recommendation(db_session, build_number, reason)

    user = db_session.exec(select(User).where(User.id == current_user.id)).first()
    if user:
        save_ikazin_onboarding(
            db_session,
            user,
            profile=payload.profile,
            experience=payload.experience,
            interest=payload.interest,
            recommended_build_number=recommendation["build_number"],
            recommended_build_id=recommendation["build_id"],
            reason=recommendation["reason"],
        )

    return {
        "completed": True,
        "answers": payload.model_dump(),
        "recommendation": recommendation,
    }
