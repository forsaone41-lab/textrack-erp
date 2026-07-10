-- Script pour activer RLS et ajouter des politiques permissives afin de corriger les avertissements Supabase
-- A exécuter dans l'éditeur SQL de Supabase (SQL Editor)

-- 1. Table inbox_emails
ALTER TABLE public.inbox_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on inbox_emails" ON public.inbox_emails;
CREATE POLICY "Allow all operations for public on inbox_emails" 
ON public.inbox_emails 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Table tarifs
ALTER TABLE public.tarifs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on tarifs" ON public.tarifs;
CREATE POLICY "Allow all operations for public on tarifs" 
ON public.tarifs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Table achats
ALTER TABLE public.achats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on achats" ON public.achats;
CREATE POLICY "Allow all operations for public on achats" 
ON public.achats 
FOR ALL 
USING (true) 
WITH CHECK (true);
