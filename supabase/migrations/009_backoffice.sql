-- Run manually in Supabase Dashboard > SQL Editor
-- Adds is_official flag to review_comments for hospital staff official replies

ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
