-- Add test patient records for doctor1@mindcare.ai
-- Run this with: psql -U postgres -d mindcare -f add_patients.sql

-- First, get the doctor's user ID
DO $$
DECLARE
    v_doctor_id INTEGER;
    v_user_id INTEGER;
BEGIN
    -- Get doctor user ID
    SELECT id INTO v_doctor_id FROM users WHERE email = 'doctor1@mindcare.ai';
    
    IF v_doctor_id IS NULL THEN
        RAISE NOTICE 'Doctor not found!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found doctor with ID: %', v_doctor_id;
    
    -- Add all regular users as patients for this doctor
    FOR v_user_id IN (SELECT id FROM users WHERE role = 'user' LIMIT 10)
    LOOP
        -- Check if record already exists
        IF NOT EXISTS (
            SELECT 1 FROM patient_records 
            WHERE user_id = v_user_id AND doctor_id = v_doctor_id
        ) THEN
            INSERT INTO patient_records (
                user_id,
                doctor_id,
                diagnosis,
                medical_history,
                current_medications,
                allergies,
                notes,
                status,
                created_at,
                updated_at
            ) VALUES (
                v_user_id,
                v_doctor_id,
                'General mental health consultation',
                'Initial assessment - patient shows interest in mental health support',
                'None reported',
                'None known',
                'Patient assigned for regular monitoring and support',
                'active',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Added patient ID: %', v_user_id;
        ELSE
            RAISE NOTICE 'Patient ID % already assigned', v_user_id;
        END IF;
    END LOOP;
    
    -- Show final count
    RAISE NOTICE 'Total patients for doctor: %', (
        SELECT COUNT(*) FROM patient_records WHERE doctor_id = v_doctor_id
    );
END $$;
