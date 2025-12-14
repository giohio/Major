"""
Database migration script to add new fields to User model
Run this after updating the model: python migrate_user_fields.py
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db

def migrate_user_fields():
    """Add new fields to users table"""
    print("🔄 Starting database migration...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Check if columns already exist
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            migrations_needed = []
            
            if 'date_of_birth' not in columns:
                migrations_needed.append("ALTER TABLE users ADD COLUMN date_of_birth DATE;")
            
            if 'address' not in columns:
                migrations_needed.append("ALTER TABLE users ADD COLUMN address VARCHAR(255);")
            
            if 'settings' not in columns:
                migrations_needed.append("ALTER TABLE users ADD COLUMN settings TEXT;")
            
            if not migrations_needed:
                print("✅ All fields already exist. No migration needed.")
                return
            
            print(f"📝 Found {len(migrations_needed)} migrations to run:")
            for migration in migrations_needed:
                print(f"   - {migration}")
            
            # Execute migrations
            for migration in migrations_needed:
                db.session.execute(db.text(migration))
            
            db.session.commit()
            
            print("✅ Migration completed successfully!")
            print(f"   Added {len(migrations_needed)} new fields to users table")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    migrate_user_fields()
