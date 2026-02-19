-- Migration: 004_remove_emotion_duplication.sql
-- Purpose: Remove duplicate emotion data storage
-- Created: 2025-12-16
-- Strategy: Deprecate emotion_logs table, use chat_messages as single source

BEGIN;

-- Step 1: Create backup table
CREATE TABLE IF NOT EXISTS emotion_logs_backup AS 
SELECT * FROM emotion_logs;

-- Step 2: Rename to indicate deprecation
ALTER TABLE emotion_logs RENAME TO _deprecated_emotion_logs;

-- Step 3: Create view to replace emotion_logs queries
CREATE OR REPLACE VIEW emotion_analytics AS
SELECT 
    cm.id as log_id,
    cs.user_id,
    cm.emotion_detected as emotion,
    cm.sentiment_score,
    cm.risk_level,
    cm.created_at as logged_at
FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.id
WHERE cm.role = 'user'  -- Only user messages
  AND cm.emotion_detected IS NOT NULL;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Migration 004 completed: Emotion duplication removed';
    RAISE NOTICE '  - Deprecated emotion_logs table';
    RAISE NOTICE '  - Created emotion_analytics view';
    RAISE NOTICE '  - To fully drop: DROP TABLE _deprecated_emotion_logs CASCADE;';
END $$;
