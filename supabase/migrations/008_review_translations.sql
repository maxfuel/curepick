-- Migration 008: Review translation cache tables

CREATE TABLE review_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ko', 'zh', 'ja')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (review_id, locale)
);

CREATE TABLE review_comment_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ko', 'zh', 'ja')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, locale)
);

-- RLS: Anyone can read translations (same as reviews)
ALTER TABLE review_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_translations_select" ON review_translations FOR SELECT USING (true);
CREATE POLICY "review_translations_insert" ON review_translations FOR INSERT WITH CHECK (true);

ALTER TABLE review_comment_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_comment_translations_select" ON review_comment_translations FOR SELECT USING (true);
CREATE POLICY "review_comment_translations_insert" ON review_comment_translations FOR INSERT WITH CHECK (true);
