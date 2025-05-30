-- Drop existing policies
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Create strict RLS policies with explicit joins
CREATE POLICY "Enable select for stream members" ON people
    FOR SELECT USING (
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            INNER JOIN revenue_streams rs ON rs.id = rsm.stream_id
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.stream_id IS NOT NULL
            AND rs.id = people.stream_id
        )
    );

CREATE POLICY "Enable insert for stream admins" ON people
    FOR INSERT WITH CHECK (
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            INNER JOIN revenue_streams rs ON rs.id = rsm.stream_id
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
            AND rs.id = people.stream_id
        )
    );

CREATE POLICY "Enable update for stream admins" ON people
    FOR UPDATE USING (
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            INNER JOIN revenue_streams rs ON rs.id = rsm.stream_id
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
            AND rs.id = people.stream_id
        )
    ) WITH CHECK (
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            INNER JOIN revenue_streams rs ON rs.id = rsm.stream_id
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
            AND rs.id = people.stream_id
        )
    );

CREATE POLICY "Enable delete for stream admins" ON people
    FOR DELETE USING (
        stream_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM revenue_stream_members rsm
            INNER JOIN revenue_streams rs ON rs.id = rsm.stream_id
            WHERE rsm.stream_id = people.stream_id
            AND rsm.user_id = auth.uid()
            AND rsm.role IN ('owner', 'admin')
            AND rsm.stream_id IS NOT NULL
            AND rs.id = people.stream_id
        )
    );

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_people_stream_id ON people(stream_id);
CREATE INDEX IF NOT EXISTS idx_revenue_stream_members_stream_user ON revenue_stream_members(stream_id, user_id);

-- Verify NOT NULL constraint
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE people ALTER COLUMN stream_id SET NOT NULL;
    EXCEPTION
        WHEN others THEN null;
    END;
END $$;
