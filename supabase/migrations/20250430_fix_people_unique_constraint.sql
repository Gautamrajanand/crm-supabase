-- Drop existing index
DROP INDEX IF EXISTS people_email_idx;

-- Add unique constraint for email per stream
ALTER TABLE people ADD CONSTRAINT people_stream_id_email_key UNIQUE (stream_id, email);
