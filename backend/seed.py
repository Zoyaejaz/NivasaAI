import datetime
import random
from database import SessionLocal, Base, engine
from models import User, Complaint, ComplaintHistory, Asset, Notice, Notification

# Clear existing tables and recreate
print("Resetting database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("Seeding database...")

# 1. Create Users
from auth import hash_password

admin_pwd = hash_password("admin123")
res_pwd = hash_password("resident123")

users_data = [
    User(email="admin@nivasa.ai", hashed_password=admin_pwd, full_name="Aarav Sharma", role="admin", flat_number="Tower 1-101", phone_number="9876543210"),
    User(email="resident@nivasa.ai", hashed_password=res_pwd, full_name="Neha Patel", role="resident", flat_number="Tower 2-504", phone_number="8765432109"),
    User(email="priya@nivasa.ai", hashed_password=res_pwd, full_name="Priya Nair", role="resident", flat_number="Tower 1-902", phone_number="7654321098"),
    User(email="rohit@nivasa.ai", hashed_password=res_pwd, full_name="Rohit Verma", role="resident", flat_number="Tower 3-303", phone_number="6543210987")
]

for u in users_data:
    db.add(u)
db.commit()

# Retrieve users for relationships
admin = db.query(User).filter(User.role == "admin").first()
residents = db.query(User).filter(User.role == "resident").all()
res_neha = residents[0]
res_priya = residents[1]
res_rohit = residents[2]

# 2. Create Assets
today = datetime.datetime.utcnow()
assets_data = [
    Asset(
        name="Main Water Pump A",
        category="Plumbing",
        location="Basement Pump Room",
        install_date=today - datetime.timedelta(days=365 * 3), # 3 years old
        last_maintenance_date=today - datetime.timedelta(days=220), # overdue check (>180 days)
        status="Requires Attention",
        health_score=65.0,
        risk_score=35.0,
        risk_level="Medium"
    ),
    Asset(
        name="DG Backup Generator 1",
        category="Electrical",
        location="Generator Shed",
        install_date=today - datetime.timedelta(days=365 * 5),
        last_maintenance_date=today - datetime.timedelta(days=45),
        status="Operational",
        health_score=92.0,
        risk_score=8.0,
        risk_level="Low"
    ),
    Asset(
        name="Elevator Wing A",
        category="Elevator",
        location="Wing A Lobby",
        install_date=today - datetime.timedelta(days=365 * 2),
        last_maintenance_date=today - datetime.timedelta(days=190), # overdue check
        status="Critical",
        health_score=40.0,
        risk_score=60.0,
        risk_level="High"
    ),
    Asset(
        name="Elevator Wing B",
        category="Elevator",
        location="Wing B Lobby",
        install_date=today - datetime.timedelta(days=365 * 2),
        last_maintenance_date=today - datetime.timedelta(days=30),
        status="Operational",
        health_score=95.0,
        risk_score=5.0,
        risk_level="Low"
    ),
    Asset(
        name="Clubhouse HVAC System",
        category="HVAC",
        location="Clubhouse Terrace",
        install_date=today - datetime.timedelta(days=365 * 1),
        last_maintenance_date=today - datetime.timedelta(days=15),
        status="Operational",
        health_score=98.0,
        risk_score=2.0,
        risk_level="Low"
    )
]

for a in assets_data:
    db.add(a)
db.commit()

# 3. Create Notices
notices_data = [
    Notice(
        title="Scheduled Water Shutdown",
        content="Please note that the main water supply will be suspended on Saturday (24th Aug) from 10 AM to 2 PM for cleaning of the underground water tanks.",
        is_pinned=True,
        is_important=True,
        created_by_id=admin.id,
        created_at=today - datetime.timedelta(days=1)
    ),
    Notice(
        title="Independence Day Celebrations",
        content="Join us for flag hoisting on August 15th at 8:30 AM in the Central Lawn, followed by high tea and games for children.",
        is_pinned=False,
        is_important=False,
        created_by_id=admin.id,
        created_at=today - datetime.timedelta(days=6)
    ),
    Notice(
        title="New Security Protocols for Visitors",
        content="Effective immediately, all delivery executives must check in at the main gate terminal. Residents are requested to pre-approve guests on the NivasaAI app.",
        is_pinned=True,
        is_important=False,
        created_by_id=admin.id,
        created_at=today - datetime.timedelta(days=12)
    )
]

for n in notices_data:
    db.add(n)
db.commit()

# 4. Create Historical and Active Complaints
# We need to simulate complaints over the last 30 days to build a beautiful analytics charts.
complaints_presets = [
    ("Water leakage from kitchen sink pipe", "Water is pooling under the cabinet. Needs plumber.", "Plumbing", "Wing A, Flat 504", "Medium", "Resolved", 20, 19),
    ("Sparking switchboard in common hallway", "hallway switchboard sparks when elevator starts. Safety concern.", "Electrical", "Wing B, Floor 3 Lobby", "High", "Resolved", 25, 24.5),
    ("Elevator shaking violently on movement", "Elevator makes screeching and grinding noise between floors 4 and 7.", "Elevator", "Wing A Lift", "High", "In Progress", 4, None),
    ("Garbage overflow at backyard bins", "Garbage hasn't been collected in 2 days. Smells terrible.", "Cleanliness", "Backyard Gate", "Low", "Resolved", 12, 10),
    ("Lobby gate magnetic lock broken", "Magnetic lock is demagnetized, anyone can push and open lobby door.", "Security", "Wing C Entrance", "High", "Resolved", 15, 14),
    ("Pool water looks greenish and cloudy", "Swimming pool water needs filtration check and chemical balancing.", "Cleanliness", "Clubhouse Pool", "Medium", "Open", 2, None),
    ("Low water pressure in kitchen faucet", "Water trickling slowly, hard to clean dishes.", "Plumbing", "Wing B, Flat 303", "Low", "Open", 1, None),
    ("Corridor lights flickering on 5th floor", "Multiple tubes flickering continuously. Disruptive.", "Electrical", "Wing A, Floor 5", "Low", "Resolved", 8, 7.5),
    ("Security guard sleeping during night shift", "Back entrance gate was left open and guard was asleep on chair.", "Security", "Back Gate", "High", "Resolved", 5, 4),
    ("Foul sewage odor in parking basement B2", "Possible drain block or leakage in sewage lines.", "Plumbing", "Parking B2 Sector C", "High", "In Progress", 3, None)
]

# Generate realistic complaints spread across 30 days
random.seed(42)
all_complaints = []

for i, preset in enumerate(complaints_presets):
    title, desc, cat, loc, priority, status, age_days, res_hours = preset
    created_time = today - datetime.timedelta(days=age_days, hours=random.randint(1, 10))
    
    resolved_time = None
    if status == "Resolved":
        resolved_time = created_time + datetime.timedelta(hours=res_hours)
        
    res_user = random.choice(residents)
    
    # Assign some to admin
    assigned_id = admin.id if status != "Open" else None
    
    new_c = Complaint(
        title=title,
        description=desc,
        category=cat,
        location=loc,
        priority=priority,
        status=status,
        resident_id=res_user.id,
        assigned_admin_id=assigned_id,
        is_recurring=(i in [2, 9]), # make some recurring
        ai_confidence_score=round(random.uniform(0.78, 0.98), 2),
        ai_explanation=f"AI predicted category: {cat} and priority: {priority} based on description triggers.",
        created_at=created_time,
        resolved_at=resolved_time
    )
    all_complaints.append(new_c)

# Add more random historical complaints to populate a clean 30-day timeline
for day in range(1, 31):
    num_complaints = random.randint(0, 3)
    for _ in range(num_complaints):
        cat = random.choice(["Plumbing", "Electrical", "Elevator", "Security", "Cleanliness"])
        priority = random.choice(["Low", "Medium", "High"])
        status = "Resolved" if day > 3 else random.choice(["Open", "In Progress", "Resolved"])
        
        created_time = today - datetime.timedelta(days=day, hours=random.randint(1, 23))
        resolved_time = None
        if status == "Resolved":
            resolved_time = created_time + datetime.timedelta(hours=random.randint(2, 48))
            
        res_user = random.choice(residents)
        assigned_id = admin.id if status != "Open" else None
        
        new_c = Complaint(
            title=f"Sample {cat} issue {random.randint(10, 99)}",
            description=f"Generated mock description of a {cat} issue requiring maintenance operations.",
            category=cat,
            location=f"Wing {random.choice(['A', 'B', 'C'])}, Floor {random.randint(1, 10)}",
            priority=priority,
            status=status,
            resident_id=res_user.id,
            assigned_admin_id=assigned_id,
            created_at=created_time,
            resolved_at=resolved_time
        )
        all_complaints.append(new_c)

for c in all_complaints:
    db.add(c)
db.commit()

# Relink parent recurring complaints for demonstration
elev_complaints = db.query(Complaint).filter(Complaint.category == "Elevator").all()
if len(elev_complaints) > 1:
    parent = elev_complaints[0]
    for child in elev_complaints[1:3]:
        child.is_recurring = True
        child.parent_recurring_complaint_id = parent.id
    db.commit()

# Create history transitions for seeded complaints
all_db_complaints = db.query(Complaint).all()
for c in all_db_complaints:
    hist = ComplaintHistory(
        complaint_id=c.id,
        status_from="None",
        status_to="Open",
        changed_by_id=c.resident_id,
        comment="Seeded record initialization.",
        created_at=c.created_at
    )
    db.add(hist)
    
    if c.status != "Open":
        mid_time = c.created_at + datetime.timedelta(minutes=30)
        hist2 = ComplaintHistory(
            complaint_id=c.id,
            status_from="Open",
            status_to="In Progress",
            changed_by_id=admin.id,
            comment="Assigned and operations started.",
            created_at=mid_time
        )
        db.add(hist2)
        
    if c.status == "Resolved" and c.resolved_at:
        hist3 = ComplaintHistory(
            complaint_id=c.id,
            status_from="In Progress",
            status_to="Resolved",
            changed_by_id=admin.id,
            comment="Issue checked, repaired and closed.",
            created_at=c.resolved_at
        )
        db.add(hist3)
        
db.commit()

# 5. Create notifications
for r in residents:
    db.add(Notification(user_id=r.id, title="Welcome to NivasaAI", message="Your resident account is active. File complaints and check notices from the dashboard.", is_read=False, created_at=today - datetime.timedelta(days=1)))
db.add(Notification(user_id=admin.id, title="Admin Activation Complete", message="Operational assets control panel is loaded.", is_read=False, created_at=today - datetime.timedelta(days=1)))
db.commit()

print("Database seeding completed successfully!")
db.close()
