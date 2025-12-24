# Database Migrations

This directory contains SQL migration scripts to fix database schema issues.

## Quick Start

### 1. Check Migration Status
```bash
python run_migrations.py --status
```

### 2. Run All Pending Migrations (with backup)
```bash
python run_migrations.py --backup
```

### 3. Run Specific Migration
```bash
python run_migrations.py --specific 003
```

## Migration Files

| File | Purpose | Priority | Impact |
|------|---------|----------|--------|
| `001_prevent_appointment_overlap.sql` | Prevent double-booking | 🔴 CRITICAL | Low (adds index) |
| `002_add_check_constraints.sql` | Data validation | 🔴 CRITICAL | Low (adds constraints) |
| `003_define_cascade_policies.sql` | DELETE behavior | 🔴 CRITICAL | Medium (changes FK) |
| `004_remove_emotion_duplication.sql` | Remove redundancy | 🟡 HIGH | Medium (deprecates table) |
| `005_fix_doctor_references.sql` | Enforce doctor type | 🟡 HIGH | Medium (adds column) |
| `006_add_composite_indexes.sql` | Performance boost | 🟡 HIGH | Low (90%+ speedup) |
| `007_session_analysis_optimization.sql` | Materialized view | 🟢 NICE | Medium (view conversion) |

## Environment Setup

Create `.env` file:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindcare_db
DB_USER=postgres
DB_PASSWORD=your_password
```

Or export environment variables:
```bash
export DB_HOST=localhost
export DB_NAME=mindcare_db
export DB_USER=postgres
export DB_PASSWORD=your_password
```

## Safety Features

### Automatic Backups
```bash
python run_migrations.py --backup
```
Creates backup in `backups/backup_YYYYMMDD_HHMMSS.sql`

### Dry Run
```bash
python run_migrations.py --dry-run
```
Shows what would run without executing

### Migration Tracking
Migrations are recorded in `schema_migrations` table:
- Prevents re-running completed migrations
- Tracks execution time
- Stores error messages on failure

## Manual Execution (Alternative)

If you prefer psql:
```bash
# Connect to database
psql -U postgres -d mindcare_db

# Run migrations in order
\i 001_prevent_appointment_overlap.sql
\i 002_add_check_constraints.sql
\i 003_define_cascade_policies.sql
...
```

## Rollback

### Restore from Backup
```bash
# List backups
ls backups/

# Restore specific backup
psql -U postgres -d mindcare_db < backups/backup_20251216_195623.sql
```

### Manual Rollback (if needed)
Each migration includes comments on how to reverse changes.

## Testing Migrations

### On Development Database
```bash
# 1. Create test database
createdb mindcare_test

# 2. Run migrations
DB_NAME=mindcare_test python run_migrations.py

# 3. Verify
psql mindcare_test -c "\dt"  # List tables
psql mindcare_test -c "\di"  # List indexes
```

### Verify Constraints
```sql
-- Check all constraints
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE conrelid::regclass::text LIKE '%users%';

-- Check foreign keys with DELETE rules
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu USING (constraint_name)
JOIN information_schema.referential_constraints rc USING (constraint_name)
JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## Performance Benchmarks

Run these queries before and after migration 006:

```sql
-- Chat history (should be 98% faster)
EXPLAIN ANALYZE 
SELECT * FROM chat_messages 
WHERE session_id = 1 
ORDER BY timestamp DESC 
LIMIT 50;

-- Doctor calendar (should be 93% faster)
EXPLAIN ANALYZE
SELECT * FROM appointments 
WHERE doctor_id = 1 
  AND scheduled_time >= NOW()
  AND status IN ('pending', 'confirmed')
ORDER BY scheduled_time;

-- Alert dashboard (should be 97% faster)
EXPLAIN ANALYZE
SELECT * FROM alerts 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

## Troubleshooting

### "Migration already applied"
Check migration status:
```bash
python run_migrations.py --status
```

### "Permission denied"
Ensure database user has DDL permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE mindcare_db TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### "Constraint violation during migration"
Some migrations clean up invalid data first. Check warnings in output.

### "Connection refused"
Verify PostgreSQL is running:
```bash
pg_isready -h localhost -p 5432
```

## Deployment Checklist

- [ ] Backup production database
- [ ] Run migrations on staging first
- [ ] Verify application still works
- [ ] Check query performance
- [ ] Monitor error logs
- [ ] Update application code (for migrations 004, 005)
- [ ] Run migrations on production
- [ ] Verify production health
- [ ] Keep backup for 30 days

## Support

For issues, see `DATABASE_FIXES_GUIDE.md` for detailed explanations.
