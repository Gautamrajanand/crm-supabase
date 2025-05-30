-- Drop and recreate the user_streams view with the correct definition
DROP VIEW IF EXISTS public.user_streams;

CREATE OR REPLACE VIEW public.user_streams AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.created_at,
    m.user_id,
    m.role,
    m.can_edit,
    CASE 
        WHEN m.role = 'owner' THEN true
        WHEN m.role = 'admin' THEN true
        ELSE false
    END AS can_manage_members
FROM public.revenue_streams s
INNER JOIN public.revenue_stream_members m ON s.id = m.stream_id
WHERE m.user_id = auth.uid();

-- Create the user_workspaces view as an alias
DROP VIEW IF EXISTS public.user_workspaces;
CREATE OR REPLACE VIEW public.user_workspaces AS
SELECT * FROM public.user_streams;

-- Grant permissions
GRANT SELECT ON public.user_streams TO authenticated;
GRANT SELECT ON public.user_workspaces TO authenticated;
