-- Script pour activer RLS et ajouter des politiques permissives (ALL USING true WITH CHECK true)
-- A exécuter dans l'éditeur SQL de Supabase (SQL Editor) pour résoudre l'erreur:
-- "new row violates row-level security policy for table charges"

-- 1. Table charges (IMPORTANT - Résout l'erreur de sauvegarde des charges)
ALTER TABLE IF EXISTS public.charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on charges" ON public.charges;
CREATE POLICY "Allow all operations for public on charges" 
ON public.charges FOR ALL USING (true) WITH CHECK (true);

-- 2. Table inbox_emails
ALTER TABLE IF EXISTS public.inbox_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on inbox_emails" ON public.inbox_emails;
CREATE POLICY "Allow all operations for public on inbox_emails" 
ON public.inbox_emails FOR ALL USING (true) WITH CHECK (true);

-- 3. Table tarifs
ALTER TABLE IF EXISTS public.tarifs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on tarifs" ON public.tarifs;
CREATE POLICY "Allow all operations for public on tarifs" 
ON public.tarifs FOR ALL USING (true) WITH CHECK (true);

-- 4. Table achats
ALTER TABLE IF EXISTS public.achats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on achats" ON public.achats;
CREATE POLICY "Allow all operations for public on achats" 
ON public.achats FOR ALL USING (true) WITH CHECK (true);

-- 5. Table commandes
ALTER TABLE IF EXISTS public.commandes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on commandes" ON public.commandes;
CREATE POLICY "Allow all operations for public on commandes" 
ON public.commandes FOR ALL USING (true) WITH CHECK (true);

-- 6. Table leads
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on leads" ON public.leads;
CREATE POLICY "Allow all operations for public on leads" 
ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- 7. Table employes
ALTER TABLE IF EXISTS public.employes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on employes" ON public.employes;
CREATE POLICY "Allow all operations for public on employes" 
ON public.employes FOR ALL USING (true) WITH CHECK (true);

-- 8. Table factures
ALTER TABLE IF EXISTS public.factures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on factures" ON public.factures;
CREATE POLICY "Allow all operations for public on factures" 
ON public.factures FOR ALL USING (true) WITH CHECK (true);

-- 9. Table fiches
ALTER TABLE IF EXISTS public.fiches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on fiches" ON public.fiches;
CREATE POLICY "Allow all operations for public on fiches" 
ON public.fiches FOR ALL USING (true) WITH CHECK (true);

-- 10. Table ordres
ALTER TABLE IF EXISTS public.ordres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on ordres" ON public.ordres;
CREATE POLICY "Allow all operations for public on ordres" 
ON public.ordres FOR ALL USING (true) WITH CHECK (true);

-- 11. Table stocks
ALTER TABLE IF EXISTS public.stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on stocks" ON public.stocks;
CREATE POLICY "Allow all operations for public on stocks" 
ON public.stocks FOR ALL USING (true) WITH CHECK (true);

-- 12. Table tissus
ALTER TABLE IF EXISTS public.tissus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on tissus" ON public.tissus;
CREATE POLICY "Allow all operations for public on tissus" 
ON public.tissus FOR ALL USING (true) WITH CHECK (true);

-- 13. Table fournitures
ALTER TABLE IF EXISTS public.fournitures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on fournitures" ON public.fournitures;
CREATE POLICY "Allow all operations for public on fournitures" 
ON public.fournitures FOR ALL USING (true) WITH CHECK (true);

-- 14. Table paiements_salaires
ALTER TABLE IF EXISTS public.paiements_salaires ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on paiements_salaires" ON public.paiements_salaires;
CREATE POLICY "Allow all operations for public on paiements_salaires" 
ON public.paiements_salaires FOR ALL USING (true) WITH CHECK (true);

-- 15. Table pointages
ALTER TABLE IF EXISTS public.pointages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on pointages" ON public.pointages;
CREATE POLICY "Allow all operations for public on pointages" 
ON public.pointages FOR ALL USING (true) WITH CHECK (true);

-- 16. Table users
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on users" ON public.users;
CREATE POLICY "Allow all operations for public on users" 
ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 17. Table appointments
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public on appointments" ON public.appointments;
CREATE POLICY "Allow all operations for public on appointments" 
ON public.appointments FOR ALL USING (true) WITH CHECK (true);
