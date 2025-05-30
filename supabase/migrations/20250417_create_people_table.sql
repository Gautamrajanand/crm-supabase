-- Create enums
CREATE TYPE access_level AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE person_status AS ENUM ('active', 'inactive');
CREATE TYPE permission_level AS ENUM ('none', 'view', 'edit');

-- Create people table
CREATE TABLE people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  status person_status DEFAULT 'active'::person_status NOT NULL,
  access_level access_level DEFAULT 'member'::access_level NOT NULL,
  avatar_url TEXT,
  stream_id UUID NOT NULL REFERENCES revenue_streams(id) ON DELETE CASCADE,
  -- Page permissions
  outreach_access permission_level DEFAULT 'none' NOT NULL,
  deals_access permission_level DEFAULT 'none' NOT NULL,
  customers_access permission_level DEFAULT 'none' NOT NULL,
  tasks_access permission_level DEFAULT 'none' NOT NULL,
  calendar_access permission_level DEFAULT 'none' NOT NULL,
  people_access permission_level DEFAULT 'none' NOT NULL
);

-- Create index for faster lookups
CREATE INDEX people_stream_id_idx ON people(stream_id);
CREATE INDEX people_email_idx ON people(email);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view people in their stream"
  ON people
  FOR SELECT
  USING (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert people in their stream"
  ON people
  FOR INSERT
  WITH CHECK (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update people in their stream"
  ON people
  FOR UPDATE
  USING (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete people in their stream"
  ON people
  FOR DELETE
  USING (
    stream_id IN (
      SELECT stream_id 
      FROM revenue_stream_members 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
