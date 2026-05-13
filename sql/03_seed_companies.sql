-- Seed initial companies data
INSERT INTO companies (name, current_capital, initial_capital, volatility_factor, status, roi_percentage) VALUES
  ('CocaCola', 5000000, 5000000, 0.9, 'Stable', 0),
  ('Nvadia', 3500000, 3500000, 1.6, 'Stable', 0),
  ('Microsoft', 4200000, 4200000, 1.1, 'Stable', 0),
  ('Apple', 2800000, 2800000, 1.2, 'Stable', 0),
  ('Samsung', 3900000, 3900000, 1.3, 'Stable', 0)
ON CONFLICT (name) DO NOTHING;
