-- Add created_by column to workspaces if it doesn't exist
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS created_by uuid references auth.users(id) on delete set null;
