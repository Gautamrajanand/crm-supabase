-- Enable RLS on all tables
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "deals_select_policy" ON deals;
DROP POLICY IF EXISTS "deals_insert_policy" ON deals;
DROP POLICY IF EXISTS "deals_update_policy" ON deals;
DROP POLICY IF EXISTS "deals_delete_policy" ON deals;

DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;

DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;

DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "events_insert_policy" ON events;
DROP POLICY IF EXISTS "events_update_policy" ON events;
DROP POLICY IF EXISTS "events_delete_policy" ON events;

DROP POLICY IF EXISTS "prospects_select_policy" ON prospects;
DROP POLICY IF EXISTS "prospects_insert_policy" ON prospects;
DROP POLICY IF EXISTS "prospects_update_policy" ON prospects;
DROP POLICY IF EXISTS "prospects_delete_policy" ON prospects;

DROP POLICY IF EXISTS "activities_select_policy" ON activities;
DROP POLICY IF EXISTS "activities_insert_policy" ON activities;
DROP POLICY IF EXISTS "activities_update_policy" ON activities;
DROP POLICY IF EXISTS "activities_delete_policy" ON activities;

-- Deals policies
CREATE POLICY "deals_select_policy" ON deals
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = deals.stream_id
        )
    );

CREATE POLICY "deals_insert_policy" ON deals
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = deals.stream_id
        )
    );

CREATE POLICY "deals_update_policy" ON deals
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = deals.stream_id
        )
    );

CREATE POLICY "deals_delete_policy" ON deals
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = deals.stream_id
        )
    );

-- Customers policies
CREATE POLICY "customers_select_policy" ON customers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = customers.stream_id
        )
    );

CREATE POLICY "customers_insert_policy" ON customers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = customers.stream_id
        )
    );

CREATE POLICY "customers_update_policy" ON customers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = customers.stream_id
        )
    );

CREATE POLICY "customers_delete_policy" ON customers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = customers.stream_id
        )
    );

-- Tasks policies
CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = tasks.stream_id
        )
    );

CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = tasks.stream_id
        )
    );

CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = tasks.stream_id
        )
    );

CREATE POLICY "tasks_delete_policy" ON tasks
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = tasks.stream_id
        )
    );

-- Events policies
CREATE POLICY "events_select_policy" ON events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = events.stream_id
        )
    );

CREATE POLICY "events_insert_policy" ON events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = events.stream_id
        )
    );

CREATE POLICY "events_update_policy" ON events
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = events.stream_id
        )
    );

CREATE POLICY "events_delete_policy" ON events
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = events.stream_id
        )
    );

-- Prospects policies
CREATE POLICY "prospects_select_policy" ON prospects
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
    );

CREATE POLICY "prospects_insert_policy" ON prospects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
    );

CREATE POLICY "prospects_update_policy" ON prospects
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
    );

CREATE POLICY "prospects_delete_policy" ON prospects
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
    );

-- Activities policies
CREATE POLICY "activities_select_policy" ON activities
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = activities.stream_id
        )
    );

CREATE POLICY "activities_insert_policy" ON activities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = activities.stream_id
        )
    );

CREATE POLICY "activities_update_policy" ON activities
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = activities.stream_id
        )
    );

CREATE POLICY "activities_delete_policy" ON activities
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = activities.stream_id
        )
    );

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('deals', 'customers', 'tasks', 'events', 'prospects', 'activities');

-- Verify policies exist for all tables
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('deals', 'customers', 'tasks', 'events', 'prospects', 'activities')
ORDER BY tablename, cmd;
