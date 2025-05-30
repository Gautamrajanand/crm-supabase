-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Check stream memberships for current user
SELECT rsm.*, rs.name as stream_name
FROM revenue_stream_members rsm
JOIN revenue_streams rs ON rs.id = rsm.stream_id
WHERE rsm.user_id = auth.uid();

-- Check people and their streams
SELECT p.id, p.name, p.email, p.stream_id, rs.name as stream_name
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
ORDER BY p.created_at DESC;

-- Test RLS policy directly
SELECT p.id, p.name, p.email, p.stream_id, rs.name as stream_name
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
WHERE EXISTS (
    SELECT 1 
    FROM revenue_stream_members rsm
    WHERE rsm.stream_id = p.stream_id
    AND rsm.user_id = auth.uid()
)
ORDER BY p.created_at DESC;
