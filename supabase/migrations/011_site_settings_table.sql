-- Migration 011: Site Settings table (re-introduced)
-- Hero image URL was temporarily file-based (data/site-settings.json), but Vercel's
-- serverless filesystem is read-only, so the admin "change hero image" action crashed
-- (EROFS) in production. Store the singleton setting in the DB instead.
-- Supersedes the deprecation note in 010_site_settings.sql.

CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  hero_image_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- Seed the singleton row, preserving the hero image that was previously stored in
-- data/site-settings.json so the homepage hero is unchanged after the switch.
INSERT INTO site_settings (id, hero_image_url)
VALUES (
  1,
  'https://fxoiltwmqomvnzirdcho.supabase.co/storage/v1/object/public/site-assets/hero/hero-bg-1782233284730.png'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read: the hero image URL is non-sensitive and rendered on the public homepage.
DROP POLICY IF EXISTS "site_settings public read" ON site_settings;
CREATE POLICY "site_settings public read"
  ON site_settings FOR SELECT
  USING (true);

-- No INSERT/UPDATE policy is granted to anon/authenticated. Writes are performed by
-- admin server actions using the service role key, which bypasses RLS.
