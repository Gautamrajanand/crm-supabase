-- Drop existing invites table
DROP TABLE IF EXISTS invites CASCADE;

-- Create invites table with correct constraints
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    stream_id UUID NOT NULL REFERENCES revenue_streams(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    role access_level NOT NULL DEFAULT 'member'::access_level,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired'))

);

-- Create partial unique index for pending invites
CREATE UNIQUE INDEX invites_pending_unique_idx ON invites (stream_id, email) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "invites_select" ON invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = invites.stream_id
            AND user_id = auth.uid()
        )
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "invites_insert" ON invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM revenue_stream_members
            WHERE stream_id = invites.stream_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Grant permissions
GRANT ALL ON invites TO authenticated;
