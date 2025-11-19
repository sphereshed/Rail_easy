-- Create cab_bookings table
-- This table stores cab booking information linked to train bookings

CREATE TABLE IF NOT EXISTS public.cab_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Address Details
    pickup_address TEXT NOT NULL,
    drop_address TEXT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Passenger and Luggage
    passengers INTEGER NOT NULL DEFAULT 1 CHECK (passengers > 0 AND passengers <= 6),
    luggage INTEGER NOT NULL DEFAULT 0 CHECK (luggage >= 0),
    
    -- Cab Details
    cab_type TEXT NOT NULL CHECK (cab_type IN ('sedan', 'suv', 'luxury', 'hatchback')),
    cab_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    -- Additional Information
    special_instructions TEXT,
    
    -- Driver Assignment (nullable until assigned)
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cab_bookings_user_id ON public.cab_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_cab_bookings_booking_id ON public.cab_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_cab_bookings_driver_id ON public.cab_bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_cab_bookings_status ON public.cab_bookings(status);
CREATE INDEX IF NOT EXISTS idx_cab_bookings_pickup_time ON public.cab_bookings(pickup_time);

-- Enable Row Level Security
ALTER TABLE public.cab_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can view their own cab bookings
CREATE POLICY "Users can view own cab bookings"
    ON public.cab_bookings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own cab bookings
CREATE POLICY "Users can create own cab bookings"
    ON public.cab_bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own cab bookings (before assigned)
CREATE POLICY "Users can update own cab bookings"
    ON public.cab_bookings
    FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'));

-- Drivers can view cab bookings assigned to them
CREATE POLICY "Drivers can view assigned cab bookings"
    ON public.cab_bookings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.drivers
            WHERE drivers.id = auth.uid()
            AND drivers.id = cab_bookings.driver_id
        )
    );

-- Drivers can update status of their assigned cab bookings
CREATE POLICY "Drivers can update assigned cab bookings"
    ON public.cab_bookings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.drivers
            WHERE drivers.id = auth.uid()
            AND drivers.id = cab_bookings.driver_id
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cab_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cab_bookings_updated_at ON public.cab_bookings;
CREATE TRIGGER update_cab_bookings_updated_at
    BEFORE UPDATE ON public.cab_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cab_bookings_updated_at();

-- Add comment to table
COMMENT ON TABLE public.cab_bookings IS 'Stores cab booking information for train journey pickups and drops';
