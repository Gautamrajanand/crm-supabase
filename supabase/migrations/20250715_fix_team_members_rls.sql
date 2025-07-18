-- Drop existing policies
DROP POLICY IF EXISTS "First member becomes owner" ON team_members;
DROP POLICY IF EXISTS "Owners can add members" ON team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON team_members;
DROP POLICY IF EXISTS "Users can accept invitations" ON team_members;

-- Create helper function to check if user has a pending invitation
CREATE OR REPLACE FUNCTION has_pending_invitation(user_email text, target_stream_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_invitations
    WHERE email = user_email
    AND stream_id = target_stream_id
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "First member becomes owner"
ON team_members
FOR INSERT
WITH CHECK (
  role = 'owner' AND
  NOT has_stream_members(stream_id)
);

CREATE POLICY "Owners can add members"
ON team_members
FOR INSERT
WITH CHECK (
  is_stream_owner(stream_id)
);

CREATE POLICY "Users can accept invitations"
ON team_members
FOR INSERT
WITH CHECK (
  has_pending_invitation(auth.jwt()->>'email', stream_id)
);

CREATE POLICY "Team members can be viewed by team members"
ON team_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  is_stream_member(stream_id)
);

CREATE POLICY "Team members can be updated by owners"
ON team_members
FOR UPDATE
USING (
  is_stream_owner(stream_id)
);

CREATE POLICY "Team members can be deleted by owners"
ON team_members
FOR DELETE
USING (
  is_stream_owner(stream_id)
);
