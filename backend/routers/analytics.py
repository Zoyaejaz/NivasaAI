import datetime
import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Complaint, Asset
from schemas import AnalyticsDashboard, StatusCount, CategoryCount, LocationCount, DateCount
from auth import get_current_user, require_admin
from services.ml import forecast_complaint_volume

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics & Forecasting"])

@router.get("", response_model=AnalyticsDashboard)
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    complaints = db.query(Complaint).all()
    
    total = len(complaints)
    active = len([c for c in complaints if c.status != "Resolved"])
    resolved = len([c for c in complaints if c.status == "Resolved"])
    
    # SLA threshold = 48 hours
    sla_hours = 48
    now = datetime.datetime.utcnow()
    
    overdue = 0
    sla_compliant_count = 0
    resolution_times = []
    
    for c in complaints:
        created_time = c.created_at
        
        if c.status == "Resolved" and c.resolved_at:
            delta = c.resolved_at - created_time
            hours = delta.total_seconds() / 3600.0
            resolution_times.append(hours)
            if hours <= sla_hours:
                sla_compliant_count += 1
        else:
            delta = now - created_time
            hours = delta.total_seconds() / 3600.0
            if hours > sla_hours:
                overdue += 1
            else:
                sla_compliant_count += 1
                
    avg_res_time = float(np.mean(resolution_times)) if resolution_times else 0.0
    sla_compliance = (sla_compliant_count / total * 100.0) if total > 0 else 100.0
    
    # Status distribution
    status_map = {}
    for c in complaints:
        status_map[c.status] = status_map.get(c.status, 0) + 1
    status_dist = [StatusCount(status=k, count=v) for k, v in status_map.items()]
    
    # Category distribution
    cat_map = {}
    for c in complaints:
        cat_map[c.category] = cat_map.get(c.category, 0) + 1
    cat_dist = [CategoryCount(category=k, count=v) for k, v in cat_map.items()]
    
    # Location distribution
    loc_map = {}
    for c in complaints:
        loc_map[c.location] = loc_map.get(c.location, 0) + 1
    loc_dist = [LocationCount(location=k, count=v) for k, v in loc_map.items()]
    
    # Overdue trends (aggregate complaints created older than 48h and group by date)
    overdue_map = {}
    for c in complaints:
        if c.status != "Resolved" and (now - c.created_at).total_seconds() / 3600.0 > sla_hours:
            date_str = c.created_at.strftime("%Y-%m-%d")
            overdue_map[date_str] = overdue_map.get(date_str, 0) + 1
            
    # Sort overdue trends by date
    overdue_trends = [DateCount(date=k, count=v) for k, v in sorted(overdue_map.items())]
        
    # Forecast for the next 30 days
    forecast_raw = forecast_complaint_volume(complaints, days_to_forecast=30)
    forecast_dist = [DateCount(date=item["date"], count=item["count"]) for item in forecast_raw]
    
    
    return AnalyticsDashboard(
        total_complaints=total,
        active_complaints=active,
        resolved_complaints=resolved,
        overdue_complaints=overdue,
        sla_compliance_rate=round(sla_compliance, 1),
        avg_resolution_time_hours=round(avg_res_time, 1),
        status_distribution=status_dist,
        category_distribution=cat_dist,
        location_distribution=loc_dist,
        overdue_trends=overdue_trends,
        forecast_30_days=forecast_dist
    )
