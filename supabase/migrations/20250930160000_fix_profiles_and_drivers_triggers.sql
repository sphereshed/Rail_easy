-- Fix for Supabase signup trigger errors: ensure all required columns are handled and allow NULL/defaults where needed

-- 1. Update profiles table to allow NULLs for optional fields and add role if missing
ALTER TABLE public.profiles
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- Add role column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END$$;

-- 2. Update drivers table to allow NULLs for optional fields
ALTER TABLE public.drivers
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN phone_number DROP NOT NULL;

-- 3. Update handle_new_user trigger function to insert all required columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update handle_new_driver trigger function to insert all required columns
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS trigger AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role' = 'driver') THEN
    INSERT INTO public.drivers (id, full_name, phone_number)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Driver'),
      NEW.raw_user_meta_data->>'phone_number'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure triggers exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users;
CREATE TRIGGER on_auth_user_created_driver
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_driver();
