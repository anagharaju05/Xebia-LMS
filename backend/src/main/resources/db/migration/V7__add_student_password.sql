-- V7__add_student_password.sql
ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255);
