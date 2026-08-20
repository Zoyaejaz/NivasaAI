from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str  # "resident" or "admin"
    flat_number: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Complaint History Schemas ---
class ComplaintHistoryOut(BaseModel):
    id: int
    complaint_id: int
    status_from: str
    status_to: str
    changed_by_id: int
    comment: Optional[str] = None
    created_at: datetime.datetime
    changed_by: UserOut

    class Config:
        from_attributes = True

# --- Complaint Schemas ---
class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str
    location: str

class ComplaintCreate(ComplaintBase):
    photo_url: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_admin_id: Optional[int] = None
    comment: Optional[str] = None

class ComplaintOut(ComplaintBase):
    id: int
    priority: str
    status: str
    resident_id: int
    assigned_admin_id: Optional[int] = None
    photo_url: Optional[str] = None
    is_recurring: bool
    parent_recurring_complaint_id: Optional[int] = None
    ai_confidence_score: float
    ai_explanation: Optional[str] = None
    risk_score: float
    created_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    resident: UserOut
    assigned_admin: Optional[UserOut] = None
    history: List[ComplaintHistoryOut] = []

    class Config:
        from_attributes = True

# --- Notice Schemas ---
class NoticeBase(BaseModel):
    title: str
    content: str
    is_pinned: bool = False
    is_important: bool = False

class NoticeCreate(NoticeBase):
    pass

class NoticeOut(NoticeBase):
    id: int
    created_by_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    created_by: UserOut

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    channel: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Asset Schemas ---
class AssetOut(BaseModel):
    id: int
    name: str
    category: str
    location: str
    install_date: datetime.datetime
    last_maintenance_date: datetime.datetime
    status: str
    health_score: float
    risk_score: float
    risk_level: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Assistant Chat Schemas ---
class AssistantQuery(BaseModel):
    message: str

class AssistantResponse(BaseModel):
    response: str
    suggested_actions: Optional[List[str]] = None

# --- Analytics Schemas ---
class StatusCount(BaseModel):
    status: str
    count: int

class CategoryCount(BaseModel):
    category: str
    count: int

class LocationCount(BaseModel):
    location: str
    count: int

class DateCount(BaseModel):
    date: str
    count: int

class AnalyticsDashboard(BaseModel):
    total_complaints: int
    active_complaints: int
    resolved_complaints: int
    overdue_complaints: int
    sla_compliance_rate: float
    avg_resolution_time_hours: float
    status_distribution: List[StatusCount]
    category_distribution: List[CategoryCount]
    location_distribution: List[LocationCount]
    overdue_trends: List[DateCount]
    forecast_30_days: List[DateCount]
