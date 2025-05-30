-- First, verify the current state
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'people';

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

-- Re-enable RLS
ALTER TABLE public.people FORCE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all operations
CREATE POLICY "people_stream_member_policy" ON people
    AS PERMISSIVE
    FOR ALL
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

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'people';

-- Test the policy with current user
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
    ) as has_access,
    auth.uid() as current_user
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
ORDER BY p.created_at DESC;
