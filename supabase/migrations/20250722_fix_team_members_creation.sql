-- Drop existing create_workspace function
DROP FUNCTION IF EXISTS public.create_workspace(text);

-- Create new function that properly sets up team membership
CREATE OR REPLACE FUNCTION public.create_workspace(
  workspace_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workspace_id uuid;
BEGIN
  -- Insert workspace
  INSERT INTO workspaces (name)
  VALUES (workspace_name)
  RETURNING id INTO workspace_id;

  -- Add creator as team member with owner role
  INSERT INTO team_members (workspace_id, user_id, role, email, full_name)
  SELECT 
    workspace_id,
    auth.uid(),
    'owner'::user_role,
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid());

  RETURN workspace_id;
END;
$$;
