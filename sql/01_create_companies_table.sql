-- Create companies table for the Market Engine
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  current_capital NUMERIC(15, 2) NOT NULL DEFAULT 1000000,
  initial_capital NUMERIC(15, 2) NOT NULL DEFAULT 1000000,
  volatility_factor NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'Stable' CHECK (status IN ('Profit', 'Loss', 'Stable')),
  roi_percentage NUMERIC(5, 2) DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_updated_at ON companies(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to companies data
CREATE POLICY "Allow public read access to companies" ON companies
  FOR SELECT USING (true);

-- Create policy for authenticated users to read companies data
CREATE POLICY "Allow authenticated read access to companies" ON companies
  FOR SELECT USING (auth.role() = 'authenticated');
