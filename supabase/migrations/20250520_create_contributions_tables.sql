-- Drop existing objects
DROP TABLE IF EXISTS public.contributions CASCADE;
DROP TYPE IF EXISTS public.contribution_type CASCADE;

CREATE TYPE public.contribution_type AS ENUM (
  'deal_created',
  'deal_updated',
  'customer_created',
  'customer_updated',
  'task_created',
  'task_completed',
  'outreach_created',
  'outreach_updated'
);

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  contribution_type public.contribution_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Create indexes
CREATE INDEX contributions_user_id_idx ON public.contributions(user_id);
CREATE INDEX contributions_user_email_idx ON public.contributions(user_email);
CREATE INDEX contributions_created_at_idx ON public.contributions(created_at);

-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.contributions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create function to track contributions
CREATE OR REPLACE FUNCTION public.track_contribution(
  p_user_name TEXT,
  p_user_email TEXT,
  p_contribution_type public.contribution_type,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_details JSONB DEFAULT '{}'::jsonb
) RETURNS public.contributions AS $$
DECLARE
  v_contribution public.contributions;
BEGIN
  INSERT INTO public.contributions (
    user_id,
    user_name,
    user_email,
    contribution_type,
    entity_id,
    entity_name,
    details
  ) VALUES (
    CASE 
      WHEN auth.email() = 'anonymous@example.com' THEN NULL
      ELSE auth.uid()
    END,
    p_user_name,
    p_user_email,
    p_contribution_type,
    p_entity_id,
    p_entity_name,
    p_details
  )
  RETURNING * INTO v_contribution;

  RETURN v_contribution;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
