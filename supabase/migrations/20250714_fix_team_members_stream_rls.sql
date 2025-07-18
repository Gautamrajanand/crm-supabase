-- Create app.current_stream_id parameter if it doesn't exist
DO $$ 
BEGIN
  PERFORM set_config('app.current_stream_id', '', false);
EXCEPTION 
  WHEN undefined_object THEN
    ALTER DATABASE postgres SET app.current_stream_id = '';
END $$;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION get_current_stream_id()
RETURNS uuid AS $$
DECLARE
  current_id text;
BEGIN
  current_id := current_setting('app.current_stream_id', true);
  IF current_id IS NULL OR current_id = '' THEN
    RETURN NULL;
  END IF;
  RETURN current_id::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_stream_owner(stream_uuid uuid)
RETURNS boolean AS $$
BEGIN
  IF stream_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid()
    AND role = 'owner'
    AND stream_id = stream_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_stream_member(stream_uuid uuid)
RETURNS boolean AS $$
BEGIN
  IF stream_uuid IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid()
    AND stream_id = stream_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_stream_members(stream_uuid uuid)
RETURNS boolean AS $$
BEGIN
  IF stream_uuid IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE stream_id = stream_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "First member becomes owner" ON team_members;
DROP POLICY IF EXISTS "Owners can add members" ON team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON team_members;

-- Enable RLS
ALTER TABLE team_members FORCE ROW LEVEL SECURITY;

-- Create new policies using helper functions
CREATE POLICY "First member becomes owner"
ON team_members
FOR INSERT
WITH CHECK (
  role = 'owner' AND
  NOT has_stream_members(get_current_stream_id())
);

CREATE POLICY "Owners can add members"
ON team_members
FOR INSERT
WITH CHECK (
  is_stream_owner(get_current_stream_id())
);

CREATE POLICY "Team members can be viewed by team members"
ON team_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  is_stream_member(stream_id)
);

CREATE POLICY "Team members can be updated by owners"
ON team_members
FOR UPDATE
USING (
  is_stream_owner(stream_id)
);

CREATE POLICY "Team members can be deleted by owners"
ON team_members
FOR DELETE
USING (
  is_stream_owner(stream_id)
);

-- Function to set current stream_id
CREATE OR REPLACE FUNCTION set_current_stream_id(stream_id uuid)
RETURNS void AS $$
BEGIN
  IF stream_id IS NULL THEN
    PERFORM set_config('app.current_stream_id', '', true);
  ELSE
    PERFORM set_config('app.current_stream_id', stream_id::text, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
