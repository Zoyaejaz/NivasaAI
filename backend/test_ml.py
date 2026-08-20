import pytest
from ml_service import (
    predict_complaint_attributes,
    detect_recurring_complaint,
    calculate_asset_risk,
    forecast_complaint_volume,
    analyze_uploaded_photo
)

# Mock class representing a DB complaint for similarity & risk tests
class MockComplaint:
    def __init__(self, id, title, description, category, location, status, created_at, parent_recurring_complaint_id=None):
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.location = location
        self.status = status
        self.created_at = created_at
        self.parent_recurring_complaint_id = parent_recurring_complaint_id

class MockAsset:
    def __init__(self, category, name, location, install_date, last_maintenance_date):
        self.category = category
        self.name = name
        self.location = location
        self.install_date = install_date
        self.last_maintenance_date = last_maintenance_date

def test_predict_complaint_attributes():
    res = predict_complaint_attributes("Leak in toilet", "Water is leaking from the flush tank pipe and flooding the toilet floor.")
    assert res["category"] == "Plumbing"
    assert res["priority"] in ["Low", "Medium", "High"]
    assert res["confidence_score"] > 0.0
    assert len(res["explanation"]) > 0

def test_detect_recurring_complaint():
    existing = [
        MockComplaint(1, "Main pump pipe leak", "The water pipe connecting to Wing A is leaking and spraying water.", "Plumbing", "Wing A", "Open", None)
    ]
    is_rec, parent_id = detect_recurring_complaint(
        "Water pipe connecting to Wing A has a severe leak and water is spraying out.",
        existing,
        threshold=0.60
    )
    assert is_rec is True
    assert parent_id == 1

def test_calculate_asset_risk():
    import datetime
    today = datetime.datetime.utcnow()
    # 220 days since last maintenance is > 180 days, should deduct health
    asset = MockAsset("Plumbing", "Main Pump A", "Basement", today - datetime.timedelta(days=365), today - datetime.timedelta(days=220))
    complaints = []
    
    risk = calculate_asset_risk(asset, complaints)
    assert risk["health_score"] < 100.0
    assert risk["risk_score"] > 0.0
    assert risk["risk_level"] in ["Low", "Medium", "High"]

def test_forecast_complaint_volume():
    import datetime
    today = datetime.datetime.utcnow()
    complaints = [
        MockComplaint(i, "Title", "Desc", "Plumbing", "Wing A", "Resolved", today - datetime.timedelta(days=i % 10))
        for i in range(20)
    ]
    forecast = forecast_complaint_volume(complaints, days_to_forecast=10)
    assert len(forecast) == 10
    for day in forecast:
        assert "date" in day
        assert "count" in day
        assert isinstance(day["count"], int)

def test_analyze_uploaded_photo():
    res = analyze_uploaded_photo("sparking_wire.jpg")
    assert "carbon scoring" in res["findings"] or "sparks" in res["findings"] or "wire" in res["findings"] or "electrical" in res["findings"]
    assert res["severity"] == "High"
