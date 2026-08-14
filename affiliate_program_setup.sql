-- Affiliate/Partner Earnings Program
-- Two tracks: 'builder' (build/sell stores for merchants) and 'reseller' (resell Beya Creative / plans)

CREATE TABLE IF NOT EXISTS affiliates (
  "id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "full_name" text,
  "email" text,
  "phone" text,
  "referral_code" text UNIQUE NOT NULL,
  "tracks" text[] DEFAULT ARRAY['builder']::text[],   -- 'builder' | 'reseller'
  "status" text DEFAULT 'pending',                     -- 'pending' | 'approved' | 'suspended'
  "commission_rate_builder_setup" numeric DEFAULT 15,
  "commission_rate_builder_recurring" numeric DEFAULT 10,
  "commission_rate_reseller" numeric DEFAULT 20,
  "payout_method" text,
  "payout_details" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE stores ADD COLUMN "created_by_affiliate_id" uuid REFERENCES affiliates(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS affiliate_resales (
  "id" text PRIMARY KEY,
  "affiliate_id" uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  "client_name" text,
  "client_email" text,
  "product" text,                            -- 'beya_creative' | 'PREMIUM' | 'ZIRORISK' | ...
  "sale_amount" numeric NOT NULL,
  "store_id" text REFERENCES stores(id),
  "status" text DEFAULT 'pending',           -- 'pending' | 'confirmed' | 'rejected'
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  "id" text PRIMARY KEY,
  "affiliate_id" uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  "track" text NOT NULL,                     -- 'builder' | 'reseller'
  "source_type" text NOT NULL,               -- 'store_setup' | 'store_recurring' | 'resale'
  "source_id" text,
  "amount" numeric NOT NULL,
  "rate_applied" numeric,
  "base_amount" numeric,
  "period" text,                             -- e.g. '2026-08' for recurring rows
  "status" text DEFAULT 'pending',           -- 'pending' | 'approved' | 'paid' | 'void'
  "created_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  "id" text PRIMARY KEY,
  "affiliate_id" uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  "amount" numeric NOT NULL,
  "commission_ids" jsonb,
  "status" text DEFAULT 'requested',         -- 'requested' | 'approved' | 'paid' | 'rejected'
  "method" text,
  "admin_note" text,
  "requested_at" timestamptz DEFAULT now(),
  "processed_at" timestamptz
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_resales ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliate self-access
CREATE POLICY "Affiliate reads own row" ON affiliates FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Affiliate updates own row" ON affiliates FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Affiliate inserts own row on signup" ON affiliates FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Affiliate reads own resales" ON affiliate_resales FOR SELECT USING (affiliate_id = auth.uid());
CREATE POLICY "Affiliate logs own resale" ON affiliate_resales FOR INSERT WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "Affiliate reads own commissions" ON affiliate_commissions FOR SELECT USING (affiliate_id = auth.uid());

CREATE POLICY "Affiliate reads own payouts" ON affiliate_payouts FOR SELECT USING (affiliate_id = auth.uid());
CREATE POLICY "Affiliate requests own payout" ON affiliate_payouts FOR INSERT WITH CHECK (affiliate_id = auth.uid());

-- Admin access (app-gated via can('affiliate_admin'), same trust model as StorePlans.tsx today)
CREATE POLICY "Admins read all affiliates" ON affiliates FOR SELECT USING (true);
CREATE POLICY "Admins update affiliates" ON affiliates FOR UPDATE USING (true);

CREATE POLICY "Admins read all resales" ON affiliate_resales FOR SELECT USING (true);
CREATE POLICY "Admins update resales" ON affiliate_resales FOR UPDATE USING (true);

CREATE POLICY "Admins manage commissions" ON affiliate_commissions FOR ALL USING (true);

CREATE POLICY "Admins manage payouts" ON affiliate_payouts FOR ALL USING (true);

-- Note: "Admins read all affiliates" (SELECT USING (true) above) also covers the public
-- referral-code lookup needed during /store-signup?ref=<code> attribution.
