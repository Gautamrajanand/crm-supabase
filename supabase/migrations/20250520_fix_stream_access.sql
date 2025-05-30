-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON revenue_streams;
DROP POLICY IF EXISTS "Enable read access for stream members" ON revenue_streams;
DROP POLICY IF EXISTS "Enable read access for all users" ON revenue_streams;

-- Enable RLS
ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;

-- Create new policies for revenue_streams
CREATE POLICY "Enable read access for stream members"
ON revenue_streams FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM people
    WHERE people.stream_id = revenue_streams.id
    AND people.user_id = auth.uid()
  )
);

-- Update people policies to be more restrictive
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON people;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON people;

-- Create new policies for people table
CREATE POLICY "Enable read access for stream members"
ON people FOR SELECT
TO authenticated
USING (
  stream_id IN (
    SELECT id FROM revenue_streams
    WHERE id IN (
      SELECT stream_id FROM people
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enable insert for stream members"
ON people FOR INSERT
TO authenticated
WITH CHECK (
  stream_id IN (
    SELECT id FROM revenue_streams
    WHERE id IN (
      SELECT stream_id FROM people
      WHERE user_id = auth.uid()
      AND access_level = 'admin'
    )
  )
);

CREATE POLICY "Enable update for stream members"
ON people FOR UPDATE
TO authenticated
USING (
  stream_id IN (
    SELECT id FROM revenue_streams
    WHERE id IN (
      SELECT stream_id FROM people
      WHERE user_id = auth.uid()
      AND access_level = 'admin'
    )
  )
)
WITH CHECK (
  stream_id IN (
    SELECT id FROM revenue_streams
    WHERE id IN (
      SELECT stream_id FROM people
      WHERE user_id = auth.uid()
      AND access_level = 'admin'
    )
  )
);

CREATE POLICY "Enable delete for stream members"
ON people FOR DELETE
TO authenticated
USING (
  stream_id IN (
    SELECT id FROM revenue_streams
    WHERE id IN (
      SELECT stream_id FROM people
      WHERE user_id = auth.uid()
      AND access_level = 'admin'
    )
  )
);
