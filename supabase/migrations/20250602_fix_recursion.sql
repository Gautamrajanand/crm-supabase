-- First drop the problematic policies
DROP POLICY IF EXISTS "Enable read access for stream members" ON revenue_streams;
DROP POLICY IF EXISTS "Enable write access for stream members" ON revenue_streams;
DROP POLICY IF EXISTS "Enable read for stream members" ON share_links;
DROP POLICY IF EXISTS "Enable write for stream owners" ON share_links;

-- Create the user_revenue_streams view first
DROP VIEW IF EXISTS user_revenue_streams;
CREATE VIEW user_revenue_streams AS
SELECT 
    rs.*,
    rsm.user_id,
    rsm.role
FROM revenue_streams rs
JOIN revenue_stream_members rsm ON rs.id = rsm.stream_id;

-- Now create simpler policies that don't cause recursion
CREATE POLICY "Enable read access for stream members" ON revenue_streams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = revenue_streams.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable write access for stream admins" ON revenue_streams
    FOR ALL USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = revenue_streams.id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Enable read for stream members" ON share_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = share_links.stream_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable write for stream owners" ON share_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 
            FROM revenue_stream_members 
            WHERE stream_id = share_links.stream_id 
            AND user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- Grant permissions
GRANT SELECT ON user_revenue_streams TO authenticated;
GRANT ALL ON revenue_streams TO authenticated;
GRANT ALL ON share_links TO authenticated;
GRANT ALL ON revenue_stream_members TO authenticated;
