-- Drop existing insert policy
DROP POLICY IF EXISTS "prospects_insert" ON prospects;

-- Create new insert policy that checks team membership for the stream_id being inserted
CREATE POLICY "prospects_insert"
ON prospects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = stream_id  -- Reference the stream_id from the inserting row
    AND m.user_id = auth.uid()
  )
);
