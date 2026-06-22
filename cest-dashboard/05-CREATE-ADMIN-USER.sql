-- =============================================================================
-- CEST 2.0 — Create staff admin user in Supabase
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
--
-- BEFORE RUNNING:
--   1. Change the password below (line with v_password)
--   2. Change the email if needed (default: rowenaguzman@gmail.com)
--   3. Run 04-GUEST-ACCESS-ADMIN.sql first if you have not already
-- =============================================================================

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

  -- Skip if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    RAISE NOTICE 'User % already exists — updating metadata only.', v_email;
    UPDATE auth.users
    SET
      raw_user_meta_data = jsonb_build_object(
        'full_name', v_full_name,
        'role', 'admin'
      ),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE email = v_email;
    RETURN;
  END IF;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_super_admin
  ) VALUES (
    v_instance_id,
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', v_full_name, 'role', 'admin'),
    now(),
    now(),
    false
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Created admin user: % (password is what you set in v_password)', v_email;
END $$;

-- Verify
SELECT id, email, email_confirmed_at, raw_user_meta_data
FROM auth.users
WHERE email = 'rowenaguzman@gmail.com';
