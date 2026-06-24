-- Migration 012: Site Settings (DB-backed, replaces file-based storage)
-- Hero image URL is now stored in Supabase table instead of data/site-settings.json
-- This fixes Vercel serverless incompatibility with fs.writeFileSync

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings: admin full access" ON site_settings
  FOR ALL USING (public.user_role() = 'admin');

-- Seed current hero_image_url from file-based storage
INSERT INTO site_settings (key, value)
VALUES (
  'hero_image_url',
  'https://fxoiltwmqomvnzirdcho.supabase.co/storage/v1/object/public/site-assets/hero/hero-bg-1782233284730.png'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
