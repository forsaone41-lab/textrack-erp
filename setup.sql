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

