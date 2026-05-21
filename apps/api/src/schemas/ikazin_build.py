from enum import Enum
from typing import Optional
from pydantic import BaseModel


class BuildTier(str, Enum):
    basic = "basic"
    essentials = "essentials"
    advanced = "advanced"
    premium = "premium"


class IkazinBuildBase(BaseModel):
    number: int
    title: str
    description: str
    tier: BuildTier
    vimeo_video_id: Optional[str] = None
    exe_file_key: Optional[str] = None
    tia_portal_file_key: Optional[str] = None
    pdf_guide_key: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_published: bool = True


class IkazinBuildCreate(IkazinBuildBase):
    pass


class IkazinBuildUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    vimeo_video_id: Optional[str] = None
    exe_file_key: Optional[str] = None
    tia_portal_file_key: Optional[str] = None
    pdf_guide_key: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_published: Optional[bool] = None


class IkazinBuildRead(IkazinBuildBase):
    id: int
    uuid: str

    model_config = {"from_attributes": True}


class IkazinProgressCreate(BaseModel):
    build_id: int
    percent: int = 0
    last_position_seconds: int = 0


class IkazinProgressRead(IkazinProgressCreate):
    id: int
    user_id: str
    updated_at: str

    model_config = {"from_attributes": True}


class IkazinDownloadCreate(BaseModel):
    build_id: int
    file_type: str


class IkazinDownloadRead(IkazinDownloadCreate):
    id: int
    user_id: str
    downloaded_at: str

    model_config = {"from_attributes": True}
