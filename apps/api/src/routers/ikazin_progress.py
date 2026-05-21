import logging
from typing import Optional

import redis
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlmodel import Session

from config.config import get_learnhouse_config
from src.core.events.database import get_db_session
from src.db.users import PublicUser
from src.security.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

PROGRESS_RATE_LIMIT_SECONDS = 10


class IkazinProgressUpsertRequest(BaseModel):
    build_id: str
    second: int = Field(ge=0)
    percent: float = Field(ge=0, le=100)


def _get_redis_client() -> Optional[redis.Redis]:
    try:
        config = get_learnhouse_config()
        conn_string = config.redis_config.redis_connection_string
        if not conn_string:
            return None
        return redis.Redis.from_url(conn_string, socket_connect_timeout=2)
    except Exception:
        return None


def _is_progress_rate_limited(user_id: int) -> bool:
    client = _get_redis_client()
    if client is None:
        return False

    try:
        key = f"progress:{user_id}"
        created = client.set(key, "1", ex=PROGRESS_RATE_LIMIT_SECONDS, nx=True)
        return not bool(created)
    except Exception:
        logger.debug("Ikazin progress rate-limit failed for user %s", user_id, exc_info=True)
        return False


def _fetch_progress_row(db_session: Session, build_uuid: str, user_id: int) -> Optional[dict]:
    row = db_session.execute(
        text(
            """
            SELECT
                p.user_id,
                b.uuid AS build_uuid,
                p.percent,
                p.last_position_seconds AS second,
                COALESCE(p.completed, FALSE) AS completed,
                p.completed_at,
                p.last_watched_at,
                p.updated_at
            FROM ikazin_progress_meta p
            JOIN ikazin_builds b ON b.id = p.build_id
            WHERE p.user_id = :user_id
              AND b.uuid = :build_uuid
            """
        ),
        {"user_id": str(user_id), "build_uuid": build_uuid},
    ).mappings().first()
    return dict(row) if row else None


def _sync_recent_view(
    db_session: Session,
    *,
    user_id: int,
    build_uuid: str,
    second: Optional[int],
    percent: int,
    completed: bool,
) -> None:
    try:
        db_session.execute(
            text(
                """
                INSERT INTO ikazin_user_recent_views (
                    user_id,
                    build_id,
                    first_viewed_at,
                    last_viewed_at,
                    last_position_seconds,
                    last_percent,
                    completed,
                    completed_at,
                    total_views
                )
                SELECT
                    :user_id,
                    b.id,
                    NOW(),
                    NOW(),
                    COALESCE(
                        :second,
                        (
                            SELECT p.last_position_seconds
                            FROM ikazin_progress_meta p
                            WHERE p.user_id = :user_id
                              AND p.build_id = b.id
                        ),
                        0
                    ),
                    :percent,
                    :completed,
                    CASE WHEN :completed THEN NOW() ELSE NULL END,
                    1
                FROM ikazin_builds b
                WHERE b.uuid = :build_uuid
                ON CONFLICT (user_id, build_id) DO UPDATE SET
                    last_viewed_at = NOW(),
                    last_position_seconds = EXCLUDED.last_position_seconds,
                    last_percent = GREATEST(
                        ikazin_user_recent_views.last_percent,
                        EXCLUDED.last_percent
                    ),
                    completed = ikazin_user_recent_views.completed OR EXCLUDED.completed,
                    completed_at = CASE
                        WHEN (ikazin_user_recent_views.completed OR EXCLUDED.completed)
                            AND ikazin_user_recent_views.completed_at IS NULL
                        THEN NOW()
                        ELSE ikazin_user_recent_views.completed_at
                    END,
                    total_views = ikazin_user_recent_views.total_views + 1
                """
            ),
            {
                "user_id": str(user_id),
                "build_uuid": build_uuid,
                "second": second,
                "percent": percent,
                "completed": completed,
            },
        )
    except Exception:
        logger.debug("Ikazin recent views sync failed for user %s build %s", user_id, build_uuid, exc_info=True)


@router.post("", summary="Upsert Ikazin playback progress")
async def upsert_ikazin_progress(
    payload: IkazinProgressUpsertRequest,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    if _is_progress_rate_limited(current_user.id):
        return {"ok": True, "rate_limited": True}

    percent = max(0, min(100, int(round(payload.percent))))

    db_session.execute(
        text(
            """
            INSERT INTO ikazin_progress_meta (
                user_id,
                build_id,
                percent,
                last_position_seconds,
                updated_at,
                last_watched_at,
                completed
            )
            SELECT
                :user_id,
                b.id,
                :percent,
                :second,
                NOW(),
                NOW(),
                CASE WHEN :percent >= 100 THEN TRUE ELSE FALSE END
            FROM ikazin_builds b
            WHERE b.uuid = :build_uuid
            ON CONFLICT (user_id, build_id) DO UPDATE SET
                percent = EXCLUDED.percent,
                last_position_seconds = EXCLUDED.last_position_seconds,
                updated_at = NOW(),
                last_watched_at = NOW(),
                completed = ikazin_progress_meta.completed OR EXCLUDED.completed,
                completed_at = CASE
                    WHEN (ikazin_progress_meta.completed OR EXCLUDED.completed)
                        AND ikazin_progress_meta.completed_at IS NULL
                    THEN NOW()
                    ELSE ikazin_progress_meta.completed_at
                END
            """
        ),
        {
            "user_id": str(current_user.id),
            "build_uuid": payload.build_id,
            "percent": percent,
            "second": payload.second,
        },
    )
    _sync_recent_view(
        db_session,
        user_id=current_user.id,
        build_uuid=payload.build_id,
        second=payload.second,
        percent=percent,
        completed=percent >= 100,
    )
    db_session.commit()

    progress = _fetch_progress_row(db_session, payload.build_id, current_user.id)
    return {"ok": True, "rate_limited": False, "progress": progress}


@router.put("/{build_id}/complete", summary="Mark an Ikazin build as complete")
async def complete_ikazin_build(
    build_id: str,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    db_session.execute(
        text(
            """
            INSERT INTO ikazin_progress_meta (
                user_id,
                build_id,
                percent,
                last_position_seconds,
                updated_at,
                last_watched_at,
                completed,
                completed_at
            )
            SELECT
                :user_id,
                b.id,
                100,
                COALESCE((
                    SELECT p.last_position_seconds
                    FROM ikazin_progress_meta p
                    WHERE p.user_id = :user_id
                      AND p.build_id = b.id
                ), 0),
                NOW(),
                NOW(),
                TRUE,
                NOW()
            FROM ikazin_builds b
            WHERE b.uuid = :build_uuid
            ON CONFLICT (user_id, build_id) DO UPDATE SET
                percent = 100,
                updated_at = NOW(),
                last_watched_at = NOW(),
                completed = TRUE,
                completed_at = COALESCE(ikazin_progress_meta.completed_at, NOW())
            """
        ),
        {"user_id": str(current_user.id), "build_uuid": build_id},
    )
    _sync_recent_view(
        db_session,
        user_id=current_user.id,
        build_uuid=build_id,
        second=None,
        percent=100,
        completed=True,
    )
    db_session.commit()

    progress = _fetch_progress_row(db_session, build_id, current_user.id)
    return {"progress": progress}
