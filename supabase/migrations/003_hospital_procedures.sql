-- Migration 003: HospitalProcedure & Evidence Tables
-- Tables: hospital_procedures, evidence
-- Relationships: hospital_procedure → hospital, procedure; evidence → hospital_procedure

CREATE TABLE hospital_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id) ON DELETE CASCADE,
  annual_volume INT,
  specialist_count INT,
  waiting_time_days INT,
  cost_min DECIMAL,
  cost_max DECIMAL,
  cost_currency TEXT DEFAULT 'USD',
  languages TEXT[] DEFAULT '{}',
  intl_patient_support BOOLEAN DEFAULT false,
  evidence_score DECIMAL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hospital_id, procedure_id)
);

CREATE TABLE evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_procedure_id UUID REFERENCES hospital_procedures(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_url TEXT,
  description TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
