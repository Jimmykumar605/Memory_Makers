-- ==============================================================================
-- MemoryMakers - Supabase Database Schema & Row-Level Security (RLS)
-- Run this script in the Supabase SQL Editor: https://app.supabase.com
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM Types
CREATE TYPE user_role AS ENUM ('photographer', 'client', 'admin');
CREATE TYPE inquiry_status AS ENUM ('pending', 'reviewed', 'accepted', 'declined');

-- 3. Profiles / Photographers Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'photographer' NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  willing_to_travel BOOLEAN DEFAULT TRUE,
  experience_years INTEGER DEFAULT 1,
  starting_price NUMERIC(10, 2) DEFAULT 500,
  currency TEXT DEFAULT 'USD',
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  specialties TEXT[] DEFAULT ARRAY['Wedding']::TEXT[],
  gear_list TEXT[] DEFAULT ARRAY[]::TEXT[],
  social_links JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Portfolios & Galleries Table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  occasion TEXT NOT NULL,
  image_url TEXT NOT NULL,
  location TEXT,
  camera_gear TEXT,
  aspect_ratio TEXT DEFAULT 'portrait',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Packages & Pricing Table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Booking Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  occasion TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  budget NUMERIC(10, 2),
  notes TEXT,
  status inquiry_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  occasion TEXT NOT NULL,
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Portfolios: Public read, photographer edit
CREATE POLICY "Portfolios are viewable by everyone" 
  ON public.portfolios FOR SELECT USING (true);

CREATE POLICY "Photographers can insert their portfolio" 
  ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Photographers can update their portfolio" 
  ON public.portfolios FOR UPDATE USING (auth.uid() = photographer_id);

CREATE POLICY "Photographers can delete their portfolio" 
  ON public.portfolios FOR DELETE USING (auth.uid() = photographer_id);

-- Packages: Public read, photographer edit
CREATE POLICY "Packages are viewable by everyone" 
  ON public.packages FOR SELECT USING (true);

CREATE POLICY "Photographers can manage their packages" 
  ON public.packages FOR ALL USING (auth.uid() = photographer_id);

-- Inquiries: Anyone can insert, photographer can view their own
CREATE POLICY "Anyone can submit an inquiry" 
  ON public.inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Photographers can view inquiries sent to them" 
  ON public.inquiries FOR SELECT USING (auth.uid() = photographer_id);

CREATE POLICY "Photographers can update inquiry status" 
  ON public.inquiries FOR UPDATE USING (auth.uid() = photographer_id);

-- Reviews: Public read
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

-- ==============================================================================
-- Supabase Storage Buckets
-- ==============================================================================
-- Run these through Supabase Storage UI or SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
