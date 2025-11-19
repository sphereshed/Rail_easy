-- Create stations table
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trains table
CREATE TABLE public.trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  from_station_id UUID NOT NULL REFERENCES public.stations(id),
  to_station_id UUID NOT NULL REFERENCES public.stations(id),
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration TEXT NOT NULL,
  price INTEGER NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 72,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID NOT NULL REFERENCES public.trains(id),
  seat_number TEXT NOT NULL,
  coach TEXT NOT NULL,
  class TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(train_id, seat_number, coach)
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  train_id UUID NOT NULL REFERENCES public.trains(id),
  booking_id TEXT NOT NULL UNIQUE,
  passenger_name TEXT NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender TEXT NOT NULL,
  seat_numbers TEXT[] NOT NULL,
  coach TEXT NOT NULL,
  class TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  journey_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for stations (public read)
CREATE POLICY "Stations are publicly readable" ON public.stations FOR SELECT USING (true);

-- Create policies for trains (public read)
CREATE POLICY "Trains are publicly readable" ON public.trains FOR SELECT USING (true);

-- Create policies for seats (public read, authenticated update)
CREATE POLICY "Seats are publicly readable" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update seats" ON public.seats FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample stations
INSERT INTO public.stations (name, code, city, state) VALUES
('New Delhi Railway Station', 'NDLS', 'New Delhi', 'Delhi'),
('Mumbai Central', 'BCT', 'Mumbai', 'Maharashtra'),
('Bangalore City Junction', 'SBC', 'Bangalore', 'Karnataka'),
('Chennai Central', 'MAS', 'Chennai', 'Tamil Nadu'),
('Kolkata Howrah', 'HWH', 'Kolkata', 'West Bengal'),
('Pune Junction', 'PUNE', 'Pune', 'Maharashtra');

-- Insert sample trains
WITH station_data AS (
  SELECT 
    ndls.id as ndls_id,
    bct.id as bct_id,
    sbc.id as sbc_id,
    mas.id as mas_id,
    hwh.id as hwh_id,
    pune.id as pune_id
  FROM 
    (SELECT id FROM public.stations WHERE code = 'NDLS') ndls,
    (SELECT id FROM public.stations WHERE code = 'BCT') bct,
    (SELECT id FROM public.stations WHERE code = 'SBC') sbc,
    (SELECT id FROM public.stations WHERE code = 'MAS') mas,
    (SELECT id FROM public.stations WHERE code = 'HWH') hwh,
    (SELECT id FROM public.stations WHERE code = 'PUNE') pune
)
INSERT INTO public.trains (number, name, from_station_id, to_station_id, departure_time, arrival_time, duration, price) 
SELECT * FROM (VALUES
  ('12951', 'Mumbai Rajdhani', (SELECT ndls_id FROM station_data), (SELECT bct_id FROM station_data), '16:55'::time, '08:35'::time, '15h 40m', 2499),
  ('12301', 'Howrah Rajdhani', (SELECT ndls_id FROM station_data), (SELECT hwh_id FROM station_data), '17:05'::time, '10:05'::time, '17h 00m', 2899),
  ('12621', 'Tamil Nadu Express', (SELECT ndls_id FROM station_data), (SELECT mas_id FROM station_data), '22:30'::time, '07:40'::time, '33h 10m', 1899),
  ('12627', 'Karnataka Express', (SELECT ndls_id FROM station_data), (SELECT sbc_id FROM station_data), '22:20'::time, '23:15'::time, '24h 55m', 2199),
  ('11077', 'Jhelum Express', (SELECT pune_id FROM station_data), (SELECT ndls_id FROM station_data), '11:25'::time, '06:25'::time, '19h 00m', 1699)
) AS train_data;

-- Generate seats for each train (72 seats per train - 2 coaches with 36 seats each)
INSERT INTO public.seats (train_id, seat_number, coach, class)
SELECT 
  t.id,
  seat_num,
  CASE WHEN seat_row <= 18 THEN 'S1' ELSE 'S2' END,
  'SL'
FROM public.trains t
CROSS JOIN (
  SELECT 
    row_number() OVER () as seat_row,
    CASE 
      WHEN row_number() OVER () <= 18 THEN 'S1-' || (row_number() OVER ())::text
      ELSE 'S2-' || (row_number() OVER () - 18)::text
    END as seat_num
  FROM generate_series(1, 72) 
) seats;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();