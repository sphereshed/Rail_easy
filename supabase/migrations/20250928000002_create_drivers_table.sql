-- Create drivers table
create table if not exists public.drivers (
    id uuid primary key references auth.users on delete cascade,
    full_name text not null,
    phone_number text,
    license_number text,
    vehicle_number text,
    vehicle_type text,
    rating decimal(3,2) default 5.0,
    total_rides integer default 0,
    total_earnings decimal(10,2) default 0.0,
    is_available boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rides table for tracking driver assignments
create table if not exists public.rides (
    id uuid primary key default uuid_generate_v4(),
    driver_id uuid references public.drivers(id),
    passenger_id uuid references auth.users(id),
    booking_id text references public.bookings(booking_id),
    pickup_location text not null,
    dropoff_location text not null,
    pickup_time timestamp with time zone,
    status text check (status in ('pending', 'accepted', 'picked_up', 'completed', 'cancelled')),
    fare decimal(10,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.drivers enable row level security;
alter table public.rides enable row level security;

-- Policies for drivers table
create policy "Drivers can view their own data"
    on drivers for select
    using (auth.uid() = id);

create policy "Drivers can update their own data"
    on drivers for update
    using (auth.uid() = id);

-- Policies for rides table
create policy "Drivers can view their rides"
    on rides for select
    using (auth.uid() = driver_id);

create policy "Drivers can update their rides"
    on rides for update
    using (auth.uid() = driver_id);

-- Function to handle new driver registration
create or replace function public.handle_new_driver()
returns trigger as $$
begin
    if (new.raw_user_meta_data->>'role' = 'driver') then
        insert into public.drivers (id, full_name, phone_number)
        values (
            new.id,
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'phone'
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new driver creation
create trigger on_auth_user_created_driver
    after insert on auth.users
    for each row execute procedure public.handle_new_driver();