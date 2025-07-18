-- Add stream_id to team_members table as nullable first
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS stream_id UUID REFERENCES revenue_streams(id);

-- Update existing team members with the first revenue stream they have access to
UPDATE team_members tm
SET stream_id = (
  SELECT id 
  FROM revenue_streams rs
  WHERE rs.created_at = (
    SELECT MIN(created_at)
    FROM revenue_streams
  )
  LIMIT 1
)
WHERE tm.stream_id IS NULL;

-- Now make it NOT NULL after updating existing records
ALTER TABLE team_members
ALTER COLUMN stream_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS team_members_stream_id_idx ON team_members(stream_id);

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_members_stream_id_fkey'
  ) THEN
    ALTER TABLE team_members
    ADD CONSTRAINT team_members_stream_id_fkey
    FOREIGN KEY (stream_id)
    REFERENCES revenue_streams(id)
    ON DELETE CASCADE;
  END IF;
END $$;
