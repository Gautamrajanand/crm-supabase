-- Revert all recent changes
DROP POLICY IF EXISTS "Enable read access for stream members" ON revenue_streams;
DROP POLICY IF EXISTS "Enable write access for stream admins" ON revenue_streams;
DROP POLICY IF EXISTS "Enable read for stream members" ON share_links;
DROP POLICY IF EXISTS "Enable write for stream owners" ON share_links;
DROP VIEW IF EXISTS user_revenue_streams;

-- Restore original policies
CREATE POLICY "Enable read access for authenticated users" ON revenue_streams
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for stream members" ON revenue_streams
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id 
      FROM revenue_stream_members 
      WHERE stream_id = id
    )
  );

CREATE POLICY "Enable read for share links" ON share_links
  FOR SELECT USING (true);

CREATE POLICY "Enable write for stream owners" ON share_links
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id 
      FROM revenue_stream_members 
      WHERE stream_id = share_links.stream_id
      AND role = 'owner'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON revenue_streams TO authenticated;
GRANT ALL ON share_links TO authenticated;
GRANT ALL ON revenue_stream_members TO authenticated;
