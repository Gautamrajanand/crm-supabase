-- Fix revenue_stream_members table
ALTER TABLE IF EXISTS public.revenue_stream_members
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS can_edit boolean DEFAULT false;

-- Update policies
DROP POLICY IF EXISTS "Users can view their own revenue stream memberships" ON public.revenue_stream_members;
CREATE POLICY "Users can view their own revenue stream memberships" ON public.revenue_stream_members
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can edit revenue streams they have access to" ON public.revenue_stream_members;
CREATE POLICY "Users can edit revenue streams they have access to" ON public.revenue_stream_members
    FOR UPDATE
    USING (auth.uid() = user_id AND can_edit = true);

-- Enable RLS
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;
