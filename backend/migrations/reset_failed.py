#!/usr/bin/env python3
"""
Reset Failed Migrations
Cleans up failed migration records from previous attempts
"""

import os
import sys
from pathlib import Path
import psycopg2

# Load .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(env_path)
except:
    pass

# Database config
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', '5432'),
    'database': os.getenv('POSTGRES_DB', 'mental_care_db'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', ''),
}

print("🔄 Resetting failed migrations...")
print(f"Database: {DB_CONFIG['database']}")

try:
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Delete failed migrations
    cur.execute("DELETE FROM schema_migrations WHERE success = FALSE")
    failed_count = cur.rowcount
    
    conn.commit()
    
    print(f"✅ Deleted {failed_count} failed migration records")
    
    # Show remaining
    cur.execute("SELECT migration_file, applied_at, success FROM schema_migrations ORDER BY id")
    rows = cur.fetchall()
    
    if rows:
        print(f"\n📋 Remaining migrations in database:")
        for row in rows:
            status = "✅" if row[2] else "❌"
            print(f"  {status} {row[0]} (applied: {row[1]})")
    else:
        print("\n✅ No migrations in database. Ready for fresh start!")
    
    cur.close()
    conn.close()
    
    print("\n✅ Reset complete! You can now run:")
    print("   python run_migrations.py --backup")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
