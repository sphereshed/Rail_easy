-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created_driver on auth.users;
drop function if exists public.handle_new_driver();

-- Recreate tables with simplified structure
drop table if exists public.rides;
drop table if exists public.drivers;

-- Create drivers table with minimal required fields first
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

-- Create rides table with minimal constraints
create table if not exists public.rides (
    id uuid primary key default uuid_generate_v4(),
    driver_id uuid references public.drivers(id),
    passenger_id uuid references auth.users(id),
    booking_id text,
    pickup_location text not null,
    dropoff_location text not null,
    pickup_time timestamp with time zone,
    status text default 'pending',
    fare decimal(10,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up minimal RLS policies
alter table public.drivers enable row level security;
alter table public.rides enable row level security;

-- Basic select policy for drivers
create policy "Drivers can view their own data"
    on drivers for select
    using (auth.uid() = id);

-- Basic insert policy for drivers
create policy "Anyone can insert driver profile"
    on drivers for insert
    with check (true);

-- Basic update policy for drivers
create policy "Drivers can update their own data"
    on drivers for update
    using (auth.uid() = id);

-- Simple function to handle new driver creation
create or replace function public.handle_new_driver()
returns trigger as $$
begin
    if (new.raw_user_meta_data->>'role' = 'driver') then
        insert into public.drivers (id, full_name)
        values (
            new.id,
            coalesce(new.raw_user_meta_data->>'full_name', 'New Driver')
        )
        on conflict (id) do nothing;
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created_driver
    after insert on auth.users
    for each row
    execute procedure public.handle_new_driver();