-- Ensure equipment table has proper project linking
-- This script ensures equipment can be properly linked to projects

DO $$
BEGIN
    -- Check if project_id column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipment' 
        AND column_name = 'project_id'
    ) THEN
        -- Add project_id column as UUID to match projects table
        ALTER TABLE equipment 
        ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added project_id column to equipment table';
    ELSE
        RAISE NOTICE 'project_id column already exists in equipment table';
    END IF;
    
    -- Create index for better performance on project lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_equipment_project_id'
    ) THEN
        CREATE INDEX idx_equipment_project_id ON equipment(project_id);
        RAISE NOTICE 'Created index on equipment.project_id';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_equipment_project_title'
    ) THEN
        CREATE INDEX idx_equipment_project_title ON equipment(project_title);
        RAISE NOTICE 'Created index on equipment.project_title';
    END IF;
    
    RAISE NOTICE 'Equipment linking setup completed successfully';
END $$;

-- Update existing equipment to link with projects where project_title matches
UPDATE equipment 
SET project_id = p.id
FROM projects p
WHERE equipment.project_title = p.project_title 
  AND equipment.project_id IS NULL
  AND p.is_archived = false;

-- Show summary of linked equipment
SELECT 
    COUNT(*) as total_equipment,
    COUNT(project_id) as linked_to_projects,
    COUNT(*) - COUNT(project_id) as standalone_equipment
FROM equipment 
WHERE is_archived = false;