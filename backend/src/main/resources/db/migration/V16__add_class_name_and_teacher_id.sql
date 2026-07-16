-- Add class_name and teacher_id columns to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS class_name VARCHAR(255);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(255);

-- Clean up obsolete batch_id column from batch_subjects if it exists due to schema drift
ALTER TABLE batch_subjects DROP COLUMN IF EXISTS batch_id;
