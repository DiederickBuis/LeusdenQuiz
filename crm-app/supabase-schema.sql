-- ============================================
-- CRM Database Schema voor Supabase
-- Voer dit SQL uit in de Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tvtmipkyfkbgmwcrtxyi/sql/new
-- ============================================

-- Bedrijven tabel
CREATE TABLE companies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contactpersonen tabel
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  job_title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals tabel
CREATE TABLE deals (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  value NUMERIC(12, 2) DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contact', 'proposal', 'negotiation', 'won', 'lost')),
  contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
  company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activiteiten tabel
CREATE TABLE activities (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
  subject TEXT NOT NULL,
  description TEXT,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id BIGINT REFERENCES deals(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security inschakelen
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Publieke leestoegang (voor eenvoudige demo zonder auth)
CREATE POLICY "Public read companies" ON companies FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert companies" ON companies FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update companies" ON companies FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete companies" ON companies FOR DELETE TO anon USING (true);

CREATE POLICY "Public read contacts" ON contacts FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert contacts" ON contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update contacts" ON contacts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete contacts" ON contacts FOR DELETE TO anon USING (true);

CREATE POLICY "Public read deals" ON deals FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert deals" ON deals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update deals" ON deals FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete deals" ON deals FOR DELETE TO anon USING (true);

CREATE POLICY "Public read activities" ON activities FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert activities" ON activities FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update activities" ON activities FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete activities" ON activities FOR DELETE TO anon USING (true);

-- Voorbeeld data
INSERT INTO companies (name, industry, website, phone, email, address)
VALUES
  ('Acme B.V.', 'Technologie', 'https://acme.nl', '+31 20 123 4567', 'info@acme.nl', 'Herengracht 100, Amsterdam'),
  ('GlobalTrade NV', 'Handel', 'https://globaltrade.nl', '+31 10 987 6543', 'contact@globaltrade.nl', 'Coolsingel 50, Rotterdam'),
  ('Bouwwerk B.V.', 'Bouw', 'https://bouwwerk.nl', '+31 30 555 1234', 'info@bouwwerk.nl', 'Oudegracht 25, Utrecht');

INSERT INTO contacts (first_name, last_name, email, phone, company_id, job_title)
VALUES
  ('Jan', 'de Vries', 'jan@acme.nl', '+31 6 1234 5678', 1, 'Directeur'),
  ('Maria', 'Jansen', 'maria@globaltrade.nl', '+31 6 8765 4321', 2, 'Sales Manager'),
  ('Pieter', 'Bakker', 'pieter@bouwwerk.nl', '+31 6 5555 1234', 3, 'Projectleider');

INSERT INTO deals (title, value, stage, contact_id, company_id, expected_close_date)
VALUES
  ('Software Implementatie', 75000.00, 'proposal', 1, 1, '2026-04-15'),
  ('Import Contract', 125000.00, 'negotiation', 2, 2, '2026-03-30'),
  ('Kantoor Renovatie', 250000.00, 'lead', 3, 3, '2026-06-01');

INSERT INTO activities (type, subject, description, contact_id, deal_id, due_date)
VALUES
  ('call', 'Follow-up gesprek', 'Bel Jan over de voortgang van het project', 1, 1, '2026-03-01'),
  ('email', 'Offerte versturen', 'Stuur de definitieve offerte naar Maria', 2, 2, '2026-02-28'),
  ('meeting', 'Kick-off meeting', 'Eerste vergadering over de renovatie', 3, 3, '2026-03-15');
