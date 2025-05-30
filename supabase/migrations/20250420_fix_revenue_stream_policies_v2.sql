-- First, enable RLS
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_delete" ON public.revenue_streams;

-- Create new policies
-- Allow any authenticated user to create a stream
CREATE POLICY "Enable insert for authenticated users only"
ON public.revenue_streams FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to see streams they are members of
CREATE POLICY "Enable read access for users based on membership"
ON public.revenue_streams FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = id
    AND m.user_id = auth.uid()
  )
);

-- Allow owners and admins to update their streams
CREATE POLICY "Enable update for owners and admins"
ON public.revenue_streams FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
  )
);

-- Allow only owners to delete their streams
CREATE POLICY "Enable delete for owners only"
ON public.revenue_streams FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'
  )
);

-- Allow any authenticated user to read their own streams
CREATE POLICY "Enable read for own streams"
ON public.revenue_streams FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Make sure the revenue_stream_members table has RLS enabled
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for members table
DROP POLICY IF EXISTS "members_select" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_insert" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_update" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "members_delete" ON public.revenue_stream_members;

-- Create policies for revenue_stream_members
-- Allow members to see other members in their streams
CREATE POLICY "Enable read access for stream members"
ON public.revenue_stream_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
    AND m.user_id = auth.uid()
  )
);

-- Allow owners and admins to add new members
CREATE POLICY "Enable insert for owners and admins"
ON public.revenue_stream_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
  ) OR 
  NOT EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
  )
);

-- Allow owners and admins to update member roles
CREATE POLICY "Enable update for owners and admins"
ON public.revenue_stream_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin')
  )
);

-- Allow owners to remove members
CREATE POLICY "Enable delete for owners"
ON public.revenue_stream_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'
  )
);
