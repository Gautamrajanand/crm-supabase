-- Create access_level enum if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
        CREATE TYPE access_level AS ENUM ('admin', 'member', 'viewer');
    END IF;
END $$;

-- Add access_level column to invites table
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS access_level access_level NOT NULL DEFAULT 'member';

-- Update existing invites to have access_level based on role
UPDATE invites
SET access_level = CASE 
    WHEN role IN ('Manager', 'Admin') THEN 'admin'::access_level
    WHEN role IN ('Viewer', 'Read Only') THEN 'viewer'::access_level
    ELSE 'member'::access_level
END;

-- Drop role column as it's being replaced by access_level
ALTER TABLE invites DROP COLUMN IF EXISTS role;
