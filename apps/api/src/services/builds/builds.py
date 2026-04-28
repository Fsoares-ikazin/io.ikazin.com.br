import uuid
from datetime import datetime
from typing import Literal
from fastapi import HTTPException, Request
from sqlmodel import Session, select

from src.db.builds import Build, BuildCreate, BuildRead, BuildReadWithAccess, BuildUpdate
from src.db.users import PublicUser, AnonymousUser
from src.services.courses.transfer.storage_utils import get_storage_client, get_s3_bucket_name, is_s3_enabled
from ee.services.payments.payments_access import check_enrollment_access

DOWNLOAD_URL_EXPIRY = 300  # 5 minutes


async def _has_build_access(build: Build, user: PublicUser | AnonymousUser, db_session: Session) -> bool:
    if isinstance(user, AnonymousUser):
        return False
    return await check_enrollment_access(build.build_uuid, user.id, db_session)


async def list_builds(
    request: Request,
    db_session: Session,
    user: PublicUser | AnonymousUser,
) -> list[BuildReadWithAccess]:
    builds = db_session.exec(select(Build).where(Build.published == True).order_by(Build.number)).all()  # noqa: E712

    result = []
    for b in builds:
        has_access = await _has_build_access(b, user, db_session)
        item = BuildReadWithAccess(**b.model_dump(), has_access=has_access)
        result.append(item)
    return result


async def get_build(
    request: Request,
    build_uuid: str,
    db_session: Session,
    user: PublicUser | AnonymousUser,
    require_access: bool = True,
) -> BuildReadWithAccess:
    build = db_session.exec(select(Build).where(Build.build_uuid == build_uuid)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    has_access = await _has_build_access(build, user, db_session)
    if require_access and not has_access:
        raise HTTPException(status_code=403, detail="Subscription required for this build")

    return BuildReadWithAccess(**build.model_dump(), has_access=has_access)


async def get_download_url(
    request: Request,
    build_uuid: str,
    file_type: Literal["unity", "tia"],
    db_session: Session,
    user: PublicUser | AnonymousUser,
) -> str:
    if isinstance(user, AnonymousUser):
        raise HTTPException(status_code=401, detail="Authentication required")

    build = db_session.exec(select(Build).where(Build.build_uuid == build_uuid)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    has_access = await _has_build_access(build, user, db_session)
    if not has_access:
        raise HTTPException(status_code=403, detail="Subscription required for this build")

    key = build.exe_key if file_type == "unity" else build.tia_key
    if not key:
        raise HTTPException(status_code=404, detail=f"No {file_type} file available for this build")

    if not is_s3_enabled():
        raise HTTPException(status_code=503, detail="File storage not configured")

    s3 = get_storage_client()
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": get_s3_bucket_name(), "Key": key},
            ExpiresIn=DOWNLOAD_URL_EXPIRY,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Could not generate download link")

    return url


async def create_build(
    request: Request,
    build_data: BuildCreate,
    db_session: Session,
    user: PublicUser,
) -> BuildRead:
    now = datetime.utcnow().isoformat()
    build = Build(
        **build_data.model_dump(),
        build_uuid=str(uuid.uuid4()),
        creation_date=now,
        update_date=now,
    )
    db_session.add(build)
    db_session.commit()
    db_session.refresh(build)
    return BuildRead(**build.model_dump())


async def update_build(
    request: Request,
    build_uuid: str,
    build_data: BuildUpdate,
    db_session: Session,
    user: PublicUser,
) -> BuildRead:
    build = db_session.exec(select(Build).where(Build.build_uuid == build_uuid)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    for field, value in build_data.model_dump(exclude_unset=True).items():
        setattr(build, field, value)
    build.update_date = datetime.utcnow().isoformat()

    db_session.add(build)
    db_session.commit()
    db_session.refresh(build)
    return BuildRead(**build.model_dump())


async def delete_build(
    request: Request,
    build_uuid: str,
    db_session: Session,
    user: PublicUser,
) -> dict:
    build = db_session.exec(select(Build).where(Build.build_uuid == build_uuid)).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    db_session.delete(build)
    db_session.commit()
    return {"detail": "Build deleted"}
