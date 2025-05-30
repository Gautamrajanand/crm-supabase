-- Add access_level column to invites table
ALTER TABLE invites ADD COLUMN IF NOT EXISTS access_level text CHECK (access_level IN ('admin', 'member', 'viewer')) DEFAULT 'member' NOT NULL;

-- Update RLS policies for invites table
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invites"
ON invites FOR SELECT
TO authenticated
USING (
  email = auth.jwt() ->> 'email'
  OR EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
    AND people.access_level IN ('admin', 'member')
  )
);

CREATE POLICY "Admins and members can create invites"
ON invites FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
    AND people.access_level IN ('admin', 'member')
  )
);

CREATE POLICY "Users can update their own invites"
ON invites FOR UPDATE
TO authenticated
USING (
  email = auth.jwt() ->> 'email'
  OR EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = invites.stream_id
    AND people.user_id = auth.uid()
    AND people.access_level IN ('admin', 'member')
  )
);
