"""
Migration script to add date_of_birth and address columns to users table
"""
from app import create_app
from app.extensions import db
from sqlalchemy import text

def migrate():
    app = create_app()
    
    with app.app_context():
        try:
            print("🔄 Starting migration...")
            
            # Check if columns exist
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name IN ('date_of_birth', 'address')
            """))
            existing_columns = [row[0] for row in result]
            
            # Add date_of_birth if not exists
            if 'date_of_birth' not in existing_columns:
                print("➕ Adding date_of_birth column...")
                db.session.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN date_of_birth DATE NULL
                """))
                print("✅ Added date_of_birth column")
            else:
                print("ℹ️  date_of_birth column already exists")
            
            # Add address if not exists
            if 'address' not in existing_columns:
                print("➕ Adding address column...")
                db.session.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN address VARCHAR(255) NULL
                """))
                print("✅ Added address column")
            else:
                print("ℹ️  address column already exists")
            
            db.session.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate()
