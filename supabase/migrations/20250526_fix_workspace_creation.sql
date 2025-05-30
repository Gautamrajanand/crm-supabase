-- Allow authenticated users to create workspaces
CREATE POLICY "Authenticated users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Allow workspace creators to create themselves as members
CREATE POLICY "Workspace creators can add themselves as members" ON workspace_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );
