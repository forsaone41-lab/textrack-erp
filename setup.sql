CREATE TABLE IF NOT EXISTS fiches (
  "id" text PRIMARY KEY,
  "modele" text,
  "description" text,
  "client" text,
  "tailles" jsonb,
  "mesures" jsonb
);

CREATE TABLE IF NOT EXISTS ordres (
  "id" text PRIMARY KEY,
  "commandeId" text,
  "rollId" text,
  "modele" text,
  "client" text,
  "quantite" numeric,
  "tissu" text,
  "couleur" text,
  "metrage" numeric,
  "statut" text,
  "dateCoupe" text,
  "tissus" jsonb,
  "type" text,
  "couleur" text,
  "conso" numeric,
  "prix" numeric
);

CREATE TABLE IF NOT EXISTS commandes (
  "id" text PRIMARY KEY,
  "reference" text,
  "client" text,
  "modele" text,
  "tissu" text,
  "quantite" numeric,
  "quantiteLivre" numeric,
  "dateCommande" text,
  "dateLivraisonPrevue" text,
  "phase" text,
  "prix" numeric,
  "prixUnitaire" numeric,
  "avance" numeric,
  "rebut" numeric,
  "statut" text,
  "suivi" jsonb,
  "date" text
);

-- UPDATE: Add missing columns for new features if they don't exist
DO $$ 
BEGIN 
    BEGIN ALTER TABLE commandes ADD COLUMN "tissus" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "fournituresDetails" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "prixValide" boolean DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "quantiteEchantillon" numeric; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "quantiteProduction" numeric; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "annulationRaison" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "couleurs" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "tailles" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "tissuPhoto" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "modelePhoto" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "preuveValidation" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "tissuSourcing" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "tissuPrix" numeric; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "coutMainOeuvre" numeric; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "planningReady" boolean DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "partenaireId" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "externalTasks" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE commandes ADD COLUMN "piecesData" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "photos" jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "photoCount" numeric; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmStage" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmContactMethod" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmRdvDate" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmNotes" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmPrice" numeric; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmDevisMode" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmPriceConfirmed" boolean; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "crmPriority" boolean; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "rejectedAt" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "contactedBy" text; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE leads ADD COLUMN "phone2" text; EXCEPTION WHEN duplicate_column THEN END;
END $$;

CREATE TABLE IF NOT EXISTS stocks (
  "id" text PRIMARY KEY,
  "type" text,
  "couleur" text,
  "metrage" numeric,
  "prixMetre" numeric,
  "seuilAlerte" numeric,
  "reference" text
);

CREATE TABLE IF NOT EXISTS tissus (
  "id" text PRIMARY KEY,
  "type" text,
  "couleur" text,
  "metrage" numeric,
  "prixMetre" numeric,
  "seuilAlerte" numeric,
  "reference" text,
  "composition" text,
  "metrageTotal" numeric,
  "fournisseur" text,
  "fournisseurTel" text,
  "fournisseurEmail" text,
  "largeur" numeric,
  "zone" text,
  "etagere" text,
  "dateReception" text
);

CREATE TABLE IF NOT EXISTS fournitures (
  "id" text PRIMARY KEY,
  "nom" text,
  "categorie" text,
  "description" text,
  "quantite" numeric,
  "prixUnitaire" numeric,
  "reference" text,
  "stockMin" numeric,
  "unite" text,
  "fournisseur" text
);

CREATE TABLE IF NOT EXISTS employes (
  "id" text PRIMARY KEY,
  "nom" text,
  "prenom" text,
  "poste" text,
  "type" text,
  "telephone" text,
  "email" text,
  "actif" boolean,
  "cin" text,
  "rib" text,
  "banque" text,
  "salaireMensuel" numeric,
  "remunerationType" text,
  "pin_code" text,
  "adresse" text,
  "photo" text
);

CREATE TABLE IF NOT EXISTS paiements_salaires (
  "id" text PRIMARY KEY,
  "employeId" text,
  "montant" numeric,
  "date" text,
  "mois" text,
  "methode" text,
  "notes" text
);

CREATE TABLE IF NOT EXISTS pointages (
  "id" text PRIMARY KEY,
  "commandeId" text,
  "employeId" text,
  "phase" text,
  "date" text,
  "piecesCompletees" numeric,
  "rebut" numeric,
  "retouche" numeric
);

CREATE TABLE IF NOT EXISTS operations_modele (
  "id" text PRIMARY KEY,
  "modele" text,
  "nom_operation" text,
  "target_heure" numeric,
  "ordre_sequence" numeric
);

CREATE TABLE IF NOT EXISTS suivi_horaire (
  "id" text PRIMARY KEY,
  "commande_id" text,
  "employe_id" text,
  "operation_id" text,
  "heure_debut" text,
  "heure_fin" text,
  "quantite_realisee" numeric,
  "date_production" text
);

CREATE TABLE IF NOT EXISTS factures (
  "id" text PRIMARY KEY,
  "numero" text,
  "commandeId" text,
  "client" text,
  "montant" numeric,
  "date" text,
  "echeance" text,
  "statut" text
);

CREATE TABLE IF NOT EXISTS presences (
  "id" text PRIMARY KEY,
  "employeId" text,
  "date" text,
  "heureEntree" text,
  "heureSortie" text,
  "statut" text
);

CREATE TABLE IF NOT EXISTS users (
  "id" text PRIMARY KEY,
  "nom" text,
  "role" text,
  "email" text,
  "telephone" text,
  "password" text,
  "pinCode" text,
  "lastActive" text,
  "employeId" text,
  "photo" text
);

CREATE TABLE IF NOT EXISTS appointments (
  "id" text PRIMARY KEY,
  "title" text,
  "description" text,
  "date" text,
  "type" text,
  "priority" text,
  "relatedId" text
);

CREATE TABLE IF NOT EXISTS charges (
  "id" text PRIMARY KEY,
  "designation" text,
  "categorie" text,
  "montant" numeric,
  "date" text,
  "statut" text,
  "recurrence" text,
  "fournisseur" text,
  "notes" text
);

CREATE TABLE IF NOT EXISTS leads (
  "id" text PRIMARY KEY,
  "name" text,
  "phone" text,
  "ville" text,
  "type" text,
  "quantity" numeric,
  "details" text,
  "tailles" jsonb,
  "date" text,
  "status" text,
  "photo" text,
  "cv" text,
  "email" text,
  "contactedAt" text,
  "contactedType" text
);

CREATE TABLE IF NOT EXISTS achats (
  "id" text PRIMARY KEY,
  "client" text,
  "commandeRef" text,
  "article" text,
  "couleur" text,
  "quantiteRequise" numeric,
  "quantiteKg" numeric,
  "unite" text,
  "statut" text,
  "dateDemande" text,
  "categorie" text,
  "prixUnitaire" numeric,
  "fournisseur" text,
  "quantiteLivre" numeric
);

CREATE TABLE IF NOT EXISTS tarifs (
  "id" text PRIMARY KEY,
  "titre" text,
  "categorie" text,
  "prixMin" numeric,
  "prixMax" numeric,
  "unite" text,
  "description" text,
  "actif" boolean
);

\n\nCREATE TABLE IF NOT EXISTS stores (
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
