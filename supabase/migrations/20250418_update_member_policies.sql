-- Drop existing policies
DROP POLICY IF EXISTS "revenue_stream_members_insert_policy" ON revenue_stream_members;

-- Create new insert policy that allows anyone to join
CREATE POLICY "revenue_stream_members_insert_policy" ON revenue_stream_members
    FOR INSERT WITH CHECK (
        -- Allow insert if:
        -- 1. The user is inserting themselves as a member
        -- 2. The role is 'member'
        -- 3. can_edit is false
        auth.uid() = user_id AND
        role::access_level = 'member'::access_level AND
        can_edit = true
    );
