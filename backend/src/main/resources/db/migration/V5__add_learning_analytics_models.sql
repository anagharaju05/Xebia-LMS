-- V5__add_learning_analytics_models.sql
-- Add analytics fields to existing tables without removing anything.

-- 1. Extend students (acting as employees)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_unit VARCHAR(100),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS project VARCHAR(100),
ADD COLUMN IF NOT EXISTS practice VARCHAR(100),
ADD COLUMN IF NOT EXISTS employee_grade VARCHAR(50),
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS joining_date TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS project_allocation_date TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS billable_deployment_date TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_students_region ON students(region);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_project ON students(project);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(employee_grade);
CREATE INDEX IF NOT EXISTS idx_students_joining ON students(joining_date);

-- 2. Extend courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS learning_pillar VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_ai_training BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_flagship_program BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certification_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS estimated_learning_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS program_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_courses_pillar ON courses(learning_pillar);

-- 3. Extend student_feedback
ALTER TABLE student_feedback
ADD COLUMN IF NOT EXISTS trainer_rating INTEGER,
ADD COLUMN IF NOT EXISTS session_rating INTEGER,
ADD COLUMN IF NOT EXISTS recommendation_answer BOOLEAN;

-- 4. Create training_sessions
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL,
    session_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    duration_hours NUMERIC(5,2) DEFAULT 0,
    delivery_mode VARCHAR(50),
    capacity INTEGER,
    region VARCHAR(100),
    location VARCHAR(100),
    project VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_course ON training_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON training_sessions(session_date);

-- 5. Create session_attendances (enrollment/nomination)
CREATE TABLE IF NOT EXISTS session_attendances (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    nomination_status VARCHAR(50) DEFAULT 'Pending',
    enrollment_status VARCHAR(50) DEFAULT 'Enrolled',
    attendance_status VARCHAR(50) DEFAULT 'Registered',
    progress_percentage INTEGER DEFAULT 0,
    actual_learning_hours NUMERIC(5,2) DEFAULT 0,
    nominated_at TIMESTAMP WITHOUT TIME ZONE,
    enrolled_at TIMESTAMP WITHOUT TIME ZONE,
    started_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendances_student ON session_attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_session ON session_attendances(session_id);

-- 6. Create student_certifications
CREATE TABLE IF NOT EXISTS student_certifications (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    technology VARCHAR(100),
    provider VARCHAR(100),
    lifecycle_status VARCHAR(50) DEFAULT 'Assigned',
    certificate_url VARCHAR(512),
    expiry_date TIMESTAMP WITHOUT TIME ZONE,
    assigned_at TIMESTAMP WITHOUT TIME ZONE,
    enrolled_at TIMESTAMP WITHOUT TIME ZONE,
    started_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_certifications_student ON student_certifications(student_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON student_certifications(lifecycle_status);

-- 7. Create ai_tool_adoptions
CREATE TABLE IF NOT EXISTS ai_tool_adoptions (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    adoption_status VARCHAR(50) DEFAULT 'Not Started',
    usage_level VARCHAR(50) DEFAULT 'Low',
    first_used_at TIMESTAMP WITHOUT TIME ZONE,
    last_used_at TIMESTAMP WITHOUT TIME ZONE,
    is_power_user BOOLEAN DEFAULT FALSE,
    is_mentor BOOLEAN DEFAULT FALSE,
    is_ambassador BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_adoption_student ON ai_tool_adoptions(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_adoption_tool ON ai_tool_adoptions(tool_name);

-- 8. Create flagship_programs
CREATE TABLE IF NOT EXISTS flagship_programs (
    id UUID PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    completion_target INTEGER DEFAULT 100,
    certification_target INTEGER DEFAULT 100,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
