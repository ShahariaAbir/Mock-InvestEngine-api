-- Seed initial companies data
INSERT INTO companies (name, current_capital, initial_capital, volatility_factor, status, roi_percentage) VALUES
  ('TechCorp Industries', 5000000, 5000000, 1.2, 'Stable', 0),
  ('FinanceFlow Solutions', 3500000, 3500000, 0.8, 'Stable', 0),
  ('CloudVerse Systems', 4200000, 4200000, 1.5, 'Stable', 0),
  ('DataMind Analytics', 2800000, 2800000, 1.1, 'Stable', 0),
  ('QuantumLeap Ventures', 3900000, 3900000, 1.3, 'Stable', 0)
ON CONFLICT (name) DO NOTHING;
