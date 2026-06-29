-- Add metadata column to Categories
ALTER TABLE categories ADD COLUMN metadata TEXT;

-- Add metadata column to Courses
ALTER TABLE courses ADD COLUMN metadata TEXT;

-- Add metadata column to Modules
ALTER TABLE modules ADD COLUMN metadata TEXT;

-- Add metadata column to Submodules
ALTER TABLE submodules ADD COLUMN metadata TEXT;
