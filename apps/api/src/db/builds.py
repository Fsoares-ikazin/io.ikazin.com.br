from enum import Enum
from typing import Optional
from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class TierSlug(str, Enum):
    BASIC = "basic"
    ESSENTIALS = "essentials"
    ADVANCED = "advanced"
    PREMIUM = "premium"


class BuildBase(SQLModel):
    number: int
    tier: TierSlug
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    exe_key: Optional[str] = Field(default=None, max_length=500)
    tia_key: Optional[str] = Field(default=None, max_length=500)
    youtube_url: Optional[str] = Field(default=None, max_length=500)
    tutorial_md: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    thumbnail_key: Optional[str] = Field(default=None, max_length=500)
    published: bool = Field(default=False)


class Build(BuildBase, table=True):
    __table_args__ = {"extend_existing": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    build_uuid: str = Field(default="", unique=True, index=True)
    creation_date: str = ""
    update_date: str = ""


class BuildRead(BuildBase):
    id: int
    build_uuid: str
    creation_date: str
    update_date: str


class BuildReadWithAccess(BuildRead):
    has_access: bool = False


class BuildCreate(SQLModel):
    number: int
    tier: TierSlug
    title: str
    description: Optional[str] = None
    exe_key: Optional[str] = None
    tia_key: Optional[str] = None
    youtube_url: Optional[str] = None
    tutorial_md: Optional[str] = None
    thumbnail_key: Optional[str] = None
    published: bool = False


class BuildUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    exe_key: Optional[str] = None
    tia_key: Optional[str] = None
    youtube_url: Optional[str] = None
    tutorial_md: Optional[str] = None
    thumbnail_key: Optional[str] = None
    published: Optional[bool] = None
