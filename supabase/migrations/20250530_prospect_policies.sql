-- Drop existing prospect policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON ' || schemaname || '.' || tablename || ';', E'\n')
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'prospects'
    );
END $$;

-- Enable RLS on prospects table
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Create policies for prospects
CREATE POLICY "prospect_select" ON public.prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = prospects.stream_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "prospect_insert" ON public.prospects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "prospect_update" ON public.prospects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "prospect_delete" ON public.prospects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM revenue_streams rs
            JOIN workspace_members wm ON wm.workspace_id = rs.workspace_id
            WHERE rs.id = stream_id
            AND wm.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.prospects TO authenticated;
ALTER TABLE public.prospects FORCE ROW LEVEL SECURITY;
