-- Fix RLS policies for team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Team members can be created by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON team_members;

-- Create new policies
CREATE POLICY "Team members can be created by owners"
ON team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
  OR NOT EXISTS (SELECT 1 FROM team_members)  -- Allow first member to be created
);

CREATE POLICY "Team members can be viewed by team members"
ON team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()
  )
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
