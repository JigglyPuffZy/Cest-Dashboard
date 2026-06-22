-- CEST 2.0 — Guest Access & Admin (User Requests, Access Logs)
-- Run once in Supabase → SQL Editor
-- ---------------------------------------------------------------------------
-- 1. Guest access requests
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 2. Access activity logs
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 3. updated_at trigger
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4. Helpful view for admin dashboard stats
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.guest_access_stats AS
SELECT
  (SELECT count(*)::int FROM public.guest_access_requests WHERE status = 'pending')   AS pending_requests,
  (SELECT count(*)::int FROM public.guest_access_requests WHERE status = 'approved')  AS approved_users,
  (SELECT count(*)::int FROM public.guest_access_requests WHERE status = 'declined')  AS declined_users,
  (SELECT count(*)::int FROM public.guest_access_requests)                            AS total_visitors,
  (SELECT count(*)::int FROM public.guest_access_logs
     WHERE log_type = 'file_access'
       AND created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Manila'))          AS files_accessed_today;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ---------------------------------------------------------------------------
ALTER TABLE public.guest_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_access_logs ENABLE ROW LEVEL SECURITY;

-- Staff (logged-in Supabase users): full access to requests
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

-- Guests: read ONLY their own request via RPC (pass access_token from sessionStorage)
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

-- Guests submit requests via RPC (bypasses INSERT+RETURNING RLS issue for anon)
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

-- Guests (not logged in): submit a new request (direct insert fallback for staff tools)
DROP POLICY IF EXISTS "Anyone insert guest request" ON public.guest_access_requests;
CREATE POLICY "Anyone insert guest request"
  ON public.guest_access_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Table grants (required alongside RLS policies)
GRANT INSERT ON public.guest_access_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.guest_access_requests TO authenticated;
GRANT INSERT ON public.guest_access_logs TO anon, authenticated;
GRANT SELECT ON public.guest_access_logs TO authenticated;

-- No direct anon SELECT on requests table (use get_guest_request_status instead)

-- Logs: staff read all; anyone can insert (for guest activity tracking)
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

-- Stats view: staff only
GRANT SELECT ON public.guest_access_stats TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. Optional: seed one test pending request (delete after testing)
-- ---------------------------------------------------------------------------
-- INSERT INTO public.guest_access_requests (first_name, last_name, status)
-- VALUES ('Juan', 'Dela Cruz', 'pending');

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
SELECT 'guest_access_requests' AS table_name, count(*) AS rows FROM public.guest_access_requests
UNION ALL
SELECT 'guest_access_logs', count(*) FROM public.guest_access_logs;

SELECT * FROM public.guest_access_stats;
