-- First, disable RLS to make changes
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Re-enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create owner policy (can do everything)
CREATE POLICY "Enable all for stream owners" ON people
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role = 'owner'
        )
    );

-- Create admin policy (can do everything except delete)
CREATE POLICY "Enable most actions for stream admins" ON people
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role = 'admin'
        )
    );

-- Create member policy (can only view)
CREATE POLICY "Enable view for stream members" ON people
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role = 'member'
        )
    );

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'people';

-- Test the policies
SELECT p.id, p.name, p.email, p.stream_id, rs.name as stream_name
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
WHERE EXISTS (
    SELECT 1 
    FROM revenue_stream_members rsm
    WHERE rsm.stream_id = p.stream_id
    AND rsm.user_id = auth.uid()
)
ORDER BY p.created_at DESC;
