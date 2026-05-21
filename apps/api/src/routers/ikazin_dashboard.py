from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.core.events.database import get_db_session
from src.db.users import PublicUser, AnonymousUser
from src.security.auth import get_current_user
from src.services.ikazin.builds import get_dashboard_data

router = APIRouter()


@router.get("", summary="Get Ikazin dashboard data")
async def get_ikazin_dashboard(
    current_user: PublicUser | AnonymousUser = Depends(get_current_user),
    db_session: Session = Depends(get_db_session),
) -> dict:
    return get_dashboard_data(db_session, current_user)
