BEGIN;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.team_activity CASCADE;
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;

-- Create team_members table
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add role constraint separately
ALTER TABLE public.team_members ADD CONSTRAINT team_members_role_check 
    CHECK (role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text, 'MEMBER'::text, 'VIEWER'::text]));

-- Create team_invitations table
CREATE TABLE public.team_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '7 days') NOT NULL
);

-- Create team_activity table for tracking
CREATE TABLE public.team_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant permissions on team tables
GRANT ALL ON public.team_invitations TO authenticated;
GRANT ALL ON public.team_activity TO authenticated;
GRANT ALL ON public.team_members TO authenticated;

-- Drop existing team member policies if they exist
-- Drop all existing policies first
-- Function to handle first user as owner
CREATE OR REPLACE FUNCTION public.handle_first_user_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user
    IF NOT EXISTS (SELECT 1 FROM public.team_members) THEN
        -- Insert as owner if no other owners exist
        INSERT INTO public.team_members (id, user_id, email, full_name, role)
        VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            'OWNER'
        );

        -- Log the action
        INSERT INTO public.team_activity (user_id, action, details)
        VALUES (NEW.id, 'became_first_owner', jsonb_build_object('email', NEW.email));

        RAISE NOTICE 'Created initial owner: %', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate policies
DO $$ BEGIN
    -- Clean up any stale data
    DELETE FROM public.team_members;
    DELETE FROM public.team_invitations;
    DELETE FROM public.team_activity;

    -- Drop all existing policies first
    DROP POLICY IF EXISTS "Team members are viewable by anyone" ON public.team_members;
    DROP POLICY IF EXISTS "Team members viewable" ON public.team_members;
    DROP POLICY IF EXISTS "Owners and admins can manage team members" ON public.team_members;
    DROP POLICY IF EXISTS "First user becomes owner" ON public.team_members;
    DROP POLICY IF EXISTS "Team member management" ON public.team_members;
    DROP POLICY IF EXISTS "Team member insert" ON public.team_members;
    DROP POLICY IF EXISTS "Team member update" ON public.team_members;
    DROP POLICY IF EXISTS "Team member delete" ON public.team_members;
    DROP POLICY IF EXISTS "Invitation creation" ON public.team_invitations;
    DROP POLICY IF EXISTS "Invitation viewing" ON public.team_invitations;
    DROP POLICY IF EXISTS "Invitation acceptance" ON public.team_invitations;
    DROP POLICY IF EXISTS "Activity viewing" ON public.team_activity;
    DROP POLICY IF EXISTS "Users can create their own activity" ON public.team_activity;

    -- Enable RLS
    ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.team_activity ENABLE ROW LEVEL SECURITY;

    -- Team members policies
    CREATE POLICY "Team member select" ON public.team_members
        FOR SELECT
        USING (
            -- Anyone can view team members
            TRUE
        );

    -- First user policy is handled by trigger, not RLS
    -- This is because the trigger runs as SECURITY DEFINER
    -- and bypasses RLS policies

    CREATE POLICY "Team member insert" ON public.team_members
        FOR INSERT
        WITH CHECK (
            -- Only owners can insert team members
            EXISTS (
                SELECT 1 FROM auth.users u
                WHERE u.id = auth.uid()
                AND EXISTS (
                    SELECT 1 FROM team_members tm 
                    WHERE tm.user_id = u.id 
                    AND tm.role = 'OWNER'
                )
            )
        );

    CREATE POLICY "Team member update" ON public.team_members
        FOR UPDATE
        USING (
            -- Only owners can update team members
            EXISTS (
                SELECT 1 FROM auth.users u
                WHERE u.id = auth.uid()
                AND EXISTS (
                    SELECT 1 FROM team_members tm 
                    WHERE tm.user_id = u.id 
                    AND tm.role = 'OWNER'
                )
            )
        );

    CREATE POLICY "Team member delete" ON public.team_members
        FOR DELETE
        USING (
            -- Only owners can delete team members
            EXISTS (
                SELECT 1 FROM auth.users u
                WHERE u.id = auth.uid()
                AND EXISTS (
                    SELECT 1 FROM team_members tm 
                    WHERE tm.user_id = u.id 
                    AND tm.role = 'OWNER'
                )
            )
        );

    -- Team invitations policies
    CREATE POLICY "Invitation creation" ON public.team_invitations
        FOR INSERT
        WITH CHECK (
            -- Only owners can create invitations
            EXISTS (
                SELECT 1 FROM team_members tm 
                WHERE tm.user_id = auth.uid()
                AND UPPER(tm.role) = 'OWNER'
            )
            AND invited_by = auth.uid()
        );

    CREATE POLICY "Invitation viewing" ON public.team_invitations
        FOR SELECT
        USING (
            -- Owners can view all invitations
            EXISTS (
                SELECT 1 FROM team_members tm 
                WHERE tm.user_id = auth.uid()
                AND UPPER(tm.role) = 'OWNER'
            )
            -- Users can view their own invitations
            OR email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        );

    CREATE POLICY "Invitation acceptance" ON public.team_invitations
        FOR UPDATE
        USING (
            -- Users can only accept their own pending invitations
            email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
            AND status = 'pending'
        )
        WITH CHECK (
            -- Only allow accepting invitations
            status = 'accepted'
        );

    CREATE POLICY "Activity viewing" ON public.team_activity
        FOR SELECT
        USING (
            -- Anyone can view activity
            TRUE
        );

    CREATE POLICY "Activity creation" ON public.team_activity
        FOR INSERT
        WITH CHECK (
            -- Users can only create their own activity
            user_id = auth.uid()
        );
END $$;

-- Create logging function and trigger
CREATE OR REPLACE FUNCTION public.log_invitation_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role text;
    v_user_email text;
BEGIN
    -- Get current user info
    SELECT role INTO v_user_role
    FROM public.team_members
    WHERE user_id = auth.uid();

    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = auth.uid();

    RAISE NOTICE 'Invitation attempt by % (Role: %) for email: %', 
        v_user_email, 
        COALESCE(v_user_role, 'none'),
        NEW.email;

    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS log_invitation_trigger ON public.team_invitations;
CREATE TRIGGER log_invitation_trigger
    BEFORE INSERT OR UPDATE ON public.team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.log_invitation_attempt();

-- Functions
CREATE OR REPLACE FUNCTION public.handle_team_invitation_acceptance()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Store role to ensure consistency
        v_role := NEW.role;

        -- Create team member
        -- Get user details
        WITH user_details AS (
            SELECT 
                auth.uid() as user_id,
                COALESCE(email, NEW.email) as email,
                COALESCE(raw_user_meta_data->>'full_name', NEW.email) as full_name
            FROM auth.users 
            WHERE id = auth.uid()
        )
        INSERT INTO public.team_members (id, user_id, email, full_name, role)
        SELECT 
            gen_random_uuid(),
            user_id,
            email,
            full_name,
            v_role
        FROM user_details
        WHERE NOT EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE user_id = auth.uid()
        );
        
        -- Log activity
        INSERT INTO public.team_activity (user_id, action, details)
        VALUES (auth.uid(), 'joined_team', jsonb_build_object('role', v_role));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for invitation acceptance
CREATE TRIGGER on_team_invitation_accepted
    AFTER UPDATE ON public.team_invitations
    FOR EACH ROW
    WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
    EXECUTE FUNCTION public.handle_team_invitation_acceptance();

-- Indexes
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_email_idx ON public.team_members(email);
CREATE INDEX IF NOT EXISTS team_invitations_email_idx ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS team_activity_user_id_idx ON public.team_activity(user_id);

-- Drop and recreate function to add initial owner
DROP FUNCTION IF EXISTS public.add_initial_owner();
CREATE FUNCTION public.add_initial_owner()
RETURNS boolean AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_full_name TEXT;
    v_owner_role TEXT := 'OWNER';
    v_inserted boolean := false;
BEGIN
    -- Get the first user from auth.users table
    SELECT 
        id, 
        email,
        COALESCE(raw_user_meta_data->>'full_name', email) -- Use email as fallback
    INTO v_user_id, v_email, v_full_name
    FROM auth.users
    LIMIT 1;

    -- Add as owner if no owner exists and we have a valid user
    IF v_user_id IS NOT NULL AND v_email IS NOT NULL THEN
        INSERT INTO public.team_members (id, user_id, email, full_name, role)
        SELECT 
            gen_random_uuid(),
            v_user_id, 
            v_email, 
            v_full_name, 
            v_owner_role
        WHERE NOT EXISTS (
            SELECT 1 FROM public.team_members WHERE role = v_owner_role
        )
        RETURNING true INTO v_inserted;
    END IF;

    -- Log activity if owner was added
    IF v_inserted THEN
        INSERT INTO public.team_activity (user_id, action, details)
        VALUES (v_user_id, 'initial_owner_added', jsonb_build_object('email', v_email));
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add initial owner and verify setup
DO $$ 
DECLARE
    v_success boolean;
    v_user_email text;
    v_user_role text;
    v_user_id uuid;
    v_owner_count int;
    v_member record;
BEGIN
    -- Get current user info
    SELECT id, email INTO v_user_id, v_user_email
    FROM auth.users
    WHERE id = auth.uid();

    RAISE NOTICE 'Attempting to set up owner. User ID: %, Email: %', v_user_id, v_user_email;



    -- Get user role
    SELECT role INTO v_user_role
    FROM public.team_members
    WHERE user_id = auth.uid();

    RAISE NOTICE 'Current user: % (Role: %)', v_user_email, COALESCE(v_user_role, 'none');

    -- Try to add as owner if needed
    SELECT public.add_initial_owner() INTO v_success;
    IF v_success THEN
        RAISE NOTICE 'Initial owner added successfully';
        

        
        -- Insert debug activity
        INSERT INTO public.team_activity (user_id, action, details)
        VALUES (v_user_id, 'debug_owner_added', jsonb_build_object(
            'email', v_user_email,
            'success', v_success
        ));
    ELSE
        RAISE NOTICE 'Initial owner not added (may already exist)';
    END IF;

    -- Verify final state
    SELECT role INTO v_user_role
    FROM public.team_members
    WHERE user_id = auth.uid();

    RAISE NOTICE 'Final role: %', COALESCE(v_user_role, 'none');

    -- Check total number of owners
    SELECT COUNT(*) INTO v_owner_count
    FROM public.team_members
    WHERE role = 'OWNER';
    
    RAISE NOTICE 'Total owners: %', v_owner_count;
    
    -- Show current team members
    FOR v_member IN (
        SELECT tm.*, u.email as auth_email
        FROM public.team_members tm
        LEFT JOIN auth.users u ON tm.user_id = u.id
        ORDER BY tm.role, tm.created_at
    ) LOOP
        RAISE NOTICE 'Member: % (%) - Role: % - Joined: %',
            v_member.full_name,
            v_member.auth_email,
            v_member.role,
            v_member.joined_at;
    END LOOP;
    

END $$;

-- Create trigger for first user
DROP TRIGGER IF EXISTS tr_handle_first_user_owner ON auth.users;
CREATE TRIGGER tr_handle_first_user_owner
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_first_user_owner();

-- Create debug trigger for first user
CREATE OR REPLACE FUNCTION public.debug_first_user_owner()
RETURNS trigger AS $$
DECLARE
    v_user_email text;
    v_user_id uuid;
    v_owner_count integer;
BEGIN
    -- Get current user info
    SELECT id, email INTO v_user_id, v_user_email
    FROM auth.users
    WHERE id = NEW.id;

    -- Check total number of users
    SELECT COUNT(*) INTO v_owner_count
    FROM public.team_members;

    RAISE NOTICE 'New user signup: % (%). Total members: %', v_user_email, v_user_id, v_owner_count;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_debug_first_user_owner ON auth.users;
CREATE TRIGGER tr_debug_first_user_owner
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.debug_first_user_owner();

-- Create debug function for team invitations
CREATE OR REPLACE FUNCTION public.debug_team_invitation_attempt()
RETURNS trigger AS $$
DECLARE
    v_user_role text;
    v_user_email text;
    v_user_id uuid;
BEGIN
    -- Get current user info
    SELECT id, email INTO v_user_id, v_user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Get user role
    SELECT role INTO v_user_role
    FROM public.team_members
    WHERE user_id = auth.uid();

    RAISE NOTICE 'Team invitation attempt by % (%) with role %', v_user_email, v_user_id, COALESCE(v_user_role, 'none');
    RAISE NOTICE 'Invitation details: email=%, role=%, status=%', NEW.email, NEW.role, NEW.status;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create debug trigger for team invitations
DROP TRIGGER IF EXISTS tr_debug_team_invitation ON public.team_invitations;
CREATE TRIGGER tr_debug_team_invitation
    BEFORE INSERT OR UPDATE ON public.team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.debug_team_invitation_attempt();

COMMIT;
