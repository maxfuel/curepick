-- Migration 016: Add name and differentiator columns to hospital_procedures
ALTER TABLE hospital_procedures
  ADD COLUMN IF NOT EXISTS name JSONB,
  ADD COLUMN IF NOT EXISTS differentiator_summary JSONB,
  ADD COLUMN IF NOT EXISTS differentiator_bullets JSONB DEFAULT '[]'::jsonb;
