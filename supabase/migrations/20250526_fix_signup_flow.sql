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

-- Create a function to handle workspace creation
CREATE OR REPLACE FUNCTION create_workspace(p_name TEXT, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_workspace_id UUID;
  v_workspace_data JSON;
BEGIN
  -- Create the workspace
  INSERT INTO workspaces (name)
  VALUES (p_name)
  RETURNING id INTO v_workspace_id;

  -- Add the creator as owner
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_user_id, 'owner');

  -- Get workspace data as JSON
  SELECT json_build_object(
    'id', w.id,
    'name', w.name,
    'created_at', w.created_at
  ) INTO v_workspace_data
  FROM workspaces w
  WHERE w.id = v_workspace_id;

  RETURN v_workspace_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
