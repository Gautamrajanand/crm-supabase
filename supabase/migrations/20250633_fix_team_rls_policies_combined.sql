-- Fix RLS policies for team_members and team_invitations tables
BEGIN;

-- Enable RLS on both tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Team members can be created by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be bootstrapped" ON team_members;

DROP POLICY IF EXISTS "Team invitations can be created by owners" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be viewed by team members" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be updated by owners" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be deleted by owners" ON team_invitations;

-- Create team_members policies
CREATE POLICY "Team members can be bootstrapped"
ON team_members
FOR INSERT
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM team_members)  -- Allow first member to be created
  AND auth.uid() IS NOT NULL  -- Must be authenticated
);

CREATE POLICY "Team members can be created by owners"
ON team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team members can be viewed by team members"
ON team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()
  )
  OR NOT EXISTS (SELECT 1 FROM team_members)  -- Allow viewing if no members exist
);

CREATE POLICY "Team members can be updated by owners"
ON team_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team members can be deleted by owners"
ON team_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

-- Create team_invitations policies
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

COMMIT;
