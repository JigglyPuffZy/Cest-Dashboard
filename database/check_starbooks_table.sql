-- =====================================================
-- Check if STARBOOKS Units Table Exists and Has Data
-- =====================================================

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'starbooks_units'
) AS table_exists;

-- 2. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'starbooks_units'
ORDER BY ordinal_position;

-- 3. Count total units
SELECT COUNT(*) as total_units FROM starbooks_units;

-- 4. Count active (non-archived) units
SELECT COUNT(*) as active_units 
FROM starbooks_units 
WHERE is_archived IS NULL OR is_archived = false;

-- 5. Show sample data (first 5 units)
SELECT 
    id,
    unit_code,
    location,
    municipality,
    province,
    status,
    is_archived,
    created_at
FROM starbooks_units
WHERE is_archived IS NULL OR is_archived = false
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check if you have any data at all
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'NO DATA - You need to add STARBOOKS units!'
        WHEN COUNT(*) > 0 AND COUNT(*) FILTER (WHERE is_archived IS NULL OR is_archived = false) = 0 THEN 'All units are archived'
        ELSE 'Data exists: ' || COUNT(*) FILTER (WHERE is_archived IS NULL OR is_archived = false)::text || ' active units'
    END as status
FROM starbooks_units;
