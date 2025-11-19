-- Add trains using existing stations
INSERT INTO public.trains (name, number, from_station_id, to_station_id, departure_time, arrival_time, duration, price, class_prices, operating_days, total_seats) VALUES
  ('Vande Bharat Express', '20001', 
   'bb08c4a4-fc0e-4b26-8256-def5f55e2255', 
   '3163e2da-09ca-4835-9af8-4398c7b33657', 
   '06:00:00'::time, '14:30:00'::time, '8h 30m', 3500, 
   '{"1A": 8000, "2A": 4500, "CC": 2800, "EC": 3500}'::jsonb, 
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 78),
   
  ('Rajdhani Express', '12951', 
   'bb08c4a4-fc0e-4b26-8256-def5f55e2255', 
   '3163e2da-09ca-4835-9af8-4398c7b33657', 
   '16:55:00'::time, '08:35:00'::time, '15h 40m', 4200, 
   '{"1A": 9500, "2A": 5800, "3A": 4200}'::jsonb, 
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 72),
   
  ('Shatabdi Express', '12002', 
   'bb08c4a4-fc0e-4b26-8256-def5f55e2255', 
   'f5d8bba2-fb24-41c5-883a-05dac5473317', 
   '06:15:00'::time, '17:25:00'::time, '11h 10m', 2800, 
   '{"CC": 2800, "EC": 3200}'::jsonb, 
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], 85),
   
  ('Tamil Nadu Express', '12621', 
   'bb08c4a4-fc0e-4b26-8256-def5f55e2255', 
   'b1a34187-3e44-4f68-9bc4-71dce68f2f40', 
   '22:30:00'::time, '07:40:00'::time, '33h 10m', 1800, 
   '{"1A": 6500, "2A": 3500, "3A": 2200, "SL": 1800}'::jsonb, 
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 120),
   
  ('August Kranti Rajdhani', '12953', 
   '3163e2da-09ca-4835-9af8-4398c7b33657', 
   'bb08c4a4-fc0e-4b26-8256-def5f55e2255', 
   '17:25:00'::time, '09:55:00'::time, '16h 30m', 4100, 
   '{"1A": 9200, "2A": 5600, "3A": 4100}'::jsonb, 
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 70),
   
  ('Duronto Express', '12259', 
   '3163e2da-09ca-4835-9af8-4398c7b33657', 
   'ebe5dd98-c998-4557-9cb7-32fd2e015ce2', 
   '11:40:00'::time, '15:55:00'::time, '28h 15m', 2200, 
   '{"1A": 7200, "2A": 4200, "3A": 2800, "SL": 2200}'::jsonb, 
   ARRAY['Tuesday','Thursday','Sunday'], 95)
ON CONFLICT (number) DO NOTHING;