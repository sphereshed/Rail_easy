-- Add more trains with proper station relationships
-- First, let's get some station IDs that we know exist
WITH station_ids AS (
  SELECT id, name FROM public.stations WHERE name IN ('New Delhi', 'Mumbai Central', 'Chennai Central', 'Bangalore City', 'Kolkata', 'Pune Junction', 'Ahmedabad Junction') LIMIT 7
)
INSERT INTO public.trains (name, number, from_station_id, to_station_id, departure_time, arrival_time, duration, price, class_prices, operating_days, total_seats) VALUES
  ('Vande Bharat Express', '20001', 
   (SELECT id FROM station_ids WHERE name = 'New Delhi' LIMIT 1), 
   (SELECT id FROM station_ids WHERE name = 'Mumbai Central' LIMIT 1), 
   '06:00:00', '14:30:00', '8h 30m', 3500, 
   '{"1A": 8000, "2A": 4500, "CC": 2800, "EC": 3500}'::jsonb, 
   '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]'::text[], 78),
   
  ('Rajdhani Express', '12951', 
   (SELECT id FROM station_ids WHERE name = 'New Delhi' LIMIT 1), 
   (SELECT id FROM station_ids WHERE name = 'Mumbai Central' LIMIT 1), 
   '16:55:00', '08:35:00', '15h 40m', 4200, 
   '{"1A": 9500, "2A": 5800, "3A": 4200}'::jsonb, 
   '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]'::text[], 72),
   
  ('Shatabdi Express', '12002', 
   (SELECT id FROM station_ids WHERE name = 'New Delhi' LIMIT 1), 
   (SELECT id FROM station_ids WHERE name = 'Pune Junction' LIMIT 1), 
   '06:15:00', '17:25:00', '11h 10m', 2800, 
   '{"CC": 2800, "EC": 3200}'::jsonb, 
   '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]'::text[], 85),
   
  ('Tamil Nadu Express', '12621', 
   (SELECT id FROM station_ids WHERE name = 'New Delhi' LIMIT 1), 
   (SELECT id FROM station_ids WHERE name = 'Chennai Central' LIMIT 1), 
   '22:30:00', '07:40:00', '33h 10m', 1800, 
   '{"1A": 6500, "2A": 3500, "3A": 2200, "SL": 1800}'::jsonb, 
   '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]'::text[], 120),
   
  ('August Kranti Rajdhani', '12953', 
   (SELECT id FROM station_ids WHERE name = 'Mumbai Central' LIMIT 1), 
   (SELECT id FROM station_ids WHERE name = 'New Delhi' LIMIT 1), 
   '17:25:00', '09:55:00', '16h 30m', 4100, 
   '{"1A": 9200, "2A": 5600, "3A": 4100}'::jsonb, 
   '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]'::text[], 70),
   
  ('Duronto Express', '12259', 
   (SELECT id FROM station_ids WHERE name = 'Mumbai Central' LIMIT 1), 
   (SELECT id FROM station_ids WHERE name = 'Kolkata' LIMIT 1), 
   '11:40:00', '15:55:00', '28h 15m', 2200, 
   '{"1A": 7200, "2A": 4200, "3A": 2800, "SL": 2200}'::jsonb, 
   '["Tuesday","Thursday","Sunday"]'::text[], 95)
ON CONFLICT (number) DO NOTHING;