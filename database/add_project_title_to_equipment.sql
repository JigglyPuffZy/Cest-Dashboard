-- Add project title/label to equipment table
-- Run this in Supabase SQL Editor

-- Add project_title column to equipment table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'equipment' AND column_name = 'project_title') THEN
        ALTER TABLE equipment ADD COLUMN project_title VARCHAR(255);
    END IF;
END $$;

-- Add project_id column to equipment table for linking to projects if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'equipment' AND column_name = 'project_id') THEN
        ALTER TABLE equipment ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_project_id ON equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_project_title ON equipment(project_title);

-- Update existing equipment with sample project titles based on component
UPDATE equipment 
SET project_title = CASE 
    WHEN component_id = 'dg' THEN 'Digital Governance Initiative'
    WHEN component_id = 'sel' THEN 'Sustainable Enterprise Development'
    WHEN component_id = 'hn' THEN 'Health & Nutrition Program'
    WHEN component_id = 'hrd' THEN 'Human Resource Development'
    WHEN component_id = 'drrm' THEN 'Disaster Risk Reduction Management'
    WHEN component_id = 'bgcet' THEN 'Bio-Circular-Green Economy Technologies'
    ELSE 'General Equipment Program'
END
WHERE project_title IS NULL;

-- Verify the changes
SELECT 
    equipment_name,
    project_title,
    component_id,
    units,
    community
FROM equipment 
ORDER BY project_title, equipment_name
LIMIT 10;