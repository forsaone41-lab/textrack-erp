import { supabase, isJwtExpiredError, recoverExpiredJwt } from './supabase';
export { isJwtExpiredError, recoverExpiredJwt };

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
  tissuRecommande?: string;
  createdAt: string;
  photo?: string;
  patronagePhoto?: string;
  patronageFileName?: string;
  fit?: string;
  complexity?: string;
  costEstimate?: string;
  clientId?: string;
  modelisteId?: string;
  aiNotes?: string;
  tissuPhoto?: string;
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
  prixEchantillon?: number;
  avance?: number;
  rebut: number;
  statut: 'echantillon_en_cours' | 'echantillon_valide' | 'en_cours' | 'terminé' | 'livré' | 'annulation_demandee' | 'annulé';
  annulationRaison?: string;
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
  sampleFeedback?: {
    rating: number;
    fabricNotes?: string;
    sizeNotes?: string;
    useSizeTable?: boolean;
    sizeTableNotes?: Record<string, string>;
    generalNotes?: string;
    approved: boolean;
  };
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
  client?: string;
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

export interface EmployeFaute {
  id: string;
  date: string;
  titre: string;
  description?: string;
  degre: 'mineure' | 'avertissement' | 'grave';
  decision?: string;
  auteur?: string;
}

export interface EmployeDocument {
  id: string;
  type: 'cin' | 'contrat' | 'casier' | 'medical' | 'rib' | 'photo' | 'cnss' | 'diplome' | 'autre';
  nom: string;
  fourni: boolean;
  fileUrl?: string;
  dateMaj?: string;
  remarques?: string;
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
  remunerationType?: 'mensuel' | 'hebdomadaire' | 'tache' | 'horaire' | 'modele';
  pin_code?: string;
  adresse?: string;
  photo?: string;
  matricule?: string;
  dateExpiration?: string;
  signature?: string;
  // Dossier Personnel RH fields:
  dateEmbauche?: string;
  dateNaissance?: string;
  cnss?: string;
  dossierValide?: boolean;
  fautes?: EmployeFaute[];
  documents?: EmployeDocument[];
  notesRH?: string;
}

export interface Fournisseur {
  id: string;
  nom: string;
  type: 'tissu' | 'fourniture' | 'machine' | 'autre';
  telephone?: string;
  email?: string;
  adresse?: string;
  notes?: string;
  dateCreation: string;
  hasBoutique?: boolean;
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

export interface Reclamation {
  id: string;
  employeId: string;
  employeNom: string;
  target?: 'chef' | 'worker';
  sujet: string;
  description: string;
  dateReclamation: string;
  statut: 'en_attente' | 'traite';
  reponse?: string;
  dateReponse?: string;
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
  preuveClient?: string;
  date: string;
  echeance: string;
  statut: 'payée' | 'en_attente' | 'impayée' | 'en_verification';
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
  role: 'admin' | 'superadmin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire' | 'chef_chaine' | 'commercial' | 'merchant' | 'affiliate';
  email: string;
  telephone?: string;
  password?: string;
  pinCode?: string;
  lastActive?: string;
  employeId?: string;
  photo?: string;
  ville?: string;
  adresse?: string;
  notes?: string;
  emailVerified?: boolean;
  brandName?: string;
  networkProfileCompleted?: boolean;
  networkRole?: 'brand' | 'supplier' | 'modeliste' | 'imprimeur';
  networkBio?: string;
}

// ─── Affiliate Program ────────────────────────────────────────
export interface Affiliate {
  id: string; // uuid, matches auth.users(id)
  full_name: string;
  email: string;
  phone?: string;
  referral_code: string;
  tracks: ('builder' | 'reseller' | 'supplier' | 'atelier')[];
  status: 'pending' | 'approved' | 'suspended';
  commission_rate_builder_setup: number;
  commission_rate_builder_recurring: number;
  commission_rate_reseller: number;
  commission_rate_supplier: number;
  commission_rate_atelier: number;
  payout_method?: string;
  payout_details?: Record<string, unknown>;
  // Directory profile (only used by 'supplier' / 'atelier' tracks)
  business_name?: string;
  category?: string;
  description?: string;
  city?: string;
  whatsapp?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateResale {
  id: string;
  affiliate_id: string;
  client_name: string;
  client_email?: string;
  product: string;
  sale_amount: number;
  store_id?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface AffiliateDeal {
  id: string;
  affiliate_id: string;
  deal_type: 'supplier' | 'atelier';
  counterparty_name: string;
  counterparty_contact?: string;
  amount: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  track: 'builder' | 'reseller' | 'supplier' | 'atelier';
  source_type: 'store_setup' | 'store_recurring' | 'resale' | 'deal';
  source_id?: string;
  amount: number;
  rate_applied?: number;
  base_amount?: number;
  period?: string;
  status: 'pending' | 'approved' | 'paid' | 'void';
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  amount: number;
  commission_ids: string[];
  status: 'requested' | 'approved' | 'paid' | 'rejected';
  method?: string;
  admin_note?: string;
  requested_at: string;
  processed_at?: string;
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

// ─── Tarifs ───────────────────────────────────────────────────
export interface TarifService {
  id: string;
  titre: string;
  categorie: 'Confection' | 'Impression' | 'Broderie' | 'Finition' | 'Matière Première' | 'Autre';
  prixMin: number;
  prixMax?: number;
  unite: 'Pièce' | 'Mètre' | 'Logo' | 'Heure' | 'Forfait';
  description?: string;
  actif: boolean;
}

// ─── Permissions ────────────────────────────────────────────
export type AppPage =
  | 'dashboard' | 'fiches' | 'ordres' | 'chaine' | 'stocks' | 'pilotage' | 'scan_production'
  | 'rh' | 'commandes' | 'clients' | 'factures' | 'charges' | 'bilan' | 'fast_scanner'
  | 'pointage' | 'portail_client' | 'performance' | 'utilisateurs' | 'parametres' | 'demandes'
  | 'worker_portal' | 'controle_qualite' | 'partenaire_portal' | 'agenda' | 'notifications' | 'ai_space' | 'crm' | 'chef_chaine_portal' | 'validation'
  | 'inbox' | 'gmail' | 'plaintes' | 'fournisseurs' | 'achats' | 'visio' | 'tarifs' | 'tarifs_edit' | 'devis' | 'recus' | 'evaluation_patronage' | 'commercial_portal' | 'store_plans' | 'atelier_calculator' | 'affiliate_admin' | 'patronage_ai' | 'suivi_modeliste' | 'balance_paie';

export type RolePermMap = Record<'admin' | 'pointeur' | 'client' | 'worker' | 'coupeur' | 'modeliste' | 'controleur' | 'agent_pointage' | 'partenaire' | 'chef_chaine' | 'commercial', AppPage[]>;

export const DEFAULT_PERMISSIONS: RolePermMap = {
  admin: ['dashboard', 'demandes', 'crm', 'evaluation_patronage', 'patronage_ai', 'fiches', 'ordres', 'chaine', 'pilotage', 'scan_production', 'stocks', 'rh', 'balance_paie', 'commandes', 'clients', 'factures', 'devis', 'recus', 'charges', 'bilan', 'fast_scanner', 'pointage', 'portail_client', 'performance', 'utilisateurs', 'parametres', 'worker_portal', 'controle_qualite', 'partenaire_portal', 'agenda', 'notifications', 'ai_space', 'chef_chaine_portal', 'inbox', 'gmail', 'plaintes', 'fournisseurs', 'achats', 'visio', 'tarifs', 'tarifs_edit', 'commercial_portal', 'store_plans', 'atelier_calculator', 'affiliate_admin', 'suivi_modeliste'],
  pointeur: ['dashboard', 'fiches', 'ordres', 'chaine', 'pilotage', 'scan_production', 'pointage', 'performance', 'worker_portal', 'controle_qualite'],
  client: ['portail_client'],
  worker: ['worker_portal'],
  coupeur: ['ordres', 'patronage_ai'],
  modeliste: ['evaluation_patronage', 'suivi_modeliste'],
  controleur: ['scan_production', 'controle_qualite', 'worker_portal'],
  agent_pointage: ['pointage', 'rh', 'balance_paie'],
  partenaire: ['partenaire_portal'],
  chef_chaine: ['chef_chaine_portal'],
  commercial: ['commercial_portal', 'crm', 'demandes', 'agenda', 'visio', 'ai_space', 'devis', 'recus']
};

const PERMISSIONS_VERSION = 17;

export function loadPermissions(): RolePermMap {
  try {
    let result = { ...DEFAULT_PERMISSIONS };

    // 1. Try to load from Company Profile (Cloud Synced)
    const profileRaw = localStorage.getItem('textrack_profile');
    if (profileRaw) {
      const profile = JSON.parse(profileRaw) as CompanyProfile;
      if (profile.permissions) {
        result = { ...result, ...profile.permissions };
      }
    }

    // 2. Load from local (legacy)
    const d = localStorage.getItem('textrack_permissions');
    if (d) {
      const parsed = JSON.parse(d) as RolePermMap & { _v?: number };
      if ((parsed._v ?? 1) >= PERMISSIONS_VERSION) {
        const keys: (keyof RolePermMap)[] = ['admin', 'pointeur', 'client', 'worker', 'coupeur', 'modeliste', 'controleur', 'agent_pointage', 'partenaire', 'chef_chaine', 'commercial'];
        keys.forEach(k => {
          if (parsed[k]) (result as any)[k] = parsed[k];
        });
      }
    }

    // 2b. Strict Role Security: Modéliste must NEVER have access to global fiches techniques or commercial pricing
    if (result.modeliste) {
      result.modeliste = result.modeliste.filter(p => p !== 'fiches' && p !== 'atelier_calculator');
      if (!result.modeliste.includes('suivi_modeliste')) result.modeliste.push('suivi_modeliste');
    }

    // 3. Ensure admin always has access to core new portals if they were missing in saved profiles
    if (result.admin) {
      if (!result.admin.includes('chef_chaine_portal')) result.admin.push('chef_chaine_portal');
      if (!result.admin.includes('tarifs')) result.admin.push('tarifs');
      if (!result.admin.includes('evaluation_patronage')) result.admin.push('evaluation_patronage');
      if (result.modeliste && !result.modeliste.includes('evaluation_patronage')) result.modeliste.push('evaluation_patronage');
      if (!result.admin.includes('devis')) result.admin.push('devis');
      if (!result.admin.includes('recus')) result.admin.push('recus');
      if (!result.admin.includes('inbox')) result.admin.push('inbox');
      if (!result.admin.includes('gmail')) result.admin.push('gmail');
      if (!result.admin.includes('plaintes')) result.admin.push('plaintes');
      if (!result.admin.includes('fournisseurs')) result.admin.push('fournisseurs');
      if (!result.admin.includes('achats')) result.admin.push('achats');
      if (!result.admin.includes('visio')) result.admin.push('visio');
      if (!result.admin.includes('tarifs')) result.admin.push('tarifs');
      if (!result.admin.includes('tarifs_edit')) result.admin.push('tarifs_edit');
      if (!result.admin.includes('devis')) result.admin.push('devis');
      if (!result.admin.includes('recus')) result.admin.push('recus');
      if (!result.admin.includes('commercial_portal')) result.admin.push('commercial_portal');
      if (!result.admin.includes('balance_paie')) result.admin.push('balance_paie');
    }
    if (result.agent_pointage && !result.agent_pointage.includes('balance_paie')) {
      result.agent_pointage.push('balance_paie');
    }
    
    return result;
  } catch { return DEFAULT_PERMISSIONS; }
}

export function savePermissions(perms: RolePermMap): void {
  localStorage.setItem('textrack_permissions', JSON.stringify({ ...perms, _v: PERMISSIONS_VERSION }));
  
  // Sync to Company Profile
  try {
    const profileRaw = localStorage.getItem('textrack_profile');
    if (profileRaw) {
      const profile = JSON.parse(profileRaw) as CompanyProfile;
      profile.permissions = perms;
      localStorage.setItem('textrack_profile', JSON.stringify(profile));
      saveCompanyProfile(profile).catch(() => {});
    }
  } catch(e) {}
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
  cachetUrl?: string;
  address: string;
  ice: string;
  rc: string;
  if_tax: string;
  patente: string;
  phone: string;
  email: string;
  bankName?: string;
  rib?: string;
  bankBeneficiary?: string;
  bankQrCode?: string;
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
  faq?: FaqItem[];
  services?: ServiceItem[];
  metaPixelId?: string;
  permissions?: RolePermMap;
  heureLimiteRetard?: string;
  storeProPrice?: string;
  storePremiumPrice?: string;
}

export interface FaqItem {
  id: string;
  emoji: string;
  questionFr: string;
  questionAr: string;
  answerFr: string;
  answerAr: string;
  category: 'prix' | 'delai' | 'services' | 'contact' | 'qualite' | 'autre';
}

export interface ServiceItem {
  id: string;
  labelFr: string;
  labelAr: string;
  available: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  ville: string;
  type: string;
  quantity: number;
  details?: string;
  tailles?: Record<string, number>;
  date: string;
  status: 'new' | 'completed';
  photo?: string;
  photos?: string[];
  photoCount?: number;
  cv?: string;
  email?: string;
  contactedAt?: string;
  contactedType?: string;
  contactedBy?: string;
  crmStage?: 'nouveau' | 'contact_en_cours' | 'rdv_fixe' | 'attente_confirmation' | 'confirme' | 'annule';
  crmContactMethod?: 'appel' | 'live' | 'visite' | 'whatsapp';
  crmRdvDate?: string;
  crmNotes?: string;
  crmPrice?: number;
  crmDevisMode?: 'echantillon' | 'commande';
  crmPriceConfirmed?: boolean;
  crmPriority?: boolean;
  rejectedAt?: string;
  aiNotes?: string;
  patronageStatus?: 'en_attente' | 'en_cours' | 'termine' | 'priced';
  patronagePrice?: number;
  commercialUnlocked?: boolean;
  prixEchantillon?: number;
  patronageNotes?: string;
  // Atelier Client Devis & Response fields
  modeleReel?: string;
  unitPrice?: number;
  totalPrice?: number;
  tissuSuggere?: string;
  techDetails?: string;
  delaiEstime?: string;
  reponseAtelier?: string;
  reponseAtelierDate?: string;
  statusProgression?: 'reception' | 'etude' | 'echantillon' | 'production' | 'pret';
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
  cachetUrl: '',
  address: 'Sidi Said, Meknes 50000, Morocco',
  ice: '000000000000000',
  rc: '123456',
  if_tax: '0000000',
  patente: '00000000',
  phone: '+212 6 00 00 00 00',
  email: 'contact@beyacreative.ma',
  bankName: 'CIH BANK',
  rib: '230 000 0000000000000000 00',
  bankBeneficiary: 'BEYA CREATIVE',
  metaPixelId: '',
  heureLimiteRetard: '09:15'
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
    
    // Migration for FAQ MOQ rule (force update if it matches old text)
    let needsMigration = false;
    if (merged.faq && Array.isArray(merged.faq)) {
      merged.faq = merged.faq.map((item: any) => {
        if (item.id === '2' && item.answerFr && (item.answerFr.includes('20 pièces par modèle') || item.answerFr.includes('50 pièces par modèle'))) {
          needsMigration = true;
          return {
            ...item,
            answerFr: 'Notre minimum de commande est de 100 pièces au total, avec un minimum strict de 20 pièces par couleur. Nous ne produisons pas moins de 20 pièces par couleur. Pour les échantillons, on peut descendre à 1 pièce.',
            answerAr: 'الحد الأدنى للطلب هو 100 قطعة إجمالاً، مع توفير 20 قطعة كحد أدنى لكل لون. لا نقوم بإنتاج أقل من 20 قطعة للون الواحد. للعينات يمكن طلب قطعة واحدة.'
          };
        }
        return item;
      });
    }

    if (needsMigration) {
      try {
        safeStorage.setItem('textrack_profile', JSON.stringify(merged));
      } catch (e) {}
    }

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

export async function syncListeAttente(): Promise<any[]> {
  try {
    // 1. Fetch individual test candidates
    const { data: leads } = await supabase.from('leads').select('*').eq('type', '__EN_TEST__');
    
    // 2. Fetch the old array system if it exists (for migration)
    const { data: oldSystem } = await supabase.from('leads').select('*').eq('name', '__SYSTEM_LISTE_ATTENTE__');
    if (oldSystem && oldSystem.length > 0) {
      for (const sys of oldSystem) {
        try {
          const oldData = JSON.parse(sys.details || '[]');
          for (const c of oldData) {
            await pushCandidatToCloud(c);
          }
        } catch(e) {}
        // Delete the old system row
        await supabase.from('leads').delete().eq('id', sys.id);
      }
      return syncListeAttente();
    }
    
    // 3. Map leads back to WaitlistedCandidate format
    const candidates = (leads || []).map(lead => {
      let extra: any = {};
      try { extra = JSON.parse(lead.details || '{}'); } catch(e){}
      return {
        id: lead.id,
        nom: lead.name.split(' ').slice(1).join(' ') || lead.name,
        prenom: lead.name.split(' ')[0],
        telephone: lead.phone,
        poste: lead.ville,
        dateAjout: lead.date,
        notes: extra.notes,
        confirmedBy: extra.confirmedBy,
        chefFeedback: extra.chefFeedback || 'pending'
      };
    });
    
    localStorage.setItem('textrack_liste_attente', JSON.stringify(candidates));
    return candidates;
  } catch(e) {
    console.error("Failed to sync liste attente", e);
    return JSON.parse(localStorage.getItem('textrack_liste_attente') || '[]');
  }
}

export async function pushCandidatToCloud(c: any): Promise<void> {
  try {
    const lead = {
      id: c.id,
      name: `${c.prenom} ${c.nom}`.trim(),
      phone: c.telephone,
      ville: c.poste,
      type: '__EN_TEST__',
      status: '__EN_TEST__',
      date: c.dateAjout,
      details: JSON.stringify({
        notes: c.notes,
        confirmedBy: c.confirmedBy,
        chefFeedback: c.chefFeedback
      })
    };
    await saveRecord('leads', lead, true);
    
    // Update local cache
    const current = JSON.parse(localStorage.getItem('textrack_liste_attente') || '[]');
    const updated = current.filter((x: any) => x.id !== c.id);
    updated.push(c);
    localStorage.setItem('textrack_liste_attente', JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to push candidat", e);
  }
}

// ─── Reclamations (Complaints) ───────────────────────────────
export async function loadReclamations(): Promise<Reclamation[]> {
  try {
    const { data } = await supabase.from('leads').select('*').eq('type', '__RECLAMATION__');
    if (!data) return [];
    
    const deletedIdsRaw = localStorage.getItem('textrack_deleted_ids');
    const deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
    
    return data
      .filter(l => l.name !== '__DELETED__' && !deletedIds.includes(l.id))
      .map(l => {
      let details: any = {};
      try { details = JSON.parse(l.details || '{}'); } catch(e){}
      return {
        id: l.id,
        employeId: details.employeId || l.phone,
        employeNom: l.name,
        target: details.target,
        sujet: details.sujet || 'Sans sujet',
        description: details.description || '',
        dateReclamation: l.date,
        statut: l.status as 'en_attente' | 'traite',
        reponse: details.reponse,
        dateReponse: details.dateReponse
      };
    }).sort((a, b) => new Date(b.dateReclamation).getTime() - new Date(a.dateReclamation).getTime());
  } catch (e) {
    console.error("Failed to load reclamations", e);
    return [];
  }
}

export async function saveReclamation(rec: Reclamation): Promise<void> {
  try {
    const lead = {
      id: rec.id,
      name: rec.employeNom,
      phone: '0000',
      ville: 'SYSTEM',
      type: '__RECLAMATION__',
      status: rec.statut,
      date: rec.dateReclamation,
      quantity: 0,
      details: JSON.stringify({
        employeId: rec.employeId,
        target: rec.target,
        sujet: rec.sujet,
        description: rec.description,
        reponse: rec.reponse,
        dateReponse: rec.dateReponse
      })
    };
    
    // RLS Policy blocks upsert/update, so we must delete and re-insert
    await supabase.from('leads').delete().eq('id', rec.id);
    const { error } = await supabase.from('leads').insert(lead);
    
    if (error) {
      console.error("Erreur d'insertion reclamation:", error);
      throw error;
    }
  } catch (e) {
    console.error("Failed to save reclamation", e);
  }
}


// ─── Fournisseurs ──────────────────────────────────────────
export async function loadFournisseurs(): Promise<Fournisseur[]> {
  try {
    const { data } = await supabase.from('leads').select('*').eq('type', '__FOURNISSEUR__');
    if (!data) return [];
    
    return data.map(l => {
      let details: any = {};
      try { details = JSON.parse(l.details || '{}'); } catch(e){}
      return {
        id: l.id,
        nom: l.name,
        type: details.type || 'tissu',
        telephone: l.phone,
        email: details.email || '',
        adresse: l.ville,
        notes: details.notes || '',
        dateCreation: l.date
      };
    }).sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  } catch (e) {
    console.error("Failed to load fournisseurs", e);
    return [];
  }
}

export async function saveFournisseur(f: Fournisseur): Promise<void> {
  try {
    const lead = {
      id: f.id,
      name: f.nom,
      phone: f.telephone || '',
      ville: f.adresse || '',
      type: '__FOURNISSEUR__',
      status: 'completed',
      date: f.dateCreation,
      quantity: 0,
      details: JSON.stringify({
        type: f.type,
        email: f.email,
        notes: f.notes
      })
    };
    // RLS Policy blocks upsert/update, so we must delete and re-insert
    await supabase.from('leads').delete().eq('id', f.id);
    const { error } = await supabase.from('leads').insert(lead);
    
    if (error) {
      console.error("Erreur d'insertion fournisseur:", error);
      throw error;
    }
  } catch (e) {
    console.error("Failed to save fournisseur", e);
  }
}

export async function deleteFournisseur(id: string): Promise<void> {
  await deleteRecord('leads', id);
}

export async function deleteCandidatFromCloud(id: string): Promise<void> {
  try {
    await supabase.from('leads').delete().eq('id', id);
    const current = JSON.parse(localStorage.getItem('textrack_liste_attente') || '[]');
    const updated = current.filter((x: any) => x.id !== id);
    localStorage.setItem('textrack_liste_attente', JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete candidat", e);
  }
}

export async function loadLeads(): Promise<Lead[]> {
  try {
    // Get deleted IDs to exclude
    let deletedIds: string[] = [];
    try {
      const raw = localStorage.getItem('textrack_deleted_ids');
      if (raw) deletedIds = JSON.parse(raw) || [];
    } catch (_) {}

    // 1. Load from Supabase — lightweight columns (exclude massive base64 photo blobs and filter out heavy system config rows to avoid statement timeout)
    const LEADS_COLS = 'id, name, phone, phone2, ville, type, quantity, details, tailles, date, status, email, contactedAt, contactedType, contactedBy, crmStage, crmContactMethod, crmRdvDate, crmNotes, crmPrice, crmPriceConfirmed, photoCount, crmDevisMode, crmPriority, rejectedAt';
    let supaData: any[] | null = null;
    let error: any = null;

    let res = await supabase
      .from('leads')
      .select(LEADS_COLS)
      .not('name', 'in', '(__SYSTEM_CONFIG__,__WORKER_PHOTO__,__SYSTEM_LISTE_ATTENTE__,__DELETED__,__RH_PAIE_RULE__,__RH_MODEL_LOG__,__RH_PAIE_ADJ__)')
      .order('date', { ascending: false });

    if (res.error && isJwtExpiredError(res.error)) {
      console.warn('[loadLeads] JWT expired error, recovering session and retrying...');
      await recoverExpiredJwt();
      res = await supabase
        .from('leads')
        .select(LEADS_COLS)
        .not('name', 'in', '(__SYSTEM_CONFIG__,__WORKER_PHOTO__,__SYSTEM_LISTE_ATTENTE__,__DELETED__,__RH_PAIE_RULE__,__RH_MODEL_LOG__,__RH_PAIE_ADJ__)')
        .order('date', { ascending: false });
    }

    if (res.error) {
      console.warn('[loadLeads] Direct select failed, trying fallback range query:', res.error.message);
      const fallbackRes = await supabase
        .from('leads')
        .select(LEADS_COLS)
        .not('name', 'in', '(__SYSTEM_CONFIG__,__WORKER_PHOTO__,__SYSTEM_LISTE_ATTENTE__,__DELETED__,__RH_PAIE_RULE__,__RH_MODEL_LOG__,__RH_PAIE_ADJ__)')
        .order('date', { ascending: false })
        .range(0, 499);
      if (!fallbackRes.error && fallbackRes.data) {
        supaData = fallbackRes.data;
        error = null;
      } else {
        error = res.error;
      }
    } else {
      supaData = res.data;
    }

    if (error) console.error('[loadLeads] Supabase error:', error.message, error.code);

    // 2. Load from BOTH localStorage keys (old + new format)
    let localLeads: Lead[] = [];
    try {
      const oldRaw = safeStorage.getItem('textrack_leads');
      const newRaw = safeStorage.getItem('textrack_data_leads');
      const old = oldRaw ? JSON.parse(oldRaw) : [];
      const newCache = newRaw ? JSON.parse(newRaw) : [];
      const combined = [...(Array.isArray(old) ? old : []), ...(Array.isArray(newCache) ? newCache : [])];
      localLeads = combined.filter((l: any) => l && l.id && l.name && l.name !== '__SYSTEM_CONFIG__' && l.name !== '__SYSTEM_LISTE_ATTENTE__' && l.name !== '__WORKER_PHOTO__' && !String(l.name).startsWith('__RH_') && l.type !== '__EN_TEST__' && l.type !== '__CLIENT_CITY__' && !deletedIds.includes(l.id));
    } catch (_) {}

    // 3. Merge: Supabase takes priority, add localStorage-only leads
    let finalData: Lead[] = [];
    if (!error && Array.isArray(supaData)) {
      // Filter system/deleted records client-side
      const cleanSupaData = supaData.filter((l: any) =>
        l && l.id && l.name &&
        l.name !== '__WORKER_PHOTO__' &&
        l.name !== '__SYSTEM_CONFIG__' &&
        l.name !== '__SYSTEM_LISTE_ATTENTE__' &&
        l.name !== '__DELETED__' &&
        !String(l.name).startsWith('__RH_') &&
        l.type !== '__EN_TEST__' &&
        l.type !== '__CLIENT_CITY__' &&
        !deletedIds.includes(l.id)
      ).map((l: any) => parseLeadMeta(l));

      // If Supabase returns 0 but localStorage has data → fallback
      if (cleanSupaData.length === 0 && localLeads.length > 0) {
        console.warn('Supabase returned 0 clean leads, using localStorage fallback.');
        finalData = localLeads.map((l: any) => { const c = {...l}; delete c.photo; return c; });
        finalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        safeStorage.setItem('textrack_data_leads', JSON.stringify(finalData));
        _cache['leads'] = { data: finalData, ts: Date.now() };
        return finalData;
      }
      // Strip photos from Supabase data
      cleanSupaData.forEach((l: any) => { delete l.photo; });
      supaData.splice(0, supaData.length, ...cleanSupaData);
      const supaIds = new Set(supaData.map((l: any) => l.id));
      // Add leads from localStorage that are NOT in Supabase (missing leads!)
      const missingLocal = localLeads.filter(l => !supaIds.has(l.id) && !deletedIds.includes(l.id));
      finalData = [...supaData, ...missingLocal.map((l: any) => { const c = {...l}; delete c.photo; delete c.photos; return c; })];
      // Sync missing leads back to Supabase safely in background
      if (missingLocal.length > 0) {
        console.log(`Recovering ${missingLocal.length} leads missing from Supabase...`);
        // Do not block the UI or flood the network. Just take top 50 to sync per session.
        const toSync = missingLocal.slice(0, 50);
        setTimeout(async () => {
          for (const lead of toSync) {
            await saveRecord('leads', lead, true).catch(() => {});
            await new Promise(r => setTimeout(r, 200)); // sleep 200ms
          }
        }, 3000);
      }
    } else {
      // Supabase failed — use localStorage only
      finalData = localLeads.map((l: any) => { const c = {...l}; delete c.photo; delete c.photos; return c; });
    }

    // Filter deleted
    finalData = finalData.filter(l => !deletedIds.includes(l.id));
    // Sort by date desc
    finalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Update cache
    safeStorage.setItem('textrack_data_leads', JSON.stringify(finalData));
    _cache['leads'] = { data: finalData, ts: Date.now() };
    return finalData;
  } catch (err) {
    console.error("Error in loadLeads:", err);
    // Emergency fallback
    try {
      const raw = safeStorage.getItem('textrack_leads') || safeStorage.getItem('textrack_data_leads');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((l: any) => l && l.name !== '__SYSTEM_CONFIG__' && !String(l.name || '').startsWith('__RH_') && l.type !== '__CLIENT_CITY__') : [];
    } catch { return []; }
  }
}

export function parseLeadDetailsJson(rawDetails?: string | null): Record<string, any> {
  if (!rawDetails || typeof rawDetails !== 'string') return {};
  const clean = rawDetails
    .replace('| COM_UNLOCK:true', '')
    .split('| AI_NOTES:')[0]
    .split('| ATELIER_DEVIS:')[0]
    .trim();
  if (!clean || !clean.startsWith('{')) return {};
  try {
    const parsed = JSON.parse(clean);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function parseLeadMeta(l: any): Lead {
  const item = { ...l };
  if (item.details && typeof item.details === 'string') {
    if (item.details.includes('| COM_UNLOCK:true')) {
      item.commercialUnlocked = true;
      item.details = item.details.replace('| COM_UNLOCK:true', '');
    }
    if (item.details.includes('| ATELIER_DEVIS:')) {
      try {
        const parts = item.details.split('| ATELIER_DEVIS:');
        item.details = parts[0];
        const devisJsonStr = parts.slice(1).join('| ATELIER_DEVIS:').split('| AI_NOTES:')[0];
        const parsed = JSON.parse(devisJsonStr);
        if (parsed && typeof parsed === 'object') {
          if (parsed.modeleReel) item.modeleReel = parsed.modeleReel;
          if (parsed.unitPrice) item.unitPrice = Number(parsed.unitPrice);
          if (parsed.totalPrice) item.totalPrice = Number(parsed.totalPrice);
          if (parsed.tissuSuggere) item.tissuSuggere = parsed.tissuSuggere;
          if (parsed.techDetails) item.techDetails = parsed.techDetails;
          if (parsed.delaiEstime) item.delaiEstime = parsed.delaiEstime;
          if (parsed.statusProgression) item.statusProgression = parsed.statusProgression;
          if (parsed.reponseAtelier) item.reponseAtelier = parsed.reponseAtelier;
          if (parsed.reponseAtelierDate) item.reponseAtelierDate = parsed.reponseAtelierDate;
          if (parsed.patronagePrice) item.patronagePrice = Number(parsed.patronagePrice);
          if (parsed.prixEchantillon) item.prixEchantillon = Number(parsed.prixEchantillon);
        }
      } catch (e) {
        console.error('Error parsing ATELIER_DEVIS:', e);
      }
    }
    if (item.details.includes('| AI_NOTES:')) {
      const parts = item.details.split('| AI_NOTES:');
      item.details = parts[0];
      item.aiNotes = parts.slice(1).join('| AI_NOTES:');
    }
  }
  if (!item.unitPrice && item.crmPrice && Number(item.crmPrice) > 0) {
    item.unitPrice = Number(item.crmPrice);
  }
  return item;
}

export async function loadClientLeads(user: { nom: string; email?: string; telephone?: string; brandName?: string }, extraNames: string[] = []): Promise<Lead[]> {
  if (!user || (!user.nom && !user.email && !user.telephone && extraNames.length === 0)) return [];

  const LEADS_COLS = 'id, name, phone, phone2, ville, type, quantity, details, tailles, date, status, email, contactedAt, contactedType, contactedBy, crmStage, crmContactMethod, crmRdvDate, crmNotes, crmPrice, crmPriceConfirmed, photoCount, crmDevisMode, crmPriority, rejectedAt';

  const nameCandidates = Array.from(new Set([
    user.nom,
    user.brandName,
    ...extraNames
  ].map(n => (n || '').trim()).filter(Boolean)));

  const filterParts: string[] = [];
  nameCandidates.forEach(n => {
    filterParts.push(`name.ilike.${n}`);
  });
  if (user.email && user.email.trim()) {
    filterParts.push(`email.ilike.${user.email.trim()}`);
  }
  const cleanDigits = (user.telephone || '').replace(/\D/g, '');
  if (user.telephone && user.telephone.trim()) {
    filterParts.push(`phone.eq.${user.telephone.trim()}`);
  }
  if (cleanDigits.length >= 9) {
    filterParts.push(`phone.ilike.*${cleanDigits.slice(-9)}`);
  }

  const orFilter = Array.from(new Set(filterParts)).join(',');

  let remoteLeads: any[] = [];

  // 1. Direct targeted Supabase query (super fast, hits client indexes in < 300ms)
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(LEADS_COLS)
      .or(orFilter)
      .order('date', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      remoteLeads = data;
    }
  } catch (_) {}

  // 2. Direct REST API fallback (immune to JWT session locks, client timeouts, or browser client issues)
  if (!remoteLeads || remoteLeads.length === 0) {
    try {
      const url = `https://cyduteruvmpefvemeutm.supabase.co/rest/v1/leads?or=(${encodeURIComponent(orFilter)})&select=${encodeURIComponent(LEADS_COLS)}&order=date.desc`;
      const res = await fetch(url, {
        headers: {
          'apikey': 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr',
          'Authorization': 'Bearer sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr'
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          remoteLeads = rows;
        }
      }
    } catch (_) {}
  }

  // 3. Local storage fallback and merge
  let localLeads: Lead[] = [];
  try {
    const raw = safeStorage.getItem('textrack_leads') || safeStorage.getItem('textrack_data_leads');
    const cityRaw = safeStorage.getItem('textrack_client_city_records');
    const combinedLocal = [
      ...(raw ? (JSON.parse(raw) || []) : []),
      ...(cityRaw ? (JSON.parse(cityRaw) || []) : [])
    ];
    if (Array.isArray(combinedLocal)) {
      const targetPhoneSuffix = (user.telephone || '').replace(/\D/g, '').slice(-9);
      localLeads = combinedLocal.filter((l: any) => {
        if (!l || !l.id || !l.name) return false;
        const leadPhoneSuffix = (l.phone || '').replace(/\D/g, '').slice(-9);
        return (
          (user.nom && (l.name || '').trim().toLowerCase() === user.nom.trim().toLowerCase()) ||
          (user.email && (l.email || '').trim().toLowerCase() === user.email.trim().toLowerCase()) ||
          (user.telephone && (l.phone || '').trim() === user.telephone.trim()) ||
          (targetPhoneSuffix.length >= 9 && leadPhoneSuffix === targetPhoneSuffix)
        );
      });
    }
  } catch (_) {}

  // 4. Merge unique leads by ID
  const map: Record<string, Lead> = {};
  remoteLeads.forEach((l: any) => {
    if (l && l.id && !l.name?.startsWith('__')) {
      map[l.id] = parseLeadMeta(l);
    }
  });
  localLeads.forEach((l: any) => {
    if (l && l.id && !map[l.id] && !l.name?.startsWith('__')) {
      map[l.id] = parseLeadMeta(l);
    }
  });

  const finalLeads = Object.values(map).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  // 5. Update local cache
  try {
    const existingRaw = localStorage.getItem('textrack_data_leads');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const merged = [...finalLeads, ...(Array.isArray(existing) ? existing.filter((e: any) => !map[e.id]) : [])];
    localStorage.setItem('textrack_data_leads', JSON.stringify(merged.slice(0, 50)));
  } catch (_) {}

  return finalLeads;
}

export const CLIENT_CITY_LEAD_TYPE = '__CLIENT_CITY__';

export function isClientPortalDemandLead(l?: Partial<Lead> | null): boolean {
  if (!l) return false;
  const t = (l.type || '').trim();
  return t !== '__MESSAGE__' && t !== '__MESSAGE_REPLY__' && t !== CLIENT_CITY_LEAD_TYPE && t !== '__EN_TEST__';
}

function normalizeCityIdentityPhone(p?: string | null): string {
  const digits = (p || '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : digits;
}

function doesCityRecordMatchTarget(
  rec: Partial<Lead>,
  target?: { id?: string; nom?: string; name?: string; email?: string; telephone?: string; phone?: string }
): boolean {
  if (!rec || !target) return false;
  const recEmail = (rec.email || '').trim().toLowerCase();
  const targetEmail = (target.email || '').trim().toLowerCase();
  if (recEmail && targetEmail && recEmail === targetEmail) return true;

  const recPhone = normalizeCityIdentityPhone(rec.phone);
  const targetPhone = normalizeCityIdentityPhone(target.telephone || target.phone);
  if (recPhone && targetPhone && recPhone.length >= 9 && recPhone === targetPhone) return true;

  const recName = (rec.name || (rec as any).client || '').trim().toLowerCase();
  const targetName = (target.nom || target.name || '').trim().toLowerCase();
  if (recName && targetName && recName === targetName) return true;

  return false;
}

export function extractClientCityFromLeads(
  leads: Lead[],
  target?: { id?: string; nom?: string; name?: string; email?: string; telephone?: string; phone?: string; ville?: string },
  users: Partial<User>[] = []
): string {
  const sorted = [...(leads || [])].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  // 1. Canonical cloud city selection saved by client or admin (__CLIENT_CITY__) takes top priority
  const cityMetaRec = sorted.find(
    l => l.type === CLIENT_CITY_LEAD_TYPE && l.ville && l.ville.trim() && (!target || doesCityRecordMatchTarget(l, target))
  );
  if (cityMetaRec?.ville?.trim()) return cityMetaRec.ville.trim();

  // 2. Explicit target.ville or matching user.ville
  if (target?.ville?.trim()) return target.ville.trim();
  if (target && users.length > 0) {
    const matchedUser = users.find(u =>
      (target.id && u.id === target.id) ||
      (target.email && u.email && u.email.trim().toLowerCase() === target.email.trim().toLowerCase()) ||
      ((target.nom || target.name) && u.nom && u.nom.trim().toLowerCase() === (target.nom || target.name || '').trim().toLowerCase())
    );
    const uVille = (matchedUser?.ville || (matchedUser as any)?.city || '').trim();
    if (uVille) return uVille;
  }

  // 3. Fallback to most recent real demand lead with non-empty ville
  const demandWithCity = sorted.find(
    l => isClientPortalDemandLead(l) && l.ville && l.ville.trim() && (!target || doesCityRecordMatchTarget(l, target))
  );
  return demandWithCity?.ville?.trim() || '';
}

export async function saveClientCityRecord(
  user: { id?: string; nom?: string; email?: string; telephone?: string },
  city: string
): Promise<Lead | null> {
  const cleanCity = (city || '').trim();
  if (!cleanCity) return null;

  const rawKey = (user.id || user.email || user.telephone || user.nom || 'client')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'client';
  const stableId = `city_${rawKey}`;
  const nowIso = new Date().toISOString();

  const cityLead: any = {
    id: stableId,
    name: (user.nom || user.email || user.telephone || 'Client').trim(),
    email: (user.email || '').trim().toLowerCase(),
    phone: (user.telephone || '').trim(),
    ville: cleanCity,
    type: CLIENT_CITY_LEAD_TYPE,
    status: 'completed',
    date: nowIso,
    quantity: 0,
    details: JSON.stringify({
      userId: user.id || '',
      city: cleanCity,
      updatedAt: nowIso
    })
  };

  // Persist locally immediately so refreshes/re-renders never lose it
  try {
    const raw = safeStorage.getItem('textrack_client_city_records');
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(existing)
      ? existing.filter(r => r && r.id !== stableId && !doesCityRecordMatchTarget(r, user))
      : [];
    filtered.unshift(cityLead);
    safeStorage.setItem('textrack_client_city_records', JSON.stringify(filtered.slice(0, 200)));
  } catch (_) {}

  // Persist to Supabase leads with multi-step fallback (upsert -> delete+insert -> unique insert)
  try {
    let { error } = await supabase.from('leads').upsert(cityLead);
    if (isJwtExpiredError(error)) {
      await recoverExpiredJwt();
      const retry = await supabase.from('leads').upsert(cityLead);
      error = retry.error;
    }

    if (error) {
      await supabase.from('leads').delete().eq('id', stableId);
      const insertRes = await supabase.from('leads').insert(cityLead);
      if (insertRes.error) {
        const uniqueLead = { ...cityLead, id: `${stableId}_${Date.now()}` };
        await supabase.from('leads').insert(uniqueLead);
        return uniqueLead as Lead;
      }
    }
  } catch (err) {
    console.warn('[saveClientCityRecord] Cloud sync warning:', err);
  }

  delete _cache['leads'];
  return cityLead as Lead;
}

export interface ClientCityResolver {
  cityRecords: Lead[];
  resolveCity: (
    target?: { id?: string; nom?: string; name?: string; email?: string; telephone?: string; phone?: string; ville?: string }
  ) => string;
}

export async function loadClientCityResolver(existingLeads: Lead[] = []): Promise<ClientCityResolver> {
  const CITY_COLS = 'id, name, email, phone, ville, type, date';
  let remoteRecords: Lead[] = [];

  try {
    let { data, error } = await supabase
      .from('leads')
      .select(CITY_COLS)
      .eq('type', CLIENT_CITY_LEAD_TYPE)
      .order('date', { ascending: false });

    if (isJwtExpiredError(error)) {
      await recoverExpiredJwt();
      const retry = await supabase
        .from('leads')
        .select(CITY_COLS)
        .eq('type', CLIENT_CITY_LEAD_TYPE)
        .order('date', { ascending: false });
      data = retry.data;
      error = retry.error;
    }

    if (!error && Array.isArray(data)) {
      remoteRecords = data as Lead[];
    } else {
      const url = `https://cyduteruvmpefvemeutm.supabase.co/rest/v1/leads?type=eq.${encodeURIComponent(CLIENT_CITY_LEAD_TYPE)}&select=${encodeURIComponent(CITY_COLS)}&order=date.desc`;
      const res = await fetch(url, {
        headers: {
          'apikey': 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr',
          'Authorization': 'Bearer sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr'
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) remoteRecords = rows as Lead[];
      }
    }
  } catch (_) {}

  let localRecords: Lead[] = [];
  try {
    const raw = safeStorage.getItem('textrack_client_city_records');
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) localRecords = parsed;
  } catch (_) {}

  // Merge remote & local __CLIENT_CITY__ records (keeping newest by date per ID)
  const mergedMap: Record<string, Lead> = {};
  localRecords.forEach(r => { if (r?.id) mergedMap[r.id] = r; });
  remoteRecords.forEach(r => {
    if (r?.id) {
      const prev = mergedMap[r.id];
      if (!prev || new Date(r.date || 0).getTime() >= new Date(prev.date || 0).getTime()) {
        mergedMap[r.id] = r;
      }
    }
  });

  const cityRecords = Object.values(mergedMap).sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  // Cache merged city records for faster subsequent loads
  try {
    if (cityRecords.length > 0) {
      safeStorage.setItem('textrack_client_city_records', JSON.stringify(cityRecords.slice(0, 200)));
    }
  } catch (_) {}

  const allLookupLeads = [...cityRecords, ...(existingLeads || [])];

  return {
    cityRecords,
    resolveCity: (target) => extractClientCityFromLeads(allLookupLeads, target)
  };
}

export async function loadLeadPhoto(leadId: string): Promise<string | null> {
  if (!leadId) return null;

  // 1. Try local storage cache first
  try {
    const cachedPhotosRaw = localStorage.getItem('textrack_lead_photos_cache');
    if (cachedPhotosRaw) {
      const cached = JSON.parse(cachedPhotosRaw);
      if (cached[leadId]) return cached[leadId];
    }
    const localRaw = safeStorage.getItem('textrack_leads') || safeStorage.getItem('textrack_data_leads');
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) {
        const found = parsed.find((l: any) => l && l.id === leadId);
        if (found?.photo) return found.photo;
        if (found?.photos && found.photos.length > 0) return found.photos[0];
      }
    }
  } catch {}

  // 2. Query Supabase Client
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('photo, photos')
      .eq('id', leadId)
      .maybeSingle();

    if (!error && data) {
      const photo = data.photo || (Array.isArray(data.photos) && data.photos.length > 0 ? data.photos[0] : null);
      if (photo) return photo;
    }
  } catch {}

  // 3. Guaranteed direct REST fetch (bypasses any expired tokens or browser client errors)
  try {
    const url = `https://cyduteruvmpefvemeutm.supabase.co/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}&select=photo,photos`;
    const res = await fetch(url, {
      headers: {
        'apikey': 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr',
        'Authorization': 'Bearer sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr'
      }
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0].photo || (Array.isArray(rows[0].photos) && rows[0].photos.length > 0 ? rows[0].photos[0] : null);
      }
    }
  } catch {}

  return null;
}

export async function loadLeadPhotos(leadId: string): Promise<{photo: string | null, photos: string[] | null}> {
  if (!leadId) return { photo: null, photos: null };

  try {
    const cachedPhotosRaw = localStorage.getItem('textrack_lead_photos_cache');
    if (cachedPhotosRaw) {
      const cached = JSON.parse(cachedPhotosRaw);
      if (cached[leadId]) return { photo: cached[leadId], photos: [cached[leadId]] };
    }
    const localRaw = safeStorage.getItem('textrack_leads') || safeStorage.getItem('textrack_data_leads');
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) {
        const found = parsed.find((l: any) => l && l.id === leadId);
        if (found?.photo || (found?.photos && found.photos.length > 0)) {
          const photo = found.photo || found.photos[0] || null;
          const photos = found.photos || (photo ? [photo] : null);
          return { photo, photos };
        }
      }
    }
  } catch {}

  try {
    const { data, error } = await supabase
      .from('leads')
      .select('photo, photos')
      .eq('id', leadId)
      .maybeSingle();

    if (!error && data) {
      const photo = data.photo || data.photos?.[0] || null;
      const photos = data.photos || (photo ? [photo] : null);
      if (photo) return { photo, photos };
    }
  } catch {}

  // Direct REST fetch fallback
  try {
    const url = `https://cyduteruvmpefvemeutm.supabase.co/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}&select=photo,photos`;
    const res = await fetch(url, {
      headers: {
        'apikey': 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr',
        'Authorization': 'Bearer sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr'
      }
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const photo = rows[0].photo || rows[0].photos?.[0] || null;
        const photos = rows[0].photos || (photo ? [photo] : null);
        return { photo, photos };
      }
    }
  } catch {}

  return { photo: null, photos: null };
}

export async function loadLeadPhotosBatch(leadIds: string[]): Promise<Record<string, { photo: string | null, photos: string[] | null }>> {
  if (!leadIds || leadIds.length === 0) return {};
  const map: Record<string, { photo: string | null, photos: string[] | null }> = {};

  // 1. First check localStorage caches
  try {
    const cachedPhotosRaw = localStorage.getItem('textrack_lead_photos_cache');
    if (cachedPhotosRaw) {
      const cached = JSON.parse(cachedPhotosRaw);
      leadIds.forEach(id => {
        if (cached[id]) {
          map[id] = { photo: cached[id], photos: [cached[id]] };
        }
      });
    }
  } catch {}

  try {
    const localRaw = safeStorage.getItem('textrack_leads') || safeStorage.getItem('textrack_data_leads');
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) {
        parsed.forEach((l: any) => {
          if (l && leadIds.includes(l.id) && (l.photo || (Array.isArray(l.photos) && l.photos.length > 0))) {
            const photo = l.photo || l.photos[0] || null;
            if (photo && !map[l.id]) {
              map[l.id] = {
                photo,
                photos: l.photos || (photo ? [photo] : null)
              };
            }
          }
        });
      }
    }
  } catch {}

  const remainingIds = leadIds.filter(id => !map[id]?.photo);
  if (remainingIds.length === 0) return map;

  // 2. Fetch remaining from Supabase Client
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, photo, photos')
      .in('id', remainingIds);

    if (!error && data && Array.isArray(data)) {
      data.forEach((item: any) => {
        const photo = item.photo || (Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : null);
        if (photo) {
          map[item.id] = {
            photo,
            photos: item.photos || (photo ? [photo] : null)
          };
        }
      });
    }
  } catch {}

  // 3. Direct REST Fetch fallback (completely bypasses broken tokens/CORS/auth session)
  const stillMissing = leadIds.filter(id => !map[id]?.photo);
  if (stillMissing.length > 0) {
    try {
      const url = `https://cyduteruvmpefvemeutm.supabase.co/rest/v1/leads?id=in.(${stillMissing.join(',')})&select=id,photo,photos`;
      const res = await fetch(url, {
        headers: {
          'apikey': 'sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr',
          'Authorization': 'Bearer sb_publishable_eDRmxvDKn5SG8tVClxmLUw_AgAQRLzr'
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          rows.forEach((item: any) => {
            const photo = item.photo || (Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : null);
            if (photo) {
              map[item.id] = {
                photo,
                photos: item.photos || (photo ? [photo] : null)
              };
            }
          });
        }
      }
    } catch {}
  }

  return map;
}

export async function saveLead(lead: Omit<Lead, 'id' | 'date' | 'status'> & { id?: string; date?: string; status?: string }) {
  const newLead: Lead = {
    ...lead,
    id: (lead as any).id || genId(),
    date: (lead as any).date || new Date().toISOString(),
    status: (lead as any).status || 'new',
    photoCount: lead.photos?.length || (lead.photo ? 1 : 0)
  };

  // Safely encode any atelier / AI calculation metadata into details column so schema never fails
  let baseDetails = newLead.details || '';
  if (typeof baseDetails === 'string') {
    baseDetails = baseDetails.replace('| COM_UNLOCK:true', '').split('| AI_NOTES:')[0].split('| ATELIER_DEVIS:')[0];
  } else {
    baseDetails = '';
  }

  const atelierData: any = {};
  if (newLead.modeleReel) atelierData.modeleReel = newLead.modeleReel;
  if (newLead.unitPrice) atelierData.unitPrice = Number(newLead.unitPrice);
  if (newLead.totalPrice) atelierData.totalPrice = Number(newLead.totalPrice);
  if (newLead.tissuSuggere) atelierData.tissuSuggere = newLead.tissuSuggere;
  if (newLead.techDetails) atelierData.techDetails = newLead.techDetails;
  if (newLead.delaiEstime) atelierData.delaiEstime = newLead.delaiEstime;
  if (newLead.statusProgression) atelierData.statusProgression = newLead.statusProgression;
  if (newLead.reponseAtelier) atelierData.reponseAtelier = newLead.reponseAtelier;
  if (newLead.reponseAtelierDate) atelierData.reponseAtelierDate = newLead.reponseAtelierDate;
  if ((newLead as any).patronagePrice) atelierData.patronagePrice = Number((newLead as any).patronagePrice);
  if ((newLead as any).prixEchantillon) atelierData.prixEchantillon = Number((newLead as any).prixEchantillon);

  if ((newLead as any).commercialUnlocked) {
    baseDetails += '| COM_UNLOCK:true';
  }
  if ((newLead as any).aiNotes) {
    baseDetails += '| AI_NOTES:' + (newLead as any).aiNotes;
  }
  if (Object.keys(atelierData).length > 0) {
    baseDetails += '| ATELIER_DEVIS:' + JSON.stringify(atelierData);
  }

  newLead.details = baseDetails;

  // Supabase Payload: strictly exclude non-schema fields to guarantee schema cache compatibility
  const supaPayload: any = { ...newLead };
  if (supaPayload.unitPrice && (!supaPayload.crmPrice || supaPayload.crmPrice === 0)) {
    supaPayload.crmPrice = Number(supaPayload.unitPrice);
  }

  const nonSchemaCols = [
    'aiNotes', 'commercialUnlocked', 'modeleReel', 'unitPrice', 'totalPrice',
    'tissuSuggere', 'techDetails', 'delaiEstime', 'statusProgression',
    'reponseAtelier', 'reponseAtelierDate', 'patronagePrice', 'prixEchantillon'
  ];
  nonSchemaCols.forEach(col => delete supaPayload[col]);

  // Save to Supabase (primary) - Use pure INSERT for public users to respect RLS
  let { error } = await supabase.from('leads').insert(supaPayload);
  if (isJwtExpiredError(error)) {
    console.warn('[saveLead] JWT expired, recovering session and retrying insert...');
    await recoverExpiredJwt();
    const retry = await supabase.from('leads').insert(supaPayload);
    error = retry.error;
  }

  if (error) {
    const errMsg = error.message.toLowerCase();
    if (errMsg.includes('column') || errMsg.includes('not find') || errMsg.includes('schema cache')) {
      const fallbackLead = { ...supaPayload };
      const fallbackCols = [
        'photo', 'photos', 'photoCount', 'tailles', 'aiNotes', 'adresse', 'notes',
        'crmStage', 'crmContactMethod', 'crmRdvDate', 'crmNotes', 'crmPrice',
        'crmPriceConfirmed', 'crmPriority', 'preuveClient', 'annulationRaison',
        'cv', 'sampleFeedback', 'prixEchantillon', 'phone2', 'contactedBy',
        'delaiEstime', 'modeleReel', 'tissuSuggere', 'techDetails', 'reponseAtelier',
        'reponseAtelierDate', 'patronagePrice', 'unitPrice', 'totalPrice', 'statusProgression'
      ];
      fallbackCols.forEach(col => delete fallbackLead[col]);
      let { error: retryError } = await supabase.from('leads').insert(fallbackLead);
      if (isJwtExpiredError(retryError)) {
        await recoverExpiredJwt();
        const secondRetry = await supabase.from('leads').insert(fallbackLead);
        retryError = secondRetry.error;
      }
      if (retryError) {
        console.warn('Fallback insert lead warning (saved locally):', retryError.message);
      }
    } else {
      console.error("Erreur d'insertion lead:", error);
      throw error;
    }
  }

  // Also cache photo directly in photo cache for instant retrieval across all views
  if (newLead.photo) {
    try {
      const cachedRaw = localStorage.getItem('textrack_lead_photos_cache');
      const cached = cachedRaw ? JSON.parse(cachedRaw) : {};
      cached[newLead.id] = newLead.photo;
      localStorage.setItem('textrack_lead_photos_cache', JSON.stringify(cached));
    } catch (_) {}
  }

  // Also save to local (legacy fallback)
  try {
    const localRaw = safeStorage.getItem('textrack_data_leads') || safeStorage.getItem('textrack_leads');
    const leads = localRaw ? JSON.parse(localRaw) : [];
    safeStorage.setItem('textrack_leads', JSON.stringify([newLead, ...leads]));
    safeStorage.setItem('textrack_data_leads', JSON.stringify([newLead, ...leads]));
  } catch (e) {
    console.warn("Failed to update local leads cache:", e);
  }
  
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

export async function loadData<T>(table: string, forceRefresh: boolean = false): Promise<T[]> {
  // 1. Check in-memory cache first (instant) unless fresh sync is requested
  const cached = _cache[table];
  if (!forceRefresh && cached && Date.now() - cached.ts < CACHE_TTL) {
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
    let { data, error } = await supabase.from(table).select('*');
    if (isJwtExpiredError(error)) {
      console.warn(`[loadData] JWT expired on ${table}, recovering session and retrying...`);
      await recoverExpiredJwt();
      const retry = await supabase.from(table).select('*');
      data = retry.data;
      error = retry.error;
    }
    if (error) {
      console.warn(`Failed to load ${table}:`, error.message);
      // Return localStorage fallback if network fails
      if (localData && Array.isArray(localData)) return localData;
      return [];
    }
    let result = Array.isArray(data) ? data : [];
    
    // --- BEYA MAGIC META RESTORE ---
    if (table === 'fiches') {
      result = result.map((r: any) => {
        if (typeof r.description === 'string') {
          const desc = r.description;
          const coutMatch = desc.match(/\|COUT:([^|]*)\|/);
          const aiNotesMatch = desc.match(/\|AINOTES:([^|]*)\|/);
          const fitMatch = desc.match(/\|FIT:([^|]*)\|/);
          const compMatch = desc.match(/\|COMPLEXITY:([^|]*)\|/);
          const tissuPhotoMatch = desc.match(/\|TISSUPHOTO:([^|]*)\|/);
          const clientIdMatch = desc.match(/\|CLIENTID:([^|]*)\|/);
          
          if (coutMatch) r.costEstimate = coutMatch[1];
          if (aiNotesMatch) r.aiNotes = aiNotesMatch[1];
          if (fitMatch) r.fit = fitMatch[1];
          if (compMatch) r.complexity = compMatch[1];
          if (tissuPhotoMatch) r.tissuPhoto = tissuPhotoMatch[1];
          if (clientIdMatch && !r.clientId) r.clientId = clientIdMatch[1];
          
          r.description = desc.replace(/\|COUT:[^|]*\|/g, '')
                              .replace(/\|AINOTES:[^|]*\|/g, '')
                              .replace(/\|FIT:[^|]*\|/g, '')
                              .replace(/\|COMPLEXITY:[^|]*\|/g, '')
                              .replace(/\|TISSUPHOTO:[^|]*\|/g, '')
                              .replace(/\|CLIENTID:[^|]*\|/g, '').trim();
        }
        return r;
      });
    }
    
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
  // Guard against locking out master-admin by changing their role
  if (table === 'users') {
    const r = record as any;
    if (r.id === 'master-admin' || r.id === 'yassine-admin' || r.email === '00.belbachir@gmail.com') {
      r.role = 'admin'; // Force role to remain admin
    }
  }

  let payload = { ...record as any };
  if (table === 'leads') {
    let baseDetails = payload.details || '';
    if (typeof baseDetails === 'string') {
      baseDetails = baseDetails.replace('| COM_UNLOCK:true', '').split('| AI_NOTES:')[0].split('| ATELIER_DEVIS:')[0];
    } else {
      baseDetails = '';
    }
    
    if (payload.commercialUnlocked) {
      baseDetails += '| COM_UNLOCK:true';
    }
    if (payload.aiNotes) {
      baseDetails += '| AI_NOTES:' + payload.aiNotes;
    }

    const atelierData: any = {};
    if (payload.modeleReel) atelierData.modeleReel = payload.modeleReel;
    if (payload.unitPrice) atelierData.unitPrice = Number(payload.unitPrice);
    if (payload.totalPrice) atelierData.totalPrice = Number(payload.totalPrice);
    if (payload.tissuSuggere) atelierData.tissuSuggere = payload.tissuSuggere;
    if (payload.techDetails) atelierData.techDetails = payload.techDetails;
    if (payload.delaiEstime) atelierData.delaiEstime = payload.delaiEstime;
    if (payload.statusProgression) atelierData.statusProgression = payload.statusProgression;
    if (payload.reponseAtelier) atelierData.reponseAtelier = payload.reponseAtelier;
    if (payload.reponseAtelierDate) atelierData.reponseAtelierDate = payload.reponseAtelierDate;
    if (payload.patronagePrice) atelierData.patronagePrice = Number(payload.patronagePrice);
    if (payload.prixEchantillon) atelierData.prixEchantillon = Number(payload.prixEchantillon);

    if (Object.keys(atelierData).length > 0) {
      baseDetails += '| ATELIER_DEVIS:' + JSON.stringify(atelierData);
      if (payload.unitPrice && (!payload.crmPrice || payload.crmPrice === 0)) {
        payload.crmPrice = Number(payload.unitPrice);
      }
    }
    
    payload.details = baseDetails;
    delete payload.aiNotes;
    delete payload.commercialUnlocked;
    delete payload.modeleReel;
    delete payload.unitPrice;
    delete payload.totalPrice;
    delete payload.tissuSuggere;
    delete payload.techDetails;
    delete payload.delaiEstime;
    delete payload.statusProgression;
    delete payload.reponseAtelier;
    delete payload.reponseAtelierDate;
    delete payload.patronagePrice;
    delete payload.prixEchantillon;
  }

  try {
    let { error } = await supabase.from(table).upsert(payload);
    if (isJwtExpiredError(error)) {
      console.warn(`[saveRecord] JWT expired on table ${table}, recovering session and retrying...`);
      await recoverExpiredJwt();
      const retry = await supabase.from(table).upsert(payload);
      error = retry.error;
    }

    if (!error) {
      if (table === 'leads' && (record as any)?.photo && (record as any)?.id) {
        try {
          const cachedRaw = localStorage.getItem('textrack_lead_photos_cache');
          const cached = cachedRaw ? JSON.parse(cachedRaw) : {};
          cached[(record as any).id] = (record as any).photo;
          localStorage.setItem('textrack_lead_photos_cache', JSON.stringify(cached));
        } catch (_) {}
      }
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
        let fallbackRecord = { ...payload };
        
        // --- BEYA MAGIC META ---
        // If the table is 'fiches', embed non-schema fields into the description so they persist!
        if (table === 'fiches' && typeof fallbackRecord.description === 'string') {
          let extras = '';
          if (fallbackRecord.costEstimate) extras += `\n|COUT:${fallbackRecord.costEstimate}|`;
          if (fallbackRecord.aiNotes) extras += `\n|AINOTES:${fallbackRecord.aiNotes}|`;
          if (fallbackRecord.fit) extras += `\n|FIT:${fallbackRecord.fit}|`;
          if (fallbackRecord.complexity) extras += `\n|COMPLEXITY:${fallbackRecord.complexity}|`;
          if (fallbackRecord.tissuPhoto) extras += `\n|TISSUPHOTO:${fallbackRecord.tissuPhoto}|`;
          if (fallbackRecord.clientId) extras += `\n|CLIENTID:${fallbackRecord.clientId}|`;
          
          if (extras) {
             fallbackRecord.description += extras;
          }
        }
        
        // Dynamic retry loop: automatically strip ONLY the specific missing column that Supabase complains about
        let retryError: any = error;
        let attempts = 0;
        while (retryError && attempts < 15) {
          attempts++;
          const colMatch = retryError.message.match(/Could not find the '([^']+)' column/i)
            || retryError.message.match(/column "?([^"\s]+)"? of relation/i)
            || retryError.message.match(/column "?([^"\s]+)"? does not exist/i);
            
          if (colMatch && colMatch[1]) {
            const rawCol = colMatch[1].trim();
            const badCol = rawCol.includes('.') ? rawCol.split('.').pop()!.replace(/["']/g, '') : rawCol.replace(/["']/g, '');
            delete fallbackRecord[badCol];
            const res = await supabase.from(table).upsert(fallbackRecord);
            retryError = res.error;
          } else {
            break;
          }
        }

        // Secondary fallback if dynamic strip still fails: strip only true non-schema columns (never strip cin, documents, etc.)
        if (retryError) {
          const nonSchemaCols = [
            'matricule', 'dateExpiration', 'signature',
            'tissuPrix', 'coutMainOeuvre', 'tissuSourcing', 
            'tissuConsommation', 'fournisseurTel', 'fournisseurEmail',
            'retouche', 'lastActive',
            'composition', 'metrageTotal', 'largeur', 'zone', 'etagere',
            'dateEntree', 'contrat', 'mutuelle', 'enfants', 'situation_familiale',
            'clientId', 'rebut', 'planningReady', 'ville', 'employeId', 'tailles', 'rejectionNote', 'tissus',
            'partenaireId', 'externalTasks', 'typeDossier',
            'crmStage', 'crmContactMethod', 'crmRdvDate', 'crmNotes', 'crmPrice', 'crmPriceConfirmed', 'crmPriority',
            'preuveClient', 'annulationRaison', 'cv', 'sampleFeedback', 'prixEchantillon', 'phone2', 'contactedBy',
            'tissuRecommande', 'aiNotes', 'fit', 'complexity', 'patronageFileName', 'modelisteId', 'costEstimate', 'tissuPhoto'
          ];
          nonSchemaCols.forEach(col => delete fallbackRecord[col]);
          const res = await supabase.from(table).upsert(fallbackRecord);
          retryError = res.error;
        }

        if (!retryError) {
          // ✅ Invalidate both caches on success
          localStorage.removeItem(`textrack_data_${table}`);
          delete _cache[table];
          console.warn(`Saved ${table} using fallback (ignored non-schema columns).`);
          return; 
        }
        
        // If even dynamic fallback fails, only show alert if not silent and not a non-critical schema mismatch
        if (!silent) {
          console.warn(`Supabase schema sync issue on ${table}:`, retryError.message);
        }
        return;
      }

      // Handle Quota Exceeded error specifically
      if (error.message.includes('exceed_egress_quota')) {
        if (!silent) alert('السيرفر توقف مؤقتاً حيت استهلكتي الكوطا المجانية (السبب هو داك السكرين شوت الكبير اللي دخلتي). خاصك تدخل لـ Supabase وتقاد الحساب ديالك.');
        return;
      }

      // Handle RLS policy violation specifically
      if (error.message.includes('row-level security policy') || error.message.includes('RLS') || error.message.includes('policy')) {
        if (!silent) alert(`🔒 خطأ في صلاحيات قاعدة البيانات (RLS) للجدول "${table}":\n\nيجب الدخول إلى Supabase > SQL Editor وتشغيل هذا الأمر للسماح بالحفظ:\n\nALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS "Allow all" ON public.${table};\nCREATE POLICY "Allow all" ON public.${table} FOR ALL USING (true) WITH CHECK (true);`);
        return;
      }

      // Only alert if it's NOT a missing column error and NOT a network error
      const isNetworkError = error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror');
      const isLockError = error.message.toLowerCase().includes('lock') && error.message.toLowerCase().includes('stole');
      if (!silent && !isNetworkError && !isLockError) alert(`Erreur de sauvegarde dans ${table} : ${error.message}`);
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
  // Prevent deletion of master-admin
  if (table === 'users' && (id === 'master-admin' || id === 'yassine-admin')) {
    console.warn(`Skipping deletion of protected admin: ${id}`);
    return;
  }
  console.log(`[DEBUG] Deleting from ${table} | ID: ${id} | Email: ${email}`);
  
  try {
    // Try ID first. We use .select() to check if a row was actually deleted.
    let { data, error } = await supabase.from(table).delete().eq('id', id).select();
    if (isJwtExpiredError(error)) {
      console.warn(`[deleteRecord] JWT expired on ${table}, recovering session and retrying...`);
      await recoverExpiredJwt();
      const retry = await supabase.from(table).delete().eq('id', id).select();
      data = retry.data;
      error = retry.error;
    }
    
    // If no error but 0 rows deleted, it might be an RLS policy blocking DELETE but allowing UPDATE.
    if (!error && data && data.length === 0) {
      console.warn(`[DEBUG] 0 rows deleted from ${table}, possibly blocked by RLS. Attempting soft delete...`);
      if (table === 'leads') {
        await supabase.from(table).update({ name: '__DELETED__' }).eq('id', id);
      } else if (table === 'users') {
        await supabase.from(table).update({ name: '__DELETED__' }).eq('id', id);
      }
    }

    if (error) {
      console.warn("Delete by ID failed, trying by email...", error.message);
      
      // Fallback to Email if provided and not a generic email
      if (email && email !== 'recrutement@beya.ma') {
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

export interface UpsertDevisInput {
  preferredId?: string;
  preferredNumero?: string;
  commandeId?: string | null;
  leadId?: string;
  leadDetails?: string | null;
  client: string;
  clientPhone?: string;
  clientEmail?: string;
  montant: number;
  avance?: number;
  date?: string;
  echeance?: string;
  statut?: Facture['statut'];
  articles?: LigneFacture[];
  banque?: string;
  existingFactures?: Facture[];
  strictModelMatch?: boolean;
}

const normalizeMatchText = (s?: string | null): string =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
    .trim();

export function findMatchingCommandeForLead(
  lead: Lead,
  commandes: Commande[],
  officialDevis?: Facture
): Commande | undefined {
  if (!lead || !commandes.length) return undefined;
  const ext = parseLeadDetailsJson(lead.details);
  const directCmdId = ext.commandeId || (lead as any).commandeId;
  if (directCmdId) {
    const byId = commandes.find(c => c.id === directCmdId);
    if (byId) return byId;
  }
  const directCmdRef = normalizeMatchText(ext.commandeReference || (lead as any).commandeReference);
  if (directCmdRef) {
    const byRef = commandes.find(c => normalizeMatchText(c.reference) === directCmdRef);
    if (byRef) return byRef;
  }
  if (officialDevis?.commandeId) {
    const byDevisCmd = commandes.find(c => c.id === officialDevis.commandeId);
    if (byDevisCmd) return byDevisCmd;
  }

  const leadModele = normalizeMatchText(lead.modeleReel);
  const leadType = normalizeMatchText(lead.type);
  const isGenericLeadType = !leadType || leadType.includes('formulaire avanc') || leadType === 'model';
  const leadQty = Number(ext.clientAdjustedQty || ext.adminQty || lead.quantity || 0);
  const leadUnit = Number(lead.unitPrice || lead.crmPrice || ext.unitPrice || 0);
  const leadTotal = Number(
    lead.totalPrice ||
      (leadUnit > 0 && leadQty > 0 ? leadUnit * leadQty : 0) ||
      officialDevis?.montant ||
      0
  );

  // Prefer non-sample production orders before sample orders when multiple match
  const ordered = [...commandes].sort(
    (a, b) => (a.statut === 'echantillon_en_cours' ? 1 : 0) - (b.statut === 'echantillon_en_cours' ? 1 : 0)
  );
  return ordered.find(c => {
    const cModele = normalizeMatchText(c.modele);
    const modelMatch = Boolean(
      (leadModele && cModele === leadModele) ||
        (!isGenericLeadType && leadType && cModele === leadType)
    );
    if (modelMatch && (!leadQty || !c.quantite || Number(c.quantite) === leadQty)) {
      return true;
    }
    const cTotal = Number(c.prix || 0) * Number(c.quantite || 0);
    if (
      leadQty > 0 &&
      Number(c.quantite) === leadQty &&
      leadTotal > 0 &&
      cTotal > 0 &&
      Math.abs(cTotal - leadTotal) < 5
    ) {
      return true;
    }
    return false;
  });
}

export async function upsertClientDevis(
  input: UpsertDevisInput
): Promise<{ devis: Facture; updated: boolean }> {
  const existingFactures = input.existingFactures || (await loadData<Facture>('factures'));
  const ext = parseLeadDetailsJson(input.leadDetails);
  const targetCommandeId = input.commandeId || ext.commandeId || undefined;

  const clientAliases = new Set<string>();
  const primaryClientNorm = normalizeMatchText(input.client);
  if (primaryClientNorm) clientAliases.add(primaryClientNorm);

  if (input.clientPhone || input.clientEmail) {
    try {
      const users = await loadData<User>('users');
      const phoneTail = (input.clientPhone || '').replace(/\D/g, '').slice(-9);
      const emailNorm = (input.clientEmail || '').trim().toLowerCase();
      users.forEach(u => {
        const uTail = (u.telephone || '').replace(/\D/g, '').slice(-9);
        const uEmail = (u.email || '').trim().toLowerCase();
        if ((emailNorm && uEmail === emailNorm) || (phoneTail.length >= 9 && uTail === phoneTail)) {
          if (u.nom) clientAliases.add(normalizeMatchText(u.nom));
          if (u.brandName) clientAliases.add(normalizeMatchText(u.brandName));
        }
      });
    } catch {}
  }

  const sameClient = (name?: string | null) => {
    const n = normalizeMatchText(name);
    return Boolean(n && clientAliases.has(n));
  };

  const articleTextOverlap = (aList?: LigneFacture[], bList?: LigneFacture[]) => {
    if (!aList?.length || !bList?.length) return true;
    const stopWords = new Set(['avec', 'pour', 'tissu', 'modele', 'demande', 'confection', 'ensemble', 'via', 'formulaire', 'avance', 'production', 'sourcing', 'marche']);
    const wordsOf = (list: LigneFacture[]) =>
      new Set(
        list
          .flatMap(x => normalizeMatchText(x.designation).split(' '))
          .filter(w => w.length >= 3 && !stopWords.has(w))
      );
    const wa = wordsOf(aList);
    const wb = wordsOf(bList);
    if (wa.size === 0 || wb.size === 0) return true;
    let shared = 0;
    wa.forEach(w => {
      if (wb.has(w)) shared++;
    });
    return shared >= Math.min(2, wa.size, wb.size);
  };

  const devisPool = existingFactures
    .filter(f => f.typeDoc === 'devis')
    .sort((a, b) => {
      const aScore = (a.id === input.preferredId ? 100 : 0) + (a.commandeId ? 10 : 0) + (a.articles?.length ? 5 : 0);
      const bScore = (b.id === input.preferredId ? 100 : 0) + (b.commandeId ? 10 : 0) + (b.articles?.length ? 5 : 0);
      if (aScore !== bScore) return bScore - aScore;
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

  let existingDevis: Facture | undefined;
  if (input.preferredId) {
    existingDevis = devisPool.find(f => f.id === input.preferredId);
  }
  if (!existingDevis && ext.devisId) {
    existingDevis = devisPool.find(f => f.id === ext.devisId && f.statut !== 'payée');
  }
  if (!existingDevis && ext.devisNumero) {
    existingDevis = devisPool.find(f => f.numero === ext.devisNumero && f.statut !== 'payée');
  }
  if (!existingDevis && targetCommandeId) {
    existingDevis = devisPool.find(f => f.commandeId === targetCommandeId && f.statut !== 'payée');
  }
  if (!existingDevis && input.preferredNumero) {
    existingDevis = devisPool.find(
      f => f.numero === input.preferredNumero && f.statut !== 'payée' && sameClient(f.client)
    );
  }
  if (!existingDevis && clientAliases.size > 0) {
    const clientPending = devisPool.filter(
      f =>
        f.statut !== 'payée' &&
        sameClient(f.client) &&
        (!targetCommandeId || !f.commandeId || f.commandeId === targetCommandeId || !(f.articles && f.articles.length > 0))
    );
    existingDevis =
      clientPending.find(
        f =>
          Math.abs(Number(f.montant || 0) - Number(input.montant || 0)) < 1 &&
          articleTextOverlap(f.articles, input.articles)
      ) ||
      clientPending.find(f => !f.articles?.length || articleTextOverlap(f.articles, input.articles)) ||
      (!input.strictModelMatch && clientPending.length === 1 ? clientPending[0] : undefined);
  }

  const todayStr = input.date || new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);
  const echeanceStr = input.echeance || dueDate.toISOString().split('T')[0];

  let nextNumero = existingDevis?.numero;
  if (!nextNumero) {
    const numeroAlreadyTaken = Boolean(
      input.preferredNumero && existingFactures.some(f => f.numero === input.preferredNumero)
    );
    if (input.preferredNumero && !numeroAlreadyTaken) {
      nextNumero = input.preferredNumero;
    } else {
      const year = new Date().getFullYear();
      const prefix = `DEV-${year}-`;
      const existingNums = existingFactures
        .filter(f => f.numero?.startsWith(prefix))
        .map(f => parseInt(f.numero.replace(prefix, ''), 10))
        .filter(n => !isNaN(n));
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
      nextNumero = `${prefix}${String(nextNum).padStart(3, '0')}`;
    }
  }

  const finalArticles =
    input.articles && input.articles.length > 0
      ? input.articles
      : existingDevis?.articles || [];

  const devisRecord: Facture = {
    id: existingDevis?.id || genId(),
    numero: nextNumero,
    commandeId: targetCommandeId || existingDevis?.commandeId || null,
    client: input.client || existingDevis?.client || 'Client',
    montant: input.montant,
    avance: input.avance !== undefined ? input.avance : existingDevis?.avance || 0,
    date: todayStr,
    echeance: echeanceStr,
    statut: input.statut || existingDevis?.statut || 'en_attente',
    typeDoc: 'devis',
    articles: finalArticles,
    ...(input.banque || existingDevis?.banque ? { banque: input.banque || existingDevis?.banque } : {}),
  };

  await saveRecord('factures', devisRecord);
  return { devis: devisRecord, updated: Boolean(existingDevis) };
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
