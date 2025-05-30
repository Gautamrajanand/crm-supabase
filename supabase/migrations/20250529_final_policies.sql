-- Drop all existing policies
DROP POLICY IF EXISTS "workspace_select" ON public.workspaces;
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

-- Workspace policies
CREATE POLICY "workspace_select" ON public.workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "workspace_insert" ON public.workspaces
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Workspace member policies
CREATE POLICY "member_select" ON public.workspace_members
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "member_insert" ON public.workspace_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR -- Can insert self
        workspace_id IN ( -- Or is admin/owner of workspace
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Revenue stream policies
CREATE POLICY "revenue_stream_select" ON public.revenue_streams
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "revenue_stream_insert" ON public.revenue_streams
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Revenue stream member policies
CREATE POLICY "stream_member_select" ON public.revenue_stream_members
    FOR SELECT USING (
        stream_id IN (
            SELECT id FROM revenue_streams
            WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "stream_member_insert" ON public.revenue_stream_members
    FOR INSERT WITH CHECK (
        stream_id IN (
            SELECT id FROM revenue_streams
            WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members
                WHERE user_id = auth.uid()
                AND role IN ('owner', 'admin')
            )
        )
    );
