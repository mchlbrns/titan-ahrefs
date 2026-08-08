-- ==============================================================================
-- Titan Ahrefs — Full Production Supabase Database Migration Schema
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

ALTER TABLE public.managed_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on managed_domains" ON public.managed_domains;
DROP POLICY IF EXISTS "Allow public all on managed_domains" ON public.managed_domains;

CREATE POLICY "Allow public select on managed_domains" ON public.managed_domains FOR SELECT USING (true);
CREATE POLICY "Allow public all on managed_domains" ON public.managed_domains FOR ALL USING (true) WITH CHECK (true);

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

ALTER TABLE public.ahrefs_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on ahrefs_snapshots" ON public.ahrefs_snapshots;
DROP POLICY IF EXISTS "Allow public all on ahrefs_snapshots" ON public.ahrefs_snapshots;

CREATE POLICY "Allow public select on ahrefs_snapshots" ON public.ahrefs_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public all on ahrefs_snapshots" ON public.ahrefs_snapshots FOR ALL USING (true) WITH CHECK (true);


-- 3. Create Competitor Registry Table (Target vs Competitor Benchmarking)
CREATE TABLE IF NOT EXISTS public.competitor_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_domain TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  target_country TEXT DEFAULT 'us',
  notes TEXT DEFAULT 'Tracked Organic Competitor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_primary_competitor UNIQUE (primary_domain, competitor_domain)
);

ALTER TABLE public.competitor_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on competitor_registry" ON public.competitor_registry;
DROP POLICY IF EXISTS "Allow public all on competitor_registry" ON public.competitor_registry;

CREATE POLICY "Allow public select on competitor_registry" ON public.competitor_registry FOR SELECT USING (true);
CREATE POLICY "Allow public all on competitor_registry" ON public.competitor_registry FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.competitor_registry (primary_domain, competitor_domain, notes)
VALUES
  ('titantreasure.com', 'chumbacasino.com', 'Primary Social Casino Competitor'),
  ('titantreasure.com', 'pulsz.com', 'Secondary Sweepstakes Competitor'),
  ('titantreasure.com', 'luckylandslots.com', 'Sweepstakes Slots Competitor'),
  ('red-engage.com', 'singlegrain.com', 'SEO Agency Competitor'),
  ('red-engage.com', 'growthrocks.com', 'Growth Marketing Competitor'),
  ('red-engage.com', 'disruptiveadvertising.com', 'PPC & Growth Competitor')
ON CONFLICT (primary_domain, competitor_domain) DO NOTHING;


-- 4. Create API Usage Logs Table (Ahrefs API Quota & Unit Consumption Monitoring)
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  units_consumed INTEGER DEFAULT 0,
  units_limit INTEGER DEFAULT 5000,
  units_remaining INTEGER DEFAULT 5000,
  api_key_status TEXT DEFAULT 'ACTIVE',
  reset_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on api_usage_logs" ON public.api_usage_logs;
DROP POLICY IF EXISTS "Allow public all on api_usage_logs" ON public.api_usage_logs;

CREATE POLICY "Allow public select on api_usage_logs" ON public.api_usage_logs FOR SELECT USING (true);
CREATE POLICY "Allow public all on api_usage_logs" ON public.api_usage_logs FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.api_usage_logs (endpoint, units_consumed, units_limit, units_remaining, api_key_status, reset_date)
VALUES 
  ('/subscription-info/limits-and-usage', 0, 5000, 5000, 'ACTIVE', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;


-- 5. Create Executive Reports Table (Saved Weekly Reports & Pedro Briefings)
CREATE TABLE IF NOT EXISTS public.executive_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_title TEXT DEFAULT 'Ahrefs Weekly Executive SEO Briefing',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  domains_audited JSONB,
  executive_summary JSONB,
  markdown_content TEXT,
  html_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.executive_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on executive_reports" ON public.executive_reports;
DROP POLICY IF EXISTS "Allow public all on executive_reports" ON public.executive_reports;

-- 6. Create Reddit Scrape Queue Table (Targeted Reddit Threads for Scraping/Outreach)
CREATE TABLE IF NOT EXISTS public.reddit_scrape_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_url TEXT NOT NULL UNIQUE,
  target_keyword TEXT DEFAULT '',
  search_volume INTEGER DEFAULT 0,
  est_traffic INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Queued',
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reddit_scrape_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on reddit_scrape_queue" ON public.reddit_scrape_queue;
DROP POLICY IF EXISTS "Allow public all on reddit_scrape_queue" ON public.reddit_scrape_queue;

CREATE POLICY "Allow public select on reddit_scrape_queue" ON public.reddit_scrape_queue FOR SELECT USING (true);
CREATE POLICY "Allow public all on reddit_scrape_queue" ON public.reddit_scrape_queue FOR ALL USING (true) WITH CHECK (true);

COMMIT;

