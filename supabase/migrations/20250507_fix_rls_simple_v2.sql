-- First, disable RLS to make changes
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;
DROP POLICY IF EXISTS "Enable all for stream owners" ON people;
DROP POLICY IF EXISTS "Enable most actions for stream admins" ON people;
DROP POLICY IF EXISTS "Enable view for stream members" ON people;

-- Re-enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create a single simple policy for testing
CREATE POLICY "Enable view for stream members" ON people AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
        )
    );

-- Create insert policy
CREATE POLICY "Enable insert for stream members" ON people AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = stream_id
            AND rsm.user_id = auth.uid()
        )
    );

-- Create update policy
CREATE POLICY "Enable update for stream members" ON people AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = stream_id
            AND rsm.user_id = auth.uid()
        )
    );

-- Create delete policy
CREATE POLICY "Enable delete for stream members" ON people AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
        )
    );

-- Test the policy
SELECT 
    p.id,
    p.name,
    p.email,
    p.stream_id,
    rs.name as stream_name,
    EXISTS (
        SELECT 1 
        FROM revenue_stream_members rsm
        WHERE rsm.stream_id = p.stream_id
        AND rsm.user_id = auth.uid()
    ) as has_access
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
ORDER BY p.created_at DESC;
