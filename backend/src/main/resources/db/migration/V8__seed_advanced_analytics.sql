-- V7__seed_advanced_analytics.sql
-- Injects advanced mock data for Leadership Analytics

-- 1. Add 15 more students
INSERT INTO students (id, organization_id, name, email, status, region, business_unit, project, employment_type, password)
SELECT 
    gen_random_uuid(),
    '123e4567-e89b-12d3-a456-426614174000',
    'Mock Learner ' || i,
    'learner' || i || '@example.com',
    'ACTIVE',
    CASE WHEN i % 3 = 0 THEN 'Bengaluru (India)' WHEN i % 3 = 1 THEN 'Amsterdam (NL)' ELSE 'Atlanta (USA)' END,
    CASE WHEN i % 4 = 0 THEN 'Engineering' WHEN i % 4 = 1 THEN 'Data Science' WHEN i % 4 = 2 THEN 'Product Management' ELSE 'Human Resources' END,
    'Project Alpha',
    CASE WHEN i % 5 = 0 THEN 'Fresher' ELSE 'Experienced' END,
    'password123'
FROM generate_series(1, 15) AS i;

-- 2. Add 50 session attendances
-- We need 50 random combinations of students and training_sessions
INSERT INTO session_attendances (id, student_id, session_id, course_id, enrollment_status, attendance_status, progress_percentage, actual_learning_hours)
SELECT 
    gen_random_uuid(),
    s.id,
    ts.id,
    ts.course_id,
    'Enrolled',
    'Attended',
    100,
    ts.duration_hours * (0.8 + random() * 0.4) -- random hours between 0.8x and 1.2x of duration
FROM (SELECT id FROM students ORDER BY random() LIMIT 50) s
CROSS JOIN LATERAL (SELECT id, course_id, duration_hours FROM training_sessions ORDER BY random() LIMIT 1) ts;

-- 3. Add 30 feedback ratings
INSERT INTO student_feedback (id, student_id, course_id, rating, message, trainer_rating, session_rating, recommendation_answer)
SELECT
    gen_random_uuid()::varchar,
    sa.student_id,
    sa.course_id::varchar,
    floor(random() * 2 + 4), -- 4 or 5
    'Great session!',
    floor(random() * 2 + 4),
    floor(random() * 2 + 4),
    true
FROM session_attendances sa
ORDER BY random()
LIMIT 30;

-- 4. Add 20 student certifications
INSERT INTO student_certifications (id, student_id, certification_name, technology, provider, lifecycle_status)
SELECT
    gen_random_uuid(),
    s.id,
    CASE WHEN s.rn % 3 = 0 THEN 'AWS Solutions Architect' WHEN s.rn % 3 = 1 THEN 'Google Cloud Professional' ELSE 'Certified Kubernetes Administrator' END,
    CASE WHEN s.rn % 3 = 0 THEN 'AWS' WHEN s.rn % 3 = 1 THEN 'GCP' ELSE 'Kubernetes' END,
    'External',
    'Completed'
FROM (SELECT id, row_number() over () as rn FROM students ORDER BY random() LIMIT 20) s;

-- 5. Add 30 AI tool adoptions
INSERT INTO ai_tool_adoptions (id, student_id, tool_name, adoption_status, usage_level, is_power_user)
SELECT
    gen_random_uuid(),
    s.id,
    CASE WHEN s.rn % 2 = 0 THEN 'GitHub Copilot' ELSE 'ChatGPT Enterprise' END,
    'Active',
    'High',
    CASE WHEN s.rn % 4 = 0 THEN true ELSE false END
FROM (SELECT id, row_number() over () as rn FROM students ORDER BY random() LIMIT 30) s;

-- 6. Add 3 flagship programs
INSERT INTO flagship_programs (id, program_name, start_date, end_date, completion_target, certification_target)
VALUES
    (gen_random_uuid(), 'Engineering Excellence 2024', CURRENT_TIMESTAMP - interval '3 months', CURRENT_TIMESTAMP + interval '3 months', 80, 50),
    (gen_random_uuid(), 'GenAI Masters', CURRENT_TIMESTAMP - interval '1 month', CURRENT_TIMESTAMP + interval '5 months', 90, 70),
    (gen_random_uuid(), 'Cloud Native Journey', CURRENT_TIMESTAMP - interval '6 months', CURRENT_TIMESTAMP - interval '1 month', 100, 100);

-- Make sure courses have learning pillars assigned
UPDATE courses SET learning_pillar = 'Technical Skill' WHERE learning_pillar IS NULL AND duration_minutes > 0;
UPDATE courses SET learning_pillar = 'Leadership' WHERE learning_pillar IS NULL AND duration_minutes = 0;
