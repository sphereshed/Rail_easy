-- Add more trains using existing stations
INSERT INTO public.trains (name, number, from_station_id, to_station_id, departure_time, arrival_time, duration, price, class_prices, operating_days, total_seats) 
SELECT 
  'Vande Bharat Express', '20001', 
  s1.id, s2.id, 
  '06:00:00'::time, '14:30:00'::time, '8h 30m', 3500, 
  '{"1A": 8000, "2A": 4500, "CC": 2800, "EC": 3500}'::jsonb, 
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 78
FROM 
  (SELECT id FROM public.stations WHERE code = 'NDLS' LIMIT 1) s1,
  (SELECT id FROM public.stations WHERE code = 'BCT' LIMIT 1) s2
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE number = '20001')

UNION ALL

SELECT 
  'Premium Express', '12345', 
  s1.id, s2.id, 
  '14:30:00'::time, '22:15:00'::time, '7h 45m', 2800, 
  '{"1A": 7500, "2A": 4200, "3A": 2800, "SL": 1500}'::jsonb, 
  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 95
FROM 
  (SELECT id FROM public.stations WHERE code = 'BCT' LIMIT 1) s1,
  (SELECT id FROM public.stations WHERE code = 'NDLS' LIMIT 1) s2
WHERE NOT EXISTS (SELECT 1 FROM public.trains WHERE number = '12345');