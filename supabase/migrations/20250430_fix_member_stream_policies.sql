-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for owners and admins" ON public.revenue_stream_members;

-- Create new insert policy that properly checks stream_id
CREATE POLICY "Enable insert for owners and admins"
ON public.revenue_stream_members FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow insert if:
  -- 1. The user is an owner/admin of the target stream_id
  -- 2. OR if there are no members in the stream yet (first member)
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

-- Update the read policy to be more explicit about stream_id
DROP POLICY IF EXISTS "Enable read access for stream members" ON public.revenue_stream_members;

CREATE POLICY "Enable read access for stream members"
ON public.revenue_stream_members FOR SELECT
TO authenticated
USING (
  -- Only allow read if:
  -- The user is a member of the same stream_id they're trying to read
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members m
    WHERE m.stream_id = stream_id
    AND m.user_id = auth.uid()
  )
);
