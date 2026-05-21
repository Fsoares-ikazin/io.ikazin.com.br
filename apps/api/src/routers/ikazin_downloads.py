from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session

from src.core.events.database import get_db_session
from src.db.users import PublicUser
from src.security.auth import get_current_user

router = APIRouter()

DownloadType = Literal["exe", "zip", "pdf", "scl", "tia_portal", "pdf_guide"]


class DownloadLogRequest(BaseModel):
    file_type: DownloadType


def _normalize_file_type(file_type: DownloadType) -> Literal["exe", "tia_portal", "pdf_guide"]:
    if file_type == "exe":
        return "exe"
    if file_type in {"zip", "tia_portal", "scl"}:
        return "tia_portal"
    if file_type in {"pdf", "pdf_guide"}:
        return "pdf_guide"
    raise HTTPException(status_code=400, detail="Unsupported file type")


@router.post("/{build_id}", summary="Log an Ikazin download intent")
async def log_ikazin_download(
    build_id: str,
    payload: DownloadLogRequest,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    normalized_type = _normalize_file_type(payload.file_type)

    result = db_session.execute(
        text(
            """
            INSERT INTO ikazin_downloads (
                user_id,
                build_id,
                file_type,
                downloaded_at
            )
            SELECT
                :user_id,
                b.id,
                :file_type,
                NOW()
            FROM ikazin_builds b
            WHERE b.uuid = :build_uuid
            RETURNING id, downloaded_at
            """
        ),
        {
            "user_id": str(current_user.id),
            "build_uuid": build_id,
            "file_type": normalized_type,
        },
    ).mappings().first()

    if not result:
        raise HTTPException(status_code=404, detail="Build not found")

    db_session.commit()

    return {
        "ok": True,
        "download": {
            "id": result["id"],
            "build_id": build_id,
            "file_type": normalized_type,
            "downloaded_at": result["downloaded_at"],
        },
    }


@router.get("", summary="List current user's Ikazin download history")
async def list_ikazin_downloads(
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    rows = db_session.execute(
        text(
            """
            SELECT
                d.id,
                b.uuid AS build_id,
                b.build_number,
                b.title,
                d.file_type,
                d.downloaded_at
            FROM ikazin_downloads d
            JOIN ikazin_builds b ON b.id = d.build_id
            WHERE d.user_id = :user_id
            ORDER BY d.downloaded_at DESC
            """
        ),
        {"user_id": str(current_user.id)},
    ).mappings().all()

    return {"downloads": [dict(row) for row in rows]}
