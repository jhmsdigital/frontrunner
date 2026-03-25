-- Frontrunner Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============================================
-- 1. Create the audits table
-- ============================================
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  audit_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT NULL
);

-- ============================================
-- 2. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audits_org_name ON audits (organization_name);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_industry ON audits (industry);

-- ============================================
-- 3. Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth required)
-- Tighten this later when you add user authentication
CREATE POLICY "Allow all operations on audits"
  ON audits FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. Supabase Setup Instructions
-- ============================================
--
-- 1. Go to https://supabase.com → Create new project
-- 2. Name: "frontrunner" | Region: closest to you
-- 3. Copy the Project URL and anon key from Settings → API
-- 4. Paste into .env.local:
--    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
--    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
-- 5. Go to SQL Editor → paste this entire file → Run
-- 6. Done!
