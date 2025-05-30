-- Add missing columns to prospects table
ALTER TABLE prospects 
  ADD COLUMN IF NOT EXISTS added_by TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'prospects_priority_check'
  ) THEN
    ALTER TABLE prospects
    ADD CONSTRAINT prospects_priority_check 
    CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Update added_by with user_id for existing records
UPDATE prospects 
SET added_by = user_id 
WHERE added_by IS NULL;
