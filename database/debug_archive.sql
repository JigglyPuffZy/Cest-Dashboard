-- Run this to see exactly what's happening in your database

-- 1. Check if is_archived column exists
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name IN ('projects', 'equipment', 'trainings')
AND column_name = 'is_archived';

-- 2. Check all projects and their archive status
SELECT id, project_title, is_archived, archived_at FROM projects ORDER BY created_at DESC;

-- 3. Check RLS policies on projects
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';
