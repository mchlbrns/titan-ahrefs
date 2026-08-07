-- ==============================================================================
-- Titan Ahrefs — Supabase Database Migration Schema
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

BEGIN;

-- 1. Create Managed Domains Table (Live Persistent Domain Registry)
CREATE TABLE IF NOT EXISTS public.managed_domains (
  domain TEXT PRIMARY KEY,
  target_country TEXT DEFAULT 'us',
  priority TEXT DEFAULT 'high',
  description TEXT DEFAULT 'Managed Domain',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.managed_domains ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script to avoid policy collision errors
DROP POLICY IF EXISTS "Allow public select on managed_domains" ON public.managed_domains;
DROP POLICY IF EXISTS "Allow public all on managed_domains" ON public.managed_domains;
DROP POLICY IF EXISTS "Allow public insert/update/delete on managed_domains" ON public.managed_domains;

-- Create RLS Policies for Anon / Public access
CREATE POLICY "Allow public select on managed_domains" 
  ON public.managed_domains FOR SELECT 
  USING (true);

CREATE POLICY "Allow public all on managed_domains" 
  ON public.managed_domains FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Seed initial default domains
INSERT INTO public.managed_domains (domain, target_country, priority, description)
VALUES 
  ('titantreasure.com', 'us', 'high', 'Primary Platform'),
  ('red-engage.com', 'us', 'high', 'Engagement Platform')
ON CONFLICT (domain) DO NOTHING;


-- 2. Create Ahrefs Telemetry Snapshots Table
CREATE TABLE IF NOT EXISTS public.ahrefs_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  domain_rating NUMERIC,
  ahrefs_rank NUMERIC,
  estimated_traffic NUMERIC,
  referring_domains NUMERIC,
  total_backlinks NUMERIC,
  seo_health_score JSONB,
  keywords_data JSONB,
  toppages_data JSONB,
  backlinks_data JSONB,
  competitors_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_domain_timestamp UNIQUE (domain, timestamp)
);

-- Enable RLS for Snapshots Table
ALTER TABLE public.ahrefs_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public select on ahrefs_snapshots" ON public.ahrefs_snapshots;
DROP POLICY IF EXISTS "Allow public all on ahrefs_snapshots" ON public.ahrefs_snapshots;
DROP POLICY IF EXISTS "Allow public insert/update on ahrefs_snapshots" ON public.ahrefs_snapshots;

CREATE POLICY "Allow public select on ahrefs_snapshots" 
  ON public.ahrefs_snapshots FOR SELECT 
  USING (true);

CREATE POLICY "Allow public all on ahrefs_snapshots" 
  ON public.ahrefs_snapshots FOR ALL 
  USING (true)
  WITH CHECK (true);

COMMIT;
