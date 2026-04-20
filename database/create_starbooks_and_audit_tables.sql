-- Create STARBOOKS management and audit logging tables
-- Run this in Supabase SQL Editor

-- STARBOOKS Units table
CREATE TABLE starbooks_units (
  id BIGSERIAL PRIMARY KEY,
  unit_code VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(255) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  installation_date DATE,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Maintenance', 'Decommissioned')),
  ip_address INET,
  last_sync TIMESTAMPTZ,
  total_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STARBOOKS Content Categories
CREATE TABLE starbooks_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STARBOOKS Content Items
CREATE TABLE starbooks_content (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id BIGINT REFERENCES starbooks_categories(id) ON DELETE SET NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('ebook', 'video', 'audio', 'document', 'interactive', 'game')),
  file_path VARCHAR(500),
  file_size BIGINT,
  duration INTEGER, -- in seconds for video/audio
  language VARCHAR(10) DEFAULT 'en',
  age_group VARCHAR(50), -- 'children', 'teens', 'adults', 'all'
  difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  tags TEXT[], -- array of tags
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STARBOOKS Usage Analytics
CREATE TABLE starbooks_usage (
  id BIGSERIAL PRIMARY KEY,
  unit_id BIGINT REFERENCES starbooks_units(id) ON DELETE CASCADE,
  content_id BIGINT REFERENCES starbooks_content(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  user_type VARCHAR(50), -- 'student', 'teacher', 'community_member', 'visitor'
  action VARCHAR(50) NOT NULL, -- 'view', 'download', 'search', 'login', 'logout'
  duration INTEGER, -- session duration in seconds
  metadata JSONB, -- additional data like search terms, user agent, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log table for tracking all system changes
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id BIGINT NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_starbooks_units_municipality ON starbooks_units(municipality);
CREATE INDEX idx_starbooks_units_status ON starbooks_units(status);
CREATE INDEX idx_starbooks_content_category ON starbooks_content(category_id);
CREATE INDEX idx_starbooks_content_type ON starbooks_content(content_type);
CREATE INDEX idx_starbooks_content_active ON starbooks_content(is_active);
CREATE INDEX idx_starbooks_usage_unit ON starbooks_usage(unit_id);
CREATE INDEX idx_starbooks_usage_content ON starbooks_usage(content_id);
CREATE INDEX idx_starbooks_usage_created ON starbooks_usage(created_at);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Insert sample STARBOOKS categories
INSERT INTO starbooks_categories (name, description, icon, color, sort_order) VALUES
('Science & Technology', 'Science, technology, and innovation content', '🔬', '#3b82f6', 1),
('Mathematics', 'Mathematical concepts and problem solving', '📊', '#10b981', 2),
('Language & Literature', 'Reading, writing, and language skills', '📚', '#8b5cf6', 3),
('Health & Nutrition', 'Health education and nutrition information', '🏥', '#ef4444', 4),
('Agriculture & Environment', 'Farming, environment, and sustainability', '🌱', '#22c55e', 5),
('Arts & Culture', 'Local culture, arts, and creative content', '🎨', '#f59e0b', 6),
('Life Skills', 'Practical life skills and vocational training', '🛠️', '#6b7280', 7),
('Games & Interactive', 'Educational games and interactive content', '🎮', '#ec4899', 8);

-- Insert sample STARBOOKS units based on equipment data
INSERT INTO starbooks_units (unit_code, location, municipality, province, installation_date, status, total_users, total_sessions) VALUES
('SB-AML-001', 'Gabut Integrated School', 'Amulung', 'Cagayan', '2023-06-15', 'Active', 245, 1250),
('SB-STA-001', 'Aridowen Integrated School', 'Santa Teresita', 'Cagayan', '2023-07-20', 'Active', 180, 890),
('SB-BAG-001', 'Dalin Elementary School', 'Baggao', 'Cagayan', '2023-08-10', 'Active', 320, 1680),
('SB-AML-002', 'Brgy. Manalo Community Center', 'Amulung', 'Cagayan', '2025-01-15', 'Active', 85, 420);

-- Insert sample STARBOOKS content
INSERT INTO starbooks_content (title, description, category_id, content_type, age_group, difficulty_level, tags, is_featured, view_count, rating) VALUES
('Basic Computer Skills', 'Introduction to computer operations and digital literacy', 
 (SELECT id FROM starbooks_categories WHERE name = 'Science & Technology'), 'interactive', 'all', 'beginner', 
 ARRAY['computer', 'digital literacy', 'basic skills'], true, 1250, 4.5),
 
('Sustainable Farming Practices', 'Modern agricultural techniques for small-scale farmers',
 (SELECT id FROM starbooks_categories WHERE name = 'Agriculture & Environment'), 'video', 'adults', 'intermediate',
 ARRAY['farming', 'sustainability', 'agriculture'], true, 890, 4.8),
 
('Filipino Folk Tales', 'Collection of traditional Filipino stories and legends',
 (SELECT id FROM starbooks_categories WHERE name = 'Language & Literature'), 'ebook', 'children', 'beginner',
 ARRAY['stories', 'culture', 'filipino', 'folklore'], false, 650, 4.2),
 
('Basic Mathematics Games', 'Interactive math games for elementary students',
 (SELECT id FROM starbooks_categories WHERE name = 'Mathematics'), 'game', 'children', 'beginner',
 ARRAY['math', 'games', 'elementary', 'interactive'], true, 2100, 4.7);

-- Create RLS policies for STARBOOKS tables
ALTER TABLE starbooks_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE starbooks_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies (allow authenticated users to read, admins to modify)
CREATE POLICY "Allow authenticated users to view STARBOOKS units" ON starbooks_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view STARBOOKS categories" ON starbooks_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view STARBOOKS content" ON starbooks_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert usage data" ON starbooks_usage FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to view usage data" ON starbooks_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to view audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);

-- Verify the tables
SELECT 
  'starbooks_units' as table_name, 
  COUNT(*) as record_count 
FROM starbooks_units
UNION ALL
SELECT 
  'starbooks_categories' as table_name, 
  COUNT(*) as record_count 
FROM starbooks_categories
UNION ALL
SELECT 
  'starbooks_content' as table_name, 
  COUNT(*) as record_count 
FROM starbooks_content;