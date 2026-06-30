-- Create Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cohort VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_organization ON students(organization_id);

-- Create Student Courses Table
CREATE TABLE student_courses (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_slug VARCHAR(255) NOT NULL,
    PRIMARY KEY (student_id, course_slug)
);

-- Create Student Assignments Table
CREATE TABLE student_assignments (
    id VARCHAR(255) PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    due_date VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'Assigned',
    submission TEXT,
    submitted_at VARCHAR(100),
    score INTEGER,
    review_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_assignments_student ON student_assignments(student_id);

-- Create Student Completed Lessons Table
CREATE TABLE student_completed_lessons (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lesson_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (student_id, lesson_id)
);

-- Create Student Assessment Results Table
CREATE TABLE student_assessment_results (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_id VARCHAR(255) NOT NULL,
    score INTEGER,
    status VARCHAR(100),
    submitted_at VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_results_student ON student_assessment_results(student_id);

-- Create Student Notifications Table
CREATE TABLE student_notifications (
    id VARCHAR(255) PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    channel VARCHAR(100),
    time_str VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_student ON student_notifications(student_id);

-- Create Student Feedback Table
CREATE TABLE student_feedback (
    id VARCHAR(255) PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL,
    message TEXT,
    submitted_at VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Lesson Comments Table
CREATE TABLE lesson_comments (
    id VARCHAR(255) PRIMARY KEY,
    lesson_slug VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    created_at_str VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_comments_slug ON lesson_comments(lesson_slug);

-- Create Lesson Comment Replies Table
CREATE TABLE lesson_comment_replies (
    id VARCHAR(255) PRIMARY KEY,
    comment_id VARCHAR(255) NOT NULL REFERENCES lesson_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    created_at_str VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comment_replies_comment ON lesson_comment_replies(comment_id);
