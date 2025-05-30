-- Add deal_value to prospects table
ALTER TABLE prospects
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10, 2) DEFAULT 0;
