-- ============================================================================
-- SIMPLE FIX FOR SIGNUP ERROR - RUN THIS FIRST
-- ============================================================================

-- Drop all existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_driver() CASCADE;

-- Drop existing tables
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;

-- ============================================================================
-- Create SIMPLE profiles table
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- Create SIMPLE drivers table
-- ============================================================================
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    license_number TEXT,
    vehicle_number TEXT,
    vehicle_type TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drivers_select_own" ON public.drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "drivers_insert_all" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "drivers_update_self" ON public.drivers FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- Create SIMPLE trigger function for profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Create SIMPLE trigger function for drivers
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role' = 'driver') THEN
    INSERT INTO public.drivers (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Driver'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Create triggers
-- ============================================================================
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_driver
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_driver();

-- ============================================================================
-- DONE! Signup should now work
-- ============================================================================
