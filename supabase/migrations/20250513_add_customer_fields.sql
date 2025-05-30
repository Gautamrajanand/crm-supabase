-- Add new fields to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS annual_revenue bigint,
ADD COLUMN IF NOT EXISTS employee_count integer,
ADD COLUMN IF NOT EXISTS last_contacted timestamp with time zone,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS lifetime_value bigint;

-- Create an index on industry for faster filtering
CREATE INDEX IF NOT EXISTS customers_industry_idx ON customers (industry);

-- Create an index on last_contacted for faster sorting
CREATE INDEX IF NOT EXISTS customers_last_contacted_idx ON customers (last_contacted);

-- Create an index on annual_revenue for faster sorting
CREATE INDEX IF NOT EXISTS customers_annual_revenue_idx ON customers (annual_revenue);

-- Create a GIN index on tags for faster searching
CREATE INDEX IF NOT EXISTS customers_tags_idx ON customers USING gin (tags);
