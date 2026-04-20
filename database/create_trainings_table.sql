-- Create trainings table
CREATE TABLE IF NOT EXISTS trainings (
  id BIGSERIAL PRIMARY KEY,
  date DATE,
  year INTEGER,
  municipality TEXT,
  community TEXT NOT NULL,
  title TEXT NOT NULL,
  budget NUMERIC,
  moa TEXT,
  component TEXT,
  beneficiary_types TEXT[] DEFAULT '{}',
  male INTEGER DEFAULT 0,
  female INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table already exists, add archive columns
ALTER TABLE trainings
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated" ON trainings;
CREATE POLICY "Allow all for authenticated" ON trainings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_trainings_year ON trainings(year);
CREATE INDEX IF NOT EXISTS idx_trainings_component ON trainings(component);
CREATE INDEX IF NOT EXISTS idx_trainings_archived ON trainings(is_archived);
CREATE INDEX IF NOT EXISTS idx_trainings_created ON trainings(created_at);

SELECT 'trainings table ready' as status;
