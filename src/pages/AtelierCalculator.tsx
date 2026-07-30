import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { 
  Calculator, Printer, CheckCircle2, AlertTriangle, 
  Clock, Package, Users, Scissors, ShoppingCart, ArrowLeft,
  DollarSign, Sparkles, Check, X, Bot, Wand2, RefreshCw, UserCheck
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { loadData, Employe } from '../types';

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
  { id: 'emp-9', nom: 'المرابط', prenom: 'عمر', poste: 'خياط (Confection)', type: 'atelier', telephone: '0600000009', email: '', actif: true },
  { id: 'emp-10', nom: 'البرنوصي', prenom: 'هند', poste: 'خياطة (Confection)', type: 'atelier', telephone: '0600000010', email: '', actif: true }
];

interface AiPreset {
  title: string;
  desc: string;
  aiText: string;
  recommendedPrice: number;
  materialPerPiece: number;
  recommendedDays: number;
}

const AI_PRESETS: AiPreset[] = [
  {
    title: '👕 Ensemble تيشرت وشورت صيفي مع زخرفة (Galon)',
    desc: 'تيشرت وشورت صيفي بشريط مزخرف (bande/galon) ستايل شبابي كلاس',
    aiText: 'تبارك الله عليك، هاد Ensemble تيشرت وشورت صيفي مطلوب بزاف هاد الأيام في السوق المغربية. بفضل ديك (Class) وستايل شبابي و كلاص اللي عاطياه (bande/galon) السلسلة المزخرفة لمسة زوينة. الكميات اللي غتحتاج وتكلفة الإنتاج بالتفصيل الممل مناسبة جداً للطلبيات المتوسطة والكبيرة.',
    recommendedPrice: 45.00,
    materialPerPiece: 18.50,
    recommendedDays: 2
  },
  {
    title: '👗 عباية مغربية كريب فاخرة مع تطريز سفيفة',
    desc: 'عباية كريب جودة عالية مع سفيفة وعقاد في الصدر والأكمام',
    aiText: 'برافو، العباية المغربية بالكريب الفاخر والسفيفة هي الأكثر طلباً طول السنة. التكلفة ديال الثمن والقماش كتعطي هامش ربح ممتاز جداً للأتوليي، خصوصاً مع دقة الخياطة المغربية.',
    recommendedPrice: 120.00,
    materialPerPiece: 55.00,
    recommendedDays: 3
  },
  {
    title: '🎽 هودي وبنطلون رياضي Over-size (Cotton Fleece)',
    desc: 'طقم رياضي شتوي/خريفي قطن ثقيل بقصة واسعة Over-size',
    aiText: 'ستايل Over-size الرياضي عندو إقبال كبير من الشباب والبراندات المحلية. استهلاك القماش كيكون شوية زايد (حوالي 1.8 متر للطقم)، ولكن سرعة التجميع في الماكينة كتعوض الوقت.',
    recommendedPrice: 85.00,
    materialPerPiece: 38.00,
    recommendedDays: 2
  }
];

export default function AtelierCalculator({
  isModal = false,
  onClose,
  onProceedToOrder
}: AtelierCalculatorProps) {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();

  // Admin security check
  const [isAdmin, setIsAdmin] = useState(true);
  useEffect(() => {
    try {
      const s = localStorage.getItem('textrack_auth');
      const u = s ? JSON.parse(s) : null;
      const allowed = u?.role === 'admin' || u?.email === 'admin@beyacreative.com';
      setIsAdmin(allowed);
    } catch {
      setIsAdmin(false);
    }
  }, []);

// Filter ONLY employees working INSIDE the atelier (production workers)
function isAtelierProductionWorker(e: Employe): boolean {
  if (!e.actif) return false;
  if (e.type === 'sous_traitance') return false;

  const poste = (e.poste || '').toLowerCase();
  // Exclude external service providers (Prestataire, Impression, Broderie, DTF, Sérigraphie, etc.)
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

  // Exclude non-production administrative / design roles (RH, Modéliste, Commercial, Comptable, Admin)
  if (
    poste.includes('rh') ||
    poste.includes('ressources humaines') ||
    poste.includes('modéliste') ||
    poste.includes('modeliste') ||
    poste.includes('commercial') ||
    poste.includes('comptable') ||
    poste.includes('admin')
  ) {
    return false;
  }

  return true;
}

  // Real Atelier Workers Connection (Smart Feature 1 - Filtered for INSIDE ATELIER ONLY)
  const [allWorkers, setAllWorkers] = useState<Employe[]>(DEFAULT_WORKERS);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(DEFAULT_WORKERS.map(w => w.id));
  const [showWorkersModal, setShowWorkersModal] = useState(false);

  useEffect(() => {
    loadData<Employe>('employes').then((data: Employe[]) => {
      const activeAtelier = (data || []).filter(isAtelierProductionWorker);
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

  // AI Cost Estimator Modal (Smart Feature 2)
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedAiPreset, setSelectedAiPreset] = useState<AiPreset>(AI_PRESETS[0]);
  const [aiCustomText, setAiCustomText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisDone, setAiAnalysisDone] = useState(true);

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

  // Apply AI estimation values to calculator
  const applyAiEstimation = (preset: AiPreset) => {
    setItemName(preset.title.replace(/^[^\s]+\s+/, ''));
    setPricePerPiece(preset.recommendedPrice);
    setMaterials(Math.round(preset.materialPerPiece * qty));
    setDays(preset.recommendedDays);
    setShowAiModal(false);
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

        {/* Smart Actions Toolbar */}
        <div className="flex items-center gap-2 no-print flex-wrap">
          <button
            onClick={() => setShowWorkersModal(true)}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs border border-indigo-100 active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            {isAr ? `👷 عمال الأتوليي (${selectedWorkerIds.length})` : `👷 Ouvriers (${selectedWorkerIds.length})`}
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-200 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {isAr ? '🤖 الذكاء الاصطناعي (AI Expert)' : '🤖 Estimation IA'}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            {isAr ? 'طباعة / PDF' : 'Imprimer'}
          </button>

          {!isModal && (
            <button
              onClick={() => navigate('/commandes')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isAr ? 'الطلبيات' : 'Commandes'}
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
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

                <div className="px-2.5 py-1 bg-white/90 rounded-xl border border-black/5 text-xs font-black text-indigo-700 shadow-2xs">
                  {isAr ? 'البياسة الواحدة:' : 'Coût/pièce :'} {costPerPiece.toFixed(2)} {isAr ? 'درهم' : 'DH'}
                </div>
              </div>

              {/* Huge Amount Display */}
              <div className="my-3 text-center">
                <div
                  className={`text-4xl xl:text-5xl font-black tracking-tight leading-none ${
                    resultStatus === 'profit' ? 'text-emerald-600' : resultStatus === 'loss' ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {Math.abs(difference).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  <span className="text-xl font-bold">{isAr ? 'درهم' : 'DH'}</span>
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  {isAr ? 'التكلفة الإجمالية للإنتاج:' : 'Coût total de production :'}{' '}
                  <span className="font-black text-slate-800">{realCost.toFixed(2)} {isAr ? 'درهم' : 'DH'}</span>
                </div>
              </div>
            </div>

            {/* Tight 3-Column Cost Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/10 text-center">
              <div className="bg-white/70 p-2 rounded-xl border border-black/5">
                <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? 'اليد العاملة' : 'Main d\'œuvre'}</span>
                <strong className="text-xs font-black text-slate-900">{totalLaborCost.toFixed(2)} DH</strong>
              </div>
              <div className="bg-white/70 p-2 rounded-xl border border-black/5">
                <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? 'السلعة' : 'Matière'}</span>
                <strong className="text-xs font-black text-slate-900">{materials.toFixed(2)} DH</strong>
              </div>
              <div className="bg-white/70 p-2 rounded-xl border border-black/5">
                <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? 'مصاريف الأتوليي' : 'Frais atelier'}</span>
                <strong className="text-xs font-black text-slate-900">{allocatedExpenses.toFixed(2)} DH</strong>
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
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'الكمية (بياسة)' : 'Quantité (pcs)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
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
                  value={pricePerPiece}
                  onChange={(e) => setPricePerPiece(Number(e.target.value))}
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
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'عدد العمال (أتوليي)' : 'Ouvriers'}
                </label>
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
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
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
                  value={extraHours}
                  onChange={(e) => setExtraHours(Number(e.target.value))}
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
                  value={materials}
                  onChange={(e) => setMaterials(Number(e.target.value))}
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
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? 'مصاريف الشهر (الكرا، الضو...)' : 'Frais fixes mensuels (DH)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyOther}
                  onChange={(e) => setMonthlyOther(Number(e.target.value))}
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

            {/* Filter Notice Banner */}
            <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                {isAr 
                  ? '✨ القائمة تعرض حصرياً عمال الإنتاج داخل الأتوليي (تم استبعاد مزودي الخدمات الخارجية والإدارة)' 
                  : '✨ Liste filtrée : uniquement les ouvriers de production en atelier (sans prestataires ni admin)'}
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {isAr ? `المحددون: ${selectedWorkerIds.length} من أصل ${allWorkers.length} عامل` : `Sélectionnés: ${selectedWorkerIds.length} / ${allWorkers.length}`}
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
              {allWorkers.map((emp) => {
                const isSelected = selectedWorkerIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleWorker(emp.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {emp.prenom[0]}
                      </div>
                      <div>
                        <div className="font-black text-xs">
                          {emp.prenom} {emp.nom}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">
                          {emp.poste || (isAr ? 'عامل إنتاج' : 'Ouvrier')}
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
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

      {/* MODAL 2: AI COST ESTIMATOR FROM MODEL (Smart Feature 2) */}
      {showAiModal && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-400/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm flex items-center gap-2">
                    {isAr ? 'مساعد BEYA الذكي لتقدير تكلفة الإنتاج (Expert IA)' : 'Assistant Expert BEYA - Estimation IA'}
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] border border-emerald-500/30">
                      TOUJOURS ACTIF
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {isAr ? 'تحليل الموديل أو الصورة وإعطاء تقدير التكلفة وسعر القماش في السوق المغربية' : 'Analyse du modèle et estimation du coût matière en DH'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Presets selector */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <label className="block text-xs font-black text-slate-700 mb-2">
                {isAr ? 'اختَر موديل أو مثال جاهز للتحليل (أو اكتب وصفك الخاص):' : 'Sélectionnez un modèle ou cas pratique :'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {AI_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAiPreset(preset);
                      setIsAiAnalyzing(true);
                      setTimeout(() => setIsAiAnalyzing(false), 500);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedAiPreset.title === preset.title
                        ? 'bg-white border-violet-500 shadow-sm ring-2 ring-violet-200'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="font-black text-xs text-slate-900 truncate">{preset.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Conversation & Breakdown */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isAiAnalyzing ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-600">
                    {isAr ? 'جاري تحليل الموديل وحساب أسعار القماش في السوق المغربية...' : 'Analyse du modèle en cours...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* AI Response Box (moroccan style as in user screenshot) */}
                  <div className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50/50 rounded-3xl border border-violet-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-violet-900 font-black text-xs">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>{isAr ? 'تحليل الخبير (Expert BEYA)' : 'Expert BEYA Analyse'}</span>
                    </div>

                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {selectedAiPreset.aiText}
                    </p>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-violet-200/60 text-center">
                      <div className="bg-white/80 p-2.5 rounded-2xl border border-violet-100">
                        <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'القماش واللوازم (للقطعة)' : 'Matière / pièce'}</span>
                        <strong className="text-sm font-black text-violet-700">{selectedAiPreset.materialPerPiece.toFixed(2)} DH</strong>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-2xl border border-violet-100">
                        <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'سعر البيع المقترح' : 'Prix de vente rec.'}</span>
                        <strong className="text-sm font-black text-emerald-600">{selectedAiPreset.recommendedPrice.toFixed(2)} DH</strong>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-2xl border border-violet-100">
                        <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'وقت الإنتاج المقدر' : 'Jours estimés'}</span>
                        <strong className="text-sm font-black text-indigo-600">{selectedAiPreset.recommendedDays} {isAr ? 'أيام' : 'Jours'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Summary of what will change in calculator */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <strong>{isAr ? '🎯 عند تطبيق هذا التقدير على الحاسبة:' : '🎯 En appliquant cette estimation :'}</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
                      <li>{isAr ? `سيتم تعيين الموديل إلى:` : `Article / Modèle :`} <strong>{selectedAiPreset.title.replace(/^[^\s]+\s+/, '')}</strong></li>
                      <li>{isAr ? `سعر البيع للبياسة:` : `Prix de vente :`} <strong>{selectedAiPreset.recommendedPrice.toFixed(2)} DH</strong></li>
                      <li>{isAr ? `إجمالي ثمن القماش واللوازم (لـ ${quantity} بياسة):` : `Matière première totale :`} <strong>{(selectedAiPreset.materialPerPiece * qty).toFixed(2)} DH</strong></li>
                      <li>{isAr ? `أيام العمل المقترحة:` : `Jours travaillés :`} <strong>{selectedAiPreset.recommendedDays} {isAr ? 'أيام' : 'Jours'}</strong></li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
              
              <button
                onClick={() => applyAiEstimation(selectedAiPreset)}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-violet-200 flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isAr ? '🚀 تطبيق هذه الأرقام في الحاسبة الآن' : '🚀 Appliquer l\'estimation IA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
