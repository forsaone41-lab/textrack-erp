import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import {
  Calculator, Printer, CheckCircle2, AlertTriangle,
  Clock, Package, Users, Scissors, ShoppingCart, ArrowLeft,
  DollarSign, Sparkles, Check, X, RefreshCw, UserCheck,
  Ruler, Image as ImageIcon, Search, FileText, Wrench, Trash2, RotateCcw, Maximize2, Minimize2, Plus, Copy
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { loadData, Employe, FicheTechnique, Charge } from '../types';
import { PosteTravail, getGarmentTechnicalBreakdown, DEFAULT_FICHES_TECHNIQUES } from '../lib/atelierAi';

interface AtelierCalculatorProps {
  isModal?: boolean;
  onClose?: () => void;
  onProceedToOrder?: (data: { modele: string; quantite: number; prix: number }) => void;
}

const ATELIER_MACHINES_PRESETS = [
  { id: 'piqueuse', machine: 'Piqueuse Plate', labelAr: 'بيكوز سامبل', defaultNomAr: 'خياطة وتجميع الأجزاء', defaultNomFr: 'Assemblage Piqueuse Plate', defaultMin: 6, role: 'خياط رئيسي' },
  { id: 'surjeteuse_34', machine: 'Surjeteuse 3/4 Fils', labelAr: 'سورجي 3/4 خيوط', defaultNomAr: 'سرفلة وحماية الأطراف', defaultNomFr: 'Surfilage 3/4 Fils', defaultMin: 5, role: 'ماكينة Overlock' },
  { id: 'surjeteuse_5', machine: 'Surjeteuse 5 Fils (Safety)', labelAr: 'سورجي 5 خيوط', defaultNomAr: 'تجميع وسرفلة سافتي 5 خيوط', defaultNomFr: 'Assemblage Safety 5 Fils', defaultMin: 6, role: 'ماكينة Overlock' },
  { id: 'recouvreuse', machine: 'Recouvreuse', labelAr: 'روكوفروز / كوليتوز', defaultNomAr: 'ثني الأطراف الخارجية والتشطيب', defaultNomFr: 'Ourlets & Finitions Recouvreuse', defaultMin: 5, role: 'خياطة متخصصة' },
  { id: 'double_aiguille', machine: 'Piqueuse 2 Aiguilles', labelAr: 'بيكوز 2 إبر', defaultNomAr: 'خياطة مزدوجة 2 إبر (Surpiqûre)', defaultNomFr: 'Couture Double Aiguille', defaultMin: 6, role: 'خياط متخصص' },
  { id: 'coupe', machine: 'Table de Coupe / Ciseaux', labelAr: 'طاولة الفصالة / مقص', defaultNomAr: 'فصالة القماش وتحضير الأجزاء', defaultNomFr: 'Coupe & Préparation', defaultMin: 5, role: 'فصالة وباترون' },
  { id: 'repassage', machine: 'Fer Vapeur / Table Aspirante', labelAr: 'كيّ بالبخار', defaultNomAr: 'كّي بالبخار ومراقبة الجودة نهائية', defaultNomFr: 'Repassage Vapeur & Contrôle', defaultMin: 4, role: 'مراقب جودة وتشطيب' },
  { id: 'boutonniere', machine: 'Boutonnière / Pose Bouton', labelAr: 'عيون وأزرار', defaultNomAr: 'فتح العيون وتركيب الأزرار', defaultNomFr: 'Boutonnière & Pose Boutons', defaultMin: 4, role: 'خياطة متخصصة' },
  { id: 'brideuse', machine: 'Brideuse (Bartack)', labelAr: 'ماكينة البريد', defaultNomAr: 'تثبيت ودعم نقاط القوة (Bride)', defaultNomFr: 'Renforts & Brides (Bartack)', defaultMin: 3, role: 'خياطة متخصصة' },
  { id: 'thermocollage', machine: 'Presse à Thermocoller', labelAr: 'پريس فيزلين', defaultNomAr: 'لصق الفيزلين وتقوية الأجزاء', defaultNomFr: 'Thermocollage & Entoilage', defaultMin: 4, role: 'مساعد فصالة' },
  { id: 'broderie', machine: 'Machine Broderie / Sfifa', labelAr: 'طرز / سفيفة', defaultNomAr: 'تطريز أو تركيب السفيفة والعقاد', defaultNomFr: 'Broderie / Pose Sfifa', defaultMin: 10, role: 'معلم طرز / خياطة' },
  { id: 'finition_main', machine: 'Travail Manuel / Contrôle', labelAr: 'تشطيب ومراقبة يدوية', defaultNomAr: 'تشطيب، تنظيف الخيوط وتغليف', defaultNomFr: 'Épluchage, Contrôle & Emballage', defaultMin: 3, role: 'فني تشطيب' },
];

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
  const [selectedQuickMachine, setSelectedQuickMachine] = useState<string>(ATELIER_MACHINES_PRESETS[0].machine);
  const [activeInputKey, setActiveInputKey] = useState<string | null>(null);
  const [activeInputRaw, setActiveInputRaw] = useState<string>('');

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

  // Calculations (Multi-Unit Precision: Minute | Hour | Day | Month)
  const qty = Math.max(0.0001, quantity || 0);
  const priceSale = pricePerPiece || 0;
  const totalPriceClient = (quantity || 0) * priceSale;

  // Active Gamme (Postes & Total Minutes) - REAL-TIME SOURCE OF TRUTH (علاقة مباشرة مع البوستات والدقيقة)
  const activeBreakdown = getGarmentTechnicalBreakdown(itemName, (materials / Math.max(1, quantity || 1)) / 35, materials / Math.max(1, quantity || 1), selectedModelCategory);
  const activePostesList = (customPostes && customPostes.length > 0) ? customPostes : activeBreakdown.postesTravail;
  const activeGammeMinutes = Math.max(1, activePostesList.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0));
  const activePostesCount = activePostesList.length;
  const unitLaborCostMinute = ((activeGammeMinutes / 60) * rate);
  const exactCostPerPiece = (quantity > 0 ? (materials / quantity) : 0) + unitLaborCostMinute;

  // Exact Work Duration Conversions (1h = 60m, 1j = 8h = 480m, 1 mois = 26j = 208h = 12480m)
  const totalHoursPerWorker = (days * 8) + extraHours;
  const totalMinutesPerWorker = totalHoursPerWorker * 60;
  const totalMonthsPerWorker = days / 26;
  const totalHoursInMonth = 26 * 8; // 208 hours (12,480 minutes)
  const hourlyAtelierCost = monthlyOther / totalHoursInMonth;
  const costPerMachinePerHour = hourlyAtelierCost / Math.max(1, totalMachines || 1);
  const allocatedExpenses = costPerMachinePerHour * totalHoursPerWorker * workers;

  const totalLaborCost = (totalHoursPerWorker * rate) * workers;
  const realCost = totalLaborCost + materials + allocatedExpenses;
  const difference = totalPriceClient - realCost;
  const costPerPiece = quantity > 0 ? (realCost / quantity) : 0;

  // Multi-Unit Synchronized Breakdown (Minute / Hour / Day / Month)
  const effectiveDurationMin = Math.max(1, totalMinutesPerWorker || 480);
  const pcsPerMin = (quantity || 0) / effectiveDurationMin;
  const pcsPerHour = pcsPerMin * 60;
  const pcsPerDay = pcsPerMin * 480;
  const pcsPerMonth = pcsPerMin * 12480;

  const unitMatCost = quantity > 0 ? (materials / quantity) : 0;

  // Worker Wage in 4 units (for 1 worker)
  const ratePerMin = rate / 60;
  const ratePerHour = rate;
  const ratePerDay = rate * 8;
  const ratePerMonth = rate * 208;

  // Atelier Fixed Expenses in 4 units (total workshop)
  const monthlyAtelierMin = monthlyOther / 12480;
  const monthlyAtelierHour = monthlyOther / 208;
  const monthlyAtelierDay = monthlyOther / 26;

  // Team Operating Cost & Profit across 4 timeframes (Minute, Hour, Day, Month)
  const teamLaborMin = ratePerMin * workers;
  const teamLaborHour = ratePerHour * workers;
  const teamLaborDay = ratePerDay * workers;
  const teamLaborMonth = ratePerMonth * workers;

  const teamAtelierMin = (costPerMachinePerHour / 60) * workers;
  const teamAtelierHour = costPerMachinePerHour * workers;
  const teamAtelierDay = teamAtelierHour * 8;
  const teamAtelierMonth = teamAtelierHour * 208;

  const revMin = pcsPerMin * priceSale;
  const revHour = pcsPerHour * priceSale;
  const revDay = pcsPerDay * priceSale;
  const revMonth = pcsPerMonth * priceSale;

  const matMin = pcsPerMin * unitMatCost;
  const matHour = pcsPerHour * unitMatCost;
  const matDay = pcsPerDay * unitMatCost;
  const matMonth = pcsPerMonth * unitMatCost;

  const totalCostMin = teamLaborMin + teamAtelierMin + matMin;
  const totalCostHour = teamLaborHour + teamAtelierHour + matHour;
  const totalCostDay = teamLaborDay + teamAtelierDay + matDay;
  const totalCostMonth = teamLaborMonth + teamAtelierMonth + matMonth;

  const profitMin = revMin - totalCostMin;
  const profitHour = revHour - totalCostHour;
  const profitDay = revDay - totalCostDay;
  const profitMonth = revMonth - totalCostMonth;

  const fmtNum = (val: number, maxDec = 2): string => {
    if (!Number.isFinite(val) || val === 0) return '0';
    return String(Number(val.toFixed(maxDec)));
  };

  const getSyncValue = (key: string, val: number, maxDec = 2): string => {
    if (activeInputKey === key) return activeInputRaw;
    if (!Number.isFinite(val) || val === 0) return '';
    return String(Number(val.toFixed(maxDec)));
  };

  // Switch entire calculation to a new duration in minutes while scaling quantity & materials proportionally
  const switchDurationWithScale = (targetMinutes: number) => {
    const currentMin = Math.max(1, totalMinutesPerWorker || 480);
    const ratio = targetMinutes / currentMin;
    const newQty = Math.round((quantity || 0) * ratio * 100) / 100;
    const newMat = Math.round((materials || 0) * ratio * 100) / 100;
    setExtraHours(0);
    setDays(targetMinutes / 480);
    if (quantity > 0) setQuantity(newQty);
    if (materials > 0) setMaterials(newMat);
  };

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
    const maxMinutesAllowed = Math.round((maxTotalHoursPerWorker * 60) % 60);
    alertMessage = isAr
      ? `⏱️ أقصى وقت بدون خسارة: ${maxDaysAllowed} يوم و ${maxHoursAllowed} ساعة و ${maxMinutesAllowed} دقيقة (أي ${(maxTotalHoursPerWorker * 60).toFixed(0)} دقيقة لكل عامل).`
      : `⏱️ Seuil limite : max ${maxDaysAllowed}j ${maxHoursAllowed}h ${maxMinutesAllowed}m (${(maxTotalHoursPerWorker * 60).toFixed(0)} min par ouvrier).`;
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
            onClick={() => setShowGammeModal(!showGammeModal)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-sm border active:scale-95 shrink-0 whitespace-nowrap ${
              showGammeModal
                ? 'bg-slate-900 text-amber-400 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-amber-400/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{showGammeModal ? (isAr ? '← الرجوع للحاسبة' : '← Retour Calculateur') : (isAr ? '🏭 بوستات الخياطة (Gamme)' : '🏭 Gamme de Montage')}</span>
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

      {/* MAIN SINGLE-SCREEN 2-COLUMN HUD (Hidden when Full-Page Gamme is open) */}
      {!showGammeModal && (
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
                      <span>⏱️ وقت العمل ({fmtNum(days, 2)} يوم / {fmtNum(totalHoursPerWorker, 2)} س / {fmtNum(totalMinutesPerWorker, 0)} د):</span>
                      <strong className="text-white">{fmtNum(totalHoursPerWorker * workers, 2)} {isAr ? 'ساعة خياطة' : 'heures'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>💵 ثمن الساعة ({rateMode.toUpperCase()}):</span>
                      <strong className="text-white">{fmtNum(rate, 2)} DH/h ({fmtNum(ratePerMin, 3)} DH/د)</strong>
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
                      <strong className="text-white">{unitMatCost.toFixed(2)} DH/p</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 الكمية المطلوبة:</span>
                      <strong className="text-white">{fmtNum(quantity, 2)} {isAr ? 'بياسة' : 'pièces'}</strong>
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
                      <span>📆 نصيب الطلبية ({fmtNum(days, 2)} يوم من 26 يوم):</span>
                      <strong className="text-white">{((days / 26) * 100).toFixed(2)}% من الشهر</strong>
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

            {/* LIVE AUTOMATIC 4-TIMEFRAME MATRIX (الدقيقة | الساعة | النهار | الشهر أوتوماتيك) */}
            <div className="mt-3 pt-3 border-t border-black/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                  <span>📊</span>
                  {isAr ? 'الحساب الدقيق الأوتوماتيكي (الدقيقة • الساعة • النهار • الشهر):' : 'Calcul Automatique Précis (Min • Heure • Jour • Mois) :'}
                </span>
                <span className="text-[9px] font-bold text-slate-500">
                  {isAr ? 'اضغط لتطبيق المدة' : 'Cliquer pour appliquer'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { id: 'min', label: isAr ? '⏱️ فالدقيقة' : '⏱️ / Minute', targetMin: 1, pcs: pcsPerMin, rev: revMin, cost: totalCostMin, profit: profitMin, dec: 3 },
                  { id: 'hour', label: isAr ? '🕐 فالساعة' : '🕐 / Heure', targetMin: 60, pcs: pcsPerHour, rev: revHour, cost: totalCostHour, profit: profitHour, dec: 2 },
                  { id: 'day', label: isAr ? '☀️ فالنهار (8س)' : '☀️ / Jour (8h)', targetMin: 480, pcs: pcsPerDay, rev: revDay, cost: totalCostDay, profit: profitDay, dec: 2 },
                  { id: 'month', label: isAr ? '📅 فالشهر (26ي)' : '📅 / Mois (26j)', targetMin: 12480, pcs: pcsPerMonth, rev: revMonth, cost: totalCostMonth, profit: profitMonth, dec: 2 },
                ].map((tf) => {
                  const isCurrentDuration = Math.abs(totalMinutesPerWorker - tf.targetMin) < 0.05;
                  return (
                    <div
                      key={tf.id}
                      onClick={() => switchDurationWithScale(tf.targetMin)}
                      title={isAr ? `اضغط لتحويل الحاسبة بالكامل إلى ${tf.label}` : `Cliquer pour basculer le calcul sur ${tf.label}`}
                      className={`p-2 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-1 ${
                        isCurrentDuration
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/40'
                          : 'bg-white/85 hover:bg-white text-slate-800 border-black/10 hover:border-indigo-400'
                      }`}
                    >
                      <div className={`text-[10px] font-black pb-1 border-b ${isCurrentDuration ? 'text-amber-300 border-white/15' : 'text-indigo-700 border-slate-200'}`}>
                        {tf.label}
                      </div>
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className={isCurrentDuration ? 'text-slate-300' : 'text-slate-500'}>{isAr ? 'إنتاج:' : 'Pcs:'}</span>
                          <strong className="font-black">{fmtNum(tf.pcs, 2)} {isAr ? 'ب' : 'p'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={isCurrentDuration ? 'text-slate-300' : 'text-slate-500'}>{isAr ? 'بيع:' : 'Vente:'}</span>
                          <strong className="font-bold">{tf.rev.toFixed(tf.dec)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={isCurrentDuration ? 'text-slate-300' : 'text-slate-500'}>{isAr ? 'تكلفة:' : 'Coût:'}</span>
                          <strong className="font-bold">{tf.cost.toFixed(tf.dec)}</strong>
                        </div>
                      </div>
                      <div className={`pt-1 border-t text-[10px] font-black ${
                        isCurrentDuration ? 'border-white/15' : 'border-slate-200'
                      } ${tf.profit >= 0 ? (isCurrentDuration ? 'text-emerald-400' : 'text-emerald-700') : (isCurrentDuration ? 'text-rose-400' : 'text-rose-600')}`}>
                        {tf.profit >= 0 ? '+' : ''}{tf.profit.toFixed(tf.dec)} DH
                      </div>
                    </div>
                  );
                })}
              </div>
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

        {/* RIGHT COLUMN: 3 MULTI-UNIT PROFESSIONAL INPUT CARDS (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          
          {/* Card 1: Order, Sale & Automatic Multi-Unit Quantity (الدقيقة / الساعة / النهار / الشهر) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm print-border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                {isAr ? '📦 معلومات الطلبية والبيع والإنتاج (دقيقة • ساعة • نهار • شهر)' : '📦 Infos Commande, Vente & Cadence (Min • Heure • Jour • Mois)'}
              </h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black border border-indigo-100">
                {isAr ? '🔄 تحويل أوتوماتيكي فوري' : '🔄 Conversion auto instantanée'}
              </span>
            </div>

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
                  {isAr ? 'الكمية المعتمدة (بياسة)' : 'Quantité totale (pcs)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={getSyncValue('qty_total', quantity, 2)}
                  onFocus={() => {
                    setActiveInputKey('qty_total');
                    setActiveInputRaw(quantity === 0 ? '' : String(Number(quantity.toFixed(2))));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    setQuantity(e.target.value === '' ? 0 : Number(e.target.value));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'ثمن البيع للبياسة (DH)' : 'Prix unitaire (DH)'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={getSyncValue('price_unit', pricePerPiece, 2)}
                  onFocus={() => {
                    setActiveInputKey('price_unit');
                    setActiveInputRaw(pricePerPiece === 0 ? '' : String(pricePerPiece));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    setPricePerPiece(e.target.value === '' ? 0 : Number(e.target.value));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'الثمن الإجمالي (DH)' : 'Total Vente (DH)'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={totalPriceClient.toFixed(2)}
                  className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-black text-xs text-center cursor-not-allowed"
                />
              </div>
            </div>

            {/* Synchronized Quantity Rate Inputs: Minute | Hour | Day | Month */}
            <div className="p-3 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-amber-50/60 rounded-2xl border border-indigo-100/90">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-black text-indigo-900">
                  {isAr
                    ? '⚡ إدخال وحساب كمية الإنتاج (اكتب فـ الدقيقة أو الساعة أو النهار أو الشهر وكيعطيك الباقي أوتوماتيك):'
                    : '⚡ Cadence de production (saisissez par Minute, Heure, Jour ou Mois — calcul automatique) :'}
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  {isAr ? `1 شهر = 26 يوم = 208 ساعة = 12,480 دقيقة` : `1 mois = 26j = 208h = 12 480 min`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Pieces per Minute */}
                <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-[10px] font-black text-slate-600 mb-1 text-center">
                    {isAr ? '⏱️ بياسة / دقيقة' : '⏱️ Pièces / Minute'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={getSyncValue('pcs_min', pcsPerMin, 3)}
                    onFocus={() => {
                      setActiveInputKey('pcs_min');
                      setActiveInputRaw(pcsPerMin === 0 ? '' : fmtNum(pcsPerMin, 3));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setQuantity(Math.round(val * effectiveDurationMin * 100) / 100);
                    }}
                    className="w-full px-2 py-1 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                  />
                  <div className="mt-1 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                    <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                    <strong className="text-emerald-700">{revMin.toFixed(2)} DH/د</strong>
                  </div>
                </div>

                {/* Pieces per Hour */}
                <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-[10px] font-black text-slate-600 mb-1 text-center">
                    {isAr ? '🕐 بياسة / ساعة' : '🕐 Pièces / Heure'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={getSyncValue('pcs_hour', pcsPerHour, 2)}
                    onFocus={() => {
                      setActiveInputKey('pcs_hour');
                      setActiveInputRaw(pcsPerHour === 0 ? '' : fmtNum(pcsPerHour, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      const newPcsMin = val / 60;
                      setQuantity(Math.round(newPcsMin * effectiveDurationMin * 100) / 100);
                    }}
                    className="w-full px-2 py-1 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                  />
                  <div className="mt-1 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                    <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                    <strong className="text-emerald-700">{revHour.toFixed(2)} DH/س</strong>
                  </div>
                </div>

                {/* Pieces per Day (8h) */}
                <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-[10px] font-black text-slate-600 mb-1 text-center">
                    {isAr ? '☀️ بياسة / نهار (8س)' : '☀️ Pièces / Jour (8h)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={getSyncValue('pcs_day', pcsPerDay, 2)}
                    onFocus={() => {
                      setActiveInputKey('pcs_day');
                      setActiveInputRaw(pcsPerDay === 0 ? '' : fmtNum(pcsPerDay, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      const newPcsMin = val / 480;
                      setQuantity(Math.round(newPcsMin * effectiveDurationMin * 100) / 100);
                    }}
                    className="w-full px-2 py-1 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                  />
                  <div className="mt-1 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                    <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                    <strong className="text-emerald-700">{revDay.toFixed(2)} DH/يوم</strong>
                  </div>
                </div>

                {/* Pieces per Month (26j = 208h = 12,480 min) */}
                <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="block text-[10px] font-black text-slate-600 mb-1 text-center">
                    {isAr ? '📅 بياسة / شهر (26ي)' : '📅 Pièces / Mois (26j)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={getSyncValue('pcs_month', pcsPerMonth, 2)}
                    onFocus={() => {
                      setActiveInputKey('pcs_month');
                      setActiveInputRaw(pcsPerMonth === 0 ? '' : fmtNum(pcsPerMonth, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      const newPcsMin = val / 12480;
                      setQuantity(Math.round(newPcsMin * effectiveDurationMin * 100) / 100);
                    }}
                    className="w-full px-2 py-1 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                  />
                  <div className="mt-1 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                    <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                    <strong className="text-emerald-700">{revMonth.toFixed(2)} DH/شهر</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Labor, Multi-Unit Work Duration (دقيقة / ساعة / نهار / شهر) & Multi-Unit Wage Rate */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm print-border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                {isAr ? '👷 اليد العاملة والوقت الدقيق (بالدقيقة • بالساعة • بالنهار • بالشهر)' : '👷 Main-d\'œuvre & Temps Précis (Min • Heure • Jour • Mois)'}
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setWorkers(activePostesCount)}
                  title={isAr ? "مطابقة مع عدد بوستات الخياطة في الغام" : "Synchroniser avec les postes de la gamme"}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white rounded-md text-[10px] font-black transition-all border border-amber-200"
                >
                  = {activePostesCount} {isAr ? 'بوستات في الغام' : 'postes (Gamme)'}
                </button>
                <button
                  onClick={() => setShowWorkersModal(true)}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100"
                >
                  <UserCheck className="w-3 h-3" />
                  {isAr ? 'تحديد أسماء العمال' : 'Sélectionner ouvriers'}
                </button>
              </div>
            </div>

            {/* Row 1: Workers Count + Synchronized Work Duration in 4 Units (Minute / Hour / Day / Month) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-600 mb-1 text-center">
                  {isAr ? '👥 عدد العمال' : '👥 Ouvriers'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={workers}
                  onChange={(e) => setWorkers(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-2 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl font-black text-indigo-700 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Duration in Minutes */}
              <div>
                <label className="block text-[10px] font-black text-amber-700 mb-1 text-center">
                  {isAr ? '⏱️ دقائق العمل' : '⏱️ Minutes trav.'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={getSyncValue('dur_min', totalMinutesPerWorker, 2)}
                  onFocus={() => {
                    setActiveInputKey('dur_min');
                    setActiveInputRaw(totalMinutesPerWorker === 0 ? '' : fmtNum(totalMinutesPerWorker, 2));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    const minVal = e.target.value === '' ? 0 : Number(e.target.value);
                    setExtraHours(0);
                    setDays(minVal / 480);
                  }}
                  className="w-full px-2 py-1.5 bg-amber-50/60 border border-amber-200 rounded-xl font-black text-amber-800 text-xs text-center focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Duration in Hours */}
              <div>
                <label className="block text-[10px] font-black text-indigo-700 mb-1 text-center">
                  {isAr ? '🕐 ساعات العمل' : '🕐 Heures trav.'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={getSyncValue('dur_hour', totalHoursPerWorker, 2)}
                  onFocus={() => {
                    setActiveInputKey('dur_hour');
                    setActiveInputRaw(totalHoursPerWorker === 0 ? '' : fmtNum(totalHoursPerWorker, 2));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    const hrVal = e.target.value === '' ? 0 : Number(e.target.value);
                    setExtraHours(0);
                    setDays(hrVal / 8);
                  }}
                  className="w-full px-2 py-1.5 bg-indigo-50/50 border border-indigo-200 rounded-xl font-black text-indigo-700 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Duration in Days (8h) */}
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1 text-center">
                  {isAr ? '☀️ أيام العمل (8س)' : '☀️ Jours (8h)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={getSyncValue('dur_day', days + (extraHours / 8), 3)}
                  onFocus={() => {
                    setActiveInputKey('dur_day');
                    const d = days + (extraHours / 8);
                    setActiveInputRaw(d === 0 ? '' : fmtNum(d, 3));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    const dayVal = e.target.value === '' ? 0 : Number(e.target.value);
                    setExtraHours(0);
                    setDays(dayVal);
                  }}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Duration in Months (26j = 208h = 12,480 min) */}
              <div>
                <label className="block text-[10px] font-black text-emerald-700 mb-1 text-center">
                  {isAr ? '📅 أشهر العمل (26ي)' : '📅 Mois (26j)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={getSyncValue('dur_month', totalHoursPerWorker / 208, 4)}
                  onFocus={() => {
                    setActiveInputKey('dur_month');
                    const m = totalHoursPerWorker / 208;
                    setActiveInputRaw(m === 0 ? '' : fmtNum(m, 4));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    const monthVal = e.target.value === '' ? 0 : Number(e.target.value);
                    setExtraHours(0);
                    setDays(monthVal * 26);
                  }}
                  className="w-full px-2 py-1.5 bg-emerald-50/50 border border-emerald-200 rounded-xl font-black text-emerald-700 text-xs text-center focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Row 2: Synchronized Worker Wage Rate in 4 Units (ثمن الدقيقة | ثمن الساعة | ثمن النهار | ثمن الشهر) */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black text-slate-700">
                  {isAr
                    ? '💵 أجر العامل الواحد (عدّل أي خانة: دقيقة أو ساعة أو نهار أو شهر وكيتحسب الباقي أوتوماتيك):'
                    : '💵 Salaire d\'un ouvrier (modifiable par Minute, Heure, Jour ou Mois) :'}
                </span>
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setRateMode('smig');
                      setRate(17.10);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${
                      rateMode === 'smig'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    SMIG (17.10 DH/h)
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
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all flex items-center gap-0.5 ${
                      rateMode === 'rh'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    👥 {isAr ? 'رواتب RH' : 'RH Data'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Wage per Minute */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 text-center">
                    {isAr ? 'ثمن الدقيقة (DH/د)' : 'Taux / Minute'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={getSyncValue('rate_min', ratePerMin, 4)}
                    onFocus={() => {
                      setActiveInputKey('rate_min');
                      setActiveInputRaw(fmtNum(ratePerMin, 4));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setRate(v * 60);
                      if (rateMode === 'rh') setRateMode('smig');
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-indigo-600 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>

                {/* Wage per Hour */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 text-center">
                    {isAr ? 'ثمن الساعة (DH/س)' : 'Taux / Heure'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={getSyncValue('rate_hour', ratePerHour, 2)}
                    onFocus={() => {
                      setActiveInputKey('rate_hour');
                      setActiveInputRaw(fmtNum(ratePerHour, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setRate(v);
                      if (rateMode === 'rh') setRateMode('smig');
                    }}
                    className="w-full px-2 py-1 bg-white border border-indigo-300 rounded-lg font-black text-indigo-700 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>

                {/* Wage per Day (8h) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 text-center">
                    {isAr ? 'ثمن النهار (DH/يوم)' : 'Taux / Jour (8h)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={getSyncValue('rate_day', ratePerDay, 2)}
                    onFocus={() => {
                      setActiveInputKey('rate_day');
                      setActiveInputRaw(fmtNum(ratePerDay, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setRate(v / 8);
                      if (rateMode === 'rh') setRateMode('smig');
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-indigo-600 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>

                {/* Wage per Month (208h) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 text-center">
                    {isAr ? 'ثمن الشهر (DH/شهر)' : 'Salaire / Mois'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={getSyncValue('rate_month', ratePerMonth, 2)}
                    onFocus={() => {
                      setActiveInputKey('rate_month');
                      setActiveInputRaw(fmtNum(ratePerMonth, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setRate(v / 208);
                      if (rateMode === 'rh') setRateMode('smig');
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-emerald-700 text-xs text-center focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Production Capacity Indicator & Gamme Minutes Connection */}
            <div className="p-2.5 bg-gradient-to-r from-indigo-50/90 to-amber-50/80 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 animate-pulse" />
                <span className="font-extrabold text-slate-800">
                  {isAr ? '⚡ قدرة الغام (Gamme):' : '⚡ Capacité Gamme :'}
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-800 rounded-lg text-[11px] font-black border border-amber-500/20">
                  {activePostesCount} {isAr ? 'بوستات' : 'postes'} • {activeGammeMinutes} {isAr ? 'دقيقة/بياسة' : 'min/pc'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-black text-indigo-700 text-[11px]">
                <span>{fmtNum((workers * 60) / activeGammeMinutes, 1)} {isAr ? 'بياسة/ساعة' : 'pcs/h'}</span>
                <span className="text-slate-300">|</span>
                <span>{Math.max(1, Math.floor((workers * 8 * 60) / activeGammeMinutes))} {isAr ? 'بياسة/يوم' : 'pcs/j'}</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700">
                  {Math.max(1, Math.floor((workers * totalMinutesPerWorker) / activeGammeMinutes))} {isAr ? 'بياسة فـ المدة' : 'pcs total'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black">
                  {isAr ? `تكلفة الغام: ${exactCostPerPiece.toFixed(2)} DH` : `Coût Gamme: ${exactCostPerPiece.toFixed(2)} DH`}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Materials & Multi-Unit Atelier Fixed Expenses (دقيقة • ساعة • نهار • شهر) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm print-border space-y-3">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Scissors className="w-3.5 h-3.5 text-indigo-600" />
              {isAr ? '🧵 السلعة ومصاريف الأتوليي (بالدقيقة • بالساعة • بالنهار • بالشهر)' : '🧵 Matière & Frais d\'Atelier (Min • Heure • Jour • Mois)'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'ثمن القماش واللوازم (الإجمالي DH)' : 'Coût matière total (DH)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={getSyncValue('mat_total', materials, 2)}
                  onFocus={() => {
                    setActiveInputKey('mat_total');
                    setActiveInputRaw(materials === 0 ? '' : fmtNum(materials, 2));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    setMaterials(e.target.value === '' ? 0 : Number(e.target.value));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'ثمن السلعة للبياسة الواحدة (DH/بياسة)' : 'Coût matière / pièce (DH)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={getSyncValue('mat_unit', unitMatCost, 3)}
                  onFocus={() => {
                    setActiveInputKey('mat_unit');
                    setActiveInputRaw(unitMatCost === 0 ? '' : fmtNum(unitMatCost, 3));
                  }}
                  onBlur={() => setActiveInputKey(null)}
                  onChange={(e) => {
                    setActiveInputRaw(e.target.value);
                    const u = e.target.value === '' ? 0 : Number(e.target.value);
                    setMaterials(Math.round(u * (quantity || 1) * 100) / 100);
                  }}
                  className="w-full px-3 py-1.5 bg-emerald-50/50 border border-emerald-200 rounded-xl font-black text-emerald-700 text-xs text-center focus:bg-white focus:border-emerald-600 outline-none"
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
                  onChange={(e) => setTotalMachines(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            {/* Atelier Fixed Expenses in 4 Synchronized Units */}
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-700 flex items-center gap-1">
                  <span>🏢</span>
                  {isAr ? 'مصاريف الأتوليي الثابتة (الكرا، الضو...) — بالدقيقة / الساعة / النهار / الشهر:' : 'Frais fixes d\'atelier (Loyer, élec...) — Min / Heure / Jour / Mois :'}
                </span>
                {monthlyChargesSynced && (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                    {isAr ? 'مرتبط بصفحة المصاريف' : 'Synchro Charges'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-0.5 text-center">
                    {isAr ? 'مصاريف الدقيقة (DH/د)' : 'Frais / Minute'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('frais_min', monthlyAtelierMin, 3)}
                    onFocus={() => {
                      setActiveInputKey('frais_min');
                      setActiveInputRaw(fmtNum(monthlyAtelierMin, 3));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setMonthlyOther(Math.round(v * 12480 * 100) / 100);
                      setMonthlyChargesSynced(false);
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-slate-700 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-0.5 text-center">
                    {isAr ? 'مصاريف الساعة (DH/س)' : 'Frais / Heure'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('frais_hour', monthlyAtelierHour, 2)}
                    onFocus={() => {
                      setActiveInputKey('frais_hour');
                      setActiveInputRaw(fmtNum(monthlyAtelierHour, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setMonthlyOther(Math.round(v * 208 * 100) / 100);
                      setMonthlyChargesSynced(false);
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-slate-700 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-0.5 text-center">
                    {isAr ? 'مصاريف النهار (DH/يوم)' : 'Frais / Jour (8h)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('frais_day', monthlyAtelierDay, 2)}
                    onFocus={() => {
                      setActiveInputKey('frais_day');
                      setActiveInputRaw(fmtNum(monthlyAtelierDay, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      const v = e.target.value === '' ? 0 : Number(e.target.value);
                      setMonthlyOther(Math.round(v * 26 * 100) / 100);
                      setMonthlyChargesSynced(false);
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-black text-slate-700 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-indigo-700 mb-0.5 text-center">
                    {isAr ? 'مصاريف الشهر (DH/شهر)' : 'Frais / Mois (26j)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('frais_month', monthlyOther, 2)}
                    onFocus={() => {
                      setActiveInputKey('frais_month');
                      setActiveInputRaw(monthlyOther === 0 ? '' : fmtNum(monthlyOther, 2));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      setMonthlyOther(e.target.value === '' ? 0 : Number(e.target.value));
                      setMonthlyChargesSynced(false);
                    }}
                    className="w-full px-2 py-1 bg-white border border-indigo-300 rounded-lg font-black text-indigo-700 text-xs text-center focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
      )}

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

      {/* FULL PAGE VIEW POUR LA GAMME DE MONTAGE ("F PAGE MACHI FBOX" + QUICK MACHINES TOP BAR + DUPLICATE POSTES) */}
      {showGammeModal && (() => {
        const breakdown = getGarmentTechnicalBreakdown(itemName, (materials / qty) / 35, materials / qty);
        const activePostes = (customPostes && customPostes.length > 0) ? customPostes : breakdown.postesTravail;
        const activeTotalMin = activePostes.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
        const selectedPresetObj = ATELIER_MACHINES_PRESETS.find(m => m.machine === selectedQuickMachine) || ATELIER_MACHINES_PRESETS[0];

        const addPosteWithMachine = (machineName: string) => {
          const preset = ATELIER_MACHINES_PRESETS.find(m => m.machine === machineName);
          const current = customPostes || [...breakdown.postesTravail];
          const next = [
            ...current,
            {
              nomAr: preset ? preset.defaultNomAr : 'مرحلة عمل مخصصة جديدة',
              nomFr: preset ? preset.defaultNomFr : 'Nouveau poste personnalisé',
              machine: machineName,
              tempsMin: preset ? preset.defaultMin : 5,
              roleOuvrier: preset ? preset.role : 'خياط متخصص'
            }
          ];
          setCustomPostes(next);
        };

        return (
          <div className="w-full bg-slate-900 text-white rounded-3xl border border-amber-400/60 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col animate-fadeIn">
            {/* Full-Page Header */}
            <div className="p-5 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {isAr ? '🏭 بوستات العمل الفنية ومراحل الخياطة (صفحة التعديل المباشر)' : '🏭 Gamme de Montage & Postes de Travail (Page complète)'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs text-amber-300 font-bold">
                      {activePostes.length} {isAr ? 'بوستات عمل' : 'Postes'} | {activeTotalMin} {isAr ? 'دقيقة/بياسة' : 'min / pièce'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-emerald-400 font-black">
                      {isAr ? 'التكلفة الدقيقة:' : 'Coût exact:'} {((materials / qty) + ((activeTotalMin / 60) * rate)).toFixed(2)} DH / {isAr ? 'بياسة' : 'pièce'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWorkers(activePostes.length)}
                  title={isAr ? 'ضبط عدد العمال تلقائياً على عدد البوستات' : 'Ajuster ouvriers = postes'}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                >
                  🔄 {isAr ? `تعيين العمال = (${activePostes.length})` : `Ouvriers = ${activePostes.length}`}
                </button>

                {customPostes && (
                  <button
                    type="button"
                    onClick={() => setCustomPostes(null)}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition-all"
                  >
                    🔄 {isAr ? 'إعادة الافتراضي' : 'Défaut'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowGammeModal(false)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isAr ? 'حفظ والرجوع للحاسبة' : 'Enregistrer & Retour'}</span>
                </button>
              </div>
            </div>

            {/* Full-Page Body */}
            <div className="p-5 space-y-4 flex-1">
              {/* Top Section: Custom Model Name + Quick Machines Bar + Add Post Action */}
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-3.5">
                {/* Row 1: Model Name + Add Workstation + Clear */}
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                      className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-bold outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addPosteWithMachine(selectedQuickMachine)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-900/40 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? '+ إضافة مرحلة عمل' : '+ Ajouter Poste'}</span>
                      <span className="px-2 py-0.5 bg-black/25 rounded-lg text-[10px] text-amber-100 font-bold">
                        {isAr ? selectedPresetObj.labelAr : selectedQuickMachine}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomPostes([])}
                      title={isAr ? 'تفريغ جميع المراحل للبدء من الصفر' : 'Vider tous les postes pour commencer de zéro'}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>{isAr ? 'تفريغ' : 'Vider'}</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Quick Machines Bar at the Top ("les machin ikon mktoubin fchi blasa lfouq bach fach nbghi nzid ay pst lkhtar lamachin lighadi tkhdm lih bzrba") */}
                <div className="pt-3 border-t border-slate-700/70">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <span>⚡</span>
                      {isAr
                        ? 'الآلات المتوفرة (اضغط على الآلة لاختيارها، أو اضغط على [+] لإضافة بوست بها فوراً):'
                        : 'Machines disponibles (Cliquez pour choisir la machine, ou sur [+] pour ajouter un poste directement) :'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {isAr ? 'الآلة المختارة حالياً:' : 'Machine sélectionnée :'}{' '}
                      <strong className="text-amber-400">{selectedQuickMachine}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {ATELIER_MACHINES_PRESETS.map((m) => {
                      const isSelected = selectedQuickMachine === m.machine;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedQuickMachine(m.machine)}
                          className={`group flex items-center justify-between gap-1.5 p-2 rounded-xl border cursor-pointer transition-all select-none ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                              : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className={`text-[11px] font-black truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                              {m.labelAr}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 truncate">
                              {m.machine}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuickMachine(m.machine);
                              addPosteWithMachine(m.machine);
                            }}
                            title={isAr ? `إضافة بوست جديد مباشرة بآلة: ${m.machine}` : `Ajouter directement un poste avec: ${m.machine}`}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-all active:scale-90 ${
                              isSelected
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                : 'bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Datalist for quick autocomplete when typing machine names */}
              <datalist id="atelier-machines-datalist">
                {ATELIER_MACHINES_PRESETS.map((m) => (
                  <option key={m.id} value={m.machine}>{m.labelAr}</option>
                ))}
              </datalist>

              {/* Workstations Table (Full-Page, No Cramped Box Height, With Duplicate & Quick Machine Select) */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300">
                      <th className="p-3 text-center font-black border-b border-white/10 w-12">#</th>
                      <th className="p-3 text-start font-black border-b border-white/10">{isAr ? 'المرحلة (وصف العملية)' : 'Étape (Opération)'}</th>
                      <th className="p-3 text-start font-black border-b border-white/10 w-72">{isAr ? 'الآلة (اختيار سريع أو كتابة)' : 'Machine'}</th>
                      <th className="p-3 text-center font-black border-b border-white/10 w-28">{isAr ? 'دقيقة' : 'Min'}</th>
                      <th className="p-3 text-center font-black border-b border-white/10 w-36">{isAr ? 'مضاعفة / حذف' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePostes.map((poste, idx) => (
                      <tr key={idx} className="odd:bg-white/[0.02] even:bg-transparent hover:bg-white/5 transition-colors group">
                        <td className="p-2.5 text-center font-black text-amber-400/80 border-b border-white/5">{idx + 1}</td>
                        <td className="p-1.5 border-b border-white/5">
                          <input
                            type="text"
                            value={isAr ? poste.nomAr : poste.nomFr}
                            onChange={(e) => {
                              const current = customPostes || [...breakdown.postesTravail];
                              const updated = current.map((p, i) => i === idx ? { ...p, [isAr ? 'nomAr' : 'nomFr']: e.target.value } : p);
                              setCustomPostes(updated);
                            }}
                            className="w-full bg-slate-800/40 hover:bg-slate-800 focus:bg-slate-800 text-white font-bold outline-none px-3 py-2 rounded-xl border border-transparent focus:border-amber-500/50 transition-all"
                          />
                        </td>
                        <td className="p-1.5 border-b border-white/5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              list="atelier-machines-datalist"
                              value={poste.machine}
                              onChange={(e) => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const updated = current.map((p, i) => i === idx ? { ...p, machine: e.target.value } : p);
                                setCustomPostes(updated);
                              }}
                              className="flex-1 bg-slate-800/40 hover:bg-slate-800 focus:bg-slate-800 text-amber-200 font-bold outline-none px-2.5 py-2 rounded-xl border border-transparent focus:border-amber-500/50 transition-all"
                            />
                            <select
                              value={ATELIER_MACHINES_PRESETS.some(m => m.machine === poste.machine) ? poste.machine : ''}
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const current = customPostes || [...breakdown.postesTravail];
                                const updated = current.map((p, i) => i === idx ? { ...p, machine: e.target.value } : p);
                                setCustomPostes(updated);
                              }}
                              title={isAr ? 'تغيير الآلة بسرعة' : 'Changer la machine rapidement'}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold px-2 py-2 rounded-xl border border-slate-700 outline-none cursor-pointer max-w-[115px] truncate"
                            >
                              <option value="">{isAr ? '⚡ آلة...' : '⚡ Machine...'}</option>
                              {ATELIER_MACHINES_PRESETS.map((m) => (
                                <option key={m.id} value={m.machine}>
                                  {isAr ? `${m.labelAr} (${m.machine})` : m.machine}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-1.5 border-b border-white/5">
                          <input
                            type="number"
                            min="1"
                            value={poste.tempsMin}
                            onChange={(e) => {
                              const current = customPostes || [...breakdown.postesTravail];
                              const newTime = Math.max(1, Number(e.target.value) || 1);
                              setCustomPostes(current.map((p, i) => i === idx ? { ...p, tempsMin: newTime } : p));
                            }}
                            className="w-full bg-slate-800/60 hover:bg-slate-800 focus:bg-slate-800 text-center font-black text-white text-sm outline-none px-2 py-2 rounded-xl border border-slate-700/60 focus:border-amber-500 transition-all"
                          />
                        </td>
                        <td className="p-1.5 text-center border-b border-white/5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const duplicatedPoste: PosteTravail = { ...poste };
                                const updated = [
                                  ...current.slice(0, idx + 1),
                                  duplicatedPoste,
                                  ...current.slice(idx + 1)
                                ];
                                setCustomPostes(updated);
                              }}
                              title={isAr ? 'مضاعفة هذا البوست (Dupliquer ce poste)' : 'Dupliquer ce poste'}
                              className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all active:scale-95"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{isAr ? 'نسخ' : 'Dupliquer'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const current = customPostes || [...breakdown.postesTravail];
                                const updated = current.filter((_, i) => i !== idx);
                                setCustomPostes(updated);
                              }}
                              title={isAr ? 'حذف هذه المرحلة' : 'Supprimer ce poste'}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition-all active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full-Page Footer */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span>{isAr ? '🧵 التكلفة الدقيقة للبياسة:' : 'Coût de revient :'}</span>
                  <strong className="text-emerald-400 font-black text-sm">
                    {((materials / qty) + ((activeTotalMin / 60) * rate)).toFixed(2)} DH / {isAr ? 'بياسة' : 'pièce'}
                  </strong>
                </div>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span>{isAr ? '⏱️ مجموع وقت الخياطة:' : 'Temps total :' }</span>
                  <strong className="text-amber-300 font-black text-sm">
                    {activeTotalMin} {isAr ? 'دقيقة' : 'min'} ({activePostes.length} {isAr ? 'بوستات' : 'postes'})
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGammeModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تم (حفظ والرجوع إلى الحاسبة)' : 'Terminer (Enregistrer & Retour)'}</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


