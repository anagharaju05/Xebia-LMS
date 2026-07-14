-- Seed Students Data from Datasets
INSERT INTO students (id, organization_id, name, email, cohort, status, password) VALUES
('b0a80101-2222-0000-0000-000000000001', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 1', 'test1@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000002', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 2', 'test2@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000003', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 3', 'test3@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000004', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 4', 'test4@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000005', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 5', 'test5@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000006', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 6', 'test6@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000007', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 7', 'test7@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000008', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 8', 'test8@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000009', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 9', 'test9@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000010', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 10', 'test10@load.com', 'Load Batch A', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000011', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 11', 'test11@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000012', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 12', 'test12@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000013', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 13', 'test13@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000014', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 14', 'test14@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000015', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 15', 'test15@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000016', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 16', 'test16@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000017', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 17', 'test17@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000018', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 18', 'test18@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000019', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 19', 'test19@load.com', 'Load Batch B', 'ACTIVE', 'pass'),
('b0a80101-2222-0000-0000-000000000020', '123e4567-e89b-12d3-a456-426614174000', 'Load Tester 20', 'test20@load.com', 'Load Batch B', 'ACTIVE', 'pass')
ON CONFLICT (email) DO NOTHING;
