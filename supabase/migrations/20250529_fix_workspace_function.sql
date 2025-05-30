-- Drop existing function
DROP FUNCTION IF EXISTS create_workspace;

-- Create a function to handle workspace creation and member assignment in a single transaction
CREATE OR REPLACE FUNCTION create_workspace(
    p_name TEXT,
    p_description TEXT,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_workspace_id UUID;
BEGIN
    -- Create workspace
    INSERT INTO public.workspaces (name, description, created_by)
    VALUES (p_name, p_description, p_user_id)
    RETURNING id INTO v_workspace_id;

    -- Add user as workspace owner
    INSERT INTO public.workspace_members (workspace_id, user_id, role, can_edit)
    VALUES (v_workspace_id, p_user_id, 'owner', true);

    RETURN v_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_workspace TO authenticated;

-- Set the function owner to postgres
ALTER FUNCTION create_workspace OWNER TO postgres;

-- Allow the function to bypass RLS
ALTER FUNCTION create_workspace SET search_path = public, pg_temp;
