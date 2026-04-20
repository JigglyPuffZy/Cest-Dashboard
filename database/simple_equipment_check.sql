-- Simple check to see your equipment table structure
-- Run this first to understand your database setup

-- Check what columns exist in equipment table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'equipment' 
ORDER BY ordinal_position;

-- Check if you have any equipment records
SELECT COUNT(*) as total_equipment FROM equipment;

-- If you have records, show a sample
SELECT * FROM equipment LIMIT 3;