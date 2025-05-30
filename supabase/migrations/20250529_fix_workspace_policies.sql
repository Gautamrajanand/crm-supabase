-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "workspace_member_select" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_insert" ON public.workspaces;
DROP POLICY IF EXISTS "member_select" ON public.workspace_members;
DROP POLICY IF EXISTS "member_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "revenue_stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_member_select" ON public.revenue_stream_members;

-- Basic workspace policies
CREATE POLICY "workspace_member_select" ON public.workspaces
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
        user_id = auth.uid() OR -- Can see own membership
        EXISTS (
            SELECT 1 FROM workspace_members m2
            WHERE m2.workspace_id = workspace_members.workspace_id
            AND m2.user_id = auth.uid()
            AND m2.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "member_insert" ON public.workspace_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Revenue stream policies
CREATE POLICY "revenue_stream_select" ON public.revenue_streams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = revenue_streams.workspace_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "revenue_stream_insert" ON public.revenue_streams
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = revenue_streams.workspace_id 
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Revenue stream member policies
CREATE POLICY "stream_member_select" ON public.revenue_stream_members
    FOR SELECT USING (
        user_id = auth.uid() OR -- Can see own membership
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = revenue_stream_members.stream_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "stream_member_insert" ON public.revenue_stream_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = revenue_stream_members.stream_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin')
        )
    );
