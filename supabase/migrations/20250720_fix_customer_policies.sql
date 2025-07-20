-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

-- Add stream_id column if it doesn't exist
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS stream_id UUID REFERENCES revenue_streams(id) ON DELETE CASCADE;

-- Create new policies based on stream membership
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = customers.stream_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = stream_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = customers.stream_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "customers_delete" ON customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.revenue_stream_members m
      WHERE m.stream_id = customers.stream_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );
