-- Add stream_id to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS stream_id UUID REFERENCES revenue_streams(id) ON DELETE CASCADE;

-- Update existing events to use default stream
DO $$
DECLARE
    default_stream_id UUID;
BEGIN
    -- Get default stream ID
    SELECT id INTO default_stream_id FROM revenue_streams WHERE name = 'Default' LIMIT 1;
    
    -- Update events without stream_id
    UPDATE events SET stream_id = default_stream_id WHERE stream_id IS NULL;
    
    -- Make stream_id required
    ALTER TABLE events ALTER COLUMN stream_id SET NOT NULL;
END $$;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Add new RLS policies based on stream membership
CREATE POLICY "Users can view events in their streams"
    ON events FOR SELECT
    USING (user_is_stream_member(stream_id));

CREATE POLICY "Users can create events in their streams"
    ON events FOR INSERT
    WITH CHECK (user_is_stream_member(stream_id));

CREATE POLICY "Users can update events in their streams"
    ON events FOR UPDATE
    USING (user_is_stream_member(stream_id))
    WITH CHECK (user_is_stream_member(stream_id));

CREATE POLICY "Users can delete events in their streams"
    ON events FOR DELETE
    USING (user_is_stream_member(stream_id));
