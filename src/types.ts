import { supabase } from './supabase';

export function heureNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function dateNow() {
  return new Date().toISOString().split('T')[0];
}

// Safe LocalStorage wrapper for Private/Incognito modes
export const safeStorage = {
  getItem: (key: string): string | null => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }
};

export type Phase = 'patronage' | 'coupe' | 'montage' | 'finition' | 'repassage' | 'controle' | 'emballage' | 'livré';

export const PHASE_LABELS: Record<Phase, string> = {
  patronage: 'Patronage',
  coupe: 'Coupe',
  montage: 'Montage',
  finition: 'Finition',
  repassage: 'Repassage',
  controle: 'Contrôle Qualité',
  emballage: 'Emballage',
  livré: 'Livré',
};

export const PHASE_ORDER: Phase[] = ['patronage', 'coupe', 'montage', 'finition', 'repassage', 'controle', 'emballage', 'livré'];

export const PHASE_COLORS: Record<Phase, string> = {
  patronage: 'bg-pink-500',
  coupe: 'bg-orange-500',
  montage: 'bg-blue-500',
  finition: 'bg-purple-500',
  repassage: 'bg-amber-500',
  controle: 'bg-rose-500',
  emballage: 'bg-cyan-500',
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
  client: string;
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
  prixUnitaire?: number;
  avance?: number;
  rebut: number;
  statut: 'echantillon_en_cours' | 'echantillon_valide' | 'en_cours' | 'terminé' | 'livré';
  suivi: { phase: Phase; date: string; note: string }[];
  couleurs?: string[];
  tailles?: Record<string, number>;
  tissuPhoto?: string;
  modelePhoto?: string;
  preuveValidation?: string;
  tissuSourcing?: 'maison' | 'client';
  tissuPrix?: number;
  coutMainOeuvre?: number;
  avance?: number;
  planningReady?: boolean;
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
  fournisseurTel?: string;
  fournisseurEmail?: string;
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
  remunerationType?: 'mensuel' | 'hebdomadaire' | 'tache';
  pin_code?: string;
  photo?: string;
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
  retouche: number;
}

export interface OperationModele {
  id: string;
  modele: string;
  nom_operation: string;
  target_heure: number;
  ordre_sequence: number;
}

export interface SuiviHoraire {
  id: string;
  commande_id: string;
  employe_id: string;
  operation_id: string;
  heure_debut: string;
  heure_fin: string;
  quantite_realisee: number;
  date_production: string;
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
  role: 'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste';
  email: string;
  telephone?: string;
  password?: string;
  pinCode?: string;
  lastActive?: string;
  employeId?: string;
  photo?: string;
}

export type ChargeCategorie =
  | 'salaires'
  | 'achats_matieres'
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
  achats_matieres: 'Achats Matières Première',
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
  achats_matieres: '#10b981',
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
  | 'dashboard' | 'fiches' | 'ordres' | 'chaine' | 'stocks' | 'pilotage' | 'scan_production'
  | 'rh' | 'commandes' | 'clients' | 'factures' | 'charges' | 'bilan' | 'fast_scanner'
  | 'pointage' | 'portail_client' | 'performance' | 'utilisateurs' | 'parametres' | 'demandes';

export type RolePermMap = Record<'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste', AppPage[]>;

export const DEFAULT_PERMISSIONS: RolePermMap = {
  admin: ['dashboard', 'demandes', 'fiches', 'ordres', 'chaine', 'pilotage', 'scan_production', 'stocks', 'rh', 'commandes', 'clients', 'factures', 'charges', 'bilan', 'fast_scanner', 'pointage', 'portail_client', 'performance', 'utilisateurs', 'parametres'],
  pointeur: ['dashboard', 'fiches', 'ordres', 'chaine', 'pilotage', 'scan_production', 'pointage', 'performance'],
  client: ['portail_client'],
  worker: ['pointage', 'fast_scanner'],
  coupeur: ['ordres'],
  modeliste: ['fiches'],
};

const PERMISSIONS_VERSION = 5;

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
      worker: parsed.worker ?? DEFAULT_PERMISSIONS.worker,
      coupeur: parsed.coupeur ?? DEFAULT_PERMISSIONS.coupeur,
      modeliste: parsed.modeliste ?? DEFAULT_PERMISSIONS.modeliste,
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
  logoLanding?: string;
  logoAdmin?: string;
  logoClient?: string;
  logoInvoice?: string;
  logoLogin?: string;
  logoMobileHeader?: string;
  address: string;
  ice: string;
  rc: string;
  if_tax: string;
  patente: string;
  phone: string;
  email: string;
  landingVideoUrl?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  ville: string;
  type: string;
  quantity: number;
  details?: string;
  tailles?: Record<string, number>;
  date: string;
  status: 'new' | 'completed';
  photo?: string;
  email?: string;
  contactedAt?: string;
  contactedType?: string;
}

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'BEYA CREATIVE',
  subtitle: 'Confection de vêtement',
  logoUrl: '/logo.png',
  logoLanding: '/logo.png',
  logoAdmin: '/logo.png',
  logoClient: '/logo.png',
  logoInvoice: '/logo.png',
  logoLogin: '/logo.png',
  logoMobileHeader: '/logo.png',
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
    const data = safeStorage.getItem('textrack_profile');
    const parsed = data ? JSON.parse(data) : {};
    const merged = { ...DEFAULT_COMPANY, ...parsed };
    
    // Strong fallback: if specific logos are missing or empty, use the main logoUrl
    if (!merged.logoLanding) merged.logoLanding = merged.logoUrl;
    if (!merged.logoAdmin) merged.logoAdmin = merged.logoUrl;
    if (!merged.logoClient) merged.logoClient = merged.logoUrl;
    if (!merged.logoInvoice) merged.logoInvoice = merged.logoUrl;
    if (!merged.logoLogin) merged.logoLogin = merged.logoUrl;
    if (!merged.logoMobileHeader) merged.logoMobileHeader = merged.logoUrl;
    
    return merged;
  } catch (e) {
    return DEFAULT_COMPANY;
  }
}

export async function syncCompanyProfile(): Promise<CompanyProfile> {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'company-profile').single();
    if (data && !error) {
      const remoteProfile = data.value as CompanyProfile;
      safeStorage.setItem('textrack_profile', JSON.stringify(remoteProfile));
      return remoteProfile;
    }
    return loadCompanyProfile();
  } catch (e) {
    return loadCompanyProfile();
  }
}

export async function loadLeads(): Promise<Lead[]> {
  try {
    // Try Supabase first
    const data = await loadData<Lead>('leads');
    
    // If data is null, it means the request failed (fallback to local)
    // If data is [], it means the table is empty (don't fallback)
    if (data !== null) return data;
    
    // Fallback to local only if remote call failed
    const local = safeStorage.getItem('textrack_leads');
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

export async function saveLead(lead: Omit<Lead, 'id' | 'date' | 'status'>) {
  const newLead: Lead = {
    ...lead,
    id: genId(),
    date: new Date().toISOString(),
    status: 'new'
  };
  
  // Save to Supabase (primary) - setting silent to false to see errors
  await saveRecord('leads', newLead, false);
  
  // Also save to local (legacy fallback)
  const leads = await loadLeads();
  safeStorage.setItem('textrack_leads', JSON.stringify([newLead, ...leads]));
  
  return newLead;
}

export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  safeStorage.setItem('textrack_profile', JSON.stringify(profile));
  // Also save to Supabase
  try {
    await supabase.from('settings').upsert({ id: 'company-profile', value: profile });
  } catch (e) {
    console.error("Failed to sync settings to cloud:", e);
  }
}

// ─── Storage Helpers ────────────────────────────────────────
export async function loadData<T>(table: string): Promise<T[] | null> {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`Failed to load ${table}:`, error.message);
      return null;
    }
    return (data || []) as T[];
  } catch (err) {
    console.error(`Fatal load error for ${table}:`, err);
    return null;
  }
}

export async function saveRecord<T>(table: string, record: T, silent: boolean = false): Promise<void> {
  // Guard against non-UUID IDs for the 'users' table (e.g. master-admin)
  if (table === 'users') {
    const r = record as any;
    if (r.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id)) {
      console.warn(`Skipping save for non-UUID user: ${r.id}`);
      return;
    }
  }

  const { error } = await supabase.from(table).upsert(record as any);
  if (error) {
    console.error(`Error saving to ${table}:`, error.message);

    // Robust fallback for missing columns in Supabase schema
    const errMsg = error.message.toLowerCase();
    const isMissingColumn = errMsg.includes('column') || errMsg.includes('not find') || errMsg.includes('attribute') || errMsg.includes('schema cache');
    
    if (isMissingColumn) {
      const fallbackRecord = { ...record as any };
      const newCols = [
        'tissuPrix', 'coutMainOeuvre', 'tissuSourcing', 
        'tissu', 'tissuConsommation', 'commandeId', 'fournisseurTel', 'fournisseurEmail',
        'adresse', 'notes', 'pinCode',
        'avance', 'retouche', 'lastActive', 'photo',
        'composition', 'metrageTotal', 'largeur', 'zone', 'etagere',
        'cin', 'rib', 'banque', 'salaireMensuel', 'remunerationType', 'actif', 'prenom',
        'dateEntree', 'contrat', 'cnss', 'mutuelle', 'enfants', 'situation_familiale',
        'clientId', 'rebut', 'suivi', 'planningReady', 'ville', 'employeId', 'telephone'
      ];
      newCols.forEach(col => delete fallbackRecord[col]);
      
      const { error: retryError } = await supabase.from(table).upsert(fallbackRecord);
      if (!retryError) {
        console.warn(`Saved ${table} using fallback (ignored new columns). Run SQL update to enable full tracking.`);
        return; 
      }
      
      // If even the fallback fails, use the latest error for the alert
      if (!silent) alert(`Erreur de sauvegarde dans ${table} : ${retryError.message}\n\nNote: Certaines colonnes sont peut-être manquantes dans votre base de données Supabase.`);
      return;
    }

    // Only alert if it's NOT a missing column error
    if (!silent) alert(`Erreur de sauvegarde dans ${table} : ${error.message}`);
  }
}

// Helper to delete a single record
export async function deleteRecord(table: string, id: string, email?: string): Promise<void> {
  console.log(`[DEBUG] Deleting from ${table} | ID: ${id} | Email: ${email}`);
  
  // Try ID first
  const { error } = await supabase.from(table).delete().eq('id', id);
  
  if (error) {
    console.warn("Delete by ID failed, trying by email...", error.message);
    
    // Fallback to Email if provided
    if (email && table === 'leads') {
      await supabase.from(table).delete().eq('email', email);
    }
  }
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
