-- First disable RLS to clean up
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;
DROP POLICY IF EXISTS "Enable all for stream owners" ON people;
DROP POLICY IF EXISTS "Enable most actions for stream admins" ON people;
DROP POLICY IF EXISTS "Enable view for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream members" ON people;
DROP POLICY IF EXISTS "Enable update for stream members" ON people;
DROP POLICY IF EXISTS "Enable delete for stream members" ON people;
DROP POLICY IF EXISTS "people_stream_member_policy" ON people;

-- Now enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create separate policies for each operation
CREATE POLICY "people_select_policy" ON people
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = people.stream_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "people_insert_policy" ON people
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = stream_id 
            AND user_id = auth.uid()
            AND access_level >= 'admin'
        )
    );

CREATE POLICY "people_update_policy" ON people
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = people.stream_id 
            AND user_id = auth.uid()
            AND access_level >= 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = stream_id 
            AND user_id = auth.uid()
            AND access_level >= 'admin'
        )
    );

CREATE POLICY "people_delete_policy" ON people
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = people.stream_id 
            AND user_id = auth.uid()
            AND access_level >= 'admin'
        )
    );

-- Verify the policies
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'people';
SELECT * FROM pg_policies WHERE tablename = 'people';
