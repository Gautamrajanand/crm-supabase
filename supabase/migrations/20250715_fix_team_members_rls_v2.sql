-- Drop existing policies
DROP POLICY IF EXISTS "First member becomes owner" ON team_members;
DROP POLICY IF EXISTS "Owners can add members" ON team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON team_members;
DROP POLICY IF EXISTS "Users can accept invitations" ON team_members;

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can accept invitations"
ON team_members
FOR INSERT
WITH CHECK (
  -- Check if the user has a pending invitation
  EXISTS (
    SELECT 1 FROM team_invitations i
    WHERE i.email = auth.jwt()->>'email'
    AND i.stream_id = team_members.stream_id
    AND i.status = 'pending'
  )
  -- And verify the user is inserting their own record
  AND user_id = auth.uid()
  AND email = auth.jwt()->>'email'
);

CREATE POLICY "Team members can be viewed by team members"
ON team_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = team_members.stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can be updated by owners"
ON team_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = team_members.stream_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'
  )
);

CREATE POLICY "Team members can be deleted by owners"
ON team_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members m
    WHERE m.stream_id = team_members.stream_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'
  )
  OR user_id = auth.uid()
);
