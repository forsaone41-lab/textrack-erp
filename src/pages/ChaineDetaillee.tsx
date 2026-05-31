import { useState, useEffect, useMemo } from 'react';
import { 
  Factory, 
  Settings, 
  Users, 
  Clock, 
  Save, 
  Plus, 
  Trash2, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle,
  LayoutDashboard,
  CheckCircle2,
  Timer,
  QrCode,
  Printer,
  Calendar,
  UserPlus,
  RefreshCw,
  Zap,
  ArrowRight,
  PackageCheck,
  X,
  Sparkles,
  Trophy,
  Scissors,
  Shirt,
  Layers,
  Wind,
  Package,
  Wand2,
  Gauge,
  Gauge,
  Stitch,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Commande, 
  Employe, 
  OperationModele, 
  SuiviHoraire, 
  loadData, 
  saveRecord, 
  genId,
  deleteRecord
} from '../types';
import { useLang } from '../contexts/LangContext';

const HEURES_TRAVAIL = [
  '00:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00',
  '04:00 - 05:00', '05:00 - 06:00', '06:00 - 07:00', '07:00 - 08:00',
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
  '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
  '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00'
];

interface AssignmentDetail {
  empId: string;
  startHour: string;
  endHour: string;
}

export default function ChaineDetaillee() {
  const { isAr } = useLang();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [operations, setOperations] = useState<OperationModele[]>([]);
  const [suivi, setSuivi] = useState<SuiviHoraire[]>([]);
  
  const [selectedCmdId, setSelectedCmdId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'config' | 'suivi' | 'stats' | 'planning'>('planning');
  const [activeShift, setActiveShift] = useState<'jour' | 'nuit'>('jour');
  const [loading, setLoading] = useState(true);

  // Planning state
  const [assignments, setAssignments] = useState<Record<string, AssignmentDetail>>({});
  const [syncing, setSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [showOpModal, setShowOpModal] = useState(false);
  const [opForm, setOpForm] = useState<Partial<OperationModele>>({});
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrPost, setQrPost] = useState<OperationModele | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<Record<string, string>>({});
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [imageMode, setImageMode] = useState<'photo' | 'sketch'>('photo');

  // Qty tracking state
  const [editingQty, setEditingQty] = useState(false);
  const [qtyForm, setQtyForm] = useState({ echantillon: 0, production: 0 });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<Employe>('employes'),
      loadData<OperationModele>('operations_modele'),
      loadData<SuiviHoraire>('suivi_horaire')
    ]).then(([cmds, emps, ops, s]) => {
      setCommandes(cmds.filter(c => c.statut === 'en_cours'));
      setEmployes(emps.filter(e => e.actif));
      setOperations(ops);
      setSuivi(s);
      
      if (cmds.length > 0 && !selectedCmdId) {
        const first = cmds.find(c => c.statut === 'en_cours');
        if (first) setSelectedCmdId(first.id);
      }
      setLoading(false);
    });
  }, []);

  const selectedCmd = useMemo(() => 
    commandes.find(c => c.id === selectedCmdId), [commandes, selectedCmdId]);

  useEffect(() => {
    if (selectedCmd) {
      setQtyForm({
        echantillon: selectedCmd.quantiteEchantillon || 0,
        production: selectedCmd.quantiteProduction || selectedCmd.quantite || 0
      });
      setEditingQty(false);
    }
  }, [selectedCmd]);

  async function handleSaveQty() {
    if (!selectedCmd) return;
    const updated = {
      ...selectedCmd,
      quantiteEchantillon: qtyForm.echantillon,
      quantiteProduction: qtyForm.production,
      quantite: qtyForm.echantillon + qtyForm.production
    };
    setCommandes(commandes.map(c => c.id === selectedCmd.id ? updated : c));
    setEditingQty(false);
    await saveRecord('commandes', updated);
  }

  const modelOps = useMemo(() => 
    operations.filter(o => o.modele === selectedCmd?.modele)
    .sort((a, b) => a.ordre_sequence - b.ordre_sequence), [operations, selectedCmd]);

  const today = new Date().toISOString().split('T')[0];
  const todaySuivi = useMemo(() => 
    suivi.filter(s => s.commande_id === selectedCmdId && s.date_production === today), 
    [suivi, selectedCmdId, today]);

  const filteredHours = useMemo(() => {
    if (activeShift === 'jour') {
      return HEURES_TRAVAIL.filter(h => {
        const hour = parseInt(h.split(':')[0]);
        return hour >= 8 && hour < 20;
      });
    } else {
      return HEURES_TRAVAIL.filter(h => {
        const hour = parseInt(h.split(':')[0]);
        return hour >= 20 || hour < 8;
      });
    }
  }, [activeShift]);

  const availableHours = useMemo(() => {
    return filteredHours.map(h => h.split(' - ')[0]);
  }, [filteredHours]);

  // Load current assignments from existing suivi
  useEffect(() => {
    if (modelOps.length > 0 && todaySuivi.length > 0) {
      const currentMap: Record<string, AssignmentDetail> = {};
      modelOps.forEach(op => {
        const entries = todaySuivi.filter(s => s.operation_id === op.id && s.employe_id);
        if (entries.length > 0) {
          const sorted = entries.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
          currentMap[op.id] = {
            empId: sorted[0].employe_id!,
            startHour: sorted[0].heure_debut,
            endHour: sorted[sorted.length - 1].heure_debut
          };
        }
      });
      modelOps.forEach(op => {
        if (!currentMap[op.id]) {
          currentMap[op.id] = {
            empId: '',
            startHour: availableHours[0] || '08:00',
            endHour: availableHours[availableHours.length - 1] || '18:00'
          };
        }
      });
      setAssignments(currentMap);
    } else if (modelOps.length > 0) {
       const initial: Record<string, AssignmentDetail> = {};
       modelOps.forEach(op => {
         initial[op.id] = {
           empId: '',
           startHour: availableHours[0] || '08:00',
           endHour: availableHours[availableHours.length - 1] || '18:00'
         };
       });
       setAssignments(initial);
    }
  }, [modelOps, todaySuivi, availableHours]);

  async function handleAddOperation() {
    if (!selectedCmd || !opForm.nom_operation) return;
    
    const newOp: OperationModele = {
      id: genId(),
      modele: selectedCmd.modele,
      nom_operation: opForm.nom_operation,
      target_heure: opForm.target_heure || 40,
      ordre_sequence: modelOps.length + 1
    };

    const updated = [...operations, newOp];
    setOperations(updated);
    setShowOpModal(false);
    setOpForm({});
    await saveRecord('operations_modele', newOp);
  }

  async function handleDeleteOp(id: string) {
    if (!confirm('Supprimer cette opération ?')) return;
    setOperations(operations.filter(o => o.id !== id));
    await deleteRecord('operations_modele', id);
  }

  async function suggestOperationsByAI() {
    if (!selectedCmd) return;
    const modelLower = selectedCmd.modele.toLowerCase();
    
    let suggestedOps: { nom: string; target: number }[] = [];
    
    if (modelLower.includes('t-shirt') || modelLower.includes('tshirt') || modelLower.includes('تيشيرت') || modelLower.includes('قميص')) {
      suggestedOps = [
        { nom: 'Assemblage épaules', target: 80 },
        { nom: 'Pose col', target: 60 },
        { nom: 'Manches', target: 70 },
        { nom: 'Côtés', target: 65 },
        { nom: 'Ourlet bas', target: 75 }
      ];
    } else if (modelLower.includes('pantalon') || modelLower.includes('jeans') || modelLower.includes('سروال')) {
      suggestedOps = [
        { nom: 'Surjet', target: 100 },
        { nom: 'Assemblage fourche', target: 50 },
        { nom: 'Poches', target: 45 },
        { nom: 'Côtés et entrejambe', target: 40 },
        { nom: 'Ceinture', target: 35 },
        { nom: 'Ourlet', target: 60 }
      ];
    } else if (modelLower.includes('veste') || modelLower.includes('manteau') || modelLower.includes('جاكيت')) {
      suggestedOps = [
        { nom: 'Préparation Poches', target: 30 },
        { nom: 'Assemblage Corps', target: 20 },
        { nom: 'Manches', target: 25 },
        { nom: 'Col et Doublure', target: 15 },
        { nom: 'Finition', target: 20 }
      ];
    } else {
      suggestedOps = [
        { nom: 'Coupe / Préparation', target: 50 },
        { nom: 'Assemblage 1', target: 40 },
        { nom: 'Assemblage 2', target: 40 },
        { nom: 'Finition', target: 50 },
        { nom: 'Repassage', target: 60 }
      ];
    }

    const confirmMsg = isAr 
      ? `يقترح الذكاء الاصطناعي إضافة ${suggestedOps.length} مهام قياسية للموديل "${selectedCmd.modele}". هل تريد المتابعة؟`
      : `L'IA propose d'ajouter ${suggestedOps.length} postes standards pour le modèle "${selectedCmd.modele}". Voulez-vous continuer ?`;

    if (!confirm(confirmMsg)) return;

    let startOrder = modelOps.length;
    const newOps: OperationModele[] = suggestedOps.map((op, idx) => ({
      id: genId(),
      modele: selectedCmd.modele,
      nom_operation: op.nom,
      target_heure: op.target,
      ordre_sequence: startOrder + idx + 1
    }));

    const updated = [...operations, ...newOps];
    setOperations(updated);
    
    await Promise.all(newOps.map(op => saveRecord('operations_modele', op)));
  }

  async function handleUpdateSuivi(opId: string, empId: string, heure: string, qte: number) {
    const [hDebut, hFin] = heure.split(' - ');
    
    const existing = todaySuivi.find(s => 
      s.operation_id === opId && 
      s.heure_debut === hDebut
    );

    const newEntry: any = {
      id: existing?.id || genId(),
      commande_id: selectedCmdId,
      employe_id: empId || null,
      operation_id: opId,
      heure_debut: hDebut,
      heure_fin: hFin,
      quantite_realisee: qte,
      date_production: today
    };

    if (!empId && (!qte || qte === 0)) {
      if (existing) {
        setSuivi(suivi.filter(s => s.id !== existing.id));
        await deleteRecord('suivi_horaire', existing.id);
      }
      return;
    }

    const updatedSuivi = existing 
      ? suivi.map(s => s.id === existing.id ? newEntry : s)
      : [...suivi, newEntry];
    
    setSuivi(updatedSuivi);
    await saveRecord('suivi_horaire', newEntry);
  }

  async function applyPlanning() {
    if (!selectedCmdId) return;
    setSyncing(true);
    
    const promises: Promise<void>[] = [];
    const newSuiviEntries: SuiviHoraire[] = [...suivi];

    for (const opId of Object.keys(assignments)) {
      const detail = assignments[opId];
      if (!detail.empId) continue;

      const hoursInRange = filteredHours.filter(tranche => {
        const start = tranche.split(' - ')[0];
        return start >= detail.startHour && start <= detail.endHour;
      });

      for (const tranche of hoursInRange) {
        const [hDebut, hFin] = tranche.split(' - ');
        const existing = todaySuivi.find(s => s.operation_id === opId && s.heure_debut === hDebut);
        
        const entry: SuiviHoraire = {
          id: existing?.id || genId(),
          commande_id: selectedCmdId,
          employe_id: detail.empId,
          operation_id: opId,
          heure_debut: hDebut,
          heure_fin: hFin,
          quantite_realisee: existing?.quantite_realisee || 0,
          date_production: today
        };

        promises.push(saveRecord('suivi_horaire', entry));
        
        const idx = newSuiviEntries.findIndex(s => s.id === entry.id);
        if (idx !== -1) newSuiviEntries[idx] = entry;
        else newSuiviEntries.push(entry);
      }
    }

    try {
      await Promise.all(promises);
      
      // Update command planning status
      if (selectedCmd) {
        const updatedCmd = { ...selectedCmd, planningReady: true };
        await saveRecord('commandes', updatedCmd);
        setCommandes(commandes.map(c => c.id === selectedCmd.id ? updatedCmd : c));
      }

      setSuivi(newSuiviEntries);
      setSyncing(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Planning Error:", err);
      setSyncing(false);
      alert("Erreur lors de la distribution. Vérifiez votre connexion.");
    }
  }

  const runAIBalancing = () => {
    const availableWorkers = [...employes];
    if (availableWorkers.length === 0) {
      alert(isAr ? "المرجو إضافة عمال أولاً في قسم الموارد البشرية." : "Veuillez ajouter des employés d'abord.");
      return;
    }

    const newAssignments = { ...assignments };
    const explanations: Record<string, string> = {};

    modelOps.forEach((op) => {
      let bestWorker = '';
      let bestScore = -1;
      let reason = '';

      // Match by past performance
      availableWorkers.forEach(emp => {
        const pastPerformances = suivi.filter(s => s.employe_id === emp.id && s.operation_id === op.id);
        if (pastPerformances.length > 0) {
          const avgQty = pastPerformances.reduce((acc, curr) => acc + curr.quantite_realisee, 0) / pastPerformances.length;
          const efficiency = (avgQty / op.target_heure) * 100;
          if (efficiency > bestScore) {
            bestScore = efficiency;
            bestWorker = emp.id;
            reason = isAr 
              ? `كفاءة عالية ومستقرة في هذا المركز بمتوسط ${Math.round(avgQty)} قطعة/ساعة (${Math.round(efficiency)}%)`
              : `Haute performance stable à ce poste avec une moyenne de ${Math.round(avgQty)} pcs/h (${Math.round(efficiency)}%)`;
          }
        }
      });

      // Match by role keywords
      if (!bestWorker) {
        const matchedRoleWorker = availableWorkers.find(emp => {
          const posteName = (emp.poste || '').toLowerCase();
          const opName = op.nom_operation.toLowerCase();
          return posteName.includes(opName) || opName.includes(posteName);
        });

        if (matchedRoleWorker) {
          bestWorker = matchedRoleWorker.id;
          reason = isAr
            ? `مطابقة المهنة والخبرة للمركز المحدد (${matchedRoleWorker.poste})`
            : `Correspondance parfaite du profil et du poste (${matchedRoleWorker.poste})`;
        }
      }

      // Match by general availability
      if (!bestWorker && availableWorkers.length > 0) {
        const fallbackWorker = availableWorkers[Math.floor(Math.random() * availableWorkers.length)];
        if (fallbackWorker) {
          bestWorker = fallbackWorker.id;
          reason = isAr
            ? `تم التعيين بناءً على جاهزية العامل وتوافق وقت العمل`
            : `Assigné automatiquement selon la disponibilité`;
        }
      }

      if (bestWorker) {
        newAssignments[op.id] = {
          empId: bestWorker,
          startHour: availableHours[0] || '08:00',
          endHour: availableHours[availableHours.length - 1] || '18:00'
        };
        explanations[op.id] = reason;

        if (availableWorkers.length > modelOps.length) {
          const index = availableWorkers.findIndex(w => w.id === bestWorker);
          if (index !== -1) availableWorkers.splice(index, 1);
        }
      }
    });

    setAssignments(newAssignments);
    setAiRecommendation(explanations);
    setShowAIPanel(true);
  };

  const getProduction = (opId: string, heureDebut: string) => {
    return todaySuivi.find(s => s.operation_id === opId && s.heure_debut === heureDebut);
  };

  const calculateTotalExpected = (opId: string) => {
    const detail = assignments[opId];
    if (!detail) return 0;
    const op = modelOps.find(o => o.id === opId);
    if (!op) return 0;

    const startIndex = availableHours.indexOf(detail.startHour);
    const endIndex = availableHours.indexOf(detail.endHour);
    
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return 0;
    
    const hoursCount = (endIndex - startIndex) + 1;
    return hoursCount * op.target_heure;
  };

  type OpSuggestion = { label: string; labelAr: string; emoji: string; target: number; color: string; desc: string };

  const getTechnicalSketch = () => {
    if (!selectedCmd) return '/images/sewing_placeholder.png';
    const m = selectedCmd.modele.toLowerCase();
    if (m.includes('robe') || m.includes('jilbab') || m.includes('قفطان')) return '/images/technical_flat_robe.png';
    return selectedCmd.photo || selectedCmd.modelePhoto || '/images/sewing_placeholder.png';
  };

  const getSuggestions = (): OpSuggestion[] => {
    if (!selectedCmd) return [];
    const m = selectedCmd.modele.toLowerCase();

    if (m.includes('t-shirt') || m.includes('tshirt') || m.includes('تيشيرت') || m.includes('قميص')) {
      return [
        { label: 'Coupe',              labelAr: 'القص',              emoji: '✂️', target: 60, color: 'rose',   desc: 'Découpe du tissu' },
        { label: 'Surjet épaules',     labelAr: 'سورجي الكتف',      emoji: '🧵', target: 50, color: 'indigo', desc: 'Surjet des épaules' },
        { label: 'Pose Col',           labelAr: 'تركيب الكول',      emoji: '👕', target: 45, color: 'violet', desc: 'Montage du col' },
        { label: 'Assemblage Manches', labelAr: 'تركيب الأكمام',    emoji: '💪', target: 40, color: 'blue',   desc: 'Fixation des manches' },
        { label: 'Surjet Côtés',       labelAr: 'سورجي الجانبين',   emoji: '📐', target: 55, color: 'sky',    desc: 'Fermeture côtés' },
        { label: 'Ourlet Bas',         labelAr: 'حاشية الأسفل',      emoji: '🔽', target: 50, color: 'teal',   desc: 'Ourlet du bas' },
        { label: 'Repassage',          labelAr: 'الكي',              emoji: '🔥', target: 35, color: 'amber',  desc: 'Repassage final' },
        { label: 'Contrôle Qualité',   labelAr: 'مراقبة الجودة',    emoji: '🔍', target: 80, color: 'emerald',desc: 'Inspection finale' },
      ];
    }
    if (m.includes('pantalon') || m.includes('jeans') || m.includes('سروال')) {
      return [
        { label: 'Coupe',              labelAr: 'القص',              emoji: '✂️', target: 55, color: 'rose',   desc: 'Découpe pantalon' },
        { label: 'Surjet Jambes',      labelAr: 'سورجي الساقين',    emoji: '🧵', target: 50, color: 'indigo', desc: 'Surjet des jambes' },
        { label: 'Assemblage Fourche', labelAr: 'تركيب الفرجة',     emoji: '🔗', target: 40, color: 'violet', desc: 'Montage entre-jambe' },
        { label: 'Poches',             labelAr: 'الجيوب',             emoji: '🗃️', target: 35, color: 'blue',   desc: 'Pose des poches' },
        { label: 'Ceinture',           labelAr: 'الحزام',             emoji: '⭕', target: 30, color: 'sky',    desc: 'Montage ceinture' },
        { label: 'Fermeture Éclair',   labelAr: 'السوستة',            emoji: '🤐', target: 45, color: 'teal',   desc: 'Pose fermeture' },
        { label: 'Ourlet',             labelAr: 'حاشية الساقين',    emoji: '🔽', target: 50, color: 'green',  desc: 'Ourlet bas jambes' },
        { label: 'Repassage',          labelAr: 'الكي',              emoji: '🔥', target: 30, color: 'amber',  desc: 'Repassage final' },
      ];
    }
    if (m.includes('veste') || m.includes('manteau') || m.includes('جاكيت') || m.includes('blazer')) {
      return [
        { label: 'Coupe & Patronage',  labelAr: 'القص والباترون',  emoji: '✂️', target: 40, color: 'rose',   desc: 'Découpe des pièces' },
        { label: 'Doublure',           labelAr: 'البطانة',           emoji: '🧥', target: 35, color: 'indigo', desc: 'Assemblage doublure' },
        { label: 'Prépa Poches',       labelAr: 'تحضير الجيوب',    emoji: '🗃️', target: 30, color: 'violet', desc: 'Poches intérieures' },
        { label: 'Assemblage Corps',   labelAr: 'تركيب الجسم',     emoji: '🔗', target: 25, color: 'blue',   desc: 'Montage corps' },
        { label: 'Manches',            labelAr: 'الأكمام',            emoji: '💪', target: 28, color: 'sky',    desc: 'Pose des manches' },
        { label: 'Col & Revers',       labelAr: 'الكول والطيات',   emoji: '🎯', target: 22, color: 'teal',   desc: 'Montage col' },
        { label: 'Finition',           labelAr: 'التشطيب',           emoji: '✨', target: 20, color: 'emerald',desc: 'Détails finaux' },
        { label: 'Repassage',          labelAr: 'الكي',              emoji: '🔥', target: 25, color: 'amber',  desc: 'Repassage pro' },
      ];
    }
    if (m.includes('robe') || m.includes('jilbab') || m.includes('قفطان') || m.includes('كفتان')) {
      return [
        { label: 'Coupe',              labelAr: 'القص',              emoji: '✂️', target: 45, color: 'rose',   desc: 'Découpe tissu' },
        { label: 'Surjet Épaules',     labelAr: 'سورجي الكتف',      emoji: '🧵', target: 40, color: 'indigo', desc: 'Surjet épaules' },
        { label: 'Pose Manches',       labelAr: 'تركيب الأكمام',    emoji: '💪', target: 35, color: 'violet', desc: 'Fixation manches' },
        { label: 'Fermeture',          labelAr: 'السوستة',            emoji: '🤐', target: 40, color: 'blue',   desc: 'Fermeture dos' },
        { label: 'Surjet Côtés',       labelAr: 'سورجي الجانبين',   emoji: '📐', target: 45, color: 'sky',    desc: 'Fermeture côtés' },
        { label: 'Ourlet Bas',         labelAr: 'حاشية الفستان',    emoji: '🔽', target: 40, color: 'teal',   desc: 'Ourlet de la robe' },
        { label: 'Broderie / Déco',    labelAr: 'التطريز / ديكور', emoji: '🌸', target: 15, color: 'pink',   desc: 'Décoration finale' },
        { label: 'Repassage',          labelAr: 'الكي',              emoji: '🔥', target: 30, color: 'amber',  desc: 'Repassage final' },
      ];
    }
    return [
      { label: 'Coupe',             labelAr: 'القص',              emoji: '✂️', target: 50, color: 'rose',   desc: 'Découpe générale' },
      { label: 'Assemblage',        labelAr: 'التجميع',           emoji: '🔗', target: 40, color: 'indigo', desc: 'Montage pièces' },
      { label: 'Surjet',            labelAr: 'سورجي',             emoji: '🧵', target: 50, color: 'violet', desc: 'Surjet bords' },
      { label: 'Fermeture',         labelAr: 'السوستة',            emoji: '🤐', target: 45, color: 'blue',   desc: 'Pose fermeture' },
      { label: 'Finition',          labelAr: 'التشطيب',           emoji: '✨', target: 35, color: 'emerald',desc: 'Nettoyage fils' },
      { label: 'Repassage',         labelAr: 'الكي',              emoji: '🔥', target: 30, color: 'amber',  desc: 'Repassage final' },
      { label: 'Contrôle Qualité',  labelAr: 'مراقبة الجودة',    emoji: '🔍', target: 80, color: 'teal',   desc: 'Inspection pièces' },
      { label: 'Emballage',         labelAr: 'التغليف',           emoji: '📦', target: 60, color: 'slate',  desc: 'Conditionnement' },
    ];
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 -mx-4 md:mx-0 px-4 md:px-0 relative">
      {/* Header & Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-0 z-[40] md:relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Factory className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase">Pilotage Séquentiel <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md ml-2">PRO v2.5 FINAL</span></h1>
            <p className="hidden md:block text-slate-400 text-sm font-bold uppercase tracking-widest opacity-60">Gestion détaillée des postes de travail</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select 
            value={selectedCmdId}
            onChange={e => setSelectedCmdId(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 md:py-4 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          >
            {commandes.map(c => (
              <option key={c.id} value={c.id}>{c.reference} — {c.modele}</option>
            ))}
          </select>
          
          <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {(['planning', 'suivi', 'config', 'stats'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-[1rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'planning' ? (isAr ? 'توزيع المهام' : 'Planning') :
                 t === 'suivi' ? (isAr ? 'تتبع' : 'Pointage') : 
                 t === 'config' ? (isAr ? 'إعداد' : 'Config') : 
                 (isAr ? 'أداء' : 'Perf')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Production Quantities Header */}
      {selectedCmd && (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{isAr ? 'الأهداف الإنتاجية (المطلوب)' : 'Cibles de Production'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'تحديد الكميات المراد إنتاجها' : 'Définir les quantités à produire'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {editingQty ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-black text-slate-500 uppercase">{isAr ? 'عينة (Échantillon)' : 'Échantillon'}</label>
                      <input 
                        type="number" 
                        value={qtyForm.echantillon} 
                        onChange={e => setQtyForm({...qtyForm, echantillon: parseInt(e.target.value) || 0})}
                        className="w-20 md:w-24 bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                    <span className="text-slate-300 font-black mt-4">+</span>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-black text-slate-500 uppercase">{isAr ? 'الإنتاج الكامل' : 'Prod Complète'}</label>
                      <input 
                        type="number" 
                        value={qtyForm.production} 
                        onChange={e => setQtyForm({...qtyForm, production: parseInt(e.target.value) || 0})}
                        className="w-24 md:w-32 bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-900 outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-black text-indigo-500 uppercase">{isAr ? 'المجموع' : 'Total'}</label>
                      <div className="w-20 md:w-24 bg-indigo-50 border-2 border-indigo-200 rounded-xl py-2 px-3 text-xs font-black text-indigo-700 text-center flex items-center justify-center">
                        {qtyForm.echantillon + qtyForm.production}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button onClick={handleSaveQty} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingQty(false)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-6">
                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{isAr ? 'العينة' : 'Échantillon'}</p>
                      <p className="text-lg font-black text-slate-700">{selectedCmd.quantiteEchantillon || 0}</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{isAr ? 'الإنتاج الكامل' : 'Prod Complète'}</p>
                      <p className="text-lg font-black text-indigo-700">{selectedCmd.quantiteProduction || selectedCmd.quantite || 0}</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{isAr ? 'المجموع الكلي' : 'Total Global'}</p>
                      <p className="text-lg font-black text-emerald-700">{(selectedCmd.quantiteEchantillon || 0) + (selectedCmd.quantiteProduction || selectedCmd.quantite || 0)}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingQty(true)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-10">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{isAr ? 'توزيع المهام اليومية' : 'Distribution des Missions'}</h2>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Assignez un ouvrier et une plage horaire à chaque poste</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button onClick={() => setActiveShift('jour')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeShift === 'jour' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Jour</button>
                      <button onClick={() => setActiveShift('nuit')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeShift === 'nuit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Nuit</button>
                   </div>
                   <button 
                     onClick={runAIBalancing}
                     className="px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 border border-indigo-400/20"
                   >
                      <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                      {isAr ? 'موازنة السلسلة بالذكاء الاصطناعي' : 'Équilibrer par IA (Autopilot)'}
                   </button>
                   <button 
                     onClick={applyPlanning}
                     disabled={syncing}
                     className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
                   >
                      {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                      {isAr ? 'تفعيل التوزيع' : 'Lancer la Production'}
                   </button>
                </div>
             </div>

             {showAIPanel && Object.keys(aiRecommendation).length > 0 && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6 mb-8 animate-in slide-in-from-top-4 duration-500 relative">
                   <button onClick={() => setShowAIPanel(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                   <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/15">
                         <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div>
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{isAr ? 'تقرير موازنة السلسلة بالذكاء الاصطناعي' : 'Rapport d\'Équilibrage Auto-Balancing'}</h3>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'توزيع تلقائي مبني على كفاءة العمال والمهام المحددة' : 'Assignation optimisée selon l\'historique et la spécialité'}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {modelOps.map((op, idx) => {
                         const emp = employes.find(e => e.id === assignments[op.id]?.empId);
                         return (
                            <div key={op.id} className="bg-white border border-indigo-50 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                               <div>
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[9px] font-black text-indigo-600 uppercase">Poste {idx + 1}</span>
                                     <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{op.nom_operation}</span>
                                  </div>
                                  <p className="text-xs font-black text-slate-800">{emp ? `${emp.prenom} ${emp.nom}` : (isAr ? 'غير معين' : 'Non assigné')}</p>
                                  <p className="text-[10px] text-slate-500 font-bold mt-1 italic">"{aiRecommendation[op.id]}"</p>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modelOps.map((op, idx) => {
                  const totalExpected = calculateTotalExpected(op.id);
                  return (
                    <div key={op.id} className="group p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/10" />
                       
                       <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm">
                             {idx + 1}
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cible Horaire</p>
                             <p className="text-lg font-black text-slate-900">{op.target_heure} <span className="text-[10px]">pcs/h</span></p>
                          </div>
                       </div>

                       <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-6 relative z-10">{op.nom_operation}</h3>
                       
                       <div className="space-y-4 relative z-10">
                          <div className="relative">
                             <select 
                               value={assignments[op.id]?.empId || ''}
                               onChange={e => setAssignments({...assignments, [op.id]: { ...assignments[op.id], empId: e.target.value }})}
                               className="w-full bg-white border-2 border-slate-100 rounded-xl py-4 px-4 text-xs font-black text-slate-800 appearance-none outline-none focus:border-indigo-500 transition-all shadow-sm"
                             >
                                <option value="">-- Choisir un ouvrier --</option>
                                {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                             </select>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <UserPlus className="w-4 h-4 text-slate-300" />
                             </div>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
                             <div className="flex-1">
                                <p className="text-[7px] font-black text-slate-400 uppercase mb-1 ml-1">Début</p>
                                <select 
                                  value={assignments[op.id]?.startHour || '08:00'}
                                  onChange={e => setAssignments({...assignments, [op.id]: { ...assignments[op.id], startHour: e.target.value }})}
                                  className="w-full bg-white border-none rounded-lg py-2 px-2 text-[10px] font-black text-slate-700 outline-none shadow-sm"
                                >
                                  {availableHours.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                             </div>
                             <ArrowRight className="w-4 h-4 text-slate-300 mt-4" />
                             <div className="flex-1">
                                <p className="text-[7px] font-black text-slate-400 uppercase mb-1 ml-1">Fin</p>
                                <select 
                                  value={assignments[op.id]?.endHour || '18:00'}
                                  onChange={e => setAssignments({...assignments, [op.id]: { ...assignments[op.id], endHour: e.target.value }})}
                                  className="w-full bg-white border-none rounded-lg py-2 px-2 text-[10px] font-black text-slate-700 outline-none shadow-sm"
                                >
                                  {availableHours.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                                   <PackageCheck className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-[8px] font-black text-indigo-400 uppercase">Objectif Total</p>
                                   <p className="text-sm font-black text-indigo-700">{totalExpected} <span className="text-[8px]">PC</span></p>
                                </div>
                             </div>
                             {assignments[op.id]?.empId && (
                                <div className="text-[7px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md">
                                   Prêt
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-indigo-600" />
                  {isAr ? `تسلسل العمليات : ${selectedCmd?.modele}` : `Gamme Opératoire : ${selectedCmd?.modele}`}
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={suggestOperationsByAI}
                    className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 border border-indigo-400/20"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="hidden sm:inline">{isAr ? 'اقتراح المراكز (AI)' : 'Suggestions IA'}</span>
                    <span className="sm:hidden">IA</span>
                  </button>
                  <button 
                    onClick={() => {
                      setQrPost(null);
                      setShowQrModal(true);
                    }}
                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? 'طباعة QR' : 'Imprimer QR'}</span>
                  </button>
                  <button 
                    onClick={() => setShowOpModal(true)}
                    className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    {isAr ? 'إضافة' : 'Ajouter'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {modelOps.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase">{isAr ? 'لا توجد مراكز معرفة لهذا الموديل' : 'Aucun poste défini pour ce modèle'}</p>
                  </div>
                ) : (
                  modelOps.map((op, idx) => (
                    <div key={op.id} className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl transition-all border border-transparent hover:border-slate-200 group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm border border-slate-100">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase">{op.nom_operation}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{isAr ? `الهدف: ${op.target_heure} قطعة/ساعة` : `Cible : ${op.target_heure} pcs / heure`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setQrPost(op);
                            setShowQrModal(true);
                          }}
                          className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Générer QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOp(op.id)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                <Timer className="w-5 h-5 text-indigo-400" />
                {isAr ? 'ملخص التسلسل' : 'Résumé Gamme'}
              </h3>
              <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{isAr ? 'عدد المراكز' : 'Nombre de postes'}</p>
                  <p className="text-2xl font-black">{modelOps.length}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{isAr ? 'الطاقة الإنتاجية القصوى (ساعة)' : 'Capacité Max (H)'}</p>
                  <p className="text-2xl font-black">{modelOps.length > 0 ? Math.min(...modelOps.map(o => o.target_heure)) : 0} pcs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suivi' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              Saisie par Heure ({today})
            </h2>
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
              <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setActiveShift('jour')}
                  className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeShift === 'jour' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {isAr ? 'النهار' : 'Jour'}
                </button>
                <button
                  onClick={() => setActiveShift('nuit')}
                  className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeShift === 'nuit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {isAr ? 'الليل' : 'Nuit'}
                </button>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] md:text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 sticky top-0 z-[30]">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky left-0 bg-slate-50 z-10 w-48">
                    Heure
                  </th>
                  {modelOps.map(op => (
                    <th key={op.id} className="px-4 py-6 text-xs md:text-sm font-black text-slate-900 uppercase tracking-tighter border-b border-slate-200 border-l border-slate-100 bg-slate-50/80">
                      <div className="flex flex-col">
                        <span className="leading-none">{op.nom_operation}</span>
                        <span className="text-[10px] md:text-xs text-indigo-600 mt-1 font-bold">Cible: {op.target_heure}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHours.map(tranche => (
                  <tr key={tranche} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-4 font-black text-slate-500 text-xs tabular-nums sticky left-0 bg-white z-10 border-r border-slate-100 shadow-sm">
                      {tranche}
                    </td>
                    {modelOps.map(op => {
                      const prod = getProduction(op.id, tranche.split(' - ')[0]);
                      const isBelowTarget = prod && prod.quantite_realisee < op.target_heure;
                      return (
                        <td key={op.id} className="px-4 py-4 border-l border-slate-100">
                          <div className="space-y-3">
                            <select 
                              value={prod?.employe_id || ''}
                              onChange={e => handleUpdateSuivi(op.id, e.target.value, tranche, prod?.quantite_realisee || 0)}
                              className="w-full bg-slate-100 border-none rounded-xl text-xs font-black text-slate-800 py-3 px-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
                            >
                              <option value="">Ouvrier</option>
                              {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                            </select>
                            <input 
                              type="number"
                              value={prod?.quantite_realisee ?? ''}
                              onChange={e => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                handleUpdateSuivi(op.id, prod?.employe_id || '', tranche, val);
                              }}
                              placeholder="Qté"
                              className={`w-full px-3 py-2.5 rounded-xl text-sm font-black tabular-nums outline-none transition-all border-2 ${
                                !prod ? 'bg-white border-slate-100 text-slate-400' :
                                isBelowTarget ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              }`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white">
                <tr>
                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                    Total Quotidien
                  </td>
                  {modelOps.map(op => {
                    const totalOp = todaySuivi
                      .filter(s => s.operation_id === op.id)
                      .reduce((a, b) => a + b.quantite_realisee, 0);
                    return (
                      <td key={op.id} className="px-4 py-6 border-l border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-xl font-black tabular-nums">{totalOp}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Pièces</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="block md:hidden p-4 space-y-6">
            {modelOps.map(op => {
              const totalOp = todaySuivi
                .filter(s => s.operation_id === op.id)
                .reduce((a, b) => a + b.quantite_realisee, 0);
              
              return (
                <div key={op.id} className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 bg-white border-b-2 border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter">{op.nom_operation}</h3>
                      <p className="text-xs font-bold text-indigo-600 uppercase">Cible: {op.target_heure} pcs/h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Total</p>
                      <p className="text-2xl font-black text-slate-900">{totalOp}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 overflow-x-auto flex gap-4 scrollbar-hide bg-slate-50/50">
                    {filteredHours.map(tranche => {
                      const prod = getProduction(op.id, tranche.split(' - ')[0]);
                      const isBelowTarget = prod && prod.quantite_realisee < op.target_heure;
                      
                      return (
                        <div key={tranche} className="flex-none w-32 space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black text-slate-500 text-center border-b border-slate-50 pb-2 mb-2">
                            {tranche.split(' - ')[0]}
                          </p>
                          
                          <select 
                            value={prod?.employe_id || ''}
                            onChange={e => handleUpdateSuivi(op.id, e.target.value, tranche, prod?.quantite_realisee || 0)}
                            className="w-full bg-slate-100 border-none rounded-xl text-xs font-black text-slate-900 py-3 px-2 outline-none shadow-sm"
                          >
                            <option value="">Ouvrier</option>
                            {employes.map(e => <option key={e.id} value={e.id}>{e.prenom}</option>)}
                          </select>
                          
                          <input 
                            type="number"
                            value={prod?.quantite_realisee ?? ''}
                            onChange={e => {
                              const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                              handleUpdateSuivi(op.id, prod?.employe_id || '', tranche, val);
                            }}
                            placeholder="Qté"
                            className={`w-full px-3 py-2 rounded-xl text-center text-sm font-black tabular-nums outline-none border-2 ${
                              !prod ? 'bg-slate-50 border-transparent text-slate-400' :
                              isBelowTarget ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelOps.map(op => {
            const opSuivi = todaySuivi.filter(s => s.operation_id === op.id);
            const total = opSuivi.reduce((a, b) => a + b.quantite_realisee, 0);
            const avg = opSuivi.length > 0 ? total / opSuivi.length : 0;
            const perf = (avg / op.target_heure) * 100;
            
            return (
              <div key={op.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 transition-transform group-hover:scale-110 ${
                  perf >= 100 ? 'text-emerald-500' : perf >= 70 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  <TrendingUp className="w-full h-full" />
                </div>

                <h3 className="text-sm font-black text-slate-800 uppercase mb-6">{op.nom_operation}</h3>
                
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficience</p>
                      <p className={`text-4xl font-black tabular-nums ${
                        perf >= 100 ? 'text-emerald-600' : perf >= 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>{Math.round(perf)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Moyenne</p>
                      <p className="text-xl font-black text-slate-800 tabular-nums">{Math.round(avg)}/h</p>
                    </div>
                  </div>

                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        perf >= 100 ? 'bg-emerald-500' : perf >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, perf)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl">
                    <CheckCircle2 className={`w-4 h-4 ${perf >= 100 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {perf >= 100 ? 'Objectif Atteint' : `Manque ${Math.max(0, op.target_heure - Math.round(avg))} pcs/h`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowSuccess(false)} />
           <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200 ring-8 ring-emerald-50">
                 <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-4">
                {isAr ? 'تحديث: تم بنجاح !' : 'Système à Jour : Succès !'}
              </h2>
              <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8 uppercase tracking-widest">
                {isAr ? 'تم توزيع المهام على العمال بنجاح. يوم عمل موفق !' : 'Le planning a été distribué. Bonne production !'}
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                {isAr ? 'حسناً' : 'Super, let\'s go !'}
              </button>
           </div>
        </div>
      )}

      {/* Operation Modal with Image and Suggestions */}
      {showOpModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col md:flex-row">
            {/* Left Side: Image / Info */}
            <div className="md:w-5/12 bg-indigo-50 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-indigo-100">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
              
              {/* Toggle Photo / Sketch */}
              <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
                <div className="bg-white/80 backdrop-blur-md border border-white/40 p-1 rounded-xl shadow-sm flex items-center gap-1">
                  <button 
                    onClick={() => setImageMode('photo')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      imageMode === 'photo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {isAr ? 'الصورة' : 'Photo'}
                  </button>
                  <button 
                    onClick={() => setImageMode('sketch')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      imageMode === 'sketch' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {isAr ? 'الرسم' : 'Croquis'}
                  </button>
                </div>
              </div>

              <div className="w-full aspect-[4/5] bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden relative mb-6">
                <img 
                  src={imageMode === 'photo' ? (selectedCmd?.photo || selectedCmd?.modelePhoto || "/images/sewing_placeholder.png") : getTechnicalSketch()}
                  alt="Modèle" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = "/images/sewing_placeholder.png";
                  }}
                />
                {/* Operation zone badges - only show briefly on bottom if photo, or float them if sketch */}
                {imageMode === 'photo' && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                    {getSuggestions().slice(0,4).map((s,i) => (
                      <span key={i} className="bg-black/60 backdrop-blur-sm text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border border-white/10">
                        {i+1} {isAr ? s.labelAr : s.label.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedCmd?.modele}</h3>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Réf: {selectedCmd?.reference}</p>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-7/12 flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{isAr ? 'مركز جديد' : 'Nouveau Poste'}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{isAr ? 'إضافة عملية للإنتاج' : 'Ajouter une opération'}</p>
                </div>
                <button onClick={() => setShowOpModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8 flex-1">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-3">{isAr ? 'اسم العملية (المركز)' : 'Nom de l\'opération (Poste)'}</label>
                  <input 
                    autoFocus
                    value={opForm.nom_operation || ''} 
                    onChange={e => setOpForm({...opForm, nom_operation: e.target.value})} 
                    placeholder={isAr ? "مثال: جيب، خياطة..." : "Ex: Jib, Ourlet, Montage..."}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" 
                  />
                  {/* Smart Suggestions */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isAr ? '⚡ مقترحات ذكية:' : '⚡ Suggestions IA pour ce modèle :'}</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {getSuggestions().map(sug => {
                        const isSelected = opForm.nom_operation === sug.label || opForm.nom_operation === sug.labelAr;
                        const colorMap: Record<string, string> = {
                          rose:    'bg-rose-50    border-rose-200    text-rose-700    hover:bg-rose-500    hover:text-white hover:border-rose-500',
                          indigo:  'bg-indigo-50  border-indigo-200  text-indigo-700  hover:bg-indigo-500  hover:text-white hover:border-indigo-500',
                          violet:  'bg-violet-50  border-violet-200  text-violet-700  hover:bg-violet-500  hover:text-white hover:border-violet-500',
                          blue:    'bg-blue-50    border-blue-200    text-blue-700    hover:bg-blue-500    hover:text-white hover:border-blue-500',
                          sky:     'bg-sky-50     border-sky-200     text-sky-700     hover:bg-sky-500     hover:text-white hover:border-sky-500',
                          teal:    'bg-teal-50    border-teal-200    text-teal-700    hover:bg-teal-500    hover:text-white hover:border-teal-500',
                          green:   'bg-green-50   border-green-200   text-green-700   hover:bg-green-500   hover:text-white hover:border-green-500',
                          emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500',
                          amber:   'bg-amber-50   border-amber-200   text-amber-700   hover:bg-amber-500   hover:text-white hover:border-amber-500',
                          pink:    'bg-pink-50    border-pink-200    text-pink-700    hover:bg-pink-500    hover:text-white hover:border-pink-500',
                          slate:   'bg-slate-50   border-slate-200   text-slate-600   hover:bg-slate-600   hover:text-white hover:border-slate-600',
                        };
                        const selectedMap: Record<string, string> = {
                          rose: 'bg-rose-500 border-rose-500 text-white', indigo: 'bg-indigo-500 border-indigo-500 text-white',
                          violet: 'bg-violet-500 border-violet-500 text-white', blue: 'bg-blue-500 border-blue-500 text-white',
                          sky: 'bg-sky-500 border-sky-500 text-white', teal: 'bg-teal-500 border-teal-500 text-white',
                          green: 'bg-green-500 border-green-500 text-white', emerald: 'bg-emerald-500 border-emerald-500 text-white',
                          amber: 'bg-amber-500 border-amber-500 text-white', pink: 'bg-pink-500 border-pink-500 text-white',
                          slate: 'bg-slate-600 border-slate-600 text-white',
                        };
                        return (
                          <button
                            key={sug.label}
                            onClick={() => setOpForm({...opForm, nom_operation: isAr ? sug.labelAr : sug.label, target_heure: sug.target})}
                            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                              isSelected ? (selectedMap[sug.color] || selectedMap.slate) : (colorMap[sug.color] || colorMap.slate)
                            }`}
                          >
                            <span className="text-base leading-none flex-shrink-0">{sug.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tight leading-tight truncate">{isAr ? sug.labelAr : sug.label}</p>
                              <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? 'text-white/70' : 'opacity-50'}`}>{sug.target} pcs/h</p>
                            </div>
                            {isSelected && <span className="ml-auto text-base">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-3">{isAr ? 'الهدف (قطعة / ساعة)' : 'Objectif (Pièces / Heure)'}</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={opForm.target_heure || ''} 
                      onChange={e => setOpForm({...opForm, target_heure: parseInt(e.target.value) || 0})} 
                      placeholder="40"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-lg font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-sm" 
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={handleAddOperation}
                  disabled={!opForm.nom_operation}
                  className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  {isAr ? 'تأكيد المركز' : 'Confirmer le poste'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Codes QR de Production</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Scannez pour enregistrer la production</p>
              </div>
              <button onClick={() => setShowQrModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50" id="qr-print-area">
              {(qrPost ? [qrPost] : modelOps).map(op => (
                <div key={op.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
                  <div className="mb-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <QRCodeSVG 
                      value={`beya-prod://${selectedCmdId}/${op.id}`} 
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs font-black text-slate-800 uppercase mb-1">{op.nom_operation}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">{selectedCmd?.reference} — {selectedCmd?.modele}</p>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                    ID: {op.id.slice(0,8)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                <Printer className="w-5 h-5" />
                Imprimer les codes
              </button>
              <button 
                onClick={() => setShowQrModal(false)}
                className="flex-1 h-16 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
