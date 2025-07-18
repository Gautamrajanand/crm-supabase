-- Drop existing policies
DROP POLICY IF EXISTS "prospects_select" ON prospects;
DROP POLICY IF EXISTS "prospects_insert" ON prospects;
DROP POLICY IF EXISTS "prospects_update" ON prospects;
DROP POLICY IF EXISTS "prospects_delete" ON prospects;

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "prospects_select"
ON prospects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = prospects.stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "prospects_insert"
ON prospects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = prospects.stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "prospects_update"
ON prospects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = prospects.stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "prospects_delete"
ON prospects
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = prospects.stream_id
    AND m.user_id = auth.uid()
  )
);
