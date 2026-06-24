-- Migration 011: Hospital Media & Extended Profile
-- Adds videos, gallery_images, awards, founded_year, annual_patients

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS founded_year     INTEGER,
  ADD COLUMN IF NOT EXISTS annual_patients  INTEGER,
  ADD COLUMN IF NOT EXISTS videos           JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_images   JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS awards           JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN hospitals.videos         IS '[{title, url, type}] — type: youtube|facility|testimonial|doctor';
COMMENT ON COLUMN hospitals.gallery_images IS '[url, url, ...]';
COMMENT ON COLUMN hospitals.awards         IS '[{title, year?, description?, image_url?}]';
