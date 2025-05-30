-- First disable RLS to clean up
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
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
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = people.stream_id
        )
    );

-- Create a single INSERT policy for authenticated users with admin access
CREATE POLICY "people_insert_policy" ON people
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = people.stream_id
            AND access_level >= 'admin'
        )
    );

-- Create a single UPDATE policy for authenticated users with admin access
CREATE POLICY "people_update_policy" ON people
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = people.stream_id
            AND access_level >= 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = people.stream_id
            AND access_level >= 'admin'
        )
    );

-- Create a single DELETE policy for authenticated users with admin access
CREATE POLICY "people_delete_policy" ON people
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = people.stream_id
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
    p.*,
    EXISTS (
        SELECT 1 
        FROM revenue_stream_members 
        WHERE user_id = auth.uid()
        AND stream_id = p.stream_id
    ) as has_access
FROM people p
WHERE EXISTS (
    SELECT 1 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
    AND stream_id = p.stream_id
)
ORDER BY p.created_at DESC;
