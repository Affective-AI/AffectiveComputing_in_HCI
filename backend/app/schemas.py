from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# ---------- 用户 ----------

class UserOut(BaseModel):
    id: int
    username: str
    name: str
    class Config:
        from_attributes = True

class LoginIn(BaseModel):
    username: str = Field(min_length=2, max_length=64)
    password: str = Field(min_length=8, max_length=128)


# ---------- 压力 ----------

class StrengthItem(BaseModel):
    id: int
    strength: int
    ts: datetime
    note: Optional[str] = None
    source: Optional[str] = None
    class Config:
        from_attributes = True

class StressCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    strength: int = Field(ge=0, le=10)  # 初始强度

class StressPatch(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = Field(default=None, max_length=32)

class StrengthAdd(BaseModel):
    strength: int = Field(ge=0, le=10)
    note: Optional[str] = Field(default=None, max_length=1000)
    source: Optional[str] = Field(default=None, max_length=32)

class StressOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    current_strength: int
    last_strength_at: datetime
    class Config:
        from_attributes = True

class StressDetail(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    history: List[StrengthItem]
    class Config:
        from_attributes = True
