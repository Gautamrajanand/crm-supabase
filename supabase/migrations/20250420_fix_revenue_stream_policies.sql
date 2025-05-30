-- Drop existing policies
DROP POLICY IF EXISTS "stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_delete" ON public.revenue_streams;

-- Create new policies
CREATE POLICY "stream_select" ON public.revenue_streams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "stream_insert" ON public.revenue_streams
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "stream_update" ON public.revenue_streams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "stream_delete" ON public.revenue_streams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = id
      AND m.user_id = auth.uid()
      AND m.role = 'owner'
    )
  );

-- Enable RLS
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
