-- Clear generic project titles from equipment
-- Run this in Supabase SQL Editor

-- Clear the generic project titles that were auto-generated
UPDATE equipment 
SET project_title = NULL 
WHERE project_title IN (
    'Digital Governance Initiative',
    'Sustainable Enterprise Development', 
    'Health & Nutrition Program',
    'Human Resource Development',
    'Disaster Risk Reduction Management',
    'Bio-Circular-Green Economy Technologies',
    'General Equipment Program'
);

-- Verify the changes
SELECT 
    id,
    equipment_name,
    project_title,
    component_id,
    created_at
FROM equipment 
ORDER BY created_at DESC
LIMIT 10;