from typing import List, Literal
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session

from src.core.events.database import get_db_session
from src.db.builds import BuildCreate, BuildRead, BuildReadWithAccess, BuildUpdate
from src.db.users import PublicUser, AnonymousUser
from src.security.auth import get_current_user, get_authenticated_user
from src.services.builds.builds import (
    create_build,
    delete_build,
    get_build,
    get_download_url,
    list_builds,
    update_build,
)

router = APIRouter()


def _require_superadmin(user: PublicUser) -> None:
    if not getattr(user, "is_superadmin", False):
        raise HTTPException(status_code=403, detail="Superadmin access required")


@router.get(
    "",
    response_model=List[BuildReadWithAccess],
    summary="List all published builds",
)
async def api_list_builds(
    request: Request,
    current_user: PublicUser | AnonymousUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> List[BuildReadWithAccess]:
    return await list_builds(request, db_session, current_user)


@router.get(
    "/{build_uuid}",
    response_model=BuildReadWithAccess,
    summary="Get build detail",
)
async def api_get_build(
    request: Request,
    build_uuid: str,
    current_user: PublicUser | AnonymousUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> BuildReadWithAccess:
    return await get_build(request, build_uuid, db_session, current_user)


@router.get(
    "/{build_uuid}/download",
    response_model=dict,
    summary="Get presigned download URL",
)
async def api_get_download_url(
    request: Request,
    build_uuid: str,
    type: Literal["unity", "tia"] = "unity",
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    url = await get_download_url(request, build_uuid, type, db_session, current_user)
    return {"url": url, "expires_in": 300}


@router.post(
    "",
    response_model=BuildRead,
    summary="Create build (superadmin only)",
)
async def api_create_build(
    request: Request,
    build_data: BuildCreate,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> BuildRead:
    _require_superadmin(current_user)
    return await create_build(request, build_data, db_session, current_user)


@router.patch(
    "/{build_uuid}",
    response_model=BuildRead,
    summary="Update build (superadmin only)",
)
async def api_update_build(
    request: Request,
    build_uuid: str,
    build_data: BuildUpdate,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> BuildRead:
    _require_superadmin(current_user)
    return await update_build(request, build_uuid, build_data, db_session, current_user)


@router.delete(
    "/{build_uuid}",
    response_model=dict,
    summary="Delete build (superadmin only)",
)
async def api_delete_build(
    request: Request,
    build_uuid: str,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    _require_superadmin(current_user)
    return await delete_build(request, build_uuid, db_session, current_user)
