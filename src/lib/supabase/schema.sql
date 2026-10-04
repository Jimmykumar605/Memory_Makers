-- ==============================================================================
-- MEMORYMAKERS DATABASE SCHEMA (1:1 RELATIONAL ARCHITECTURE)
-- Database: Supabase PostgreSQL
-- ==============================================================================
-- 
-- ARCHITECTURE OVERVIEW:
-- 1. `public.users`: The SINGLE SOURCE OF TRUTH for all user accounts (Admins,
--    Clients, and Photographers). Stores personal identity and auth credentials:
--    (id, name, email, phone, gender, role, status, password_hash, joined_date).
--
-- 2. `public.profiles`: Stores ONLY the public photographer studio showcase,
--    portfolio, and curation details. It shares the identical ID with `users.id`
--    via a 1:1 foreign key (`profiles.id` references `users.id` on delete cascade):
--    (id, business_name, slug, tagline, bio, city, state, country, starting_price,
--     specialties, gear_list, social_links, avatar_url, cover_image_url, status,
--     rating, reviews_count, featured, verified).
--
-- 3. No duplicate personal columns (name, email, phone, gender) need to be managed
--    separately; they live in `users` and are cleanly joined in application code!
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USERS TABLE (MASTER ACCOUNT & AUTH CREDENTIALS ENTITY)
-- Contains all registered accounts: Clients, Photographers, and Admins
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  gender text default 'other',
  role text not null default 'client',   -- 'admin' | 'photographer' | 'client'
  status text not null default 'active', -- 'active' | 'suspended'
  password_hash text,
  joined_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. PROFILES TABLE (PHOTOGRAPHER STUDIO & PORTFOLIO SHOWCASE)
-- Only creators with role = 'photographer' have a row here, sharing the exact same ID (1:1)
create table if not exists public.profiles (
  id text primary key references public.users(id) on delete cascade,
  business_name text not null,
  slug text unique not null,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected' | 'suspended'
  applied_date text,
  avatar_url text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  cover_image_url text default 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
  tagline text,
  bio text,
  city text not null default 'Amritsar',
  state text not null default 'Punjab',
  country text not null default 'India',
  willing_to_travel boolean default true,
  rating numeric(3,2) default 0.0,
  reviews_count integer default 0,
  experience_years integer default 3,
  starting_price numeric default 50000,
  currency text default 'INR',
  featured boolean default false,
  verified boolean default false,
  specialties text[] default array['Wedding', 'Pre-Wedding'],
  gear_list text[] default array[]::text[],
  social_links jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  -- Optional legacy columns for backward compatibility with unmigrated databases:
  name text,
  email text,
  phone text,
  gender text
);

-- 4. PACKAGES TABLE (TIERED OFFERINGS LINKED TO PHOTOGRAPHER STUDIO)
create table if not exists public.packages (
  id text primary key,
  photographer_id text not null references public.profiles(id) on delete cascade,
  name text not null,
  price numeric not null,
  duration text not null,
  description text default 'Custom tailored wedding collection',
  deliverables text[] default array[]::text[],
  is_popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. PORTFOLIOS TABLE (GALLERY WORK SAMPLES)
create table if not exists public.portfolios (
  id text primary key,
  photographer_id text not null references public.profiles(id) on delete cascade,
  title text not null,
  occasion text not null,
  image_url text not null,
  location text,
  camera_gear text,
  aspect_ratio text default 'portrait', -- 'portrait' | 'landscape' | 'square'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. REVIEWS TABLE (VERIFIED CLIENT TESTIMONIALS & RATINGS)
create table if not exists public.reviews (
  id text primary key,
  photographer_id text not null references public.profiles(id) on delete cascade,
  client_name text not null,
  client_avatar text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  rating integer not null check (rating >= 1 and rating <= 5),
  occasion text not null,
  comment text not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. INQUIRIES TABLE (CLIENT BOOKING LEADS)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  photographer_id text not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  occasion text not null default 'Wedding',
  event_date text,
  location text,
  budget numeric,
  notes text,
  status text not null default 'pending', -- 'pending' | 'reviewed' | 'accepted' | 'declined'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. INDEXES FOR HIGH-SPEED QUERYING
-- ==============================================================================
create index if not exists idx_users_email on public.users(lower(email));
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_profiles_slug on public.profiles(slug);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_state on public.profiles(state);
create index if not exists idx_portfolios_photographer on public.portfolios(photographer_id);
create index if not exists idx_packages_photographer on public.packages(photographer_id);
create index if not exists idx_reviews_photographer on public.reviews(photographer_id);
create index if not exists idx_inquiries_photographer on public.inquiries(photographer_id);

-- ==============================================================================
-- 9. TRIGGER: AUTOMATIC RATING & REVIEW RECALCULATION
-- ==============================================================================
create or replace function public.recalculate_photographer_rating()
returns trigger
language plpgsql
security definer
as $$
declare
  target_id text;
  avg_score numeric;
  total_count integer;
begin
  if (TG_OP = 'DELETE') then
    target_id := OLD.photographer_id;
  else
    target_id := NEW.photographer_id;
  end if;

  select coalesce(round(avg(rating), 2), 0.0), count(*)
  into avg_score, total_count
  from public.reviews
  where photographer_id = target_id;

  update public.profiles
  set rating = avg_score,
      reviews_count = total_count,
      updated_at = now()
  where id = target_id;

  return null;
end;
$$;

drop trigger if exists trg_recalculate_review_stats on public.reviews;
create trigger trg_recalculate_review_stats
after insert or update or delete on public.reviews
for each row
execute function public.recalculate_photographer_rating();

-- ==============================================================================
-- 10. RPC STORED PROCEDURES (SECURITY DEFINER)
-- ==============================================================================

-- 10a. create_or_update_user: Safely register or update master accounts bypassing RLS
create or replace function public.create_or_update_user(
  p_id text,
  p_name text,
  p_email text,
  p_phone text default '',
  p_role text default 'client',
  p_status text default 'active',
  p_city text default 'New Delhi',
  p_state text default 'Delhi NCR',
  p_joined_date text default 'Recent',
  p_password_hash text default ''
)
returns public.users
language plpgsql
security definer
as $$
declare
  v_user public.users;
begin
  insert into public.users (
    id, name, email, phone, role, status, city, state, joined_date, password_hash
  )
  values (
    p_id, p_name, lower(trim(p_email)), p_phone, p_role, p_status, p_city, p_state, p_joined_date, p_password_hash
  )
  on conflict (email) do update
  set name = coalesce(nullif(p_name, ''), public.users.name),
      phone = coalesce(nullif(p_phone, ''), public.users.phone),
      role = coalesce(nullif(p_role, ''), public.users.role),
      status = coalesce(nullif(p_status, ''), public.users.status),
      city = coalesce(nullif(p_city, ''), public.users.city),
      state = coalesce(nullif(p_state, ''), public.users.state),
      password_hash = case when p_password_hash is not null and p_password_hash <> '' then p_password_hash else public.users.password_hash end,
      updated_at = now()
  returning * into v_user;

  return v_user;
end;
$$;

-- 10b. get_user_by_email: Retrieve user account record by email bypassing RLS
create or replace function public.get_user_by_email(p_email text)
returns public.users
language sql
security definer
as $$
  select * from public.users
  where lower(trim(email)) = lower(trim(p_email))
  limit 1;
$$;

-- 10c. get_all_users: List all users for the Admin portal
create or replace function public.get_all_users()
returns setof public.users
language sql
security definer
as $$
  select * from public.users order by created_at desc;
$$;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.packages enable row level security;
alter table public.portfolios enable row level security;
alter table public.reviews enable row level security;
alter table public.inquiries enable row level security;
alter table public.users enable row level security;

-- Public marketplace reads
create policy if not exists "Public read profiles" on public.profiles for select to anon, authenticated using (true);
create policy if not exists "Public read packages" on public.packages for select to anon, authenticated using (true);
create policy if not exists "Public read portfolios" on public.portfolios for select to anon, authenticated using (true);
create policy if not exists "Public read reviews" on public.reviews for select to anon, authenticated using (true);

-- Inquiries & Reviews submissions
create policy if not exists "Public insert inquiries" on public.inquiries for insert to anon, authenticated with check (true);
create policy if not exists "Public read inquiries" on public.inquiries for select to anon, authenticated using (true);
create policy if not exists "Public update inquiries" on public.inquiries for update to anon, authenticated using (true);

create policy if not exists "Public insert reviews" on public.reviews for insert to anon, authenticated with check (true);

-- Users read policy
create policy if not exists "Public read users" on public.users for select to anon, authenticated using (true);

-- ==============================================================================
-- 12. OPTIONAL MIGRATION SCRIPT (To enforce Foreign Key in existing DB)
-- Run this block in your Supabase SQL Editor if you want strict FK enforcement:
-- ==============================================================================
-- do $$
-- begin
--   if not exists (
--     select 1 from information_schema.table_constraints
--     where constraint_name = 'fk_profiles_user'
--   ) then
--     alter table public.profiles
--       add constraint fk_profiles_user
--       foreign key (id) references public.users(id)
--       on delete cascade;
--   end if;
-- end $$;
