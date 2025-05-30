-- First check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- Check if there are any policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'people';

-- Check stream memberships
SELECT 
    rsm.*,
    rs.name as stream_name,
    auth.uid() as current_user
FROM revenue_stream_members rsm
JOIN revenue_streams rs ON rs.id = rsm.stream_id
WHERE rsm.user_id = auth.uid();

-- Check people distribution
SELECT 
    rs.id as stream_id,
    rs.name as stream_name,
    COUNT(p.id) as people_count
FROM revenue_streams rs
LEFT JOIN people p ON p.stream_id = rs.id
GROUP BY rs.id, rs.name
ORDER BY rs.name;

-- Check if people have valid stream IDs
SELECT 
    p.id,
    p.name,
    p.email,
    p.stream_id,
    rs.name as stream_name,
    EXISTS (
        SELECT 1 
        FROM revenue_stream_members rsm
        WHERE rsm.stream_id = p.stream_id
        AND rsm.user_id = auth.uid()
    ) as has_access
FROM people p
JOIN revenue_streams rs ON rs.id = p.stream_id
ORDER BY p.created_at DESC;
