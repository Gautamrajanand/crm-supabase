-- First, let's find the workspace for gautam@hubhopper.com
DO $$ 
DECLARE
    v_user_id uuid;
    v_workspace_id uuid;
BEGIN
    -- Get user ID for gautam@hubhopper.com
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'gautam@hubhopper.com';

    -- Check if workspace exists
    SELECT id INTO v_workspace_id
    FROM public.workspaces
    WHERE created_by = v_user_id
    LIMIT 1;

    -- If no workspace exists, create one
    IF v_workspace_id IS NULL THEN
        INSERT INTO public.workspaces (name, description, created_by)
        VALUES ('Hubhopper', 'Hubhopper Workspace', v_user_id)
        RETURNING id INTO v_workspace_id;

        -- Add user as workspace owner
        INSERT INTO public.workspace_members (workspace_id, user_id, role, can_edit)
        VALUES (v_workspace_id, v_user_id, 'owner', true);
    END IF;

    -- Update all existing revenue streams to link to this workspace
    UPDATE public.revenue_streams
    SET workspace_id = v_workspace_id
    WHERE created_by = v_user_id
    AND workspace_id IS NULL;

END $$;
