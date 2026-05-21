from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import text
from sqlmodel import Session, select

from src.core.events.database import get_db_session
from src.db.ikazin_builds import IkazinBuild
from src.db.users import User
from src.db.users import PublicUser, AnonymousUser
from src.security.auth import get_current_user
from src.services.courses.transfer.storage_utils import (
    file_exists,
    get_s3_configuration_error_message,
    get_s3_configuration_errors,
    is_s3_enabled,
    read_file_content,
)
from src.services.ikazin.builds import (
    get_builds_with_locked,
    get_user_plan_max_build,
)

router = APIRouter()
IKAZIN_HLS_PREFIX = "ikazin/builds"

HLS_STORAGE_PENDING_MESSAGE = (
    "Storage HLS ainda nao configurado. Preencha o .env da API com as variaveis S3/MinIO."
)
HLS_ASSET_PENDING_MESSAGE = (
    "Manifesto HLS ainda nao publicado para este build. Execute o publish_build_hls.sh e envie os segmentos."
)
DOWNLOAD_STORAGE_PENDING_MESSAGE = (
    "Downloads indisponiveis: configure o storage S3/MinIO da API antes de publicar os arquivos."
)


def _build_material_entry(
    *,
    file_type: str,
    label: str,
    file_key: Optional[str],
    downloads_ready: bool,
) -> dict:
    if file_type == "scl":
        return {"type": "scl", "label": label, "available": False, "note": "Material ainda nao publicado"}

    if not file_key:
        return {"type": file_type, "label": label, "available": False, "note": "Arquivo ainda nao publicado"}

    if not downloads_ready:
        return {"type": file_type, "label": label, "available": False, "note": DOWNLOAD_STORAGE_PENDING_MESSAGE}

    return {"type": file_type, "label": label, "available": True, "note": "Arquivo pronto para download"}


def _build_hls_path(build_number: int, asset_path: str = "index.m3u8") -> str:
    return f"{IKAZIN_HLS_PREFIX}/{build_number}/hls/{asset_path}"


def _guess_mime_type(asset_path: str) -> str:
    if asset_path.endswith(".m3u8"):
        return "application/vnd.apple.mpegurl"
    if asset_path.endswith(".ts"):
        return "video/mp2t"
    if asset_path.endswith(".m4s"):
        return "video/iso.segment"
    if asset_path.endswith(".mp4"):
        return "video/mp4"
    return "application/octet-stream"


def _rewrite_manifest(build_uuid: str, manifest: str) -> str:
    lines = []
    for line in manifest.splitlines():
        if not line or line.startswith("#") or "://" in line:
            lines.append(line)
            continue
        lines.append(f"/api/v1/ikazin/builds/{build_uuid}/hls/{line}")
    return "\n".join(lines)


def _serialize_build_detail(
    build: IkazinBuild,
    current_user: PublicUser | AnonymousUser,
    progress: Optional[dict] = None,
    next_build: Optional[IkazinBuild] = None,
) -> dict:
    max_build = get_user_plan_max_build(current_user)
    is_locked = build.build_number > max_build
    playback = _resolve_playback_state(build, is_locked=is_locked)
    downloads_ready = not (is_s3_enabled() and get_s3_configuration_errors())
    return {
        "id": build.uuid,
        "build_number": build.build_number,
        "title": build.title,
        "description": build.description,
        "tier": build.tier,
        "tags": build.tags or [],
        "locked": is_locked,
        "progress": progress or {"percent": 0, "second": 0, "completed": False},
        "vimeo_id": build.vimeo_video_id,
        "video_provider": "minio_hls",
        "playback_url": playback["playback_url"],
        "playback_status": playback["status"],
        "playback_message": playback["message"],
        "duration_seconds": (build.duration_minutes * 60) if build.duration_minutes else None,
        "materials": [
            _build_material_entry(
                file_type="exe",
                label="Executavel .exe",
                file_key=build.exe_file_key,
                downloads_ready=downloads_ready,
            ),
            _build_material_entry(
                file_type="zip",
                label="Projeto TIA Portal",
                file_key=build.tia_portal_file_key,
                downloads_ready=downloads_ready,
            ),
            _build_material_entry(
                file_type="pdf",
                label="Guia PDF",
                file_key=build.pdf_guide_key,
                downloads_ready=downloads_ready,
            ),
            _build_material_entry(
                file_type="scl",
                label="Logica SCL",
                file_key=None,
                downloads_ready=False,
            ),
        ],
        "next_build": (
            {
                "id": next_build.uuid,
                "build_number": next_build.build_number,
                "title": next_build.title,
                "tier": next_build.tier,
            }
            if next_build
            else None
        ),
    }


def _resolve_playback_state(build: IkazinBuild, *, is_locked: bool) -> dict[str, str | None]:
    if is_locked:
        return {"status": "locked", "message": "Build bloqueado para o plano atual", "playback_url": None}

    manifest_path = _build_hls_path(build.build_number)
    if is_s3_enabled() and get_s3_configuration_errors():
        return {
            "status": "storage_not_configured",
            "message": HLS_STORAGE_PENDING_MESSAGE,
            "playback_url": None,
        }

    if file_exists(manifest_path):
        return {
            "status": "ready",
            "message": None,
            "playback_url": f"/api/v1/ikazin/builds/{build.uuid}/hls/index.m3u8",
        }

    return {
        "status": "missing_assets",
        "message": HLS_ASSET_PENDING_MESSAGE,
        "playback_url": None,
    }


def _get_progress_for_build(db_session: Session, user_id: int, build_uuid: str) -> dict:
    row = db_session.execute(
        text(
            """
            SELECT
                p.percent,
                p.last_position_seconds AS second,
                COALESCE(p.completed, FALSE) AS completed
            FROM ikazin_progress_meta p
            JOIN ikazin_builds b ON b.id = p.build_id
            WHERE p.user_id = :user_id
              AND b.uuid = :build_uuid
            """
        ),
        {"user_id": str(user_id), "build_uuid": build_uuid},
    ).mappings().first()

    if not row:
        return {"percent": 0, "second": 0, "completed": False}

    return {
        "percent": int(row["percent"] or 0),
        "second": int(row["second"] or 0),
        "completed": bool(row["completed"]),
    }


def _get_seconds_since_signup(db_session: Session, user_id: int) -> int | None:
    user = db_session.exec(select(User).where(User.id == user_id)).first()
    if not user or not user.creation_date:
        return None

    try:
        from datetime import datetime, timezone

        created_at = datetime.fromisoformat(user.creation_date)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return max(0, int((datetime.now(timezone.utc) - created_at).total_seconds()))
    except Exception:
        return None


@router.get("", summary="List all published Ikazin builds with locked flag")
async def list_ikazin_builds(
    tier: Optional[str] = Query(None, description="Filter by tier: basic|essentials|advanced|premium"),
    tag: Optional[str] = Query(None, description="Filter by tag slug"),
    current_user: PublicUser | AnonymousUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    builds = get_builds_with_locked(db_session, current_user, tier_filter=tier, tag_filter=tag)
    return {"builds": builds}


@router.get("/{build_id}/resume", summary="Get resume position for an Ikazin build")
async def get_ikazin_build_resume(
    build_id: str,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    progress = _get_progress_for_build(db_session, current_user.id, build_id)
    return {"second": progress["second"], "percent": progress["percent"]}


@router.get("/{build_id}/playback", summary="Get HLS playback metadata for an Ikazin build")
async def get_ikazin_build_playback(
    build_id: str,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    build = db_session.exec(select(IkazinBuild).where(IkazinBuild.uuid == build_id)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    max_build = get_user_plan_max_build(current_user)
    if build.build_number > max_build:
        raise HTTPException(status_code=403, detail="Build locked for current plan")

    manifest_path = _build_hls_path(build.build_number)
    playback = _resolve_playback_state(build, is_locked=False)
    return {
        "provider": "minio_hls",
        "playback_url": playback["playback_url"],
        "status": playback["status"],
        "message": playback["message"],
        "manifest_path": manifest_path,
    }


@router.get("/{build_id}/hls/{asset_path:path}", summary="Proxy authenticated HLS assets for an Ikazin build")
async def stream_ikazin_hls_asset(
    build_id: str,
    asset_path: str,
    current_user: PublicUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> Response:
    build = db_session.exec(select(IkazinBuild).where(IkazinBuild.uuid == build_id)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    max_build = get_user_plan_max_build(current_user)
    if build.build_number > max_build:
        raise HTTPException(status_code=403, detail="Build locked for current plan")

    if is_s3_enabled() and get_s3_configuration_errors():
        raise HTTPException(
            status_code=503,
            detail=get_s3_configuration_error_message("HLS playback"),
        )

    normalized_asset_path = asset_path.strip("/")
    if ".." in normalized_asset_path:
        raise HTTPException(status_code=400, detail="Invalid asset path")

    storage_path = _build_hls_path(build.build_number, normalized_asset_path)
    content = read_file_content(storage_path)
    if content is None:
        raise HTTPException(status_code=404, detail="Playback asset not found")

    if normalized_asset_path.endswith(".m3u8"):
        manifest = _rewrite_manifest(build.uuid, content.decode("utf-8"))
        return Response(content=manifest, media_type=_guess_mime_type(normalized_asset_path))

    return Response(content=content, media_type=_guess_mime_type(normalized_asset_path))


@router.get("/{build_ref}", summary="Get Ikazin build detail")
async def get_ikazin_build(
    build_ref: str,
    current_user: PublicUser | AnonymousUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    stmt = select(IkazinBuild).where(IkazinBuild.is_published == True)  # noqa: E712
    if build_ref.isdigit():
        stmt = stmt.where(IkazinBuild.build_number == int(build_ref))
    else:
        stmt = stmt.where(IkazinBuild.uuid == build_ref)

    build = db_session.exec(stmt).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    next_build = db_session.exec(
        select(IkazinBuild)
        .where(
            IkazinBuild.is_published == True,  # noqa: E712
            IkazinBuild.build_number == build.build_number + 1,
        )
    ).first()

    progress = (
        _get_progress_for_build(db_session, current_user.id, build.uuid)
        if not isinstance(current_user, AnonymousUser)
        else {"percent": 0, "second": 0, "completed": False}
    )

    return {
        "build": {
            **_serialize_build_detail(build, current_user, progress=progress, next_build=next_build),
            "viewer": {
                "seconds_since_signup": (
                    _get_seconds_since_signup(db_session, current_user.id)
                    if not isinstance(current_user, AnonymousUser)
                    else None
                )
            },
        }
    }
