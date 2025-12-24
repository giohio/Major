#!/usr/bin/env python3
"""
Database Migration Runner
Executes SQL migration files in order and tracks migration state

Usage:
    python run_migrations.py                    # Run all pending migrations
    python run_migrations.py --rollback         # Rollback last migration
    python run_migrations.py --status           # Show migration status
    python run_migrations.py --specific 003     # Run specific migration
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Look for .env in backend directory (parent of migrations)
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(env_path)
    print(f"✓ Loaded environment from: {env_path}")
except ImportError:
    print("⚠️ python-dotenv not installed. Install with: pip install python-dotenv")
    print("⚠️ Falling back to environment variables...")

# Database connection settings (load from environment)
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', os.getenv('DB_HOST', 'localhost')),
    'port': os.getenv('POSTGRES_PORT', os.getenv('DB_PORT', '5432')),
    'database': os.getenv('POSTGRES_DB', os.getenv('DB_NAME', 'mental_care_db')),
    'user': os.getenv('POSTGRES_USER', os.getenv('DB_USER', 'postgres')),
    'password': os.getenv('POSTGRES_PASSWORD', os.getenv('DB_PASSWORD', '')),
}

print(f"📊 Database config:")
print(f"  Host: {DB_CONFIG['host']}")
print(f"  Port: {DB_CONFIG['port']}")
print(f"  Database: {DB_CONFIG['database']}")
print(f"  User: {DB_CONFIG['user']}")
print(f"  Password: {'*' * len(DB_CONFIG['password']) if DB_CONFIG['password'] else '(empty)'}")


MIGRATIONS_DIR = Path(__file__).parent
BACKUP_DIR = MIGRATIONS_DIR / 'backups'

def create_migrations_table(conn):
    """Create table to track migration state"""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_file VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT NOW(),
                success BOOLEAN DEFAULT TRUE,
                error_message TEXT,
                execution_time_ms INTEGER
            );
        """)
    conn.commit()
    print("✓ Migration tracking table ready")

def get_applied_migrations(conn):
    """Get list of already-applied migrations"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT migration_file 
            FROM schema_migrations 
            WHERE success = TRUE 
            ORDER BY id
        """)
        return [row[0] for row in cur.fetchall()]

def get_migration_files():
    """Get all migration SQL files in order"""
    files = sorted(MIGRATIONS_DIR.glob('0*.sql'))
    return files

def backup_database():
    """Create database backup before migrations"""
    BACKUP_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = BACKUP_DIR / f'backup_{timestamp}.sql'
    
    cmd = f'pg_dump -h {DB_CONFIG["host"]} -U {DB_CONFIG["user"]} -d {DB_CONFIG["database"]} > {backup_file}'
    
    print(f"Creating backup: {backup_file}")
    os.system(cmd)
    print(f"✓ Backup created: {backup_file}")
    return backup_file

def run_migration(conn, migration_file):
    """Execute a single migration file"""
    print(f"\n{'='*60}")
    print(f"Running: {migration_file.name}")
    print(f"{'='*60}")
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    start_time = datetime.now()
    
    try:
        with conn.cursor() as cur:
            # Execute migration
            cur.execute(sql)
            
        conn.commit()
        
        # Record success
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO schema_migrations (migration_file, success, execution_time_ms)
                VALUES (%s, TRUE, %s)
            """, (migration_file.name, int(execution_time)))
        
        conn.commit()
        
        print(f"✓ SUCCESS ({execution_time:.0f}ms)")
        return True
        
    except Exception as e:
        conn.rollback()
        
        # Record failure
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO schema_migrations (migration_file, success, error_message)
                VALUES (%s, FALSE, %s)
            """, (migration_file.name, str(e)))
        
        conn.commit()
        
        print(f"✗ FAILED: {str(e)}")
        return False

def show_status(conn):
    """Show migration status"""
    applied = get_applied_migrations(conn)
    all_migrations = get_migration_files()
    
    print("\n" + "="*60)
    print("MIGRATION STATUS")
    print("="*60)
    
    for mig_file in all_migrations:
        status = "✓ APPLIED" if mig_file.name in applied else "○ PENDING"
        print(f"{status}  {mig_file.name}")
    
    print(f"\nTotal: {len(all_migrations)} migrations")
    print(f"Applied: {len(applied)}")
    print(f"Pending: {len(all_migrations) - len(applied)}")

def main():
    parser = argparse.ArgumentParser(description='Run database migrations')
    parser.add_argument('--status', action='store_true', help='Show migration status')
    parser.add_argument('--backup', action='store_true', help='Create backup before running')
    parser.add_argument('--specific', type=str, help='Run specific migration (e.g., 003)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would run without executing')
    
    args = parser.parse_args()
    
    # Connect to database
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print(f"✓ Connected to {DB_CONFIG['database']}")
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return 1
    
    # Create migrations tracking table
    create_migrations_table(conn)
    
    # Show status if requested
    if args.status:
        show_status(conn)
        return 0
    
    # Get migrations to run
    applied = get_applied_migrations(conn)
    all_migrations = get_migration_files()
    
    if args.specific:
        # Run specific migration
        specific_file = next(
            (f for f in all_migrations if args.specific in f.name), 
            None
        )
        if not specific_file:
            print(f"✗ Migration {args.specific} not found")
            return 1
        
        migrations_to_run = [specific_file]
    else:
        # Run pending migrations
        migrations_to_run = [
            f for f in all_migrations 
            if f.name not in applied
        ]
    
    if not migrations_to_run:
        print("\n✓ No pending migrations")
        return 0
    
    # Show what will run
    print(f"\n{'='*60}")
    print(f"Will run {len(migrations_to_run)} migration(s):")
    print(f"{'='*60}")
    for mig in migrations_to_run:
        print(f"  - {mig.name}")
    
    if args.dry_run:
        print("\n[DRY RUN] No changes made")
        return 0
    
    # Backup if requested
    if args.backup:
        backup_database()
    
    # Confirm
    if not args.specific:
        response = input("\nProceed? [y/N]: ")
        if response.lower() != 'y':
            print("Aborted")
            return 0
    
    # Run migrations
    success_count = 0
    for mig_file in migrations_to_run:
        if run_migration(conn, mig_file):
            success_count += 1
        else:
            print(f"\n✗ Migration failed. Stopping.")
            break
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Successful: {success_count}/{len(migrations_to_run)}")
    
    if success_count == len(migrations_to_run):
        print("✓ All migrations completed successfully!")
        return 0
    else:
        print("✗ Some migrations failed. Check logs above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
