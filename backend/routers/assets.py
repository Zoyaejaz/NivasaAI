from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Asset, Complaint
from schemas import AssetOut
from auth import get_current_user, require_admin
from ml_service import calculate_asset_risk

router = APIRouter(prefix="/assets", tags=["Society Assets & Maintenance"])

@router.get("", response_model=List[AssetOut])
def list_assets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Fetch assets and all complaints
    assets = db.query(Asset).all()
    complaints = db.query(Complaint).all()
    
    # 2. Dynamically update health/risk parameters based on live operational logs
    for asset in assets:
        risk_metrics = calculate_asset_risk(asset, complaints)
        asset.health_score = risk_metrics["health_score"]
        asset.risk_score = risk_metrics["risk_score"]
        asset.risk_level = risk_metrics["risk_level"]
        
    return assets

@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    complaints = db.query(Complaint).all()
    risk_metrics = calculate_asset_risk(asset, complaints)
    
    asset.health_score = risk_metrics["health_score"]
    asset.risk_score = risk_metrics["risk_score"]
    asset.risk_level = risk_metrics["risk_level"]
    
    return asset
