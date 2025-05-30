-- Enable RLS on workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "authenticated_users_can_create_workspace" ON workspaces;
DROP POLICY IF EXISTS "users_can_see_their_workspaces" ON workspaces;
DROP POLICY IF EXISTS "owners_and_admins_can_update_workspace" ON workspaces;
DROP POLICY IF EXISTS "owners_can_delete_workspace" ON workspaces;

-- Create new policies
CREATE POLICY "authenticated_users_can_create_workspace"
ON workspaces FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "users_can_see_their_workspaces"
ON workspaces FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

CREATE POLICY "owners_and_admins_can_update_workspace"
ON workspaces FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role IN ('owner', 'admin')
  )
);

CREATE POLICY "owners_can_delete_workspace"
ON workspaces FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'owner'
  )
);
