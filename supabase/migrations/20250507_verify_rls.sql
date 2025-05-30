-- First verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Drop all existing policies and re-enable RLS
DROP POLICY IF EXISTS "Enable select for stream members" ON people;
DROP POLICY IF EXISTS "Enable insert for stream admins" ON people;
DROP POLICY IF EXISTS "Enable update for stream admins" ON people;
DROP POLICY IF EXISTS "Enable delete for stream admins" ON people;

-- Make sure RLS is enabled
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for testing
CREATE POLICY "Enable select for stream members" ON people
    FOR SELECT USING (
        stream_id::text = current_setting('app.current_stream_id', true)::text
    );

-- Set up function to set current stream ID
CREATE OR REPLACE FUNCTION set_current_stream_id(stream_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_stream_id', stream_id, false);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set stream ID
CREATE OR REPLACE FUNCTION set_stream_id_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM set_current_stream_id(NEW.stream_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_stream_id_trigger ON people;
CREATE TRIGGER set_stream_id_trigger
  BEFORE INSERT OR UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION set_stream_id_trigger();

-- Add NOT NULL and foreign key constraints
ALTER TABLE people 
    ALTER COLUMN stream_id SET NOT NULL,
    ADD CONSTRAINT fk_people_stream 
    FOREIGN KEY (stream_id) 
    REFERENCES revenue_streams(id)
    ON DELETE CASCADE;
