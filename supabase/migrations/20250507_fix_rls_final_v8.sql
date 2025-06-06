-- First disable RLS to clean up
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (including the public ones)
DROP POLICY IF EXISTS "Users can view people in their streams" ON people;
DROP POLICY IF EXISTS "Users can insert people in their streams" ON people;
DROP POLICY IF EXISTS "Users can update people in their streams" ON people;
DROP POLICY IF EXISTS "Users can delete people in their streams" ON people;
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
DROP POLICY IF EXISTS "people_select_policy" ON people;
DROP POLICY IF EXISTS "people_insert_policy" ON people;
DROP POLICY IF EXISTS "people_update_policy" ON people;
DROP POLICY IF EXISTS "people_delete_policy" ON people;

-- Now enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create a single SELECT policy for authenticated users
CREATE POLICY "people_select_policy" ON people
    FOR SELECT
    TO authenticated
    USING (
        stream_id IN (
            SELECT stream_id 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
        )
    );

-- Create a single INSERT policy for authenticated users
CREATE POLICY "people_insert_policy" ON people
    FOR INSERT
    TO authenticated
    WITH CHECK (
        stream_id IN (
            SELECT stream_id 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND access_level >= 'admin'
        )
    );

-- Create a single UPDATE policy for authenticated users
CREATE POLICY "people_update_policy" ON people
    FOR UPDATE
    TO authenticated
    USING (
        stream_id IN (
            SELECT stream_id 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND access_level >= 'admin'
        )
    )
    WITH CHECK (
        stream_id IN (
            SELECT stream_id 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND access_level >= 'admin'
        )
    );

-- Create a single DELETE policy for authenticated users
CREATE POLICY "people_delete_policy" ON people
    FOR DELETE
    TO authenticated
    USING (
        stream_id IN (
            SELECT stream_id 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND access_level >= 'admin'
        )
    );

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Verify only our new policies exist
SELECT * FROM pg_policies WHERE tablename = 'people';

-- Test the policy with a sample query
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
    (
        SELECT array_agg(stream_id) 
        FROM revenue_stream_members 
        WHERE user_id = auth.uid()
    ) as user_streams
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
WHERE p.stream_id IN (
    SELECT stream_id 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
)
ORDER BY p.created_at DESC;
