-- Migration 006: Row Level Security Policies
-- Enable RLS on all tables and set access policies

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: get user role from profiles (public schema)
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get user's hospital_id from profiles (public schema)
CREATE OR REPLACE FUNCTION public.user_hospital_id()
RETURNS UUID AS $$
  SELECT hospital_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Public read tables (anyone can SELECT)
-- ============================================================

-- intents
CREATE POLICY "intents: public read" ON intents
  FOR SELECT USING (true);
CREATE POLICY "intents: admin full access" ON intents
  FOR ALL USING (public.user_role() = 'admin');

-- categories
CREATE POLICY "categories: public read" ON categories
  FOR SELECT USING (true);
CREATE POLICY "categories: admin full access" ON categories
  FOR ALL USING (public.user_role() = 'admin');

-- services
CREATE POLICY "services: public read" ON services
  FOR SELECT USING (true);
CREATE POLICY "services: admin full access" ON services
  FOR ALL USING (public.user_role() = 'admin');

-- procedures
CREATE POLICY "procedures: public read" ON procedures
  FOR SELECT USING (true);
CREATE POLICY "procedures: admin full access" ON procedures
  FOR ALL USING (public.user_role() = 'admin');

-- hospitals
CREATE POLICY "hospitals: public read" ON hospitals
  FOR SELECT USING (true);
CREATE POLICY "hospitals: admin full access" ON hospitals
  FOR ALL USING (public.user_role() = 'admin');

-- doctors
CREATE POLICY "doctors: public read" ON doctors
  FOR SELECT USING (true);
CREATE POLICY "doctors: admin full access" ON doctors
  FOR ALL USING (public.user_role() = 'admin');

-- hospital_procedures
CREATE POLICY "hospital_procedures: public read" ON hospital_procedures
  FOR SELECT USING (true);
CREATE POLICY "hospital_procedures: admin full access" ON hospital_procedures
  FOR ALL USING (public.user_role() = 'admin');

-- evidence
CREATE POLICY "evidence: public read" ON evidence
  FOR SELECT USING (true);
CREATE POLICY "evidence: admin full access" ON evidence
  FOR ALL USING (public.user_role() = 'admin');

-- faqs
CREATE POLICY "faqs: public read" ON faqs
  FOR SELECT USING (true);
CREATE POLICY "faqs: admin full access" ON faqs
  FOR ALL USING (public.user_role() = 'admin');

-- ============================================================
-- profiles: own data only + admin full access
-- ============================================================
CREATE POLICY "profiles: users read own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: users update own" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles: admin full access" ON profiles
  FOR ALL USING (public.user_role() = 'admin');

-- ============================================================
-- inquiries: anyone can insert, users read own, admin/staff access
-- ============================================================
CREATE POLICY "inquiries: anyone can insert" ON inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries: users read own" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inquiries: hospital_staff read own hospital" ON inquiries
  FOR SELECT USING (
    public.user_role() = 'hospital_staff'
    AND hospital_id = public.user_hospital_id()
  );
CREATE POLICY "inquiries: hospital_staff update own hospital" ON inquiries
  FOR UPDATE USING (
    public.user_role() = 'hospital_staff'
    AND hospital_id = public.user_hospital_id()
  );
CREATE POLICY "inquiries: admin full access" ON inquiries
  FOR ALL USING (public.user_role() = 'admin');

-- ============================================================
-- reviews: approved public read, auth users create, own edit/delete
-- ============================================================
CREATE POLICY "reviews: public read approved" ON reviews
  FOR SELECT USING (status = 'approved');
CREATE POLICY "reviews: users read own" ON reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reviews: auth users create" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews: users update own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews: users delete own" ON reviews
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "reviews: hospital_staff read own hospital" ON reviews
  FOR SELECT USING (
    public.user_role() = 'hospital_staff'
    AND hospital_id = public.user_hospital_id()
  );
CREATE POLICY "reviews: admin full access" ON reviews
  FOR ALL USING (public.user_role() = 'admin');

-- ============================================================
-- review_comments: public read, auth users create
-- ============================================================
CREATE POLICY "review_comments: public read" ON review_comments
  FOR SELECT USING (true);
CREATE POLICY "review_comments: auth users create" ON review_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_comments: users update own" ON review_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "review_comments: users delete own" ON review_comments
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "review_comments: admin full access" ON review_comments
  FOR ALL USING (public.user_role() = 'admin');
