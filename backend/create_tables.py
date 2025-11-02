"""Create database tables"""
from app import create_app
from app.extensions import db
from app.models import models

app = create_app()

with app.app_context():
    print("Creating all database tables...")
    db.create_all()
    print("✅ All tables created successfully!")
    
    # Print all tables
    print("\n📊 Tables created:")
    for table in db.metadata.sorted_tables:
        print(f"  - {table.name}")
