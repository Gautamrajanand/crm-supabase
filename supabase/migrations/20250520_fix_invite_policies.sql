-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own invites" ON invites;
DROP POLICY IF EXISTS "Admins and members can create invites" ON invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON invites;
DROP POLICY IF EXISTS "Enable read access for all users" ON invites;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invites;
DROP POLICY IF EXISTS "Enable update for users based on email" ON invites;

-- Create new policies
CREATE POLICY "Enable read access for stream members"
ON invites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
  )
  OR email = auth.jwt() ->> 'email'
);

CREATE POLICY "Enable insert for stream members"
ON invites FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for stream members and invited users"
ON invites FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
  )
  OR email = auth.jwt() ->> 'email'
);
