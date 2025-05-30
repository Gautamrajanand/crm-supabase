-- First add workspace_id to revenue_streams
ALTER TABLE public.revenue_streams 
ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Update RLS policies for revenue_streams
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "revenue_stream_select" ON public.revenue_streams;
CREATE POLICY "revenue_stream_select" ON public.revenue_streams
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "revenue_stream_insert" ON public.revenue_streams;
CREATE POLICY "revenue_stream_insert" ON public.revenue_streams
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_members 
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Update RLS policies for revenue_stream_members
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stream_member_select" ON public.revenue_stream_members;
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
