-- Insert Default Categories
INSERT INTO categories (id, organization_id, parent_category_id, name, description, status) VALUES
('c0a80101-0000-0000-0000-000000000001', '123e4567-e89b-12d3-a456-426614174000', NULL, 'Cloud & Infrastructure', 'Google Cloud Platform, AWS, DevOps, and Kubernetes architectures.', 'ACTIVE'),
('c0a80101-0000-0000-0000-000000000002', '123e4567-e89b-12d3-a456-426614174000', NULL, 'Software Development', 'React, Next.js, Node.js, and Modern Javascript engineering.', 'ACTIVE'),
('c0a80101-0000-0000-0000-000000000003', '123e4567-e89b-12d3-a456-426614174000', NULL, 'Agile & Leadership', 'Scrum, Kanban, Agile coaching, and Product Management.', 'ACTIVE'),
('c0a80101-0000-0000-0000-000000000004', '123e4567-e89b-12d3-a456-426614174000', NULL, 'Data & Artificial Intelligence', 'Machine Learning, BigQuery, Spark, and Generative AI.', 'INACTIVE');

-- Insert Default Courses
INSERT INTO courses (id, organization_id, category_id, trainer_id, course_code, course_name, short_description, duration_minutes, difficulty, status, thumbnail_url) VALUES
('c0a80101-1111-0000-0000-000000000001', '123e4567-e89b-12d3-a456-426614174000', 'c0a80101-0000-0000-0000-000000000001', '123e4567-e89b-12d3-a456-426614174000', 'GCP-ARCH', 'Google Cloud Architect Academy', 'Master GCP services, VPCs, GKE clusters, and professional cloud architect practices.', 60, 'INTERMEDIATE', 'PUBLISHED', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=500&q=80'),
('c0a80101-1111-0000-0000-000000000002', '123e4567-e89b-12d3-a456-426614174000', 'c0a80101-0000-0000-0000-000000000002', '123e4567-e89b-12d3-a456-426614174000', 'REACT-ADV', 'Advanced React & Architecture Patterns', 'Explore performance optimization, custom hook frameworks, and global state topologies.', 0, 'ADVANCED', 'PUBLISHED', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=500&q=80'),
('c0a80101-1111-0000-0000-000000000003', '123e4567-e89b-12d3-a456-426614174000', 'c0a80101-0000-0000-0000-000000000003', '123e4567-e89b-12d3-a456-426614174000', 'AGILE-PRO', 'Certified Agile Professional Guide', 'Align team structures, manage backlogs, and run effective sprint ceremonies.', 0, 'BEGINNER', 'PUBLISHED', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80');
