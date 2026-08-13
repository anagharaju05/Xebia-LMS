-- Insert Demo Students used by the frontend
INSERT INTO students (id, organization_id, name, email, cohort, status, password) VALUES
('38f094c8-9a6c-4eac-a04a-a016709c1018', '123e4567-e89b-12d3-a456-426614174000', 'Aarav Kumar', 'student@xebia.com', 'Backend Engineering', 'ACTIVE', 'password123'),
('38f094c8-043c-4dac-a04a-a010e81a1018', '123e4567-e89b-12d3-a456-426614174000', 'Priya Sharma', 'priya.sharma@xebia.com', 'Frontend Engineering', 'ACTIVE', 'password123'),
('38f094c8-4aac-418d-a058-f84ec8ea7078', '123e4567-e89b-12d3-a456-426614174000', 'Daniel Joseph', 'daniel.joseph@xebia.com', 'Data Academy', 'ACTIVE', 'password123')
ON CONFLICT (email) DO NOTHING;
