-- Create Assessments Table
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    instructions TEXT NOT NULL,
    due_at TIMESTAMP WITHOUT TIME ZONE,
    points INTEGER NOT NULL DEFAULT 100,
    assignment_scope VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    language VARCHAR(50),
    starter_code TEXT,
    quiz_file_name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_organization ON assessments(organization_id);

-- Create Assessment Questions Table
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    answer VARCHAR(255) NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1,
    explanation TEXT
);

CREATE INDEX idx_questions_assessment ON assessment_questions(assessment_id);

-- Create Assessment Question Options Table (for @ElementCollection string lists)
CREATE TABLE assessment_question_options (
    assessment_question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL
);

-- Create Assessment Test Cases Table
CREATE TABLE assessment_test_cases (
    id UUID PRIMARY KEY,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_test_cases_assessment ON assessment_test_cases(assessment_id);

-- Create Assessment Batch Allocations (Join Table)
CREATE TABLE assessment_batch_allocations (
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL,
    PRIMARY KEY (assessment_id, batch_id)
);

-- Create Assessment Student Allocations (Join Table)
CREATE TABLE assessment_student_allocations (
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    PRIMARY KEY (assessment_id, student_id)
);

-- Create Student Questions (Discussion Forum Q&A)
CREATE TABLE student_questions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    answer TEXT,
    asked_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_questions_student ON student_questions(student_id);
CREATE INDEX idx_questions_organization ON student_questions(organization_id);
