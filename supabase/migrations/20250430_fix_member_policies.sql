-- Drop existing policies
DROP POLICY IF EXISTS "revenue_stream_members_insert_policy" ON revenue_stream_members;
DROP POLICY IF EXISTS "Enable insert for owners and admins" ON revenue_stream_members;

-- Create new member insert policy
CREATE POLICY "revenue_stream_members_insert_policy" ON revenue_stream_members
    FOR INSERT WITH CHECK (
        -- Allow insert if:
        -- 1. The user is an owner/admin of the stream and is adding someone else
        (
            EXISTS (
                SELECT 1 FROM revenue_stream_members
                WHERE stream_id = NEW.stream_id
                AND user_id = auth.uid()
                AND role IN ('owner', 'admin')
            )
            AND
            NEW.user_id != auth.uid()
        )
        OR
        -- 2. The user is accepting an invitation to join
        (
            auth.uid() = NEW.user_id
            AND EXISTS (
                SELECT 1 FROM stream_invitations
                WHERE stream_id = NEW.stream_id
                AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
                AND status = 'pending'
                AND expires_at > now()
            )
        )
        OR
        -- 3. This is the first member of the stream (creator)
        (
            auth.uid() = NEW.user_id
            AND NEW.role = 'owner'
            AND NOT EXISTS (
                SELECT 1 FROM revenue_stream_members
                WHERE stream_id = NEW.stream_id
            )
        )
    );
