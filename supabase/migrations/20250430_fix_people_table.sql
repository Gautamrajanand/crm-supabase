-- Drop existing index and constraint
DROP INDEX IF EXISTS people_email_idx;
ALTER TABLE people DROP CONSTRAINT IF EXISTS people_stream_id_email_key;

-- Add unique constraint for email per stream
ALTER TABLE people ADD CONSTRAINT people_stream_id_email_key UNIQUE (stream_id, email);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view people in their stream" ON people;
DROP POLICY IF EXISTS "Users can insert people in their stream" ON people;
DROP POLICY IF EXISTS "Users can update people in their stream" ON people;
DROP POLICY IF EXISTS "Users can delete people in their stream" ON people;

-- Create new policies
CREATE POLICY "Users can view people in their stream"
  ON people
  FOR SELECT
  USING (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert people in their stream"
  ON people
  FOR INSERT
  WITH CHECK (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update people in their stream"
  ON people
  FOR UPDATE
  USING (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete people in their stream"
  ON people
  FOR DELETE
  USING (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
