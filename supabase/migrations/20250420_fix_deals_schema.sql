-- Drop existing policies
DROP POLICY IF EXISTS "deals_insert" ON public.deals;
DROP POLICY IF EXISTS "deals_select" ON public.deals;
DROP POLICY IF EXISTS "deals_update" ON public.deals;
DROP POLICY IF EXISTS "deals_delete" ON public.deals;

-- Make sure stream_id is required and references revenue_streams
ALTER TABLE public.deals 
  ALTER COLUMN stream_id SET NOT NULL,
  ADD CONSTRAINT deals_stream_id_fkey 
  FOREIGN KEY (stream_id) 
  REFERENCES public.revenue_streams(id) 
  ON DELETE CASCADE;

-- Create new policies
CREATE POLICY "deals_select" ON public.deals
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = deals.stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "deals_insert" ON public.deals
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "deals_update" ON public.deals
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = deals.stream_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "deals_delete" ON public.deals
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = deals.stream_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
  )
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
