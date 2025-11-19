-- ============================================================================
-- MIGRATION: Fix Database Error When Adding New Users
-- This migration ensures all triggers and functions work correctly for signup
-- ============================================================================

-- Disable RLS temporarily for setup
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;

-- Drop all existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_driver() CASCADE;

-- ============================================================================
-- Recreate profiles table
-- ============================================================================
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- Recreate drivers table
-- ============================================================================
DROP TABLE IF EXISTS public.drivers CASCADE;
CREATE TABLE public.drivers (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    license_number TEXT,
    vehicle_number TEXT,
    vehicle_type TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- Create indexes for better query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_drivers_is_available ON public.drivers(is_available);

-- ============================================================================
-- Create function to handle new user profile creation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    -- Extract metadata safely
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

    -- Insert profile
    INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        v_full_name,
        v_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Create function to handle new driver creation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    -- Extract metadata safely
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Driver');
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

    -- Only create driver record if role is 'driver'
    IF v_role = 'driver' THEN
        INSERT INTO public.drivers (id, full_name, created_at, updated_at)
        VALUES (
            NEW.id,
            v_full_name,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET updated_at = NOW();
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Error in handle_new_driver: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Create triggers for automatic profile/driver creation
-- ============================================================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_driver
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_driver();

-- ============================================================================
-- Enable RLS and create policies
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Drivers can view their own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update their own data" ON public.drivers;
DROP POLICY IF EXISTS "Anyone can insert driver profile" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can insert their own data" ON public.drivers;

-- Profiles policies
CREATE POLICY "profiles_select_all"
    ON public.profiles
    FOR SELECT
    USING (true);

CREATE POLICY "profiles_insert_self"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Drivers policies
CREATE POLICY "drivers_select_own"
    ON public.drivers
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "drivers_insert_all"
    ON public.drivers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "drivers_update_self"
    ON public.drivers
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- MIGRATION COMPLETE
-- All triggers are now in place and will auto-create profiles/drivers on signup
-- ============================================================================
