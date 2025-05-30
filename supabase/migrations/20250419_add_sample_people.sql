-- Insert the current user as a person in their stream
INSERT INTO people (
  name,
  email,
  role,
  status,
  access_level,
  stream_id,
  outreach_access,
  deals_access,
  customers_access,
  tasks_access,
  calendar_access,
  people_access
)
SELECT 
  COALESCE(p.full_name, u.email),
  u.email,
  'Team Member',
  'active',
  'admin',
  rsm.stream_id,
  'edit',
  'edit',
  'edit',
  'edit',
  'edit',
  'edit'
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN revenue_stream_members rsm ON rsm.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM people 
  WHERE email = u.email 
  AND stream_id = rsm.stream_id
);
