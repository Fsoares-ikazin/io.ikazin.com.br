import logging
from typing import Optional
from sqlalchemy import text
from sqlmodel import Session, select

from src.db.ikazin_builds import IkazinBuild
from src.db.ikazin_progress import IkazinProgressMeta
from src.db.users import PublicUser, AnonymousUser

# Tier → max build_number unlocked for that plan
TIER_MAX: dict[str, int] = {
    "basic":      8,
    "essentials": 13,
    "advanced":   18,
    "premium":    25,
}

VALID_TIER_NAMES = frozenset(TIER_MAX.keys())
logger = logging.getLogger(__name__)


def _extract_user_plan_tier(user: PublicUser | AnonymousUser) -> Optional[str]:
    if isinstance(user, AnonymousUser):
        return None

    if getattr(user, "is_superadmin", False):
        return "premium"

    for container_name in ("details", "profile"):
        container = getattr(user, container_name, None)
        if not isinstance(container, dict):
            continue

        plan_value = container.get("ikazin_plan")
        if isinstance(plan_value, str):
            normalized = plan_value.strip().lower()
            if normalized in VALID_TIER_NAMES:
                return normalized

    return None


def _user_max_build(user: PublicUser | AnonymousUser) -> int:
    user_tier = _extract_user_plan_tier(user)
    if user_tier is None:
        return 0
    return TIER_MAX[user_tier]


def get_user_plan_tier(user: PublicUser | AnonymousUser) -> Optional[str]:
    return _extract_user_plan_tier(user)


def get_user_plan_max_build(user: PublicUser | AnonymousUser) -> int:
    return _user_max_build(user)


def _get_progress_map(
    db_session: Session,
    user: PublicUser | AnonymousUser,
) -> dict[int, IkazinProgressMeta]:
    if isinstance(user, AnonymousUser):
        return {}

    rows = db_session.exec(
        select(IkazinProgressMeta).where(IkazinProgressMeta.user_id == str(user.id))
    ).all()
    return {row.build_id: row for row in rows}


def _get_recent_view_rows(
    db_session: Session,
    user: PublicUser | AnonymousUser,
) -> list[dict]:
    if isinstance(user, AnonymousUser):
        return []

    try:
        rows = db_session.execute(
            text(
                """
                SELECT
                    build_id,
                    last_viewed_at,
                    last_position_seconds,
                    last_percent,
                    completed,
                    total_views
                FROM ikazin_user_recent_views
                WHERE user_id = :user_id
                ORDER BY last_viewed_at DESC, total_views DESC
                """
            ),
            {"user_id": str(user.id)},
        ).mappings().all()
        return [dict(row) for row in rows]
    except Exception:
        logger.debug("Ikazin recent views lookup failed for user %s", user.id, exc_info=True)
        return []


def _serialize_progress(progress_row: Optional[IkazinProgressMeta]) -> dict:
    if not progress_row:
        return {"percent": 0, "second": 0, "completed": False}

    return {
        "percent": progress_row.percent,
        "second": progress_row.last_position_seconds,
        "completed": progress_row.percent >= 100,
    }


def _serialize_build(
    build: IkazinBuild,
    max_build: int,
    progress_row: Optional[IkazinProgressMeta] = None,
) -> dict:
    return {
        "id": build.uuid,
        "build_number": build.build_number,
        "title": build.title,
        "tier": build.tier,
        "tags": build.tags or [],
        "locked": build.build_number > max_build,
        "progress": _serialize_progress(progress_row),
        "vimeo_id": build.vimeo_video_id,
        "duration_seconds": (build.duration_minutes * 60) if build.duration_minutes else None,
        "thumbnail_url": None,
    }


def get_builds_with_locked(
    db_session: Session,
    user: PublicUser | AnonymousUser,
    tier_filter: Optional[str] = None,
    tag_filter: Optional[str] = None,
) -> list[dict]:
    stmt = select(IkazinBuild).where(IkazinBuild.is_published == True)  # noqa: E712
    if tier_filter:
        if tier_filter not in TIER_MAX:
            return []
        stmt = stmt.where(IkazinBuild.tier == tier_filter)
    stmt = stmt.order_by(IkazinBuild.build_number)

    builds = db_session.exec(stmt).all()

    if tag_filter:
        builds = [b for b in builds if tag_filter in (b.tags or [])]

    max_build = _user_max_build(user)
    progress_map = _get_progress_map(db_session, user)

    return [_serialize_build(b, max_build, progress_map.get(b.id)) for b in builds]


def get_dashboard_data(
    db_session: Session,
    user: PublicUser | AnonymousUser,
) -> dict:
    builds = db_session.exec(
        select(IkazinBuild)
        .where(IkazinBuild.is_published == True)  # noqa: E712
        .order_by(IkazinBuild.build_number)
    ).all()

    max_build = get_user_plan_max_build(user)
    progress_map = _get_progress_map(db_session, user)
    recent_view_rows = _get_recent_view_rows(db_session, user)
    build_map = {build.id: build for build in builds}

    serialized_builds = {
        build.id: _serialize_build(build, max_build, progress_map.get(build.id))
        for build in builds
    }

    plan_builds = [
        serialized_builds[build.id]
        for build in builds
        if build.build_number <= max_build
    ]

    recent_build_ids = [
        row["build_id"]
        for row in recent_view_rows
        if row["build_id"] in build_map
    ]
    fallback_progress_rows = [row for row in progress_map.values() if row.build_id in build_map]
    fallback_progress_rows.sort(
        key=lambda row: (row.last_watched_at is not None, row.last_watched_at, row.updated_at),
        reverse=True,
    )
    seen_build_ids = set(recent_build_ids)
    recent_build_ids.extend(
        row.build_id for row in fallback_progress_rows if row.build_id not in seen_build_ids
    )

    in_progress = [
        serialized_builds[build_id]
        for build_id in recent_build_ids
        if build_id in progress_map and 0 < progress_map[build_id].percent < 100
    ][:10]

    last_accessed = serialized_builds[recent_build_ids[0]] if recent_build_ids else None

    recently_added = [
        serialized_builds[build.id]
        for build in sorted(
            builds,
            key=lambda item: (item.created_at is not None, item.created_at),
            reverse=True,
        )[:5]
    ]

    suggested_next = next(
        (
            serialized_builds[build.id]
            for build in builds
            if build.build_number <= max_build
            and (progress_map.get(build.id) is None or progress_map[build.id].percent == 0)
        ),
        None,
    )

    return {
        "last_accessed": last_accessed,
        "in_progress": in_progress,
        "plan_builds": plan_builds,
        "recently_added": recently_added,
        "suggested_next": suggested_next,
        "plan_tier": get_user_plan_tier(user),
    }
