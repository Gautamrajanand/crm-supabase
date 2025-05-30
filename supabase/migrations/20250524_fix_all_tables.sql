-- Fix revenue_stream_members table
ALTER TABLE IF EXISTS public.revenue_stream_members
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS can_edit boolean DEFAULT false;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.revenue_stream_members;

-- Create better policies
CREATE POLICY "Users can view streams they are members of"
  ON revenue_stream_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
  ON revenue_stream_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Fix profiles table
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS current_stream_id uuid REFERENCES revenue_streams(id),
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create better profile policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Enable RLS
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON revenue_stream_members TO authenticated;
GRANT ALL ON profiles TO authenticated;
