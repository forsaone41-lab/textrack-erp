CREATE TABLE IF NOT EXISTS stores (
  "id" text PRIMARY KEY,
  "store_name" text,
  "custom_domain" text UNIQUE,
  "store_lang" text DEFAULT 'fr',
  "active_theme" text,
  "primary_color" text,
  "font_family" text,
  "hero_image" text,
  "hero_title" text,
  "hero_subtitle" text,
  "hero_button_text" text,
  "home_collections_title" text,
  "all_collections_title" text,
  "pages" jsonb,
  "footer_settings" jsonb,
  "buy_mode" text DEFAULT 'both',
  "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS store_products (
  "id" text PRIMARY KEY,
  "store_id" text REFERENCES stores(id) ON DELETE CASCADE,
  "name" text,
  "price" numeric,
  "category" text,
  "image" text,
  "description" text,
  "sizes" jsonb,
  "colors" jsonb,
  "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores are viewable by everyone" ON stores FOR SELECT USING (true);
CREATE POLICY "Stores are insertable by authenticated users" ON stores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Stores are updatable by authenticated users" ON stores FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Store products are viewable by everyone" ON store_products FOR SELECT USING (true);
CREATE POLICY "Store products are insertable by authenticated users" ON store_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Store products are updatable by authenticated users" ON store_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Store products are deletable by authenticated users" ON store_products FOR DELETE USING (auth.role() = 'authenticated');
