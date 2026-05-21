from typing import Literal
import mimetypes
import os
from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from botocore.exceptions import ClientError
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session, select

from src.core.events.database import get_db_session
from src.db.ikazin_builds import IkazinBuild
from src.db.users import PublicUser
from src.security.auth import get_authenticated_user
from src.services.courses.transfer.storage_utils import (
    get_content_delivery_type,
    get_s3_configuration_error_message,
    get_s3_configuration_errors,
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


def _build_download_filename(
    build: IkazinBuild,
    file_type: Literal["exe", "tia_portal", "pdf_guide"],
    file_key: str,
) -> str:
    extension = Path(file_key).suffix or {
        "exe": ".exe",
        "tia_portal": ".zip",
        "pdf_guide": ".pdf",
    }[file_type]
    return f"ikazin-build-{build.build_number}-{file_type}{extension}"


def _guess_media_type(file_key: str) -> str:
    guessed, _ = mimetypes.guess_type(file_key)
    return guessed or "application/octet-stream"


def _attachment_headers(filename: str) -> dict[str, str]:
    return {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"}


def _stream_s3_object(file_key: str):
    if get_s3_configuration_errors():
        raise HTTPException(
            status_code=503,
            detail=get_s3_configuration_error_message("downloads"),
        )

    client = get_storage_client()
    if client is None:
        raise HTTPException(status_code=503, detail="Storage client unavailable")

    try:
        response = client.get_object(Bucket=get_s3_bucket_name(), Key=file_key)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code", "")
        if error_code in {"NoSuchKey", "404"}:
            raise HTTPException(status_code=404, detail="File not found in storage") from exc
        raise HTTPException(status_code=502, detail="Failed to read file from storage") from exc

    body = response["Body"]

    def iterator():
        try:
            while True:
                chunk = body.read(1024 * 1024)
                if not chunk:
                    break
                yield chunk
        finally:
            body.close()

    media_type = response.get("ContentType") or _guess_media_type(file_key)
    return StreamingResponse(iterator(), media_type=media_type)


def _proxy_download_url(build_id: str, file_type: DownloadType) -> str:
    return f"/api/v1/ikazin/downloads/{build_id}/file?file_type={file_type}"


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


@router.get("/{build_id}", summary="Get the authenticated Ikazin download URL")
async def get_ikazin_download_url(
    build_id: str,
    file_type: DownloadType,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    normalized_type = _normalize_file_type(file_type)
    build = _get_build_for_download(db_session, current_user, build_id)
    file_key = _get_file_key(build, normalized_type)
    if not file_key:
        raise HTTPException(status_code=404, detail="File not available for this build")

    storage_mode = "proxy"
    if is_s3_enabled() and not get_s3_configuration_errors():
        storage_mode = "proxy_s3"

    return {
        "ok": True,
        "url": _proxy_download_url(build_id, file_type),
        "expires_in": DOWNLOAD_URL_EXPIRY,
        "storage_mode": storage_mode,
    }


@router.get("/{build_id}/file", summary="Download an Ikazin file through the authenticated API")
async def download_ikazin_file(
    build_id: str,
    file_type: DownloadType,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
):
    normalized_type = _normalize_file_type(file_type)
    build = _get_build_for_download(db_session, current_user, build_id)
    file_key = _get_file_key(build, normalized_type)
    if not file_key:
        raise HTTPException(status_code=404, detail="File not available for this build")

    filename = _build_download_filename(build, normalized_type, file_key)
    if get_content_delivery_type() == "s3api":
        response = _stream_s3_object(file_key)
        _log_download(
            db_session,
            user_id=current_user.id,
            build_id=build_id,
            file_type=normalized_type,
        )
        response.headers.update(_attachment_headers(filename))
        return response

    absolute_path = os.path.abspath(file_key)
    if not os.path.exists(absolute_path):
        raise HTTPException(status_code=404, detail="File not found on filesystem storage")

    _log_download(
        db_session,
        user_id=current_user.id,
        build_id=build_id,
        file_type=normalized_type,
    )
    return FileResponse(
        absolute_path,
        media_type=_guess_media_type(file_key),
        filename=filename,
        headers=_attachment_headers(filename),
    )


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
