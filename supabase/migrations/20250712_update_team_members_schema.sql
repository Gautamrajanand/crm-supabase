-- Update team_members table to match our code
ALTER TABLE public.team_members
  ALTER COLUMN role TYPE text,
  ALTER COLUMN role SET DEFAULT 'member',
  ADD CONSTRAINT team_members_role_check 
    CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
