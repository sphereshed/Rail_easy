-- Add more train data with different routes across India
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
('Thiruvananthapuram Central', 'TVC', 'Thiruvananthapuram', 'Kerala');

-- Get station IDs for adding train data
DO $$
DECLARE
    delhi_id uuid;
    mumbai_id uuid;
    bangalore_id uuid;
    kolkata_id uuid;
    chennai_id uuid;
    hyderabad_id uuid;
    pune_id uuid;
    ahmedabad_id uuid;
    jaipur_id uuid;
    lucknow_id uuid;
    bhopal_id uuid;
    kochi_id uuid;
    guwahati_id uuid;
    patna_id uuid;
    bhubaneswar_id uuid;
    coimbatore_id uuid;
    indore_id uuid;
    vizag_id uuid;
    tvm_id uuid;
BEGIN
    -- Get existing station IDs
    SELECT id INTO delhi_id FROM stations WHERE code = 'NDLS';
    SELECT id INTO mumbai_id FROM stations WHERE code = 'CSMT';
    SELECT id INTO bangalore_id FROM stations WHERE code = 'SBC';
    SELECT id INTO kolkata_id FROM stations WHERE code = 'HWH';
    
    -- Get new station IDs
    SELECT id INTO chennai_id FROM stations WHERE code = 'MAS';
    SELECT id INTO hyderabad_id FROM stations WHERE code = 'HYB';
    SELECT id INTO pune_id FROM stations WHERE code = 'PUNE';
    SELECT id INTO ahmedabad_id FROM stations WHERE code = 'ADI';
    SELECT id INTO jaipur_id FROM stations WHERE code = 'JP';
    SELECT id INTO lucknow_id FROM stations WHERE code = 'LJN';
    SELECT id INTO bhopal_id FROM stations WHERE code = 'BPL';
    SELECT id INTO kochi_id FROM stations WHERE code = 'ERS';
    SELECT id INTO guwahati_id FROM stations WHERE code = 'GUY';
    SELECT id INTO patna_id FROM stations WHERE code = 'PNBE';
    SELECT id INTO bhubaneswar_id FROM stations WHERE code = 'BBS';
    SELECT id INTO coimbatore_id FROM stations WHERE code = 'CBE';
    SELECT id INTO indore_id FROM stations WHERE code = 'INDB';
    SELECT id INTO vizag_id FROM stations WHERE code = 'VSKP';
    SELECT id INTO tvm_id FROM stations WHERE code = 'TVC';

    -- Insert more trains with popular routes
    INSERT INTO trains (name, number, from_station_id, to_station_id, departure_time, arrival_time, duration, price) VALUES
    -- Rajdhani and Shatabdi Express
    ('Mumbai Rajdhani Express', '12951', mumbai_id, delhi_id, '17:05:00', '08:35:00', '15h 30m', 2800),
    ('Chennai Rajdhani Express', '12434', chennai_id, delhi_id, '15:55:00', '11:45:00', '19h 50m', 3200),
    ('Howrah Rajdhani Express', '12302', kolkata_id, delhi_id, '16:55:00', '10:05:00', '17h 10m', 2950),
    ('Bangalore Rajdhani Express', '12430', bangalore_id, delhi_id, '20:00:00', '05:55:00', '33h 55m', 3500),
    
    -- Duronto Express
    ('Mumbai Duronto Express', '12262', mumbai_id, delhi_id, '14:05:00', '06:35:00', '16h 30m', 2400),
    ('Chennai Duronto Express', '12642', chennai_id, delhi_id, '08:40:00', '07:15:00', '22h 35m', 2800),
    
    -- Popular intercity routes
    ('Deccan Queen', '12124', mumbai_id, pune_id, '17:10:00', '20:25:00', '3h 15m', 450),
    ('Pune Mumbai Express', '11008', pune_id, mumbai_id, '06:10:00', '09:25:00', '3h 15m', 450),
    ('Chennai Bangalore Express', '12608', chennai_id, bangalore_id, '13:30:00', '19:15:00', '5h 45m', 680),
    ('Bangalore Chennai Express', '12607', bangalore_id, chennai_id, '15:00:00', '20:45:00', '5h 45m', 680),
    
    -- East-West connections
    ('Howrah Jodhpur Express', '12308', kolkata_id, jaipur_id, '06:50:00', '13:30:00', '30h 40m', 1850),
    ('Guwahati Rajdhani Express', '12424', guwahati_id, delhi_id, '13:35:00', '11:45:00', '22h 10m', 3100),
    
    -- South Indian routes
    ('Kochi Bangalore Express', '16526', kochi_id, bangalore_id, '10:15:00', '21:30:00', '11h 15m', 980),
    ('Chennai Coimbatore Express', '12676', chennai_id, coimbatore_id, '06:00:00', '12:30:00', '6h 30m', 520),
    ('Hyderabad Express', '12724', hyderabad_id, delhi_id, '17:40:00', '06:45:00', '37h 05m', 2200),
    
    -- Western routes
    ('Gujarat Mail', '12902', ahmedabad_id, mumbai_id, '21:45:00', '06:40:00', '8h 55m', 890),
    ('Ahmedabad Rajdhani Express', '12958', ahmedabad_id, delhi_id, '18:15:00', '09:35:00', '15h 20m', 2600),
    
    -- Central routes
    ('Bhopal Shatabdi Express', '12002', delhi_id, bhopal_id, '06:05:00', '13:48:00', '7h 43m', 1450),
    ('Lucknow Shatabdi Express', '12004', delhi_id, lucknow_id, '06:10:00', '12:25:00', '6h 15m', 1280),
    
    -- Eastern routes
    ('Patna Rajdhani Express', '12314', patna_id, delhi_id, '16:55:00', '09:55:00', '17h 00m', 2750),
    ('Bhubaneswar Rajdhani Express', '12422', bhubaneswar_id, delhi_id, '16:20:00', '11:00:00', '18h 40m', 2850),
    
    -- Kerala routes
    ('Kerala Express', '12626', tvm_id, delhi_id, '11:45:00', '11:00:00', '47h 15m', 2950),
    ('Mangala Lakshadweep Express', '12618', kochi_id, delhi_id, '11:30:00', '04:20:00', '40h 50m', 2800),
    
    -- Additional popular routes
    ('Golden Temple Mail', '12904', mumbai_id, delhi_id, '19:15:00', '19:25:00', '24h 10m', 1850),
    ('Punjab Mail', '12138', mumbai_id, delhi_id, '20:05:00', '05:00:00', '32h 55m', 1650),
    ('Gitanjali Express', '12860', mumbai_id, kolkata_id, '06:20:00', '18:45:00', '36h 25m', 2100),
    ('East Coast Express', '18448', bangalore_id, guwahati_id, '11:50:00', '04:20:00', '40h 30m', 2400);
END $$;

-- Generate seats for the new trains
DO $$
DECLARE
    train_rec RECORD;
    coach_letter CHAR;
    seat_num INTEGER;
    berth_types TEXT[] := ARRAY['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'];
BEGIN
    -- Generate seats for all trains that don't have seats yet
    FOR train_rec IN 
        SELECT t.id as train_id 
        FROM trains t 
        LEFT JOIN seats s ON t.id = s.train_id 
        WHERE s.train_id IS NULL
    LOOP
        -- Generate 9 coaches (A to I) with 8 seats each for sleeper class
        FOR i IN 1..9 LOOP
            coach_letter := CHR(64 + i); -- A, B, C, etc.
            
            FOR seat_num IN 1..8 LOOP
                INSERT INTO seats (train_id, coach, seat_number, class, is_available)
                VALUES (
                    train_rec.train_id,
                    coach_letter,
                    seat_num || berth_types[seat_num],
                    'Sleeper',
                    CASE WHEN RANDOM() > 0.3 THEN true ELSE false END -- 70% seats available
                );
            END LOOP;
        END LOOP;
        
        -- Generate 2 AC coaches (AC1, AC2) with 6 seats each
        FOR i IN 1..2 LOOP
            FOR seat_num IN 1..6 LOOP
                INSERT INTO seats (train_id, coach, seat_number, class, is_available)
                VALUES (
                    train_rec.train_id,
                    'AC' || i,
                    seat_num || CASE WHEN seat_num <= 4 THEN (ARRAY['LB', 'UB', 'LB', 'UB'])[seat_num] ELSE (ARRAY['SL', 'SU'])[seat_num-4] END,
                    CASE WHEN i = 1 THEN '1AC' ELSE '2AC' END,
                    CASE WHEN RANDOM() > 0.4 THEN true ELSE false END -- 60% AC seats available
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;