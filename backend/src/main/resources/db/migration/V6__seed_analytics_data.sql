-- V6__seed_analytics_data.sql
-- Seed sample data for Analytics dashboard

-- Insert 10 random sessions
INSERT INTO training_sessions (id, course_id, trainer_id, session_date, duration_hours, delivery_mode, capacity, region, location, project, status, created_at, updated_at)
SELECT
    gen_random_uuid(),
    c.id,
    c.trainer_id,
    CURRENT_TIMESTAMP - (random() * interval '90 days'),
    4.0,
    'Virtual',
    30,
    'North America',
    'New York',
    'Project Alpha',
    'Completed',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM courses c
LIMIT 10;

-- Update course analytics fields
UPDATE courses 
SET 
    learning_pillar = 'Technical Skill',
    is_ai_training = true,
    estimated_learning_hours = 4,
    delivery_type = 'Virtual',
    certification_available = true
WHERE duration_minutes > 0;
