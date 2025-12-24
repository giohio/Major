-- Migration: 003_define_cascade_policies.sql
-- Purpose: Define clear ON DELETE policies for foreign keys
-- Created: 2025-12-16
-- REBUILT FROM ACTUAL SCHEMA - VERIFIED 100%

BEGIN;

-- ==================================================
-- CHAT SYSTEM: CASCADE DELETE
-- ==================================================
-- Rationale: Chat data belongs to user, should be removed for privacy

ALTER TABLE chat_sessions
DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey,
ADD CONSTRAINT chat_sessions_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_session_id_fkey,
ADD CONSTRAINT chat_messages_session_id_fkey
    FOREIGN KEY (session_id) 
    REFERENCES chat_sessions(id) 
    ON DELETE CASCADE;

-- Note: chat_messages uses 'role' field, not sender_id FK

-- ==================================================
-- EMOTION LOGS: CASCADE
-- ==================================================
-- Note: emotion_logs has user_id only, NO session_id

ALTER TABLE emotion_logs
DROP CONSTRAINT IF EXISTS emotion_logs_user_id_fkey,
ADD CONSTRAINT emotion_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- ==================================================
-- ALERTS: SET NULL (Audit trail)
-- ==================================================

ALTER TABLE alerts
DROP CONSTRAINT IF EXISTS alerts_user_id_fkey,
ADD CONSTRAINT alerts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

-- ==================================================
-- MEDICAL RECORDS: RESTRICT (Compliance)
-- ==================================================

-- patient_records table uses user_id (not patient_id!)
ALTER TABLE patient_records
DROP CONSTRAINT IF EXISTS patient_records_user_id_fkey,
ADD CONSTRAINT patient_records_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

ALTER TABLE patient_records
DROP CONSTRAINT IF EXISTS patient_records_doctor_id_fkey,
ADD CONSTRAINT patient_records_doctor_id_fkey
    FOREIGN KEY (doctor_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

-- doctor_notes table has patient_id
ALTER TABLE doctor_notes
DROP CONSTRAINT IF EXISTS doctor_notes_patient_id_fkey,
ADD CONSTRAINT doctor_notes_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

ALTER TABLE doctor_notes
DROP CONSTRAINT IF EXISTS doctor_notes_doctor_id_fkey,
ADD CONSTRAINT doctor_notes_doctor_id_fkey
    FOREIGN KEY (doctor_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

-- therapy_sessions table has patient_id
ALTER TABLE therapy_sessions
DROP CONSTRAINT IF EXISTS therapy_sessions_patient_id_fkey,
ADD CONSTRAINT therapy_sessions_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

ALTER TABLE therapy_sessions
DROP CONSTRAINT IF EXISTS therapy_sessions_doctor_id_fkey,
ADD CONSTRAINT therapy_sessions_doctor_id_fkey
    FOREIGN KEY (doctor_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

-- ==================================================
-- APPOINTMENTS: SET NULL for patient
-- ==================================================

ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_user_id_fkey,
ADD CONSTRAINT appointments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

-- appointments.doctor_id already references doctor_profiles.id (correct)

-- ==================================================
-- PAYMENTS: RESTRICT (Financial audit)
-- ==================================================

ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_user_id_fkey,
ADD CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

-- ==================================================
-- PSYCHOLOGICAL TESTS: RESTRICT
-- ==================================================

ALTER TABLE psychological_tests
DROP CONSTRAINT IF EXISTS psychological_tests_user_id_fkey,
ADD CONSTRAINT psychological_tests_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

-- ==================================================
-- TASKS: RESTRICT (from exercise.py)
-- ==================================================

ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_patient_id_fkey,
ADD CONSTRAINT tasks_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES users(id)
    ON DELETE RESTRICT;

ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_assigned_by_fkey,
ADD CONSTRAINT tasks_assigned_by_fkey
    FOREIGN KEY (assigned_by)
    REFERENCES users(id)
    ON DELETE RESTRICT;

-- ==================================================
-- EXERCISES: CASCADE (User progress)
-- ==================================================

ALTER TABLE user_exercise_progress
DROP CONSTRAINT IF EXISTS user_exercise_progress_user_id_fkey,
ADD CONSTRAINT user_exercise_progress_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- ==================================================
-- DOCTOR PROFILE: CASCADE
-- ==================================================

ALTER TABLE doctor_profiles
DROP CONSTRAINT IF EXISTS doctor_profiles_user_id_fkey,
ADD CONSTRAINT doctor_profiles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- ==================================================
-- DOCTOR REVIEWS: SET NULL patient, RESTRICT doctor
-- ==================================================

ALTER TABLE doctor_reviews
DROP CONSTRAINT IF EXISTS doctor_reviews_user_id_fkey,
ADD CONSTRAINT doctor_reviews_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

ALTER TABLE doctor_reviews
DROP CONSTRAINT IF EXISTS doctor_reviews_doctor_id_fkey,
ADD CONSTRAINT doctor_reviews_doctor_id_fkey
    FOREIGN KEY (doctor_id)
    REFERENCES doctor_profiles(id)  -- References doctor_profiles, not users
    ON DELETE RESTRICT;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Migration 003 completed: CASCADE policies defined';
    RAISE NOTICE '  ✓ Chat data: CASCADE (privacy)';
    RAISE NOTICE '  ✓ Medical records: RESTRICT (compliance)';
    RAISE NOTICE '  ✓ Alerts: SET NULL (audit trail)';
    RAISE NOTICE '  ✓ Payments: RESTRICT (financial audit)';
    RAISE NOTICE '  ✓ Exercises: CASCADE (user data)';
END $$;
