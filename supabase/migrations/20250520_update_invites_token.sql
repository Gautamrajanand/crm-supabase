-- Add token column to invites table if it doesn't exist
ALTER TABLE invites ADD COLUMN IF NOT EXISTS token uuid DEFAULT gen_random_uuid();

-- Add unique constraint to token
ALTER TABLE invites ADD CONSTRAINT invites_token_key UNIQUE (token);

-- Update RLS policies
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for stream members" ON invites;
DROP POLICY IF EXISTS "Enable insert for stream members" ON invites;
DROP POLICY IF EXISTS "Enable update for stream members and invited users" ON invites;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON invites FOR SELECT
TO authenticated
USING (true);

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
