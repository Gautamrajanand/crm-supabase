-- First verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Drop all existing policies and re-enable RLS
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Make sure RLS is enabled
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for testing
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

-- Add NOT NULL constraint if it doesn't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE people ALTER COLUMN stream_id SET NOT NULL;
    EXCEPTION
        WHEN others THEN null;
    END;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE people 
        ADD CONSTRAINT fk_people_stream 
        FOREIGN KEY (stream_id) 
        REFERENCES revenue_streams(id)
        ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_people_stream_id ON people(stream_id);
CREATE INDEX IF NOT EXISTS idx_revenue_stream_members_stream_user ON revenue_stream_members(stream_id, user_id);
