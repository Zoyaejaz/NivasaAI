import datetime
from database import SessionLocal, Base, engine
from models import User
from auth import hash_password

# Clear existing tables and recreate
print("Resetting database tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("Seeding database...")

# Create Admin User (required since admin registration is disabled in the API)
admin_pwd = hash_password("admin123")
admin_user = User(
    email="admin@nivasa.ai",
    hashed_password=admin_pwd,
    full_name="Aarav Sharma",
    role="admin",
    flat_number="Tower 1-101",
    phone_number="9876543210"
)
db.add(admin_user)

# Create Resident User (for quick login/testing without having to register first)
res_pwd = hash_password("resident123")
resident_user = User(
    email="resident@nivasa.ai",
    hashed_password=res_pwd,
    full_name="Neha Patel",
    role="resident",
    flat_number="Tower 2-504",
    phone_number="8765432109"
)
db.add(resident_user)

db.commit()

print("Database seeding completed successfully with only default admin and resident users!")
db.close()

