from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class IkazinProgressMeta(SQLModel, table=True):
    __tablename__ = "ikazin_progress_meta"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    build_id: int
    percent: int = 0
    last_position_seconds: int = 0
    updated_at: Optional[datetime] = Field(default=None)
