-- First, enable RLS on the people table if not already enabled
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Create strict RLS policies
CREATE POLICY "Enable select for stream members" ON people
    FOR SELECT USING (
        -- Can only see people in streams where you are a member
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.stream_id IS NOT NULL
        )
    );

CREATE POLICY "Enable insert for stream admins" ON people
    FOR INSERT WITH CHECK (
        -- Can only add people to streams where you are an admin/owner
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
        )
    );

CREATE POLICY "Enable update for stream admins" ON people
    FOR UPDATE USING (
        -- Can only update people in streams where you are an admin/owner
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
        )
    ) WITH CHECK (
        -- Ensure stream_id is not null and matches the user's stream
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
        )
    );

CREATE POLICY "Enable delete for stream admins" ON people
    FOR DELETE USING (
        -- Can only delete people in streams where you are an admin/owner
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
        )
    );

-- Add NOT NULL constraint to stream_id if it doesn't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE people ALTER COLUMN stream_id SET NOT NULL;
    EXCEPTION
        WHEN others THEN null;
    END;
END $$;
