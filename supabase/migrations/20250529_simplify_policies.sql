-- Drop all existing policies
DROP POLICY IF EXISTS "workspace_member_select" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_insert" ON public.workspaces;
DROP POLICY IF EXISTS "member_select" ON public.workspace_members;
DROP POLICY IF EXISTS "member_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "revenue_stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_member_select" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "stream_member_insert" ON public.revenue_stream_members;

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;

-- Simple workspace policies
CREATE POLICY "workspace_select" ON public.workspaces
    FOR SELECT USING (true);  -- Everyone can see workspaces, access controlled via members

CREATE POLICY "workspace_insert" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);  -- Any authenticated user can create

-- Simple workspace member policies
CREATE POLICY "member_select" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid());  -- Can only see own memberships

CREATE POLICY "member_insert" ON public.workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());  -- Can only insert self

-- Simple revenue stream policies
CREATE POLICY "revenue_stream_select" ON public.revenue_streams
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "revenue_stream_insert" ON public.revenue_streams
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- Simple revenue stream member policies
CREATE POLICY "stream_member_select" ON public.revenue_stream_members
    FOR SELECT USING (user_id = auth.uid());  -- Can only see own memberships

CREATE POLICY "stream_member_insert" ON public.revenue_stream_members
    FOR INSERT WITH CHECK (user_id = auth.uid());  -- Can only insert self

-- Grant necessary permissions
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.revenue_streams TO authenticated;
GRANT ALL ON public.revenue_stream_members TO authenticated;
