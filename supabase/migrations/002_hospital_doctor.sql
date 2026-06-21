-- Migration 002: Hospital & Doctor Tables
-- Tables: hospitals, doctors
-- Relationships: doctor → hospital

CREATE TABLE hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  address JSONB,
  city TEXT,
  accreditation TEXT,
  international_center BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  specialty JSONB,
  experience_years INT,
  bio JSONB,
  photo_url TEXT,
  languages TEXT[] DEFAULT '{}',
  publications JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
