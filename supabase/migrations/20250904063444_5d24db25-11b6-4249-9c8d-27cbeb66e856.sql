-- Add more trains with proper type casting
INSERT INTO public.trains (name, number, from_station_id, to_station_id, departure_time, arrival_time, duration, price, class_prices, operating_days, total_seats) 
SELECT 
  'Vande Bharat Express', '20001', 
  (SELECT id FROM public.stations WHERE name = 'New Delhi' LIMIT 1), 
  (SELECT id FROM public.stations WHERE name = 'Mumbai Central' LIMIT 1), 
  '06:00:00'::time, '14:30:00'::time, '8h 30m', 3500, 
  '{"1A": 8000, "2A": 4500, "CC": 2800, "EC": 3500}'::jsonb, 
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 78
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE number = '20001')

UNION ALL

SELECT 
  'Rajdhani Express', '12951', 
  (SELECT id FROM public.stations WHERE name = 'New Delhi' LIMIT 1), 
  (SELECT id FROM public.stations WHERE name = 'Mumbai Central' LIMIT 1), 
  '16:55:00'::time, '08:35:00'::time, '15h 40m', 4200, 
  '{"1A": 9500, "2A": 5800, "3A": 4200}'::jsonb, 
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 72
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE number = '12951')

UNION ALL

SELECT 
  'Shatabdi Express', '12002', 
  (SELECT id FROM public.stations WHERE name = 'New Delhi' LIMIT 1), 
  (SELECT id FROM public.stations WHERE name = 'Bangalore City' LIMIT 1), 
  '06:15:00'::time, '17:25:00'::time, '11h 10m', 2800, 
  '{"CC": 2800, "EC": 3200}'::jsonb, 
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], 85
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE number = '12002');