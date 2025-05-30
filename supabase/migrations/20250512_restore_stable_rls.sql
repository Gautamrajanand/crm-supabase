-- First disable RLS on all tables
ALTER TABLE public.revenue_streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies from all tables
DROP POLICY IF EXISTS "Enable read for authenticated users" ON revenue_streams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON revenue_streams;
DROP POLICY IF EXISTS "Enable update for stream owners" ON revenue_streams;
DROP POLICY IF EXISTS "Enable read for stream members" ON revenue_stream_members;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON revenue_stream_members;
DROP POLICY IF EXISTS "Enable read for stream members" ON deals;
DROP POLICY IF EXISTS "Enable write for stream members" ON deals;
DROP POLICY IF EXISTS "Enable update for stream members" ON deals;
DROP POLICY IF EXISTS "Enable delete for stream members" ON deals;
DROP POLICY IF EXISTS "Enable read for stream members" ON customers;
DROP POLICY IF EXISTS "Enable write for stream members" ON customers;
DROP POLICY IF EXISTS "Enable update for stream members" ON customers;
DROP POLICY IF EXISTS "Enable delete for stream members" ON customers;
DROP POLICY IF EXISTS "Enable read for stream members" ON tasks;
DROP POLICY IF EXISTS "Enable write for stream members" ON tasks;
DROP POLICY IF EXISTS "Enable update for stream members" ON tasks;
DROP POLICY IF EXISTS "Enable delete for stream members" ON tasks;
DROP POLICY IF EXISTS "Enable read for stream members" ON events;
DROP POLICY IF EXISTS "Enable write for stream members" ON events;
DROP POLICY IF EXISTS "Enable update for stream members" ON events;
DROP POLICY IF EXISTS "Enable delete for stream members" ON events;
DROP POLICY IF EXISTS "Enable read for stream members" ON prospects;
DROP POLICY IF EXISTS "Enable write for stream members" ON prospects;
DROP POLICY IF EXISTS "Enable update for stream members" ON prospects;
DROP POLICY IF EXISTS "Enable delete for stream members" ON prospects;
DROP POLICY IF EXISTS "Enable read for stream members" ON activities;
DROP POLICY IF EXISTS "Enable write for stream members" ON activities;
DROP POLICY IF EXISTS "Enable update for stream members" ON activities;
DROP POLICY IF EXISTS "Enable delete for stream members" ON activities;
DROP POLICY IF EXISTS "Enable read for stream members" ON people;
DROP POLICY IF EXISTS "Enable write for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Drop any numbered policies
DROP POLICY IF EXISTS "revenue_streams_select_policy" ON revenue_streams;
DROP POLICY IF EXISTS "revenue_stream_members_select_policy" ON revenue_stream_members;
DROP POLICY IF EXISTS "deals_select_policy" ON deals;
DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "prospects_select_policy" ON prospects;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "people_select_policy" ON people;
DROP POLICY IF EXISTS "people_insert_policy" ON people;
DROP POLICY IF EXISTS "people_update_policy" ON people;
DROP POLICY IF EXISTS "people_delete_policy" ON people;

-- Restore stable RLS policies from v5
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Revenue Streams
CREATE POLICY "Enable all for authenticated users" ON revenue_streams
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Revenue Stream Members
CREATE POLICY "Enable all for authenticated users" ON revenue_stream_members
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Deals
CREATE POLICY "Enable all for authenticated users" ON deals
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Customers
CREATE POLICY "Enable all for authenticated users" ON customers
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Tasks
CREATE POLICY "Enable all for authenticated users" ON tasks
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Events
CREATE POLICY "Enable all for authenticated users" ON events
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Prospects
CREATE POLICY "Enable all for authenticated users" ON prospects
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Activities
CREATE POLICY "Enable all for authenticated users" ON activities
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- People
CREATE POLICY "Enable all for authenticated users" ON people
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify RLS is enabled and policies are in place
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
