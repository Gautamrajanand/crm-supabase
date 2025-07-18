-- Add stream_id to team_invitations
ALTER TABLE team_invitations ADD COLUMN stream_id uuid REFERENCES revenue_streams(id);

-- Update RLS policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view invitations"
ON team_invitations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team owners can create invitations"
ON team_invitations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = auth.uid()
    AND team_members.role = 'owner'
  )
);

CREATE POLICY "Team owners can update invitations"
ON team_invitations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = auth.uid()
    AND team_members.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = auth.uid()
    AND team_members.role = 'owner'
  )
);

CREATE POLICY "Team owners can delete invitations"
ON team_invitations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.user_id = auth.uid()
    AND team_members.role = 'owner'
  )
);
