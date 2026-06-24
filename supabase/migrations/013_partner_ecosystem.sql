-- Migration 013: Partner Ecosystem
-- Tables: agents, cure_partners, cases, case_notes, commissions
-- Extends profiles.role CHECK to include 'local_agent' and 'cure_partner'

-- ── 1. Extend profiles.role CHECK constraint ────────────────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient', 'hospital_staff', 'admin', 'local_agent', 'cure_partner'));

-- ── 2. agents table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name    TEXT,
  country         TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 3. cure_partners table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cure_partners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name        TEXT,
  languages        TEXT[] DEFAULT '{}',
  specialty_areas  TEXT[] DEFAULT '{}',
  status           TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── 4. cases table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id            UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  cure_partner_id     UUID REFERENCES cure_partners(id) ON DELETE SET NULL,
  hospital_id         UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
  patient_name        TEXT NOT NULL,
  patient_email       TEXT NOT NULL,
  patient_phone       TEXT,
  patient_nationality TEXT,
  service_id          UUID REFERENCES services(id) ON DELETE SET NULL,
  procedure_id        UUID REFERENCES procedures(id) ON DELETE SET NULL,
  source              TEXT DEFAULT 'agent',
  status              TEXT DEFAULT 'lead'
    CHECK (status IN ('lead', 'qualified', 'confirmed', 'arrived', 'in_treatment', 'completed')),
  checklist           JSONB DEFAULT '{}'::jsonb,
  arrived_at          TIMESTAMPTZ,
  in_treatment_at     TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── 5. case_notes table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 6. commissions table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  agent_id   UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL,
  currency   TEXT DEFAULT 'USD',
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. Enable RLS on all new tables ─────────────────────────────────────────
ALTER TABLE agents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cure_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions   ENABLE ROW LEVEL SECURITY;

-- ── 8. Helper functions ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_agent_id()
RETURNS UUID AS $$
  SELECT id FROM public.agents WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_cure_partner_id()
RETURNS UUID AS $$
  SELECT id FROM public.cure_partners WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 9. RLS Policies ──────────────────────────────────────────────────────────

-- agents
DROP POLICY IF EXISTS "agents: own record" ON agents;
DROP POLICY IF EXISTS "agents: admin full" ON agents;
CREATE POLICY "agents: own record" ON agents
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "agents: admin full" ON agents
  FOR ALL USING (public.user_role() = 'admin');

-- cure_partners
DROP POLICY IF EXISTS "cure_partners: own record" ON cure_partners;
DROP POLICY IF EXISTS "cure_partners: admin full" ON cure_partners;
CREATE POLICY "cure_partners: own record" ON cure_partners
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "cure_partners: admin full" ON cure_partners
  FOR ALL USING (public.user_role() = 'admin');

-- cases
DROP POLICY IF EXISTS "cases: agent sees own" ON cases;
DROP POLICY IF EXISTS "cases: agent can insert" ON cases;
DROP POLICY IF EXISTS "cases: cure_partner sees assigned" ON cases;
DROP POLICY IF EXISTS "cases: cure_partner can update" ON cases;
DROP POLICY IF EXISTS "cases: admin full" ON cases;
CREATE POLICY "cases: agent sees own" ON cases
  FOR SELECT USING (agent_id = public.user_agent_id());
CREATE POLICY "cases: agent can insert" ON cases
  FOR INSERT WITH CHECK (agent_id = public.user_agent_id());
CREATE POLICY "cases: cure_partner sees assigned" ON cases
  FOR SELECT USING (cure_partner_id = public.user_cure_partner_id());
CREATE POLICY "cases: cure_partner can update" ON cases
  FOR UPDATE USING (cure_partner_id = public.user_cure_partner_id());
CREATE POLICY "cases: admin full" ON cases
  FOR ALL USING (public.user_role() = 'admin');

-- case_notes
DROP POLICY IF EXISTS "case_notes: participants select" ON case_notes;
DROP POLICY IF EXISTS "case_notes: participants insert" ON case_notes;
DROP POLICY IF EXISTS "case_notes: admin full" ON case_notes;
CREATE POLICY "case_notes: participants select" ON case_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c WHERE c.id = case_id AND (
        c.agent_id = public.user_agent_id()
        OR c.cure_partner_id = public.user_cure_partner_id()
        OR public.user_role() = 'admin'
      )
    )
  );
CREATE POLICY "case_notes: participants insert" ON case_notes
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cases c WHERE c.id = case_id AND (
        c.agent_id = public.user_agent_id()
        OR c.cure_partner_id = public.user_cure_partner_id()
        OR public.user_role() = 'admin'
      )
    )
  );
CREATE POLICY "case_notes: admin full" ON case_notes
  FOR ALL USING (public.user_role() = 'admin');

-- commissions
DROP POLICY IF EXISTS "commissions: agent sees own" ON commissions;
DROP POLICY IF EXISTS "commissions: admin full" ON commissions;
CREATE POLICY "commissions: agent sees own" ON commissions
  FOR SELECT USING (agent_id = public.user_agent_id());
CREATE POLICY "commissions: admin full" ON commissions
  FOR ALL USING (public.user_role() = 'admin');
