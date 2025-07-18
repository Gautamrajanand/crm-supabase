-- Drop all existing policies first
DROP POLICY IF EXISTS "Team invitations can be viewed by anyone" ON public.team_invitations;
DROP POLICY IF EXISTS "Team invitations can be created by any team member" ON public.team_invitations;
DROP POLICY IF EXISTS "Team invitations can be updated by owners" ON public.team_invitations;
DROP POLICY IF EXISTS "Team invitations can be deleted by owners" ON public.team_invitations;

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Team invitations can be viewed by anyone"
ON public.team_invitations
FOR SELECT
USING (
  TRUE  -- Allow anyone to view team invitations
);

CREATE POLICY "Team invitations can be created by any team member"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team invitations can be updated by owners"
ON public.team_invitations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team invitations can be deleted by owners"
ON public.team_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);
