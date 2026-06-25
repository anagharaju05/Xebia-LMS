-- Create Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Categories
CREATE INDEX idx_categories_organization ON categories(organization_id);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);

-- Create Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    trainer_id UUID NOT NULL,
    course_code VARCHAR(100) NOT NULL UNIQUE,
    course_name VARCHAR(255) NOT NULL,
    short_description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    thumbnail_url VARCHAR(512),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Courses
CREATE INDEX idx_courses_organization ON courses(organization_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_trainer ON courses(trainer_id);

-- Create Modules Table
CREATE TABLE modules (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Modules
CREATE INDEX idx_modules_course ON modules(course_id);

-- Create Submodules Table
CREATE TABLE submodules (
    id UUID PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Submodules
CREATE INDEX idx_submodules_module ON submodules(module_id);

-- Create Contents Table
CREATE TABLE contents (
    id UUID PRIMARY KEY,
    submodule_id UUID NOT NULL REFERENCES submodules(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_data TEXT,
    file_url VARCHAR(512),
    position INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Contents
CREATE INDEX idx_contents_submodule ON contents(submodule_id);
