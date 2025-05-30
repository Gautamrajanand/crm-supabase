-- Create access_level enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.access_level AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop role column check constraint
ALTER TABLE public.revenue_stream_members 
DROP CONSTRAINT IF EXISTS revenue_stream_members_role_check;

-- Add new check constraint using enum
ALTER TABLE public.revenue_stream_members 
ADD CONSTRAINT revenue_stream_members_role_check 
CHECK (role::text = ANY(ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text]));

-- Create access_level column if it doesn't exist
ALTER TABLE public.revenue_stream_members 
ADD COLUMN IF NOT EXISTS access_level public.access_level DEFAULT 'member'::public.access_level;

-- Update access_level based on role for existing records
UPDATE public.revenue_stream_members
SET access_level = role::public.access_level
WHERE access_level IS NULL;
