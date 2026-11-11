import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet, Clock, Scissors, Users, Plus, Search, CheckCircle2, AlertTriangle,
  DollarSign, Printer, MessageCircle, Edit2, Trash2, X, Calendar, RotateCw,
  ArrowUpRight, ArrowDownRight, Scale, FileText, Download, Check, Sparkles,
  Settings2, Briefcase
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import {
  Employe, Presence, PaiementSalaire, User, Lead, Charge,
  loadData, saveRecord, deleteRecord, genId, loadCompanyProfile, safeStorage
} from '../types';
import { supabase } from '../supabase';
import { printElement } from '../utils/pdf';
import { PageLoader } from '../components/PageLoader';
import { calculateWorkingHours } from '../utils/beyaRules';
import {
  ExtendedRemunerationType,
  EmpPayrollRule,
  ModelisteWorkLog,
  ModelTravailType,
  PayrollAdjustment,
  PayrollExtrasData,
  WorkerBalanceSummary,
  loadPayrollExtras,
  savePayrollRule,
  saveModelisteWorkLog,
  deleteModelisteWorkLog,
  savePayrollAdjustment,
  deletePayrollAdjustment,
  computeWorkerMonthBalance,
  isModelisteEmployee,
} from '../utils/payrollEngine';

function getLocalRH<T>(key: string): T[] {
  try {
    const data = safeStorage.getItem(`textrack_${key}`);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalRH<T>(key: string, data: T[]) {
  safeStorage.setItem(`textrack_${key}`, JSON.stringify(data));
}

const TRAVAIL_LABELS: Record<ModelTravailType, { fr: string; ar: string }> = {
  patronage_complet: { fr: 'Patronage + Gradation', ar: 'باترون كامل + تدريج المقاسات' },
  patronage_base: { fr: 'Patronage Base', ar: 'باترون أساسي فقط' },
  gradation: { fr: 'Gradation Tailles', ar: 'تدريج المقاسات (Gradation)' },
  echantillon: { fr: 'Suivi Échantillon', ar: 'مواكبة العينة (Prototype)' },
  retouche_patron: { fr: 'Modification / Retouche', ar: 'تعديل على باترون' },
};

export default function BalancePaie() {
  const { isAr } = useLang();
  const location = useLocation();
  const company = loadCompanyProfile();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [employes, setEmployes] = useState<Employe[]>(() => getLocalRH<Employe>('employes'));
  const [presences, setPresences] = useState<Presence[]>([]);
  const [paiements, setPaiements] = useState<PaiementSalaire[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [erpLeads, setErpLeads] = useState<Lead[]>([]);
  const [extras, setExtras] = useState<PayrollExtrasData>({ rules: [], modelLogs: [], adjustments: [] });

  const [selectedMois, setSelectedMois] = useState(new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState<'balance' | 'horaire' | 'modeliste'>(() => {
    const q = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const t = q.get('tab');
    if (t === 'horaire' || t === 'modeliste') return t;
    return 'balance';
  });
  const [modeFilter, setModeFilter] = useState<'all' | 'horaire' | 'modele' | 'mensuel'>('all');
  const [search, setSearch] = useState('');

  // Selected workers for drill-down tabs
  const [selectedHoraireEmpId, setSelectedHoraireEmpId] = useState<string>('');
  const [selectedModelisteEmpId, setSelectedModelisteEmpId] = useState<string>('');

  // Modals
  const [releveEmpId, setReleveEmpId] = useState<string | null>(null);
  const [ruleModalEmp, setRuleModalEmp] = useState<Employe | null>(null);
  const [ruleForm, setRuleForm] = useState<{ mode: ExtendedRemunerationType; tauxHoraire: number; tarifParModele: number; salaireMensuel: number }>({
    mode: 'mensuel',
    tauxHoraire: 17.1,
    tarifParModele: 150,
    salaireMensuel: 0,
  });

  const [payModalEmp, setPayModalEmp] = useState<Employe | null>(null);
  const [payForm, setPayForm] = useState<{ montant: number; typePaiement: 'avance' | 'solde'; methode: 'especes' | 'virement' | 'cheque'; date: string; notes: string }>({
    montant: 0,
    typePaiement: 'avance',
    methode: 'especes',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [adjModalEmp, setAdjModalEmp] = useState<Employe | null>(null);
  const [adjForm, setAdjForm] = useState<{ type: 'prime' | 'retenue'; montant: number; motif: string; date: string }>({
    type: 'prime',
    montant: 0,
    motif: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // Hourly Pointage Edit / Add modal
  const [presenceEditModal, setPresenceEditModal] = useState<{
    employeId: string;
    presenceId?: string;
    date: string;
    heureEntree: string;
    heureSortie: string;
    statut: 'present' | 'absent' | 'retard';
  } | null>(null);

  // New Modeliste Work Log form
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [modelForm, setModelForm] = useState<{
    employeId: string;
    date: string;
    modeleName: string;
    client: string;
    typeTravail: ModelTravailType;
    quantite: number;
    tarifUnitaire: number;
    statut: 'valide' | 'en_attente';
    notes: string;
  }>({
    employeId: '',
    date: new Date().toISOString().slice(0, 10),
    modeleName: '',
    client: '',
    typeTravail: 'patronage_complet',
    quantite: 1,
    tarifUnitaire: 150,
    statut: 'valide',
    notes: '',
  });

  // Sync URL tab param changes
  useEffect(() => {
    const hashParams = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const params = new URLSearchParams(location.search || (hashParams ? `?${hashParams}` : ''));
    const tab = params.get('tab');
    if (tab === 'horaire' || tab === 'modeliste' || tab === 'balance') {
      setActiveTab(tab);
    }
  }, [location.hash, location.search]);

  const loadAll = async (isManual = false) => {
    if (isManual) setSyncing(true);
    try {
      const [remoteEmps, remotePres, remotePays, remoteUsers, loadedExtras, leadsRes] = await Promise.all([
        loadData<Employe>('employes', isManual),
        loadData<Presence>('presences', isManual),
        loadData<PaiementSalaire>('paiements_salaires', isManual),
        loadData<User>('users', isManual),
        loadPayrollExtras(),
        supabase
          .from('leads')
          .select('id, name, phone, ville, type, quantity, status, date, details')
          .not('name', 'in', '(__SYSTEM_CONFIG__,__WORKER_PHOTO__,__SYSTEM_LISTE_ATTENTE__,__DELETED__,__RH_PAIE_RULE__,__RH_MODEL_LOG__,__RH_PAIE_ADJ__)')
          .order('date', { ascending: false })
          .limit(200),
      ]);

      // Exact same local-priority merge as SuiviRH so RH never drifts!
      const localEmps = getLocalRH<Employe>('employes');
      const mergedEmps: Employe[] = (remoteEmps || []).map(rem => {
        const loc = localEmps.find(l => l.id === rem.id);
        if (!loc) return rem;
        return {
          ...rem,
          ...loc,
          nom: loc.nom || rem.nom || '',
          prenom: loc.prenom !== undefined && loc.prenom !== null ? loc.prenom : (rem.prenom || ''),
          poste: loc.poste || rem.poste || '',
          type: loc.type || rem.type || 'atelier',
          salaireMensuel: loc.salaireMensuel !== undefined && loc.salaireMensuel !== null ? loc.salaireMensuel : (rem.salaireMensuel || 0),
          remunerationType: loc.remunerationType || rem.remunerationType || 'mensuel',
        };
      });
      localEmps.forEach(l => {
        if (!mergedEmps.find(m => m.id === l.id)) mergedEmps.push(l);
      });

      setEmployes(mergedEmps);
      saveLocalRH('employes', mergedEmps);
      setPresences(remotePres || []);
      setPaiements(remotePays || []);
      setUsers(remoteUsers || []);
      setExtras(loadedExtras);
      setErpLeads(leadsRes.data || []);
    } catch (e) {
      console.error('[BalancePaie] Sync error:', e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadAll(false);
  }, []);

  const availableMois = useMemo(() => {
    const months = new Set<string>();
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const [cy, cm] = currentMonthStr.split('-').map(Number);
    for (let y = 2025; y <= cy; y++) {
      const maxM = y === cy ? cm : 12;
      for (let m = 1; m <= maxM; m++) {
        months.add(`${y}-${String(m).padStart(2, '0')}`);
      }
    }
    paiements.forEach(p => { if (p?.mois && p.mois <= currentMonthStr) months.add(p.mois); });
    presences.forEach(p => { if (p?.date) months.add(p.date.slice(0, 7)); });
    extras.modelLogs.forEach(m => { if (m?.date) months.add(m.date.slice(0, 7)); });
    return [...months].sort().reverse();
  }, [paiements, presences, extras.modelLogs]);

  const moisLabel = (m: string) => {
    if (!m) return '';
    return new Date(m + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });
  };

  const empName = (e: Employe) => (e.prenom ? `${e.prenom} ${e.nom}` : e.nom || '').trim();

  // Compute Unified Balance for every active employee
  const activeEmployes = useMemo(() => (employes || []).filter(e => e && e.actif), [employes]);

  const allBalances = useMemo(() => {
    const map: Record<string, WorkerBalanceSummary> = {};
    activeEmployes.forEach(emp => {
      map[emp.id] = computeWorkerMonthBalance(emp, selectedMois, presences, paiements, extras);
    });
    return map;
  }, [activeEmployes, selectedMois, presences, paiements, extras]);

  // Global KPI Totals
  const kpis = useMemo(() => {
    let totalBrut = 0;
    let totalNetGagne = 0;
    let totalPaye = 0;
    let totalResteAPayer = 0;
    let totalAvanceExc = 0;
    let totalHoursAll = 0;
    let totalModelsAll = 0;
    let horaireCount = 0;
    let modeleCount = 0;
    let mensuelCount = 0;

    activeEmployes.forEach(emp => {
      const b = allBalances[emp.id];
      if (!b) return;
      totalBrut += b.salaireBaseGagne;
      totalNetGagne += b.totalNetGagne;
      totalPaye += b.totalPaye;
      totalResteAPayer += b.resteAPayer;
      totalAvanceExc += b.avanceExcedentaire;
      totalHoursAll += b.totalHours;
      totalModelsAll += b.totalModelsValides;

      if (b.mode === 'horaire') horaireCount++;
      else if (b.mode === 'modele') modeleCount++;
      else mensuelCount++;
    });

    return {
      totalBrut: Math.round(totalBrut),
      totalNetGagne: Math.round(totalNetGagne),
      totalPaye: Math.round(totalPaye),
      totalResteAPayer: Math.round(totalResteAPayer),
      totalAvanceExc: Math.round(totalAvanceExc),
      totalHoursAll: Math.round(totalHoursAll * 10) / 10,
      totalModelsAll,
      horaireCount,
      modeleCount,
      mensuelCount,
    };
  }, [activeEmployes, allBalances]);

  // Filtered Workers for Tab 1 (Master Balance)
  const filteredBalanceEmps = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activeEmployes.filter(e => {
      const b = allBalances[e.id];
      if (!b) return false;
      if (modeFilter === 'horaire' && b.mode !== 'horaire') return false;
      if (modeFilter === 'modele' && b.mode !== 'modele') return false;
      if (modeFilter === 'mensuel' && (b.mode === 'horaire' || b.mode === 'modele')) return false;
      if (q) {
        const hay = `${e.nom} ${e.prenom} ${e.poste} ${e.cin || ''} ${e.telephone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeEmployes, allBalances, modeFilter, search]);

  // Hourly Workers List
  const hourlyEmps = useMemo(
    () => activeEmployes.filter(e => allBalances[e.id]?.mode === 'horaire'),
    [activeEmployes, allBalances]
  );

  // Modéliste Workers List (mode === 'modele' OR poste includes Modéliste/Patronnière)
  const modelisteEmps = useMemo(
    () => activeEmployes.filter(e => allBalances[e.id]?.mode === 'modele' || isModelisteEmployee(e)),
    [activeEmployes, allBalances]
  );

  useEffect(() => {
    if (!selectedHoraireEmpId && hourlyEmps.length > 0) {
      setSelectedHoraireEmpId(hourlyEmps[0].id);
    }
  }, [hourlyEmps, selectedHoraireEmpId]);

  useEffect(() => {
    if (!selectedModelisteEmpId && modelisteEmps.length > 0) {
      setSelectedModelisteEmpId(modelisteEmps[0].id);
    }
  }, [modelisteEmps, selectedModelisteEmpId]);

  // ERP Patronage Models from EvaluationPatronage / ModelisteSuivi available to import for selected Modéliste
  const erpModelsForSelectedModeliste = useMemo(() => {
    if (!selectedModelisteEmpId) return [];
    const emp = activeEmployes.find(e => e.id === selectedModelisteEmpId);
    if (!emp) return [];
    const empFull = empName(emp).toLowerCase();

    // Find linked User IDs for this modéliste
    const linkedUserIds = new Set(
      users
        .filter(u =>
          (u as any).employeId === emp.id ||
          (u.nom || '').toLowerCase().trim() === empFull ||
          (emp.telephone && u.telephone === emp.telephone)
        )
        .map(u => u.id)
    );

    const importedLeadIds = new Set(
      extras.modelLogs.filter(m => m.sourceLeadId).map(m => m.sourceLeadId!)
    );

    const rows: { leadId: string; date: string; modele: string; client: string; price: number; validated: boolean; alreadyImported: boolean }[] = [];
    erpLeads.forEach(l => {
      let ext: any = {};
      try { ext = JSON.parse(l.details || '{}'); } catch { ext = {}; }
      if (ext.patronageStatus !== 'priced' && !ext.patronagePrice) return;
      const modMatch =
        (ext.modelisteId && linkedUserIds.has(ext.modelisteId)) ||
        (ext.modelisteName && empFull && ext.modelisteName.toLowerCase().includes(empFull.split(' ')[0])) ||
        !ext.modelisteId; // show unassigned priced leads cleanly too
      if (!modMatch) return;

      const leadDate = (ext.patronagePricedAt || l.date || '').slice(0, 10);
      if (leadDate && !leadDate.startsWith(selectedMois)) return;

      rows.push({
        leadId: l.id,
        date: leadDate || `${selectedMois}-01`,
        modele: l.type || 'Modèle Patronage',
        client: l.name || 'Client',
        price: Number(ext.patronagePrice) || 150,
        validated: Boolean(ext.clientValidated || l.status === 'completed'),
        alreadyImported: importedLeadIds.has(l.id),
      });
    });
    return rows;
  }, [selectedModelisteEmpId, activeEmployes, users, erpLeads, extras.modelLogs, selectedMois]);

  // ── HANDLERS ───────────────────────────────────────────────────────
  const openRuleConfig = (emp: Employe) => {
    const b = allBalances[emp.id];
    const existingRule = extras.rules.find(r => r.employeId === emp.id);
    setRuleForm({
      mode: b?.mode || emp.remunerationType || 'mensuel',
      tauxHoraire: existingRule?.tauxHoraire || b?.tauxHoraire || 17.1,
      tarifParModele: existingRule?.tarifParModele || b?.tarifParModele || 150,
      salaireMensuel: Number(emp.salaireMensuel) || 0,
    });
    setRuleModalEmp(emp);
  };

  const handleSaveRuleConfig = async () => {
    if (!ruleModalEmp) return;
    const savedRule = await savePayrollRule({
      id: `rh_rule_${ruleModalEmp.id}`,
      employeId: ruleModalEmp.id,
      mode: ruleForm.mode,
      tauxHoraire: Number(ruleForm.tauxHoraire) || 0,
      tarifParModele: Number(ruleForm.tarifParModele) || 0,
    });

    const updatedEmp: Employe = {
      ...ruleModalEmp,
      remunerationType: ruleForm.mode,
      salaireMensuel: Number(ruleForm.salaireMensuel) || 0,
    };

    const nextEmps = employes.map(e => (e.id === updatedEmp.id ? updatedEmp : e));
    setEmployes(nextEmps);
    saveLocalRH('employes', nextEmps);
    try { localStorage.setItem('textrack_data_employes', JSON.stringify(nextEmps)); } catch {}
    saveRecord('employes', updatedEmp, true).catch(() => {});

    setExtras(prev => ({
      ...prev,
      rules: [...prev.rules.filter(r => r.employeId !== updatedEmp.id), savedRule],
    }));
    setRuleModalEmp(null);
  };

  const openPayModal = (emp: Employe, defaultType: 'avance' | 'solde' = 'avance') => {
    const b = allBalances[emp.id];
    const suggested = b ? b.resteAPayer : 0;
    setPayForm({
      montant: defaultType === 'solde' ? suggested : Math.min(suggested, 500) || 200,
      typePaiement: defaultType,
      methode: 'especes',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setPayModalEmp(emp);
  };

  const handleSavePayment = async () => {
    if (!payModalEmp || !payForm.montant || payForm.montant <= 0) return;
    const labelPrefix = payForm.typePaiement === 'avance'
      ? (isAr ? 'تسبيق (Avance)' : 'Avance')
      : (isAr ? 'خلاص الحساب (Solde Paie)' : 'Solde Paie');
    const finalNotes = payForm.notes.trim() ? `${labelPrefix} — ${payForm.notes.trim()}` : labelPrefix;

    const newP: PaiementSalaire = {
      id: genId(),
      employeId: payModalEmp.id,
      montant: Number(payForm.montant),
      date: payForm.date || new Date().toISOString().slice(0, 10),
      mois: selectedMois,
      methode: payForm.methode,
      notes: finalNotes,
    };

    const nextPays = [...paiements, newP];
    setPaiements(nextPays);
    saveLocalRH('paiements_salaires', nextPays);
    await saveRecord('paiements_salaires', newP, true);

    // Sync Charge cleanly (identical to SuiviRH.tsx so Finance & Bilan stay 100% in sync!)
    const empNameStr = empName(payModalEmp);
    const newCharge: Charge = {
      id: genId(),
      designation: `${payForm.typePaiement === 'avance' ? 'Avance' : 'Paiement'} ${empNameStr} — ${moisLabel(selectedMois)}`,
      categorie: payModalEmp.type === 'sous_traitance' ? 'sous_traitance' : 'salaires',
      montant: Number(payForm.montant),
      date: newP.date,
      statut: 'payé',
      recurrence: payForm.typePaiement === 'avance' ? 'ponctuel' : 'mensuel',
      fournisseur: empNameStr,
      notes: finalNotes,
    };
    saveRecord('charges', newCharge, true).catch(() => {});

    setPayModalEmp(null);
  };

  const handleSaveAdjustment = async () => {
    if (!adjModalEmp || !adjForm.montant || adjForm.montant <= 0 || !adjForm.motif.trim()) return;
    const created = await savePayrollAdjustment({
      employeId: adjModalEmp.id,
      mois: selectedMois,
      date: adjForm.date || new Date().toISOString().slice(0, 10),
      type: adjForm.type,
      montant: Number(adjForm.montant),
      motif: adjForm.motif.trim(),
    });
    setExtras(prev => ({ ...prev, adjustments: [created, ...prev.adjustments] }));
    setAdjModalEmp(null);
  };

  const handleDeleteAdj = async (adjId: string) => {
    if (!window.confirm(isAr ? 'هل تريد حذف هذا التعديل من كشف الحساب؟' : 'Supprimer cet ajustement ?')) return;
    await deletePayrollAdjustment(adjId);
    setExtras(prev => ({ ...prev, adjustments: prev.adjustments.filter(a => a.id !== adjId) }));
  };

  const handleSavePresenceFix = async () => {
    if (!presenceEditModal) return;
    const updated: Presence = {
      id: presenceEditModal.presenceId || genId(),
      employeId: presenceEditModal.employeId,
      date: presenceEditModal.date,
      heureEntree: presenceEditModal.heureEntree || null,
      heureSortie: presenceEditModal.heureSortie || null,
      statut: presenceEditModal.statut,
    };
    setPresences(prev => {
      const exists = prev.some(p => p.id === updated.id);
      const next = exists ? prev.map(p => (p.id === updated.id ? updated : p)) : [...prev, updated];
      safeStorage.setItem('textrack_presences', JSON.stringify(next));
      return next;
    });
    await saveRecord('presences', updated, true);
    setPresenceEditModal(null);
  };

  const openAddModelFor = (empId: string) => {
    const emp = activeEmployes.find(e => e.id === empId);
    const b = emp ? allBalances[emp.id] : undefined;
    setModelForm({
      employeId: empId,
      date: `${selectedMois}-${String(new Date().getDate()).padStart(2, '0')}`.slice(0, 10),
      modeleName: '',
      client: '',
      typeTravail: 'patronage_complet',
      quantite: 1,
      tarifUnitaire: b?.tarifParModele || 150,
      statut: 'valide',
      notes: '',
    });
    setShowAddModelModal(true);
  };

  const handleSaveModelLog = async () => {
    if (!modelForm.employeId || !modelForm.modeleName.trim()) return;
    // Automatically ensure employee rule is set to 'modele' if they aren't yet
    const targetEmp = activeEmployes.find(e => e.id === modelForm.employeId);
    if (targetEmp && allBalances[targetEmp.id]?.mode !== 'modele') {
      const rule = await savePayrollRule({
        id: `rh_rule_${targetEmp.id}`,
        employeId: targetEmp.id,
        mode: 'modele',
        tauxHoraire: allBalances[targetEmp.id]?.tauxHoraire || 17.1,
        tarifParModele: Number(modelForm.tarifUnitaire) || 150,
      });
      const updatedEmp = { ...targetEmp, remunerationType: 'modele' as const };
      const nextEmps = employes.map(e => (e.id === updatedEmp.id ? updatedEmp : e));
      setEmployes(nextEmps);
      saveLocalRH('employes', nextEmps);
      saveRecord('employes', updatedEmp, true).catch(() => {});
      setExtras(prev => ({
        ...prev,
        rules: [...prev.rules.filter(r => r.employeId !== targetEmp.id), rule],
      }));
    }

    const saved = await saveModelisteWorkLog({
      employeId: modelForm.employeId,
      date: modelForm.date,
      modeleName: modelForm.modeleName.trim(),
      client: modelForm.client.trim() || 'Atelier',
      typeTravail: modelForm.typeTravail,
      quantite: Number(modelForm.quantite) || 1,
      tarifUnitaire: Number(modelForm.tarifUnitaire) || 0,
      statut: modelForm.statut,
      notes: modelForm.notes.trim(),
    });
    setExtras(prev => ({ ...prev, modelLogs: [saved, ...prev.modelLogs] }));
    setShowAddModelModal(false);
  };

  const handleImportErpModel = async (row: { leadId: string; date: string; modele: string; client: string; price: number; validated: boolean }) => {
    if (!selectedModelisteEmpId) return;
    const emp = activeEmployes.find(e => e.id === selectedModelisteEmpId);
    if (emp && allBalances[emp.id]?.mode !== 'modele') {
      const rule = await savePayrollRule({
        id: `rh_rule_${emp.id}`,
        employeId: emp.id,
        mode: 'modele',
        tauxHoraire: allBalances[emp.id]?.tauxHoraire || 17.1,
        tarifParModele: row.price || 150,
      });
      const updatedEmp = { ...emp, remunerationType: 'modele' as const };
      const nextEmps = employes.map(e => (e.id === updatedEmp.id ? updatedEmp : e));
      setEmployes(nextEmps);
      saveLocalRH('employes', nextEmps);
      saveRecord('employes', updatedEmp, true).catch(() => {});
      setExtras(prev => ({ ...prev, rules: [...prev.rules.filter(r => r.employeId !== emp.id), rule] }));
    }

    const saved = await saveModelisteWorkLog({
      employeId: selectedModelisteEmpId,
      date: row.date,
      modeleName: row.modele,
      client: row.client,
      typeTravail: 'patronage_complet',
      quantite: 1,
      tarifUnitaire: row.price,
      statut: row.validated ? 'valide' : 'en_attente',
      sourceLeadId: row.leadId,
      notes: 'Importé depuis Évaluation Patronage / Suivi Modéliste',
    });
    setExtras(prev => ({ ...prev, modelLogs: [saved, ...prev.modelLogs] }));
  };

  const handleToggleModelStatut = async (log: ModelisteWorkLog) => {
    const nextStatut: 'valide' | 'en_attente' = log.statut === 'valide' ? 'en_attente' : 'valide';
    const updated = await saveModelisteWorkLog({ ...log, statut: nextStatut });
    setExtras(prev => ({
      ...prev,
      modelLogs: prev.modelLogs.map(m => (m.id === updated.id ? updated : m)),
    }));
  };

  const handleDeleteModelLog = async (id: string) => {
    if (!window.confirm(isAr ? 'حذف هذا الموديل من بوانتاج الموديليست؟' : 'Supprimer ce modèle du pointage ?')) return;
    await deleteModelisteWorkLog(id);
    setExtras(prev => ({ ...prev, modelLogs: prev.modelLogs.filter(m => m.id !== id) }));
  };

  const sendWhatsAppReleve = (emp: Employe, b: WorkerBalanceSummary) => {
    const name = empName(emp);
    const activityLine = b.mode === 'horaire'
      ? `⏱️ ساعات العمل الصافية: ${b.totalHours} ساعة × ${b.tauxHoraire} درهم/س`
      : b.mode === 'modele'
      ? `✂️ الموديلات المصادق عليها: ${b.totalModelsValides} موديل`
      : `📅 الأجر الأساسي الشهري (${moisLabel(selectedMois)})`;

    const msg = isAr
      ? `السلام عليكم *${name}* 👋\n\nإليك كشف حسابك المفصل في ورشة *${company.name || 'BEYA CREATIVE'}* لشهر *${moisLabel(selectedMois)}*:\n\n${activityLine}\n• المستحق الأساسي: *${b.salaireBaseGagne.toLocaleString()} درهم*\n• المكافآت (+): *+${b.totalPrimes.toLocaleString()} درهم*\n• الاقتطاعات (-): *-${b.totalRetenues.toLocaleString()} درهم*\n• المجموع الصافي المكتسب: *${b.totalNetGagne.toLocaleString()} درهم*\n• التسبيقات والدفعات المستلمة: *-${b.totalPaye.toLocaleString()} درهم*\n\n──────────────\n💰 *الرصيد الباقي (Balance Net):* *${b.balanceNet >= 0 ? `+${b.balanceNet.toLocaleString()} درهم (لك)` : `-${b.avanceExcedentaire.toLocaleString()} درهم (تسبيق زائد)`}*\n──────────────\nمع تحيات الإدارة ✨`
      : `Bonjour *${name}* 👋\n\nVoici votre relevé de compte & balance chez *${company.name || 'BEYA CREATIVE'}* pour *${moisLabel(selectedMois)}* :\n\n${activityLine}\n• Base gagnée : *${b.salaireBaseGagne.toLocaleString()} MAD*\n• Primes (+) : *+${b.totalPrimes.toLocaleString()} MAD*\n• Retenues (-) : *-${b.totalRetenues.toLocaleString()} MAD*\n• Total Net Gagné : *${b.totalNetGagne.toLocaleString()} MAD*\n• Avances & Paiements reçus : *-${b.totalPaye.toLocaleString()} MAD*\n\n──────────────\n💰 *BALANCE NET RESTANTE :* *${b.balanceNet >= 0 ? `+${b.balanceNet.toLocaleString()} MAD` : `-${b.avanceExcedentaire.toLocaleString()} MAD (trop-perçu)`}*\n──────────────`;

    const phone = (emp.telephone || '').replace(/\D/g, '');
    const fullPhone = phone ? (phone.startsWith('0') ? '212' + phone.slice(1) : phone) : '';
    const url = fullPhone
      ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (loading) return <PageLoader />;

  const selectedHoraireEmp = hourlyEmps.find(e => e.id === selectedHoraireEmpId) || hourlyEmps[0] || null;
  const selectedHoraireBal = selectedHoraireEmp ? allBalances[selectedHoraireEmp.id] : null;

  const selectedModEmp = modelisteEmps.find(e => e.id === selectedModelisteEmpId) || modelisteEmps[0] || null;
  const selectedModBal = selectedModEmp ? allBalances[selectedModEmp.id] : null;

  const releveEmp = releveEmpId ? activeEmployes.find(e => e.id === releveEmpId) || null : null;
  const releveBal = releveEmp ? allBalances[releveEmp.id] : null;

  return (
    <div className="space-y-6 pb-20" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {isAr ? 'حسابات العمال والرصيد (Balance & Paie RH)' : 'Balance Comptes & Pointage Paie RH'}
              </h1>
              <p className="text-xs font-bold text-slate-500">
                {isAr
                  ? 'بوانتاج الساعة + بوانتاج الموديليست بالموديل + كشف الحساب والتسبيقات متزامن 100% مع RH'
                  : 'Pointage Horaire + Modélistes au Modèle + Balance Individuelle synchronisée à 100% avec RH'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/rh"
            className="px-4 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-1.5 shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? 'الموارد البشرية RH' : 'Suivi RH'}</span>
          </Link>
          <Link
            to="/pointage"
            className="px-4 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-700 hover:border-emerald-200 hover:text-emerald-600 transition flex items-center gap-1.5 shadow-xs"
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'سكان الحضور' : 'Pointage Live'}</span>
          </Link>
          <select
            value={selectedMois}
            onChange={e => setSelectedMois(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-indigo-100 rounded-2xl text-xs font-black text-slate-800 outline-none focus:border-indigo-500 shadow-xs"
          >
            {availableMois.map(m => (
              <option key={m} value={m}>{moisLabel(m)}</option>
            ))}
          </select>
          <button
            onClick={() => loadAll(true)}
            disabled={syncing}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث RH' : 'Sync RH'}</span>
          </button>
        </div>
      </div>

      {/* ── 4 UNIFIED KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[28px] border-2 border-slate-100 p-5 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {isAr ? 'إجمالي المستحق المكتسب' : 'Total Net Gagné (Brut)'}
          </p>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {kpis.totalNetGagne.toLocaleString()} <span className="text-xs text-slate-400">MAD</span>
          </p>
          <p className="text-[11px] font-bold text-indigo-600 mt-1">
            {isAr
              ? `ساعات: ${kpis.horaireCount} عمال • موديليست: ${kpis.modeleCount} • قار: ${kpis.mensuelCount}`
              : `Horaire: ${kpis.horaireCount} · Modèle: ${kpis.modeleCount} · Mensuel: ${kpis.mensuelCount}`}
          </p>
        </div>

        <div className="bg-emerald-50/70 rounded-[28px] border-2 border-emerald-100 p-5 shadow-xs">
          <p className="text-[10px] font-black text-emerald-700/70 uppercase tracking-widest mb-1">
            {isAr ? 'التسبيقات والمؤدى (RH + Charges)' : 'Avances & Payé (RH)'}
          </p>
          <p className="text-2xl font-black text-emerald-700 tabular-nums">
            {kpis.totalPaye.toLocaleString()} <span className="text-xs">MAD</span>
          </p>
          <p className="text-[11px] font-bold text-emerald-600 mt-1">
            {isAr ? 'مقيد أوتوماتيكياً في المصاريف' : 'Synchronisé avec Charges & RH'}
          </p>
        </div>

        <div className="bg-indigo-50/70 rounded-[28px] border-2 border-indigo-100 p-5 shadow-xs">
          <p className="text-[10px] font-black text-indigo-700/70 uppercase tracking-widest mb-1">
            {isAr ? 'حجم الإنتاج والساعات' : 'Volume Pointé du Mois'}
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-black text-indigo-900 tabular-nums">
              {kpis.totalHoursAll} <span className="text-xs font-bold">h</span>
            </p>
            <span className="text-slate-300 font-black">/</span>
            <p className="text-2xl font-black text-violet-700 tabular-nums">
              {kpis.totalModelsAll} <span className="text-xs font-bold">{isAr ? 'موديل' : 'mod.'}</span>
            </p>
          </div>
          <p className="text-[11px] font-bold text-indigo-600 mt-1">
            {isAr ? 'خصم الاستراحات التلقائي مفعل' : 'Pauses BeyaRules déduites'}
          </p>
        </div>

        <div className="bg-slate-900 text-white rounded-[28px] p-5 shadow-xl shadow-slate-900/15 relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {isAr ? 'الرصيد الصافي للأداء (Balance Net)' : 'Balance Net Restante à Payer'}
          </p>
          <p className="text-3xl font-black text-amber-400 tabular-nums">
            {kpis.totalResteAPayer.toLocaleString()} <span className="text-xs text-white/70">MAD</span>
          </p>
          {kpis.totalAvanceExc > 0 && (
            <p className="text-[11px] font-bold text-rose-400 mt-1">
              {isAr ? `تسبيقات زائدة على العمال: ${kpis.totalAvanceExc.toLocaleString()} MAD` : `Avances excédentaires: ${kpis.totalAvanceExc.toLocaleString()} MAD`}
            </p>
          )}
        </div>
      </div>

      {/* ── MAIN NAVIGATION TABS ── */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[24px] border-2 border-slate-100 shadow-xs">
        <button
          onClick={() => setActiveTab('balance')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'balance'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{isAr ? '⚖️ Balance حسابات العاملين' : '⚖️ Balance Comptes Ouvriers'}</span>
        </button>

        <button
          onClick={() => setActiveTab('horaire')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'horaire'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-indigo-50/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isAr ? `⏱️ بوانتاج الساعة (${kpis.horaireCount})` : `⏱️ Pointage Horaire (${kpis.horaireCount})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('modeliste')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'modeliste'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
              : 'text-slate-600 hover:bg-violet-50/50'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>{isAr ? `✂️ بوانتاج الموديليست (${modelisteEmps.length})` : `✂️ Pointage Modélistes (${modelisteEmps.length})`}</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MASTER BALANCE DES COMPTES TRAVAILLEURS                        */}
      {/* ===================================================================== */}
      {activeTab === 'balance' && (
        <div className="space-y-4">
          {/* Search & Mode Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-[24px] border-2 border-slate-100">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'بحث باسم العامل أو المنصب أو CIN...' : 'Rechercher employé, poste, CIN...'}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: isAr ? 'الكل' : 'Tous' },
                { id: 'horaire', label: isAr ? '⏱️ بالساعة' : '⏱️ Horaire' },
                { id: 'modele', label: isAr ? '✂️ بالموديل' : '✂️ Modélistes' },
                { id: 'mensuel', label: isAr ? '📅 شهري / قار' : '📅 Mensuel' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setModeFilter(f.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    modeFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts Ledger Table */}
          <div className="bg-white rounded-[28px] border-2 border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[920px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'العامل والنظام' : 'Employé & Mode'}</th>
                    <th className="p-4 text-center">{isAr ? 'العمل المنجز' : 'Activité / Pointage'}</th>
                    <th className="p-4 text-center">{isAr ? 'المستحق الأساسي' : 'Base Gagnée'}</th>
                    <th className="p-4 text-center">{isAr ? 'مكافآت / اقتطاعات' : 'Primes / Retenues'}</th>
                    <th className="p-4 text-center">{isAr ? 'التسبيقات والأداء' : 'Avances & Payé'}</th>
                    <th className="p-4 text-center">{isAr ? 'الرصيد الصافي (Balance)' : 'Balance Net'}</th>
                    <th className="p-4 text-center">{isAr ? 'إجراءات سريعة' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBalanceEmps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                        {isAr ? 'لا يوجد عمال مطابقون للبحث' : 'Aucun employé trouvé'}
                      </td>
                    </tr>
                  ) : (
                    filteredBalanceEmps.map(emp => {
                      const b = allBalances[emp.id];
                      if (!b) return null;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Worker + Mode */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                {emp.photo ? (
                                  <img src={emp.photo} alt={emp.nom} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{(emp.prenom?.[0] || '') + (emp.nom?.[0] || '') || '??'}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm">{empName(emp)}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="text-[10px] font-bold text-slate-400">{emp.poste || 'Atelier'}</span>
                                  <button
                                    onClick={() => openRuleConfig(emp)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                                      b.mode === 'horaire'
                                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                        : b.mode === 'modele'
                                        ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={isAr ? 'انقر لتغيير طريقة الحساب والسعر' : 'Changer le mode de calcul et tarif'}
                                  >
                                    {b.mode === 'horaire' && `⏱️ ${b.tauxHoraire} MAD/h`}
                                    {b.mode === 'modele' && `✂️ ${b.tarifParModele} MAD/modèle`}
                                    {b.mode !== 'horaire' && b.mode !== 'modele' && (isAr ? '📅 قار' : '📅 Mensuel')}
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Activity / Pointage */}
                          <td className="p-4 text-center">
                            {b.mode === 'horaire' ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-black text-indigo-700 text-sm tabular-nums">{b.totalHours} h</span>
                                <span className="text-[10px] font-bold text-slate-400">{b.daysPresent} {isAr ? 'أيام' : 'jours'}</span>
                                {b.incompleteShiftsCount > 0 && (
                                  <button
                                    onClick={() => { setSelectedHoraireEmpId(emp.id); setActiveTab('horaire'); }}
                                    className="mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black"
                                  >
                                    ⚠️ {b.incompleteShiftsCount} {isAr ? 'خروج ناقص' : 'sortie manquante'}
                                  </button>
                                )}
                              </div>
                            ) : b.mode === 'modele' ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-black text-violet-700 text-sm tabular-nums">
                                  {b.totalModelsValides} {isAr ? 'موديل مصادق' : 'modèles'}
                                </span>
                                {b.totalModelsEnAttente > 0 && (
                                  <span className="text-[10px] font-bold text-amber-600">
                                    +{b.totalModelsEnAttente} {isAr ? 'قيد التأكيد' : 'en attente'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-bold text-slate-700 tabular-nums">{b.daysPresent} {isAr ? 'يوم حضور' : 'j présents'}</span>
                                {b.totalHours > 0 && (
                                  <span className="text-[10px] text-slate-400 tabular-nums">({b.totalHours} h)</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Base Earned */}
                          <td className="p-4 text-center font-black text-slate-800 tabular-nums">
                            {b.salaireBaseGagne.toLocaleString()} <span className="text-[10px] text-slate-400">MAD</span>
                          </td>

                          {/* Primes & Retenues */}
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-0.5 tabular-nums">
                              {b.totalPrimes > 0 && (
                                <span className="text-emerald-600 font-black">+{b.totalPrimes.toLocaleString()}</span>
                              )}
                              {b.totalRetenues > 0 && (
                                <span className="text-rose-600 font-black">-{b.totalRetenues.toLocaleString()}</span>
                              )}
                              {b.totalPrimes === 0 && b.totalRetenues === 0 && (
                                <span className="text-slate-300 font-bold">—</span>
                              )}
                            </div>
                          </td>

                          {/* Paid / Advances */}
                          <td className="p-4 text-center">
                            <span className="font-black text-emerald-700 tabular-nums">
                              {b.totalPaye.toLocaleString()} <span className="text-[10px]">MAD</span>
                            </span>
                            {b.paiementsList.length > 0 && (
                              <p className="text-[10px] text-slate-400 font-bold">
                                {b.paiementsList.length} {isAr ? 'دفعات' : 'vers.'}
                              </p>
                            )}
                          </td>

                          {/* Final Balance */}
                          <td className="p-4 text-center">
                            {b.balanceNet > 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs tabular-nums">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                +{b.balanceNet.toLocaleString()} MAD
                              </span>
                            ) : b.balanceNet < 0 ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs tabular-nums">
                                <ArrowDownRight className="w-3.5 h-3.5" />
                                -{b.avanceExcedentaire.toLocaleString()} MAD
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-black text-xs">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                {isAr ? 'خالص (0)' : 'Soldé (0)'}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setReleveEmpId(emp.id)}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                                title={isAr ? 'كشف الحساب المفصل للطباعة أو واتساب' : 'Voir le relevé complet'}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{isAr ? 'كشف' : 'Relevé'}</span>
                              </button>
                              <button
                                onClick={() => openPayModal(emp, b.resteAPayer > 0 ? 'solde' : 'avance')}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                                title={isAr ? 'أداء تسبيق أو خلاص' : 'Enregistrer avance ou paiement'}
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تسبيق/أداء' : 'Payer'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setAdjForm({ type: 'prime', montant: 0, motif: '', date: new Date().toISOString().slice(0, 10) });
                                  setAdjModalEmp(emp);
                                }}
                                className="p-1.5 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-xl transition cursor-pointer"
                                title={isAr ? 'إضافة مكافأة أو اقتطاع' : 'Ajouter Prime ou Retenue'}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: POINTAGE HORAIRE & PAIE (بوانتاج الساعة والخلاص)               */}
      {/* ===================================================================== */}
      {activeTab === 'horaire' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar: Hourly workers list + Quick Convert */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[28px] border-2 border-slate-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase">
                  {isAr ? 'عمال بوانتاج الساعة' : 'Ouvriers Payés à l\'Heure'}
                </h2>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black">
                  {hourlyEmps.length}
                </span>
              </div>

              {hourlyEmps.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-2 border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    {isAr
                      ? 'لا يوجد عامل مضبوط على "بوانتاج الساعة" بعد. اختر أي عامل لتفعيله!'
                      : 'Aucun employé configuré en mode Horaire. Convertissez un employé ci-dessous !'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hourlyEmps.map(emp => {
                    const b = allBalances[emp.id];
                    const isSel = selectedHoraireEmp?.id === emp.id;
                    return (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedHoraireEmpId(emp.id)}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                            : 'bg-slate-50 hover:bg-white border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className={isAr ? 'text-right' : 'text-left'}>
                          <p className="font-black text-xs">{empName(emp)}</p>
                          <p className={`text-[10px] font-bold ${isSel ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {b.tauxHoraire} MAD/h • {b.daysPresent} {isAr ? 'أيام' : 'j'}
                          </p>
                        </div>
                        <div className={isAr ? 'text-left' : 'text-right'}>
                          <p className="font-black text-sm tabular-nums">{b.totalHours} h</p>
                          <p className={`text-[10px] font-black tabular-nums ${isSel ? 'text-emerald-300' : 'text-emerald-600'}`}>
                            {b.salaireBaseGagne.toLocaleString()} MAD
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick convert any non-hourly worker to Hourly mode */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                  {isAr ? '+ تفعيل نظام الساعة لعامل آخر:' : '+ Passer un employé en mode Horaire :'}
                </label>
                <select
                  value=""
                  onChange={e => {
                    const emp = activeEmployes.find(x => x.id === e.target.value);
                    if (emp) {
                      setRuleForm({
                        mode: 'horaire',
                        tauxHoraire: allBalances[emp.id]?.tauxHoraire || 17.1,
                        tarifParModele: 150,
                        salaireMensuel: emp.salaireMensuel || 0,
                      });
                      setRuleModalEmp(emp);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="">{isAr ? '— اختر عامل لتحويله لنظام الساعة —' : '— Sélectionner un employé —'}</option>
                  {activeEmployes
                    .filter(e => allBalances[e.id]?.mode !== 'horaire')
                    .map(e => (
                      <option key={e.id} value={e.id}>{empName(e)} ({e.poste})</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right main area: Daily Hours Breakdown & Pointage Correction */}
          <div className="lg:col-span-8">
            {selectedHoraireEmp && selectedHoraireBal ? (
              <div className="bg-white rounded-[28px] border-2 border-slate-100 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{empName(selectedHoraireEmp)}</h3>
                    <p className="text-xs font-bold text-indigo-600">
                      {isAr ? 'سعر الساعة:' : 'Taux Horaire:'} <span className="font-mono font-black">{selectedHoraireBal.tauxHoraire} MAD/h</span>
                      {' · '}
                      {isAr ? 'مجموع الساعات:' : 'Total Net:'} <span className="font-black">{selectedHoraireBal.totalHours} h</span>
                      {' · '}
                      {isAr ? 'المكتسب:' : 'Gagné:'} <span className="font-black text-emerald-600">{selectedHoraireBal.salaireBaseGagne.toLocaleString()} MAD</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openRuleConfig(selectedHoraireEmp)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تعديل سعر الساعة' : 'Modifier Tarif/h'}</span>
                    </button>
                    <button
                      onClick={() => setPresenceEditModal({
                        employeId: selectedHoraireEmp.id,
                        date: `${selectedMois}-${String(new Date().getDate()).padStart(2, '0')}`.slice(0, 10),
                        heureEntree: '09:00',
                        heureSortie: '18:00',
                        statut: 'present',
                      })}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة يوم حضور' : 'Ajouter Présence'}</span>
                    </button>
                  </div>
                </div>

                {/* Rule Info Strip */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] font-bold text-indigo-800 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    {isAr
                      ? '💡 يتم حساب الساعات أوتوماتيكياً من سجل السكان (Pointage) مع خصم الاستراحات القانونية.'
                      : '💡 Heures nettes calculées automatiquement depuis le pointage (pauses légales déduites).'}
                  </span>
                  <button
                    onClick={() => setReleveEmpId(selectedHoraireEmp.id)}
                    className="underline font-black cursor-pointer"
                  >
                    {isAr ? 'فتح كشف الحساب والرصيد الكامل ↗' : 'Voir Balance & Relevé Complet ↗'}
                  </button>
                </div>

                {/* Daily Log Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase">
                        <th className={`p-3 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'التاريخ' : 'Date'}</th>
                        <th className="p-3 text-center">{isAr ? 'الدخول' : 'Entrée'}</th>
                        <th className="p-3 text-center">{isAr ? 'الخروج' : 'Sortie'}</th>
                        <th className="p-3 text-center">{isAr ? 'الساعات الصافية' : 'Heures Nettes'}</th>
                        <th className="p-3 text-center">{isAr ? 'المبلغ المكتسب' : 'Gain Jour'}</th>
                        <th className="p-3 text-center">{isAr ? 'تعديل' : 'Corriger'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedHoraireBal.hourLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                            {isAr
                              ? `لا توجد ساعات مسجلة في ${moisLabel(selectedMois)} لهذا العامل بعد.`
                              : `Aucun pointage enregistré pour ${moisLabel(selectedMois)}.`}
                          </td>
                        </tr>
                      ) : (
                        selectedHoraireBal.hourLogs.map(row => (
                          <tr key={row.presenceId} className={row.isIncomplete ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                            <td className="p-3 font-black text-slate-800 tabular-nums">
                              {row.date}
                              {row.statut === 'retard' && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px]">Retard</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-700">{row.heureEntree || '--:--'}</td>
                            <td className="p-3 text-center font-mono font-bold">
                              {row.heureSortie ? (
                                <span className="text-indigo-700">{row.heureSortie}</span>
                              ) : (
                                <span className="text-amber-600 font-black">{isAr ? 'ناقص ⚠️' : 'Manquant ⚠️'}</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-black tabular-nums text-slate-900">
                              {row.hours} h
                            </td>
                            <td className="p-3 text-center font-black tabular-nums text-emerald-700">
                              {row.earnedDay.toLocaleString()} MAD
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setPresenceEditModal({
                                  employeId: selectedHoraireEmp.id,
                                  presenceId: row.presenceId,
                                  date: row.date,
                                  heureEntree: row.heureEntree || '09:00',
                                  heureSortie: row.heureSortie || '18:00',
                                  statut: row.statut,
                                })}
                                className="p-1.5 bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-lg transition cursor-pointer"
                                title={isAr ? 'تعديل وقت الدخول/الخروج' : 'Modifier les heures'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[28px] border-2 border-slate-100 p-12 text-center text-slate-400 font-bold">
                {isAr ? 'اختر عاملاً من القائمة أو فعّل نظام الساعة لعامل جديد.' : 'Sélectionnez ou configurez un employé en mode Horaire.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: POINTAGE MODÉLISTE AU MODÈLE (بوانتاج الموديليست بالموديل)     */}
      {/* ===================================================================== */}
      {activeTab === 'modeliste' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Modélistes list */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[28px] border-2 border-slate-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 uppercase">
                  {isAr ? 'الموديليست والباطرونيير' : 'Modélistes & Patronniers'}
                </h2>
                <span className="px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-black">
                  {modelisteEmps.length}
                </span>
              </div>

              {modelisteEmps.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-2 border border-dashed border-slate-200">
                  <Scissors className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    {isAr
                      ? 'لا يوجد موديليست مفعّل بعد. اختر أي موظف لتفعيل خلاص الموديلات!'
                      : 'Aucun modéliste configuré. Activez le mode Modèle pour un employé ci-dessous.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {modelisteEmps.map(emp => {
                    const b = allBalances[emp.id];
                    const isSel = selectedModEmp?.id === emp.id;
                    return (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedModelisteEmpId(emp.id)}
                        className={`w-full p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/20'
                            : 'bg-slate-50 hover:bg-white border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className={isAr ? 'text-right' : 'text-left'}>
                          <p className="font-black text-xs">{empName(emp)}</p>
                          <p className={`text-[10px] font-bold ${isSel ? 'text-violet-200' : 'text-slate-400'}`}>
                            {b.mode === 'modele' ? `${b.tarifParModele} MAD/mod` : emp.poste}
                          </p>
                        </div>
                        <div className={isAr ? 'text-left' : 'text-right'}>
                          <p className="font-black text-sm tabular-nums">
                            {b.totalModelsValides} {isAr ? 'موديل' : 'mod.'}
                          </p>
                          <p className={`text-[10px] font-black tabular-nums ${isSel ? 'text-emerald-300' : 'text-emerald-600'}`}>
                            {b.salaireBaseGagne.toLocaleString()} MAD
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Convert any employee to Modéliste mode */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">
                  {isAr ? '+ تفعيل نظام الموديلات لموظف:' : '+ Activer Mode Modéliste pour :'}
                </label>
                <select
                  value=""
                  onChange={e => {
                    const emp = activeEmployes.find(x => x.id === e.target.value);
                    if (emp) {
                      setRuleForm({
                        mode: 'modele',
                        tauxHoraire: 17.1,
                        tarifParModele: 150,
                        salaireMensuel: emp.salaireMensuel || 0,
                      });
                      setRuleModalEmp(emp);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none focus:border-violet-500"
                >
                  <option value="">{isAr ? '— اختر موظف —' : '— Sélectionner un employé —'}</option>
                  {activeEmployes
                    .filter(e => !modelisteEmps.some(m => m.id === e.id))
                    .map(e => (
                      <option key={e.id} value={e.id}>{empName(e)} ({e.poste})</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right main area: Models Log + ERP Sync */}
          <div className="lg:col-span-8 space-y-5">
            {selectedModEmp && selectedModBal ? (
              <>
                <div className="bg-white rounded-[28px] border-2 border-slate-100 p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">{empName(selectedModEmp)}</h3>
                        {selectedModBal.mode !== 'modele' && (
                          <button
                            onClick={() => {
                              setRuleForm({
                                mode: 'modele',
                                tauxHoraire: selectedModBal.tauxHoraire,
                                tarifParModele: 150,
                                salaireMensuel: selectedModEmp.salaireMensuel || 0,
                              });
                              setRuleModalEmp(selectedModEmp);
                            }}
                            className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black cursor-pointer"
                          >
                            {isAr ? '⚠️ اضبط نظامه إلى "بالموديل"' : '⚠️ Passer en mode "Au Modèle"'}
                          </button>
                        )}
                      </div>
                      <p className="text-xs font-bold text-violet-700 mt-0.5">
                        {isAr ? 'موديلات مصادق عليها:' : 'Modèles validés:'} <span className="font-black">{selectedModBal.totalModelsValides}</span>
                        {' · '}
                        {isAr ? 'المكتسب:' : 'Gagné:'} <span className="font-black text-emerald-600">{selectedModBal.salaireBaseGagne.toLocaleString()} MAD</span>
                        {' · '}
                        {isAr ? 'الرصيد الباقي:' : 'Reste Balance:'} <span className="font-black text-slate-900">{selectedModBal.balanceNet.toLocaleString()} MAD</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPayModal(selectedModEmp, selectedModBal.resteAPayer > 0 ? 'solde' : 'avance')}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تسبيق / خلاص' : 'Payer'}</span>
                      </button>
                      <button
                        onClick={() => openAddModelFor(selectedModEmp.id)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAr ? '+ تسجيل موديل مخدوم' : '+ Pointer un Modèle'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Logged Models Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase">
                          <th className={`p-3 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'التاريخ' : 'Date'}</th>
                          <th className={`p-3 ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الموديل والعميل' : 'Modèle & Client'}</th>
                          <th className="p-3 text-center">{isAr ? 'نوع العمل' : 'Prestation'}</th>
                          <th className="p-3 text-center">{isAr ? 'الكمية × السعر' : 'Qté × Tarif'}</th>
                          <th className="p-3 text-center">{isAr ? 'المجموع' : 'Total'}</th>
                          <th className="p-3 text-center">{isAr ? 'الحالة' : 'Statut'}</th>
                          <th className="p-3 text-center">{isAr ? 'حذف' : 'Suppr.'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...selectedModBal.modelLogsValides, ...selectedModBal.modelLogsEnAttente].length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-10 text-center text-slate-400 font-bold">
                              {isAr
                                ? `لا يوجد أي موديل مسجل في ${moisLabel(selectedMois)} لهذا الموديليست. انقر على "+ تسجيل موديل مخدوم" أعلاه.`
                                : `Aucun modèle pointé pour ${moisLabel(selectedMois)}. Cliquez sur "+ Pointer un Modèle".`}
                            </td>
                          </tr>
                        ) : (
                          [...selectedModBal.modelLogsValides, ...selectedModBal.modelLogsEnAttente]
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .map(log => {
                              const total = (log.quantite || 1) * (log.tarifUnitaire || selectedModBal.tarifParModele);
                              return (
                                <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-mono font-bold text-slate-600">{log.date}</td>
                                  <td className="p-3">
                                    <p className="font-black text-slate-900">{log.modeleName}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{log.client}</p>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700">
                                      {isAr ? TRAVAIL_LABELS[log.typeTravail]?.ar : TRAVAIL_LABELS[log.typeTravail]?.fr}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold text-slate-700">
                                    {log.quantite} × {log.tarifUnitaire} MAD
                                  </td>
                                  <td className="p-3 text-center font-black text-violet-700 tabular-nums">
                                    {total.toLocaleString()} MAD
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleToggleModelStatut(log)}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                                        log.statut === 'valide'
                                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                      }`}
                                      title={isAr ? 'انقر لتبديل حالة المصادقة' : 'Basculer Validé / En attente'}
                                    >
                                      {log.statut === 'valide'
                                        ? (isAr ? '✓ مصادق ومحسوب' : '✓ Validé')
                                        : (isAr ? '⏳ قيد المراجعة' : '⏳ En attente')}
                                    </button>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteModelLog(log.id)}
                                      className="p-1.5 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ERP Patronage Sync Box */}
                {erpModelsForSelectedModeliste.length > 0 && (
                  <div className="bg-violet-50/60 border-2 border-violet-100 rounded-[28px] p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-black text-violet-900 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        <span>{isAr ? 'موديلات مسعّرة في قسم "تسعير الباترون / الموديليست" (للاستيراد الفوري):' : 'Modèles trouvés dans Évaluation Patronage ERP :'}</span>
                      </h4>
                      <Link to="/suivi-modeliste" className="text-[11px] font-black text-violet-700 underline">
                        {isAr ? 'فتح تتبع الموديليست ↗' : 'Ouvrir Suivi Modéliste ↗'}
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {erpModelsForSelectedModeliste.map(row => (
                        <div key={row.leadId} className="bg-white p-3 rounded-2xl border border-violet-100 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-black text-xs text-slate-900 truncate">{row.modele}</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate">
                              {row.client} • {row.date} • <span className="text-violet-700 font-black">{row.price} MAD</span>
                            </p>
                          </div>
                          {row.alreadyImported ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black shrink-0">
                              ✓ {isAr ? 'مدرج' : 'Inclus'}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleImportErpModel(row)}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-black shrink-0 cursor-pointer"
                            >
                              {isAr ? '+ احتساب فالبوانتاج' : '+ Importer'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[28px] border-2 border-slate-100 p-12 text-center text-slate-400 font-bold">
                {isAr ? 'اختر موديليست من القائمة لعرض أو تسجيل الموديلات المخدومة.' : 'Sélectionnez un modéliste dans la liste.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: RELEVÉ DE COMPTE INDIVIDUEL / FICHE DE PAIE (IMPRIMABLE & WA)  */}
      {/* ===================================================================== */}
      {releveEmp && releveBal && (
        <div className="fixed inset-0 z-[200] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-base uppercase tracking-tight">
                  {isAr ? `كشف حساب العامل — ${empName(releveEmp)}` : `Relevé de Compte & Balance — ${empName(releveEmp)}`}
                </h3>
                <p className="text-[11px] font-bold text-slate-400">{moisLabel(selectedMois)} · {releveEmp.poste}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => sendWhatsAppReleve(releveEmp, releveBal)}
                  className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال واتساب للعامل' : 'WhatsApp'}</span>
                </button>
                <button
                  onClick={() => printElement('releve-paie-a4')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة' : 'Imprimer'}</span>
                </button>
                <button
                  onClick={() => setReleveEmpId(null)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6" id="releve-paie-a4">
              {/* Top Company + Worker Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase">{company.name || 'BEYA CREATIVE'}</h2>
                  <p className="text-[11px] font-bold text-slate-500">
                    {isAr ? 'كشف حساب الأجير وبوانتاج الإنتاج' : 'Bulletin de Balance & Pointage RH'} — {moisLabel(selectedMois)}
                  </p>
                </div>
                <div className={isAr ? 'text-left' : 'text-right'}>
                  <p className="font-black text-sm text-slate-900">{empName(releveEmp)}</p>
                  <p className="text-[11px] font-bold text-indigo-600">{releveEmp.poste} · CIN: {releveEmp.cin || '—'}</p>
                </div>
              </div>

              {/* Balance Summary Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'المستحق الأساسي' : 'Base Gagnée'}</p>
                  <p className="text-lg font-black text-slate-900 tabular-nums">{releveBal.salaireBaseGagne.toLocaleString()} MAD</p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">{isAr ? 'مكافآت (+)' : 'Primes (+)'}</p>
                  <p className="text-lg font-black text-emerald-700 tabular-nums">+{releveBal.totalPrimes.toLocaleString()} MAD</p>
                </div>
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase">{isAr ? 'اقتطاعات (-)' : 'Retenues (-)'}</p>
                  <p className="text-lg font-black text-rose-700 tabular-nums">-{releveBal.totalRetenues.toLocaleString()} MAD</p>
                </div>
                <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase">{isAr ? 'التسبيقات والأداء (-)' : 'Payé / Avances (-)'}</p>
                  <p className="text-lg font-black text-indigo-700 tabular-nums">-{releveBal.totalPaye.toLocaleString()} MAD</p>
                </div>
              </div>

              {/* Net Balance Callout */}
              <div className={`p-4 rounded-2xl flex items-center justify-between ${
                releveBal.balanceNet >= 0 ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'
              }`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    {isAr ? 'الرصيد الصافي النهائي (Balance Net)' : 'SOLDE NET FINAL (BALANCE)'}
                  </p>
                  <p className="text-xs font-bold mt-0.5">
                    {releveBal.balanceNet > 0
                      ? (isAr ? 'المبلغ الباقي المستحق للعامل' : 'Montant restant dû à l\'employé')
                      : releveBal.balanceNet < 0
                      ? (isAr ? 'تسبيق زائد (مسال للشركة على العامل)' : 'Avance excédentaire à déduire')
                      : (isAr ? 'الحساب مسوّى بالكامل' : 'Compte soldé à zéro')}
                  </p>
                </div>
                <p className="text-3xl font-black tabular-nums text-amber-400">
                  {releveBal.balanceNet >= 0 ? `+${releveBal.balanceNet.toLocaleString()}` : `-${releveBal.avanceExcedentaire.toLocaleString()}`} MAD
                </p>
              </div>

              {/* Work Details by Mode */}
              {releveBal.mode === 'horaire' && releveBal.hourLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isAr ? `تفصيل ساعات البوانتاج (${releveBal.totalHours}h × ${releveBal.tauxHoraire} MAD/h)` : `Détail des Heures Pointées (${releveBal.totalHours}h × ${releveBal.tauxHoraire} MAD/h)`}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {releveBal.hourLogs.map(h => (
                      <div key={h.presenceId} className="flex justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-mono font-bold text-slate-700">{h.date} ({h.heureEntree || '--'} → {h.heureSortie || '--'})</span>
                        <span className="font-black text-indigo-700">{h.hours}h = {h.earnedDay} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {releveBal.mode === 'modele' && releveBal.modelLogsValides.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isAr ? `تفصيل الموديلات المصادق عليها (${releveBal.totalModelsValides})` : `Détail des Modèles Validés (${releveBal.totalModelsValides})`}
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {releveBal.modelLogsValides.map(m => (
                      <div key={m.id} className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">{m.date} · {m.modeleName} ({m.client})</span>
                        <span className="font-black text-violet-700">{m.quantite} × {m.tarifUnitaire} = {(m.quantite * m.tarifUnitaire).toLocaleString()} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primes & Retenues List */}
              {(releveBal.primesList.length > 0 || releveBal.retenuesList.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isAr ? 'المكافآت والاقتطاعات (مع السبب)' : 'Primes & Retenues (Détail)'}
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {[...releveBal.primesList, ...releveBal.retenuesList].map(adj => (
                      <div key={adj.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <span className={`font-black ${adj.type === 'prime' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {adj.type === 'prime' ? '+' : '-'}{adj.montant.toLocaleString()} MAD
                          </span>
                          <span className="mx-2 text-slate-400">·</span>
                          <span className="font-bold text-slate-800">{adj.motif}</span>
                          <span className="ml-2 text-[10px] text-slate-400 font-mono">({adj.date})</span>
                        </div>
                        <button onClick={() => handleDeleteAdj(adj.id)} className="text-slate-300 hover:text-rose-600 cursor-pointer print:hidden">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advances / Payments History */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  {isAr ? 'التسبيقات والأداءات المستلمة' : 'Historique des Avances & Paiements Reçus'}
                </h4>
                {releveBal.paiementsList.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold italic">{isAr ? 'لم يستلم أي تسبيق أو راتب هذا الشهر بعد.' : 'Aucun versement reçu ce mois-ci.'}</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {releveBal.paiementsList.map(p => (
                      <div key={p.id} className="flex justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="font-bold text-slate-800">{p.date} · <span className="uppercase text-indigo-600">{p.methode}</span> {p.notes ? `— ${p.notes}` : ''}</span>
                        <span className="font-black text-emerald-700 tabular-nums">-{p.montant.toLocaleString()} MAD</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIGURE WORKER MODE & RATES (Horaire / Modéliste / Mensuel)  */}
      {/* ===================================================================== */}
      {ruleModalEmp && (
        <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">{empName(ruleModalEmp)}</h3>
                <p className="text-[11px] font-bold text-slate-400">{isAr ? 'ضبط نظام الخلاص المتزامن مع RH' : 'Configurer le Mode de Paie & Tarif'}</p>
              </div>
              <button onClick={() => setRuleModalEmp(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">{isAr ? 'نظام الحساب' : 'Mode de Rémunération'}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'horaire', label: isAr ? '⏱️ بالساعة (Pointage)' : '⏱️ Par Heure' },
                    { id: 'modele', label: isAr ? '✂️ بالموديل (Modéliste)' : '✂️ Au Modèle' },
                    { id: 'mensuel', label: isAr ? '📅 قار شهري' : '📅 Mensuel Fixe' },
                    { id: 'hebdomadaire', label: isAr ? '📆 أسبوعي' : '📆 Hebdomadaire' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRuleForm(prev => ({ ...prev, mode: opt.id as ExtendedRemunerationType }))}
                      className={`p-3 rounded-2xl border-2 text-xs font-black transition cursor-pointer ${
                        ruleForm.mode === opt.id
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {ruleForm.mode === 'horaire' && (
                <div>
                  <label className="block text-[10px] font-black text-indigo-600 uppercase mb-1.5">
                    {isAr ? 'ثمن الساعة الواحدة (درهم/ساعة)' : 'Taux Horaire (MAD / heure)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={ruleForm.tauxHoraire}
                    onChange={e => setRuleForm(prev => ({ ...prev, tauxHoraire: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-3.5 text-lg font-black text-slate-900 outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {isAr ? `مثال: 200 ساعة × ${ruleForm.tauxHoraire} درهم = ${(200 * ruleForm.tauxHoraire).toLocaleString()} درهم` : `Ex: 200h × ${ruleForm.tauxHoraire} MAD = ${(200 * ruleForm.tauxHoraire).toLocaleString()} MAD`}
                  </p>
                </div>
              )}

              {ruleForm.mode === 'modele' && (
                <div>
                  <label className="block text-[10px] font-black text-violet-600 uppercase mb-1.5">
                    {isAr ? 'ثمن الموديل الافتراضي (درهم/موديل)' : 'Tarif par Modèle par défaut (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={ruleForm.tarifParModele}
                    onChange={e => setRuleForm(prev => ({ ...prev, tarifParModele: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-violet-50/50 border-2 border-violet-200 rounded-2xl p-3.5 text-lg font-black text-slate-900 outline-none focus:border-violet-500"
                  />
                </div>
              )}

              {(ruleForm.mode === 'mensuel' || ruleForm.mode === 'hebdomadaire') && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">
                    {isAr ? 'الأجر القار الأساسي (درهم)' : 'Salaire Base Mensuel / Hebdo (MAD)'}
                  </label>
                  <input
                    type="number"
                    value={ruleForm.salaireMensuel}
                    onChange={e => setRuleForm(prev => ({ ...prev, salaireMensuel: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 text-lg font-black text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setRuleModalEmp(null)} className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 cursor-pointer">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleSaveRuleConfig} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer">
                {isAr ? 'حفظ ومزامنة مع RH' : 'Enregistrer & Sync RH'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PAYER / AVANCE (SYNCS TO paiements_salaires & charges)         */}
      {/* ===================================================================== */}
      {payModalEmp && (
        <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">{isAr ? 'تسجيل تسبيق أو أداء' : 'Enregistrer Avance / Paiement'}</h3>
                <p className="text-xs font-bold text-indigo-600">{empName(payModalEmp)} · {moisLabel(selectedMois)}</p>
              </div>
              <button onClick={() => setPayModalEmp(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayForm(prev => ({ ...prev, typePaiement: 'avance' }))}
                  className={`py-2.5 rounded-xl text-xs font-black border-2 cursor-pointer ${
                    payForm.typePaiement === 'avance' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  {isAr ? '⚡ تسبيق (Avance)' : '⚡ Avance'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const b = allBalances[payModalEmp.id];
                    setPayForm(prev => ({ ...prev, typePaiement: 'solde', montant: b ? b.resteAPayer : prev.montant }));
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black border-2 cursor-pointer ${
                    payForm.typePaiement === 'solde' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  {isAr ? '✅ تصفية الرصيد (Solde)' : '✅ Solde de Paie'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'المبلغ (درهم MAD)' : 'Montant (MAD)'}</label>
                <input
                  type="number"
                  value={payForm.montant}
                  onChange={e => setPayForm(prev => ({ ...prev, montant: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 text-2xl font-black text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'التاريخ' : 'Date'}</label>
                  <input
                    type="date"
                    value={payForm.date}
                    onChange={e => setPayForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'الطريقة' : 'Méthode'}</label>
                  <select
                    value={payForm.methode}
                    onChange={e => setPayForm(prev => ({ ...prev, methode: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="especes">{isAr ? 'نقداً' : 'Espèces'}</option>
                    <option value="virement">{isAr ? 'تحويل بنكي' : 'Virement'}</option>
                    <option value="cheque">{isAr ? 'شيك' : 'Chèque'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'ملاحظة للعامل (اختياري)' : 'Note / Détail (Optionnel)'}</label>
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={e => setPayForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isAr ? 'مثال: تسبيق نهاية الأسبوع' : 'Ex: Avance fin de semaine'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setPayModalEmp(null)} className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 cursor-pointer">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleSavePayment} className="flex-1 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer transition">
                {isAr ? 'تأكيد الأداء ✓' : 'Confirmer Paiement ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD PRIME / RETENUE (مكافأة أو اقتطاع مع السبب)                */}
      {/* ===================================================================== */}
      {adjModalEmp && (
        <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">{isAr ? 'مكافأة (+) أو اقتطاع (-)' : 'Prime (+) ou Retenue (-)'}</h3>
                <p className="text-xs font-bold text-indigo-600">{empName(adjModalEmp)}</p>
              </div>
              <button onClick={() => setAdjModalEmp(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjForm(prev => ({ ...prev, type: 'prime' }))}
                  className={`py-2.5 rounded-xl text-xs font-black border-2 cursor-pointer ${
                    adjForm.type === 'prime' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  {isAr ? '➕ مكافأة / ساعات إضافية' : '➕ Prime / Bonus'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjForm(prev => ({ ...prev, type: 'retenue' }))}
                  className={`py-2.5 rounded-xl text-xs font-black border-2 cursor-pointer ${
                    adjForm.type === 'retenue' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  {isAr ? '➖ اقتطاع / غياب / تأخير' : '➖ Retenue / Pénalité'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'المبلغ (درهم)' : 'Montant (MAD)'}</label>
                <input
                  type="number"
                  value={adjForm.montant}
                  onChange={e => setAdjForm(prev => ({ ...prev, montant: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xl font-black text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'السبب (يظهر للعامل في حسابه)' : 'Motif (Visible par l\'employé)'}</label>
                <input
                  type="text"
                  value={adjForm.motif}
                  onChange={e => setAdjForm(prev => ({ ...prev, motif: e.target.value }))}
                  placeholder={adjForm.type === 'prime' ? (isAr ? 'مثال: مكافأة جودة أو 4 ساعات إضافية' : 'Ex: Heures supp / Prime objectif') : (isAr ? 'مثال: تأخير يوم الثلاثاء أو خطأ في الفصالة' : 'Ex: Absence / Retouche pièce')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setAdjModalEmp(null)} className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 cursor-pointer">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleSaveAdjustment} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer">
                {isAr ? 'حفظ في الرصيد' : 'Appliquer au Solde'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: FIX / ADD HOURLY POINTAGE (SYNCS TO presences TABLE)           */}
      {/* ===================================================================== */}
      {presenceEditModal && (
        <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 uppercase">{isAr ? 'تعديل / تسجيل ساعات الحضور' : 'Corriger / Ajouter Pointage'}</h3>
              <button onClick={() => setPresenceEditModal(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'التاريخ' : 'Date'}</label>
                <input
                  type="date"
                  value={presenceEditModal.date}
                  onChange={e => setPresenceEditModal(prev => prev ? { ...prev, date: e.target.value } : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'ساعة الدخول' : 'Entrée'}</label>
                  <input
                    type="time"
                    value={presenceEditModal.heureEntree}
                    onChange={e => setPresenceEditModal(prev => prev ? { ...prev, heureEntree: e.target.value } : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'ساعة الخروج' : 'Sortie'}</label>
                  <input
                    type="time"
                    value={presenceEditModal.heureSortie}
                    onChange={e => setPresenceEditModal(prev => prev ? { ...prev, heureSortie: e.target.value } : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono font-black"
                  />
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-xs font-black text-indigo-800 text-center">
                {isAr ? 'الساعات الصافية المحسوبة:' : 'Heures nettes calculées:'}{' '}
                {calculateWorkingHours(presenceEditModal.heureEntree, presenceEditModal.heureSortie, presenceEditModal.date).toFixed(2)} h
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setPresenceEditModal(null)} className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 cursor-pointer">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleSavePresenceFix} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black cursor-pointer">
                {isAr ? 'حفظ الحضور ✓' : 'Enregistrer ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD MODELISTE WORK LOG (+ تسجيل موديل مخدوم)                  */}
      {/* ===================================================================== */}
      {showAddModelModal && (
        <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">{isAr ? 'تسجيل موديل في بوانتاج الموديليست' : 'Pointer un Modèle (Modéliste)'}</h3>
              <button onClick={() => setShowAddModelModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-3.5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'اسم الموديل / المرجع' : 'Nom du Modèle / Réf'}</label>
                <input
                  type="text"
                  value={modelForm.modeleName}
                  onChange={e => setModelForm(prev => ({ ...prev, modeleName: e.target.value }))}
                  placeholder={isAr ? 'مثال: فيست كول أوفيسييه أزرار براندبورغ' : 'Ex: Veste Col Officier Brandebourgs'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'الزبون / البراند' : 'Client / Marque'}</label>
                  <input
                    type="text"
                    value={modelForm.client}
                    onChange={e => setModelForm(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Atelier / Brand..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'التاريخ' : 'Date'}</label>
                  <input
                    type="date"
                    value={modelForm.date}
                    onChange={e => setModelForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'نوع الخدمة المنجزة' : 'Type de Travail'}</label>
                <select
                  value={modelForm.typeTravail}
                  onChange={e => setModelForm(prev => ({ ...prev, typeTravail: e.target.value as ModelTravailType }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  {(Object.keys(TRAVAIL_LABELS) as ModelTravailType[]).map(k => (
                    <option key={k} value={k}>{isAr ? TRAVAIL_LABELS[k].ar : TRAVAIL_LABELS[k].fr}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{isAr ? 'الكمية (عدد الموديلات)' : 'Nombre de Modèles'}</label>
                  <input
                    type="number"
                    min={1}
                    value={modelForm.quantite}
                    onChange={e => setModelForm(prev => ({ ...prev, quantite: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-violet-600 uppercase mb-1">{isAr ? 'الثمن للموديل (درهم)' : 'Tarif / Modèle (MAD)'}</label>
                  <input
                    type="number"
                    value={modelForm.tarifUnitaire}
                    onChange={e => setModelForm(prev => ({ ...prev, tarifUnitaire: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-violet-50 border border-violet-200 rounded-xl p-2.5 text-sm font-black text-violet-900"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setShowAddModelModal(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 cursor-pointer">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleSaveModelLog} className="flex-1 py-3 bg-violet-600 text-white rounded-2xl text-xs font-black shadow-lg cursor-pointer">
                {isAr ? 'تسجيل الموديل ✓' : 'Enregistrer Modèle ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
