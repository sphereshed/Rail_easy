-- First, ensure bookings table has proper constraints
alter table public.bookings
    add constraint bookings_pkey primary key (booking_id);

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

-- Create rides table with proper foreign key references
create table if not exists public.rides (
    id uuid primary key default uuid_generate_v4(),
    driver_id uuid references public.drivers(id),
    passenger_id uuid references auth.users(id),
    booking_id text,
    pickup_location text not null,
    dropoff_location text not null,
    pickup_time timestamp with time zone,
    status text check (status in ('pending', 'accepted', 'picked_up', 'completed', 'cancelled')),
    fare decimal(10,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint fk_booking
        foreign key (booking_id) 
        references public.bookings(booking_id)
        on delete set null
);

-- Create index for better query performance
create index if not exists idx_rides_driver_id on public.rides(driver_id);
create index if not exists idx_rides_booking_id on public.rides(booking_id);
create index if not exists idx_rides_status on public.rides(status);

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

create policy "Drivers can insert their own data"
    on drivers for insert
    with check (auth.uid() = id);

-- Policies for rides table
create policy "Drivers can view their rides"
    on rides for select
    using (auth.uid() = driver_id);

create policy "Drivers can update their rides"
    on rides for update
    using (auth.uid() = driver_id);

create policy "Drivers can view passenger rides"
    on rides for select
    using (auth.uid() = passenger_id);

create policy "System can insert rides"
    on rides for insert
    with check (true);

-- Function to handle new driver registration
create or replace function public.handle_new_driver()
returns trigger as $$
begin
    if (new.raw_user_meta_data->>'role' = 'driver') then
        insert into public.drivers (id, full_name, phone_number)
        values (
            new.id,
            coalesce(new.raw_user_meta_data->>'full_name', ''),
            new.raw_user_meta_data->>'phone'
        )
        on conflict (id) do update
        set
            full_name = coalesce(excluded.full_name, public.drivers.full_name),
            phone_number = coalesce(excluded.phone_number, public.drivers.phone_number),
            updated_at = now();
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created_driver on auth.users;

-- Create trigger for new driver creation
create trigger on_auth_user_created_driver
    after insert on auth.users
    for each row execute procedure public.handle_new_driver();