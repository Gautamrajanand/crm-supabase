-- Create anonymous user for shared links
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anonymous@example.com',
  crypt('anonymous', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create profile for anonymous user
INSERT INTO public.profiles (
  id,
  full_name,
  avatar_url,
  email_notifications,
  dark_mode,
  timezone,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Anonymous User',
  NULL,
  false,
  false,
  'UTC',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;
