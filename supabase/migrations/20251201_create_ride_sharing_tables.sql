-- Create ride_requests table for ride sharing feature
CREATE TABLE IF NOT EXISTS ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  passenger_count INTEGER DEFAULT 1,
  vehicle_preference VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, completed, cancelled
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create ride_offers table for driver responses
CREATE TABLE IF NOT EXISTS ride_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  estimated_arrival_time INTEGER, -- in seconds
  vehicle_details TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(ride_request_id, driver_id) -- One offer per driver per request
);

-- Create ride_status table to track active rides
CREATE TABLE IF NOT EXISTS active_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'accepted', -- accepted, in_progress, completed, cancelled
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  fare DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS for ride_requests
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ride requests"
ON ride_requests FOR SELECT
USING (auth.uid() = passenger_id);

CREATE POLICY "Users can insert their own ride requests"
ON ride_requests FOR INSERT
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can view all pending ride requests"
ON ride_requests FOR SELECT
USING (status = 'pending');

-- Enable RLS for ride_offers
ALTER TABLE ride_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own offers"
ON ride_offers FOR SELECT
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create offers"
ON ride_offers FOR INSERT
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own offers"
ON ride_offers FOR UPDATE
USING (auth.uid() = driver_id);

CREATE POLICY "Passengers can view offers for their requests"
ON ride_offers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM ride_requests 
  WHERE ride_requests.id = ride_offers.ride_request_id 
  AND ride_requests.passenger_id = auth.uid()
));

-- Enable RLS for active_rides
ALTER TABLE active_rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their active rides"
ON active_rides FOR SELECT
USING (auth.uid() = driver_id OR auth.uid() = passenger_id);

CREATE POLICY "System can create active rides"
ON active_rides FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their active rides"
ON active_rides FOR UPDATE
USING (auth.uid() = driver_id OR auth.uid() = passenger_id);

-- Create indexes for better performance
CREATE INDEX idx_ride_requests_passenger_id ON ride_requests(passenger_id);
CREATE INDEX idx_ride_requests_status ON ride_requests(status);
CREATE INDEX idx_ride_offers_ride_request_id ON ride_offers(ride_request_id);
CREATE INDEX idx_ride_offers_driver_id ON ride_offers(driver_id);
CREATE INDEX idx_active_rides_driver_id ON active_rides(driver_id);
CREATE INDEX idx_active_rides_passenger_id ON active_rides(passenger_id);
