-- Drop dependent constraints first
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_person_id_fkey;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.people;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.people;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.people;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.people;

-- Drop indexes
DROP INDEX IF EXISTS public.people_stream_id_idx;
DROP INDEX IF EXISTS public.people_email_idx;

-- Drop the people table
DROP TABLE IF EXISTS public.people CASCADE;

-- Drop unused enums
DROP TYPE IF EXISTS public.person_status CASCADE;
DROP TYPE IF EXISTS public.permission_level CASCADE;

-- Note: access_level enum is used by other tables (invites) so we keep it
