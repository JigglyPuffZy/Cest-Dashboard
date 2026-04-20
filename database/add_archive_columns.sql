-- Add archive support to projects and equipment tables
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(is_archived);
CREATE INDEX IF NOT EXISTS idx_equipment_archived ON equipment(is_archived);

SELECT 'Archive columns added' as status;
