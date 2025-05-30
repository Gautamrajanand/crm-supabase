-- First, disable RLS temporarily to fix data
ALTER TABLE public.revenue_streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members DISABLE ROW LEVEL SECURITY;

-- Drop the view if it exists
DROP VIEW IF EXISTS public.user_streams;

-- Create the view with correct columns
CREATE OR REPLACE VIEW public.user_streams AS
SELECT 
    rs.*,
    rsm.role,
    rsm.can_edit
FROM public.revenue_streams rs
LEFT JOIN public.revenue_stream_members rsm ON rs.id = rsm.stream_id;

-- Grant access to the view
GRANT SELECT ON public.user_streams TO authenticated;

-- Re-create revenue streams policies with simpler rules
DROP POLICY IF EXISTS "allow_select_own_streams" ON public.revenue_streams;
DROP POLICY IF EXISTS "allow_insert_streams" ON public.revenue_streams;
DROP POLICY IF EXISTS "allow_update_own_streams" ON public.revenue_streams;
DROP POLICY IF EXISTS "allow_delete_own_streams" ON public.revenue_streams;

-- Enable RLS
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "revenue_streams_select" ON public.revenue_streams
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "revenue_streams_insert" ON public.revenue_streams
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "revenue_streams_update" ON public.revenue_streams
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "revenue_streams_delete" ON public.revenue_streams
FOR DELETE TO authenticated
USING (true);

-- Fix the members table policies
DROP POLICY IF EXISTS "members_select" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_insert" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_update" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_delete" ON public.revenue_stream_members;

ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON public.revenue_stream_members
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "members_insert" ON public.revenue_stream_members
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "members_update" ON public.revenue_stream_members
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "members_delete" ON public.revenue_stream_members
FOR DELETE TO authenticated
USING (true);
