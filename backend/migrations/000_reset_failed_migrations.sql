-- Fix Failed Migrations
-- Run this to clean up failed migration attempts

BEGIN;

-- Delete failed migration records
DELETE FROM schema_migrations 
WHERE success = FALSE;

-- Also clear the specific failed migration
DELETE FROM schema_migrations
WHERE migration_file = '001_prevent_appointment_overlap.sql';

-- Show remaining migrations
SELECT * FROM schema_migrations ORDER BY id;

COMMIT;

-- Now you can run migrations again
-- python run_migrations.py --backup
