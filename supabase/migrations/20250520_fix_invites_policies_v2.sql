-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON invites;
DROP POLICY IF EXISTS "Enable insert for stream members" ON invites;
DROP POLICY IF EXISTS "Enable update for stream members and invited users" ON invites;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invites;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON invites;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON invites;

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON invites FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON invites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON invites FOR UPDATE
TO authenticated
USING (true);
