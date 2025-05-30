-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable read access for users based on membership" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable delete for owners only" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable read for own streams" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_delete" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_delete" ON public.revenue_streams;

DROP POLICY IF EXISTS "Enable read access for stream members" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "Enable insert for owners and admins" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "Enable delete for owners" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_insert" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_select" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_update" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_delete" ON public.revenue_stream_members;

DROP POLICY IF EXISTS "deals_insert" ON public.deals;
DROP POLICY IF EXISTS "deals_select" ON public.deals;
DROP POLICY IF EXISTS "deals_update" ON public.deals;
DROP POLICY IF EXISTS "deals_delete" ON public.deals;

DROP POLICY IF EXISTS "people_insert" ON public.people;
DROP POLICY IF EXISTS "people_select" ON public.people;
DROP POLICY IF EXISTS "people_update" ON public.people;
DROP POLICY IF EXISTS "people_delete" ON public.people;

-- Simple revenue_streams policies
CREATE POLICY "revenue_streams_insert" ON public.revenue_streams
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "revenue_streams_select" ON public.revenue_streams
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "revenue_streams_update" ON public.revenue_streams
FOR UPDATE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "revenue_streams_delete" ON public.revenue_streams
FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- Simple revenue_stream_members policies
CREATE POLICY "members_insert" ON public.revenue_stream_members
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "members_select" ON public.revenue_stream_members
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "members_update" ON public.revenue_stream_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR 
       EXISTS (
         SELECT 1 FROM public.revenue_stream_members
         WHERE stream_id = revenue_stream_members.stream_id
         AND user_id = auth.uid()
         AND role = 'owner'
       ));

CREATE POLICY "members_delete" ON public.revenue_stream_members
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR 
       EXISTS (
         SELECT 1 FROM public.revenue_stream_members
         WHERE stream_id = revenue_stream_members.stream_id
         AND user_id = auth.uid()
         AND role = 'owner'
       ));

-- Simple deals policies
CREATE POLICY "deals_insert" ON public.deals
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "deals_select" ON public.deals
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "deals_update" ON public.deals
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "deals_delete" ON public.deals
FOR DELETE TO authenticated
USING (true);

-- Simple people policies
CREATE POLICY "people_insert" ON public.people
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "people_select" ON public.people
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "people_update" ON public.people
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "people_delete" ON public.people
FOR DELETE TO authenticated
USING (true);

-- Enable RLS on all tables
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
