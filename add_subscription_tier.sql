-- Adds the admin-controlled plan column used to gate Pro themes in StoreBuilder.
-- Run this once in the Supabase SQL editor.
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'NORMAL';
