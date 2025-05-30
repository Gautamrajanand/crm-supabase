-- Add can_edit column to revenue_stream_members
ALTER TABLE public.revenue_stream_members 
ADD COLUMN IF NOT EXISTS can_edit BOOLEAN DEFAULT false;

-- Update existing members to have edit permissions
UPDATE public.revenue_stream_members 
SET can_edit = true 
WHERE role = 'owner';

-- Create policy to check can_edit permission
CREATE POLICY "Enable update for users with edit permission" ON public.revenue_streams
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members rsm
      JOIN public.user_profiles up ON up.id = rsm.profile_id
      WHERE rsm.stream_id = id
      AND up.user_id = auth.uid()
      AND rsm.can_edit = true
    )
  );
