-- Check actual columns on all tables
SELECT table_name, column_name, data_type 
FROM information_schema.columns
WHERE table_name IN ('projects', 'equipment', 'trainings')
ORDER BY table_name, ordinal_position;

-- Also check equipment RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('projects', 'equipment', 'trainings');
