-- ============================================
-- Application Registry Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Applications Table
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_name VARCHAR(255) NOT NULL,
    description TEXT,
    developer_name VARCHAR(255) NOT NULL,
    development_team VARCHAR(255),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    version VARCHAR(50) DEFAULT '1.0',
    purpose TEXT,
    is_existing BOOLEAN DEFAULT true,
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Technologies Table
-- ============================================
CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technology_name VARCHAR(255) NOT NULL,
    technology_type VARCHAR(50) NOT NULL CHECK (
        technology_type IN (
            'Programming Language',
            'Frontend',
            'Backend',
            'Database',
            'Framework',
            'Library'
        )
    ),
    UNIQUE(technology_name, technology_type)
);

-- ============================================
-- 3. Application Technologies Junction Table
-- ============================================
CREATE TABLE IF NOT EXISTS application_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    UNIQUE(application_id, technology_id)
);

-- ============================================
-- 4. Application Relationships Table
-- ============================================
CREATE TABLE IF NOT EXISTS application_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    related_application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (
        relationship_type IN (
            'Similar To',
            'Related To',
            'Improved Version Of',
            'Alternative To',
            'Depends On',
            'Replaces'
        )
    ),
    UNIQUE(application_id, related_application_id, relationship_type)
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_applications_name ON applications(application_name);
CREATE INDEX IF NOT EXISTS idx_applications_developer ON applications(developer_name);
CREATE INDEX IF NOT EXISTS idx_applications_category ON applications(category);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_app_tech_app_id ON application_technologies(application_id);
CREATE INDEX IF NOT EXISTS idx_app_tech_tech_id ON application_technologies(technology_id);
CREATE INDEX IF NOT EXISTS idx_app_rel_app_id ON application_relationships(application_id);
CREATE INDEX IF NOT EXISTS idx_app_rel_related_id ON application_relationships(related_application_id);

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Disable RLS for public access (no auth)
-- ============================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_relationships ENABLE ROW LEVEL SECURITY;

-- Allow all operations without authentication
CREATE POLICY "Allow all operations on applications" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on technologies" ON technologies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on application_technologies" ON application_technologies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on application_relationships" ON application_relationships FOR ALL USING (true) WITH CHECK (true);
