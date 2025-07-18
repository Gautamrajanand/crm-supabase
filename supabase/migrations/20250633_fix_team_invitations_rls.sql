-- Fix RLS policies for team_invitations table
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Team invitations can be created by owners" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be viewed by team members" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be updated by owners" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be deleted by owners" ON team_invitations;

-- Create new policies
CREATE POLICY "Team invitations can be created by owners"
ON team_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team invitations can be viewed by team members"
ON team_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team invitations can be updated by owners"
ON team_invitations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team invitations can be deleted by owners"
ON team_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);
