-- Drop existing constraints
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_role_check;
ALTER TABLE team_invitations DROP CONSTRAINT IF EXISTS team_invitations_role_check;

-- Update data to lowercase
UPDATE team_members 
SET role = LOWER(role)
WHERE role IN ('OWNER', 'MEMBER', 'ADMIN', 'VIEWER');

UPDATE team_invitations 
SET role = LOWER(role)
WHERE role IN ('OWNER', 'MEMBER', 'ADMIN', 'VIEWER');

-- Add new constraints with lowercase roles
ALTER TABLE team_members
  ALTER COLUMN role SET DEFAULT 'member',
  ADD CONSTRAINT team_members_role_check 
    CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

ALTER TABLE team_invitations
  ALTER COLUMN role SET DEFAULT 'member',
  ADD CONSTRAINT team_invitations_role_check 
    CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

-- Drop all existing policies
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete" ON public.team_members;
DROP POLICY IF EXISTS "team_invitations_select" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_update" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_delete" ON public.team_invitations;

-- Create new policies with lowercase roles
CREATE POLICY "team_members_select"
ON public.team_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "team_members_insert"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow first member OR
  NOT EXISTS (SELECT 1 FROM team_members) OR
  -- Allow owner to add members OR
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  ) OR
  -- Allow user to add themselves if they don't exist yet
  (
    user_id = auth.uid() AND 
    NOT EXISTS (
      SELECT 1 FROM team_members 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "team_members_update"
ON public.team_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);

CREATE POLICY "team_members_delete"
ON public.team_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
  AND user_id <> auth.uid()
);

CREATE POLICY "team_invitations_select"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "team_invitations_insert"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "team_invitations_update"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);

CREATE POLICY "team_invitations_delete"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
  )
);
