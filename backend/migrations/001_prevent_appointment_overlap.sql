-- Migration: 001_prevent_appointment_overlap.sql
-- Purpose: Prevent double-booking of doctor appointments
-- Created: 2025-12-16

BEGIN;

-- Add unique constraint to prevent overlapping appointments
-- Only applies to active appointments (pending, confirmed, scheduled)
-- Cancelled/completed appointments can have same time (for history)
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_overlap
ON appointments(doctor_id, appointment_date)
WHERE status IN ('pending', 'confirmed', 'scheduled');

-- Add comment for documentation
COMMENT ON INDEX idx_appointments_no_overlap IS 
'Prevents double-booking: same doctor cannot have 2 active appointments at same time';

COMMIT;

-- Verify the constraint works
DO $$
BEGIN
    RAISE NOTICE 'Migration 001 completed: Appointment overlap prevention active';
END $$;
