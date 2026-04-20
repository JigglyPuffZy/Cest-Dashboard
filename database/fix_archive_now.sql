-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX ARCHIVE PERMANENTLY
-- ============================================================

-- Step 1: Add is_archived columns (safe if already exists)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE trainings
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Step 2: Set all existing rows to NOT archived (fix nulls)
UPDATE projects SET is_archived = false WHERE is_archived IS NULL;
UPDATE equipment SET is_archived = false WHERE is_archived IS NULL;
UPDATE trainings SET is_archived = false WHERE is_archived IS NULL;

-- Step 3: Make column NOT NULL with default so filter always works
ALTER TABLE projects ALTER COLUMN is_archived SET NOT NULL;
ALTER TABLE projects ALTER COLUMN is_archived SET DEFAULT false;
ALTER TABLE equipment ALTER COLUMN is_archived SET NOT NULL;
ALTER TABLE equipment ALTER COLUMN is_archived SET DEFAULT false;
ALTER TABLE trainings ALTER COLUMN is_archived SET NOT NULL;
ALTER TABLE trainings ALTER COLUMN is_archived SET DEFAULT false;

-- Step 4: Indexes
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(is_archived);
CREATE INDEX IF NOT EXISTS idx_equipment_archived ON equipment(is_archived);
CREATE INDEX IF NOT EXISTS idx_trainings_archived ON trainings(is_archived);

-- Step 5: Verify
SELECT 'projects' as tbl, COUNT(*) as total,
  SUM(CASE WHEN is_archived THEN 1 ELSE 0 END) as archived
FROM projects
UNION ALL
SELECT 'equipment', COUNT(*),
  SUM(CASE WHEN is_archived THEN 1 ELSE 0 END)
FROM equipment
UNION ALL
SELECT 'trainings', COUNT(*),
  SUM(CASE WHEN is_archived THEN 1 ELSE 0 END)
FROM trainings;
