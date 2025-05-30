-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_invite CASCADE;
DROP FUNCTION IF EXISTS accept_invite CASCADE;
DROP FUNCTION IF EXISTS generate_invite_link CASCADE;

-- Create a new table for stream invitations
CREATE TABLE stream_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    stream_id UUID NOT NULL REFERENCES revenue_streams(id) ON DELETE CASCADE,
    access_level access_level NOT NULL DEFAULT 'member'::access_level,
    inviter_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    invitation_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    UNIQUE(stream_id, email)
);

-- Enable RLS
ALTER TABLE stream_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "invitations_select" ON stream_invitations
    FOR SELECT USING (
        -- Allow stream members to view invitations
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = stream_invitations.stream_id
            AND user_id = auth.uid()
        )
        OR
        -- Allow invited users to view their own invitations
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "invitations_insert" ON stream_invitations
    FOR INSERT WITH CHECK (
        -- Only owners and admins can create invitations
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = stream_invitations.stream_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Function to send invitation
CREATE OR REPLACE FUNCTION send_stream_invitation(
    p_email TEXT,
    p_stream_id UUID,
    p_access_level access_level DEFAULT 'member'::access_level
) RETURNS TABLE (
    invitation_id UUID,
    magic_link TEXT,
    email_sent BOOLEAN
) AS $$
DECLARE
    v_invitation_id UUID;
    v_token TEXT;
    v_magic_link TEXT;
    v_stream_name TEXT;
    v_inviter_name TEXT;
    v_email_sent BOOLEAN;
BEGIN
    -- Get current user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get stream name and inviter details
    SELECT 
        s.name,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email)
    INTO 
        v_stream_name,
        v_inviter_name
    FROM revenue_streams s
    CROSS JOIN auth.users u
    WHERE s.id = p_stream_id
    AND u.id = auth.uid();

    -- Create invitation
    INSERT INTO stream_invitations (
        email,
        stream_id,
        access_level,
        inviter_id
    ) VALUES (
        p_email,
        p_stream_id,
        p_access_level,
        auth.uid()
    )
    RETURNING id, invitation_token INTO v_invitation_id, v_token;

    -- Generate magic link
    v_magic_link := 'http://localhost:3000/join-stream/' || v_token;

    -- Try to send email
    BEGIN
        PERFORM net.http_post(
            url := 'https://api.supabase.com/v1/auth/invite',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', current_setting('request.headers')::json->>'authorization'
            ),
            body := jsonb_build_object(
                'email', p_email,
                'data', jsonb_build_object(
                    'invitation_link', v_magic_link,
                    'stream_name', v_stream_name,
                    'inviter_name', v_inviter_name,
                    'role', p_access_level
                )
            )
        );
        v_email_sent := true;
    EXCEPTION WHEN OTHERS THEN
        v_email_sent := false;
    END;

    -- Return results
    RETURN QUERY SELECT v_invitation_id, v_magic_link, v_email_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_stream_invitation(p_token TEXT)
RETURNS UUID AS $$
DECLARE
    v_invitation record;
    v_user_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get and validate invitation
    SELECT * INTO v_invitation
    FROM stream_invitations
    WHERE invitation_token = p_token
    AND status = 'pending'
    AND expires_at > now();

    IF v_invitation IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Verify email matches
    IF v_invitation.email != (SELECT email FROM auth.users WHERE id = v_user_id) THEN
        RAISE EXCEPTION 'This invitation is for a different email address';
    END IF;

    -- Add user to stream
    INSERT INTO revenue_stream_members (
        stream_id,
        user_id,
        role,
        can_edit
    ) VALUES (
        v_invitation.stream_id,
        v_user_id,
        v_invitation.access_level::text,
        v_invitation.access_level IN ('admin', 'owner')
    );

    -- Mark invitation as accepted
    UPDATE stream_invitations
    SET status = 'accepted'
    WHERE id = v_invitation.id;

    RETURN v_invitation.stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON stream_invitations TO authenticated;
GRANT EXECUTE ON FUNCTION send_stream_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION accept_stream_invitation TO authenticated;
