from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
from typing import List
from database import get_db
from models import User, Notice, AuditLog, Notification
from schemas import NoticeCreate, NoticeOut
from auth import get_current_user, require_admin

router = APIRouter(prefix="/notices", tags=["Notice Board"])

@router.get("", response_model=List[NoticeOut])
def list_notices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Sort pinned first, then important, then created_at desc, and filter out expired notices
    now = datetime.datetime.utcnow()
    notices = db.query(Notice).filter(
        (Notice.expires_at == None) | (Notice.expires_at > now)
    ).order_by(
        Notice.is_pinned.desc(),
        Notice.is_important.desc(),
        Notice.created_at.desc()
    ).all()
    return notices

@router.post("", response_model=NoticeOut, status_code=status.HTTP_201_CREATED)
def create_notice(
    notice_in: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_notice = Notice(
        title=notice_in.title,
        content=notice_in.content,
        is_pinned=notice_in.is_pinned,
        is_important=notice_in.is_important,
        expires_at=notice_in.expires_at,
        created_by_id=current_user.id
    )
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    
    # Broadcast notification to ALL residents
    residents = db.query(User).filter(User.role == "resident").all()
    for res in residents:
        noti = Notification(
            user_id=res.id,
            title=f"New Notice: {new_notice.title}",
            message=new_notice.content[:150] + ("..." if len(new_notice.content) > 150 else ""),
            is_read=False,
            channel="in_app"
        )
        db.add(noti)
        
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="NOTICE_CREATED",
        target_table="notices",
        target_id=new_notice.id,
        description=f"Created notice board item: {new_notice.title}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_notice)
    
    return new_notice

@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    db.delete(notice)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="NOTICE_DELETED",
        target_table="notices",
        target_id=notice_id,
        description=f"Deleted notice board item #{notice_id}"
    )
    db.add(audit)
    db.commit()
    
    return None
