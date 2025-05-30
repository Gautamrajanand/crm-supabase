-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON people;
DROP POLICY IF EXISTS "Enable insert for stream members" ON people;
DROP POLICY IF EXISTS "Enable update for stream members" ON people;
DROP POLICY IF EXISTS "Enable delete for stream members" ON people;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON people;

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON people FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON people FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON people FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON people FOR DELETE
TO authenticated
USING (true);
