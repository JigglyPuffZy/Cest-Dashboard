-- Link equipment to actual projects
-- Run this in Supabase SQL Editor

-- First, let's see what projects and equipment we have
SELECT 'Projects:' as type, project_title as name, id FROM projects WHERE is_archived = false
UNION ALL
SELECT 'Equipment:' as type, equipment_name as name, id::text FROM equipment WHERE is_archived = false
ORDER BY type, name;

-- Link the existing equipment to the "Computer Industry" project
-- (Replace the project_id with the actual ID from your projects table)
UPDATE equipment 
SET project_id = (
    SELECT id FROM projects 
    WHERE project_title ILIKE '%computer%' 
    OR project_title ILIKE '%industry%'
    LIMIT 1
)
WHERE equipment_name IS NOT NULL 
AND project_id IS NULL;

-- Verify the linkage
SELECT 
    e.equipment_name,
    p.project_title,
    e.community,
    e.units
FROM equipment e
LEFT JOIN projects p ON e.project_id = p.id
WHERE e.is_archived = false
ORDER BY p.project_title, e.equipment_name;