-- Drop existing policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON ' || schemaname || '.' || tablename || ';', E'\n')
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('workspaces', 'workspace_members', 'revenue_streams', 'revenue_stream_members')
    );
END $$;

-- Temporarily disable RLS
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;

-- 1. Workspaces - can view/update if you're a member
CREATE POLICY "workspace_select_member" ON public.workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "workspace_insert_auth" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "workspace_update_member" ON public.workspaces
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = id
            AND user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = id
            AND user_id = auth.uid()
        )
    );

-- 2. Workspace members - simplified policy to avoid recursion
CREATE POLICY "member_select_own" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "member_insert_own" ON public.workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "member_update_own" ON public.workspace_members
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Revenue streams - simplified policies
CREATE POLICY "revenue_stream_select" ON public.revenue_streams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = revenue_streams.workspace_id
            AND user_id = auth.uid()
        ) OR
        created_by = auth.uid()
    );

CREATE POLICY "revenue_stream_insert" ON public.revenue_streams
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = revenue_streams.workspace_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "revenue_stream_update" ON public.revenue_streams
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = revenue_streams.workspace_id
            AND user_id = auth.uid()
        ) AND
        created_by = auth.uid()
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = revenue_streams.workspace_id
            AND user_id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "revenue_stream_delete" ON public.revenue_streams
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_id = revenue_streams.workspace_id
            AND user_id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

-- 4. Revenue stream members - can view/update if in workspace
CREATE POLICY "revenue_stream_member_select" ON public.revenue_stream_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "revenue_stream_member_insert" ON public.revenue_stream_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "revenue_stream_member_update" ON public.revenue_stream_members
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    ) WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.workspace_members TO authenticated;
GRANT ALL ON public.revenue_streams TO authenticated;
GRANT ALL ON public.revenue_stream_members TO authenticated;

-- Allow bypass RLS for the create_workspace function
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams FORCE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members FORCE ROW LEVEL SECURITY;
