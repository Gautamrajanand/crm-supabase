-- Drop existing policies
DROP POLICY IF EXISTS "people_select" ON public.people;
DROP POLICY IF EXISTS "people_insert" ON public.people;
DROP POLICY IF EXISTS "people_update" ON public.people;
DROP POLICY IF EXISTS "people_delete" ON public.people;

-- Create new policies
CREATE POLICY "people_select" ON public.people
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = people.stream_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "people_insert" ON public.people
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = stream_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "people_update" ON public.people
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = people.stream_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "people_delete" ON public.people
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = people.stream_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- Enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
