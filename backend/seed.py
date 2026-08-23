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

print("Database seeding completed successfully with default admin and resident users!")
db.close()
