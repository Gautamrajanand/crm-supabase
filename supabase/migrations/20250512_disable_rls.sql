-- Disable RLS on all tables
ALTER TABLE public.revenue_streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON revenue_streams;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON revenue_stream_members;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON deals;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON events;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON prospects;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON activities;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON people;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'revenue_streams',
    'revenue_stream_members',
    'deals',
    'customers',
    'tasks',
    'events',
    'prospects',
    'activities',
    'people'
);
