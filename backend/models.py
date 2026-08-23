import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="resident")  # "resident" or "admin"
    flat_number = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaints_filed = relationship("Complaint", foreign_keys="Complaint.resident_id", back_populates="resident")
    complaints_assigned = relationship("Complaint", foreign_keys="Complaint.assigned_admin_id", back_populates="assigned_admin")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # "Plumbing", "Electrical", "Elevator", "Security", "Cleanliness", "Other"
    location = Column(String, nullable=False)  # e.g., "Wing A, Floor 3", "Clubhouse"
    priority = Column(String, default="Medium")  # "Low", "Medium", "High"
    status = Column(String, default="Open")  # "Open", "In Progress", "Resolved"
    
    resident_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    photo_url = Column(String, nullable=True)
    
    # AI ML Predictions & Annotations
    is_recurring = Column(Boolean, default=False)
    parent_recurring_complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    ai_confidence_score = Column(Float, default=1.0)
    ai_explanation = Column(Text, nullable=True)
    risk_score = Column(Float, default=0.0) # Asset/operational risk association
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    resident = relationship("User", foreign_keys=[resident_id], back_populates="complaints_filed")
    assigned_admin = relationship("User", foreign_keys=[assigned_admin_id], back_populates="complaints_assigned")
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")
    parent_recurring = relationship("Complaint", remote_side=[id])

class ComplaintHistory(Base):
    __tablename__ = "complaint_histories"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    status_from = Column(String, nullable=False)
    status_to = Column(String, nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="history")
    changed_by = relationship("User")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Main Elevator Wing B"
    category = Column(String, nullable=False)  # e.g., "Elevator", "Plumbing", "Electrical", "HVAC"
    location = Column(String, nullable=False)
    install_date = Column(DateTime, nullable=False)
    last_maintenance_date = Column(DateTime, nullable=False)
    status = Column(String, default="Operational")  # "Operational", "Under Maintenance", "Requires Attention", "Critical"
    health_score = Column(Float, default=100.0)  # 0 to 100
    risk_score = Column(Float, default=0.0)  # 0 to 100 calculated by ML
    risk_level = Column(String, default="Low")  # "Low", "Medium", "High"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    created_by = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    channel = Column(String, default="in_app")  # "in_app" or "email"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)  # e.g., "USER_LOGIN", "COMPLAINT_RESOLVED"
    target_table = Column(String, nullable=True)
    target_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
