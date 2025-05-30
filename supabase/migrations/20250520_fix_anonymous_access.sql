-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all" ON share_links;
DROP POLICY IF EXISTS "Enable access via share link" ON revenue_streams;
DROP POLICY IF EXISTS "Enable insert for all" ON user_sessions;
DROP POLICY IF EXISTS "Enable view own sessions" ON user_sessions;

-- Share links policies - allow anyone to read share links
CREATE POLICY "Enable read access for all"
ON share_links FOR SELECT
TO authenticated
USING (true);

-- Revenue streams policy - allow access via share links
CREATE POLICY "Enable access via share link"
ON revenue_streams FOR SELECT
TO authenticated
USING (
  -- User has access through a share link
  EXISTS (
    SELECT 1 FROM share_links
    WHERE stream_id = revenue_streams.id
    AND (expires_at IS NULL OR expires_at > now())
  )
  -- Or user is anonymous (needed for initial access)
  OR auth.email() = 'anonymous@example.com'
);

-- User sessions policies
CREATE POLICY "Enable insert for all"
ON user_sessions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable view own sessions"
ON user_sessions FOR SELECT
TO authenticated
USING (
  user_email = auth.email()
  OR
  auth.email() = 'anonymous@example.com'
);
