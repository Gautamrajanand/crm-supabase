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
  'Gautam',
  'hub@gmail.com',
  'Team Member',
  'active',
  'admin',
  '14283671-46e7-49c0-b175-6587798f9eb5',
  'edit',
  'edit',
  'edit',
  'edit',
  'edit',
  'edit'
WHERE NOT EXISTS (
  SELECT 1 FROM people 
  WHERE email = 'hub@gmail.com' 
  AND stream_id = '14283671-46e7-49c0-b175-6587798f9eb5'
);
