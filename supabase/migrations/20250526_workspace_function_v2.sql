-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_workspace_with_owner;

-- Create workspace creation function
CREATE OR REPLACE FUNCTION create_workspace_with_owner(workspace_name TEXT, owner_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_workspace_id UUID;
  v_result JSONB;
BEGIN
  -- Create workspace
  INSERT INTO workspaces (name)
  VALUES (workspace_name)
  RETURNING id INTO v_workspace_id;

  -- Add owner
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, owner_id, 'owner');

  -- Return workspace data
  SELECT jsonb_build_object(
    'id', w.id,
    'name', w.name,
    'created_at', w.created_at
  ) INTO v_result
  FROM workspaces w
  WHERE w.id = v_workspace_id;

  RETURN v_result;
END;
$$;
