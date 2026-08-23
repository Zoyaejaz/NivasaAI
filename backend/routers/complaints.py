import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, Complaint, ComplaintHistory, Notification, AuditLog, Asset
from schemas import ComplaintCreate, ComplaintOut, ComplaintUpdate
from auth import get_current_user, require_admin
from services.ml import predict_complaint_attributes, detect_recurring_complaint, analyze_uploaded_photo

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Run AI Predictor for Category & Priority & Explanation
    ai_preds = predict_complaint_attributes(complaint_in.title, complaint_in.description)
    
    # 2. Check for Recurring issues
    existing_active = db.query(Complaint).filter(
        Complaint.status != "Resolved"
    ).all()
    
    is_recurring, parent_id = detect_recurring_complaint(
        complaint_in.description, existing_active, threshold=0.60
    )
    
    # 3. Handle image mock scanning if photo_url is provided
    risk_value = 0.0
    if complaint_in.photo_url:
        img_analysis = analyze_uploaded_photo(complaint_in.photo_url)
        # Deduce severity score adjustments
        severity_mapping = {"Low": 15.0, "Medium": 45.0, "High": 85.0}
        risk_value = severity_mapping.get(img_analysis.get("severity", "Low"), 0.0)
        # Append image insights to description or explanation
        ai_preds["explanation"] += f" | Photo Analysis: {img_analysis['findings']}"

    # 4. Create new complaint in database
    new_complaint = Complaint(
        title=complaint_in.title,
        description=complaint_in.description,
        category=ai_preds["category"],
        location=complaint_in.location,
        priority=ai_preds["priority"],
        status="Open",
        resident_id=current_user.id,
        photo_url=complaint_in.photo_url,
        is_recurring=is_recurring,
        parent_recurring_complaint_id=parent_id,
        ai_confidence_score=ai_preds["confidence_score"],
        ai_explanation=ai_preds["explanation"],
        risk_score=risk_value,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # 5. Create History transition log
    history = ComplaintHistory(
        complaint_id=new_complaint.id,
        status_from="None",
        status_to="Open",
        changed_by_id=current_user.id,
        comment="Complaint filed by resident. AI prediction processed."
    )
    db.add(history)
    
    # 6. Send in-app notification to all admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        noti = Notification(
            user_id=admin.id,
            title=f"New Complaint Filed: #{new_complaint.id}",
            message=f"[{new_complaint.priority}] {new_complaint.title} filed at {new_complaint.location}. Category: {new_complaint.category}.",
            is_read=False,
            channel="in_app"
        )
        db.add(noti)
        
    # Send email log (Mock)
    print(f"[MOCK EMAIL] To admins: New high-priority alert or notification. Subject: Complaint #{new_complaint.id}")

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="COMPLAINT_CREATED",
        target_table="complaints",
        target_id=new_complaint.id,
        description=f"Complaint #{new_complaint.id} created. AI priority: {new_complaint.priority}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_complaint)
    
    return new_complaint

@router.get("", response_model=List[ComplaintOut])
def list_complaints(
    search: Optional[str] = Query(None, description="Search by title, description or location"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    is_recurring_filter: Optional[bool] = Query(None, alias="is_recurring", description="Filter recurring complaints"),
    sort_by: str = Query("created_at", description="Sort field: created_at, priority"),
    sort_order: str = Query("desc", description="Sort direction: asc, desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)
    
    # If resident, only show their own complaints
    if current_user.role == "resident":
        query = query.filter(Complaint.resident_id == current_user.id)
        
    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Complaint.title.ilike(search_pattern)) |
            (Complaint.description.ilike(search_pattern)) |
            (Complaint.location.ilike(search_pattern))
        )
        
    # Category filter
    if category:
        query = query.filter(Complaint.category == category)
        
    # Priority filter
    if priority:
        query = query.filter(Complaint.priority == priority)
        
    # Status filter
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
        
    # Recurring filter
    if is_recurring_filter is not None:
        query = query.filter(Complaint.is_recurring == is_recurring_filter)
        
    # Sorting
    # Handle priority ordering custom logic: High -> Medium -> Low
    if sort_by == "priority":
        # Sort using CASE statement in SQL
        from sqlalchemy import case
        priority_order = case(
            (Complaint.priority == "High", 1),
            (Complaint.priority == "Medium", 2),
            (Complaint.priority == "Low", 3),
            else_=4
        )
        if sort_order == "asc":
            query = query.order_by(priority_order.asc())
        else:
            query = query.order_by(priority_order.desc())
    else:
        # Default date sorting
        if sort_order == "asc":
            query = query.order_by(Complaint.created_at.asc())
        else:
            query = query.order_by(Complaint.created_at.desc())
            
    return query.all()

@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(complaint_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Access control
    if current_user.role == "resident" and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint")
        
    return complaint

@router.put("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(
    complaint_id: int,
    updates: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Access control: Only Admin can update status/priority/assignments. Residents can close their own complaints or update them.
    if current_user.role != "admin" and updates.status != "Resolved":
        raise HTTPException(status_code=403, detail="Only administrators can update complaint status or assignments")
        
    if current_user.role == "resident" and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this complaint")

    old_status = complaint.status
    old_priority = complaint.priority
    old_assignee = complaint.assigned_admin_id
    
    # Apply updates
    if updates.status is not None:
        complaint.status = updates.status
        if updates.status == "Resolved":
            complaint.resolved_at = datetime.datetime.utcnow()
            
    if updates.priority is not None:
        complaint.priority = updates.priority
        
    if updates.assigned_admin_id is not None:
        complaint.assigned_admin_id = updates.assigned_admin_id
        
    db.commit()
    db.refresh(complaint)
    
    # Create History log
    comment_text = updates.comment or "Administrator updated complaint fields."
    history = ComplaintHistory(
        complaint_id=complaint.id,
        status_from=old_status,
        status_to=complaint.status,
        changed_by_id=current_user.id,
        comment=f"{comment_text} (Priority: {old_priority} -> {complaint.priority}, Assignee: {old_assignee} -> {complaint.assigned_admin_id})"
    )
    db.add(history)
    
    # Send notification to resident
    noti = Notification(
        user_id=complaint.resident_id,
        title=f"Complaint #{complaint.id} Updated",
        message=f"Your complaint '{complaint.title}' status changed to '{complaint.status}' (Priority: {complaint.priority}).",
        is_read=False,
        channel="in_app"
    )
    db.add(noti)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="COMPLAINT_UPDATED",
        target_table="complaints",
        target_id=complaint.id,
        description=f"Updated complaint #{complaint.id}: status {old_status}->{complaint.status}, priority {old_priority}->{complaint.priority}"
    )
    db.add(audit)
    db.commit()
    db.refresh(complaint)
    
    return complaint
