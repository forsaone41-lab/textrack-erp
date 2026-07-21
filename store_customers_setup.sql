CREATE TABLE IF NOT EXISTS store_customers (
  "id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "store_domain" text,
  "name" text,
  "phone" text,
  "email" text,
  "created_at" timestamptz DEFAULT now()
);

ALTER TABLE store_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own row" ON store_customers;
CREATE POLICY "Customers can view own row" ON store_customers
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Customers can update own row" ON store_customers;
CREATE POLICY "Customers can update own row" ON store_customers
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Customers can insert own row on signup" ON store_customers;
CREATE POLICY "Customers can insert own row on signup" ON store_customers
  FOR INSERT WITH CHECK (auth.uid() = id);

DO $$
BEGIN
    BEGIN ALTER TABLE commandes ADD COLUMN "customer_id" uuid; EXCEPTION WHEN duplicate_column THEN END;
END $$;
