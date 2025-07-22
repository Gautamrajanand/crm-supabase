-- Safely add stream_preferences table without modifying existing data
CREATE TABLE IF NOT EXISTS stream_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES revenue_streams(id) ON DELETE CASCADE,
  sidebar_labels JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stream_id)
);

-- Add RLS policies for stream_preferences
ALTER TABLE stream_preferences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stream_preferences' 
    AND policyname = 'Users can view stream preferences if they are members'
  ) THEN
    CREATE POLICY "Users can view stream preferences if they are members"
      ON stream_preferences
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM workspace_members wm
          JOIN revenue_streams rs ON rs.workspace_id = wm.workspace_id
          WHERE rs.id = stream_id
          AND wm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stream_preferences' 
    AND policyname = 'Users can update stream preferences if they are members'
  ) THEN
    CREATE POLICY "Users can update stream preferences if they are members"
      ON stream_preferences
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM workspace_members wm
          JOIN revenue_streams rs ON rs.workspace_id = wm.workspace_id
          WHERE rs.id = stream_id
          AND wm.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM workspace_members wm
          JOIN revenue_streams rs ON rs.workspace_id = wm.workspace_id
          WHERE rs.id = stream_id
          AND wm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stream_preferences' 
    AND policyname = 'Users can insert stream preferences if they are members'
  ) THEN
    CREATE POLICY "Users can insert stream preferences if they are members"
      ON stream_preferences
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM workspace_members wm
          JOIN revenue_streams rs ON rs.workspace_id = wm.workspace_id
          WHERE rs.id = stream_id
          AND wm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Function to get stream preferences
CREATE OR REPLACE FUNCTION get_stream_preferences(
  p_stream_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Get stream preferences
  SELECT sidebar_labels INTO v_result
  FROM stream_preferences
  WHERE stream_id = p_stream_id;
  
  -- Return empty JSONB if no preferences found
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Function to update stream preferences
CREATE OR REPLACE FUNCTION update_stream_preferences(
  p_stream_id UUID,
  p_sidebar_labels JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert or update preferences and store the result
  INSERT INTO stream_preferences (stream_id, sidebar_labels)
  VALUES (p_stream_id, p_sidebar_labels)
  ON CONFLICT (stream_id) 
  DO UPDATE SET 
    sidebar_labels = p_sidebar_labels,
    updated_at = now()
  RETURNING sidebar_labels INTO v_result;
  
  -- Return the updated sidebar_labels
  RETURN v_result;
END;
$$;
