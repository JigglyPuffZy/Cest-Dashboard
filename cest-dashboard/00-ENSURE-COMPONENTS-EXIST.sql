-- =====================================================
-- ENSURE COMPONENTS EXIST
-- =====================================================
-- Run this BEFORE importing equipment
-- This ensures all component IDs exist in the database
-- =====================================================

-- Check current components
SELECT 'Current components:' as info;
SELECT * FROM components ORDER BY id;

-- Insert components if they don't exist
INSERT INTO components (id, name, description) VALUES
('sel', 'Sustainable Enterprise & Livelihoods', 'S&T-based livelihood projects in communities'),
('hn', 'Health & Nutrition', 'S&T-based nutrition interventions and health tools'),
('hrd', 'Human Resource Development', 'E-learning tools and S&T education trainings'),
('drrm', 'DRRM & CCA', 'DRRM and CCA Technologies for communities'),
('bgcet', 'Bio-Circular-Green Economy', 'Bio-circular green economy technologies'),
('dg', 'Digital Governance', 'Database tools and ICT technologies')
ON CONFLICT (id) DO NOTHING;

-- Verify all components exist
SELECT 'Components after insert:' as info;
SELECT * FROM components ORDER BY id;

-- Count components
SELECT COUNT(*) as total_components FROM components;
