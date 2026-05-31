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
  fit?: string;
  complexity?: string;
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
  tissus?: { id: string; type: string; couleur: string; conso: number; prix: number; sourcing: string }[];
}

export interface Commande {
  id: string;
  reference: string;
  client: string;
  modele: string;
  tissu: string;
  quantite: number;
  quantiteEchantillon?: number;
  quantiteProduction?: number;
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
  planningReady?: boolean;
  partenaireId?: string;
  externalTasks?: {
    id: string;
    type: 'traz' | 'print' | 'confection' | 'patronage' | 'coupe' | 'autre';
    partenaireId: string;
    details: string;
    status: 'en_attente' | 'en_cours' | 'terminé';
    location?: 'devant' | 'dos' | 'manches' | 'pantalon' | 'complet';
    avance?: number;
    prixUnitaire?: number;
    quantite?: number;
    photo?: string;
    attachments?: string[];
    partnerResultFiles?: string[];
  }[];
  referenceClient?: string;
  typeModele?: string;
  photo?: string;
  tissus?: { id: string; type: string; couleur: string; conso: number; prix: number; sourcing: string }[];
  tissuConsommation?: number;
  typeDossier?: 'creations' | 'sous_traitance' | 'uniformes' | 'production' | 'service';
}

export interface Stock {
  id: string;
  type: string;
  couleur: string;
  metrage: number;
  prixMetre: number;
  seuilAlerte: number;
  reference?: string;
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
  imageUrl?: string;
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
  adresse?: string;
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

export interface LigneFacture {
  id: string;
  designation: string;
  type?: 'main_doeuvre' | 'matiere' | 'autre';
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export interface Facture {
  id: string;
  numero: string;
  commandeId?: string | null;
  client: string;
  montant: number;
  avance?: number;
  preuvePaiement?: string;
  date: string;
  echeance: string;
  statut: 'payée' | 'en_attente' | 'impayée';
  typeDoc?: 'facture' | 'devis' | 'recu';
  articles?: LigneFacture[];
  banque?: string;
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
  role: 'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire';
  email: string;
  telephone?: string;
  password?: string;
  pinCode?: string;
  lastActive?: string;
  employeId?: string;
  photo?: string;
}

export interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  type: 'livraison' | 'reunion' | 'paiement' | 'echantillon' | 'autre';
  priority: 'low' | 'medium' | 'high';
  relatedId?: string; // e.g. Commande ID
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
  | 'pointage' | 'portail_client' | 'performance' | 'utilisateurs' | 'parametres' | 'demandes'
  | 'worker_portal' | 'controle_qualite' | 'partenaire_portal' | 'agenda' | 'notifications' | 'ai_space';

export type RolePermMap = Record<'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire', AppPage[]>;

export const DEFAULT_PERMISSIONS: RolePermMap = {
  admin: ['dashboard', 'demandes', 'fiches', 'ordres', 'chaine', 'pilotage', 'scan_production', 'stocks', 'rh', 'commandes', 'clients', 'factures', 'charges', 'bilan', 'fast_scanner', 'pointage', 'portail_client', 'performance', 'utilisateurs', 'parametres', 'worker_portal', 'controle_qualite', 'partenaire_portal', 'agenda', 'notifications', 'ai_space'],
  pointeur: ['dashboard', 'fiches', 'ordres', 'chaine', 'pilotage', 'scan_production', 'pointage', 'performance', 'worker_portal', 'controle_qualite'],
  client: ['portail_client'],
  worker: ['worker_portal'],
  coupeur: ['ordres'],
  modeliste: ['fiches', 'ai_space'],
  controleur: ['scan_production', 'controle_qualite', 'worker_portal'],
  agent_pointage: ['pointage', 'rh'],
  partenaire: ['partenaire_portal'],
};

const PERMISSIONS_VERSION = 12;

export function loadPermissions(): RolePermMap {
  try {
    const d = localStorage.getItem('textrack_permissions');
    if (!d) return DEFAULT_PERMISSIONS;
    const parsed = JSON.parse(d) as RolePermMap & { _v?: number };
    if ((parsed._v ?? 1) < PERMISSIONS_VERSION) {
      localStorage.removeItem('textrack_permissions');
      return DEFAULT_PERMISSIONS;
    }
    const keys: (keyof RolePermMap)[] = ['admin', 'pointeur', 'client', 'worker', 'coupeur', 'modeliste', 'controleur', 'agent_pointage', 'partenaire'];
    const result = { ...DEFAULT_PERMISSIONS };
    keys.forEach(k => {
      if (parsed[k]) (result as any)[k] = parsed[k];
    });
    return result;
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
  logoFooter?: string;
  logoAppIcon?: string;
  address: string;
  ice: string;
  rc: string;
  if_tax: string;
  patente: string;
  phone: string;
  email: string;
  landingVideoUrl?: string;
  // About Us Content
  aboutTitleFr?: string;
  aboutTitleAr?: string;
  aboutTextFr?: string;
  aboutTextAr?: string;
  aboutPhotoUrl?: string;
  visionTextFr?: string;
  visionTextAr?: string;
  missionTextFr?: string;
  missionTextAr?: string;
  googleMapsUrl?: string;
  experienceYears?: string;
  experienceTextFr?: string;
  experienceTextAr?: string;
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
  cv?: string;
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
  address: 'Sidi Said, Meknes 50000, Morocco',
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
    if (!merged.logoFooter) merged.logoFooter = merged.logoUrl;
    
    return merged;
  } catch (e) {
    return DEFAULT_COMPANY;
  }
}

export async function syncCompanyProfile(): Promise<CompanyProfile> {
  try {
    // 1. Try to find the LATEST system config record in 'leads' table
    const { data: lData } = await supabase
      .from('leads')
      .select('*')
      .eq('name', '__SYSTEM_CONFIG__')
      .order('date', { ascending: false })
      .limit(1);
    
    if (lData && lData.length > 0) {
      const record = lData[0];
      if (record.details) {
        try {
          const remoteProfile = JSON.parse(record.details) as CompanyProfile;
          safeStorage.setItem('textrack_profile', JSON.stringify(remoteProfile));
          return remoteProfile;
        } catch { /* ignore parse error */ }
      }
    }

    // 2. Backup: Try standard settings table
    const { data: sData, error: sError } = await supabase.from('settings').select('*').eq('id', 'company-profile').single();
    if (sData && !sError) {
      const remoteProfile = sData.value as CompanyProfile;
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
    // 1. Try to get from Supabase but FILTER OUT photos to keep it fast
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .neq('name', '__WORKER_PHOTO__')
      .neq('name', '__SYSTEM_CONFIG__')
      .neq('name', '__DELETED__');

    if (!error && Array.isArray(data)) {
      // ✅ Filter out locally deleted IDs just in case RLS blocked the delete
      let finalData = data;
      try {
        const deletedIdsRaw = localStorage.getItem('textrack_deleted_ids');
        if (deletedIdsRaw) {
          const deletedIds = JSON.parse(deletedIdsRaw);
          if (Array.isArray(deletedIds) && deletedIds.length > 0) {
            finalData = data.filter(item => !deletedIds.includes(item.id));
          }
        }
      } catch (e) {}

      // ✅ Update the cache
      localStorage.setItem('textrack_data_leads', JSON.stringify(finalData));
      _cache['leads'] = { data: finalData, ts: Date.now() };
      return finalData;
    }
    
    // Fallback to local
    const local = safeStorage.getItem('textrack_leads');
    const parsed = local ? JSON.parse(local) : [];
    return Array.isArray(parsed) ? parsed.filter((l: any) => l && l.name !== '__SYSTEM_CONFIG__' && l.name !== '__WORKER_PHOTO__') : [];
  } catch (err) {
    console.error("Error in loadLeads:", err);
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
  
  // Save to Supabase (primary) - Use pure INSERT for public users to respect RLS
  const { error } = await supabase.from('leads').insert(newLead);
  if (error) {
    console.error("Erreur d'insertion lead:", error);
    throw error;
  }
  
  // Also save to local (legacy fallback)
  const leads = await loadLeads();
  safeStorage.setItem('textrack_leads', JSON.stringify([newLead, ...leads]));
  
  return newLead;
}

export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  console.log("[DEBUG] Saving profile locally...");
  safeStorage.setItem('textrack_profile', JSON.stringify(profile));
  
  console.log("[DEBUG] Saving profile to cloud...");
  try {
    // Save to 'leads' table as a NEW system record every time (guarantees INSERT works if UPDATE is blocked)
    const configLead = {
      id: genId(), // NEW ID every time
      name: '__SYSTEM_CONFIG__',
      phone: '0000',
      ville: 'SYSTEM',
      type: 'CONFIG',
      quantity: 0,
      status: 'completed',
      date: new Date().toISOString(),
      details: JSON.stringify(profile)
    };
    
    await saveRecord('leads', configLead, false);
    console.log("[DEBUG] Cloud save success (versioned)!");
  } catch (e: any) {
    console.error("[DEBUG] Cloud save fatal error:", e);
    alert("⚠️ Erreur fatale : " + e.message);
  }
}

// ─── Storage Helpers ────────────────────────────────────────
const _cache: Record<string, { data: any[]; ts: number }> = {};
const CACHE_TTL = 60_000; // 60s in-memory cache

export async function loadData<T>(table: string): Promise<T[]> {
  // 1. Check in-memory cache first (instant)
  const cached = _cache[table];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T[];
  }

  try {
    // 2. Show localStorage data instantly while fetching
    const localKey = `textrack_data_${table}`;
    const localRaw = localStorage.getItem(localKey);
    let localData: T[] | null = null;
    if (localRaw) {
      try { localData = JSON.parse(localRaw); } catch { /* ignore */ }
    }

    // 3. Fetch from Supabase
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`Failed to load ${table}:`, error.message);
      // Return localStorage fallback if network fails
      if (localData && Array.isArray(localData)) return localData;
      return [];
    }
    const result = Array.isArray(data) ? data : [];
    
    // 4. Update both caches
    _cache[table] = { data: result, ts: Date.now() };
    try { localStorage.setItem(localKey, JSON.stringify(result)); } catch { /* quota */ }
    
    return result;
  } catch (err) {
    console.error(`Fatal load error for ${table}:`, err);
    return [];
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

  try {
    const { error } = await supabase.from(table).upsert(record as any);
    if (!error) {
      // ✅ Invalidate both caches on success
      localStorage.removeItem(`textrack_data_${table}`);
      delete _cache[table];
      return;
    }

    if (error) {
      console.error(`Error saving to ${table}:`, error.message);

      // Robust fallback for missing columns in Supabase schema
      const errMsg = error.message.toLowerCase();
      const isMissingColumn = errMsg.includes('column') || errMsg.includes('not find') || errMsg.includes('attribute') || errMsg.includes('schema cache');
      
      if (isMissingColumn) {
        const fallbackRecord = { ...record as any };
        const newCols = [
          'tissuPrix', 'coutMainOeuvre', 'tissuSourcing', 
          'tissuConsommation', 'fournisseurTel', 'fournisseurEmail',
          'pinCode',
          'avance', 'retouche', 'lastActive',
          'composition', 'metrageTotal', 'largeur', 'zone', 'etagere',
          'cin', 'rib', 'banque', 'salaireMensuel', 'remunerationType', 'actif',
          'dateEntree', 'contrat', 'cnss', 'mutuelle', 'enfants', 'situation_familiale',
          'clientId', 'rebut', 'planningReady', 'ville', 'employeId', 'telephone', 'tailles', 'rejectionNote', 'tissus',
          'partenaireId', 'externalTasks', 'typeDossier',
          'photo', 'adresse'
        ];
        newCols.forEach(col => delete fallbackRecord[col]);
        
        const { error: retryError } = await supabase.from(table).upsert(fallbackRecord);
        if (!retryError) {
          // ✅ Invalidate both caches on success
          localStorage.removeItem(`textrack_data_${table}`);
          delete _cache[table];
          console.warn(`Saved ${table} using fallback (ignored new columns). Run SQL update to enable full tracking.`);
          return; 
        }
        
        // If even the fallback fails, use the latest error for the alert
        if (!silent) alert(`Erreur de sauvegarde dans ${table} : ${retryError.message}\n\nNote: Certaines colonnes sont peut-être manquantes dans votre base de données Supabase.`);
        return;
      }

      // Handle Quota Exceeded error specifically
      if (error.message.includes('exceed_egress_quota')) {
        if (!silent) alert('السيرفر توقف مؤقتاً حيت استهلكتي الكوطا المجانية (السبب هو داك السكرين شوت الكبير اللي دخلتي). خاصك تدخل لـ Supabase وتقاد الحساب ديالك.');
        return;
      }

      // Only alert if it's NOT a missing column error
      if (!silent) alert(`Erreur de sauvegarde dans ${table} : ${error.message}`);
    }
  } catch (e: any) {
    console.error(`Fatal save error for ${table}:`, e);
    if (!silent) {
      const msg = e.message === 'Failed to fetch' 
        ? (silent ? '' : "Erreur de connexion : Impossible de joindre le serveur. Vérifiez votre connexion internet.") 
        : e.message;
      if (msg) alert(`Erreur critique [${table}] : ${msg}`);
    }
  }
}

export async function deleteRecord(table: string, id: string, email?: string): Promise<void> {
  console.log(`[DEBUG] Deleting from ${table} | ID: ${id} | Email: ${email}`);
  
  try {
    // Try ID first. We use .select() to check if a row was actually deleted.
    const { data, error } = await supabase.from(table).delete().eq('id', id).select();
    
    // If no error but 0 rows deleted, it might be an RLS policy blocking DELETE but allowing UPDATE.
    if (!error && data && data.length === 0) {
      console.warn(`[DEBUG] 0 rows deleted from ${table}, possibly blocked by RLS. Attempting soft delete...`);
      if (table === 'leads') {
        await supabase.from(table).update({ name: '__DELETED__' }).eq('id', id);
      }
    }

    if (error) {
      console.warn("Delete by ID failed, trying by email...", error.message);
      
      // Fallback to Email if provided and not a generic email
      if (email && table === 'leads' && email !== 'recrutement@beya.ma') {
        await supabase.from(table).delete().eq('email', email);
      }
    }
  } catch (err) {
    console.error("Network or SDK error during delete:", err);
  }

  // ✅ Keep track of deleted IDs locally to permanently hide them
  try {
    const deletedIdsRaw = localStorage.getItem('textrack_deleted_ids');
    const deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('textrack_deleted_ids', JSON.stringify(deletedIds));
    }
  } catch (e) {}

  // ✅ Invalidate caches on success
  localStorage.removeItem(`textrack_data_${table}`);
  delete _cache[table];

  if (table === 'leads') {
    try {
      const local = safeStorage.getItem('textrack_leads');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const updated = parsed.filter((l: any) => l.id !== id);
          safeStorage.setItem('textrack_leads', JSON.stringify(updated));
        }
      }
    } catch(e) {}
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
