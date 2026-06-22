-- =============================================================================
-- CEST 2.0 — Allow guests (anon) to READ dashboard data
-- Guests use the public anon key without Supabase Auth login.
-- Run in Supabase → SQL Editor after 04-GUEST-ACCESS-ADMIN.sql
--
-- UI already blocks add/edit/delete for guests (readOnly mode).
-- This SQL lets them actually load projects, equipment, analytics, etc.
-- =============================================================================

-- Helper: create SELECT policy only if missing
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'projects',
    'equipment',
    'municipalities',
    'provinces',
    'components',
    'project_components',
    'community_types',
    'project_community_types',
    'trainings',
    'starbooks_units',
    'starbooks_components',
    'starbooks_unit_components',
    'starbooks_specifications',
    'starbooks_usage_stats',
    'starbooks_maintenance_history',
    'starbooks_images',
    'starbooks_documentation',
    'partner_agencies'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND policyname = 'anon read ' || t
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true)',
          'anon read ' || t,
          t
        );
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND policyname = 'authenticated read ' || t
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
          'authenticated read ' || t,
          t
        );
      END IF;

      EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    END IF;
  END LOOP;
END $$;

-- Staff keep full write access (adjust if you already have stricter policies)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['projects', 'equipment', 'trainings', 'starbooks_units'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND policyname = 'authenticated write ' || t
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
          'authenticated write ' || t,
          t
        );
      END IF;
      EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
    END IF;
  END LOOP;
END $$;

SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_components', 'components', 'equipment')
ORDER BY tablename, policyname;
