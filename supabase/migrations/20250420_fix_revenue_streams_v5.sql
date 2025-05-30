-- First drop ALL existing revenue stream policies
DROP POLICY IF EXISTS "revenue_streams_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "revenue_streams_delete" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable read access for users based on membership" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable delete for owners only" ON public.revenue_streams;
DROP POLICY IF EXISTS "Enable read for own streams" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_delete" ON public.revenue_streams;

-- Make sure RLS is enabled
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;

-- Create basic policies for revenue streams
CREATE POLICY "allow_select_own_streams"
ON public.revenue_streams FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.revenue_stream_members
    WHERE stream_id = id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "allow_insert_streams"
ON public.revenue_streams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_update_own_streams"
ON public.revenue_streams FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "allow_delete_own_streams"
ON public.revenue_streams FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'revenue_streams' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.revenue_streams 
    ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;
