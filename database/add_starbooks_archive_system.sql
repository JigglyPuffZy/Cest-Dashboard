-- Add Archive System to STARBOOKS Units
-- This allows soft-delete functionality where deleted units are moved to archive instead of being permanently removed

-- Step 1: Add archive columns to starbooks_units table
DO $$
BEGIN
    -- Add is_archived column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'starbooks_units' 
        AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE starbooks_units 
        ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added is_archived column to starbooks_units';
    END IF;
    
    -- Add archived_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'starbooks_units' 
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE starbooks_units 
        ADD COLUMN archived_at TIMESTAMPTZ;
        
        RAISE NOTICE 'Added archived_at column to starbooks_units';
    END IF;
    
    -- Add archived_by column if it doesn't exist (optional - tracks who archived it)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'starbooks_units' 
        AND column_name = 'archived_by'
    ) THEN
        ALTER TABLE starbooks_units 
        ADD COLUMN archived_by VARCHAR(255);
        
        RAISE NOTICE 'Added archived_by column to starbooks_units';
    END IF;
    
    -- Add archive_reason column if it doesn't exist (optional - reason for archiving)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'starbooks_units' 
        AND column_name = 'archive_reason'
    ) THEN
        ALTER TABLE starbooks_units 
        ADD COLUMN archive_reason TEXT;
        
        RAISE NOTICE 'Added archive_reason column to starbooks_units';
    END IF;
END $$;

-- Step 2: Create indexes for better performance on archive queries
CREATE INDEX IF NOT EXISTS idx_starbooks_units_is_archived 
ON starbooks_units(is_archived);

CREATE INDEX IF NOT EXISTS idx_starbooks_units_archived_at 
ON starbooks_units(archived_at DESC);

CREATE INDEX IF NOT EXISTS idx_starbooks_units_active 
ON starbooks_units(is_archived, status) 
WHERE is_archived = FALSE;

-- Step 3: Create a view for active (non-archived) units
CREATE OR REPLACE VIEW starbooks_active_units AS
SELECT * FROM starbooks_units
WHERE is_archived = FALSE OR is_archived IS NULL;

-- Step 4: Create a view for archived units
CREATE OR REPLACE VIEW starbooks_archived_units AS
SELECT * FROM starbooks_units
WHERE is_archived = TRUE
ORDER BY archived_at DESC;

-- Step 5: Create function to archive a STARBOOKS unit
CREATE OR REPLACE FUNCTION archive_starbooks_unit(
    p_unit_id UUID,
    p_archived_by VARCHAR(255) DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE starbooks_units
    SET 
        is_archived = TRUE,
        archived_at = NOW(),
        archived_by = p_archived_by,
        archive_reason = p_reason,
        status = 'Inactive'  -- Set status to Inactive when archived
    WHERE id = p_unit_id
    AND (is_archived = FALSE OR is_archived IS NULL);
    
    IF FOUND THEN
        RAISE NOTICE 'STARBOOKS unit % archived successfully', p_unit_id;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'STARBOOKS unit % not found or already archived', p_unit_id;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to restore a STARBOOKS unit from archive
CREATE OR REPLACE FUNCTION restore_starbooks_unit(
    p_unit_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_previous_status VARCHAR(50);
BEGIN
    -- Get the previous status (if it was Active before archiving, restore to Active)
    SELECT status INTO v_previous_status
    FROM starbooks_units
    WHERE id = p_unit_id;
    
    UPDATE starbooks_units
    SET 
        is_archived = FALSE,
        archived_at = NULL,
        archived_by = NULL,
        archive_reason = NULL,
        status = CASE 
            WHEN v_previous_status = 'Inactive' THEN 'Active'  -- Restore to Active
            ELSE v_previous_status 
        END
    WHERE id = p_unit_id
    AND is_archived = TRUE;
    
    IF FOUND THEN
        RAISE NOTICE 'STARBOOKS unit % restored successfully', p_unit_id;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'STARBOOKS unit % not found or not archived', p_unit_id;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to permanently delete a STARBOOKS unit
CREATE OR REPLACE FUNCTION permanently_delete_starbooks_unit(
    p_unit_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Only allow permanent deletion of archived units
    DELETE FROM starbooks_units
    WHERE id = p_unit_id
    AND is_archived = TRUE;
    
    IF FOUND THEN
        RAISE NOTICE 'STARBOOKS unit % permanently deleted', p_unit_id;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'STARBOOKS unit % not found or not archived (must be archived before permanent deletion)', p_unit_id;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create function to get archive statistics
CREATE OR REPLACE FUNCTION get_starbooks_archive_stats()
RETURNS TABLE (
    total_units BIGINT,
    active_units BIGINT,
    archived_units BIGINT,
    archived_this_month BIGINT,
    archived_this_year BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_units,
        COUNT(*) FILTER (WHERE is_archived = FALSE OR is_archived IS NULL)::BIGINT as active_units,
        COUNT(*) FILTER (WHERE is_archived = TRUE)::BIGINT as archived_units,
        COUNT(*) FILTER (WHERE is_archived = TRUE AND archived_at >= DATE_TRUNC('month', NOW()))::BIGINT as archived_this_month,
        COUNT(*) FILTER (WHERE is_archived = TRUE AND archived_at >= DATE_TRUNC('year', NOW()))::BIGINT as archived_this_year
    FROM starbooks_units;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Update RLS policies to include archived units
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read access" ON starbooks_units;
DROP POLICY IF EXISTS "Allow authenticated write access" ON starbooks_units;

-- Create new policies that work with archived units
CREATE POLICY "Allow authenticated users to view all STARBOOKS units" 
ON starbooks_units FOR SELECT 
TO authenticated 
USING (true);  -- Can see both active and archived

CREATE POLICY "Allow authenticated users to modify STARBOOKS units" 
ON starbooks_units FOR ALL 
TO authenticated 
USING (true);  -- Can modify both active and archived

-- Step 10: Add comments for documentation
COMMENT ON COLUMN starbooks_units.is_archived IS 
    'Indicates whether this STARBOOKS unit has been archived (soft-deleted)';

COMMENT ON COLUMN starbooks_units.archived_at IS 
    'Timestamp when the unit was archived';

COMMENT ON COLUMN starbooks_units.archived_by IS 
    'User who archived this unit';

COMMENT ON COLUMN starbooks_units.archive_reason IS 
    'Reason for archiving this unit';

COMMENT ON FUNCTION archive_starbooks_unit IS 
    'Soft-delete a STARBOOKS unit by moving it to archive';

COMMENT ON FUNCTION restore_starbooks_unit IS 
    'Restore an archived STARBOOKS unit back to active status';

COMMENT ON FUNCTION permanently_delete_starbooks_unit IS 
    'Permanently delete an archived STARBOOKS unit (cannot be undone)';

-- Step 11: Verification queries
SELECT 
    'Archive System Setup' as check_type,
    'Columns Added' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'starbooks_units'
AND column_name IN ('is_archived', 'archived_at', 'archived_by', 'archive_reason');

SELECT 
    'Archive Statistics' as check_type,
    * 
FROM get_starbooks_archive_stats();

-- Show sample of units with archive status
SELECT 
    'Sample Units' as check_type,
    id,
    unit_code,
    location,
    status,
    is_archived,
    archived_at
FROM starbooks_units
LIMIT 5;

RAISE NOTICE '
============================================================================
STARBOOKS ARCHIVE SYSTEM SETUP COMPLETE
============================================================================
✅ Archive columns added to starbooks_units table
✅ Indexes created for better performance
✅ Views created for active and archived units
✅ Functions created for archive operations:
   - archive_starbooks_unit(unit_id, archived_by, reason)
   - restore_starbooks_unit(unit_id)
   - permanently_delete_starbooks_unit(unit_id)
   - get_starbooks_archive_stats()
✅ RLS policies updated

Usage:
- Archive: SELECT archive_starbooks_unit(''unit-id'', ''admin@example.com'', ''Reason'');
- Restore: SELECT restore_starbooks_unit(''unit-id'');
- Delete:  SELECT permanently_delete_starbooks_unit(''unit-id'');
- Stats:   SELECT * FROM get_starbooks_archive_stats();
============================================================================
';
