-- First disable RLS to clean up
ALTER TABLE public.entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "entries_select_policy" ON entries;
DROP POLICY IF EXISTS "entries_insert_policy" ON entries;
DROP POLICY IF EXISTS "entries_update_policy" ON entries;
DROP POLICY IF EXISTS "entries_delete_policy" ON entries;

DROP POLICY IF EXISTS "deals_select_policy" ON deals;
DROP POLICY IF EXISTS "deals_insert_policy" ON deals;
DROP POLICY IF EXISTS "deals_update_policy" ON deals;
DROP POLICY IF EXISTS "deals_delete_policy" ON deals;

DROP POLICY IF EXISTS "outreach_select_policy" ON outreach;
DROP POLICY IF EXISTS "outreach_insert_policy" ON outreach;
DROP POLICY IF EXISTS "outreach_update_policy" ON outreach;
DROP POLICY IF EXISTS "outreach_delete_policy" ON outreach;

-- Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach ENABLE ROW LEVEL SECURITY;

-- Entries policies
CREATE POLICY "entries_select_policy" ON entries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = entries.stream_id
        )
    );

CREATE POLICY "entries_insert_policy" ON entries
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = entries.stream_id
        )
    );

CREATE POLICY "entries_update_policy" ON entries
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = entries.stream_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = entries.stream_id
        )
    );

CREATE POLICY "entries_delete_policy" ON entries
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = entries.stream_id
        )
    );

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
    )
    WITH CHECK (
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

-- Outreach policies
CREATE POLICY "outreach_select_policy" ON outreach
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = outreach.stream_id
        )
    );

CREATE POLICY "outreach_insert_policy" ON outreach
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = outreach.stream_id
        )
    );

CREATE POLICY "outreach_update_policy" ON outreach
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = outreach.stream_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = outreach.stream_id
        )
    );

CREATE POLICY "outreach_delete_policy" ON outreach
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = outreach.stream_id
        )
    );

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('entries', 'deals', 'outreach');

-- Verify policies
SELECT * FROM pg_policies 
WHERE tablename IN ('entries', 'deals', 'outreach');
