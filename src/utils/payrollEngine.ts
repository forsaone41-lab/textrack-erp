import { Employe, PaiementSalaire, Presence, genId, safeStorage } from '../types';
import { supabase, isJwtExpiredError, recoverExpiredJwt } from '../supabase';
import { calculateWorkingHours } from './beyaRules';

export type ExtendedRemunerationType = 'mensuel' | 'hebdomadaire' | 'tache' | 'horaire' | 'modele';

export interface EmpPayrollRule {
  id: string;
  employeId: string;
  mode: ExtendedRemunerationType;
  tauxHoraire: number;       // MAD / heure (pour pointage horaire)
  tarifParModele: number;    // MAD / modèle par défaut (pour modéliste)
  updatedAt?: string;
}

export type ModelTravailType =
  | 'patronage_complet'
  | 'patronage_base'
  | 'gradation'
  | 'echantillon'
  | 'retouche_patron';

export interface ModelisteWorkLog {
  id: string;
  employeId: string;
  date: string;              // YYYY-MM-DD
  modeleName: string;
  client: string;
  typeTravail: ModelTravailType;
  quantite: number;
  tarifUnitaire: number;
  statut: 'valide' | 'en_attente';
  sourceLeadId?: string;
  notes?: string;
  createdAt: string;
}

export interface PayrollAdjustment {
  id: string;
  employeId: string;
  mois: string;              // YYYY-MM
  date: string;              // YYYY-MM-DD
  type: 'prime' | 'retenue';
  montant: number;
  motif: string;
  createdBy?: string;
}

export interface PayrollExtrasData {
  rules: EmpPayrollRule[];
  modelLogs: ModelisteWorkLog[];
  adjustments: PayrollAdjustment[];
}

export interface DailyHourRow {
  presenceId: string;
  date: string;
  heureEntree: string | null;
  heureSortie: string | null;
  statut: 'present' | 'absent' | 'retard';
  hours: number;
  earnedDay: number;
  isIncomplete: boolean;
}

export interface WorkerBalanceSummary {
  empId: string;
  mois: string;
  mode: ExtendedRemunerationType;
  tauxHoraire: number;
  tarifParModele: number;
  baseMensuelle: number;
  daysPresent: number;
  daysRetard: number;
  incompleteShiftsCount: number;
  totalHours: number;
  hourLogs: DailyHourRow[];
  modelLogsValides: ModelisteWorkLog[];
  modelLogsEnAttente: ModelisteWorkLog[];
  totalModelsValides: number;
  totalModelsEnAttente: number;
  pendingModelsAmount: number;
  primesList: PayrollAdjustment[];
  retenuesList: PayrollAdjustment[];
  totalPrimes: number;
  totalRetenues: number;
  paiementsList: PaiementSalaire[];
  salaireBaseGagne: number;
  totalNetGagne: number;
  totalPaye: number;
  balanceNet: number;          // signed: (+) dû à l'ouvrier, (-) avance excédentaire, (0) soldé
  resteAPayer: number;         // Math.max(0, balanceNet)
  avanceExcedentaire: number;  // Math.max(0, -balanceNet)
}

const LS_RULES_KEY = 'beya_rh_paie_rules';
const LS_MODELS_KEY = 'beya_rh_model_logs';
const LS_ADJS_KEY = 'beya_rh_paie_adjs';
const LS_DELETED_KEY = 'beya_rh_extras_deleted';

export const SYSTEM_NAME_RULE = '__RH_PAIE_RULE__';
export const SYSTEM_NAME_MODEL = '__RH_MODEL_LOG__';
export const SYSTEM_NAME_ADJ = '__RH_PAIE_ADJ__';

function readJsonArray<T>(key: string): T[] {
  try {
    const raw = safeStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, items: T[]) {
  try {
    safeStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* ignore storage quota */
  }
}

function getDeletedExtraIds(): Set<string> {
  return new Set(readJsonArray<string>(LS_DELETED_KEY));
}

function markExtraDeleted(id: string) {
  const arr = readJsonArray<string>(LS_DELETED_KEY);
  if (!arr.includes(id)) {
    arr.push(id);
    writeJsonArray(LS_DELETED_KEY, arr);
  }
}

export async function loadPayrollExtras(): Promise<PayrollExtrasData> {
  const localRules = readJsonArray<EmpPayrollRule>(LS_RULES_KEY);
  const localModels = readJsonArray<ModelisteWorkLog>(LS_MODELS_KEY);
  const localAdjs = readJsonArray<PayrollAdjustment>(LS_ADJS_KEY);
  const deletedIds = getDeletedExtraIds();

  try {
    let res = await supabase
      .from('leads')
      .select('id, name, phone, ville, type, quantity, status, date, details')
      .in('name', [SYSTEM_NAME_RULE, SYSTEM_NAME_MODEL, SYSTEM_NAME_ADJ]);

    if (res.error && isJwtExpiredError(res.error)) {
      await recoverExpiredJwt();
      res = await supabase
        .from('leads')
        .select('id, name, phone, ville, type, quantity, status, date, details')
        .in('name', [SYSTEM_NAME_RULE, SYSTEM_NAME_MODEL, SYSTEM_NAME_ADJ]);
    }

    if (res.error || !Array.isArray(res.data)) {
      return {
        rules: localRules,
        modelLogs: localModels.filter(m => !deletedIds.has(m.id)),
        adjustments: localAdjs.filter(a => !deletedIds.has(a.id)),
      };
    }

    const rulesMap = new Map<string, EmpPayrollRule>();
    const modelsMap = new Map<string, ModelisteWorkLog>();
    const adjsMap = new Map<string, PayrollAdjustment>();

    // Seed with local first, then overwrite/merge with Supabase (prefer newest updatedAt for rules)
    localRules.forEach(r => {
      if (r && r.employeId) rulesMap.set(r.employeId, r);
    });
    localModels.forEach(m => {
      if (m && m.id && !deletedIds.has(m.id)) modelsMap.set(m.id, m);
    });
    localAdjs.forEach(a => {
      if (a && a.id && !deletedIds.has(a.id)) adjsMap.set(a.id, a);
    });

    res.data.forEach((row: any) => {
      if (!row || deletedIds.has(row.id)) return;
      let parsed: any = {};
      try {
        parsed = row.details ? JSON.parse(row.details) : {};
      } catch {
        parsed = {};
      }

      if (row.name === SYSTEM_NAME_RULE && parsed.employeId) {
        const existing = rulesMap.get(parsed.employeId);
        const supaUpdated = parsed.updatedAt || row.date || '';
        const localUpdated = existing?.updatedAt || '';
        if (!existing || supaUpdated >= localUpdated) {
          rulesMap.set(parsed.employeId, {
            id: row.id,
            employeId: parsed.employeId,
            mode: parsed.mode || 'mensuel',
            tauxHoraire: Number(parsed.tauxHoraire) || 0,
            tarifParModele: Number(parsed.tarifParModele) || 0,
            updatedAt: supaUpdated,
          });
        }
      } else if (row.name === SYSTEM_NAME_MODEL && parsed.employeId) {
        modelsMap.set(row.id, {
          id: row.id,
          employeId: parsed.employeId,
          date: parsed.date || (row.date ? String(row.date).slice(0, 10) : ''),
          modeleName: parsed.modeleName || row.type || 'Modèle',
          client: parsed.client || row.ville || '',
          typeTravail: parsed.typeTravail || 'patronage_complet',
          quantite: Number(parsed.quantite) || Number(row.quantity) || 1,
          tarifUnitaire: Number(parsed.tarifUnitaire) || 0,
          statut: parsed.statut === 'en_attente' ? 'en_attente' : 'valide',
          sourceLeadId: parsed.sourceLeadId,
          notes: parsed.notes,
          createdAt: parsed.createdAt || row.date || new Date().toISOString(),
        });
      } else if (row.name === SYSTEM_NAME_ADJ && parsed.employeId) {
        adjsMap.set(row.id, {
          id: row.id,
          employeId: parsed.employeId,
          mois: parsed.mois || String(parsed.date || row.date || '').slice(0, 7),
          date: parsed.date || String(row.date || '').slice(0, 10),
          type: parsed.type === 'retenue' ? 'retenue' : 'prime',
          montant: Number(parsed.montant) || 0,
          motif: parsed.motif || '',
          createdBy: parsed.createdBy,
        });
      }
    });

    const rules = Array.from(rulesMap.values());
    const modelLogs = Array.from(modelsMap.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const adjustments = Array.from(adjsMap.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    writeJsonArray(LS_RULES_KEY, rules);
    writeJsonArray(LS_MODELS_KEY, modelLogs);
    writeJsonArray(LS_ADJS_KEY, adjustments);

    return { rules, modelLogs, adjustments };
  } catch (err) {
    console.warn('[loadPayrollExtras] fallback to localStorage:', err);
    return {
      rules: localRules,
      modelLogs: localModels.filter(m => !deletedIds.has(m.id)),
      adjustments: localAdjs.filter(a => !deletedIds.has(a.id)),
    };
  }
}

export async function savePayrollRule(rule: EmpPayrollRule): Promise<EmpPayrollRule> {
  const stamped: EmpPayrollRule = {
    ...rule,
    id: rule.id || `rh_rule_${rule.employeId}`,
    updatedAt: new Date().toISOString(),
  };

  const current = readJsonArray<EmpPayrollRule>(LS_RULES_KEY).filter(r => r.employeId !== stamped.employeId);
  current.push(stamped);
  writeJsonArray(LS_RULES_KEY, current);

  try {
    const payload = {
      id: stamped.id,
      name: SYSTEM_NAME_RULE,
      phone: stamped.employeId,
      ville: 'RH',
      type: stamped.mode,
      quantity: 0,
      status: 'active',
      date: stamped.updatedAt,
      details: JSON.stringify(stamped),
    };
    let res = await supabase.from('leads').upsert(payload);
    if (res.error && isJwtExpiredError(res.error)) {
      await recoverExpiredJwt();
      await supabase.from('leads').upsert(payload);
    }
  } catch (e) {
    console.warn('[savePayrollRule] cloud sync failed, kept locally:', e);
  }

  return stamped;
}

export async function saveModelisteWorkLog(log: Omit<ModelisteWorkLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<ModelisteWorkLog> {
  const entry: ModelisteWorkLog = {
    ...log,
    id: log.id || genId(),
    createdAt: log.createdAt || new Date().toISOString(),
  };

  const current = readJsonArray<ModelisteWorkLog>(LS_MODELS_KEY).filter(m => m.id !== entry.id);
  current.unshift(entry);
  writeJsonArray(LS_MODELS_KEY, current);

  try {
    const payload = {
      id: entry.id,
      name: SYSTEM_NAME_MODEL,
      phone: entry.employeId,
      ville: entry.client || '',
      type: entry.modeleName,
      quantity: entry.quantite || 1,
      status: entry.statut,
      date: entry.date,
      details: JSON.stringify(entry),
    };
    let res = await supabase.from('leads').upsert(payload);
    if (res.error && isJwtExpiredError(res.error)) {
      await recoverExpiredJwt();
      await supabase.from('leads').upsert(payload);
    }
  } catch (e) {
    console.warn('[saveModelisteWorkLog] cloud sync failed:', e);
  }

  return entry;
}

export async function deleteModelisteWorkLog(id: string): Promise<void> {
  markExtraDeleted(id);
  const next = readJsonArray<ModelisteWorkLog>(LS_MODELS_KEY).filter(m => m.id !== id);
  writeJsonArray(LS_MODELS_KEY, next);
  try {
    await supabase.from('leads').delete().eq('id', id);
  } catch {
    /* ignore */
  }
}

export async function savePayrollAdjustment(adj: Omit<PayrollAdjustment, 'id'> & { id?: string }): Promise<PayrollAdjustment> {
  const entry: PayrollAdjustment = {
    ...adj,
    id: adj.id || genId(),
  };

  const current = readJsonArray<PayrollAdjustment>(LS_ADJS_KEY).filter(a => a.id !== entry.id);
  current.unshift(entry);
  writeJsonArray(LS_ADJS_KEY, current);

  try {
    const payload = {
      id: entry.id,
      name: SYSTEM_NAME_ADJ,
      phone: entry.employeId,
      ville: entry.mois,
      type: entry.type,
      quantity: entry.montant,
      status: 'active',
      date: entry.date,
      details: JSON.stringify(entry),
    };
    let res = await supabase.from('leads').upsert(payload);
    if (res.error && isJwtExpiredError(res.error)) {
      await recoverExpiredJwt();
      await supabase.from('leads').upsert(payload);
    }
  } catch (e) {
    console.warn('[savePayrollAdjustment] cloud sync failed:', e);
  }

  return entry;
}

export async function deletePayrollAdjustment(id: string): Promise<void> {
  markExtraDeleted(id);
  const next = readJsonArray<PayrollAdjustment>(LS_ADJS_KEY).filter(a => a.id !== id);
  writeJsonArray(LS_ADJS_KEY, next);
  try {
    await supabase.from('leads').delete().eq('id', id);
  } catch {
    /* ignore */
  }
}

export function isModelisteEmployee(emp?: Employe | null): boolean {
  if (!emp) return false;
  const p = (emp.poste || '').toLowerCase();
  return (
    emp.remunerationType === 'modele' ||
    p.includes('modéliste') ||
    p.includes('modeliste') ||
    p.includes('patronni') ||
    p.includes('موديليست') ||
    p.includes('باطرون')
  );
}

export function getEffectiveMode(emp: Employe, rule?: EmpPayrollRule): ExtendedRemunerationType {
  if (rule?.mode) return rule.mode;
  if (emp.remunerationType) return emp.remunerationType;
  return 'mensuel';
}

export function getEffectiveHourlyRate(emp: Employe, rule?: EmpPayrollRule): number {
  if (rule && rule.tauxHoraire > 0) return rule.tauxHoraire;
  const sal = Number(emp.salaireMensuel) || 0;
  if (emp.remunerationType === 'horaire' && sal > 0 && sal <= 250) {
    return sal;
  }
  if (sal > 0) {
    return Number((sal / 208).toFixed(2));
  }
  return 17.10;
}

export function getEffectiveModelRate(emp: Employe, rule?: EmpPayrollRule): number {
  if (rule && rule.tarifParModele > 0) return rule.tarifParModele;
  const sal = Number(emp.salaireMensuel) || 0;
  if (emp.remunerationType === 'modele' && sal > 0 && sal <= 2000) {
    return sal;
  }
  return 150;
}

/**
 * Single Source of Truth for Worker Payroll & Balance Calculation across RH, BalancePaie, Charges, Bilan & WorkerPortal.
 */
export function computeWorkerMonthBalance(
  emp: Employe,
  mois: string,
  presences: Presence[],
  paiements: PaiementSalaire[],
  extras: PayrollExtrasData
): WorkerBalanceSummary {
  const rule = (extras.rules || []).find(r => r.employeId === emp.id);
  const mode = getEffectiveMode(emp, rule);
  const tauxHoraire = getEffectiveHourlyRate(emp, rule);
  const tarifParModele = getEffectiveModelRate(emp, rule);
  const baseMensuelle = Number(emp.salaireMensuel) || 0;

  // 1. Attendance & Hourly Logs (Pointage) for this month
  const monthPresences = (presences || [])
    .filter(p => p && p.employeId === emp.id && p.date && p.date.startsWith(mois))
    .sort((a, b) => a.date.localeCompare(b.date));

  let totalHours = 0;
  let daysPresent = 0;
  let daysRetard = 0;
  let incompleteShiftsCount = 0;

  const hourLogs: DailyHourRow[] = monthPresences.map(p => {
    const isPresentDay = p.statut !== 'absent' && Boolean(p.heureEntree);
    if (isPresentDay) daysPresent++;
    if (p.statut === 'retard') daysRetard++;
    const isIncomplete = Boolean(p.heureEntree && !p.heureSortie);
    if (isIncomplete) incompleteShiftsCount++;

    const rawHours = calculateWorkingHours(p.heureEntree, p.heureSortie, p.date);
    const hours = Math.round(rawHours * 100) / 100;
    totalHours += hours;

    const earnedDay = mode === 'horaire' ? Math.round(hours * tauxHoraire * 100) / 100 : 0;

    return {
      presenceId: p.id,
      date: p.date,
      heureEntree: p.heureEntree,
      heureSortie: p.heureSortie,
      statut: p.statut,
      hours,
      earnedDay,
      isIncomplete,
    };
  });
  totalHours = Math.round(totalHours * 100) / 100;

  // 2. Modéliste Logs for this month
  const monthModels = (extras.modelLogs || [])
    .filter(m => m && m.employeId === emp.id && m.date && m.date.startsWith(mois));

  const modelLogsValides = monthModels.filter(m => m.statut === 'valide');
  const modelLogsEnAttente = monthModels.filter(m => m.statut !== 'valide');

  const totalModelsValides = modelLogsValides.reduce((s, m) => s + (Number(m.quantite) || 1), 0);
  const totalModelsEnAttente = modelLogsEnAttente.reduce((s, m) => s + (Number(m.quantite) || 1), 0);

  const modelsEarned = modelLogsValides.reduce((s, m) => {
    const qty = Number(m.quantite) || 1;
    const rate = Number(m.tarifUnitaire) > 0 ? Number(m.tarifUnitaire) : tarifParModele;
    return s + qty * rate;
  }, 0);

  const pendingModelsAmount = modelLogsEnAttente.reduce((s, m) => {
    const qty = Number(m.quantite) || 1;
    const rate = Number(m.tarifUnitaire) > 0 ? Number(m.tarifUnitaire) : tarifParModele;
    return s + qty * rate;
  }, 0);

  // 3. Base Earned Calculation by Mode
  let salaireBaseGagne = 0;
  if (mode === 'horaire') {
    salaireBaseGagne = Math.round(totalHours * tauxHoraire * 100) / 100;
  } else if (mode === 'modele') {
    salaireBaseGagne = Math.round(modelsEarned * 100) / 100;
  } else {
    salaireBaseGagne = baseMensuelle;
  }

  // 4. Primes (+) & Retenues (-)
  const empAdjs = (extras.adjustments || []).filter(
    a => a && a.employeId === emp.id && (a.mois === mois || (!a.mois && a.date?.startsWith(mois)))
  );
  const primesList = empAdjs.filter(a => a.type === 'prime');
  const retenuesList = empAdjs.filter(a => a.type === 'retenue');
  const totalPrimes = Math.round(primesList.reduce((s, a) => s + (Number(a.montant) || 0), 0) * 100) / 100;
  const totalRetenues = Math.round(retenuesList.reduce((s, a) => s + (Number(a.montant) || 0), 0) * 100) / 100;

  // 5. Total Earned & Paid (from official paiements_salaires)
  const totalNetGagne = Math.round((salaireBaseGagne + totalPrimes - totalRetenues) * 100) / 100;

  const paiementsList = (paiements || [])
    .filter(p => p && p.employeId === emp.id && (p.mois === mois || (!p.mois && p.date?.startsWith(mois))))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const totalPaye = Math.round(paiementsList.reduce((s, p) => s + (Number(p.montant) || 0), 0) * 100) / 100;

  // 6. Final Net Balance
  const balanceNet = Math.round((totalNetGagne - totalPaye) * 100) / 100;
  const resteAPayer = Math.max(0, balanceNet);
  const avanceExcedentaire = balanceNet < 0 ? Math.abs(balanceNet) : 0;

  return {
    empId: emp.id,
    mois,
    mode,
    tauxHoraire,
    tarifParModele,
    baseMensuelle,
    daysPresent,
    daysRetard,
    incompleteShiftsCount,
    totalHours,
    hourLogs,
    modelLogsValides,
    modelLogsEnAttente,
    totalModelsValides,
    totalModelsEnAttente,
    pendingModelsAmount,
    primesList,
    retenuesList,
    totalPrimes,
    totalRetenues,
    paiementsList,
    salaireBaseGagne,
    totalNetGagne,
    totalPaye,
    balanceNet,
    resteAPayer,
    avanceExcedentaire,
  };
}
