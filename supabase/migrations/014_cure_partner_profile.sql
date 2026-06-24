-- Migration 014: Cure Partner Profile Enhancement
-- Adds rich profile fields to cure_partners table for public showcase

ALTER TABLE cure_partners
  ADD COLUMN IF NOT EXISTS photo_url         TEXT,
  ADD COLUMN IF NOT EXISTS title             JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio               JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nationality       TEXT,
  ADD COLUMN IF NOT EXISTS base_country      TEXT,
  ADD COLUMN IF NOT EXISTS service_regions   TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS certifications    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience  INT,
  ADD COLUMN IF NOT EXISTS patient_count     INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_whatsapp  TEXT,
  ADD COLUMN IF NOT EXISTS contact_wechat    TEXT,
  ADD COLUMN IF NOT EXISTS vip_level         TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS protocol_features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS partner_hospitals TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intro_video_url   TEXT;

ALTER TABLE cure_partners
  DROP CONSTRAINT IF EXISTS cure_partners_vip_level_check;
ALTER TABLE cure_partners
  ADD CONSTRAINT cure_partners_vip_level_check
  CHECK (vip_level IN ('standard', 'vip', 'vvip'));
