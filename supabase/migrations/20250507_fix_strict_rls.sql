-- Drop all existing policies
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Make sure RLS is enabled
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Add NOT NULL constraint if missing
ALTER TABLE people 
ALTER COLUMN stream_id SET NOT NULL;

-- Add foreign key if missing
ALTER TABLE people
DROP CONSTRAINT IF EXISTS people_stream_id_fkey;

ALTER TABLE people
ADD CONSTRAINT people_stream_id_fkey 
FOREIGN KEY (stream_id) 
REFERENCES revenue_streams(id)
ON DELETE CASCADE;

-- Create strict RLS policies
CREATE POLICY "Enable select for stream members" ON people
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for stream admins" ON people
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable update for stream admins" ON people
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable delete for stream admins" ON people
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
        )
    );

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'people';

-- Check current user's memberships
SELECT rsm.*, rs.name as stream_name
FROM revenue_stream_members rsm
JOIN revenue_streams rs ON rs.id = rsm.stream_id
WHERE rsm.user_id = auth.uid();
