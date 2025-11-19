-- Add more train data with different routes across India (using ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO stations (name, code, city, state) VALUES
('Chennai Central', 'MAS', 'Chennai', 'Tamil Nadu'),
('Hyderabad Deccan', 'HYB', 'Hyderabad', 'Telangana'),
('Pune Junction', 'PUNE', 'Pune', 'Maharashtra'),
('Ahmedabad Junction', 'ADI', 'Ahmedabad', 'Gujarat'),
('Jaipur Junction', 'JP', 'Jaipur', 'Rajasthan'),
('Lucknow Charbagh', 'LJN', 'Lucknow', 'Uttar Pradesh'),
('Bhopal Junction', 'BPL', 'Bhopal', 'Madhya Pradesh'),
('Kochi Central', 'ERS', 'Kochi', 'Kerala'),
('Guwahati', 'GUY', 'Guwahati', 'Assam'),
('Patna Junction', 'PNBE', 'Patna', 'Bihar'),
('Bhubaneswar', 'BBS', 'Bhubaneswar', 'Odisha'),
('Coimbatore Junction', 'CBE', 'Coimbatore', 'Tamil Nadu'),
('Indore Junction', 'INDB', 'Indore', 'Madhya Pradesh'),
('Visakhapatnam', 'VSKP', 'Visakhapatnam', 'Andhra Pradesh'),
('Thiruvananthapuram Central', 'TVC', 'Thiruvananthapuram', 'Kerala')
ON CONFLICT (name) DO NOTHING;

-- Add more popular trains
INSERT INTO trains (name, number, from_station_id, to_station_id, departure_time, arrival_time, duration, price) 
SELECT 
    v.name, v.number, fs.id, ts.id, v.departure_time, v.arrival_time, v.duration, v.price
FROM (VALUES
    ('Mumbai Rajdhani Express', '12951', 'CSMT', 'NDLS', '17:05:00'::time, '08:35:00'::time, '15h 30m', 2800),
    ('Chennai Rajdhani Express', '12434', 'MAS', 'NDLS', '15:55:00'::time, '11:45:00'::time, '19h 50m', 3200),
    ('Howrah Rajdhani Express', '12302', 'HWH', 'NDLS', '16:55:00'::time, '10:05:00'::time, '17h 10m', 2950),
    ('Deccan Queen', '12124', 'CSMT', 'PUNE', '17:10:00'::time, '20:25:00'::time, '3h 15m', 450),
    ('Chennai Bangalore Express', '12608', 'MAS', 'SBC', '13:30:00'::time, '19:15:00'::time, '5h 45m', 680),
    ('Gujarat Mail', '12902', 'ADI', 'CSMT', '21:45:00'::time, '06:40:00'::time, '8h 55m', 890),
    ('Bhopal Shatabdi Express', '12002', 'NDLS', 'BPL', '06:05:00'::time, '13:48:00'::time, '7h 43m', 1450),
    ('Patna Rajdhani Express', '12314', 'PNBE', 'NDLS', '16:55:00'::time, '09:55:00'::time, '17h 00m', 2750),
    ('Kerala Express', '12626', 'TVC', 'NDLS', '11:45:00'::time, '11:00:00'::time, '47h 15m', 2950),
    ('Golden Temple Mail', '12904', 'CSMT', 'NDLS', '19:15:00'::time, '19:25:00'::time, '24h 10m', 1850)
) AS v(name, number, from_code, to_code, departure_time, arrival_time, duration, price)
LEFT JOIN stations fs ON fs.code = v.from_code
LEFT JOIN stations ts ON ts.code = v.to_code
WHERE fs.id IS NOT NULL AND ts.id IS NOT NULL
ON CONFLICT (number) DO NOTHING;