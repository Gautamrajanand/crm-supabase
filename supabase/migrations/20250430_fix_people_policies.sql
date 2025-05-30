-- Drop existing policies for people table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON people;

-- Create new policies that respect stream membership
CREATE POLICY "Enable select for stream members" ON people
    FOR SELECT USING (
        -- Can only see people in streams where you are a member
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = people.stream_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for stream admins" ON people
    FOR INSERT WITH CHECK (
        -- Can only add people to streams where you are an admin/owner
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = people.stream_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable update for stream admins" ON people
    FOR UPDATE USING (
        -- Can only update people in streams where you are an admin/owner
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = people.stream_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        -- Can only update people in streams where you are an admin/owner
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = people.stream_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable delete for stream admins" ON people
    FOR DELETE USING (
        -- Can only delete people in streams where you are an admin/owner
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = people.stream_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );
