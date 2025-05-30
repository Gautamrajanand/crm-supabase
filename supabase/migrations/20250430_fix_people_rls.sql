-- Drop existing policies
DROP POLICY IF EXISTS "Users can view people in their streams" ON people;
DROP POLICY IF EXISTS "Users can insert people in their streams" ON people;
DROP POLICY IF EXISTS "Users can update people in their streams" ON people;
DROP POLICY IF EXISTS "Users can delete people in their streams" ON people;

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper stream-based filtering
CREATE POLICY "Users can view people in their streams"
ON people
FOR SELECT
USING (
  stream_id IN (
    SELECT stream_id 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert people in their streams"
ON people
FOR INSERT
WITH CHECK (
  stream_id IN (
    SELECT stream_id 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
    AND can_edit = true
  )
);

CREATE POLICY "Users can update people in their streams"
ON people
FOR UPDATE
USING (
  stream_id IN (
    SELECT stream_id 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
    AND can_edit = true
  )
)
WITH CHECK (
  stream_id IN (
    SELECT stream_id 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
    AND can_edit = true
  )
);

CREATE POLICY "Users can delete people in their streams"
ON people
FOR DELETE
USING (
  stream_id IN (
    SELECT stream_id 
    FROM revenue_stream_members 
    WHERE user_id = auth.uid()
    AND can_edit = true
  )
);

-- Add unique constraint on email per stream
ALTER TABLE people 
DROP CONSTRAINT IF EXISTS unique_email_per_stream;

ALTER TABLE people
ADD CONSTRAINT unique_email_per_stream 
UNIQUE (email, stream_id);
