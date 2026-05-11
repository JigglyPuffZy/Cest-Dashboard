-- Cascade Delete Equipment When Project is Deleted
-- This ensures that when a project is deleted/archived, all associated equipment is also deleted

-- Step 1: Drop the existing foreign key constraint (if it exists)
DO $$
BEGIN
    -- Find and drop the existing foreign key constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%equipment_project_id%' 
        AND table_name = 'equipment'
    ) THEN
        ALTER TABLE equipment 
        DROP CONSTRAINT IF EXISTS equipment_project_id_fkey;
        
        RAISE NOTICE 'Dropped existing project_id foreign key constraint';
    END IF;
END $$;

-- Step 2: Add the foreign key constraint with CASCADE DELETE
ALTER TABLE equipment 
ADD CONSTRAINT equipment_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES projects(id) 
ON DELETE CASCADE;

-- Step 3: Create a trigger function to cascade archive operations
-- When a project is archived, also archive all its equipment
CREATE OR REPLACE FUNCTION cascade_archive_equipment()
RETURNS TRIGGER AS $$
BEGIN
    -- If project is being archived, archive all its equipment
    IF NEW.is_archived = TRUE AND (OLD.is_archived IS NULL OR OLD.is_archived = FALSE) THEN
        UPDATE equipment 
        SET is_archived = TRUE, 
            archived_at = NEW.archived_at
        WHERE project_id = NEW.id 
        AND is_archived = FALSE;
        
        RAISE NOTICE 'Archived % equipment items for project %', 
            (SELECT COUNT(*) FROM equipment WHERE project_id = NEW.id AND is_archived = TRUE),
            NEW.project_title;
    END IF;
    
    -- If project is being restored, restore all its equipment
    IF NEW.is_archived = FALSE AND OLD.is_archived = TRUE THEN
        UPDATE equipment 
        SET is_archived = FALSE, 
            archived_at = NULL
        WHERE project_id = NEW.id 
        AND is_archived = TRUE;
        
        RAISE NOTICE 'Restored % equipment items for project %', 
            (SELECT COUNT(*) FROM equipment WHERE project_id = NEW.id AND is_archived = FALSE),
            NEW.project_title;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger on projects table
DROP TRIGGER IF EXISTS trigger_cascade_archive_equipment ON projects;

CREATE TRIGGER trigger_cascade_archive_equipment
    AFTER UPDATE OF is_archived ON projects
    FOR EACH ROW
    EXECUTE FUNCTION cascade_archive_equipment();

-- Step 5: Verify the setup
SELECT 
    'Foreign Key Constraint' as check_type,
    constraint_name,
    'CASCADE' as delete_rule
FROM information_schema.table_constraints
WHERE table_name = 'equipment' 
AND constraint_name LIKE '%project_id%';

-- Show trigger info
SELECT 
    'Trigger' as check_type,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_cascade_archive_equipment';

COMMENT ON CONSTRAINT equipment_project_id_fkey ON equipment IS 
    'Cascade delete equipment when project is permanently deleted';

COMMENT ON FUNCTION cascade_archive_equipment() IS 
    'Automatically archive/restore equipment when project is archived/restored';
