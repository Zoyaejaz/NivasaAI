import datetime
import random
from database import SessionLocal, Base, engine
from models import User, Complaint, ComplaintHistory, Asset, Notice, Notification
from auth import hash_password

# Clear existing tables and recreate
print("Resetting database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("Seeding database...")

# 1. Create Users
admin_pwd = hash_password("admin123")
res_pwd = hash_password("resident123")

admin_user = User(email="admin@nivasa.ai", hashed_password=admin_pwd, full_name="Aarav Sharma", role="admin", flat_number="Tower 1-101", phone_number="9876543210")
db.add(admin_user)

residents_data = [
    User(email="resident@nivasa.ai", hashed_password=res_pwd, full_name="Neha Patel", role="resident", flat_number="Tower 2-504", phone_number="8765432109"),
    User(email="priya@nivasa.ai", hashed_password=res_pwd, full_name="Priya Nair", role="resident", flat_number="Tower 1-902", phone_number="7654321098"),
    User(email="rohit@nivasa.ai", hashed_password=res_pwd, full_name="Rohit Verma", role="resident", flat_number="Tower 3-303", phone_number="6543210987")
]

for r in residents_data:
    db.add(r)
db.commit()

# Retrieve users with IDs
admin_user = db.query(User).filter(User.role == "admin").first()
resident_users = db.query(User).filter(User.role == "resident").all()

# Seed Notices
today = datetime.datetime.utcnow()
notices_data = [
    Notice(
        title="Scheduled Water Tank Cleaning",
        content="The water tanks in Tower 1 and Tower 2 will be cleaned on Saturday. Water supply will be suspended from 10:00 AM to 2:00 PM.",
        is_pinned=True,
        is_important=True,
        created_by_id=admin_user.id,
        created_at=today - datetime.timedelta(days=2),
        expires_at=today + datetime.timedelta(days=3)
    ),
    Notice(
        title="Independence Day Celebration Gala",
        content="Join us for flag hoisting and cultural programs in the central park on August 15th at 9:00 AM. Breakfast will be served.",
        is_pinned=False,
        is_important=False,
        created_by_id=admin_user.id,
        created_at=today - datetime.timedelta(days=5)
    ),
    Notice(
        title="Fire Safety Drill Notice",
        content="A mandatory fire safety drill will be conducted by the security department on Sunday at 4:00 PM. Please cooperate.",
        is_pinned=False,
        is_important=True,
        created_by_id=admin_user.id,
        created_at=today - datetime.timedelta(days=1),
        expires_at=today + datetime.timedelta(days=1)
    )
]
for n in notices_data:
    db.add(n)
db.commit()

# Seed Assets
assets_data = [
    Asset(name="Main Elevator Wing A", category="Elevator", location="Wing A Lobby", install_date=today - datetime.timedelta(days=1000), last_maintenance_date=today - datetime.timedelta(days=45), status="Operational", health_score=92.0, risk_score=8.0, risk_level="Low"),
    Asset(name="Water Pump House 1", category="Plumbing", location="Basement Ground", install_date=today - datetime.timedelta(days=1500), last_maintenance_date=today - datetime.timedelta(days=200), status="Requires Attention", health_score=60.0, risk_score=40.0, risk_level="Medium"),
    Asset(name="Main Power Generator", category="Electrical", location="Utility Yard", install_date=today - datetime.timedelta(days=800), last_maintenance_date=today - datetime.timedelta(days=30), status="Operational", health_score=95.0, risk_score=5.0, risk_level="Low"),
    Asset(name="Elevator B Wing C", category="Elevator", location="Wing C Lobby", install_date=today - datetime.timedelta(days=1200), last_maintenance_date=today - datetime.timedelta(days=250), status="Critical", health_score=25.0, risk_score=75.0, risk_level="High")
]
for a in assets_data:
    db.add(a)
db.commit()

# Seed Complaints samples
complaint_samples = [
    # Plumbing
    ("Water leakage from Wing A kitchen pipes, flooding the floor.", "Plumbing", "High", "Wing A, Floor 3", "Active water leak causing flooding is a high priority plumbing emergency."),
    ("Taps in the toilet are leaking water continuously.", "Plumbing", "Medium", "Clubhouse", "Constant leak from bathroom taps leads to water waste and requires medium attention."),
    ("Clogged bathroom drain in Flat 402, water not draining.", "Plumbing", "Medium", "Tower 2-504", "Drain blockage in a bathroom is a standard plumbing issue requiring quick resolution."),
    ("Low water pressure in the master bathroom shower.", "Plumbing", "Low", "Tower 1-902", "Shower water pressure is a convenience issue, classified as low priority."),
    ("Main sewer line backup in the basement area, foul smell.", "Plumbing", "High", "Basement Parking", "Sewer line blockage affects public hygiene and is a high priority emergency."),
    
    # Electrical
    ("Sparking sound from the electric meter box on floor 5.", "Electrical", "High", "Tower 3, Floor 5", "Electrical sparking is a severe fire hazard, requiring immediate emergency intervention."),
    ("Power outage in Wing B, entire corridor lights are out.", "Electrical", "High", "Wing B Corridor", "Corridor power outage compromises safety and security for residents."),
    ("Flickering tube light in the basement parking lobby.", "Electrical", "Low", "Basement Lobby", "Flickering lobby light is a minor fixture issue, classified as low priority."),
    ("Socket in the living room not working, not charging appliances.", "Electrical", "Low", "Tower 3-303", "Single wall outlet malfunction is a minor repair item."),
    ("Electric vehicle charger in parking spot 24 is not powering up.", "Electrical", "Medium", "Parking Spot 24", "EV charging failure is a medium priority convenience disruption for EV owners."),
    
    # Elevator
    ("Elevator B in Wing C is shaking violently and making a grinding noise.", "Elevator", "High", "Wing C Lift", "Violent elevator shaking indicates critical mechanical failure and safety risk."),
    ("Elevator A is stuck on floor 3 with doors refusing to open.", "Elevator", "High", "Wing C Lift", "Passenger entrapment or stuck elevator is a critical emergency status."),
    ("The floor indicator display inside Elevator C is blank.", "Elevator", "Low", "Wing C Lift", "Indicator screen outage is a minor cosmetic display issue."),
    ("Elevator buttons for floor 7 are not responding to touch.", "Elevator", "Medium", "Wing C Lift", "Partially unresponsive elevator buttons disrupt service for residents."),
    ("Elevator is making squeaking sounds during movement.", "Elevator", "Medium", "Wing C Lift", "Squeaking sounds indicate lubrication or alignment need, a medium maintenance risk."),

    # Cleanliness
    ("Garbage bins at the main gate are overflowing and smelling bad.", "Cleanliness", "Medium", "Main Gate", "Overflowing waste bins pose a public health hazard and visual nuisance."),
    ("Staircase of Wing B hasn't been swept or mopped for 3 days, very dusty.", "Cleanliness", "Low", "Wing B Staircase", "Routine cleaning backlog is classified as a low priority maintenance task."),
    ("Dog poop left unattended in the central kids play park.", "Cleanliness", "Medium", "Central Park", "Pet waste in children's play area is a hygiene issue requiring medium priority clean-up."),
    ("Spilled oil on the ramp entering the basement parking, extremely slippery.", "Cleanliness", "High", "Basement Ramp", "Slippery oil spill on a vehicle ramp is a high priority safety hazard for vehicles/pedestrians."),
    ("Dry leaves accumulated in the swimming pool area.", "Cleanliness", "Low", "Swimming Pool", "Accumulated leaves in pool area are a minor seasonal cleanup item."),

    # Security
    ("Main gate intercom connection to Wing A is not connecting calls.", "Security", "Medium", "Main Gate", "Intercom failure degrades visitor validation and compromises building security."),
    ("CCTV camera at the entry gate is facing downwards and not recording faces.", "Security", "High", "Main Gate", "Blind spot in primary entry gate CCTV is a severe security vulnerability."),
    ("Security guard found sleeping at the backdoor checkpoint post.", "Security", "High", "Backdoor Post", "Sleeping guard at active checkpoint is a critical security breach."),
    ("Lobby glass door lock is broken and does not latch properly.", "Security", "High", "Tower 1 Lobby", "Broken lobby door latch allows unauthorized building entry, a high priority threat."),
    ("Visitor registration logbook is torn and missing pages.", "Security", "Low", "Reception Desk", "Torn logbook is a minor administrative recordkeeping issue.")
]

# Generate Complaints spread over the last 40 days
for day_offset in range(40, -1, -1):
    complaint_date = today - datetime.timedelta(days=day_offset)
    # Generate 0 to 2 complaints per day to simulate historical volume
    num_complaints = random.randint(0, 2)
    for _ in range(num_complaints):
        sample = random.choice(complaint_samples)
        title, category, priority, location, ai_explanation = sample
        
        # Randomly choose resident
        res = random.choice(resident_users)
        
        # Decide status based on how old the complaint is
        # Older complaints are mostly resolved, newer ones are open/in progress
        if day_offset > 15:
            status = "Resolved"
        elif day_offset > 5:
            status = random.choice(["Resolved", "In Progress"])
        else:
            status = random.choice(["Open", "In Progress"])
            
        resolved_at = None
        if status == "Resolved":
            # Resolved between 4 to 72 hours after creation
            resolved_at = complaint_date + datetime.timedelta(hours=random.randint(4, 72))
            
        c = Complaint(
            title=title,
            description=f"Resident report: {title} Verification requested.",
            category=category,
            location=location,
            priority=priority,
            status=status,
            resident_id=res.id,
            ai_confidence_score=round(random.uniform(0.78, 0.98), 2),
            ai_explanation=ai_explanation,
            created_at=complaint_date,
            resolved_at=resolved_at,
            updated_at=resolved_at or complaint_date
        )
        db.add(c)
        db.commit()
        db.refresh(c)
        
        # Add history log
        h1 = ComplaintHistory(
            complaint_id=c.id,
            status_from="Open",
            status_to="Open" if status == "Open" else ("In Progress" if status == "In Progress" else "Resolved"),
            changed_by_id=admin_user.id if status != "Open" else res.id,
            comment="Initial complaint logged by resident." if status == "Open" else "Updated status during dispatch audit.",
            created_at=complaint_date
        )
        db.add(h1)
        
        if status == "Resolved" and resolved_at:
            h2 = ComplaintHistory(
                complaint_id=c.id,
                status_from="In Progress",
                status_to="Resolved",
                changed_by_id=admin_user.id,
                comment="Issue verified and closed by maintenance engineer.",
                created_at=resolved_at
            )
            db.add(h2)
            
        db.commit()

print("Database seeding completed successfully with default admin, resident users, notices, assets, and rich history of complaints!")
db.close()
