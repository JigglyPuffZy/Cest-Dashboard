-- =============================================================================
-- FIX: Guest access request fails with RLS error on login page
-- Error: "new row violates row-level security policy for table guest_access_requests"
--
-- Cause: .insert().select() needs SELECT permission after insert; anon has none.
-- Fix:  RPC that inserts as SECURITY DEFINER and returns the new row safely.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

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

-- Ensure insert policy + grants exist
DROP POLICY IF EXISTS "Anyone insert guest request" ON public.guest_access_requests;
CREATE POLICY "Anyone insert guest request"
  ON public.guest_access_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

GRANT INSERT ON public.guest_access_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.guest_access_requests TO authenticated;
GRANT INSERT ON public.guest_access_logs TO anon, authenticated;
GRANT SELECT ON public.guest_access_logs TO authenticated;

-- Verify function exists
SELECT proname FROM pg_proc WHERE proname = 'submit_guest_access_request';
