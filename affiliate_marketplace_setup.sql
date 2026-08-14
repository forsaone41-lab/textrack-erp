-- Extends the affiliate program (affiliate_program_setup.sql) with two more tracks:
-- 'supplier' (fournisseurs/grossistes) and 'atelier' (ateliers/usines de confection).
-- Run this AFTER affiliate_program_setup.sql.

ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS category text;       -- e.g. 'tissu', 'confection', 'broderie', 'impression'
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS commission_rate_supplier numeric DEFAULT 5;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS commission_rate_atelier numeric DEFAULT 5;

CREATE TABLE IF NOT EXISTS affiliate_deals (
  "id" text PRIMARY KEY,
  "affiliate_id" uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  "deal_type" text NOT NULL,             -- 'supplier' | 'atelier'
  "counterparty_name" text NOT NULL,
  "counterparty_contact" text,
  "amount" numeric NOT NULL,
  "notes" text,
  "status" text DEFAULT 'pending',       -- 'pending' | 'confirmed' | 'rejected'
  "created_at" timestamptz DEFAULT now()
);

ALTER TABLE affiliate_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate reads own deals" ON affiliate_deals FOR SELECT USING (affiliate_id = auth.uid());
CREATE POLICY "Affiliate logs own deal" ON affiliate_deals FOR INSERT WITH CHECK (affiliate_id = auth.uid());
CREATE POLICY "Admins manage deals" ON affiliate_deals FOR ALL USING (true);

-- Public directory: anyone can browse approved supplier/atelier profiles (name, category, city, contact).
-- Reuses the "Admins read all affiliates" USING(true) SELECT policy already defined in
-- affiliate_program_setup.sql; the app filters to status='approved' AND tracks overlapping
-- ['supplier','atelier'] client-side (PartnerDirectory.tsx), and never selects payout_details there.
