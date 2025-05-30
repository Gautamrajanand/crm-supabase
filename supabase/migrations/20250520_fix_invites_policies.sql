-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON invites;
DROP POLICY IF EXISTS "Enable insert for stream members" ON invites;
DROP POLICY IF EXISTS "Enable update for stream members and invited users" ON invites;

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON invites FOR SELECT
TO authenticated
USING (
  -- User can read their own invites
  email = auth.jwt()->>'email'
  -- Or user is a member of the stream
  OR EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for stream members"
ON invites FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be a member of the stream
  EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = stream_id
    AND people.user_id = auth.uid()
    AND people.access_level IN ('admin', 'member')
  )
);

CREATE POLICY "Enable update for stream members and invited users"
ON invites FOR UPDATE
TO authenticated
USING (
  -- User can update their own invites
  email = auth.jwt()->>'email'
  -- Or user is a member of the stream
  OR EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
    AND people.access_level IN ('admin', 'member')
  )
);
