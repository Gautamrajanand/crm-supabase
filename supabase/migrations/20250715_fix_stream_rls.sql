-- Drop existing policies
DROP POLICY IF EXISTS "stream_select" ON revenue_streams;
DROP POLICY IF EXISTS "share_links_select" ON share_links;

-- Create new policies
CREATE POLICY "stream_select"
ON revenue_streams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM revenue_stream_members m
    WHERE m.stream_id = revenue_streams.id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "share_links_select"
ON share_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM revenue_stream_members m
    WHERE m.stream_id = share_links.stream_id
    AND m.user_id = auth.uid()
  )
);
