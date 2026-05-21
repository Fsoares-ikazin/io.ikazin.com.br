from datetime import datetime
from typing import Optional
from sqlalchemy import Column, ARRAY, String
from sqlmodel import Field, SQLModel


class IkazinBuild(SQLModel, table=True):
    __tablename__ = "ikazin_builds"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: str = Field(unique=True, index=True)
    build_number: int = Field(unique=True)
    title: str
    description: str = ""
    tier: str
    tags: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(String), nullable=False, server_default="{}"))
    vimeo_video_id: Optional[str] = None
    exe_file_key: Optional[str] = None
    tia_portal_file_key: Optional[str] = None
    pdf_guide_key: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_published: bool = True
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
