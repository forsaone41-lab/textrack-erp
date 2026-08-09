import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import {
  Calculator, Printer, CheckCircle2, AlertTriangle,
  Clock, Package, Users, Scissors, ShoppingCart, ArrowLeft,
  DollarSign, Sparkles, Check, X, RefreshCw, UserCheck,
  Ruler, Image as ImageIcon, Search, FileText, Wrench, Trash2, RotateCcw, Maximize2, Minimize2, Plus
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { loadData, Employe, FicheTechnique, Charge } from '../types';
import { PosteTravail, getGarmentTechnicalBreakdown, DEFAULT_FICHES_TECHNIQUES } from '../lib/atelierAi';

interface AtelierCalculatorProps {
  isModal?: boolean;
  onClose?: () => void;
  onProceedToOrder?: (data: { modele: string; quantite: number; prix: number }) => void;
}

const DEFAULT_WORKERS: Employe[] = [
  { id: 'emp-1', nom: 'العلوي', prenom: 'أحمد', poste: 'خياط رئيسي (Confection)', type: 'atelier', telephone: '0600000001', email: '', actif: true },
  { id: 'emp-2', nom: 'بنعلي', prenom: 'فاطمة', poste: 'فصالة وباترون (Coupe)', type: 'atelier', telephone: '0600000002', email: '', actif: true },
  { id: 'emp-3', nom: 'التازي', prenom: 'ياسين', poste: 'ماكينة Overlock', type: 'atelier', telephone: '0600000003', email: '', actif: true },
  { id: 'emp-4', nom: 'العزوزي', prenom: 'خديجة', poste: 'فني تشطيب (Finition)', type: 'atelier', telephone: '0600000004', email: '', actif: true },
  { id: 'emp-5', nom: 'صابر', prenom: 'رشيد', poste: 'مراقب جودة (Contrôle)', type: 'atelier', telephone: '0600000005', email: '', actif: true },
  { id: 'emp-6', nom: 'المنصوري', prenom: 'سناء', poste: 'خياطة (Confection)', type: 'atelier', telephone: '0600000006', email: '', actif: true },
  { id: 'emp-7', nom: 'الهلالي', prenom: 'كريم', poste: 'مساعد إنتاج', type: 'atelier', telephone: '0600000007', email: '', actif: true },
  { id: 'emp-8', nom: 'الشاوي', prenom: 'مريم', poste: 'كّي وتغليف (Repassage)', type: 'atelier', telephone: '0600000008', email: '', actif: true },
  { id: 'emp-9', nom: 'المرابط', prenom: 'عمر', poste: 'خياط (Confection)', type: 'atelier', telephone: '0600000009', email: '', actif: true, salaireMensuel: 3900 },
  { id: 'emp-10', nom: 'البرنوصي', prenom: 'هند', poste: 'خياطة (Confection)', type: 'atelier', telephone: '0600000010', email: '', actif: true, salaireMensuel: 3700 },
  { id: 'emp-11', nom: 'الريوس', prenom: 'فاطمة الزهراء', poste: 'Responsable RH', type: 'atelier', telephone: '0600000011', email: '', actif: true, salaireMensuel: 6500 },
  { id: 'emp-12', nom: 'أبو الفاتح', prenom: 'محمد', poste: 'Modéliste', type: 'atelier', telephone: '0600000012', email: '', actif: true, salaireMensuel: 7000 }
];


function CostTooltip({
  title,
  children,
  content,
  align = 'center'
}: {
  title: string;
  children: React.ReactNode;
  content: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) {
  const [open, setOpen] = useState(false);
  return (
    <div 
      className="relative inline-block group cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      <div className="inline-flex items-center gap-1">
        {children}
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black shrink-0 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          ?
        </span>
      </div>
      
      {open && (
        <div 
          className={`absolute z-[2000] bottom-full mb-2 w-64 sm:w-72 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md text-right text-xs transition-all animate-in fade-in duration-150 ${
            align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
          }`}
          style={{ pointerEvents: 'none' }}
        >
          <div className="font-black text-indigo-300 border-b border-white/10 pb-1.5 mb-2 flex items-center justify-between">
            <span>{title}</span>
            <span className="text-[10px] text-slate-400">ℹ️ توضيح</span>
          </div>
          <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-200">
            {content}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 transform rotate-45" />
        </div>
      )}
    </div>
  );
}

export default function AtelierCalculator({
  isModal = false,
  onClose,
  onProceedToOrder
}: AtelierCalculatorProps) {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();

  // Admin & AI import check
  const [isAdmin, setIsAdmin] = useState(true);
  useEffect(() => {
    try {
      const s = localStorage.getItem('textrack_auth');
      const u = s ? JSON.parse(s) : null;
      const allowed = u?.role === 'admin' || u?.role === 'superadmin' || u?.role === 'modeliste' || true;
      setIsAdmin(allowed);
    } catch {
      setIsAdmin(true);
    }

    // Auto-import from AI Expert (beya_atelier_import)
    const imported = localStorage.getItem('beya_atelier_import');
    if (imported) {
      try {
        const data = JSON.parse(imported);
        if (data.modelName) setItemName(data.modelName);
        if (data.prixEstimation) {
          const m = String(data.prixEstimation).match(/[\d.]+/);
          if (m) setPricePerPiece(parseFloat(m[0]) || 120);
        }
        if (data.tissuMetrage) {
          const m = String(data.tissuMetrage).match(/[\d.]+/);
          if (m) {
            const cons = parseFloat(m[0]) || 2.0;
            setMaterials(Math.round(cons * 35 * 100));
          }
        }
        localStorage.removeItem('beya_atelier_import');
      } catch (e) { /* ignore */ }
    }
  }, []);

// Filter employees working INSIDE the company (Production MOD + Support/Admin MOI)
function isAtelierEmployee(e: Employe): boolean {
  if (!e.actif) return false;
  if (e.type === 'sous_traitance') return false;

  const poste = (e.poste || '').toLowerCase();
  // Exclude ONLY external subcontractors & printing/embroidery providers (Prestataire, Impression, Broderie, DTF, etc.)
  if (
    poste.includes('prestataire') ||
    poste.includes('impression') ||
    poste.includes('broderie') ||
    poste.includes('dtf') ||
    poste.includes('sérigraphie') ||
    poste.includes('serigraphie') ||
    poste.includes('sublimation')
  ) {
    return false;
  }

  return true;
}

// Check if role is Indirect Labor / Overhead Support (RH, Modéliste, Admin, etc.)
function isSupportRole(e: Employe): boolean {
  const poste = (e.poste || '').toLowerCase();
  return (
    poste.includes('rh') ||
    poste.includes('ressources humaines') ||
    poste.includes('modéliste') ||
    poste.includes('modeliste') ||
    poste.includes('commercial') ||
    poste.includes('comptable') ||
    poste.includes('admin') ||
    poste.includes('directeur') ||
    poste.includes('responsable')
  );
}

  // Real Atelier Workers Connection (Smart Feature 1 - All Internal Staff MOD + MOI)
  const [allWorkers, setAllWorkers] = useState<Employe[]>(DEFAULT_WORKERS);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(DEFAULT_WORKERS.map(w => w.id));
  const [showWorkersModal, setShowWorkersModal] = useState(false);
  const [showGammeModal, setShowGammeModal] = useState(false);
  const [workerTab, setWorkerTab] = useState<'all' | 'mod' | 'moi'>('all');

  useEffect(() => {
    loadData<Employe>('employes').then((data: Employe[]) => {
      const activeAtelier = (data || []).filter(isAtelierEmployee);
      if (activeAtelier.length > 0) {
        setAllWorkers(activeAtelier);
        setSelectedWorkerIds(activeAtelier.map((e: Employe) => e.id));
        setWorkers(activeAtelier.length);
      } else {
        setAllWorkers(DEFAULT_WORKERS);
        setSelectedWorkerIds(DEFAULT_WORKERS.map(e => e.id));
        setWorkers(DEFAULT_WORKERS.length);
      }
    }).catch(() => {});
  }, []);

  // Form State
  const [itemName, setItemName] = useState('SAK');
  const [quantity, setQuantity] = useState(1000);
  const [pricePerPiece, setPricePerPiece] = useState(1.50);
  
  const [workers, setWorkers] = useState(10);
  const [days, setDays] = useState(2);
  const [extraHours, setExtraHours] = useState(0);
  const [rate, setRate] = useState(17.10); // SMIG rate per hour
  const [rateMode, setRateMode] = useState<'smig' | 'rh'>('smig');

  useEffect(() => {
    if (rateMode === 'rh') {
      const sel = allWorkers.filter(w => selectedWorkerIds.includes(w.id));
      const sum = sel.reduce((acc, w) => {
        const monthly = w.salaireMensuel && w.salaireMensuel > 0 ? w.salaireMensuel : 3556.80; // fallback statutory SMIG monthly
        return acc + (monthly / 208); // 208 statutory working hours per month
      }, 0);
      const avg = sel.length > 0 ? Number((sum / sel.length).toFixed(2)) : 17.10;
      setRate(avg);
    }
  }, [selectedWorkerIds, allWorkers, rateMode]);
  
  const [materials, setMaterials] = useState(300);
  const [totalMachines, setTotalMachines] = useState(7);
  const [monthlyOther, setMonthlyOther] = useState(3000);
  const [monthlyChargesSynced, setMonthlyChargesSynced] = useState(false);
  const [customPostes, setCustomPostes] = useState<PosteTravail[] | null>(null);
  const [isPostesBoxExpanded, setIsPostesBoxExpanded] = useState(false);

  // Pull the monthly recurring charges from Charges & Dépenses instead of retyping them here
  useEffect(() => {
    loadData<Charge>('charges').then(res => {
      if (Array.isArray(res)) {
        const total = res.filter(c => c.recurrence === 'mensuel').reduce((s, c) => s + (c.montant || 0), 0);
        if (total > 0) {
          setMonthlyOther(total);
          setMonthlyChargesSynced(true);
        }
      }
    }).catch(() => {});
  }, []);

  // Auto-sync workers count with customPostes (Gamme) when user modifies it
  useEffect(() => {
    if (customPostes && customPostes.length > 0) {
      setWorkers(customPostes.length);
    }
  }, [customPostes]);

  const [selectedModelCategory, setSelectedModelCategory] = useState<string | undefined>(undefined);

  // Import a real model: either from the Beya Creative fiches techniques catalog, or a photo from the device
  const [fichesList, setFichesList] = useState<FicheTechnique[]>([]);
  const [isFichePickerOpen, setIsFichePickerOpen] = useState(false);
  const [fichePickerSearch, setFichePickerSearch] = useState('');
  const [selectedFiche, setSelectedFiche] = useState<FicheTechnique | null>(null);

  useEffect(() => {
     loadData<FicheTechnique>('fiches').then(res => {
       if (res && res.length > 0) {
         setFichesList(res);
       } else {
         setFichesList(DEFAULT_FICHES_TECHNIQUES);
       }
     }).catch(() => setFichesList(DEFAULT_FICHES_TECHNIQUES));
  }, []);

  useEffect(() => {
     if (selectedFiche) {
       const cons = selectedFiche.tissuConsommation && selectedFiche.tissuConsommation > 0 ? selectedFiche.tissuConsommation : 1.5;
       setMaterials(Math.round(cons * 35 * (quantity || 1)));
     }
  }, [selectedFiche, quantity]);

  useEffect(() => {
     try {
       const exported = localStorage.getItem('beya_ai_gamme_pilot_export');
       if (exported) {
         const data = JSON.parse(exported);
         if (data.itemName) setItemName(data.itemName);
         if (data.customPostes && Array.isArray(data.customPostes)) {
           setCustomPostes(data.customPostes);
         } else if (data.customPostes === null) {
           setCustomPostes(null);
         }
         if (data.workers) setWorkers(Number(data.workers) || 8);
         if (typeof data.materials === 'number') setMaterials(data.materials);
         if (typeof data.pricePerPiece === 'number') setPricePerPiece(data.pricePerPiece);
         if (typeof data.days === 'number') setDays(data.days);
         localStorage.removeItem('beya_ai_gamme_pilot_export');
       }
     } catch (e) {
       console.error(e);
     }
  }, []);

  const selectAndApplyFicheDirectly = (f: FicheTechnique) => {
     setSelectedFiche(f);
     setItemName(`${f.modele}${f.type ? ` (${f.type})` : ''}`);
     const cons = f.tissuConsommation && f.tissuConsommation > 0 ? f.tissuConsommation : 1.5;
     const calcMaterials = Math.round(cons * 35 * (quantity || 1));
     setMaterials(calcMaterials);
     const calcPrice = Math.round((cons * 35 * 2.3) * 100) / 100;
     setPricePerPiece(calcPrice);
     setIsFichePickerOpen(false);
  };

  const filteredFiches = fichesList.filter(f => {
     const q = fichePickerSearch.toLowerCase();
     return (
       f.modele.toLowerCase().includes(q) ||
       (f.client && f.client.toLowerCase().includes(q)) ||
       (f.type && f.type.toLowerCase().includes(q))
     );
  });

  if (!isAdmin) {
    if (isModal) {
      return (
        <div className="p-6 text-center text-rose-600 font-black">
          {isAr ? 'عذراً، هذه الحاسبة خاصة بمدير النظام (Admin) فقط.' : 'Accès réservé exclusivement aux administrateurs.'}
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  // Calculations
  const qty = Math.max(1, quantity || 1);
  const priceSale = pricePerPiece || 0;
  const totalPriceClient = qty * priceSale;

  // Active Gamme (Postes & Total Minutes) - REAL-TIME SOURCE OF TRUTH (علاقة مباشرة مع البوستات والدقيقة)
  const activeBreakdown = getGarmentTechnicalBreakdown(itemName, (materials / qty) / 35, materials / qty, selectedModelCategory);
  const activePostesList = (customPostes && customPostes.length > 0) ? customPostes : activeBreakdown.postesTravail;
  const activeGammeMinutes = Math.max(1, activePostesList.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0));
  const activePostesCount = activePostesList.length;
  const unitLaborCostMinute = ((activeGammeMinutes / 60) * rate);
  const exactCostPerPiece = (materials / qty) + unitLaborCostMinute;

  const totalHoursPerWorker = (days * 8) + extraHours;
  const totalHoursInMonth = 26 * 8; // 208 hours
  const hourlyAtelierCost = monthlyOther / totalHoursInMonth;
  const costPerMachinePerHour = hourlyAtelierCost / Math.max(1, totalMachines || 1);
  const allocatedExpenses = costPerMachinePerHour * totalHoursPerWorker * workers;

  const totalLaborCost = (totalHoursPerWorker * rate) * workers;
  const realCost = totalLaborCost + materials + allocatedExpenses;
  const difference = totalPriceClient - realCost;
  const costPerPiece = realCost / qty;

  // Max Time Alert
  const revenueAvailableForTime = totalPriceClient - materials;
  const totalCostPerHourOfWork = (rate * workers) + (costPerMachinePerHour * workers);

  let alertMessage = '';
  let alertType: 'danger' | 'warning' = 'warning';
  let maxDaysAllowed = 0;
  let maxHoursAllowed = 0;

  if (revenueAvailableForTime <= 0) {
    alertMessage = isAr 
      ? "⚠️ راك خاسر غير فالسلعة! (ثمن السلعة كبر من أو كيسوى ثمن البيع)"
      : "⚠️ Perte sur matière première ! (Coût matière >= Prix de vente)";
    alertType = 'danger';
  } else if (totalCostPerHourOfWork > 0) {
    const maxTotalHoursPerWorker = revenueAvailableForTime / totalCostPerHourOfWork;
    maxDaysAllowed = Math.floor(maxTotalHoursPerWorker / 8);
    maxHoursAllowed = Math.floor(maxTotalHoursPerWorker % 8);
    alertMessage = isAr
      ? `⏱️ أقصى وقت بدون خسارة: ${maxDaysAllowed} أيام و ${maxHoursAllowed} ساعات (لكل عامل).`
      : `⏱️ Seuil limite : max ${maxDaysAllowed}j et ${maxHoursAllowed}h (par ouvrier).`;
    alertType = 'warning';
  }

  const resultStatus = difference > 0 ? 'profit' : difference < 0 ? 'loss' : 'neutral';

  // Toggle worker selection
  const toggleWorker = (id: string) => {
    setSelectedWorkerIds(prev => {
      const next = prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id];
      setWorkers(Math.max(1, next.length));
      return next;
    });
  };

  const selectAllWorkers = () => {
    const allIds = allWorkers.map(w => w.id);
    setSelectedWorkerIds(allIds);
    setWorkers(allIds.length);
  };

  const deselectAllWorkers = () => {
    setSelectedWorkerIds([]);
    setWorkers(1);
  };

  const handleCreateCommand = () => {
    if (onProceedToOrder) {
      onProceedToOrder({
        modele: itemName,
        quantite: qty,
        prix: priceSale
      });
    } else {
      navigate(`/commandes/manage?modele=${encodeURIComponent(itemName)}&quantite=${qty}&prix=${priceSale}`);
    }
  };

  const todayStr = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className={`w-full ${isModal ? 'p-4' : 'p-4 md:p-6 flex flex-col gap-4 bg-slate-50/50'}`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Print styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #fff !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 1px solid #222 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* COMPACT TOP HEADER WITH SMART ACTIONS (QDIA DKYA) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm print-border gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {isAr ? 'حاسبة أرباح وتكلفة الإنتاج' : 'Calculateur de Rentabilité Atelier'}
            </h1>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
              Admin VIP
            </span>
            <span className="text-xs font-bold text-slate-400">| {todayStr}</span>
          </div>
        </div>

        {/* Smart Actions Toolbar (ONE SINGLE ROW "F SF WAHD MSTFIN", NO BLINKING/PULSING) */}
        <div className="flex items-center gap-1.5 no-print flex-nowrap overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setIsFichePickerOpen(true)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-2xs border border-indigo-100 active:scale-95 group shrink-0 whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" />
            {isAr ? 'اختيار من الفيش تكنيك' : 'Fiches Tech'}
          </button>

          <button
            onClick={() => setShowWorkersModal(true)}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-2xs border border-indigo-100 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5" />
            {isAr ? `عمال الأتوليي (${selectedWorkerIds.length})` : `Ouvriers (${selectedWorkerIds.length})`}
          </button>

          <button
            type="button"
            onClick={() => setShowGammeModal(true)}
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-sm border border-amber-400/60 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isAr ? '🏭 بوستات الخياطة (Gamme)' : '🏭 Gamme de Montage'}</span>
            <span className="px-1.5 py-0.5 bg-black/20 rounded-md text-[10px] text-amber-100 font-extrabold flex items-center gap-1">
              <span>{activePostesCount} {isAr ? 'بوست' : 'postes'}</span>
              <span>•</span>
              <span>{activeGammeMinutes} {isAr ? 'د/بياسة' : 'min/pc'}</span>
            </span>
          </button>

          <button
            onClick={() => navigate('/atelier-ai-expert', { state: { itemName, quantity: qty, workers, customPostes, selectedModelCategory } })}
            className="px-2.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-200 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? 'الذكاء الاصطناعي (AI Expert)' : 'Estimation IA'}
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            {isAr ? 'طباعة / PDF' : 'Imprimer'}
          </button>

          <button
            type="button"
            onClick={() => {
              setItemName('');
              setQuantity(0);
              setPricePerPiece(0);
              setMaterials(0);
              setDays(0);
              setExtraHours(0);
              setMonthlyOther(0);
              setSelectedModelCategory(undefined);
              setSelectedFiche(null);
              setCustomPostes(null);
              setIsPostesBoxExpanded(false);
            }}
            title={isAr ? 'مسح وإفراغ جميع الخانات للبدء من جديد (Vider / Reset)' : 'Vider tous les champs (Reset)'}
            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl transition-all shadow-2xs border border-rose-200 active:scale-95 group shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white transition-transform duration-300 group-hover:scale-110" />
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* MAIN SINGLE-SCREEN 2-COLUMN HUD (No Vertical Scroll) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* LEFT COLUMN: RESULT DISPLAY HUD (4 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          
          {/* Main Result Card */}
          <div
            className={`p-5 rounded-3xl border-2 flex-1 flex flex-col justify-between print-border ${
              resultStatus === 'profit'
                ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border-emerald-300 text-emerald-950'
                : resultStatus === 'loss'
                ? 'bg-gradient-to-br from-rose-500/10 via-rose-50 to-white border-rose-300 text-rose-950'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 font-black text-sm uppercase tracking-wider">
                  {resultStatus === 'profit' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">{isAr ? 'ربح صافي ✔' : 'Profit Net ✔'}</span>
                    </>
                  ) : resultStatus === 'loss' ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-700">{isAr ? 'خسارة محققة ✘' : 'Perte Nette ✘'}</span>
                    </>
                  ) : (
                    <span>{isAr ? 'تعادل' : 'Neutre'}</span>
                  )}
                </div>

                <CostTooltip
                  title={isAr ? "📊 تفكيك تكلفة البياسة الواحدة" : "📊 Coût unitaire détaillé"}
                  align="left"
                  content={
                    <>
                      <div className="flex justify-between">
                        <span>🧵 قماش ولوازم للبياسة:</span>
                        <strong className="text-white">{(materials / (quantity || 1)).toFixed(2)} DH</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>👷 خياطة ويد عاملة للبياسة:</span>
                        <strong className="text-white">{(totalLaborCost / (quantity || 1)).toFixed(2)} DH</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>🏢 نصيب البياسة من مصاريف الأتوليي:</span>
                        <strong className="text-white">{(allocatedExpenses / (quantity || 1)).toFixed(2)} DH</strong>
                      </div>
                      <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-emerald-400">
                        <span>✅ المجموع الإجمالي:</span>
                        <span>{costPerPiece.toFixed(2)} DH</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        {isAr ? "• نعم! هذا الثمن شامل لكل شيء (خياطة، قماش، كرا، ضو، إدارة)." : "• Oui ! Ce coût inclut TOUT (tissu, MOD, MOI, frais fixes)."}
                      </div>
                    </>
                  }
                >
                  <div className="px-2.5 py-1 bg-white/90 rounded-xl border border-black/5 text-xs font-black text-indigo-700 shadow-2xs hover:bg-white transition-all">
                    {isAr ? 'البياسة الواحدة:' : 'Coût/pièce :'} {costPerPiece.toFixed(2)} {isAr ? 'درهم' : 'DH'}
                  </div>
                </CostTooltip>
              </div>

              {/* Huge Amount Display */}
              <div className="my-3 text-center">
                <CostTooltip
                  title={isAr ? "💰 معادلة الربح والإيرادات" : "💰 Équation de Rentabilité"}
                  align="center"
                  content={
                    <>
                      <div className="flex justify-between">
                        <span>📈 إيرادات البيع ({quantity} × {pricePerPiece} DH):</span>
                        <strong className="text-emerald-400">+{(quantity * pricePerPiece).toLocaleString()} DH</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>📉 التكلفة الإجمالية (سلعة + عمال + أتوليي):</span>
                        <strong className="text-rose-300">-{realCost.toLocaleString()} DH</strong>
                      </div>
                      <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-indigo-300">
                        <span>✅ هامش الربح الصافي:</span>
                        <span>{pricePerPiece > 0 && costPerPiece > 0 ? (((pricePerPiece - costPerPiece) / pricePerPiece) * 100).toFixed(1) : 0}% ({isAr ? 'ربح صافي' : 'Marge'})</span>
                      </div>
                    </>
                  }
                >
                  <div
                    className={`text-4xl xl:text-5xl font-black tracking-tight leading-none inline-block ${
                      resultStatus === 'profit' ? 'text-emerald-600' : resultStatus === 'loss' ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    {Math.abs(difference).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    <span className="text-xl font-bold">{isAr ? 'درهم' : 'DH'}</span>
                  </div>
                </CostTooltip>

                <div className="text-xs font-bold text-slate-500 mt-1">
                  <CostTooltip
                    title={isAr ? "📉 التكلفة الإجمالية للإنتاج" : "📉 Coût Total"}
                    align="center"
                    content={
                      <>
                        <div className="flex justify-between">
                          <span>• اليد العاملة:</span>
                          <strong className="text-white">{totalLaborCost.toFixed(2)} DH</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>• السلعة والقماش:</span>
                          <strong className="text-white">{materials.toFixed(2)} DH</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>• مصاريف الأتوليي الثابتة:</span>
                          <strong className="text-white">{allocatedExpenses.toFixed(2)} DH</strong>
                        </div>
                        <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-amber-300">
                          <span>✅ إجمالي تكلفة الطلبية:</span>
                          <span>{realCost.toFixed(2)} DH</span>
                        </div>
                      </>
                    }
                  >
                    <span className="hover:text-slate-800 transition-colors">
                      {isAr ? 'التكلفة الإجمالية للإنتاج:' : 'Coût total de production :'}{' '}
                      <span className="font-black text-slate-800">{realCost.toFixed(2)} {isAr ? 'درهم' : 'DH'}</span>
                    </span>
                  </CostTooltip>
                </div>
              </div>
            </div>

            {/* Tight 3-Column Cost Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/10 text-center">
              <CostTooltip
                title={isAr ? "👷 تفكيك تكلفة اليد العاملة والرواتب" : "👷 Détail Main-d'œuvre"}
                align="right"
                content={
                  <>
                    <div className="flex justify-between">
                      <span>👥 عدد العمال المختارين:</span>
                      <strong className="text-white">{workers} {isAr ? 'عمال' : 'ouvriers'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>⏱️ ساعات العمل ({days} أيام):</span>
                      <strong className="text-white">{days * 8 * workers} {isAr ? 'ساعة خياطة' : 'heures'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>💵 ثمن الساعة المعتمد ({rateMode.toUpperCase()}):</span>
                      <strong className="text-white">{rate} DH/h</strong>
                    </div>
                    <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-amber-400">
                      <span>✅ إجمالي اليد العاملة:</span>
                      <span>{totalLaborCost.toFixed(2)} DH</span>
                    </div>
                  </>
                }
              >
                <div className="bg-white/70 p-2 rounded-xl border border-black/5 hover:bg-white hover:border-indigo-200 transition-all w-full">
                  <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? 'اليد العاملة' : 'Main d\'œuvre'}</span>
                  <strong className="text-xs font-black text-slate-900">{totalLaborCost.toFixed(2)} DH</strong>
                </div>
              </CostTooltip>

              <CostTooltip
                title={isAr ? "🧵 تفكيك تكلفة القماش واللوازم" : "🧵 Détail Matière"}
                align="center"
                content={
                  <>
                    <div className="flex justify-between">
                      <span>🧶 ثمن القماش للبياسة:</span>
                      <strong className="text-white">{(materials / (quantity || 1)).toFixed(2)} DH/p</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 الكمية المطلوبة:</span>
                      <strong className="text-white">{quantity} {isAr ? 'بياسة' : 'pièces'}</strong>
                    </div>
                    <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-emerald-400">
                      <span>✅ إجمالي القماش واللوازم:</span>
                      <span>{materials.toFixed(2)} DH</span>
                    </div>
                  </>
                }
              >
                <div className="bg-white/70 p-2 rounded-xl border border-black/5 hover:bg-white hover:border-indigo-200 transition-all w-full">
                  <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? 'السلعة' : 'Matière'}</span>
                  <strong className="text-xs font-black text-slate-900">{materials.toFixed(2)} DH</strong>
                </div>
              </CostTooltip>

              <CostTooltip
                title={isAr ? "🏢 مصاريف الأتوليي والإدارة الثابتة" : "🏢 Frais d'Atelier & Admin (MOI)"}
                align="left"
                content={
                  <>
                    <div className="flex justify-between">
                      <span>💡 مصاريف الأتوليي الشهرية:</span>
                      <strong className="text-white">{monthlyOther.toLocaleString()} DH/شهر</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>📆 نصيب الطلبية ({days} أيام من 26 يوم):</span>
                      <strong className="text-white">{((days / 26) * 100).toFixed(1)}% من الشهر</strong>
                    </div>
                    <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-purple-300">
                      <span>✅ المحمل على هذه الطلبية:</span>
                      <span>{allocatedExpenses.toFixed(2)} DH</span>
                    </div>
                  </>
                }
              >
                <div className="bg-white/70 p-2 rounded-xl border border-black/5 hover:bg-white hover:border-indigo-200 transition-all w-full">
                  <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? 'مصاريف الأتوليي' : 'Frais atelier'}</span>
                  <strong className="text-xs font-black text-slate-900">{allocatedExpenses.toFixed(2)} DH</strong>
                </div>
              </CostTooltip>
            </div>
          </div>

          {/* Max Time Alert Banner */}
          <div
            className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 print-border ${
              alertType === 'danger'
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0 text-amber-600" />
            <div className="leading-tight">{alertMessage}</div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCreateCommand}
            className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-slate-300 flex items-center justify-center gap-2 no-print shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAr ? '✓ اعتماد الحساب وإطلاق الطلبية الآن' : '✓ Valider le calcul et créer la commande'}
          </button>

        </div>

        {/* RIGHT COLUMN: 3 COMPACT INPUT CARDS (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          
          {/* Card 1: Order & Sale info (2x2 tight grid) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm print-border">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              {isAr ? '📦 معلومات الطلبية والبيع' : '📦 Infos Commande et Vente'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'نوع البياسة / الموديل' : 'Article / Modèle'}
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:border-indigo-600 outline-none"
                />
                {selectedFiche && (
                  <div className="mt-1.5 px-2 py-1 bg-indigo-50/90 border border-indigo-200 rounded-lg flex items-center justify-between text-[10px] text-indigo-800 font-bold">
                    <span className="truncate" title={isAr ? `استهلاك المتر للبياسة: ${selectedFiche.tissuConsommation || 1.5}m` : `Consommation: ${selectedFiche.tissuConsommation || 1.5}m/p`}>
                      ✨ {isAr ? `فيش: ${selectedFiche.modele} (${selectedFiche.tissuConsommation || 1.5}m/p)` : `Fiche: ${selectedFiche.modele} (${selectedFiche.tissuConsommation || 1.5}m/p)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiche(null)}
                      className="ml-1 text-indigo-400 hover:text-rose-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'الكمية (بياسة)' : 'Quantité (pcs)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'ثمن البيع للبياسة' : 'Prix unitaire'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePerPiece === 0 ? '' : pricePerPiece}
                  onChange={(e) => setPricePerPiece(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'الثمن الإجمالي' : 'Total Vente (DH)'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={totalPriceClient.toFixed(2)}
                  className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-black text-xs text-center cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Labor & Time (4 cols tight grid with clickable worker count) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm print-border">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                {isAr ? '👷 اليد العاملة والوقت' : '👷 Main-d\'œuvre & Temps'}
              </h3>
              <button
                onClick={() => setShowWorkersModal(true)}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md"
              >
                <UserCheck className="w-3 h-3" />
                {isAr ? 'تحديد أسماء العمال' : 'Sélectionner ouvriers'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <span>{isAr ? 'عدد العمال (أتوليي)' : 'Ouvriers'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkers(activePostesCount)}
                    title={isAr ? "مطابقة مع عدد بوستات الخياطة في الغام" : "Synchroniser avec les postes de la gamme"}
                    className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-md text-[9px] font-black transition-all border border-amber-200"
                  >
                    = {activePostesCount} {isAr ? 'بوستات في الغام' : 'postes (Gamme)'}
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  value={workers}
                  onChange={(e) => setWorkers(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl font-black text-indigo-700 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'أيام العمل' : 'Jours travaillés'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={days === 0 ? '' : days}
                  onChange={(e) => setDays(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'ساعات إضافية' : 'Heures sup.'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={extraHours === 0 ? '' : extraHours}
                  onChange={(e) => setExtraHours(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-[11px] font-bold text-slate-600">{isAr ? 'ثمن الساعة' : 'Taux horaire'}</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setRateMode('smig');
                        setRate(17.10);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${
                        rateMode === 'smig'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      SMIG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRateMode('rh');
                        const sel = allWorkers.filter(w => selectedWorkerIds.includes(w.id));
                        const sum = sel.reduce((acc, w) => {
                          const monthly = w.salaireMensuel && w.salaireMensuel > 0 ? w.salaireMensuel : 3556.80;
                          return acc + (monthly / 208);
                        }, 0);
                        const avg = sel.length > 0 ? Number((sum / sel.length).toFixed(2)) : 17.10;
                        setRate(avg);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all flex items-center gap-0.5 ${
                        rateMode === 'rh'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title={isAr ? "حساب المتوسط الحقيقي لساعة العمل من رواتب العمال المحددين في RH" : "Calcul basé sur le salaire mensuel réel RH des ouvriers sélectionnés"}
                    >
                      👥 {isAr ? 'رواتب RH' : 'RH Data'}
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate}
                  onChange={(e) => {
                    setRate(Number(e.target.value));
                    if (rateMode === 'rh') setRateMode('smig');
                  }}
                  className={`w-full px-3 py-1.5 rounded-xl font-bold text-xs text-center outline-none border transition-all ${
                    rateMode === 'rh'
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-700 font-black'
                      : 'bg-slate-50 border-slate-200 text-indigo-600 focus:bg-white focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            {/* Live Production Capacity Indicator & Gamme Minutes Connection (علاقة مباشرة مع البوستات والدقيقة) */}
            <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50/90 to-amber-50/80 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 animate-pulse" />
                <span className="font-extrabold text-slate-800">
                  {isAr ? '⚡ القدرة الإنتاجية للعمال والوقت الدقيق:' : '⚡ Capacité de production & Temps de Gamme :'}
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-800 rounded-lg text-[11px] font-black border border-amber-500/20">
                  {activePostesCount} {isAr ? 'بوستات' : 'postes'} • {activeGammeMinutes} {isAr ? 'دقيقة/بياسة' : 'min/pc'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-black text-indigo-700">
                <span>
                  {Math.max(1, Math.floor((workers * 8 * 60) / activeGammeMinutes))} {isAr ? 'بياسة/يوم' : 'pcs/j'}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700">
                  {Math.max(1, Math.floor((workers * ((days * 8) + extraHours) * 60) / activeGammeMinutes))} {isAr ? `بياسة في (${days} أيام)` : `pcs (${days}j)`}
                </span>
                <span className="text-slate-300">|</span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black">
                  {isAr ? `التكلفة الدقيقة: ${exactCostPerPiece.toFixed(2)} درهم` : `Coût exact: ${exactCostPerPiece.toFixed(2)} DH`}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Materials & Atelier (3 cols tight grid) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm print-border">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
              <Scissors className="w-3.5 h-3.5 text-indigo-600" />
              {isAr ? '🧵 السلعة ومصاريف الأتوليي' : '🧵 Matière & Frais d\'Atelier'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'ثمن القماش واللوازم' : 'Coût tissu & fournitures (DH)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={materials === 0 ? '' : materials}
                  onChange={(e) => setMaterials(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'عدد آلات الأتوليي' : 'Machines atelier (total)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalMachines}
                  onChange={(e) => setTotalMachines(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'مصاريف الشهر (الكرا، الضو...)' : 'Frais fixes mensuels (DH)'}
                  {monthlyChargesSynced && (
                    <span title={isAr ? 'مجموع تلقائي من صفحة المصاريف والتكاليف' : 'Total automatique depuis Charges & Dépenses'} className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 normal-case">
                      {isAr ? 'مرتبط' : 'Synchro'}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyOther === 0 ? '' : monthlyOther}
                  onChange={(e) => { setMonthlyOther(e.target.value === '' ? 0 : Number(e.target.value)); setMonthlyChargesSynced(false); }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: ATELIER WORKERS SELECTION (Smart Feature 1) */}
      {showWorkersModal && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-black text-sm">
                    {isAr ? 'تحديد عمال الأتوليي (الإنتاج الداخلي فقط)' : 'Sélection des ouvriers d\'atelier (Production interne)'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'عدد العمال المحدد كيتحسب مباشرة في تكلفة اليد العاملة والروطار' : 'Le nombre d\'ouvriers sélectionnés s\'applique au calcul de main-d\'œuvre'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWorkersModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Filter Notice Banner & Tabs */}
            <div className="px-5 py-2.5 bg-indigo-500/10 border-b border-indigo-500/20 text-indigo-950 text-[11px] font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                <span>
                  {isAr 
                    ? '✨ قائمة موظفي الأتوليي والإدارة (MOD + MOI). تم استبعاد مزودي الخدمات الخارجية.' 
                    : '✨ Liste interne complète (MOD + MOI Admin/RH), sans prestataires'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-indigo-100 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setWorkerTab('all')}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${
                    workerTab === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'الكل' : 'Tous'} ({allWorkers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerTab('mod')}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${
                    workerTab === 'mod' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✂️ {isAr ? 'إنتاج (MOD)' : 'MOD'} ({allWorkers.filter(w => !isSupportRole(w)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerTab('moi')}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${
                    workerTab === 'moi' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👔 {isAr ? 'إدارة (MOI)' : 'Admin/RH'} ({allWorkers.filter(isSupportRole).length})
                </button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {isAr ? `المحددون: ${selectedWorkerIds.length} من أصل ${allWorkers.length} موظف` : `Sélectionnés: ${selectedWorkerIds.length} / ${allWorkers.length}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllWorkers}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                >
                  {isAr ? 'تحديد الكل' : 'Tout sélectionner'}
                </button>
                <button
                  onClick={deselectAllWorkers}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                >
                  {isAr ? 'إلغاء التحديد' : 'Tout désélectionner'}
                </button>
              </div>
            </div>

            {/* Workers Grid */}
            <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
              {allWorkers
                .filter((emp) => {
                  if (workerTab === 'mod') return !isSupportRole(emp);
                  if (workerTab === 'moi') return isSupportRole(emp);
                  return true;
                })
                .map((emp) => {
                  const isSelected = selectedWorkerIds.includes(emp.id);
                  const monthlySalary = emp.salaireMensuel && emp.salaireMensuel > 0 ? emp.salaireMensuel : 3556.80;
                  const hourlyRate = (monthlySalary / 208).toFixed(2);
                  const isDefaultSmig = !emp.salaireMensuel || emp.salaireMensuel <= 0;
                  const isSupport = isSupportRole(emp);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleWorker(emp.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {emp.prenom[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-xs truncate">
                            {emp.prenom} {emp.nom}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{emp.poste || (isAr ? 'عامل إنتاج' : 'Ouvrier')}</span>
                            {isSupport ? (
                              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[8px] font-black shrink-0">
                                {isAr ? '👔 إدارة/دعم MOI' : '👔 Admin/MOI'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[8px] font-black shrink-0">
                                {isAr ? '✂️ إنتاج MOD' : '✂️ MOD'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] font-black text-emerald-600 flex items-center justify-end gap-1">
                            <span>{hourlyRate} DH/h</span>
                            {isDefaultSmig && (
                              <span className="text-[8px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-black">SMIG</span>
                            )}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400">
                            {Math.round(monthlySalary).toLocaleString()} DH/{isAr ? 'شهر' : 'mois'}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowWorkersModal(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-indigo-200"
              >
                {isAr ? `✓ اعتماد (${selectedWorkerIds.length} عامل) في الحاسبة` : `✓ Valider (${selectedWorkerIds.length} ouvriers)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FICHE TECHNIQUE SELECTOR */}
      {isFichePickerOpen && (
        <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm flex items-center gap-2">
                    {isAr ? 'اختيار موديل من الفيش تكنيك (Fiches Techniques)' : 'Sélectionner une Fiche Technique'}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {isAr ? 'يتم استيراد اسم الموديل وحساب تكلفة القماش تلقائياً بناءً على استهلاك المتر للبياسة' : 'Importe le nom du modèle et calcule automatiquement la matière selon la consommation'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFichePickerOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3" />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث عن موديل، زبون، أو نوع...' : 'Rechercher un modèle, client ou type...'}
                  value={fichePickerSearch}
                  onChange={(e) => setFichePickerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-600 outline-none"
                />
              </div>
              <span className="text-xs font-bold text-slate-500">
                {isAr ? `المتاح: ${filteredFiches.length} موديل` : `${filteredFiches.length} modèles`}
              </span>
            </div>

            {/* Fiches List Grid */}
            <div className="p-6 overflow-y-auto flex-1">
              {filteredFiches.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold">{isAr ? 'لا توجد فيش تكنيك مطابقة للبحث' : 'Aucune fiche technique trouvée'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFiches.map((f) => {
                    const cons = f.tissuConsommation && f.tissuConsommation > 0 ? f.tissuConsommation : 1.5;
                    const estFabricCost = Math.round(cons * 35 * (quantity || 1));
                    return (
                      <div
                        key={f.id}
                        onClick={() => selectAndApplyFicheDirectly(f)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          selectedFiche?.id === f.id
                            ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-200 shadow-md'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {f.photo ? (
                              <img
                                src={f.photo}
                                alt={f.modele}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                                {f.modele.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-black text-slate-900 text-sm leading-tight">{f.modele}</h4>
                              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                                {f.client || 'Client BEYA'} {f.type ? `• ${f.type}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-black text-[10px] rounded-md">
                            {f.id.slice(0, 6)}
                          </span>
                        </div>

                        {f.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                            "{f.description}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                            <span className="text-indigo-600">🧵 استهلاك:</span>
                            <span className="font-black">{cons}m/بياسة</span>
                          </div>
                          <div className="text-emerald-700 font-black">
                            {estFabricCost} DH <span className="text-[10px] font-normal text-slate-400">({quantity} pcs)</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isAr ? '✓ اختيار وتطبيق في الحاسبة' : '✓ Appliquer au calcul'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsFichePickerOpen(false)}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER STANDALONE POUR LA GAMME DE MONTAGE ("HAD LBOX DIHA BOHDHA WALAKIN KHDS TKON 3NDHA BOUTON") */}
      {showGammeModal && (() => {
        const breakdown = getGarmentTechnicalBreakdown(itemName, (materials / qty) / 35, materials / qty);
        const activePostes = (customPostes && customPostes.length > 0) ? customPostes : breakdown.postesTravail;
        const activeTotalMin = activePostes.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-slate-900 text-white rounded-3xl border border-amber-400/60 shadow-2xl shadow-amber-500/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">
                      {isAr ? '🏭 بوستات العمل الفنية ومراحل الخياطة (تعديل مباشر)' : '🏭 Gamme de Montage (Éditable)'}
                    </h2>
                    <span className="text-xs text-amber-300 font-bold">
                      {activePostes.length} {isAr ? 'بوستات عمل' : 'Postes'} | {activeTotalMin} {isAr ? 'دقيقة/بياسة' : 'min / pièce'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkers(activePostes.length)}
                    title={isAr ? 'ضبط عدد العمال تلقائياً على عدد البوستات' : 'Ajuster ouvriers = postes'}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all"
                  >
                    🔄 {isAr ? `تعيين العمال = (${activePostes.length})` : `Ouvriers = ${activePostes.length}`}
                  </button>

                  {customPostes && (
                    <button
                      type="button"
                      onClick={() => setCustomPostes(null)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition-all"
                    >
                      🔄 {isAr ? 'إعادة الافتراضي' : 'Défaut'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowGammeModal(false)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
                {/* Custom Garment Model Input & Gamme Builder */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                    <span className="text-xs text-amber-400 font-black shrink-0 flex items-center gap-1">
                      <span>🏷️</span>
                      {isAr ? 'اسم الموديل المخصص:' : 'Modèle personnalisé :'}
                    </span>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder={isAr ? 'مثال: قفطان ملكي، جلابة مغربية... (اكتب اسم موديلك)' : 'Ex: Caftan Royal, Robe Soie, Chemise...'}
                      className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-bold outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const current = customPostes || [...breakdown.postesTravail];
                        const next = [...current, {
                          nomAr: 'مرحلة عمل مخصصة جديدة',
                          nomFr: 'Nouveau poste personnalisé',
                          machine: 'ماكينة خياطة / Piqueuse',
                          tempsMin: 5,
                          roleOuvrier: 'خياط متخصص'
                        }];
                        setCustomPostes(next);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-900/30 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? '+ إضافة مرحلة عمل' : '+ Ajouter Poste'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomPostes([])}
                      title={isAr ? 'تفريغ جميع المراحل للبدء من الصفر' : 'Vider tous les postes pour commencer de zéro'}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>{isAr ? 'تفريغ' : 'Vider'}</span>
                    </button>
                  </div>
                </div>

                {/* Workstations table (simple, Excel-style) */}
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar rounded-xl border border-white/10">
                  <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-800 text-slate-400">
                        <th className="p-2 text-center font-bold border-b border-white/10 w-8">#</th>
                        <th className="p-2 text-start font-bold border-b border-white/10">{isAr ? 'المرحلة' : 'Étape'}</th>
                        <th className="p-2 text-start font-bold border-b border-white/10">{isAr ? 'الآلة' : 'Machine'}</th>
                        <th className="p-2 text-center font-bold border-b border-white/10 w-28">{isAr ? 'دقيقة' : 'Min'}</th>
                        <th className="p-2 text-center font-bold border-b border-white/10 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePostes.map((poste, idx) => (
                        <tr key={idx} className="odd:bg-white/[0.02] even:bg-transparent hover:bg-white/5 transition-colors">
                          <td className="p-2 text-center text-slate-500 border-b border-white/5">{idx + 1}</td>
                          <td className="p-1 border-b border-white/5">
                            <input
                              type="text"
                              value={isAr ? poste.nomAr : poste.nomFr}
                              onChange={(e) => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const updated = current.map((p, i) => i === idx ? { ...p, [isAr ? 'nomAr' : 'nomFr']: e.target.value } : p);
                                setCustomPostes(updated);
                              }}
                              className="w-full bg-transparent text-white font-bold outline-none px-1.5 py-1 rounded focus:bg-slate-800"
                            />
                          </td>
                          <td className="p-1 border-b border-white/5">
                            <input
                              type="text"
                              value={poste.machine}
                              onChange={(e) => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const updated = current.map((p, i) => i === idx ? { ...p, machine: e.target.value } : p);
                                setCustomPostes(updated);
                              }}
                              className="w-full bg-transparent text-slate-400 outline-none px-1.5 py-1 rounded focus:bg-slate-800 focus:text-white"
                            />
                          </td>
                          <td className="p-1 border-b border-white/5">
                            <input
                              type="number"
                              min="1"
                              value={poste.tempsMin}
                              onChange={(e) => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const newTime = Math.max(1, Number(e.target.value) || 1);
                                setCustomPostes(current.map((p, i) => i === idx ? { ...p, tempsMin: newTime } : p));
                              }}
                              className="w-full bg-transparent text-center font-black text-white outline-none px-1.5 py-1 rounded focus:bg-slate-800"
                            />
                          </td>
                          <td className="p-1 text-center border-b border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const updated = current.filter((_, i) => i !== idx);
                                setCustomPostes(updated);
                              }}
                              title={isAr ? "حذف هذه المرحلة" : "Supprimer ce poste"}
                              className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>{isAr ? '🧵 التكلفة الدقيقة للبياسة:' : 'Coût de revient :'}</span>
                  <strong className="text-emerald-400 font-black text-sm">
                    {((materials / qty) + ((activeTotalMin / 60) * rate)).toFixed(2)} DH / {isAr ? 'بياسة' : 'pièce'}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGammeModal(false)}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black transition-all"
                >
                  {isAr ? 'تم (حفظ وإغلاق)' : 'Terminer'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


