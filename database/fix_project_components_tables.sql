-- Fix project components and community types tables
-- Run this in Supabase SQL Editor

-- Create components table if it doesn't exist
CREATE TABLE IF NOT EXISTS components (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_types (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_components junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_components (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  component_id VARCHAR(10) REFERENCES components(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, component_id)
);

-- Create project_community_types junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_community_types (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  community_type_id VARCHAR(20) REFERENCES community_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, community_type_id)
);

-- Insert CEST components if they don't exist
INSERT INTO components (id, name, description, color) VALUES
('sel', 'Sustainable Enterprise & Livelihoods', 'Projects focused on sustainable business and livelihood development', '#eb9c25'),
('hn', 'Health & Nutrition', 'Health and nutrition improvement initiatives', '#efd20f'),
('hrd', 'Human Resource Development', 'Education and skills development programs', '#3823f5'),
('drrm', 'DRRM & CCA', 'Disaster Risk Reduction Management and Climate Change Adaptation', '#dc2626'),
('bgcet', 'Bio-Circular-Green Economy Technologies', 'Environmental and green technology initiatives', '#0ecb1a'),
('dg', 'Digital Governance Tools', 'Digital governance and ICT solutions', '#e319a7')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color;

-- Insert community types if they don't exist
INSERT INTO community_types (id, name, description, color) VALUES
('gida', 'GIDA Communities', 'Geographically Isolated and Disadvantaged Areas', '#0891b2'),
('conflict', 'Communities-in-conflict', 'Areas affected by conflict situations', '#dc2626'),
('indigenous', 'Indigenous People', 'Indigenous communities and cultural groups', '#7c3aed'),
('womens', 'Women''s Organization', 'Women-focused community organizations', '#db2777'),
('marginalized', 'Marginalized Sector', 'Marginalized and vulnerable populations', '#d97706'),
('landless', 'Landless Rural Farmers', 'Farmers without land ownership', '#65a30d'),
('artisanal', 'Artisanal Fisher folks', 'Small-scale fishing communities', '#0f766e')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_components_project ON project_components(project_id);
CREATE INDEX IF NOT EXISTS idx_project_components_component ON project_components(component_id);
CREATE INDEX IF NOT EXISTS idx_project_community_types_project ON project_community_types(project_id);
CREATE INDEX IF NOT EXISTS idx_project_community_types_community ON project_community_types(community_type_id);

-- Enable RLS on new tables
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_community_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to view components" ON components;
DROP POLICY IF EXISTS "Allow authenticated users to view community types" ON community_types;
DROP POLICY IF EXISTS "Allow authenticated users to view project components" ON project_components;
DROP POLICY IF EXISTS "Allow authenticated users to manage project components" ON project_components;
DROP POLICY IF EXISTS "Allow authenticated users to view project community types" ON project_community_types;
DROP POLICY IF EXISTS "Allow authenticated users to manage project community types" ON project_community_types;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view components" ON components FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view community types" ON community_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view project components" ON project_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage project components" ON project_components FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view project community types" ON project_community_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to manage project community types" ON project_community_types FOR ALL TO authenticated USING (true);

-- Verify the setup
SELECT 'components' as table_name, COUNT(*) as record_count FROM components
UNION ALL
SELECT 'community_types' as table_name, COUNT(*) as record_count FROM community_types
UNION ALL
SELECT 'project_components' as table_name, COUNT(*) as record_count FROM project_components
UNION ALL
SELECT 'project_community_types' as table_name, COUNT(*) as record_count FROM project_community_types;