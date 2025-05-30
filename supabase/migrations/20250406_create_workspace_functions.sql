-- Create function to create a workspace and add the owner
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
  workspace_name text,
  owner_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id uuid;
BEGIN
  -- Insert the workspace
  INSERT INTO workspaces (name)
  VALUES (workspace_name)
  RETURNING id INTO new_workspace_id;

  -- Add the owner to workspace_members
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, owner_id, 'owner');

  -- Return the workspace data
  RETURN jsonb_build_object(
    'id', new_workspace_id,
    'name', workspace_name
  );
END;
$$;
