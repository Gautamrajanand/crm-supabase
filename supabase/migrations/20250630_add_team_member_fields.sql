BEGIN;

-- Drop existing tables and functions
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.team_invitations CASCADE;

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_team_member_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_team_member_updated_at ON public.team_members;
CREATE TRIGGER update_team_member_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_member_updated_at();

-- Create function to handle invitation acceptance
CREATE OR REPLACE FUNCTION public.handle_team_invitation_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Only proceed if accepting a pending invitation
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get user info
    SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
    INTO v_user_id, v_email, v_full_name
    FROM auth.users
    WHERE email = NEW.email;

    -- Insert new team member
    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.team_members (user_id, email, full_name, role)
      VALUES (v_user_id, v_email, v_full_name, NEW.role)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to send invitation emails
CREATE OR REPLACE FUNCTION public.handle_team_invitation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send email for new pending invitations
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- For local testing, just log the invitation details
    RAISE NOTICE 'New invitation: %', jsonb_build_object(
      'to', NEW.email,
      'role', NEW.role,
      'invitationId', NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation email
DROP TRIGGER IF EXISTS handle_team_invitation_email ON public.team_invitations;
CREATE TRIGGER handle_team_invitation_email
  AFTER INSERT ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_invitation_email();

-- Create trigger for invitation acceptance
DROP TRIGGER IF EXISTS handle_team_invitation_acceptance ON public.team_invitations;
CREATE TRIGGER handle_team_invitation_acceptance
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_invitation_acceptance();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON public.team_members TO authenticated;
GRANT ALL ON public.team_invitations TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.update_team_member_updated_at TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_team_invitation_acceptance TO authenticated;

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS team_members_select ON public.team_members;
DROP POLICY IF EXISTS team_members_insert ON public.team_members;
DROP POLICY IF EXISTS team_members_update ON public.team_members;
DROP POLICY IF EXISTS team_members_delete ON public.team_members;
DROP POLICY IF EXISTS team_invitations_select ON public.team_invitations;
DROP POLICY IF EXISTS team_invitations_insert ON public.team_invitations;
DROP POLICY IF EXISTS team_invitations_update ON public.team_invitations;
DROP POLICY IF EXISTS team_invitations_delete ON public.team_invitations;

-- Team Members Policies
CREATE POLICY team_members_select ON public.team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY team_members_insert ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.team_members)
    OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  );

CREATE POLICY team_members_update ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  );

CREATE POLICY team_members_delete ON public.team_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
    AND
    user_id != auth.uid()
  );

-- Team Invitations Policies
CREATE POLICY team_invitations_select ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY team_invitations_insert ON public.team_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.team_members)
    OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  );

CREATE POLICY team_invitations_update ON public.team_invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  );

CREATE POLICY team_invitations_delete ON public.team_invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'OWNER'
    )
  );

COMMIT;
