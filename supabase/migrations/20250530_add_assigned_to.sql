-- Add assigned_to column to prospects table
ALTER TABLE prospects 
  ADD COLUMN IF NOT EXISTS assigned_to TEXT;
