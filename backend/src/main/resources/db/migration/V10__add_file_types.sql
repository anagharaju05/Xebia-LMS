-- Add attachment_name column to assessments table
ALTER TABLE assessments ADD COLUMN attachment_name VARCHAR(255);

-- Create allowed file types join table
CREATE TABLE assessment_allowed_file_types (
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL
);
