-- Add stream_id to team_invitations table
ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS stream_id uuid REFERENCES streams(id) ON DELETE CASCADE;

-- Update RLS policies for team_invitations
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team owners can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team members can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team owners can delete invitations" ON team_invitations;

CREATE POLICY "Team owners can create invitations"
ON team_invitations
FOR INSERT
WITH CHECK (
  is_stream_owner(stream_id)
);

CREATE POLICY "Team members can view invitations"
ON team_invitations
FOR SELECT
USING (
  is_stream_member(stream_id)
);

CREATE POLICY "Team owners can delete invitations"
ON team_invitations
FOR DELETE
USING (
  is_stream_owner(stream_id)
);
