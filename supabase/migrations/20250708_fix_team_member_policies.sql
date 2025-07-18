-- Drop all existing policies first
DROP POLICY IF EXISTS "Team members are viewable by anyone" ON public.team_members;
DROP POLICY IF EXISTS "Team members viewable" ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "First user becomes owner" ON public.team_members;
DROP POLICY IF EXISTS "Team member management" ON public.team_members;
DROP POLICY IF EXISTS "Team member insert" ON public.team_members;
DROP POLICY IF EXISTS "Team member update" ON public.team_members;
DROP POLICY IF EXISTS "Team member delete" ON public.team_members;
DROP POLICY IF EXISTS "Team member select" ON public.team_members;
DROP POLICY IF EXISTS "Team members can be created by owners" ON public.team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON public.team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON public.team_members;

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Team members can be viewed by anyone"
ON public.team_members
FOR SELECT
USING (
  TRUE  -- Allow anyone to view team members
);

CREATE POLICY "Team members can be created by owners"
ON public.team_members
FOR INSERT
WITH CHECK (
  (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  )
  OR
  (
    -- Allow first member to be created
    NOT EXISTS (SELECT 1 FROM team_members)
  )
);

CREATE POLICY "Team members can be updated by owners"
ON public.team_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team members can be deleted by owners"
ON public.team_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);
