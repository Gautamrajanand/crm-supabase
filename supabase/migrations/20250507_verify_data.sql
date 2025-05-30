-- Check people table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'people';

-- Check if stream_id is properly set for all people
SELECT p.id, p.name, p.email, p.stream_id, rs.name as stream_name
FROM people p
LEFT JOIN revenue_streams rs ON rs.id = p.stream_id
ORDER BY p.created_at DESC;

-- Check revenue stream memberships
SELECT rsm.user_id, rsm.stream_id, rsm.role, rs.name as stream_name
FROM revenue_stream_members rsm
JOIN revenue_streams rs ON rs.id = rsm.stream_id
WHERE rsm.user_id = auth.uid();

-- Add NOT NULL constraint and foreign key if missing
ALTER TABLE people 
ALTER COLUMN stream_id SET NOT NULL;

ALTER TABLE people
DROP CONSTRAINT IF EXISTS people_stream_id_fkey;

ALTER TABLE people
ADD CONSTRAINT people_stream_id_fkey 
FOREIGN KEY (stream_id) 
REFERENCES revenue_streams(id)
ON DELETE CASCADE;
