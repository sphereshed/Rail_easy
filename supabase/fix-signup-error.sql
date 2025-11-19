-- ============================================================================
-- COMPREHENSIVE FIX FOR SIGNUP ERROR - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================================

-- Step 1: Ensure profiles table exists and has correct columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin')),
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Ensure drivers table exists and has correct columns
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    license_number TEXT,
    vehicle_number TEXT,
    vehicle_type TEXT,
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 3: Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Drivers can view their own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update their own data" ON public.drivers;
DROP POLICY IF EXISTS "Anyone can insert driver profile" ON public.drivers;

-- Step 5: Create RLS policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Step 6: Create RLS policies for drivers table
CREATE POLICY "Drivers can view their own data"
    ON public.drivers FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own data"
    ON public.drivers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Anyone can insert driver profile"
    ON public.drivers FOR INSERT
    WITH CHECK (TRUE);

-- Step 7: Drop existing functions to recreate them
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_driver();

-- Step 8: Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 9: Create function to handle new driver creation
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER AS $$
BEGIN
    IF (new.raw_user_meta_data->>'role' = 'driver') THEN
        INSERT INTO public.drivers (id, full_name)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'full_name', 'New Driver')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 10: Drop existing triggers to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users;

-- Step 11: Create trigger for profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

-- Step 12: Create trigger for driver creation
CREATE TRIGGER on_auth_user_created_driver
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_driver();

-- ============================================================================
-- SUCCESS: All triggers and policies have been created/recreated
-- Now try signing up again - it should work!
-- ============================================================================
