-- Update team_invitations table to match our code
ALTER TABLE public.team_invitations
  ALTER COLUMN role TYPE text,
  ALTER COLUMN role SET DEFAULT 'member',
  ADD CONSTRAINT team_invitations_role_check 
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  ALTER COLUMN status TYPE text,
  ALTER COLUMN status SET DEFAULT 'pending',
  ADD CONSTRAINT team_invitations_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  ALTER COLUMN expires_at SET NOT NULL;
