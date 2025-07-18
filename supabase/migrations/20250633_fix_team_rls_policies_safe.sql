-- Fix RLS policies for team_members and team_invitations tables
BEGIN;

-- Save existing policies for rollback
CREATE TABLE IF NOT EXISTS _migration_backup_20250633 (
  table_name text,
  policy_name text,
  cmd text,
  qual text,
  with_check text
);

INSERT INTO _migration_backup_20250633
SELECT 
  schemaname || '.' || tablename as table_name, 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('team_members', 'team_invitations');

-- Check if we have any existing team members
DO $$
DECLARE
  member_count int;
BEGIN
  SELECT COUNT(*) INTO member_count FROM team_members;
  IF member_count > 0 THEN
    -- We have existing members, make sure at least one OWNER exists
    IF NOT EXISTS (SELECT 1 FROM team_members WHERE role = 'OWNER') THEN
      RAISE EXCEPTION 'No OWNER found in team_members. Please fix data before applying migration.';
    END IF;
  END IF;
END $$;

-- Enable RLS on both tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Team members can be created by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be viewed by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by owners" ON team_members;
DROP POLICY IF EXISTS "Team members can be bootstrapped" ON team_members;

DROP POLICY IF EXISTS "Team invitations can be created by owners" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be viewed by team members" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be updated by owners" ON team_invitations;
DROP POLICY IF EXISTS "Team invitations can be deleted by owners" ON team_invitations;

-- Create team_members policies
CREATE POLICY "Team members can be bootstrapped"
ON team_members
FOR INSERT
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM team_members)  -- Allow first member to be created
  AND auth.uid() IS NOT NULL  -- Must be authenticated
);

CREATE POLICY "Team members can be created by owners"
ON team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team members can be viewed by team members"
ON team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()
  )
  OR NOT EXISTS (SELECT 1 FROM team_members)  -- Allow viewing if no members exist
);

CREATE POLICY "Team members can be updated by owners"
ON team_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team members can be deleted by owners"
ON team_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

-- Create team_invitations policies
CREATE POLICY "Team invitations can be created by owners"
ON team_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team invitations can be viewed by team members"
ON team_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team invitations can be updated by owners"
ON team_invitations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

CREATE POLICY "Team invitations can be deleted by owners"
ON team_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);

-- Verify policies were created correctly
DO $$
DECLARE
  policy_count int;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('team_members', 'team_invitations');
  
  IF policy_count < 9 THEN
    RAISE EXCEPTION 'Not all policies were created successfully';
  END IF;
END $$;

COMMIT;

-- Rollback script in case of issues:
/*
BEGIN;
-- Restore original policies from backup
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM _migration_backup_20250633
  LOOP
    EXECUTE format('CREATE POLICY %I ON %s FOR %s USING (%s) WITH CHECK (%s)',
      r.policy_name,
      r.table_name,
      r.cmd,
      COALESCE(r.qual, 'true'),
      COALESCE(r.with_check, 'true')
    );
  END LOOP;
END $$;

DROP TABLE _migration_backup_20250633;
COMMIT;
*/
