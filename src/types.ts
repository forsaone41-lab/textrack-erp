import { supabase } from './supabase';

export type Phase = 'coupe' | 'montage' | 'finition' | 'repassage' | 'livré';

export const PHASE_LABELS: Record<Phase, string> = {
  coupe: 'Coupe',
  montage: 'Montage',
  finition: 'Finition',
  repassage: 'Repassage',
  livré: 'Livré',
};

export const PHASE_ORDER: Phase[] = ['coupe', 'montage', 'finition', 'repassage', 'livré'];

export const PHASE_COLORS: Record<Phase, string> = {
  coupe: 'bg-orange-500',
  montage: 'bg-blue-500',
  finition: 'bg-purple-500',
  repassage: 'bg-yellow-500',
  livré: 'bg-green-500',
};

export interface FicheTechnique {
  id: string;
  modele: string;
  description: string;
  client: string;
  tailles: string[];
  mesures: { nom: string; valeurs: Record<string, number> }[];
  tissuConsommation: number; // mètres par pièce
  type: string;
  createdAt: string;
  photo?: string;
  patronagePhoto?: string;
  patronageFileName?: string;
}

export interface OrdreDeCoupe {
  id: string;
  commandeId?: string | null;
  rollId?: string | null;
  modele: string;
  quantite: number;
  tissu: string;
  couleur: string;
  metrage: number;
  statut: 'planifié' | 'en_cours' | 'terminé';
  dateCoupe: string;
}

export interface Commande {
  id: string;
  reference: string;
  client: string;
  modele: string;
  tissu: string;
  quantite: number;
  quantiteLivre: number;
  dateCommande: string;
  dateLivraisonPrevue: string;
  phase: Phase;
  prix: number;
  rebut: number;
  statut: 'en_cours' | 'terminé' | 'livré';
  suivi: { phase: Phase; date: string; note: string }[];
}

export interface StockTissu {
  id: string;
  type: string;
  couleur: string;
  metrage: number;
  prixMetre: number;
  seuilAlerte: number;
  reference?: string;
  composition?: string;
  metrageTotal?: number;
  fournisseur?: string;
  largeur?: number;
  zone?: string;
  etagere?: string;
  dateReception?: string;
}

export interface StockFourniture {
  id: string;
  nom: string;
  categorie: 'boutons' | 'fermetures' | 'fil' | 'étiquettes' | 'élastiques' | 'autre';
  description: string;
  quantite: number;
  prixUnitaire: number;
  reference?: string;
  stockMin?: number;
  unite?: string;
  fournisseur?: string;
}

export interface Employe {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  type: 'atelier' | 'sous_traitance';
  telephone: string;
  email: string;
  actif: boolean;
  cin?: string;
  rib?: string;
  banque?: string;
  salaireMensuel?: number;
}

export interface PaiementSalaire {
  id: string;
  employeId: string;
  montant: number;
  date: string;
  mois: string;
  methode: 'especes' | 'virement' | 'cheque';
  notes?: string;
}

export interface PointageEntry {
  id: string;
  commandeId: string;
  employeId: string;
  phase: Phase;
  date: string;
  piecesCompletees: number;
  rebut: number;
}

export interface Facture {
  id: string;
  numero: string;
  commandeId?: string | null;
  client: string;
  montant: number;
  date: string;
  echeance: string;
  statut: 'payée' | 'en_attente' | 'impayée';
}

export interface Presence {
  id: string;
  employeId: string;
  date: string;
  heureEntree: string | null;
  heureSortie: string | null;
  statut: 'present' | 'absent' | 'retard';
}

export interface User {
  id: string;
  nom: string;
  role: 'admin' | 'pointeur' | 'client';
  email: string;
  password?: string;
}

export type ChargeCategorie =
  | 'salaires'
  | 'loyer'
  | 'electricite'
  | 'eau'
  | 'telephone'
  | 'transport'
  | 'maintenance'
  | 'fournitures_bureau'
  | 'assurance'
  | 'sous_traitance'
  | 'autre';

export const CATEGORIE_LABELS: Record<ChargeCategorie, string> = {
  salaires: "Salaires & Main d'œuvre",
  loyer: 'Loyer & Charges locatives',
  electricite: 'Électricité',
  eau: 'Eau',
  telephone: 'Téléphone & Internet',
  transport: 'Transport & Livraison',
  maintenance: 'Maintenance Machines',
  fournitures_bureau: 'Fournitures Bureau',
  assurance: 'Assurance',
  sous_traitance: 'Sous-traitance',
  autre: 'Autres',
};

export const CATEGORIE_COLORS: Record<ChargeCategorie, string> = {
  salaires: '#6366f1',
  loyer: '#f59e0b',
  electricite: '#f97316',
  eau: '#3b82f6',
  telephone: '#8b5cf6',
  transport: '#10b981',
  maintenance: '#ef4444',
  fournitures_bureau: '#06b6d4',
  assurance: '#ec4899',
  sous_traitance: '#84cc16',
  autre: '#94a3b8',
};

export interface Charge {
  id: string;
  designation: string;
  categorie: ChargeCategorie;
  montant: number;
  date: string;
  statut: 'payé' | 'impayé' | 'en_attente';
  recurrence: 'mensuel' | 'annuel' | 'ponctuel';
  fournisseur?: string;
  notes?: string;
}

// ─── Permissions ────────────────────────────────────────────
export type AppPage =
  | 'dashboard' | 'fiches' | 'ordres' | 'chaine' | 'stocks'
  | 'rh' | 'commandes' | 'clients' | 'factures' | 'charges' | 'bilan'
  | 'pointage' | 'portail_client' | 'performance' | 'utilisateurs' | 'parametres';

export type RolePermMap = Record<'admin' | 'pointeur' | 'client', AppPage[]>;

export const DEFAULT_PERMISSIONS: RolePermMap = {
  admin: ['dashboard', 'fiches', 'ordres', 'chaine', 'stocks', 'rh', 'commandes', 'clients', 'factures', 'charges', 'bilan', 'pointage', 'portail_client', 'performance', 'utilisateurs', 'parametres'],
  pointeur: ['fiches', 'ordres', 'chaine', 'pointage'],
  client: ['portail_client'],
};

const PERMISSIONS_VERSION = 2;

export function loadPermissions(): RolePermMap {
  try {
    const d = localStorage.getItem('textrack_permissions');
    if (!d) return DEFAULT_PERMISSIONS;
    const parsed = JSON.parse(d) as RolePermMap & { _v?: number };
    if ((parsed._v ?? 1) < PERMISSIONS_VERSION) {
      localStorage.removeItem('textrack_permissions');
      return DEFAULT_PERMISSIONS;
    }
    return {
      admin: parsed.admin ?? DEFAULT_PERMISSIONS.admin,
      pointeur: parsed.pointeur ?? DEFAULT_PERMISSIONS.pointeur,
      client: parsed.client ?? DEFAULT_PERMISSIONS.client,
    };
  } catch { return DEFAULT_PERMISSIONS; }
}

export function savePermissions(perms: RolePermMap): void {
  localStorage.setItem('textrack_permissions', JSON.stringify({ ...perms, _v: PERMISSIONS_VERSION }));
}

// ─── Company Profile (Local Settings) ──────────────────────────
export interface CompanyProfile {
  name: string;
  subtitle: string;
  logoUrl: string;
  address: string;
  ice: string;
  rc: string;
  if_tax: string;
  patente: string;
  phone: string;
  email: string;
}

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'BEYA CREATIVE',
  subtitle: 'Confection de vêtement',
  logoUrl: '/logo.png',
  address: 'Zone Industrielle, Casablanca',
  ice: '000000000000000',
  rc: '123456',
  if_tax: '0000000',
  patente: '00000000',
  phone: '+212 6 00 00 00 00',
  email: 'contact@beyacreative.ma'
};

export function loadCompanyProfile(): CompanyProfile {
  try {
    const data = localStorage.getItem('textrack_company');
    return data ? JSON.parse(data) : DEFAULT_COMPANY;
  } catch {
    return DEFAULT_COMPANY;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem('textrack_company', JSON.stringify(profile));
}

// ─── Storage Helpers ────────────────────────────────────────
export async function loadData<T>(table: string): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error loading data from ${table}:`, error.message);
      return [];
    }
    return data as T[];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveRecord<T>(table: string, record: T): Promise<void> {
  const { error } = await supabase.from(table).upsert(record as any);
  if (error) {
    console.error(`Error saving to ${table}:`, error.message);
    
    // If it's a missing column error, try to save without the new fields as a fallback
    if (error.message.includes('column') && error.message.includes('not find')) {
      const fallbackRecord = { ...record as any };
      // List of potential new columns that might not exist yet
      ['tissu', 'tissuConsommation', 'type'].forEach(col => delete fallbackRecord[col]);
      const { error: retryError } = await supabase.from(table).upsert(fallbackRecord);
      if (!retryError) return; // Fallback worked!
    }

    alert(`Erreur de sauvegarde dans ${table} : ${error.message}. (Vérifiez le RLS sur Supabase !)`);
  }
}

// Helper to delete a single record
export async function deleteRecord(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`Error deleting from ${table}:`, error.message);
}

// Keeping this for backwards compatibility, but it should be avoided
export function saveData<T>(_key: string, _data: T[]): void {
  // NO-OP: Deprecated. Components should use saveRecord and deleteRecord.
}

export function genId(): string {
  return crypto.randomUUID();
}

// ─── Mock Data Initializer ──────────────────────────────────
export function initMockData(): void {
  // NO-OP: We use Supabase now.
}
