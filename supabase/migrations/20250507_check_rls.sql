-- Drop all existing policies and re-enable RLS
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Make sure RLS is enabled
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable select for stream members" ON people
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for stream admins" ON people
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable update for stream admins" ON people
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable delete for stream admins" ON people
    FOR DELETE USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
        )
    );

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'people';

-- Check stream membership for current user
SELECT rsm.* 
FROM revenue_stream_members rsm
WHERE rsm.user_id = auth.uid();

-- Check people visible to current user
SELECT p.* 
FROM people p
WHERE EXISTS (
    SELECT 1 
    FROM revenue_stream_members rsm
    WHERE rsm.stream_id = p.stream_id
    AND rsm.user_id = auth.uid()
);
