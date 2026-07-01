CREATE TABLE IF NOT EXISTS public.guest_access_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  full_name     TEXT GENERATED ALWAYS AS (trim(first_name || ' ' || last_name)) STORED,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'declined')),
  access_token  TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_access_requests_status
  ON public.guest_access_requests (status);

CREATE INDEX IF NOT EXISTS idx_guest_access_requests_requested_at
  ON public.guest_access_requests (requested_at DESC);

CREATE TABLE IF NOT EXISTS public.guest_access_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID REFERENCES public.guest_access_requests(id) ON DELETE SET NULL,
  log_type    TEXT NOT NULL
              CHECK (log_type IN (
                'request_submitted',
                'request_approved',
                'request_declined',
                'file_access',
                'page_visit'
              )),
  message     TEXT NOT NULL,
  user_name   TEXT NOT NULL DEFAULT 'Unknown',
  actor       TEXT,
  meta        JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_access_logs_created_at
  ON public.guest_access_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_access_logs_log_type
  ON public.guest_access_logs (log_type);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guest_access_requests_updated_at ON public.guest_access_requests;
CREATE TRIGGER trg_guest_access_requests_updated_at
  BEFORE UPDATE ON public.guest_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE VIEW public.guest_access_stats AS
SELECT
  (SELECT count(*)::int FROM public.guest_access_requests WHERE status = 'pending')   AS pending_requests,
  (SELECT count(*)::int FROM public.guest_access_requests WHERE status = 'approved')  AS approved_users,
  (SELECT count(*)::int FROM public.guest_access_requests WHERE status = 'declined')  AS declined_users,
  (SELECT count(*)::int FROM public.guest_access_requests)                            AS total_visitors,
  (SELECT count(*)::int FROM public.guest_access_logs
     WHERE log_type = 'file_access'
       AND created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Manila'))          AS files_accessed_today;

ALTER TABLE public.guest_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read guest requests" ON public.guest_access_requests;
CREATE POLICY "Staff read guest requests"
  ON public.guest_access_requests FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff update guest requests" ON public.guest_access_requests;
CREATE POLICY "Staff update guest requests"
  ON public.guest_access_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_guest_request_status(p_access_token TEXT)
RETURNS TABLE (
  id UUID,
  status TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, status, first_name, last_name, full_name, requested_at, reviewed_at
  FROM public.guest_access_requests
  WHERE access_token = p_access_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_guest_request_status(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.guest_end_session(p_access_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.guest_access_requests%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.guest_access_requests
  WHERE access_token = p_access_token AND status = 'approved'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.guest_access_requests
  SET
    status = 'declined',
    reviewed_at = now(),
    reviewed_by = coalesce(v_row.full_name, 'Guest')
  WHERE id = v_row.id;

  INSERT INTO public.guest_access_logs (request_id, log_type, message, user_name, actor)
  VALUES (
    v_row.id,
    'request_declined',
    coalesce(v_row.full_name, 'Guest') || ' ended their guest session (logged out)',
    coalesce(v_row.full_name, 'Guest'),
    'Guest (logout)'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.guest_end_session(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_guest_access_request(
  p_first_name TEXT,
  p_last_name TEXT
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  status TEXT,
  access_token TEXT,
  requested_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.guest_access_requests%ROWTYPE;
BEGIN
  IF trim(coalesce(p_first_name, '')) = '' OR trim(coalesce(p_last_name, '')) = '' THEN
    RAISE EXCEPTION 'First name and last name are required';
  END IF;

  INSERT INTO public.guest_access_requests (first_name, last_name, status)
  VALUES (trim(p_first_name), trim(p_last_name), 'pending')
  RETURNING * INTO v_row;

  RETURN QUERY SELECT
    v_row.id,
    v_row.first_name,
    v_row.last_name,
    v_row.full_name,
    v_row.status,
    v_row.access_token,
    v_row.requested_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_guest_access_request(TEXT, TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone insert guest request" ON public.guest_access_requests;
CREATE POLICY "Anyone insert guest request"
  ON public.guest_access_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

GRANT INSERT ON public.guest_access_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.guest_access_requests TO authenticated;
GRANT INSERT ON public.guest_access_logs TO anon, authenticated;
GRANT SELECT ON public.guest_access_logs TO authenticated;

DROP POLICY IF EXISTS "Staff read access logs" ON public.guest_access_logs;
CREATE POLICY "Staff read access logs"
  ON public.guest_access_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Insert access logs" ON public.guest_access_logs;
CREATE POLICY "Insert access logs"
  ON public.guest_access_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT SELECT ON public.guest_access_stats TO authenticated;




CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  action        TEXT NOT NULL DEFAULT 'update',
  entity_type   TEXT,
  entity_id     TEXT,
  entity_name   TEXT,
  description   TEXT,
  details       TEXT,
  "user"        TEXT DEFAULT 'Admin User',
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email    TEXT,
  metadata      JSONB DEFAULT '{}'::jsonb,
  table_name    TEXT,
  record_id     BIGINT,
  old_values    JSONB,
  new_values    JSONB,
  is_read       BOOLEAN DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action        TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type   TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id     TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_name   TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS details     TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS "user"        TEXT DEFAULT 'Admin User';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata      JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS is_read       BOOLEAN DEFAULT FALSE;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS read_at       TIMESTAMPTZ;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_audit_logs_created      ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_is_read        ON public.audit_logs(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_unread_created ON public.audit_logs(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action         ON public.audit_logs(action);

COMMENT ON COLUMN public.audit_logs.is_read IS 'Whether admin marked this activity as read in notifications';
COMMENT ON COLUMN public.audit_logs.read_at IS 'When the activity was marked read';

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read audit logs" ON public.audit_logs;
CREATE POLICY "Staff read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff update audit logs read status" ON public.audit_logs;
CREATE POLICY "Staff update audit logs read status"
  ON public.audit_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.audit_logs TO authenticated;


CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_action      TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_details     TEXT DEFAULT NULL,
  p_user        TEXT DEFAULT 'Admin User'
)
RETURNS public.audit_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.audit_logs%ROWTYPE;
BEGIN
  INSERT INTO public.audit_logs (action, entity_type, entity_name, description, details, "user")
  VALUES (p_action, p_entity_type, p_entity_name, p_description, p_details, p_user)
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_audit_log(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;




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




CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_email       TEXT := 'rowenaguzman@gmail.com';
  v_password    TEXT := 'DOST123';
  v_full_name   TEXT := 'Rowena Guzman';
  v_user_id     UUID := gen_random_uuid();
  v_instance_id UUID;
BEGIN
  SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
  IF v_instance_id IS NULL THEN
    v_instance_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    RAISE NOTICE 'User % already exists — updating metadata only.', v_email;
    UPDATE auth.users
    SET
      raw_user_meta_data = jsonb_build_object('full_name', v_full_name, 'role', 'admin'),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE email = v_email;
    RETURN;
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin
  ) VALUES (
    v_instance_id, v_user_id, 'authenticated', 'authenticated', v_email,
    crypt(v_password, gen_salt('bf')),
    now(), now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', v_full_name, 'role', 'admin'),
    now(), now(), false
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_user_id, v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now()
  );

  RAISE NOTICE 'Created admin user: %', v_email;
END $$;




SELECT 'guest_access_requests' AS item, count(*)::text AS value
FROM public.guest_access_requests
UNION ALL
SELECT 'guest_access_logs', count(*)::text FROM public.guest_access_logs
UNION ALL
SELECT 'audit_logs', count(*)::text FROM public.audit_logs
UNION ALL
SELECT 'pending_guest_alerts', count(*)::text
FROM public.guest_access_requests WHERE status = 'pending'
UNION ALL
SELECT 'unread_activity_logs', count(*)::text
FROM public.audit_logs WHERE coalesce(is_read, false) = false;

SELECT * FROM public.guest_access_stats;

SELECT id, email, email_confirmed_at, raw_user_meta_data->>'role' AS role
FROM auth.users
WHERE email = 'rowenaguzman@gmail.com';

SELECT proname AS rpc_function
FROM pg_proc
WHERE proname IN (
  'submit_guest_access_request',
  'get_guest_request_status',
  'guest_end_session',
  'insert_audit_log'
)
ORDER BY proname;
