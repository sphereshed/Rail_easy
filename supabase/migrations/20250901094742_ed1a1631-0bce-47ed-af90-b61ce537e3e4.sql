
-- Add day-wise service and class-specific pricing to trains table
ALTER TABLE trains 
ADD COLUMN operating_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
ADD COLUMN class_prices jsonb DEFAULT '{"1A": 5000, "2A": 2500, "3A": 1500, "3E": 1200, "SL": 800, "CC": 600, "EC": 1000, "2S": 300}'::jsonb;

-- Update existing trains with sample operating days and class-specific prices
UPDATE trains SET 
  operating_days = CASE 
    WHEN id = (SELECT id FROM trains LIMIT 1 OFFSET 0) THEN ARRAY['Monday', 'Wednesday', 'Friday', 'Sunday']
    WHEN id = (SELECT id FROM trains LIMIT 1 OFFSET 1) THEN ARRAY['Tuesday', 'Thursday', 'Saturday']
    WHEN id = (SELECT id FROM trains LIMIT 1 OFFSET 2) THEN ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    ELSE ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday']
  END,
  class_prices = CASE 
    WHEN name LIKE '%Express%' THEN '{"1A": 4500, "2A": 2200, "3A": 1300, "3E": 1000, "SL": 700, "CC": 550, "EC": 900, "2S": 250}'::jsonb
    WHEN name LIKE '%Superfast%' THEN '{"1A": 5500, "2A": 2800, "3A": 1700, "3E": 1400, "SL": 900, "CC": 700, "EC": 1200, "2S": 350}'::jsonb
    ELSE '{"1A": 5000, "2A": 2500, "3A": 1500, "3E": 1200, "SL": 800, "CC": 600, "EC": 1000, "2S": 300}'::jsonb
  END;

-- Add class column to bookings table to track booked class
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS class_price integer DEFAULT 0;
