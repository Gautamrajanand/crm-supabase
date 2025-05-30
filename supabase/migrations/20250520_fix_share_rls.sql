-- Drop existing policies
DROP POLICY IF EXISTS "Enable management for creators" ON share_links;
DROP POLICY IF EXISTS "Enable view for all" ON share_links;

-- Share links policies
CREATE POLICY "Enable insert for authenticated users"
ON share_links FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all"
ON share_links FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for creators"
ON share_links FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM revenue_streams
    WHERE id = share_links.stream_id
    AND created_by::text = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Enable delete for creators"
ON share_links FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM revenue_streams
    WHERE id = share_links.stream_id
    AND created_by::text = auth.jwt() ->> 'email'
  )
);
