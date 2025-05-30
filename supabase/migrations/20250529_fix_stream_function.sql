-- Create a function to handle revenue stream creation and member assignment
CREATE OR REPLACE FUNCTION create_revenue_stream(
    p_name TEXT,
    p_description TEXT,
    p_workspace_id UUID,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_stream_id UUID;
BEGIN
    -- Create revenue stream
    INSERT INTO public.revenue_streams (name, description, workspace_id, created_by)
    VALUES (p_name, p_description, p_workspace_id, p_user_id)
    RETURNING id INTO v_stream_id;

    -- Add user as stream owner
    INSERT INTO public.revenue_stream_members (stream_id, user_id, role, can_edit)
    VALUES (v_stream_id, p_user_id, 'owner', true);

    RETURN v_stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_revenue_stream TO authenticated;

-- Set the function owner to postgres
ALTER FUNCTION create_revenue_stream OWNER TO postgres;

-- Allow the function to bypass RLS
ALTER FUNCTION create_revenue_stream SET search_path = public, pg_temp;
