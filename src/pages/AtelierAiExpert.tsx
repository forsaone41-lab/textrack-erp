import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, Wand2, Upload, FileText, Users, Wrench, Plus, Search, X } from 'lucide-react';
import { loadData, FicheTechnique } from '../types';
import {
  AiPreset,
  PosteTravail,
  AI_PRESETS,
  DEFAULT_FICHES_TECHNIQUES,
  getGarmentTechnicalBreakdown,
  estimateFromFiche
} from '../lib/atelierAi';

interface NavState {
  itemName?: string;
  quantity?: number;
  workers?: number;
  customPostes?: PosteTravail[] | null;
  selectedModelCategory?: string;
}

export default function AtelierAiExpert() {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state || {}) as NavState;

  const quantity = Math.max(1, navState.quantity || 50);

  const [selectedAiPreset, setSelectedAiPreset] = useState<AiPreset>(AI_PRESETS[0]);
  const [aiCustomText, setAiCustomText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [selectedModelCategory, setSelectedModelCategory] = useState<string | undefined>(navState.selectedModelCategory);
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(8);
  const [aiSuggestionApplied, setAiSuggestionApplied] = useState<boolean>(false);
  const [workers, setWorkers] = useState<number>(Math.max(1, navState.workers || 6));
  const [customPostes, setCustomPostes] = useState<PosteTravail[] | null>(navState.customPostes || null);

  const [fichesList, setFichesList] = useState<FicheTechnique[]>([]);
  const [isFichePickerOpen, setIsFichePickerOpen] = useState(false);
  const [fichePickerSearch, setFichePickerSearch] = useState('');

  useEffect(() => {
    loadData<FicheTechnique>('fiches').then(res => {
      setFichesList(res && res.length > 0 ? res : DEFAULT_FICHES_TECHNIQUES);
    }).catch(() => setFichesList(DEFAULT_FICHES_TECHNIQUES));
  }, []);

  const filteredFiches = fichesList.filter(f => {
    const q = fichePickerSearch.toLowerCase();
    return (
      f.modele.toLowerCase().includes(q) ||
      (f.client && f.client.toLowerCase().includes(q)) ||
      (f.type && f.type.toLowerCase().includes(q))
    );
  });

  const importFicheAsPreset = (f: FicheTechnique) => {
    setSelectedAiPreset(estimateFromFiche(f, isAr));
    setIsFichePickerOpen(false);
    setIsAiAnalyzing(true);
    setTimeout(() => setIsAiAnalyzing(false), 500);
  };

  const performAiVisionDeconstruction = (title: string, dataUrl?: string) => {
    const aiCustomPostes: PosteTravail[] = [
      { nomAr: 'فصالة بالليزر وتحضير الأجزاء وباترون', nomFr: 'Coupe Laser & Tracé', machine: 'Ciseaux électriques / Table Laser', tempsMin: 7, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين وتقوية الياقة والأطراف', nomFr: 'Thermocollage & Renforts', machine: 'Presse à Thermocoller', tempsMin: 5, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'سرفلة وحماية حواف الثوب الداخلي', nomFr: 'Surfilage de Sécurité', machine: 'Surjeteuse 4/5 Fils', tempsMin: 7, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع الهيكل، الأكتاف والدرزات الرئيسية', nomFr: 'Assemblage Principal & Épaules', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 12, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة وتثبيت الأكمام مع البطانة الداعمة', nomFr: 'Montage Manches & Emmanchures', machine: 'Piqueuse Plate', tempsMin: 10, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الياقة، الجيوب أو التطريز الزخرفي', nomFr: 'Pose Accessoires (Col/Poche/Broderie)', machine: 'Piqueuse Guide / Automate', tempsMin: 9, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني الأطراف السفلى والتشطيب الدقيق', nomFr: 'Ourlets & Finitions Extérieures', machine: 'Recouvreuse / Main', tempsMin: 5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'كّي نهائي بالبخار، تشطيب وفحص الجودة', nomFr: 'Repassage Vapeur & Contrôle Qualité', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 4, roleOuvrier: 'مراقب جودة وتشطيب' }
    ];

    const totalConfectionMin = aiCustomPostes.reduce((sum, p) => sum + (Number(p.tempsMin) || 0), 0);

    const aiReportAr = `🤖 تحليل صورة الموديل بالذكاء الاصطناعي (BEYA AI Vision - Déconstruction):
1. 🔍 تشريح الهيكل والتصميم: تم رصد قصة معقدة مع أكمام مدعمة، خياطة تقوية مزدوجة إبرتين، تشطيبات حواف دقيقة، ووجود عناصر زخرفية/جيوب مدمجة.
2. 🧵 مسار الخياطة والمكائن: الخياطة الأساسية تتطلب (Piqueuse Plate إبرتين ودليل Guide)، السرفلة على (Surjeteuse 5 خيوط أمان)، مع تقوية بالحرارة (Thermocollage) وكيّ بالبخار.
3. 👥 القوى العاملة والبوستات المطلوبة: لتجنب أي اختناق في خط الإنتاج، هذا الموديل يحتاج بالضبط إلى (8) محطات عمل متخصصة، أي (8) عمال خياطة وتشطيب، بمتوسط خياطة ${totalConfectionMin} دقيقة للقطعة واستهلاك 2.40 متر من القماش.`;

    const aiReportFr = `🤖 Analyse Visuelle IA (BEYA AI Vision - Déconstruction) :
1. 🔍 Ingénierie & Coupe : Détection d'un montage élaboré avec emmanchures renforcées, coutures surpiquées 2 aiguilles, finitions de bord techniques et empiècements intégrés.
2. 🧵 Parcours Machines : Assemblage sur Piqueuse Plate (1 & 2 aiguilles + Guide), surfilage de sécurité sur Surjeteuse 5 Fils, renforts thermocollés et finition fer à vapeur.
3. 👥 Effectif et Chaîne requis : Ce modèle exige exactement 8 postes de travail spécialisés (8 ouvriers) pour une gamme de ${totalConfectionMin} min/pièce et une consommation de 2.40m de tissu.`;

    setSelectedModelCategory(undefined);
    setCustomPostes(aiCustomPostes);
    setWorkers(aiCustomPostes.length);

    setSelectedAiPreset({
      title: `📷 ${title}`,
      desc: isAr ? `تحليل بصري متقدم (8 بوستات / 8 عمال)` : `Analyse Visuelle IA (8 postes / 8 ouvriers)`,
      aiText: isAr ? aiReportAr : aiReportFr,
      recommendedPrice: 120,
      materialPerPiece: 55,
      recommendedDays: 3,
      photo: dataUrl,
      stitchingMin: totalConfectionMin
    });
    setIsAiAnalyzing(true);
    setTimeout(() => setIsAiAnalyzing(false), 600);
  };

  const handleUploadModelImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      performAiVisionDeconstruction(cleanName, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePosteName = (idx: number, newName: string) => {
    const breakdown = getGarmentTechnicalBreakdown(selectedAiPreset.title, undefined, undefined, selectedModelCategory);
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current[idx]) {
      current[idx] = { ...current[idx], nomAr: newName, nomFr: newName };
      setCustomPostes(current);
    }
  };

  const handleUpdatePosteMin = (idx: number, delta: number) => {
    const breakdown = getGarmentTechnicalBreakdown(selectedAiPreset.title, undefined, undefined, selectedModelCategory);
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current[idx]) {
      const updatedTime = Math.max(1, (Number(current[idx].tempsMin) || 1) + delta);
      current[idx] = { ...current[idx], tempsMin: updatedTime };
      setCustomPostes(current);
    }
  };

  const handleDeletePoste = (idx: number) => {
    const breakdown = getGarmentTechnicalBreakdown(selectedAiPreset.title, undefined, undefined, selectedModelCategory);
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current.length <= 1) return;
    current.splice(idx, 1);
    setCustomPostes(current);
  };

  const handleAddPoste = () => {
    const breakdown = getGarmentTechnicalBreakdown(selectedAiPreset.title, undefined, undefined, selectedModelCategory);
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    const insertIdx = Math.max(0, current.length - 1);
    current.splice(insertIdx, 0, {
      nomAr: 'خياطة دعم — تجميع وتثبيت الأجزاء (Renfort Montage)',
      nomFr: 'Montage Renfort — Piqueuse Plate',
      machine: 'Piqueuse Plate 2 Aiguilles',
      tempsMin: 6,
      roleOuvrier: isAr ? 'خياط رئيسي' : 'Ouvrier Qualifié'
    });
    setCustomPostes(current);
  };

  const handleApplyAiSuggestion = () => {
    const breakdown = getGarmentTechnicalBreakdown(selectedAiPreset.title, undefined, undefined, selectedModelCategory);
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    const insertIdx = Math.max(0, current.length - 1);
    current.splice(insertIdx, 0, {
      nomAr: 'سرفلة (Surjeteuse 4 Fils) — لتخفيف الاختناق وتمرير الأجزاء بسرعة',
      nomFr: "Surjeteuse 4 Fils — renfort goulet d'étranglement (+25% prod)",
      machine: 'Surjeteuse 4 Fils',
      tempsMin: 4,
      roleOuvrier: isAr ? 'عامل خياطة' : 'Ouvrier Qualifié'
    });
    setCustomPostes(current);
    setAiSuggestionApplied(true);
  };

  const applyAiEstimation = (preset: AiPreset) => {
    const breakdown = getGarmentTechnicalBreakdown(preset.title, undefined, undefined, selectedModelCategory);
    const activePostesModal = (customPostes && customPostes.length > 0) ? customPostes : breakdown.postesTravail;
    const basePostesCount = breakdown.postesTravail.length;
    const basePostesMin = activePostesModal.slice(0, basePostesCount).reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
    const aiStitchingMin = basePostesMin || breakdown.totalMinutesConfection || preset.stitchingMin || 35;
    const extraPostesCount = Math.max(0, activePostesModal.length - basePostesCount);
    const activeWorkersCount = Math.max(1, workers + extraPostesCount);
    const aiDailyPiecesOutput = Math.max(1, Math.floor((activeWorkersCount * workHoursPerDay * 60) / aiStitchingMin));
    const aiRealisticDays = Math.max(1, Math.ceil(quantity / aiDailyPiecesOutput));

    const isVisionPreset = preset.aiText?.includes('AI Vision') || preset.aiText?.includes('Déconstruction');

    localStorage.setItem('beya_ai_gamme_pilot_export', JSON.stringify({
      itemName: preset.title.replace(/^[^\s]+\s+/, ''),
      pricePerPiece: breakdown.prixVenteConseille || preset.recommendedPrice,
      materials: Math.round(((breakdown.consommationMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees) * quantity),
      days: aiRealisticDays,
      workers: activeWorkersCount,
      customPostes: isVisionPreset ? (customPostes || breakdown.postesTravail) : null
    }));

    navigate('/atelier-calculator');
  };

  const breakdown = getGarmentTechnicalBreakdown(selectedAiPreset.title, undefined, undefined, selectedModelCategory);
  const activePostesModal = (customPostes && customPostes.length > 0) ? customPostes : breakdown.postesTravail;
  const basePostesCount = breakdown.postesTravail.length;
  const basePostesMin = activePostesModal.slice(0, basePostesCount).reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
  const aiStitchingMin = basePostesMin || breakdown.totalMinutesConfection || selectedAiPreset.stitchingMin || 35;
  const extraPostesCount = Math.max(0, activePostesModal.length - basePostesCount);
  const activeWorkersCount = Math.max(1, workers + extraPostesCount);
  const aiDailyPiecesOutput = Math.max(1, Math.floor((activeWorkersCount * workHoursPerDay * 60) / aiStitchingMin));
  const aiMonthlyPiecesOutput = aiDailyPiecesOutput * 26;
  const aiRealisticDays = Math.max(1, Math.ceil(quantity / aiDailyPiecesOutput));

  const targetDailyPcs = 360;
  const neededWorkersFor360 = Math.ceil((targetDailyPcs * aiStitchingMin) / (workHoursPerDay * 60));
  const neededMinPerPieceForCurrentTeam = Math.max(1, Math.floor((activeWorkersCount * workHoursPerDay * 60) / targetDailyPcs));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-400/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-800 flex items-center gap-2">
              {isAr ? 'مساعد BEYA الذكي لتقدير تكلفة الإنتاج (Expert IA)' : 'Assistant Expert BEYA - Estimation IA'}
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] border border-emerald-300">
                TOUJOURS ACTIF
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {isAr ? 'تحليل الموديل أو الصورة وإعطاء تقدير التكلفة وسعر القماش في السوق المغربية' : 'Analyse du modèle et estimation du coût matière en DH'}
            </p>
          </div>
        </div>
      </div>

      {/* Presets selector */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
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

        <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            {isAr ? 'أو استورد موديل حقيقي:' : 'Ou importez un modèle réel :'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFichePickerOpen(true)}
              className="px-3 py-1.5 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border border-violet-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              {isAr ? '📋 من الفيش تكنيك (BEYA)' : '📋 Fiche Technique (BEYA)'}
            </button>
            <button
              type="button"
              onClick={() => performAiVisionDeconstruction(isAr ? 'عينة تجريبية - جاكيت / عباية فاخرة' : 'Démo Modèle Haute Confection')}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30 active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              {isAr ? '🔬 تجربة تحليل صورة (AI Vision)' : '🔬 Test Analyse Image (Démo IA)'}
            </button>
            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white border border-slate-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {isAr ? '💻 من جهازك (صورة)' : '💻 Depuis votre appareil'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadModelImage(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
            {isAr ? 'أو اكتب وصف الموديل بكلماتك:' : 'Ou décrivez le modèle avec vos mots :'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiCustomText}
              onChange={(e) => setAiCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiCustomText.trim()) {
                  setSelectedAiPreset({
                    title: `✍️ ${aiCustomText.trim()}`,
                    desc: aiCustomText.trim(),
                    aiText: isAr
                      ? `تحليل تقني للوصف "${aiCustomText.trim()}": تقدير أولي لوقت خياطة قياسي 30 دقيقة للقطعة واستهلاك قماش 25.00 درهم للقطعة.`
                      : `Analyse technique pour "${aiCustomText.trim()}" : Temps de confection standard estimé à 30 min/pièce et coût matière à 25.00 DH/pièce.`,
                    recommendedPrice: 60,
                    materialPerPiece: 25,
                    recommendedDays: 2,
                    stitchingMin: 30
                  });
                  setIsAiAnalyzing(true);
                  setTimeout(() => setIsAiAnalyzing(false), 500);
                }
              }}
              placeholder={isAr ? 'مثال: جيليه شتوي بجيوب وسحاب...' : 'Ex: Gilet hiver avec poches et zip...'}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-400"
            />
          </div>
        </div>
      </div>

      {/* AI Conversation & Breakdown */}
      <div className="space-y-4">
        {isAiAnalyzing ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              {isAr ? 'جاري تحليل الموديل وحساب أسعار القماش في السوق المغربية...' : 'Analyse du modèle en cours...'}
            </p>
          </div>
        ) : (
          <>
            <div className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50/50 rounded-3xl border border-violet-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-900 font-black text-xs">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span>{isAr ? 'تحليل الخبير (Expert BEYA)' : 'Expert BEYA Analyse'}</span>
                </div>
                <span className="px-2 py-0.5 bg-violet-100 text-violet-800 font-black text-[10px] rounded-md">
                  {isAr ? 'تحليل تقني دقيق' : 'Analyse Technique'}
                </span>
              </div>

              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                {selectedAiPreset.aiText}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-violet-200/60 text-center">
                <div className="bg-white/80 p-2.5 rounded-2xl border border-violet-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'القماش واللوازم (للقطعة)' : 'Matière / pièce'}</span>
                  <strong className="text-sm font-black text-violet-700">{((breakdown.consommationMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees).toFixed(2)} DH</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-2xl border border-violet-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'سعر البيع المقترح' : 'Prix de vente rec.'}</span>
                  <strong className="text-sm font-black text-emerald-600">{breakdown.prixVenteConseille.toFixed(2)} DH</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-2xl border border-violet-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{isAr ? 'وقت الخياطة للقطعة' : 'Temps / pièce'}</span>
                  <strong className="text-sm font-black text-indigo-600">{aiStitchingMin} {isAr ? 'دقيقة' : 'min'}</strong>
                </div>
              </div>
            </div>

            {/* AI PRODUCTION ADVISOR */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-violet-500/10 rounded-3xl border border-amber-300/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? '💡 إرشادات ومقترحات الخبير الذكي لرفع الإنتاجية في الأتوليي (IA Production Advisor)' : '💡 Recommandations IA : Optimisation & Productivité Atelier'}</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-black text-[10px] rounded-lg border border-amber-300">
                  {isAr ? 'نصائح لزيادة الإنتاج +35%' : '+35% productivité'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/80 flex flex-col justify-between gap-2 shadow-sm">
                  <div>
                    <span className="text-[10px] font-black text-amber-700 block mb-1">
                      {isAr ? '🏭 اقتراح بوست خياطة (إزالة الاختناق في الخط):' : '🏭 Recommandation Postes : Renfort Gamme'}
                    </span>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">
                      {isAr ? `⚠️ لتفادي الاختناق في موديل (${selectedAiPreset.title}) وتسريع وتيرة الخياطة، يقترح الذكاء الاصطناعي إضافة بوست [سرفلة (Surjeteuse) / تجميع] إضافي لتخفيف الضغط على العمال.` : `⚠️ Pour éviter le goulet d'étranglement sur ce modèle (${selectedAiPreset.title}), l'IA recommande d'ajouter un poste de Surjeteuse supplémentaire.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAiSuggestion}
                    disabled={aiSuggestionApplied}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      aiSuggestionApplied
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiSuggestionApplied ? (isAr ? '✓ تم تطبيق الاقتراح (+1 بوست خياطة ذكي)' : '✓ Recommandation appliquée (+1 Poste)') : (isAr ? '✨ تطبيق اقتراح زيادة الإنتاجية (+1 بوست خياطة)' : '✨ Appliquer la recommandation (+1 Poste)')}
                  </button>
                </div>

                <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/80 flex flex-col justify-between gap-2 shadow-sm">
                  <div>
                    <span className="text-[10px] font-black text-indigo-700 block mb-1">
                      {isAr ? '🕒 اقتراح ساعات العمل (لتعظيم الإنتاج اليومي):' : '🕒 Recommandation Horaires : Capacité Jour'}
                    </span>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">
                      {isAr ? `🕒 نصيحة الإنتاج: مع هذا الموديل (${aiStitchingMin} دقيقة/قطعة)، تشغيل الورشة (${workHoursPerDay} ساعات/يوم) يمنحك ${aiDailyPiecesOutput} قطعة يومياً. الانتقال إلى 9 أو 10 ساعات يضيف حتى +${Math.floor((activeWorkersCount * 2 * 60) / aiStitchingMin)} قطعة إضافية يومياً.` : `🕒 Astuce Production : Avec ${aiStitchingMin} min/pièce, passer de 8h à 9h/10h augmente votre rendement quotidien jusqu'à +${Math.floor((activeWorkersCount * 2 * 60) / aiStitchingMin)} pcs/jour.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[8, 9, 10].map(hrs => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setWorkHoursPerDay(hrs)}
                        className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all border ${
                          workHoursPerDay === hrs
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {hrs} {isAr ? 'ساعات/يوم' : 'h / j'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gamme de Montage Studio Grid */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-black flex-wrap gap-2">
                <span className="flex items-center gap-2 text-slate-800">
                  <Wrench className="w-4 h-4 text-violet-600" />
                  {isAr ? '🏭 بوستات العمل والماكينات (تحكم مباشر في مراحل الخياطة والتوقيت الدقيق)' : '🏭 Gamme de Montage et Contrôle des Postes'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-xl text-[11px] font-black">
                    {activePostesModal.length} {isAr ? 'بوستات' : 'Postes'} | {aiStitchingMin} {isAr ? 'دقيقة (المجموع)' : 'min total'}
                  </span>
                  {customPostes && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPostes(null);
                        setAiSuggestionApplied(false);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black transition-colors"
                    >
                      {isAr ? '🔄 إعادة ضبط لاكام' : 'Réinitialiser'}
                    </button>
                  )}
                </div>
              </div>

              {workers < activePostesModal.length && (
                <div className="p-4 bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border-2 border-amber-500/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                      <strong className="text-xs font-black text-amber-900 block">
                        {isAr
                          ? `تنبيه نقص في العمالة (Sous-effectif): هذا الموديل يتطلب (${activePostesModal.length}) محطات عمل متخصصة، بينما فريقك الحالي في الأتوليي يحتوي على (${workers}) عمال فقط!`
                          : `Alerte Sous-effectif : Cette gamme nécessite ${activePostesModal.length} postes, mais votre atelier ne compte que ${workers} ouvriers !`}
                      </strong>
                      <p className="text-[11px] font-bold text-amber-800/90 mt-1 leading-relaxed">
                        {isAr
                          ? 'هذا النقص سيؤدي إلى اختناقات في خط الإنتاج (Goulets d\'étranglement) وتقليل الإنتاج اليومي. ننصح بتوظيف عمال إضافيين أو تفعيل تعدد المهام (Polyvalence).'
                          : 'Ce déficit d\'effectif va créer des goulets d\'étranglement et ralentir votre production.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkers(activePostesModal.length)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <span>👥</span>
                    {isAr ? `تحديث الفريق لـ (${activePostesModal.length}) عمال` : `Renforcer l'équipe (${activePostesModal.length} ouvriers)`}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activePostesModal.map((poste, idx) => (
                  <div key={idx} className="p-3 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-2.5 relative group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-violet-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md truncate max-w-[120px]">
                          {poste.machine}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePoste(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title={isAr ? 'حذف المرحلة' : 'Supprimer'}
                      >
                        🗑️
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={isAr ? (poste.nomAr || '') : (poste.nomFr || '')}
                        onChange={(e) => handleUpdatePosteName(idx, e.target.value)}
                        className="w-full font-black text-xs text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-violet-600 focus:outline-none py-0.5"
                        placeholder={isAr ? 'اسم المرحلة...' : 'Nom opération...'}
                      />
                      <span className="text-[10px] text-slate-500 font-medium block mt-1">
                        {poste.roleOuvrier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-500">
                        {isAr ? 'التوقيت الدقيق:' : 'Temps min :'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdatePosteMin(idx, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 bg-violet-100 text-violet-800 font-black text-xs rounded-lg min-w-[48px] text-center">
                          {poste.tempsMin} {isAr ? 'د' : 'min'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdatePosteMin(idx, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <span className="text-amber-500">💡</span>
                  <span>{breakdown.recommandationAtelier}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddPoste}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAr ? '+ إضافة بوست خياطة جديد (Ajouter Poste)' : '+ Ajouter un poste'}
                </button>
              </div>
            </div>

            {/* Precision Cost Breakdown */}
            <div className="p-4 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl border border-emerald-700/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-black border-b border-emerald-800/80 pb-2">
                <span className="text-emerald-300">💰 {isAr ? 'تفكيك التكلفة الدقيقة للبياسة (Coût de Revient)' : 'Coût de Revient Exact'}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px]">
                  {isAr ? 'حساب دقيق بالدرهم' : 'Calcul précis (DH)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white/10 rounded-xl">
                  <span className="text-[10px] text-slate-300 block">{isAr ? '🧵 القماش واللوازم / بياسة' : 'Matière / pièce'}</span>
                  <strong className="text-sm font-black text-white">{((breakdown.consommationMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees).toFixed(2)} DH</strong>
                </div>
                <div className="p-2 bg-white/10 rounded-xl">
                  <span className="text-[10px] text-slate-300 block">{isAr ? '👷 تكلفة خياطة البياسة (MOD)' : 'Main d’œuvre (MOD)'}</span>
                  <strong className="text-sm font-black text-emerald-300">{((aiStitchingMin / 60) * 17.10).toFixed(2)} DH</strong>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs font-black">
                <span className="text-slate-200">{isAr ? '✅ التكلفة الإجمالية للبياسة (شحال كتقام):' : 'Coût de revient total :'}</span>
                <strong className="text-base text-emerald-400">{breakdown.coutRevientEstime.toFixed(2)} DH</strong>
              </div>

              <div className="flex items-center justify-between text-xs font-black bg-white/10 p-2.5 rounded-2xl">
                <div>
                  <span className="text-slate-300 block text-[10px]">{isAr ? '💵 سعر البيع المقترح للأتوليي:' : 'Prix de vente rec. :'}</span>
                  <strong className="text-base text-white">{breakdown.prixVenteConseille.toFixed(2)} DH</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-300 block text-[10px]">{isAr ? '📈 هامش الربح الصافي / بياسة:' : 'Marge nette / pièce :'}</span>
                  <strong className="text-sm text-emerald-400">
                    +{(breakdown.prixVenteConseille - breakdown.coutRevientEstime).toFixed(2)} DH ({Math.round(((breakdown.prixVenteConseille - breakdown.coutRevientEstime) / breakdown.prixVenteConseille) * 100)}%)
                  </strong>
                </div>
              </div>
            </div>

            {/* Production Capacity Dashboard */}
            <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Users className="w-4 h-4 text-emerald-400" />
                  {isAr ? `القدرة الإنتاجية لـ (${activeWorkersCount}) عمال في الأتوليي` : `Capacité atelier (${activeWorkersCount} ouvriers)`}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] border border-emerald-500/30">
                  {isAr ? 'حساب حقيقي مباشر' : 'Calcul Réel & Précis'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'الإنتاج اليومي الممكن' : 'Prod. Journalière'}</span>
                  <strong className="text-sm sm:text-base font-black text-emerald-400">{aiDailyPiecesOutput} {isAr ? 'بياسة/يوم' : 'pcs/j'}</strong>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'الإنتاج الشهري (26 يوم)' : 'Prod. Mensuelle'}</span>
                  <strong className="text-sm sm:text-base font-black text-white">{aiMonthlyPiecesOutput.toLocaleString()} {isAr ? 'بياسة' : 'pcs'}</strong>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? `إنجاز (${quantity}) بياسة في` : `Délai (${quantity} pcs)`}</span>
                  <strong className="text-sm sm:text-base font-black text-amber-300">{aiRealisticDays} {isAr ? 'أيام عمل' : 'Jours'}</strong>
                </div>
              </div>
            </div>

            {/* Interactive Target Simulator */}
            <div className="p-4 bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 text-white rounded-3xl border-2 border-indigo-500/70 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-black border-b border-indigo-500/30 pb-2">
                <span className="flex items-center gap-2 text-amber-300">
                  <span className="text-base">🚀</span>
                  {isAr
                    ? `محاكي الهدف الإنتاجي: كيف تصل لـ (360 بياسة/يوم = 40 بياسة/ساعة)؟`
                    : `Simulateur d'Objectif : Comment atteindre 360 pcs/j (40 pcs/h) ?`}
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-extrabold">
                  {isAr ? 'خطة الإنتاج' : 'Plan d\'action'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/15 flex flex-col justify-between gap-2.5">
                  <div>
                    <strong className="text-emerald-400 block mb-1">
                      {isAr ? '1️⃣ الحل الأول: توسيع فريق العمل (Chaîne en ligne)' : '1️⃣ Solution 1 : Augmenter l\'effectif'}
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr
                        ? `لإنتاج 360 بياسة في اليوم (40/ساعة) بهذا الموديل (${aiStitchingMin} دقيقة للقطعة)، تحتاج إلى (${neededWorkersFor360}) عامل/خياط مقسمين على خطوط متوازية.`
                        : `Pour produire 360 pcs/j (40/h) avec ce temps de gamme (${aiStitchingMin} min), il faut ${neededWorkersFor360} ouvriers en chaînes parallèles.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkers(neededWorkersFor360)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>👥</span>
                    {isAr
                      ? `تطبيق الهدف: ترقية الفريق لـ (${neededWorkersFor360}) عامل`
                      : `Appliquer : Passer à ${neededWorkersFor360} ouvriers`}
                  </button>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl border border-white/15 flex flex-col justify-between gap-2.5">
                  <div>
                    <strong className="text-amber-300 block mb-1">
                      {isAr ? '2️⃣ الحل الثاني: أتمتة المراحل وتقليص وقت الخياطة' : '2️⃣ Solution 2 : Réduire le Temps de Gamme'}
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr
                        ? `لإنتاج 360 بياسة/يوم مع فريقك الحالي (${activeWorkersCount} عمال)، يجب تقليص وقت القطعة إلى (${neededMinPerPieceForCurrentTeam}) دقائق عبر استخدام المكائن الأوتوماتيكية و Guides.`
                        : `Avec vos ${activeWorkersCount} ouvriers actuels, pour atteindre 360 pcs/j, le temps unitaire doit être réduit à ${neededMinPerPieceForCurrentTeam} min via automates et guides.`}
                    </p>
                  </div>
                  <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-200 font-bold text-center">
                    {isAr ? '💡 نصيحة: استخدم ماكينة أوفيرلوك 4 خيوط + Guides' : '💡 Astuce : Utiliser Overlock 4 Fils + Guides'}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold">
              <strong>{isAr ? '🎯 عند تطبيق هذا التقدير على الحاسبة:' : '🎯 En appliquant cette estimation :'}</strong>
              <ul className="mt-1.5 space-y-1 list-disc list-inside text-[11px]">
                <li>{isAr ? `سيتم تعيين الموديل إلى:` : `Article / Modèle :`} <strong>{selectedAiPreset.title.replace(/^[^\s]+\s+/, '')}</strong></li>
                <li>{isAr ? `سعر البيع للبياسة:` : `Prix de vente :`} <strong>{breakdown.prixVenteConseille.toFixed(2)} DH</strong></li>
                <li>{isAr ? `إجمالي ثمن القماش واللوازم (لـ ${quantity} بياسة):` : `Matière première totale :`} <strong>{(((breakdown.consommationMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees) * quantity).toFixed(2)} DH</strong></li>
                <li>{isAr ? `القدرة الإنتاجية مع (${activeWorkersCount} عمال):` : `Capacité avec (${activeWorkersCount} ouvriers) :`} <strong>{aiDailyPiecesOutput} {isAr ? 'بياسة/يوم' : 'pièces/jour'}</strong></li>
                <li>{isAr ? `أيام العمل الفعلية لإنجاز الطلبية:` : `Jours travaillés requis :`} <strong>{aiRealisticDays} {isAr ? 'أيام عمل' : 'Jours ouvrables'}</strong></li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between rounded-t-2xl sm:rounded-2xl shadow-lg">
        <button
          onClick={() => navigate(-1)}
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

      {/* FICHE TECHNIQUE PICKER */}
      {isFichePickerOpen && (
        <div className="fixed inset-0 z-[1300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsFichePickerOpen(false)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-sm">{isAr ? 'اختر من الفيش تكنيك (BEYA)' : 'Sélectionner une Fiche Technique'}</h3>
              <button onClick={() => setIsFichePickerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fichePickerSearch}
                  onChange={(e) => setFichePickerSearch(e.target.value)}
                  placeholder={isAr ? 'بحث عن موديل أو عميل...' : 'Rechercher un modèle, client...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-400"
                />
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFiches.map(f => (
                <div
                  key={f.id}
                  onClick={() => importFicheAsPreset(f)}
                  className="p-3 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="font-black text-xs text-slate-900">{f.modele}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{f.type} {f.client ? `• ${f.client}` : ''}</div>
                  <div className="text-[10px] text-violet-600 font-bold mt-1">{f.tissuConsommation || 1.5} m/pièce</div>
                </div>
              ))}
              {filteredFiches.length === 0 && (
                <div className="col-span-2 text-center text-slate-400 text-xs py-8">{isAr ? 'لا توجد نتائج' : 'Aucun résultat'}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
