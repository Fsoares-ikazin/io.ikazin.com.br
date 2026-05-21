from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session, select

from src.core.events.database import get_db_session
from src.db.ikazin_builds import IkazinBuild
from src.db.users import PublicUser
from src.security.auth import get_authenticated_user
from src.services.courses.transfer.storage_utils import (
    get_s3_bucket_name,
    get_storage_client,
    is_s3_enabled,
)
from src.services.ikazin.builds import get_user_plan_max_build

router = APIRouter()

DownloadType = Literal["exe", "zip", "pdf", "scl", "tia_portal", "pdf_guide"]
DOWNLOAD_URL_EXPIRY = 300


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


def _get_build_for_download(
    db_session: Session,
    current_user: PublicUser,
    build_id: str,
) -> IkazinBuild:
    build = db_session.exec(select(IkazinBuild).where(IkazinBuild.uuid == build_id)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    max_build = get_user_plan_max_build(current_user)
    if build.build_number > max_build:
        raise HTTPException(status_code=403, detail="Build locked for current plan")
    return build


def _get_file_key(build: IkazinBuild, file_type: Literal["exe", "tia_portal", "pdf_guide"]) -> str:
    if file_type == "exe":
        return build.exe_file_key or ""
    if file_type == "tia_portal":
        return build.tia_portal_file_key or ""
    return build.pdf_guide_key or ""


def _create_presigned_download_url(file_key: str) -> str:
    if not file_key:
        raise HTTPException(status_code=404, detail="File not available for this build")
    if not is_s3_enabled():
        raise HTTPException(status_code=503, detail="File storage not configured")

    client = get_storage_client()
    if client is None:
        raise HTTPException(status_code=503, detail="Storage client unavailable")

    try:
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": get_s3_bucket_name(), "Key": file_key},
            ExpiresIn=DOWNLOAD_URL_EXPIRY,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Could not generate download link")


def _log_download(
    db_session: Session,
    *,
    user_id: int,
    build_id: str,
    file_type: Literal["exe", "tia_portal", "pdf_guide"],
) -> dict:
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
            "user_id": str(user_id),
            "build_uuid": build_id,
            "file_type": file_type,
        },
    ).mappings().first()

    if not result:
        raise HTTPException(status_code=404, detail="Build not found")

    db_session.commit()
    return {
        "id": result["id"],
        "build_id": build_id,
        "file_type": file_type,
        "downloaded_at": result["downloaded_at"],
    }


@router.post("/{build_id}", summary="Log an Ikazin download intent")
async def log_ikazin_download(
    build_id: str,
    payload: DownloadLogRequest,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    normalized_type = _normalize_file_type(payload.file_type)
    _get_build_for_download(db_session, current_user, build_id)
    download = _log_download(
        db_session,
        user_id=current_user.id,
        build_id=build_id,
        file_type=normalized_type,
    )

    return {
        "ok": True,
        "download": download,
    }


@router.get("/{build_id}", summary="Get a signed Ikazin download URL")
async def get_ikazin_download_url(
    build_id: str,
    file_type: DownloadType,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    normalized_type = _normalize_file_type(file_type)
    build = _get_build_for_download(db_session, current_user, build_id)
    file_key = _get_file_key(build, normalized_type)
    url = _create_presigned_download_url(file_key)
    download = _log_download(
        db_session,
        user_id=current_user.id,
        build_id=build_id,
        file_type=normalized_type,
    )
    return {
        "ok": True,
        "url": url,
        "expires_in": DOWNLOAD_URL_EXPIRY,
        "download": download,
    }


@router.get("", summary="List current user's Ikazin download history")
async def list_ikazin_downloads(
    current_user: PublicUser = Depends(get_authenticated_user),
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
