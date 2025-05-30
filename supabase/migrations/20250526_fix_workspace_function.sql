-- Create a function to handle workspace creation
CREATE OR REPLACE FUNCTION create_workspace(p_name TEXT, p_user_id UUID)
RETURNS TABLE (id UUID, name TEXT) AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Create the workspace
  INSERT INTO workspaces (name)
  VALUES (p_name)
  RETURNING id INTO v_workspace_id;

  -- Add the creator as owner
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_user_id, 'owner');

  -- Return the workspace details
  RETURN QUERY
  SELECT workspaces.id, workspaces.name
  FROM workspaces
  WHERE workspaces.id = v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
