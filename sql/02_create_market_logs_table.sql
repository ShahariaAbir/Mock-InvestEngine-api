-- Create market logs table to track profit/loss events
CREATE TABLE IF NOT EXISTS market_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('profit', 'loss')),
  roi_percentage NUMERIC(5, 2) NOT NULL,
  capital_before NUMERIC(15, 2) NOT NULL,
  capital_after NUMERIC(15, 2) NOT NULL,
  change_amount NUMERIC(15, 2) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_market_logs_company_id ON market_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_market_logs_timestamp ON market_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_market_logs_event_type ON market_logs(event_type);

-- Enable Row Level Security
ALTER TABLE market_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to market logs
CREATE POLICY "Allow public read access to market logs" ON market_logs
  FOR SELECT USING (true);

-- Create policy for authenticated users to read market logs
CREATE POLICY "Allow authenticated read access to market logs" ON market_logs
  FOR SELECT USING (auth.role() = 'authenticated');
