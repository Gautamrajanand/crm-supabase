-- Drop existing prospect policies
DROP POLICY IF EXISTS "prospects_select_policy" ON prospects;
DROP POLICY IF EXISTS "prospects_insert_policy" ON prospects;
DROP POLICY IF EXISTS "prospects_update_policy" ON prospects;
DROP POLICY IF EXISTS "prospects_delete_policy" ON prospects;

-- Create new policies that handle both stream_id and user_id
CREATE POLICY "prospects_select_policy" ON prospects
    FOR SELECT
    TO authenticated
    USING (
        -- Allow access if user is a member of the stream OR if they created the prospect
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "prospects_insert_policy" ON prospects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow insert if user is a member of the stream AND they are setting themselves as owner
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "prospects_update_policy" ON prospects
    FOR UPDATE
    TO authenticated
    USING (
        -- Allow update if user is a member of the stream OR if they created the prospect
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
        OR user_id = auth.uid()
    )
    WITH CHECK (
        -- Allow update if user is a member of the stream OR if they created the prospect
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "prospects_delete_policy" ON prospects
    FOR DELETE
    TO authenticated
    USING (
        -- Allow delete if user is a member of the stream OR if they created the prospect
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE user_id = auth.uid()
            AND stream_id = prospects.stream_id
        )
        OR user_id = auth.uid()
    );

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'prospects'
ORDER BY cmd;
