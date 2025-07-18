-- Create function to get current user's email
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Team owners can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team members can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team owners can delete invitations" ON team_invitations;
DROP POLICY IF EXISTS "Anyone can view their own pending invitations" ON team_invitations;

-- Create new policies
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

CREATE POLICY "Anyone can view pending invitations by id"
ON team_invitations
FOR SELECT
USING (
  status = 'pending'
);

CREATE POLICY "Team owners can delete invitations"
ON team_invitations
FOR DELETE
USING (
  is_stream_owner(stream_id)
);
