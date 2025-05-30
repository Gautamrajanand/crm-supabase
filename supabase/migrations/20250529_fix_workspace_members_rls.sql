-- Enable RLS on workspace_members
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_can_see_workspace_members" ON workspace_members;
DROP POLICY IF EXISTS "owners_and_admins_can_manage_members" ON workspace_members;
DROP POLICY IF EXISTS "owners_and_admins_can_update_members" ON workspace_members;
DROP POLICY IF EXISTS "owners_and_admins_can_delete_members" ON workspace_members;

-- Create new policies
CREATE POLICY "users_can_see_workspace_members"
ON workspace_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "owners_and_admins_can_manage_members"
ON workspace_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "owners_and_admins_can_update_members"
ON workspace_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "owners_and_admins_can_delete_members"
ON workspace_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);
