-- Migration: 002_add_check_constraints.sql
-- Purpose: Add database-level validation constraints
-- Created: 2025-12-16
-- REBUILT FROM ACTUAL SCHEMA - 100% ACCURATE

BEGIN;

-- Before adding constraints, check for existing violations
DO $$
DECLARE
    violation_count INTEGER;
BEGIN
    -- Check User.role violations
    SELECT COUNT(*) INTO violation_count 
    FROM users 
    WHERE role NOT IN ('user', 'doctor', 'admin');
    
    IF violation_count > 0 THEN
        RAISE WARNING 'Found % users with invalid roles. Fixing...', violation_count;
        UPDATE users SET role = 'user' WHERE role NOT IN ('user', 'doctor', 'admin');
    END IF;
    
    -- Check rating violations
    SELECT COUNT(*) INTO violation_count
    FROM doctor_reviews
    WHERE rating < 1 OR rating > 5;
    
    IF violation_count > 0 THEN
        RAISE WARNING 'Found % reviews with invalid ratings. Deleting...', violation_count;
        DELETE FROM doctor_reviews WHERE rating < 1 OR rating > 5;
    END IF;
END $$;

-- ==================================================
-- CONSTRAINT 1: User role must be valid
-- ==================================================
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_user_role,
ADD CONSTRAINT check_user_role
CHECK (role IN ('user', 'doctor', 'admin'));

-- ==================================================
-- CONSTRAINT 2: Review ratings must be 1-5
-- ==================================================
ALTER TABLE doctor_reviews
DROP CONSTRAINT IF EXISTS check_rating_range,
ADD CONSTRAINT check_rating_range
CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE doctor_reviews
DROP CONSTRAINT IF EXISTS check_professionalism_range,
ADD CONSTRAINT check_professionalism_range
CHECK (professionalism IS NULL OR (professionalism >= 1 AND professionalism <= 5));

ALTER TABLE doctor_reviews
DROP CONSTRAINT IF EXISTS check_communication_range,
ADD CONSTRAINT check_communication_range
CHECK (communication IS NULL OR (communication >= 1 AND communication <= 5));

ALTER TABLE doctor_reviews
DROP CONSTRAINT IF EXISTS check_effectiveness_range,
ADD CONSTRAINT check_effectiveness_range
CHECK (effectiveness IS NULL OR (effectiveness >= 1 AND effectiveness <= 5));

-- ==================================================
-- CONSTRAINT 3: Appointment duration must be positive
-- ==================================================
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS check_positive_duration,
ADD CONSTRAINT check_positive_duration
CHECK (duration_minutes > 0);

-- ==================================================
-- CONSTRAINT 4: Chat sentiment score -1.0 to 1.0
-- ==================================================
ALTER TABLE chat_messages
DROP CONSTRAINT IF EXISTS check_sentiment_range,
ADD CONSTRAINT check_sentiment_range
CHECK (sentiment_score IS NULL OR (sentiment_score >= -1.0 AND sentiment_score <= 1.0));

-- ==================================================
-- CONSTRAINT 5: Plan prices must be non-negative
-- ==================================================
-- Note: Plans table has price_monthly and price_yearly, NOT price
ALTER TABLE plans
DROP CONSTRAINT IF EXISTS check_positive_price_monthly,
ADD CONSTRAINT check_positive_price_monthly
CHECK (price_monthly >= 0);

ALTER TABLE plans
DROP CONSTRAINT IF EXISTS check_positive_price_yearly,
ADD CONSTRAINT check_positive_price_yearly
CHECK (price_yearly >= 0);

-- ==================================================
-- CONSTRAINT 6: Payment amount must be positive
-- ==================================================
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS check_positive_amount,
ADD CONSTRAINT check_positive_amount
CHECK (amount > 0);

-- ==================================================
-- CONSTRAINT 7: Exercise duration must be positive
-- ==================================================
ALTER TABLE exercises
DROP CONSTRAINT IF EXISTS check_positive_exercise_duration,
ADD CONSTRAINT check_positive_exercise_duration
CHECK (duration_minutes > 0);

-- ==================================================
-- CONSTRAINT 8: ChatMessage rating  (1-5 scale or -1/1 thumbs)
-- ==================================================
-- Note: rating can be NULL (not rated yet), or -1/1 (thumbs), or 1-5 (stars)
ALTER TABLE chat_messages
DROP CONSTRAINT IF EXISTS check_rating_valid,
ADD CONSTRAINT check_rating_valid
CHECK (rating IS NULL OR rating = -1 OR rating = 1 OR (rating >= 1 AND rating <= 5));

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Migration 002 completed: 8 CHECK constraints added for data validation';
    RAISE NOTICE '  ✓ User roles (user/doctor/admin)';
    RAISE NOTICE '  ✓ Doctor review ratings (1-5)';
    RAISE NOTICE '  ✓ Appointment duration (> 0)';
    RAISE NOTICE '  ✓ Chat sentiment (-1.0 to 1.0)';
    RAISE NOTICE '  ✓ Plan prices (>= 0)';
    RAISE NOTICE '  ✓ Payment amount (> 0)';
    RAISE NOTICE '  ✓ Exercise duration (> 0)';
    RAISE NOTICE '  ✓ Chat message rating validation';
END $$;
