-- Create or replace the set_current_stream_id function
CREATE OR REPLACE FUNCTION set_current_stream_id(stream_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the stream_id in the app configuration
  PERFORM set_config('app.current_stream_id', stream_id::text, false);
END;
$$;
