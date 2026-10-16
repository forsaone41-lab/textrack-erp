import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../contexts/LangContext';
import {
  Calculator, Printer, CheckCircle2, AlertTriangle,
  Clock, Package, Users, Scissors, ShoppingCart, ArrowLeft,
  DollarSign, Sparkles, Check, X, RefreshCw, UserCheck,
  Ruler, Image as ImageIcon, Search, FileText, Wrench, Trash2, RotateCcw, Maximize2, Minimize2, Plus, Copy,
  Camera, ChevronLeft, ChevronRight, Layers, ChevronUp, ChevronDown, GripVertical, ArrowUpDown
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { loadData, Employe, FicheTechnique, Charge } from '../types';
import { PosteTravail, getGarmentTechnicalBreakdown, DEFAULT_FICHES_TECHNIQUES } from '../lib/atelierAi';

const FALLBACK_GARMENT_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#EEF2FF"/>
  <path d="M42 28L22 42L30 58L42 50V92H78V50L90 58L98 42L78 28C74 35 67 38 60 38C53 38 46 35 42 28Z" fill="#4F46E5" fill-opacity="0.15" stroke="#4F46E5" stroke-width="4" stroke-linejoin="round"/>
</svg>
`);

function getSmartModelPhoto(itemName: string, fichePhoto?: string | null, customPhoto?: string | null): string {
  if (customPhoto) return customPhoto;
  if (fichePhoto) return fichePhoto;
  const text = (itemName || '').toLowerCase();
  if (text.includes('sous-vêtement') || text.includes('sous vetement') || text.includes('boxer') || text.includes('caleçon') || text.includes('داخلي')) {
    return 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('abaya') || text.includes('عباية') || text.includes('jilbab')) {
    return 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('caftan') || text.includes('قفطان') || text.includes('جلابة') || text.includes('djellaba') || text.includes('takchita')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('hoodie') || text.includes('sport') || text.includes('ensemble') || text.includes('هودي') || text.includes('رياضي')) {
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('pantalon') || text.includes('cargo') || text.includes('jean') || text.includes('سروال') || text.includes('بنطلون')) {
    return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('chemise') || text.includes('قميص')) {
    return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('veste') || text.includes('manteau') || text.includes('جاكيت') || text.includes('معطف')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80';
  }
  if (text.includes('sac') || text.includes('sak') || text.includes('حقيبة') || text.includes('صاك')) {
    return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80';
}

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
  const importedGammeRef = useRef(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem('textrack_auth');
      const u = s ? JSON.parse(s) : null;
      const allowed = u?.role === 'admin' || u?.role === 'superadmin' || u?.role === 'modeliste' || true;
      setIsAdmin(allowed);
    } catch {
      setIsAdmin(true);
    }

    // Auto-import from AI Expert (beya_ai_gamme_pilot_export or beya_atelier_import)
    const exportedRaw = localStorage.getItem('beya_ai_gamme_pilot_export') || localStorage.getItem('beya_atelier_import');
    if (exportedRaw) {
      try {
        const data = JSON.parse(exportedRaw);
        importedGammeRef.current = true;
        if (data.itemName || data.modelName) setItemName(data.itemName || data.modelName);
        if (data.photo) setCustomModelPhoto(data.photo);
        if (data.customPostes && Array.isArray(data.customPostes)) {
          setCustomPostes(data.customPostes);
          setWorkers(data.customPostes.length || Number(data.workers) || 7);
          setTotalMachines(data.customPostes.length || 7);
        } else if (data.workers) {
          setWorkers(Number(data.workers) || 8);
        }
        if (typeof data.quantity === 'number' && data.quantity > 0) {
          setQuantity(data.quantity);
        }
        if (typeof data.materials === 'number') {
          setMaterials(data.materials);
        } else if (data.tissuMetrage) {
          const m = String(data.tissuMetrage).match(/[\d.]+/);
          if (m) {
            const cons = parseFloat(m[0]) || 1.5;
            const q = (typeof data.quantity === 'number' && data.quantity > 0) ? data.quantity : 1000;
            setMaterials(Math.round(cons * 20 * q));
          }
        }
        if (typeof data.pricePerPiece === 'number') {
          setPricePerPiece(data.pricePerPiece);
        } else if (data.prixEstimation) {
          const m = String(data.prixEstimation).match(/[\d.]+/);
          if (m) setPricePerPiece(parseFloat(m[0]) || 45);
        }
        if (typeof data.days === 'number' && data.days > 0) {
          setDays(data.days);
        }
        localStorage.removeItem('beya_ai_gamme_pilot_export');
        localStorage.removeItem('beya_atelier_import');
      } catch (e) {
        console.error(e);
      }
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
        if (!importedGammeRef.current) setWorkers(activeAtelier.length);
      } else {
        setAllWorkers(DEFAULT_WORKERS);
        setSelectedWorkerIds(DEFAULT_WORKERS.map(e => e.id));
        if (!importedGammeRef.current) setWorkers(DEFAULT_WORKERS.length);
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
  const [draggedPosteIdx, setDraggedPosteIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isPostesBoxExpanded, setIsPostesBoxExpanded] = useState(false);
  const [selectedQuickMachine, setSelectedQuickMachine] = useState<string>(ATELIER_MACHINES_PRESETS[0].machine);
  const [activeInputKey, setActiveInputKey] = useState<string | null>(null);
  const [activeInputRaw, setActiveInputRaw] = useState<string>('');
  const [customModelPhoto, setCustomModelPhoto] = useState<string | null>(null);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [showEssentialBox, setShowEssentialBox] = useState(true);
  const [calcPage, setCalcPage] = useState<1 | 2 | 3>(1);
  const modelPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleModelPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomModelPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

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
         if (data.photo) setCustomModelPhoto(data.photo);
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
     if (f.photo) setCustomModelPhoto(f.photo);
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
  const activePostesList = customPostes !== null ? customPostes : activeBreakdown.postesTravail;
  const rawGammeMinutes = activePostesList.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
  const activeGammeMinutes = Math.max(0.01, Number(rawGammeMinutes.toFixed(2)));
  const activeGammeSeconds = Math.round(rawGammeMinutes * 60);
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

  const activeModelPhoto = getSmartModelPhoto(itemName, selectedFiche?.photo, customModelPhoto);
  const netMarginPct = pricePerPiece > 0 && costPerPiece > 0
    ? (((pricePerPiece - costPerPiece) / pricePerPiece) * 100)
    : 0;
  const realisticDaysFromGamme = Math.max(
    0.25,
    Number((((quantity || 0) * activeGammeMinutes) / Math.max(1, workers * 480)).toFixed(2))
  );
  const isDurationMismatch = (days > realisticDaysFromGamme * 1.35) || (difference < 0 && Math.abs(days - realisticDaysFromGamme) > 0.5);

  const bottleneckPoste = activePostesList.length > 0
    ? activePostesList.reduce(
        (max, p) => ((Number(p.tempsMin) || 0) > (Number(max.tempsMin) || 0) ? p : max),
        activePostesList[0]
      )
    : { nomAr: 'الخياطة الرئيسية', nomFr: 'Assemblage principal', machine: 'Piqueuse Plate', tempsMin: 5, roleOuvrier: 'خياط' };
  const unitLaborCostReal = quantity > 0 ? (totalLaborCost / quantity) : 0;
  const unitAtelierCostReal = quantity > 0 ? (allocatedExpenses / quantity) : 0;
  const unitProfitReal = pricePerPiece - costPerPiece;
  const matSharePct = realCost > 0 ? ((materials / realCost) * 100) : 0;
  const laborSharePct = realCost > 0 ? ((totalLaborCost / realCost) * 100) : 0;
  const atelierSharePct = realCost > 0 ? ((allocatedExpenses / realCost) * 100) : 0;

  return (
    <div 
      className={`atelier-calc-root w-full print:p-0 print:m-0 print:bg-white print:gap-0 ${isModal ? 'p-3' : 'p-3 md:px-5 md:py-3.5 flex flex-col gap-3 bg-slate-50/50'}`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Hidden File Input for Custom Model Photo Upload */}
      <input
        ref={modelPhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleModelPhotoUpload}
      />

      {/* Print styles for Pro 2-Page Full-A4 Executive PDF (Zero Bottom Whitespace) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            width: 210mm !important;
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print,
          .atelier-calc-root > *:not(.print-only) {
            display: none !important;
          }
          .print-only {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page {
            width: 210mm !important;
            height: 296mm !important;
            min-height: 296mm !important;
            max-height: 296mm !important;
            padding: 7mm 8mm !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
            overflow: hidden !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {/* COMPACT TOP HEADER WITH MODEL PHOTO NEXT TO TITLE & SMART ACTIONS */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          {/* Square Model Photo Thumbnail right next to the Header Title */}
          <div className="relative group shrink-0">
            <img
              src={activeModelPhoto}
              alt={itemName || 'Modèle'}
              onClick={() => setIsPhotoPreviewOpen(true)}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
              title={isAr ? 'اضغط لتكبير صورة الموديل' : 'Cliquer pour agrandir la photo du modèle'}
              className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-200 shadow-sm cursor-pointer group-hover:border-indigo-600 transition-all bg-indigo-50"
            />
            <button
              type="button"
              onClick={() => modelPhotoInputRef.current?.click()}
              title={isAr ? 'تغيير صورة الموديل من جهازك' : 'Changer la photo du modèle'}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md border border-white transition-transform active:scale-90"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {isAr ? 'حاسبة أرباح وتكلفة الإنتاج' : 'Calculateur de Rentabilité Atelier'}
              </h1>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-black truncate max-w-[180px]">
                🏷️ {itemName || (isAr ? 'موديل جديد' : 'Nouveau modèle')}
              </span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
                Admin VIP
              </span>
              <span className="text-[11px] font-bold text-slate-400 hidden xl:inline">| {todayStr}</span>
            </div>
          </div>
        </div>

        {/* Smart Actions Icon Buttons Toolbar ("ICON BOTON HSN HIT JAIN MABAYNINCH") */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. 4 Essential Questions Box Icon Button */}
          <button
            type="button"
            onClick={() => setShowEssentialBox(true)}
            title={isAr ? '🎯 الأسئلة الـ 4 الأساسية قبل الحساب' : '🎯 Les 4 Questions Essentielles'}
            className="relative group w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white flex flex-col items-center justify-center shadow-sm transition-all active:scale-95 shrink-0"
          >
            <span className="text-sm leading-none">🎯</span>
            <span className="text-[8px] font-black leading-none mt-0.5">{isAr ? '4 أسئلة' : '4 Clés'}</span>
          </button>

          {/* 2. Fiches Techniques Icon Button */}
          <button
            type="button"
            onClick={() => setIsFichePickerOpen(true)}
            title={isAr ? '📋 اختيار موديل من الفيش تكنيك (Fiches Techniques)' : '📋 Choisir une Fiche Technique'}
            className="relative group w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 flex flex-col items-center justify-center shadow-2xs transition-all active:scale-95 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span className="text-[8px] font-black leading-none mt-0.5">{isAr ? 'فيش' : 'Fiche'}</span>
          </button>

          {/* 3. Atelier Workers Icon Button with Count Badge */}
          <button
            type="button"
            onClick={() => setShowWorkersModal(true)}
            title={isAr ? `👥 تحديد عمال الأتوليي (${selectedWorkerIds.length} عمال)` : `👥 Ouvriers d'atelier (${selectedWorkerIds.length})`}
            className="relative group w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 flex flex-col items-center justify-center shadow-2xs transition-all active:scale-95 shrink-0"
          >
            <Users className="w-4 h-4" />
            <span className="text-[8px] font-black leading-none mt-0.5">{isAr ? 'عمال' : 'Équipe'}</span>
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
              {selectedWorkerIds.length}
            </span>
          </button>

          {/* 4. Gamme de Montage (Workstations) Icon Button with Postes Badge */}
          <button
            type="button"
            onClick={() => setShowGammeModal(!showGammeModal)}
            title={isAr ? `🏭 بوستات الخياطة (Gamme) — ${activePostesCount} بوست • ${activeGammeMinutes} د/بياسة` : `🏭 Gamme de Montage (${activePostesCount} postes • ${activeGammeMinutes} min/pc)`}
            className={`relative group w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all shadow-sm border active:scale-95 shrink-0 ${
              showGammeModal
                ? 'bg-slate-900 text-amber-400 border-amber-400 ring-2 ring-amber-400/40'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-amber-400/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span className="text-[8px] font-black leading-none mt-0.5">{isAr ? 'الغام' : 'Gamme'}</span>
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-900 text-amber-300 text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
              {activePostesCount}
            </span>
          </button>

          {/* 5. AI Expert Icon Button */}
          <button
            type="button"
            onClick={() => navigate('/atelier-ai-expert', { state: { itemName, quantity: qty, workers, customPostes, selectedModelCategory } })}
            title={isAr ? '✨ الذكاء الاصطناعي (AI Expert)' : '✨ Estimation IA Expert'}
            className="relative group w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white flex flex-col items-center justify-center shadow-sm shadow-indigo-200 transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[8px] font-black leading-none mt-0.5">AI</span>
          </button>

          {/* 6. Print / PDF Pro Icon Button */}
          <button
            type="button"
            onClick={() => window.print()}
            title={isAr ? '🖨️ طباعة تقرير PDF احترافي (A4 Pro)' : '🖨️ Imprimer Rapport PDF Pro'}
            className="relative group w-10 h-10 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white flex flex-col items-center justify-center shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span className="text-[8px] font-black leading-none mt-0.5">PDF</span>
          </button>

          {/* 7. Reset / Clear All Icon Button */}
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
              setCustomModelPhoto(null);
              setCustomPostes(null);
              setIsPostesBoxExpanded(false);
            }}
            title={isAr ? '🗑️ مسح وإفراغ جميع الخانات للبدء من جديد (Vider / Reset)' : '🗑️ Vider tous les champs (Reset)'}
            className="relative group w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 flex flex-col items-center justify-center shadow-2xs transition-all active:scale-95 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[8px] font-black leading-none mt-0.5">{isAr ? 'مسح' : 'Vider'}</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              title={isAr ? 'إغلاق' : 'Fermer'}
              className="w-10 h-10 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all shrink-0 font-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* MAIN NO-SCROLL 2-COLUMN HUD (Hidden when Full-Page Gamme is open) */}
      {!showGammeModal && (
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* COLUMN 1 (Right in RTL): COMPACT CARREAU RESULT CARD ("MAQADA CAROU MRB3 OLA MOUSTATILA" — ZERO EMPTY GAP!) */}
        <div className="lg:col-span-5">
          <div
            className={`p-4 rounded-3xl border-2 shadow-sm space-y-2.5 ${
              resultStatus === 'profit'
                ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/80 to-white border-emerald-300 text-emerald-950'
                : resultStatus === 'loss'
                ? 'bg-gradient-to-br from-rose-500/10 via-rose-50/80 to-white border-rose-300 text-rose-950'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Row 1: Model Thumbnail + Model Title + Profit Status Badge + Unit Cost Tooltip */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activeModelPhoto}
                  alt={itemName}
                  onClick={() => setIsPhotoPreviewOpen(true)}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
                  className="w-10 h-10 rounded-xl object-cover border border-black/15 shadow-2xs shrink-0 cursor-pointer bg-white"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                    {resultStatus === 'profit' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700">{isAr ? 'ربح صافي ✔' : 'Profit Net ✔'}</span>
                      </>
                    ) : resultStatus === 'loss' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="text-rose-700">{isAr ? 'خسارة محققة ✘' : 'Perte Nette ✘'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'تعادل' : 'Neutre'}</span>
                    )}
                  </div>
                  <div className="text-[11px] font-black text-slate-800 truncate">
                    {itemName || (isAr ? 'بدون اسم' : 'Sans nom')} • <span className="text-indigo-700">{fmtNum(quantity, 0)} {isAr ? 'بياسة' : 'pcs'}</span>
                  </div>
                </div>
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
                  </>
                }
              >
                <div className="px-2.5 py-1 bg-white rounded-xl border border-black/10 text-[11px] font-black text-indigo-700 shadow-2xs hover:bg-indigo-50 transition-all whitespace-nowrap">
                  {isAr ? 'البياسة:' : 'Coût/pc:'} {costPerPiece.toFixed(2)} DH
                </div>
              </CostTooltip>
            </div>

            {/* Row 2: Compact Rectangular Profit & KPIs Carreau (No empty vertical gap!) */}
            <div className="p-3 rounded-2xl bg-white/85 border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
              <div className="text-center sm:text-start">
                <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                  {resultStatus === 'profit'
                    ? (isAr ? '💰 الصافي ديال الربح فـ الطلبية:' : '💰 Bénéfice Net Commande :')
                    : (isAr ? '⚠️ قيمة الخسارة فـ الطلبية:' : '⚠️ Perte Nette Commande :')}
                </div>
                <CostTooltip
                  title={isAr ? "💰 معادلة الربح والإيرادات" : "💰 Équation de Rentabilité"}
                  align="center"
                  content={
                    <>
                      <div className="flex justify-between">
                        <span>📈 إيرادات البيع ({fmtNum(quantity, 0)} × {pricePerPiece} DH):</span>
                        <strong className="text-emerald-400">+{totalPriceClient.toLocaleString()} DH</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>📉 التكلفة الإجمالية (سلعة + عمال + أتوليي):</span>
                        <strong className="text-rose-300">-{realCost.toLocaleString()} DH</strong>
                      </div>
                      <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-black text-indigo-300">
                        <span>✅ هامش الربح الصافي:</span>
                        <span>{netMarginPct.toFixed(1)}%</span>
                      </div>
                    </>
                  }
                >
                  <div
                    className={`text-2xl xl:text-3xl font-black tracking-tight leading-none ${
                      resultStatus === 'profit' ? 'text-emerald-600' : resultStatus === 'loss' ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    {Math.abs(difference).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    <span className="text-sm font-extrabold">{isAr ? 'درهم' : 'DH'}</span>
                  </div>
                </CostTooltip>
              </div>

              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto text-center">
                <div className="px-2 py-1 bg-emerald-50/80 border border-emerald-200/70 rounded-xl">
                  <span className="block text-[9px] font-bold text-slate-500">{isAr ? 'إجمالي البيع' : 'Vente'}</span>
                  <strong className="text-[11px] font-black text-emerald-700">{totalPriceClient.toFixed(0)} DH</strong>
                </div>
                <div className="px-2 py-1 bg-slate-100/90 border border-slate-200 rounded-xl">
                  <span className="block text-[9px] font-bold text-slate-500">{isAr ? 'التكلفة الكلية' : 'Coût Total'}</span>
                  <strong className="text-[11px] font-black text-slate-800">{realCost.toFixed(0)} DH</strong>
                </div>
                <div className="px-2 py-1 bg-indigo-50/80 border border-indigo-200/70 rounded-xl">
                  <span className="block text-[9px] font-bold text-slate-500">{isAr ? 'هامش الربح' : 'Marge'}</span>
                  <strong className={`text-[11px] font-black ${netMarginPct >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
                    {netMarginPct.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Row 3: Tight 3-Column Cost Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
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
                <div className="bg-white/85 p-2 rounded-xl border border-black/5 hover:bg-white hover:border-indigo-200 transition-all w-full">
                  <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? '👷 اليد العاملة' : '👷 Main d\'œuvre'}</span>
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
                <div className="bg-white/85 p-2 rounded-xl border border-black/5 hover:bg-white hover:border-indigo-200 transition-all w-full">
                  <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? '🧵 السلعة' : '🧵 Matière'}</span>
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
                <div className="bg-white/85 p-2 rounded-xl border border-black/5 hover:bg-white hover:border-indigo-200 transition-all w-full">
                  <span className="text-[10px] font-bold text-slate-500 block leading-tight">{isAr ? '🏢 مصاريف الأتوليي' : '🏢 Frais atelier'}</span>
                  <strong className="text-xs font-black text-slate-900">{allocatedExpenses.toFixed(2)} DH</strong>
                </div>
              </CostTooltip>
            </div>

            {/* Row 4: LIVE AUTOMATIC 4-TIMEFRAME MATRIX (الدقيقة | الساعة | النهار | الشهر أوتوماتيك) */}
            <div className="pt-2 border-t border-black/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-800 flex items-center gap-1">
                  <span>📊</span>
                  {isAr ? 'الحساب الدقيق الأوتوماتيكي (دقيقة • ساعة • نهار • شهر):' : 'Calcul Automatique (Min • Heure • Jour • Mois) :'}
                </span>
                <span className="text-[9px] font-bold text-slate-500">
                  {isAr ? 'اضغط لتطبيق المدة' : 'Cliquer pour appliquer'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { id: 'min', label: isAr ? '⏱️ فالدقيقة' : '⏱️ / Min', targetMin: 1, pcs: pcsPerMin, rev: revMin, cost: totalCostMin, profit: profitMin, dec: 2 },
                  { id: 'hour', label: isAr ? '🕐 فالساعة' : '🕐 / Heure', targetMin: 60, pcs: pcsPerHour, rev: revHour, cost: totalCostHour, profit: profitHour, dec: 1 },
                  { id: 'day', label: isAr ? '☀️ فالنهار' : '☀️ / Jour', targetMin: 480, pcs: pcsPerDay, rev: revDay, cost: totalCostDay, profit: profitDay, dec: 0 },
                  { id: 'month', label: isAr ? '📅 فالشهر' : '📅 / Mois', targetMin: 12480, pcs: pcsPerMonth, rev: revMonth, cost: totalCostMonth, profit: profitMonth, dec: 0 },
                ].map((tf) => {
                  const isCurrentDuration = Math.abs(totalMinutesPerWorker - tf.targetMin) < 0.05;
                  return (
                    <div
                      key={tf.id}
                      onClick={() => switchDurationWithScale(tf.targetMin)}
                      title={isAr ? `اضغط لتحويل الحاسبة بالكامل إلى ${tf.label}` : `Cliquer pour basculer le calcul sur ${tf.label}`}
                      className={`p-1.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-0.5 ${
                        isCurrentDuration
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-indigo-500/40'
                          : 'bg-white/90 hover:bg-white text-slate-800 border-black/10 hover:border-indigo-400'
                      }`}
                    >
                      <div className={`text-[9px] font-black pb-0.5 border-b ${isCurrentDuration ? 'text-amber-300 border-white/15' : 'text-indigo-700 border-slate-200'}`}>
                        {tf.label}
                      </div>
                      <div className="space-y-0.5 text-[9px]">
                        <div className="flex items-center justify-between">
                          <span className={isCurrentDuration ? 'text-slate-300' : 'text-slate-500'}>{isAr ? 'إنتاج:' : 'Pcs:'}</span>
                          <strong className="font-black">{fmtNum(tf.pcs, 1)}</strong>
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
                      <div className={`pt-0.5 border-t text-[9px] font-black ${
                        isCurrentDuration ? 'border-white/15' : 'border-slate-200'
                      } ${tf.profit >= 0 ? (isCurrentDuration ? 'text-emerald-400' : 'text-emerald-700') : (isCurrentDuration ? 'text-rose-400' : 'text-rose-600')}`}>
                        {tf.profit >= 0 ? '+' : ''}{tf.profit.toFixed(tf.dec)} DH
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Compact Max Time Alert + Validate Command Button inside the Carreau */}
            <div className="pt-1 space-y-2">
              <div
                className={`px-3 py-2 rounded-xl border font-bold text-[11px] flex items-center gap-2 ${
                  alertType === 'danger'
                    ? 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <div className="leading-snug truncate" title={alertMessage}>{alertMessage}</div>
              </div>

              <button
                onClick={handleCreateCommand}
                className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {isAr ? '✓ اعتماد الحساب وإطلاق الطلبية الآن' : '✓ Valider le calcul et créer la commande'}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (Left in RTL): ORGANIZED 3-PAGE STEP WIZARD ("MAYCHTCH L3NION + NO SCROLL + NEXT PAGE") */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
            
            {/* Step Navigation Header (Pages 1 • 2 • 3) */}
            <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between gap-1.5 border-b border-slate-800">
              <div className="grid grid-cols-3 gap-1.5 flex-1">
                {[
                  { step: 1 as const, icon: Package, titleAr: '1. الموديل والطلبية والإنتاج', titleFr: '1. Modèle & Production', subAr: 'الصورة + البيع + الدقيقة/الساعة', subFr: 'Photo + Vente + Cadence' },
                  { step: 2 as const, icon: Users, titleAr: '2. اليد العاملة والوقت الدقيق', titleFr: '2. Main-d\'œuvre & Temps', subAr: 'العمال + الوقت + الأجر', subFr: 'Ouvriers + Durée + Taux' },
                  { step: 3 as const, icon: Scissors, titleAr: '3. السلعة ومصاريف الأتوليي', titleFr: '3. Matière & Frais Atelier', subAr: 'القماش + الآلات + المصاريف', subFr: 'Tissu + Machines + Frais' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = calcPage === tab.step;
                  return (
                    <button
                      key={tab.step}
                      type="button"
                      onClick={() => setCalcPage(tab.step)}
                      className={`px-3 py-2 rounded-2xl text-start transition-all flex items-center gap-2 border ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black truncate leading-tight">
                          {isAr ? tab.titleAr : tab.titleFr}
                        </div>
                        <div className={`text-[9px] font-bold truncate hidden sm:block ${active ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {isAr ? tab.subAr : tab.subFr}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HIGHLIGHTED 4-PILLAR MASTER BAR ("HAD LASILA MOHIMA KHS IBQAW F BOX HOMA LWALA BCHI LOWN MANGHLTCH FIHOM") */}
            <div className="mx-4 mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50/70 to-indigo-50 border-2 border-amber-400 shadow-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    {isAr ? '🎯 الخانات الـ 4 الأساسية' : '🎯 4 Champs Critiques'}
                  </span>
                  <span className="text-[11px] font-black text-slate-900">
                    {isAr ? 'تأكد من هاد 4 أرقام أولاً باش ما تغلطش فالحساب!' : 'Vérifiez toujours ces 4 valeurs clés en premier !'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setExtraHours(0);
                      setDays(realisticDaysFromGamme);
                    }}
                    title={isAr ? 'ضبط أيام العمل أوتوماتيكياً على حساب الكمية وعدد العمال والغام' : 'Ajuster automatiquement les jours selon la quantité et la gamme'}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all shadow-2xs ${
                      isDurationMismatch
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300'
                        : 'bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200'
                    }`}
                  >
                    <span>⚡</span>
                    <span>{isAr ? `الوقت الواقعي للطلبية: ${realisticDaysFromGamme} يوم (اضغط للتطبيق)` : `Durée réaliste : ${realisticDaysFromGamme} j (Appliquer)`}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Quantity */}
                <div className="bg-white p-2 rounded-xl border-2 border-indigo-400 shadow-2xs">
                  <label className="block text-[10px] font-black text-indigo-900 mb-1 text-center">
                    {isAr ? '1️⃣ الكمية المعتمدة (بياسة)' : '1️⃣ Quantité (pcs)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('top_qty', quantity, 2)}
                    onFocus={() => {
                      setActiveInputKey('top_qty');
                      setActiveInputRaw(quantity === 0 ? '' : String(Number(quantity.toFixed(2))));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      setQuantity(e.target.value === '' ? 0 : Number(e.target.value));
                    }}
                    className="w-full px-2 py-1 bg-indigo-50/70 focus:bg-white border border-indigo-300 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-sm text-center outline-none"
                  />
                </div>

                {/* 2. Sale Price per Piece */}
                <div className="bg-white p-2 rounded-xl border-2 border-emerald-400 shadow-2xs">
                  <label className="block text-[10px] font-black text-emerald-900 mb-1 text-center">
                    {isAr ? '2️⃣ ثمن البيع للبياسة (DH)' : '2️⃣ Prix vente / pc (DH)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('top_price', pricePerPiece, 2)}
                    onFocus={() => {
                      setActiveInputKey('top_price');
                      setActiveInputRaw(pricePerPiece === 0 ? '' : String(pricePerPiece));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      setPricePerPiece(e.target.value === '' ? 0 : Number(e.target.value));
                    }}
                    className="w-full px-2 py-1 bg-emerald-50/70 focus:bg-white border border-emerald-300 focus:border-emerald-600 rounded-lg font-black text-emerald-700 text-sm text-center outline-none"
                  />
                </div>

                {/* 3. Workers Count */}
                <div className="bg-white p-2 rounded-xl border-2 border-violet-400 shadow-2xs">
                  <label className="block text-[10px] font-black text-violet-900 mb-1 text-center">
                    {isAr ? '3️⃣ عدد العمال (👥)' : '3️⃣ Ouvriers (👥)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={workers}
                    onChange={(e) => setWorkers(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-2 py-1 bg-violet-50/70 focus:bg-white border border-violet-300 focus:border-violet-600 rounded-lg font-black text-violet-700 text-sm text-center outline-none"
                  />
                </div>

                {/* 4. Work Duration in Days (8h) */}
                <div className={`bg-white p-2 rounded-xl border-2 shadow-2xs ${
                  isDurationMismatch ? 'border-rose-500 ring-2 ring-rose-300/60' : 'border-amber-400'
                }`}>
                  <label className="block text-[10px] font-black text-amber-900 mb-1 text-center">
                    {isAr ? '4️⃣ أيام العمل (8س)' : '4️⃣ Jours travail (8h)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('top_days', days + (extraHours / 8), 3)}
                    onFocus={() => {
                      setActiveInputKey('top_days');
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
                    className={`w-full px-2 py-1 focus:bg-white border rounded-lg font-black text-sm text-center outline-none ${
                      isDurationMismatch
                        ? 'bg-rose-50 border-rose-400 text-rose-700 focus:border-rose-600'
                        : 'bg-amber-50/70 border-amber-300 text-amber-800 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>

              {/* Smart Anti-Mistake Warning Banner if Days vs Quantity mismatch */}
              {isDurationMismatch && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-black flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
                    <span>
                      {isAr
                        ? `⚠️ انتبه! داير ${fmtNum(days, 2)} يوم عمل لـ ${workers} عمال مقابل ${fmtNum(quantity, 0)} بياسة فقط! الوقت الواقعي لي خاصها هو ${realisticDaysFromGamme} يوم.`
                        : `⚠️ Attention ! Vous avez mis ${fmtNum(days, 2)} jours pour ${fmtNum(quantity, 0)} pcs. La durée réaliste est ${realisticDaysFromGamme} jours.`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExtraHours(0);
                      setDays(realisticDaysFromGamme);
                    }}
                    className="px-2.5 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[10px] font-black shrink-0"
                  >
                    {isAr ? `✓ صحح إلى ${realisticDaysFromGamme} يوم` : `✓ Corriger (${realisticDaysFromGamme}j)`}
                  </button>
                </div>
              )}
            </div>

            {/* ACTIVE PAGE BODY (Clean, Organized, Zero Scroll) */}
            <div className="p-4 space-y-3.5">
              
              {/* ================= PAGE 1: MODEL PHOTO + ORDER + 4-UNIT PRODUCTION CADENCE ================= */}
              {calcPage === 1 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      {isAr ? '📦 الصفحة 1: صورة الموديل، معلومات الطلبية، وكمية الإنتاج الأوتوماتيكية' : '📦 Page 1 : Photo du Modèle, Commande & Cadence Automatique'}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black border border-indigo-100">
                      {isAr ? '🔄 تحويل أوتوماتيكي فوري' : '🔄 Conversion auto instantanée'}
                    </span>
                  </div>

                  {/* Model Photo Carreau + Model Name + Quantity + Price + Total */}
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Prominent Square Model Photo ("FBLSA DIAL TITL IKON HDAHA TSWIRA DIAL LMODEL") */}
                    <div className="flex items-center gap-2.5 shrink-0 bg-white p-2 rounded-2xl border border-indigo-100 shadow-2xs">
                      <div className="relative group shrink-0">
                        <img
                          src={activeModelPhoto}
                          alt={itemName}
                          onClick={() => setIsPhotoPreviewOpen(true)}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-200 cursor-pointer group-hover:border-indigo-600 transition-all bg-indigo-50"
                        />
                        <button
                          type="button"
                          onClick={() => modelPhotoInputRef.current?.click()}
                          title={isAr ? 'رفع صورة الموديل من الجهاز' : 'Importer une photo'}
                          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black flex items-center gap-0.5 shadow border border-white"
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>{isAr ? 'صورة' : 'Photo'}</span>
                        </button>
                      </div>
                      <div className="flex flex-col gap-1 sm:hidden">
                        <span className="text-xs font-black text-slate-800">{isAr ? 'صورة الموديل' : 'Photo Modèle'}</span>
                        <button
                          type="button"
                          onClick={() => setIsFichePickerOpen(true)}
                          className="text-[10px] font-black text-indigo-600 underline text-start"
                        >
                          {isAr ? 'اختيار من الفيش تكنيك' : 'Choisir Fiche Tech'}
                        </button>
                      </div>
                    </div>

                    {/* 4 Main Order Inputs right beside the Model Photo */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1">
                          {isAr ? '🏷️ نوع البياسة / الموديل' : '🏷️ Article / Modèle'}
                        </label>
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder={isAr ? 'اسم الموديل...' : 'Nom du modèle...'}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-xs focus:border-indigo-600 outline-none shadow-2xs"
                        />
                        {selectedFiche && (
                          <div className="mt-1 px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md flex items-center justify-between text-[9px] text-indigo-800 font-bold">
                            <span className="truncate">✨ {selectedFiche.modele} ({selectedFiche.tissuConsommation || 1.5}m)</span>
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
                        <label className="block text-[10px] font-black text-slate-700 mb-1 text-center">
                          {isAr ? '📦 الكمية المعتمدة (بياسة)' : '📦 Quantité (pcs)'}
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
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-black text-indigo-600 text-xs text-center focus:border-indigo-600 outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 text-center">
                          {isAr ? '💵 ثمن البيع للبياسة (DH)' : '💵 Prix vente / pc (DH)'}
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
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-black text-indigo-600 text-xs text-center focus:border-indigo-600 outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-emerald-800 mb-1 text-center">
                          {isAr ? '💰 الثمن الإجمالي (DH)' : '💰 Total Vente (DH)'}
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={totalPriceClient.toFixed(2)}
                          className="w-full px-2.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl font-black text-xs text-center cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Synchronized Quantity Rate Inputs: Minute | Hour | Day | Month */}
                  <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-amber-50/60 rounded-2xl border border-indigo-100">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5">
                      <span className="text-[11px] font-black text-indigo-950">
                        {isAr
                          ? '⚡ وتيرة الإنتاج الأوتوماتيكية (اكتب فـ الدقيقة أو الساعة أو النهار أو الشهر وكيعطيك الباقي أوتوماتيك):'
                          : '⚡ Cadence de production (saisissez par Minute, Heure, Jour ou Mois — calcul automatique) :'}
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                        {isAr ? `1 شهر = 26 يوم = 208 ساعة = 12,480 دقيقة` : `1 mois = 26j = 208h = 12 480 min`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Pieces per Minute */}
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
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
                          className="w-full px-2 py-1.5 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                        />
                        <div className="mt-1.5 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                          <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                          <strong className="text-emerald-700">{revMin.toFixed(2)} DH/د</strong>
                        </div>
                      </div>

                      {/* Pieces per Hour */}
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
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
                          className="w-full px-2 py-1.5 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                        />
                        <div className="mt-1.5 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                          <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                          <strong className="text-emerald-700">{revHour.toFixed(2)} DH/س</strong>
                        </div>
                      </div>

                      {/* Pieces per Day (8h) */}
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
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
                          className="w-full px-2 py-1.5 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                        />
                        <div className="mt-1.5 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                          <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                          <strong className="text-emerald-700">{revDay.toFixed(2)} DH/يوم</strong>
                        </div>
                      </div>

                      {/* Pieces per Month (26j = 208h = 12,480 min) */}
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
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
                          className="w-full px-2 py-1.5 bg-indigo-50/60 focus:bg-white border border-indigo-200 focus:border-indigo-600 rounded-lg font-black text-indigo-700 text-xs text-center outline-none"
                        />
                        <div className="mt-1.5 text-[9px] font-bold text-slate-500 text-center flex justify-between px-1">
                          <span>{isAr ? 'البيع:' : 'Vente:'}</span>
                          <strong className="text-emerald-700">{revMonth.toFixed(2)} DH/شهر</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PAGE 2: LABOR, 4-UNIT DURATION & 4-UNIT WAGE ================= */}
              {calcPage === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      {isAr ? '👷 الصفحة 2: اليد العاملة، وقت الخدمة الدقيق، والأجر (دقيقة • ساعة • نهار • شهر)' : '👷 Page 2 : Main-d\'œuvre, Temps Précis & Salaire'}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWorkers(activePostesCount)}
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

                  {/* Row 1: Workers Count + Synchronized Work Duration in 4 Units */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1 text-center">
                        {isAr ? '👥 عدد العمال' : '👥 Ouvriers'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={workers}
                        onChange={(e) => setWorkers(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full px-2 py-2 bg-indigo-50 border border-indigo-200 rounded-xl font-black text-indigo-700 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                      />
                    </div>

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
                        className="w-full px-2 py-2 bg-amber-50/60 border border-amber-200 rounded-xl font-black text-amber-800 text-xs text-center focus:bg-white focus:border-amber-500 outline-none"
                      />
                    </div>

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
                        className="w-full px-2 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl font-black text-indigo-700 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                      />
                    </div>

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
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                      />
                    </div>

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
                        className="w-full px-2 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl font-black text-emerald-700 text-xs text-center focus:bg-white focus:border-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Synchronized Worker Wage Rate in 4 Units */}
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
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-indigo-600 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>

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
                          className="w-full px-2 py-1.5 bg-white border border-indigo-300 rounded-lg font-black text-indigo-700 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>

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
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-indigo-600 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>

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
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-emerald-700 text-xs text-center focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Production Capacity Indicator & Gamme Minutes Connection */}
                  <div className="p-2.5 bg-gradient-to-r from-indigo-50/90 to-amber-50/80 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
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
                      <button
                        type="button"
                        onClick={() => setShowGammeModal(true)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black transition-all"
                      >
                        {isAr ? '🏭 تعديل البوستات' : '🏭 Éditer Gamme'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PAGE 3: MATERIALS & 4-UNIT ATELIER EXPENSES ================= */}
              {calcPage === 3 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-indigo-600" />
                      {isAr ? '🧵 الصفحة 3: السلعة والقماش ومصاريف الأتوليي (دقيقة • ساعة • نهار • شهر)' : '🧵 Page 3 : Matière Première & Frais d\'Atelier'}
                    </h3>
                    {monthlyChargesSynced && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5">
                        {isAr ? '✓ مرتبط بصفحة المصاريف' : '✓ Synchro Charges'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 text-center">
                        {isAr ? '🧵 ثمن القماش واللوازم (الإجمالي DH)' : '🧵 Coût matière total (DH)'}
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 text-center">
                        {isAr ? '🧶 ثمن السلعة للبياسة الواحدة (DH/بياسة)' : '🧶 Coût matière / pièce (DH)'}
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
                        className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl font-black text-emerald-700 text-xs text-center focus:bg-white focus:border-emerald-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 text-center">
                        {isAr ? '⚙️ عدد آلات الأتوليي' : '⚙️ Machines atelier (total)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={totalMachines}
                        onChange={(e) => setTotalMachines(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-indigo-600 text-xs text-center focus:bg-white focus:border-indigo-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Atelier Fixed Expenses in 4 Synchronized Units */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-700 flex items-center gap-1">
                        <span>🏢</span>
                        {isAr ? 'مصاريف الأتوليي الثابتة (الكرا، الضو...) — بالدقيقة / الساعة / النهار / الشهر:' : 'Frais fixes d\'atelier (Loyer, élec...) — Min / Heure / Jour / Mois :'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-1 text-center">
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
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-700 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-1 text-center">
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
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-700 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-1 text-center">
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
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-700 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-indigo-700 mb-1 text-center">
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
                          className="w-full px-2 py-1.5 bg-white border border-indigo-300 rounded-lg font-black text-indigo-700 text-xs text-center focus:border-indigo-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compact Carreau Summary of Exact Cost Per Piece */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-2xl border border-emerald-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80">
                      <span className="block text-[9px] font-bold text-slate-500">{isAr ? '🧵 سلعة / بياسة' : '🧵 Matière / pc'}</span>
                      <strong className="text-xs font-black text-slate-800">{unitMatCost.toFixed(2)} DH</strong>
                    </div>
                    <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80">
                      <span className="block text-[9px] font-bold text-slate-500">{isAr ? '👷 يد عاملة / بياسة' : '👷 MOD / pc'}</span>
                      <strong className="text-xs font-black text-slate-800">{(totalLaborCost / qty).toFixed(2)} DH</strong>
                    </div>
                    <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80">
                      <span className="block text-[9px] font-bold text-slate-500">{isAr ? '🏢 أتوليي / بياسة' : '🏢 Atelier / pc'}</span>
                      <strong className="text-xs font-black text-slate-800">{(allocatedExpenses / qty).toFixed(2)} DH</strong>
                    </div>
                    <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-2xs">
                      <span className="block text-[9px] font-bold text-emerald-100">{isAr ? '✅ التكلفة الصافية / بياسة' : '✅ Coût Revient / pc'}</span>
                      <strong className="text-xs font-black">{costPerPiece.toFixed(2)} DH</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* BOTTOM STEP NAVIGATION BAR ("NEXT PAGE" / "الصفحة التالية" — ZERO SCROLL) */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <div>
                {calcPage > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCalcPage((calcPage - 1) as 1 | 2 | 3)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                  >
                    {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    <span>{isAr ? 'الصفحة السابقة' : 'Page Précédente'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 px-2">
                    {isAr ? '✨ ديزاين مترتب بدون سكرول' : '✨ Vue sans défilement'}
                  </span>
                )}
              </div>

              {/* Page Dots Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCalcPage(p as 1 | 2 | 3)}
                    className={`h-2.5 rounded-full transition-all ${
                      calcPage === p ? 'w-8 bg-indigo-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={isAr ? `الانتقال إلى الصفحة ${p}` : `Aller à la page ${p}`}
                  />
                ))}
                <span className="text-[11px] font-black text-slate-600 ms-1">
                  {isAr ? `صفحة ${calcPage} / 3` : `Page ${calcPage} / 3`}
                </span>
              </div>

              {/* Next Page / Final Actions */}
              <div className="flex items-center gap-2">
                {calcPage < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCalcPage((calcPage + 1) as 1 | 2 | 3)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-indigo-200 active:scale-95"
                  >
                    <span>{isAr ? 'الصفحة التالية (Next Page)' : 'Page Suivante (Next)'}</span>
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowGammeModal(true)}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isAr ? 'بوستات الخياطة' : 'Gamme'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isAr ? 'طباعة PDF Pro' : 'PDF Pro'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
      )}

      {/* ================= EXECUTIVE 2-PAGE A4 PDF PRINT REPORT (ZERO BOTTOM WHITESPACE) ================= */}
      <div className="hidden print-only bg-white text-slate-900 text-xs">
        {/* ==================== PAGE 1 / 2 : FINANCIAL & TECHNICAL COST REPORT ==================== */}
        <div className="print-page">
          <div className="h-full w-full border-2 border-slate-900 rounded-2xl p-4 flex flex-col justify-between bg-white">
            
            {/* 1. Top Executive PDF Banner */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeModelPhoto}
                  alt={itemName}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-900 shadow-xs shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black tracking-wider uppercase" dir="ltr">
                      BEYA CREATIVE • PAGE 1 / 2
                    </span>
                    <span className="text-[10px] font-black text-indigo-700">
                      {isAr ? 'وثيقة رسمية لدراسة التكلفة والمردودية' : 'FICHE OFFICIELLE DE RENTABILITÉ'}
                    </span>
                  </div>
                  <h1 className="text-lg font-black text-slate-950 mt-0.5">
                    {isAr ? `تقرير تكلفة وأرباح الموديل: ${itemName || 'موديل جديد'}` : `Rapport de Rentabilité : ${itemName || 'Modèle'}`}
                  </h1>
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2 mt-0.5">
                    <span>{isAr ? `التاريخ: ${todayStr}` : `Date : ${todayStr}`}</span>
                    <span>•</span>
                    <span>{isAr ? 'الكمية المعتمدة:' : 'Quantité :'} <strong dir="ltr" className="inline-block text-slate-900">{fmtNum(quantity, 0)} pcs</strong></span>
                    <span>•</span>
                    <span>{isAr ? 'ثمن البيع:' : 'Prix vente :'} <strong dir="ltr" className="inline-block text-emerald-700">{pricePerPiece.toFixed(2)} DH/pc</strong></span>
                  </div>
                </div>
              </div>

              <div className={`text-center border-2 rounded-2xl px-4 py-2 min-w-[195px] ${
                resultStatus === 'profit' ? 'border-emerald-700 bg-emerald-50/70' : 'border-rose-700 bg-rose-50/70'
              }`}>
                <div className="text-[10px] font-black text-slate-700">
                  {resultStatus === 'profit' ? (isAr ? '✅ الربح الصافي للطلبية' : '✅ PROFIT NET TOTAL') : (isAr ? '🚨 الخسارة الصافية للطلبية' : '🚨 PERTE NETTE')}
                </div>
                <div dir="ltr" className={`text-xl font-black leading-tight my-0.5 ${resultStatus === 'profit' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {difference >= 0 ? `+${difference.toFixed(2)} DH` : `${difference.toFixed(2)} DH`}
                </div>
                <div className="text-[10px] font-black text-slate-700 flex items-center justify-center gap-1.5">
                  <span>{isAr ? 'تكلفة البياسة:' : 'Coût/pc:'} <strong dir="ltr" className="inline-block">{costPerPiece.toFixed(2)} DH</strong></span>
                  <span>|</span>
                  <span>{isAr ? 'الهامش:' : 'Marge:'} <strong dir="ltr" className="inline-block">{netMarginPct.toFixed(1)}%</strong></span>
                </div>
              </div>
            </div>

            {/* 2. The 4 Essential Pillars + 4 Financial Summary KPIs (8-Box Executive Grid) */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl border-2 border-indigo-200 bg-indigo-50/50">
                <span className="block text-[9px] font-black text-indigo-700">{isAr ? '1️⃣ الكمية المعتمدة للطلبية' : '1️⃣ Quantité Commandée'}</span>
                <strong dir="ltr" className="text-sm font-black text-slate-950 block mt-0.5">{fmtNum(quantity, 0)} pcs</strong>
                <span className="block text-[9px] font-bold text-slate-500">{isAr ? 'مجموع البياسات' : 'Volume total'}</span>
              </div>
              <div className="p-2 rounded-xl border-2 border-emerald-200 bg-emerald-50/50">
                <span className="block text-[9px] font-black text-emerald-700">{isAr ? '2️⃣ ثمن البيع وإجمالي المبيعات' : '2️⃣ Prix Vente & CA Total'}</span>
                <strong dir="ltr" className="text-sm font-black text-emerald-700 block mt-0.5">{totalPriceClient.toFixed(2)} DH</strong>
                <span className="block text-[9px] font-bold text-slate-600">{isAr ? 'للبياسة:' : 'Unitaire:'} <strong dir="ltr" className="inline-block">{pricePerPiece.toFixed(2)} DH/pc</strong></span>
              </div>
              <div className="p-2 rounded-xl border-2 border-violet-200 bg-violet-50/50">
                <span className="block text-[9px] font-black text-violet-700">{isAr ? '3️⃣ الفريق والتكلفة الشاملة' : '3️⃣ Équipe & Coût Total'}</span>
                <strong dir="ltr" className="text-sm font-black text-slate-950 block mt-0.5">{realCost.toFixed(2)} DH</strong>
                <span className="block text-[9px] font-bold text-slate-600">{workers} {isAr ? 'عمال' : 'ouv.'} • <strong dir="ltr" className="inline-block">{costPerPiece.toFixed(2)} DH/pc</strong></span>
              </div>
              <div className="p-2 rounded-xl border-2 border-amber-300 bg-amber-50/50">
                <span className="block text-[9px] font-black text-amber-800">{isAr ? '4️⃣ مدة الإنجاز وربح البياسة' : '4️⃣ Durée & Marge Unitaire'}</span>
                <strong dir="ltr" className="text-sm font-black text-slate-950 block mt-0.5">{fmtNum(days, 2)} j ({fmtNum(totalHoursPerWorker, 1)} h)</strong>
                <span className="block text-[9px] font-bold text-slate-600">{isAr ? 'ربح البياسة:' : 'Profit/pc:'} <strong dir="ltr" className={`inline-block ${unitProfitReal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{unitProfitReal >= 0 ? '+' : ''}{unitProfitReal.toFixed(2)} DH</strong></span>
              </div>
            </div>

            {/* 3. All 3 Detailed Operational Cards Side-by-Side (Zero BiDi Scrambling) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Card 1: Production Cadence */}
              <div className="p-3 rounded-xl border border-slate-300 bg-slate-50/30 flex flex-col justify-between">
                <div className="font-black text-slate-950 border-b-2 border-indigo-600 pb-1 mb-1.5 text-[11px] flex items-center justify-between">
                  <span>{isAr ? '1. الطلبية ووتيرة الإنتاج' : '1. Commande & Cadence'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-black" dir="ltr">CADENCE</span>
                </div>
                <div className="space-y-1 text-[10.5px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'الكمية المعتمدة:' : 'Quantité totale :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{fmtNum(quantity, 0)} pcs</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'الإنتاج في الدقيقة (1 د):' : 'Production / min :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{fmtNum(pcsPerMin, 3)} pc/min</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'الإنتاج في الساعة (60 د):' : 'Production / heure :'}</span>
                    <strong dir="ltr" className="font-black text-indigo-700">{fmtNum(pcsPerHour, 2)} pc/h</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'الإنتاج في النهار (8 سوايع):' : 'Production / jour (8h) :'}</span>
                    <strong dir="ltr" className="font-black text-emerald-700">{fmtNum(pcsPerDay, 2)} pc/j</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'الإنتاج في الشهر (26 يوم):' : 'Production / mois (26j) :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{fmtNum(pcsPerMonth, 0)} pc/mois</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-black text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg">
                    <span>{isAr ? 'إجمالي المبيعات:' : 'Total Ventes (CA) :'}</span>
                    <span dir="ltr">{totalPriceClient.toFixed(2)} DH</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Labor & Time Precision */}
              <div className="p-3 rounded-xl border border-slate-300 bg-slate-50/30 flex flex-col justify-between">
                <div className="font-black text-slate-950 border-b-2 border-violet-600 pb-1 mb-1.5 text-[11px] flex items-center justify-between">
                  <span>{isAr ? '2. اليد العاملة والوقت الدقيق' : '2. Main-d\'œuvre & Temps'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded font-black" dir="ltr">MOD & TEMPS</span>
                </div>
                <div className="space-y-1 text-[10.5px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'عدد العمال المباشرين:' : 'Nombre d\'ouvriers :'}</span>
                    <strong className="font-black text-slate-900">{workers} {isAr ? 'عمال' : 'ouvriers'}</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'مدة العمل (ساعة / دقيقة):' : 'Durée (heures / min) :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{fmtNum(totalHoursPerWorker, 1)} h ({fmtNum(totalMinutesPerWorker, 0)} min)</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'أجر العامل (ساعة / دقيقة):' : 'Taux (heure / min) :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{ratePerHour.toFixed(2)} DH/h ({ratePerMin.toFixed(3)} DH/m)</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'أجر العامل (نهار / شهر):' : 'Taux (jour / mois) :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{ratePerDay.toFixed(1)} DH/j ({ratePerMonth.toFixed(0)} DH/mois)</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'اليد العاملة للبياسة:' : 'MOD par pièce :'}</span>
                    <strong dir="ltr" className="font-black text-violet-700">{unitLaborCostReal.toFixed(2)} DH/pc</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-black text-violet-900 bg-violet-50 px-2 py-1 rounded-lg">
                    <span>{isAr ? 'إجمالي اليد العاملة:' : 'Total Main-d\'œuvre :'}</span>
                    <span dir="ltr">{totalLaborCost.toFixed(2)} DH</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Materials & Fixed Expenses */}
              <div className="p-3 rounded-xl border border-slate-300 bg-slate-50/30 flex flex-col justify-between">
                <div className="font-black text-slate-950 border-b-2 border-amber-500 pb-1 mb-1.5 text-[11px] flex items-center justify-between">
                  <span>{isAr ? '3. السلعة ومصاريف الأتوليي' : '3. Matière & Frais Atelier'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-black" dir="ltr">CHARGES</span>
                </div>
                <div className="space-y-1 text-[10.5px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'تكلفة السلعة للبياسة:' : 'Matière par pièce :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{unitMatCost.toFixed(2)} DH/pc</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'إجمالي السلعة للطلبية:' : 'Total Matière 1ère :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{materials.toFixed(2)} DH</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? `مصاريف الشهر (${totalMachines} آلات):` : `Frais mois (${totalMachines} mach.) :`}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{monthlyOther.toFixed(2)} DH/mois</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'مصاريف الأتوليي (نهار / ساعة):' : 'Frais (jour / heure) :'}</span>
                    <strong dir="ltr" className="font-black text-slate-900">{monthlyAtelierDay.toFixed(1)} DH/j ({monthlyAtelierHour.toFixed(2)} DH/h)</strong>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-600 font-bold">{isAr ? 'مصاريف الأتوليي للبياسة:' : 'Frais fixes / pièce :'}</span>
                    <strong dir="ltr" className="font-black text-amber-800">{unitAtelierCostReal.toFixed(2)} DH/pc</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-black text-amber-950 bg-amber-50 px-2 py-1 rounded-lg">
                    <span>{isAr ? 'نصيب الطلبية من المصاريف:' : 'Total Frais Alloués :'}</span>
                    <span dir="ltr">{allocatedExpenses.toFixed(2)} DH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. 4-Timeframe Precision Table in PDF */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white px-3 py-1.5 font-black text-[11px] flex items-center justify-between">
                <span>{isAr ? '📊 جدول الحساب الدقيق الأوتوماتيكي (فالدقيقة • فالساعة • فالنهار • فالشهر)' : '📊 Tableau Récapitulatif Multi-Unités (Minute • Heure • Jour • Mois)'}</span>
                <span className="text-[9px] text-amber-300 font-bold">{isAr ? 'حساب متزامن 100% لجميع الوحدات الزمنية' : 'Synchronisation temps réel'}</span>
              </div>
              <table className="w-full text-[10.5px] border-collapse text-center">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-800">
                    <th className="p-1.5 border-e border-slate-300 text-start px-3">{isAr ? 'الوحدة الزمنية المعتمدة' : 'Unité de Temps'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'كمية الإنتاج' : 'Production'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'المبيعات (CA)' : 'Ventes (CA)'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'اليد العاملة' : 'Coût MOD'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'السلعة والمصاريف' : 'Matière + Frais'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'التكلفة الشاملة' : 'Coût Total'}</th>
                    <th className="p-1.5">{isAr ? 'الربح الصافي' : 'Profit Net'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: isAr ? '⏱️ فالدقيقة الواحدة (1 دقيقة)' : '⏱️ Par Minute (1 min)', pcs: `${fmtNum(pcsPerMin, 3)} pcs`, rev: `${revMin.toFixed(2)} DH`, mod: `${teamLaborMin.toFixed(2)} DH`, matFrais: `${(matMin + teamAtelierMin).toFixed(2)} DH`, cost: `${totalCostMin.toFixed(2)} DH`, prof: `${profitMin >= 0 ? '+' : ''}${profitMin.toFixed(2)} DH`, isPos: profitMin >= 0 },
                    { label: isAr ? '🕐 فالساعة الواحدة (60 دقيقة)' : '🕐 Par Heure (60 min)', pcs: `${fmtNum(pcsPerHour, 2)} pcs`, rev: `${revHour.toFixed(2)} DH`, mod: `${teamLaborHour.toFixed(2)} DH`, matFrais: `${(matHour + teamAtelierHour).toFixed(2)} DH`, cost: `${totalCostHour.toFixed(2)} DH`, prof: `${profitHour >= 0 ? '+' : ''}${profitHour.toFixed(2)} DH`, isPos: profitHour >= 0 },
                    { label: isAr ? '☀️ فالنهار الواحد (8 سوايع = 480 د)' : '☀️ Par Jour (8h = 480 min)', pcs: `${fmtNum(pcsPerDay, 2)} pcs`, rev: `${revDay.toFixed(2)} DH`, mod: `${teamLaborDay.toFixed(2)} DH`, matFrais: `${(matDay + teamAtelierDay).toFixed(2)} DH`, cost: `${totalCostDay.toFixed(2)} DH`, prof: `${profitDay >= 0 ? '+' : ''}${profitDay.toFixed(2)} DH`, isPos: profitDay >= 0 },
                    { label: isAr ? '📅 فالشهر الكامل (26 يوم = 12,480 د)' : '📅 Par Mois (26j = 12 480 min)', pcs: `${fmtNum(pcsPerMonth, 0)} pcs`, rev: `${revMonth.toFixed(2)} DH`, mod: `${teamLaborMonth.toFixed(2)} DH`, matFrais: `${(matMonth + teamAtelierMonth).toFixed(2)} DH`, cost: `${totalCostMonth.toFixed(2)} DH`, prof: `${profitMonth >= 0 ? '+' : ''}${profitMonth.toFixed(2)} DH`, isPos: profitMonth >= 0 },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-slate-200 last:border-0 odd:bg-white even:bg-slate-50/60">
                      <td className="p-1.5 font-black border-e border-slate-300 text-start px-3">{r.label}</td>
                      <td dir="ltr" className="p-1.5 font-black border-e border-slate-300 text-indigo-800">{r.pcs}</td>
                      <td dir="ltr" className="p-1.5 font-bold border-e border-slate-300">{r.rev}</td>
                      <td dir="ltr" className="p-1.5 font-bold border-e border-slate-300 text-slate-700">{r.mod}</td>
                      <td dir="ltr" className="p-1.5 font-bold border-e border-slate-300 text-slate-700">{r.matFrais}</td>
                      <td dir="ltr" className="p-1.5 font-black border-e border-slate-300 text-slate-900">{r.cost}</td>
                      <td dir="ltr" className={`p-1.5 font-black ${r.isPos ? 'text-emerald-700 bg-emerald-50/40' : 'text-rose-700 bg-rose-50/40'}`}>{r.prof}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. Cost Breakdown Bar + Gamme de Montage Table */}
            <div className="space-y-2">
              {/* Cost Structure Strip */}
              <div className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-between gap-4 text-[10px] font-black">
                <span className="text-slate-800 shrink-0">{isAr ? '🔍 تحليل بنية تكلفة البياسة الواحدة:' : '🔍 Structure du Coût Unitaire :'}</span>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                    {isAr ? 'اليد العاملة:' : 'MOD:'} <strong dir="ltr" className="inline-block">{unitLaborCostReal.toFixed(2)} DH ({laborSharePct.toFixed(1)}%)</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {isAr ? 'السلعة:' : 'Matière:'} <strong dir="ltr" className="inline-block">{unitMatCost.toFixed(2)} DH ({matSharePct.toFixed(1)}%)</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {isAr ? 'مصاريف الأتوليي:' : 'Frais fixes:'} <strong dir="ltr" className="inline-block">{unitAtelierCostReal.toFixed(2)} DH ({atelierSharePct.toFixed(1)}%)</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    {isAr ? 'المجموع للبياسة:' : 'Total/pc:'} <strong dir="ltr" className="inline-block">{costPerPiece.toFixed(2)} DH</strong>
                  </span>
                </div>
              </div>

              {/* Gamme de Montage Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between font-black text-[11px]">
                  <span>{isAr ? `🏭 مراحل الخياطة وبوستات العمل المعتمدة — عدد البوستات: ${activePostesCount}` : `🏭 Gamme de Montage Officielle — ${activePostesCount} Postes`}</span>
                  <span>{isAr ? `مجموع وقت خياطة البياسة: ${fmtNum(activeGammeMinutes, 2)} دقيقة (${activeGammeSeconds} ثانية)` : `Temps total : ${fmtNum(activeGammeMinutes, 2)} min (${activeGammeSeconds} sec)`}</span>
                </div>
                <div className="grid grid-cols-2 gap-0">
                  {activePostesList.slice(0, 10).map((p, idx) => (
                    <div key={idx} className="px-3 py-1.5 border-b border-e border-slate-200 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="px-1.5 py-0.2 bg-slate-900 text-white rounded text-[9px] font-black shrink-0" dir="ltr">#{idx + 1}</span>
                        <span className="font-black text-slate-800 truncate">{isAr ? p.nomAr : p.nomFr}</span>
                        <span className="text-slate-500 font-bold text-[9px] shrink-0" dir="ltr">[{p.machine}]</span>
                      </div>
                      <strong dir="ltr" className="font-black text-indigo-700 ms-2 shrink-0">
                        {fmtNum(p.tempsMin, 2)} min ({Math.round((Number(p.tempsMin) || 0) * 60)} s)
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Signatures Footer (Page 1 Bottom) */}
            <div className="grid grid-cols-2 gap-4 pt-1 text-[10.5px] font-bold text-slate-800">
              <div className="border-2 border-dashed border-slate-400 rounded-xl px-3.5 py-2.5 h-16 flex flex-col justify-between bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-black">{isAr ? '✍️ إمضاء المسؤول التقني / الشاف ديال لاشين:' : '✍️ Visa Responsable Technique / Chef d\'Atelier :'}</span>
                  <span className="text-[9px] text-slate-500 font-bold">{isAr ? 'مراجعة البوستات والوقت' : 'Vérification Gamme'}</span>
                </div>
                <span className="text-[9px] text-slate-400">{isAr ? 'التاريخ، الإمضاء والختم: ...........................................................' : 'Date, Signature & Cachet : ...................................................'}</span>
              </div>
              <div className="border-2 border-dashed border-slate-400 rounded-xl px-3.5 py-2.5 h-16 flex flex-col justify-between bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-black">{isAr ? '✅ مصادقة الإدارة العامة (BEYA CREATIVE):' : '✅ Validation Direction Générale (BEYA CREATIVE) :'}</span>
                  <span className="text-[9px] text-emerald-700 font-black">{isAr ? 'الصفحة 1/2 — يتبع في الصفحة 2 (شروط النجاح)' : 'Page 1/2 — Suite Page 2'}</span>
                </div>
                <span className="text-[9px] text-slate-400">{isAr ? 'قرار اعتماد الميزانية: ..............................................................' : 'Décision & Cachet Direction : ................................................'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ==================== PAGE 2 / 2 : CHARTE & CONDITIONS OBLIGATOIRES DE RÉUSSITE DU PLAN ==================== */}
        <div className="print-page">
          <div className="h-full w-full border-2 border-slate-900 rounded-2xl p-4 flex flex-col justify-between bg-white">
            
            {/* 1. Top Header Banner (Page 2 / 2) */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeModelPhoto}
                  alt={itemName}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
                  className="w-15 h-15 rounded-2xl object-cover border-2 border-slate-900 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black tracking-wider uppercase" dir="ltr">
                      BEYA CREATIVE • PAGE 2 / 2
                    </span>
                    <span className="text-[10px] font-black text-rose-700">
                      {isAr ? 'وثيقة إلزامية للتطبيق داخل الأتوليي ولاشين' : 'CHARTE D\'EXÉCUTION & CONDITIONS DE RÉUSSITE'}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-950 mt-0.5">
                    {isAr
                      ? `شروط وضوابط نجاح الخطة الإنتاجية والتقرير المالي — الموديل: ${itemName || 'موديل جديد'}`
                      : `Conditions Obligatoires de Réussite du Plan — Modèle : ${itemName || 'Modèle'}`}
                  </h2>
                  <div className="text-[10.5px] font-bold text-slate-600 mt-0.5">
                    {isAr
                      ? 'باش ينجح هاد التقرير وتخرج الأرباح مضبوطة فالواقع، خاص احترام هاد الشروط الـ 6 بالحرف ومنع أي انحراف فالأتوليي.'
                      : 'Pour garantir le profit prévu à la Page 1, ces 6 conditions opérationnelles doivent être strictement respectées.'}
                  </div>
                </div>
              </div>

              <div className="text-center border-2 border-slate-900 rounded-2xl px-3.5 py-2 bg-amber-50 min-w-[185px]">
                <div className="text-[9.5px] font-black text-amber-900">
                  {isAr ? '🎯 الهدف المالي الواجب حمايته' : '🎯 OBJECTIF À PROTÉGER'}
                </div>
                <div dir="ltr" className="text-lg font-black text-slate-950 my-0.5">
                  {difference >= 0 ? `+${difference.toFixed(2)} DH` : `${difference.toFixed(2)} DH`}
                </div>
                <div className="text-[9.5px] font-bold text-slate-700">
                  {isAr ? 'تكلفة كل ساعة روطار:' : 'Coût 1h retard:'}{' '}
                  <strong dir="ltr" className="inline-block text-rose-700">-{totalCostPerHourOfWork.toFixed(2)} DH/h</strong>
                </div>
              </div>
            </div>

            {/* 2. Golden Rule Alert Strip */}
            <div className="p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50/70 flex items-center justify-between gap-3 text-[10.5px]">
              <div className="font-black text-rose-950">
                {isAr
                  ? `⚠️ تنبيه صارم للشاف ديال لاشين والفريق (${workers} عمال): أي تأخير فمدة الإنجاز كياكل مباشرة من الربح بـ `
                  : `⚠️ Règle d'Or pour l'équipe (${workers} ouvriers) : Tout retard consomme directement la marge à raison de `}
                <strong dir="ltr" className="inline-block text-rose-700 underline">{totalCostPerHourOfWork.toFixed(2)} DH/h</strong>
                {isAr ? ' (أي ' : ' (soit '}
                <strong dir="ltr" className="inline-block text-rose-700 underline">{(totalCostPerHourOfWork * 8).toFixed(2)} DH/jour</strong>
                {isAr ? ' فكل نهار تأخير).' : ' par jour de retard).'}
              </div>
              <span className="px-2.5 py-1 bg-rose-700 text-white rounded-lg font-black text-[9.5px] shrink-0">
                {isAr ? `أقصى سقف قبل الخسارة: ${maxDaysAllowed} يوم و ${maxHoursAllowed} س` : `Plafond Max: ${maxDaysAllowed}j ${maxHoursAllowed}h`}
              </span>
            </div>

            {/* 3. The 6 Mandatory Conditions Grid (2x3 Structured Cards) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Condition 1: Strict Time & Duration Ceiling */}
              <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-[11px] text-indigo-900">
                    {isAr ? '1️⃣ الشرط الأول: احترام سقف الوقت والمدة القصوى' : '1️⃣ Condition 1 : Respect du Délai & Plafond Horaire'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[8.5px] font-black">{isAr ? 'إجباري' : 'STRICT'}</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span>{isAr ? '• المدة المعتمدة لإنجاز الطلبية بالكامل:' : '• Durée officielle allouée :'}</span>
                    <strong dir="ltr" className="text-slate-950 font-black">{fmtNum(days, 2)} j ({fmtNum(totalHoursPerWorker, 1)} h)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? '• السقف الأقصى للوقت قبل الدخول في الخسارة:' : '• Seuil critique (Point Mort) :'}</span>
                    <strong dir="ltr" className="text-rose-700 font-black">{maxDaysAllowed} j + {maxHoursAllowed} h max</strong>
                  </div>
                  <div className="text-[9.5px] text-slate-600 pt-0.5">
                    {isAr
                      ? '✅ الضابط: انطلاق الخدمة فالوقت المحدد ومنع الضياع الزمني بين البوستات.'
                      : '✅ Règle : Démarrage à l\'heure exacte et zéro temps mort entre postes.'}
                  </div>
                </div>
              </div>

              {/* Condition 2: Mandatory Production Cadence */}
              <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-[11px] text-emerald-900">
                    {isAr ? '2️⃣ الشرط الثاني: تحقيق وتيرة الإنتاج في الساعة والنهار' : '2️⃣ Condition 2 : Cadence Horaire & Journalière'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[8.5px] font-black">{isAr ? 'الوتيرة' : 'CADENCE'}</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span>{isAr ? '• الهدف الإجباري للفريق في الساعة / النهار:' : '• Objectif équipe (Heure / Jour) :'}</span>
                    <strong dir="ltr" className="text-emerald-700 font-black">{fmtNum(pcsPerHour, 1)} pc/h • {fmtNum(pcsPerDay, 0)} pc/j</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? `• المعدل المطلوب من كل عامل (من أصل ${workers} عمال):` : `• Quota individuel (sur ${workers} ouv.) :`}</span>
                    <strong dir="ltr" className="text-slate-950 font-black">{fmtNum(pcsPerDay / Math.max(1, workers), 1)} pc/j/ouv</strong>
                  </div>
                  <div className="text-[9.5px] text-slate-600 pt-0.5">
                    {isAr
                      ? '✅ الضابط: مراقبة عدد البياسات المخروجة على رأس كل ساعتين (2h) لتفادي تراكم الروطار.'
                      : '✅ Règle : Pointage de la production toutes les 2 heures sur la chaîne.'}
                  </div>
                </div>
              </div>

              {/* Condition 3: Fabric & Cutting Control */}
              <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-[11px] text-amber-900">
                    {isAr ? '3️⃣ الشرط الثالث: ضبط استهلاك السلعة والفصالة' : '3️⃣ Condition 3 : Maîtrise Matière Première & Coupe'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[8.5px] font-black">{isAr ? 'السلعة' : 'MATIÈRE'}</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span>{isAr ? '• سقف تكلفة السلعة المسموح به للبياسة:' : '• Plafond matière unitaire :'}</span>
                    <strong dir="ltr" className="text-slate-950 font-black">{unitMatCost.toFixed(2)} DH / pc</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? '• الميزانية القصوى للسلعة (الثوب + السلعة):' : '• Budget matière global max :'}</span>
                    <strong dir="ltr" className="text-amber-800 font-black">{materials.toFixed(2)} DH</strong>
                  </div>
                  <div className="text-[9.5px] text-slate-600 pt-0.5">
                    {isAr
                      ? '✅ الضابط: تحسين التراصاج (Placement) فالفصالة وحصر الضياع (Chutes) فـ أقل من 2%.'
                      : '✅ Règle : Optimiser le placement de coupe et limiter la chute à < 2%.'}
                  </div>
                </div>
              </div>

              {/* Condition 4: Workstation Balancing & Bottleneck */}
              <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-[11px] text-violet-900">
                    {isAr ? '4️⃣ الشرط الرابع: توازن البوستات والمرحلة الحرجة' : '4️⃣ Condition 4 : Équilibrage & Poste Goulot'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-violet-600 text-white rounded text-[8.5px] font-black">{isAr ? 'لاشين' : 'CHAÎNE'}</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span>{isAr ? '• البوستات المعتمدة ووقت خياطة البياسة:' : '• Postes & temps gamme :'}</span>
                    <strong dir="ltr" className="text-slate-950 font-black">{activePostesCount} postes • {activeGammeMinutes} min/pc</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? '• أطول بوست للمراقبة (Goulot):' : '• Poste critique (Goulot) :'}</span>
                    <strong className="text-violet-800 font-black truncate max-w-[170px]">
                      {isAr ? bottleneckPoste.nomAr : bottleneckPoste.nomFr} ({bottleneckPoste.tempsMin} د)
                    </strong>
                  </div>
                  <div className="text-[9.5px] text-slate-600 pt-0.5">
                    {isAr
                      ? `✅ الضابط: تجهيز الـ ${totalMachines} ماكينات (إبر، خيط، بواط) قبل انطلاق الخدمة لتفادي توقف البوستات.`
                      : `✅ Règle : Préparer les ${totalMachines} machines avant 8h00 pour éviter tout arrêt.`}
                  </div>
                </div>
              </div>

              {/* Condition 5: Zero Retouche & Quality Control */}
              <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-[11px] text-teal-900">
                    {isAr ? '5️⃣ الشرط الخامس: الجودة من البياسة الأولى (0 روتوش)' : '5️⃣ Condition 5 : Qualité 1er Choix & Zéro Retouche'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-teal-600 text-white rounded text-[8.5px] font-black">{isAr ? 'الجودة' : 'QUALITÉ'}</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span>{isAr ? '• تكلفة كل بياسة خاسرة أو معادة:' : '• Perte par pièce défectueuse :'}</span>
                    <strong dir="ltr" className="text-rose-700 font-black">-{costPerPiece.toFixed(2)} DH / pc</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? '• شرط الانطلاق الإجباري:' : '• Condition de lancement :'}</span>
                    <strong className="text-teal-800 font-black">{isAr ? 'المصادقة على Tête de Série' : 'Validation Tête de Série'}</strong>
                  </div>
                  <div className="text-[9.5px] text-slate-600 pt-0.5">
                    {isAr
                      ? '✅ الضابط: مراقبة القياسات والخياطة فـ أول 5 بياسات قبل إطلاق السيري الكامل.'
                      : '✅ Règle : Contrôle strict des 5 premières pièces avant lancement série.'}
                  </div>
                </div>
              </div>

              {/* Condition 6: Commercial Price & Cost Ceiling Protection */}
              <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-black text-[11px] text-slate-900">
                    {isAr ? '6️⃣ الشرط السادس: حماية ثمن البيع وسقف التكلفة' : '6️⃣ Condition 6 : Protection du Prix & Marge'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[8.5px] font-black">{isAr ? 'المالية' : 'FINANCE'}</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-700 font-bold">
                  <div className="flex justify-between">
                    <span>{isAr ? '• سقف التكلفة الشاملة للبياسة الواحدة:' : '• Coût de revient plafond :'}</span>
                    <strong dir="ltr" className="text-slate-950 font-black">{costPerPiece.toFixed(2)} DH / pc</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? '• ثمن البيع المعتمد وربح البياسة:' : '• Prix vente & marge/pc :'}</span>
                    <strong dir="ltr" className="text-emerald-700 font-black">{pricePerPiece.toFixed(2)} DH ({unitProfitReal >= 0 ? '+' : ''}{unitProfitReal.toFixed(2)} DH)</strong>
                  </div>
                  <div className="text-[9.5px] text-slate-600 pt-0.5">
                    {isAr
                      ? '✅ الضابط: ممنوع البيع بأقل من التكلفة الشاملة أو زيادة ساعات إضافية غير مرخصة.'
                      : '✅ Règle : Aucune remise sous le coût complet ni heures supp. non validées.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Impact Simulation Table (What happens if conditions are respected vs delayed) */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white px-3 py-1.5 font-black text-[10.5px] flex items-center justify-between">
                <span>{isAr ? '📈 جدول محاكاة احترام الخطة مقابل الروطار (تأثير الانضباط على الربح الصافي)' : '📈 Simulation d\'Impact : Respect du Plan vs Retard d\'Exécution'}</span>
                <span className="text-[9px] text-amber-300 font-bold">{isAr ? 'أرقام حقيقية مبنية على معطيات الموديل' : 'Basé sur vos données réelles'}</span>
              </div>
              <table className="w-full text-[10px] border-collapse text-center">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-800">
                    <th className="p-1.5 border-e border-slate-300 text-start px-2.5">{isAr ? 'سيناريو التنفيذ في الأتوليي' : 'Scénario d\'Exécution'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'المدة المستغرقة' : 'Durée Réelle'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'تكلفة البياسة' : 'Coût / Pièce'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'التكلفة الإجمالية' : 'Coût Total'}</th>
                    <th className="p-1.5 border-e border-slate-300">{isAr ? 'الربح أو الخسارة' : 'Résultat Net'}</th>
                    <th className="p-1.5">{isAr ? 'الحكم التقني' : 'Statut'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: isAr ? '🚀 إنجاز أسرع بـ 10% (فعالية عالية)' : '🚀 Avance de -10% (Haute efficacité)',
                      dur: `${fmtNum(days * 0.9, 2)} j (${fmtNum(totalHoursPerWorker * 0.9, 1)} h)`,
                      unit: `${((materials + (totalLaborCost + allocatedExpenses) * 0.9) / qty).toFixed(2)} DH`,
                      tot: `${(materials + (totalLaborCost + allocatedExpenses) * 0.9).toFixed(2)} DH`,
                      res: `${(totalPriceClient - (materials + (totalLaborCost + allocatedExpenses) * 0.9)) >= 0 ? '+' : ''}${(totalPriceClient - (materials + (totalLaborCost + allocatedExpenses) * 0.9)).toFixed(2)} DH`,
                      badge: isAr ? 'ممتاز (+ربح إضافي)' : 'Excellent (+Bonus)',
                      cls: 'text-emerald-800 font-black bg-emerald-50/60'
                    },
                    {
                      name: isAr ? '✅ احترام الخطة 100% (الهدف المعتمد)' : '✅ Respect strict 100% (Objectif)',
                      dur: `${fmtNum(days, 2)} j (${fmtNum(totalHoursPerWorker, 1)} h)`,
                      unit: `${costPerPiece.toFixed(2)} DH`,
                      tot: `${realCost.toFixed(2)} DH`,
                      res: `${difference >= 0 ? '+' : ''}${difference.toFixed(2)} DH`,
                      badge: isAr ? 'خطة ناجحة 100%' : 'Plan Réussi 100%',
                      cls: 'text-indigo-900 font-black bg-indigo-50/60'
                    },
                    {
                      name: isAr ? '⚠️ تأخير بـ +15% عن الوقت المحدد' : '⚠️ Retard de +15% sur le délai',
                      dur: `${fmtNum(days * 1.15, 2)} j (${fmtNum(totalHoursPerWorker * 1.15, 1)} h)`,
                      unit: `${((materials + (totalLaborCost + allocatedExpenses) * 1.15) / qty).toFixed(2)} DH`,
                      tot: `${(materials + (totalLaborCost + allocatedExpenses) * 1.15).toFixed(2)} DH`,
                      res: `${(totalPriceClient - (materials + (totalLaborCost + allocatedExpenses) * 1.15)) >= 0 ? '+' : ''}${(totalPriceClient - (materials + (totalLaborCost + allocatedExpenses) * 1.15)).toFixed(2)} DH`,
                      badge: isAr ? 'تآكل الهامش الربحي' : 'Érosion de marge',
                      cls: 'text-amber-800 font-black bg-amber-50/50'
                    },
                    {
                      name: isAr ? '🚨 تجاوز السقف الأقصى للوقت (نقطة الخسارة)' : '🚨 Dépassement du Seuil Critique',
                      dur: `> ${maxDaysAllowed} j ${maxHoursAllowed} h`,
                      unit: `> ${pricePerPiece.toFixed(2)} DH`,
                      tot: `> ${totalPriceClient.toFixed(2)} DH`,
                      res: `-0.00 DH (${isAr ? 'خسارة' : 'Perte'})`,
                      badge: isAr ? 'ممنوع (خسارة مباشرة)' : 'Interdit (Perte)',
                      cls: 'text-rose-700 font-black bg-rose-50/60'
                    }
                  ].map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-200 last:border-0">
                      <td className="p-1.5 font-black border-e border-slate-300 text-start px-2.5">{s.name}</td>
                      <td dir="ltr" className="p-1.5 font-bold border-e border-slate-300">{s.dur}</td>
                      <td dir="ltr" className="p-1.5 font-bold border-e border-slate-300">{s.unit}</td>
                      <td dir="ltr" className="p-1.5 font-bold border-e border-slate-300">{s.tot}</td>
                      <td dir="ltr" className={`p-1.5 border-e border-slate-300 ${s.cls}`}>{s.res}</td>
                      <td className={`p-1.5 text-[9.5px] ${s.cls}`}>{s.badge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. Daily Execution Checklist for the Chef de Chaîne */}
            <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/60">
              <div className="font-black text-[10.5px] text-slate-900 mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>{isAr ? '☑️ قائمة المراقبة اليومية الإجبارية (يؤشر عليها الشاف ديال لاشين كل نهار):' : '☑️ Checklist de Contrôle Quotidien (Chef de Chaîne) :'}</span>
                <span className="text-[9px] text-slate-500 font-bold">{isAr ? 'تعلق أمام خط الإنتاج' : 'À afficher sur la chaîne'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[9.5px] font-bold text-slate-700">
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-black text-indigo-800">{isAr ? '🕗 1. قبل انطلاق الصباح (8h00)' : '🕗 1. Avant Démarrage (8h00)'}</div>
                  <div>☐ {isAr ? `حضور الـ ${workers} عمال فالبوستات` : `Présence des ${workers} ouvriers`}</div>
                  <div>☐ {isAr ? `فحص الـ ${totalMachines} آلات وتوفر الخيط` : `Vérification des ${totalMachines} machines`}</div>
                  <div>☐ {isAr ? 'توزيع الحزم المقطوعة (Paquets)' : 'Distribution des paquets coupés'}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-black text-emerald-800">{isAr ? '🕛 2. مراقبة وسط النهار (كل 2 سوايع)' : '🕛 2. Suivi Mi-Journée (Chaque 2h)'}</div>
                  <div>☐ {isAr ? `تحقيق وتيرة ${fmtNum(pcsPerHour, 1)} بياسة/ساعة` : `Cadence ${fmtNum(pcsPerHour, 1)} pcs/heure`}</div>
                  <div>☐ {isAr ? 'عدم تراكم الخدمة فالبوست الحرج' : 'Absence de blocage au poste goulot'}</div>
                  <div>☐ {isAr ? 'مراقبة الجودة (0 ديفو / 0 روتوش)' : 'Contrôle qualité (0 retouche)'}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-black text-amber-900">{isAr ? '🕔 3. حصيلة نهاية النهار (8 سوايع)' : '🕔 3. Bilan Fin de Journée (8h)'}</div>
                  <div>☐ {isAr ? `إخراج الهدف اليومي: ${fmtNum(pcsPerDay, 0)} بياسة` : `Sortie quota : ${fmtNum(pcsPerDay, 0)} pcs/jour`}</div>
                  <div>☐ {isAr ? 'إحصاء الباقي وتحديث الفيش' : 'Comptage du reste à produire'}</div>
                  <div>☐ {isAr ? 'توقيع تقرير المردودية اليومي' : 'Validation du rapport journalier'}</div>
                </div>
              </div>
            </div>

            {/* 6. Official Signatures & Commitment Footer (Page 2 Bottom) */}
            <div className="grid grid-cols-3 gap-3 pt-1 text-[10px] font-bold text-slate-800">
              <div className="border-2 border-dashed border-slate-400 rounded-xl p-2.5 h-15 flex flex-col justify-between bg-slate-50/40">
                <span className="font-black">{isAr ? '✍️ التزام الشاف ديال لاشين (الإنتاج):' : '✍️ Engagement Chef de Chaîne :'}</span>
                <span className="text-[8.5px] text-slate-500">{isAr ? `ألتزم بوتيرة ${fmtNum(pcsPerDay, 0)} بياسة/نهار والمدة المحددة` : `Engagement sur ${fmtNum(pcsPerDay, 0)} pcs/j`}</span>
              </div>
              <div className="border-2 border-dashed border-slate-400 rounded-xl p-2.5 h-15 flex flex-col justify-between bg-slate-50/40">
                <span className="font-black">{isAr ? '✂️ التزام مسؤول الفصالة والجودة:' : '✂️ Engagement Coupe & Qualité :'}</span>
                <span className="text-[8.5px] text-slate-500">{isAr ? `ألتزم بسقف السلعة (${unitMatCost.toFixed(2)} DH/pc) و0 روتوش` : 'Respect matière & zéro retouche'}</span>
              </div>
              <div className="border-2 border-dashed border-slate-400 rounded-xl p-2.5 h-15 flex flex-col justify-between bg-slate-50/40">
                <span className="font-black">{isAr ? '✅ مصادقة الإدارة العامة (BEYA CREATIVE):' : '✅ Approbation Direction Générale :'}</span>
                <span className="text-[8.5px] text-emerald-700 font-black">{isAr ? 'الصفحة 2/2 — أمر رسمي بإطلاق الإنتاج' : 'Page 2/2 — Bon pour exécution'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STARTUP PRIORITY BOX MODAL: THE 4 CRITICAL QUESTIONS ("ITL3O F BOX HOMA LWALA FACH NDKHL LABAG MANGHLTCH FIHOM") */}
      {showEssentialBox && (
        <div
          onClick={() => setShowEssentialBox(false)}
          className="no-print fixed inset-0 z-[1450] bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-amber-400 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 border-b border-amber-400/40">
              <div className="flex items-center gap-3">
                <img
                  src={activeModelPhoto}
                  alt={itemName}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shrink-0 bg-white"
                />
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 rounded-md text-[10px] font-black uppercase">
                    🎯 {isAr ? 'خطوة إجبارية سريعة قبل الحساب' : 'Étape Clé Prioritaire'}
                  </div>
                  <h3 className="font-black text-sm sm:text-base mt-0.5 text-white">
                    {isAr ? 'الأسئلة الـ 4 الأساسية (تأكد منهم باش ما تغلطش فالحساب!)' : 'Les 4 Questions Essentielles du Calcul'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEssentialBox(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500 text-slate-300 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Model Name Quick Check */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span className="text-xs font-black text-slate-700 shrink-0">
                  🏷️ {isAr ? 'نوع البياسة / الموديل:' : 'Article / Modèle :'}
                </span>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 text-xs focus:border-indigo-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowEssentialBox(false);
                    setIsFichePickerOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-[10px] font-black border border-indigo-200 transition-all shrink-0"
                >
                  📋 {isAr ? 'من الفيش تكنيك' : 'Fiche Tech'}
                </button>
              </div>

              {/* The 4 Critical Questions in 2x2 Color-Coded Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Question 1: Quantity */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-black">1️⃣ {isAr ? 'السؤال الأول' : 'Question 1'}</span>
                    <span className="text-[10px] font-bold text-indigo-700">{isAr ? 'عدد البياسات' : 'Volume'}</span>
                  </div>
                  <label className="block text-xs font-black text-slate-900">
                    {isAr ? 'شحال الكمية المعتمدة فـ الطلبية؟ (بياسة)' : 'Quelle est la quantité totale (pièces) ?'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('modal_qty', quantity, 2)}
                    onFocus={() => {
                      setActiveInputKey('modal_qty');
                      setActiveInputRaw(quantity === 0 ? '' : String(Number(quantity.toFixed(2))));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      setQuantity(e.target.value === '' ? 0 : Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-white border-2 border-indigo-300 focus:border-indigo-600 rounded-xl font-black text-indigo-700 text-base text-center outline-none"
                  />
                </div>

                {/* Question 2: Unit Sale Price */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-black">2️⃣ {isAr ? 'السؤال الثاني' : 'Question 2'}</span>
                    <span className="text-[10px] font-bold text-emerald-700">{isAr ? `الإجمالي: ${totalPriceClient.toFixed(0)} DH` : `Total: ${totalPriceClient.toFixed(0)} DH`}</span>
                  </div>
                  <label className="block text-xs font-black text-slate-900">
                    {isAr ? 'بشحال غتبيع البياسة الواحدة؟ (درهم)' : 'Quel est le prix de vente par pièce (DH) ?'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('modal_price', pricePerPiece, 2)}
                    onFocus={() => {
                      setActiveInputKey('modal_price');
                      setActiveInputRaw(pricePerPiece === 0 ? '' : String(pricePerPiece));
                    }}
                    onBlur={() => setActiveInputKey(null)}
                    onChange={(e) => {
                      setActiveInputRaw(e.target.value);
                      setPricePerPiece(e.target.value === '' ? 0 : Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 bg-white border-2 border-emerald-300 focus:border-emerald-600 rounded-xl font-black text-emerald-700 text-base text-center outline-none"
                  />
                </div>

                {/* Question 3: Workers Count */}
                <div className="p-3.5 rounded-2xl bg-violet-50/70 border-2 border-violet-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-violet-600 text-white rounded-md text-[10px] font-black">3️⃣ {isAr ? 'السؤال الثالث' : 'Question 3'}</span>
                    <button
                      type="button"
                      onClick={() => setWorkers(activePostesCount)}
                      className="text-[10px] font-black text-violet-700 underline"
                    >
                      {isAr ? `= ${activePostesCount} بوستات الغام` : `= ${activePostesCount} postes`}
                    </button>
                  </div>
                  <label className="block text-xs font-black text-slate-900">
                    {isAr ? 'شحال عدد العمال اللي غيخدمو فيها؟' : 'Combien d\'ouvriers travaillent dessus ?'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={workers}
                    onChange={(e) => setWorkers(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-white border-2 border-violet-300 focus:border-violet-600 rounded-xl font-black text-violet-700 text-base text-center outline-none"
                  />
                </div>

                {/* Question 4: Work Duration (Days) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md text-[10px] font-black">4️⃣ {isAr ? 'السؤال الرابع' : 'Question 4'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setExtraHours(0);
                        setDays(realisticDaysFromGamme);
                      }}
                      className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-black"
                    >
                      ⚡ {isAr ? `الواقعي: ${realisticDaysFromGamme} يوم` : `Réaliste: ${realisticDaysFromGamme}j`}
                    </button>
                  </div>
                  <label className="block text-xs font-black text-slate-900">
                    {isAr ? 'شحال من نهار عمل (8س) غتشد الخدمة؟' : 'Combien de jours de travail (8h) ?'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={getSyncValue('modal_days', days + (extraHours / 8), 3)}
                    onFocus={() => {
                      setActiveInputKey('modal_days');
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
                    className="w-full px-3 py-2 bg-white border-2 border-amber-300 focus:border-amber-600 rounded-xl font-black text-amber-800 text-base text-center outline-none"
                  />
                </div>
              </div>

              {/* Instant Live Preview inside the Modal */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                resultStatus === 'profit'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div className="text-xs font-black">
                  {resultStatus === 'profit' ? (isAr ? '✅ النتيجة المباشرة: ربح صافي' : '✅ Profit Net') : (isAr ? '⚠️ النتيجة المباشرة: خسارة محققة' : '⚠️ Perte Nette')}
                  <div className="text-[10px] font-bold opacity-80">
                    {isAr ? `تكلفة البياسة: ${costPerPiece.toFixed(2)} DH | ثمن البيع: ${pricePerPiece.toFixed(2)} DH` : `Coût/pc: ${costPerPiece.toFixed(2)} DH | Vente: ${pricePerPiece.toFixed(2)} DH`}
                  </div>
                </div>
                <div className="text-lg font-black">
                  {difference >= 0 ? '+' : ''}{difference.toFixed(2)} DH
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setExtraHours(0);
                  setDays(realisticDaysFromGamme);
                }}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black transition-all"
              >
                ⚡ {isAr ? `ضبط الوقت أوتوماتيك (${realisticDaysFromGamme} يوم)` : `Auto-ajuster (${realisticDaysFromGamme}j)`}
              </button>

              <button
                type="button"
                onClick={() => setShowEssentialBox(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? '✓ تأكيد الخانات الـ 4 والدخول للحاسبة' : '✓ Confirmer et calculer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MODEL PHOTO LARGE PREVIEW & UPLOAD */}
      {isPhotoPreviewOpen && (
        <div
          onClick={() => setIsPhotoPreviewOpen(false)}
          className="no-print fixed inset-0 z-[1500] bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>{itemName || (isAr ? 'صورة الموديل' : 'Photo du Modèle')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPreviewOpen(false)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600"
              >
                ✕
              </button>
            </div>

            <img
              src={activeModelPhoto}
              alt={itemName}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_GARMENT_SVG; }}
              className="w-full h-72 object-cover rounded-2xl border border-slate-200 bg-slate-50"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsPhotoPreviewOpen(false);
                  modelPhotoInputRef.current?.click();
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>{isAr ? 'رفع صورة من الجهاز' : 'Importer une photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPhotoPreviewOpen(false);
                  setIsFichePickerOpen(true);
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>{isAr ? 'اختيار من الفيش تكنيك' : 'Choisir Fiche Tech'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ATELIER WORKERS SELECTION (Smart Feature 1) */}
      {showWorkersModal && (
        <div className="no-print fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
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
        <div className="no-print fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
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
        const activePostes = customPostes !== null ? customPostes : breakdown.postesTravail;
        const activeTotalMin = activePostes.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
        const selectedPresetObj = ATELIER_MACHINES_PRESETS.find(m => m.machine === selectedQuickMachine) || ATELIER_MACHINES_PRESETS[0];

        const addPosteWithMachine = (machineName: string) => {
          const preset = ATELIER_MACHINES_PRESETS.find(m => m.machine === machineName);
          const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
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

        const movePoste = (fromIdx: number, toIdx: number) => {
          const current = customPostes !== null ? [...customPostes] : [...breakdown.postesTravail];
          if (toIdx < 0 || toIdx >= current.length || fromIdx === toIdx) return;
          const updated = [...current];
          const [movedItem] = updated.splice(fromIdx, 1);
          updated.splice(toIdx, 0, movedItem);
          setCustomPostes(updated);
        };

        const handleDragStart = (e: React.DragEvent, index: number) => {
          setDraggedPosteIdx(index);
          e.dataTransfer.effectAllowed = 'move';
          try {
            e.dataTransfer.setData('text/plain', String(index));
          } catch (_) {}
        };

        const handleDragOver = (e: React.DragEvent, index: number) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverIdx !== index) {
            setDragOverIdx(index);
          }
        };

        const handleDrop = (e: React.DragEvent, targetIndex: number) => {
          e.preventDefault();
          if (draggedPosteIdx !== null && draggedPosteIdx !== targetIndex) {
            movePoste(draggedPosteIdx, targetIndex);
          }
          setDraggedPosteIdx(null);
          setDragOverIdx(null);
        };

        const handleDragEnd = () => {
          setDraggedPosteIdx(null);
          setDragOverIdx(null);
        };

        return (
          <div className="no-print w-full bg-slate-900 text-white rounded-3xl border border-amber-400/60 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col animate-fadeIn">
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
                      {activePostes.length} {isAr ? 'بوستات عمل' : 'Postes'} | {fmtNum(activeTotalMin, 2)} {isAr ? 'دقيقة' : 'min'} ({Math.round(activeTotalMin * 60)} {isAr ? 'ثانية / بياسة' : 'sec / pièce'})
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
                  onClick={() => setWorkers(Math.max(1, activePostes.length))}
                  title={isAr ? 'ضبط عدد العمال تلقائياً على عدد البوستات' : 'Ajuster ouvriers = postes'}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                >
                  🔄 {isAr ? `تعيين العمال = (${activePostes.length})` : `Ouvriers = ${activePostes.length}`}
                </button>

                {customPostes !== null && (
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
                      className="px-3 py-2 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>{isAr ? 'تفريغ الكل' : 'Tout vider'}</span>
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

              {/* Workstations Table (Full-Page, With Synchronized Minute & Second Inputs, Duplicate & Quick Machine Select) */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300">
                      <th className="p-3 text-center font-black border-b border-white/10 w-28">
                        <div className="flex items-center justify-center gap-1">
                          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                          <span>#</span>
                          <span className="text-[10px] text-amber-400 font-bold">({isAr ? 'ترتيب' : 'Ordre'})</span>
                        </div>
                      </th>
                      <th className="p-3 text-start font-black border-b border-white/10">{isAr ? 'المرحلة (وصف العملية)' : 'Étape (Opération)'}</th>
                      <th className="p-3 text-start font-black border-b border-white/10 w-64">{isAr ? 'الآلة (اختيار سريع أو كتابة)' : 'Machine'}</th>
                      <th className="p-3 text-center font-black border-b border-white/10 w-60">
                        <div className="text-amber-300">{isAr ? '⏱️ وقت العملية فـ البياسة' : '⏱️ Temps / Pièce'}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {isAr ? '(اكتب بالدقيقة أو بالثانية — كيتحولو أوتوماتيك)' : '(En Minutes ou Secondes — Synchro Auto)'}
                        </div>
                      </th>
                      <th className="p-3 text-center font-black border-b border-white/10 w-32">{isAr ? 'مضاعفة / حذف' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePostes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="text-amber-400 font-black text-sm">
                              {isAr ? '✨ القائمة فارغة تماماً! يمكنك الآن إضافة بوستاتك من الصفر' : '✨ La liste est vide ! Ajoutez vos postes de zéro'}
                            </div>
                            <p className="text-xs text-slate-400 font-bold">
                              {isAr
                                ? 'اضغط على زر [+] بجانب أي ماكينة في الشريط العلوي، أو اضغط على الزر أسفله لإضافة أول بوست عمل:'
                                : 'Cliquez sur [+] à côté d\'une machine ci-dessus ou sur le bouton ci-dessous :'}
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => addPosteWithMachine(selectedQuickMachine)}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                                <span>{isAr ? `+ إضافة أول بوست (${selectedPresetObj.labelAr})` : `+ Ajouter 1er poste (${selectedQuickMachine})`}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCustomPostes(null)}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-slate-700 transition-all"
                              >
                                🔄 {isAr ? 'استرجاع الافتراضي' : 'Restaurer défaut'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activePostes.map((poste, idx) => {
                        const minVal = Number(poste.tempsMin) || 0;
                        const secVal = Math.round(minVal * 60);
                        const isBeingDragged = draggedPosteIdx === idx;
                        const isDragOver = dragOverIdx === idx;
                        return (
                          <tr
                            key={idx}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`transition-colors group ${
                              isDragOver
                                ? 'bg-amber-500/25 border-y-2 border-amber-400'
                                : isBeingDragged
                                ? 'opacity-35 bg-slate-800'
                                : 'odd:bg-white/[0.02] even:bg-transparent hover:bg-white/5'
                            }`}
                          >
                            <td className="p-2 text-center font-black text-amber-400/80 border-b border-white/5 select-none">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Drag handle */}
                                <div
                                  draggable={true}
                                  onDragStart={(e) => handleDragStart(e, idx)}
                                  onDragEnd={handleDragEnd}
                                  title={isAr ? 'اضغط واسحب لتغيير الترتيب (Glisser-Déposer)' : 'Glisser pour réordonner'}
                                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-amber-500/20 text-slate-500 hover:text-amber-300 transition-colors"
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>

                                {/* Step number */}
                                <span className="w-5 text-center font-black text-amber-400 text-xs">
                                  {idx + 1}
                                </span>

                                {/* Up / Down Order Buttons */}
                                <div className="flex flex-col -space-y-0.5">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => movePoste(idx, idx - 1)}
                                    title={isAr ? 'تقديم المرحلة للأعلى ⬆️' : 'Monter ⬆️'}
                                    className="p-0.5 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all active:scale-90"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === activePostes.length - 1}
                                    onClick={() => movePoste(idx, idx + 1)}
                                    title={isAr ? 'تأخير المرحلة للأسفل ⬇️' : 'Descendre ⬇️'}
                                    className="p-0.5 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all active:scale-90"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="p-1.5 border-b border-white/5">
                              <input
                                type="text"
                                value={isAr ? poste.nomAr : poste.nomFr}
                                onChange={(e) => {
                                  const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
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
                                    const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
                                    const updated = current.map((p, i) => i === idx ? { ...p, machine: e.target.value } : p);
                                    setCustomPostes(updated);
                                  }}
                                  className="flex-1 bg-slate-800/40 hover:bg-slate-800 focus:bg-slate-800 text-amber-200 font-bold outline-none px-2.5 py-2 rounded-xl border border-transparent focus:border-amber-500/50 transition-all"
                                />
                                <select
                                  value={ATELIER_MACHINES_PRESETS.some(m => m.machine === poste.machine) ? poste.machine : ''}
                                  onChange={(e) => {
                                    if (!e.target.value) return;
                                    const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
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
                              {/* Synchronized Minute + Second Dual Inputs */}
                              <div className="grid grid-cols-2 gap-1.5">
                                {/* Minute Input */}
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={getSyncValue(`poste_min_${idx}`, minVal, 2)}
                                    onFocus={() => {
                                      setActiveInputKey(`poste_min_${idx}`);
                                      setActiveInputRaw(minVal === 0 ? '' : fmtNum(minVal, 2));
                                    }}
                                    onBlur={() => setActiveInputKey(null)}
                                    onChange={(e) => {
                                      setActiveInputRaw(e.target.value);
                                      const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
                                      const newMin = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                      setCustomPostes(current.map((p, i) => i === idx ? { ...p, tempsMin: newMin } : p));
                                    }}
                                    title={isAr ? 'وقت العملية بالدقيقة (Min)' : 'Temps en minutes'}
                                    className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 text-center font-black text-amber-300 text-xs outline-none ps-2 pe-9 py-2 rounded-xl border border-amber-500/30 focus:border-amber-400 transition-all"
                                  />
                                  <span className="absolute inset-y-0 end-2 flex items-center text-[9px] font-black text-amber-400/80 pointer-events-none">
                                    {isAr ? 'دقيقة' : 'min'}
                                  </span>
                                </div>

                                {/* Second Input */}
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={getSyncValue(`poste_sec_${idx}`, secVal, 0)}
                                    onFocus={() => {
                                      setActiveInputKey(`poste_sec_${idx}`);
                                      setActiveInputRaw(secVal === 0 ? '' : String(secVal));
                                    }}
                                    onBlur={() => setActiveInputKey(null)}
                                    onChange={(e) => {
                                      setActiveInputRaw(e.target.value);
                                      const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
                                      const newSec = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                      const convertedMin = Number((newSec / 60).toFixed(4));
                                      setCustomPostes(current.map((p, i) => i === idx ? { ...p, tempsMin: convertedMin } : p));
                                    }}
                                    title={isAr ? 'وقت العملية بالثانية (Sec) — كيتحول أوتوماتيك للدقائق' : 'Temps en secondes'}
                                    className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 text-center font-black text-emerald-300 text-xs outline-none ps-2 pe-9 py-2 rounded-xl border border-emerald-500/30 focus:border-emerald-400 transition-all"
                                  />
                                  <span className="absolute inset-y-0 end-2 flex items-center text-[9px] font-black text-emerald-400/80 pointer-events-none">
                                    {isAr ? 'ثانية' : 'sec'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-1.5 text-center border-b border-white/5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
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
                                    const current = customPostes !== null ? customPostes : [...breakdown.postesTravail];
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
                        );
                      })
                    )}
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
                    {fmtNum(activeTotalMin, 2)} {isAr ? 'دقيقة' : 'min'} ({Math.round(activeTotalMin * 60)} {isAr ? 'ثانية' : 'sec'} • {activePostes.length} {isAr ? 'بوستات' : 'postes'})
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


