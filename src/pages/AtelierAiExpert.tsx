import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Wand2, Upload, FileText, Users, Wrench, Plus, Search, X, KeyRound, AlertTriangle } from 'lucide-react';
import { loadData, FicheTechnique } from '../types';
import {
  AiPreset,
  PosteTravail,
  TechnicalOperationBreakdown,
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

function buildBreakdownFromParts(
  category: string,
  consommationMetrage: number,
  prixMetreEstime: number,
  fournituresEstimees: number,
  postesTravail: PosteTravail[],
  recommandationAtelier: string
): TechnicalOperationBreakdown {
  const totalMinutes = postesTravail.reduce((sum, p) => sum + (Number(p.tempsMin) || 0), 0);
  const modUnit = (totalMinutes / 60) * 17.10;
  const moiUnit = 4.50;
  const coutRevient = (consommationMetrage * prixMetreEstime) + fournituresEstimees + modUnit + moiUnit;
  const prixVente = Math.round((coutRevient * 1.65) * 100) / 100;
  return {
    categorie: category,
    tissuType: category,
    consommationMetrage,
    prixMetreEstime,
    fournituresEstimees,
    postesTravail,
    totalMinutesConfection: totalMinutes,
    coutRevientEstime: coutRevient,
    prixVenteConseille: prixVente,
    recommandationAtelier
  };
}

export default function AtelierAiExpert() {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state || {}) as NavState;

  const quantity = Math.max(1, navState.quantity || 50);

  const [selectedAiPreset, setSelectedAiPreset] = useState<AiPreset | null>(null);
  const [visionBreakdown, setVisionBreakdown] = useState<TechnicalOperationBreakdown | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [aiCustomText, setAiCustomText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [selectedModelCategory, setSelectedModelCategory] = useState<string | undefined>(navState.selectedModelCategory);
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(8);
  const [workers, setWorkers] = useState<number>(Math.max(1, navState.workers || 6));
  const [customPostes, setCustomPostes] = useState<PosteTravail[] | null>(navState.customPostes || null);

  const [fichesList, setFichesList] = useState<FicheTechnique[]>([]);
  const [isFichePickerOpen, setIsFichePickerOpen] = useState(false);
  const [fichePickerSearch, setFichePickerSearch] = useState('');

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  useEffect(() => {
    loadData<FicheTechnique>('fiches').then(res => {
      setFichesList(res && res.length > 0 ? res : DEFAULT_FICHES_TECHNIQUES);
    }).catch(() => setFichesList(DEFAULT_FICHES_TECHNIQUES));
    setApiKeyInput((import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key')) || '');
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
    setVisionBreakdown(null);
    setVisionError(null);
    setSelectedAiPreset(estimateFromFiche(f, isAr));
    setIsFichePickerOpen(false);
    setIsAiAnalyzing(true);
    setTimeout(() => setIsAiAnalyzing(false), 500);
  };

  const performAiVisionDeconstruction = async (title: string, dataUrl: string) => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (!apiKey) {
      setVisionError(isAr
        ? 'خاصك تدخل مفتاح Gemini API باش يخدم التحليل الحقيقي للصورة.'
        : "Une clé Gemini API est requise pour l'analyse réelle de l'image.");
      setShowApiKeySettings(true);
      return;
    }

    setVisionError(null);
    setIsAiAnalyzing(true);

    try {
      const base64Data = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].split(':')[1];

      const prompt = isAr
        ? `أنت خبير تقني خياطة وهندسة إنتاج (Ingénieur Méthodes) بخبرة 20 سنة في مصانع الخياطة المغربية. مهمتك تحليل صورة هذا الموديل بأقصى دقة ممكنة، بحال ما كيدير خبير حقيقي واقف قدام القطعة فالأتوليي.

قبل ما تجاوب، لاحظ بدقة فالصورة: نوع القماش ووزنه ولمعانه (قطن، كريب، جينز، صوف...)، عدد الأجزاء والقطع (وحدة ولا طقم)، نوع القصة (لاصقة، واسعة، Oversize)، التفاصيل (جيوب، سحاب، أزرار، تطريز، سفيفة، ياقة، أكمام)، ودرجة التعقيد الفعلية.

بناءً على هاد الملاحظة، أعطيني تفصيل تقني حقيقي بصيغة JSON فقط بدون أي نص إضافي وبهذا الشكل بالضبط:
{
  "category": "اسم عام للموديل",
  "consommationMetrage": 1.8,
  "prixMetreEstime": 18,
  "fournituresEstimees": 6,
  "recommandationAtelier": "نصيحة تقنية مختصرة ومفيدة للأتوليي بناءً على تعقيد الموديل",
  "postesTravail": [
    { "nomAr": "اسم المرحلة بالعربية", "nomFr": "Nom en français", "machine": "اسم الماكينة المناسبة", "tempsMin": 7, "roleOuvrier": "الوظيفة" }
  ]
}
- consommationMetrage: استهلاك القماش الحقيقي بالمتر لقطعة واحدة، لعرض ثوب 1.50م، حسب ما يظهر في الصورة (كمية القماش، الطول، الاتساع، عدد الطبقات).
- prixMetreEstime: ثمن المتر التقديري بالدرهم في السوق المغربية حسب نوع ومظهر القماش المرصود في الصورة بالضبط.
- fournituresEstimees: ثمن اللوازم (خيط، سحاب، أزرار، إبزيم، تطريز...) بالدرهم للقطعة حسب ما يظهر في الصورة.
- postesTravail: لائحة محطات العمل الحقيقية المطلوبة لخياطة هذا الموديل بالضبط كما يظهر في الصورة، بعدد واقعي حسب التعقيد الفعلي (لا تختصر ولا تبالغ). يجب ترتيبها بالترتيب الزمني الحقيقي لخط الإنتاج بالضبط كالتالي:
  1) الفصالة والقص (Coupe) دائماً أول مرحلة.
  2) التحضير (لصق فيزلين، تقوية) إذا كانت ضرورية.
  3) السرفلة/حماية الحواف (Surfilage) إذا لزم الأمر.
  4) التجميع والخياطة الرئيسية (Assemblage/Montage) بكل تفاصيلها الحقيقية (أكمام، جيوب، سحاب، ياقة، تطريز...).
  5) التشطيب (ثني الأطراف، أزرار، لمسات أخيرة).
  6) الكي والمراقبة النهائية (Repassage & Contrôle Qualité) دائماً آخر مرحلة.
أجب بـ JSON صحيح فقط، بدون أي نص قبله أو بعده.`
        : `Tu es un expert technique en confection et ingénieur méthodes avec 20 ans d'expérience dans les ateliers marocains. Ta mission est d'analyser la photo de ce modèle avec le maximum de précision possible, comme le ferait un vrai expert face à la pièce dans l'atelier.

Avant de répondre, observe précisément sur la photo : le type de tissu et son grammage/aspect (coton, crêpe, denim, laine...), le nombre de pièces (unique ou ensemble), la coupe (ajustée, ample, oversize), les détails (poches, zip, boutons, broderie, sfifa, col, manches), et le niveau de complexité réel.

Sur cette base, donne une analyse technique réelle au format JSON uniquement, exactement comme suit :
{
  "category": "Nom général du modèle",
  "consommationMetrage": 1.8,
  "prixMetreEstime": 18,
  "fournituresEstimees": 6,
  "recommandationAtelier": "Conseil technique court et utile pour l'atelier selon la complexité réelle du modèle",
  "postesTravail": [
    { "nomAr": "Nom de l'étape en arabe", "nomFr": "Nom de l'étape en français", "machine": "Machine appropriée", "tempsMin": 7, "roleOuvrier": "Rôle ouvrier" }
  ]
}
- consommationMetrage : consommation réelle de tissu en mètres pour une pièce, pour une laize de 1.50m, déduite de ce que montre la photo (quantité de tissu, longueur, ampleur, nombre de couches).
- prixMetreEstime : prix au mètre estimé en MAD sur le marché marocain selon le type et l'aspect exact du tissu observé.
- fournituresEstimees : coût des fournitures (fil, zip, boutons, broderie...) en MAD par pièce selon ce qui est visible sur la photo.
- postesTravail : liste réelle des postes de travail nécessaires pour confectionner exactement ce modèle, en nombre réaliste selon la complexité réelle (ni raccourci, ni exagéré). Ils doivent être ordonnés dans l'ordre chronologique réel de la chaîne de production, exactement comme suit :
  1) Coupe (toujours en premier).
  2) Préparation (thermocollage, renforts) si nécessaire.
  3) Surfilage / protection des bords si nécessaire.
  4) Assemblage et montage principal avec tous les détails réels (manches, poches, zip, col, broderie...).
  5) Finitions (ourlets, boutons, derniers détails).
  6) Repassage & Contrôle Qualité (toujours en dernier).
Réponds uniquement en JSON valide, sans texte avant ni après.`;

      const callGemini = () => fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }],
          generationConfig: { temperature: 0.3 }
        })
      });

      let response = await callGemini();
      let data = await response.json();

      if (data.error && (data.error.code === 503 || data.error.code === 404 || (data.error.message || '').includes('not found'))) {
        response = await callGemini();
        data = await response.json();
      }

      if (data.error) {
        throw new Error(data.error.message || 'Gemini API error');
      }

      const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText;
      const parsed = JSON.parse(jsonStr);

      const category: string = parsed.category || (isAr ? 'موديل' : 'Modèle');
      const consommationMetrage = Number(parsed.consommationMetrage) > 0 ? Number(parsed.consommationMetrage) : 1.5;
      const prixMetreEstime = Number(parsed.prixMetreEstime) > 0 ? Number(parsed.prixMetreEstime) : 16;
      const fournituresEstimees = Number(parsed.fournituresEstimees) >= 0 ? Number(parsed.fournituresEstimees) : 6;
      const recommandationAtelier: string = parsed.recommandationAtelier || '';

      let postesTravail: PosteTravail[] = Array.isArray(parsed.postesTravail)
        ? parsed.postesTravail
            .filter((p: any) => p && (p.nomAr || p.nomFr))
            .map((p: any) => ({
              nomAr: p.nomAr || p.nomFr || '',
              nomFr: p.nomFr || p.nomAr || '',
              machine: p.machine || (isAr ? 'ماكينة خياطة' : 'Machine à coudre'),
              tempsMin: Math.max(1, Number(p.tempsMin) || 5),
              roleOuvrier: p.roleOuvrier || (isAr ? 'خياط' : 'Ouvrier')
            }))
        : [];

      if (postesTravail.length === 0) {
        postesTravail = getGarmentTechnicalBreakdown(category).postesTravail;
      }

      const builtBreakdown = buildBreakdownFromParts(category, consommationMetrage, prixMetreEstime, fournituresEstimees, postesTravail, recommandationAtelier);
      const totalMinutes = builtBreakdown.totalMinutesConfection;

      setSelectedModelCategory(undefined);
      setCustomPostes(postesTravail);
      setWorkers(postesTravail.length);
      setVisionBreakdown(builtBreakdown);

      setSelectedAiPreset({
        title: `📷 ${category}`,
        desc: category,
        aiText: isAr
          ? `${category}. استهلاك القماش المقدر من الصورة ${consommationMetrage.toFixed(2)} متر بثمن ${prixMetreEstime.toFixed(2)} درهم/متر. هذا الموديل يتطلب ${postesTravail.length} محطات عمل بمجموع ${totalMinutes} دقيقة للقطعة الواحدة.`
          : `${category}. Consommation de tissu estimée depuis la photo : ${consommationMetrage.toFixed(2)}m à ${prixMetreEstime.toFixed(2)} DH/m. Ce modèle nécessite ${postesTravail.length} postes de travail pour un total de ${totalMinutes} min/pièce.`,
        recommendedPrice: builtBreakdown.prixVenteConseille,
        materialPerPiece: (consommationMetrage * prixMetreEstime) + fournituresEstimees,
        recommendedDays: 2,
        photo: dataUrl,
        stitchingMin: totalMinutes
      });
    } catch (err: any) {
      setVisionError(isAr
        ? `⚠️ فشل التحليل الحقيقي: ${err.message || 'خطأ غير معروف'}`
        : `⚠️ Échec de l'analyse réelle : ${err.message || 'Erreur inconnue'}`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleUploadModelImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      performAiVisionDeconstruction(cleanName, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const getActiveBreakdown = (): TechnicalOperationBreakdown =>
    visionBreakdown || getGarmentTechnicalBreakdown(selectedAiPreset?.title || '', undefined, undefined, selectedModelCategory);

  const handleUpdatePosteName = (idx: number, newName: string) => {
    const breakdown = getActiveBreakdown();
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current[idx]) {
      current[idx] = { ...current[idx], nomAr: newName, nomFr: newName };
      setCustomPostes(current);
    }
  };

  const handleUpdatePosteMin = (idx: number, delta: number) => {
    const breakdown = getActiveBreakdown();
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current[idx]) {
      const updatedTime = Math.max(1, (Number(current[idx].tempsMin) || 1) + delta);
      current[idx] = { ...current[idx], tempsMin: updatedTime };
      setCustomPostes(current);
    }
  };

  const handleDeletePoste = (idx: number) => {
    const breakdown = getActiveBreakdown();
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current.length <= 1) return;
    current.splice(idx, 1);
    setCustomPostes(current);
  };

  const handleTogglePosteExcluded = (idx: number) => {
    const breakdown = getActiveBreakdown();
    const current = customPostes ? [...customPostes] : [...breakdown.postesTravail];
    if (current[idx]) {
      current[idx] = { ...current[idx], excluded: !current[idx].excluded };
      setCustomPostes(current);
    }
  };

  const handleAddPoste = () => {
    const breakdown = getActiveBreakdown();
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

  const applyAiEstimation = (preset: AiPreset) => {
    const breakdown = getActiveBreakdown();
    const activePostesModal = (customPostes && customPostes.length > 0) ? customPostes : breakdown.postesTravail;
    const basePostesCount = breakdown.postesTravail.length;
    const basePostesMin = activePostesModal.slice(0, basePostesCount).filter(p => !p.excluded).reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
    const aiStitchingMin = basePostesMin || breakdown.totalMinutesConfection || preset.stitchingMin || 35;
    const extraPostesCount = Math.max(0, activePostesModal.length - basePostesCount);
    const activeWorkersCount = Math.max(1, workers + extraPostesCount);
    const aiDailyPiecesOutput = Math.max(1, Math.floor((activeWorkersCount * workHoursPerDay * 60) / aiStitchingMin));
    const aiRealisticDays = Math.max(1, Math.ceil(quantity / aiDailyPiecesOutput));

    localStorage.setItem('beya_ai_gamme_pilot_export', JSON.stringify({
      itemName: preset.title.replace(/^[^\s]+\s+/, ''),
      pricePerPiece: breakdown.prixVenteConseille || preset.recommendedPrice,
      materials: Math.round(((breakdown.consommationMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees) * quantity),
      days: aiRealisticDays,
      workers: activeWorkersCount,
      customPostes: visionBreakdown ? (customPostes || breakdown.postesTravail) : null
    }));

    navigate('/atelier-calculator');
  };

  const breakdown = selectedAiPreset ? getActiveBreakdown() : null;
  const activePostesModal = breakdown ? ((customPostes && customPostes.length > 0) ? customPostes : breakdown.postesTravail) : [];
  const basePostesCount = breakdown ? breakdown.postesTravail.length : 0;
  const basePostesMin = activePostesModal.slice(0, basePostesCount).reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
  const aiStitchingMin = breakdown ? (basePostesMin || breakdown.totalMinutesConfection || selectedAiPreset?.stitchingMin || 35) : 0;
  const extraPostesCount = Math.max(0, activePostesModal.length - basePostesCount);
  const activeWorkersCount = Math.max(1, workers + extraPostesCount);
  const aiDailyPiecesOutput = Math.max(1, Math.floor((activeWorkersCount * workHoursPerDay * 60) / (aiStitchingMin || 1)));
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
              {isAr ? 'تحليل حقيقي للموديل أو الصورة عبر Gemini Vision وإعطاء تقدير التكلفة وسعر القماش في السوق المغربية' : 'Analyse réelle du modèle via Gemini Vision et estimation du coût matière en DH'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowApiKeySettings(v => !v)}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
          title={isAr ? 'إعدادات مفتاح Gemini API' : 'Paramètres clé Gemini API'}
        >
          <KeyRound className="w-5 h-5" />
        </button>
      </div>

      {showApiKeySettings && (
        <div className="p-4 bg-white rounded-2xl border border-indigo-200 shadow-sm space-y-2">
          <label className="block text-xs font-black text-slate-700">
            {isAr ? 'مفتاح Google Gemini API الخاص بك:' : 'Votre clé Google Gemini API :'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              dir="ltr"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
            <button
              onClick={() => {
                if (apiKeyInput.trim()) localStorage.setItem('beya_gemini_api_key', apiKeyInput.trim());
                setShowApiKeySettings(false);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-all"
            >
              {isAr ? 'حفظ' : 'Enregistrer'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
            {isAr
              ? 'كيتخزن المفتاح فقط فالمتصفح ديالك (localStorage)، ماشي كيتبعث لأي سيرفر آخر.'
              : 'La clé est stockée uniquement dans votre navigateur (localStorage), jamais envoyée à un autre serveur.'}
          </p>
        </div>
      )}

      {/* Model source selector */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-black text-slate-700 mb-2">
          {isAr ? 'اختَر طريقة التحليل:' : "Choisissez une méthode d'analyse :"}
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFichePickerOpen(true)}
            className="px-3 py-1.5 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border border-violet-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            {isAr ? '📋 من الفيش تكنيك (BEYA)' : '📋 Fiche Technique (BEYA)'}
          </button>
          <label className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30 active:scale-95 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {isAr ? '📷 تحليل صورة حقيقي (Gemini Vision)' : '📷 Analyse Photo Réelle (Gemini Vision)'}
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
                  setVisionBreakdown(null);
                  setVisionError(null);
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

      {visionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{visionError}</span>
        </div>
      )}

      {/* AI Conversation & Breakdown */}
      {(isAiAnalyzing || (selectedAiPreset && breakdown)) && (
        <div className="space-y-4">
          {isAiAnalyzing ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                {isAr ? 'جاري تحليل الموديل وحساب أسعار القماش في السوق المغربية...' : 'Analyse du modèle en cours...'}
              </p>
            </div>
          ) : selectedAiPreset && breakdown && (
            <>
              <div className="p-3.5 bg-gradient-to-br from-violet-50 to-indigo-50/50 rounded-2xl border border-violet-200/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-violet-900 font-black text-[11px]">{isAr ? 'تحليل الخبير (Expert BEYA)' : 'Expert BEYA Analyse'}</span>
                  <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 font-black text-[9px] rounded-md shrink-0">
                    {visionBreakdown ? (isAr ? 'تحليل حقيقي بالصورة' : 'Analyse réelle (photo)') : (isAr ? 'تقدير يدوي' : 'Estimation manuelle')}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {selectedAiPreset.aiText}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-violet-200/60 text-center">
                  <div className="bg-white/80 p-2 rounded-xl border border-violet-100">
                    <span className="text-[9px] font-bold text-slate-500 block">{isAr ? 'القماش واللوازم' : 'Matière / pièce'}</span>
                    <strong className="text-xs font-black text-violet-700">{((breakdown.consommationMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees).toFixed(2)} DH</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-violet-100">
                    <span className="text-[9px] font-bold text-slate-500 block">{isAr ? 'سعر البيع المقترح' : 'Prix de vente rec.'}</span>
                    <strong className="text-xs font-black text-emerald-600">{breakdown.prixVenteConseille.toFixed(2)} DH</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-violet-100">
                    <span className="text-[9px] font-bold text-slate-500 block">{isAr ? 'وقت الخياطة' : 'Temps / pièce'}</span>
                    <strong className="text-xs font-black text-indigo-600">{aiStitchingMin} {isAr ? 'دقيقة' : 'min'}</strong>
                  </div>
                </div>
              </div>

              {/* Gamme de Montage Studio Grid — the main focus of this page */}
              <div className="p-5 bg-white rounded-3xl border-2 border-violet-300 shadow-lg shadow-violet-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-black flex-wrap gap-2">
                  <span className="flex items-center gap-2 text-slate-800">
                    <Wrench className="w-4 h-4 text-violet-600" />
                    {isAr ? '🏭 بوستات العمل والماكينات (تحكم مباشر في مراحل الخياطة والتوقيت الدقيق)' : '🏭 Gamme de Montage et Contrôle des Postes'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-violet-100 text-violet-800 rounded-xl text-[11px] font-black">
                      {activePostesModal.length} {isAr ? 'بوستات' : 'Postes'} | {aiStitchingMin} {isAr ? 'دقيقة (المجموع)' : 'min total'}
                      {activePostesModal.some(p => p.excluded) && (
                        <span className="text-amber-700"> · {activePostesModal.filter(p => p.excluded).length} {isAr ? 'مستثناة' : 'exclu(s)'}</span>
                      )}
                    </span>
                    {customPostes && (
                      <button
                        type="button"
                        onClick={() => setCustomPostes(null)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black transition-colors"
                      >
                        {isAr ? '🔄 إعادة ضبط لاكام' : 'Réinitialiser'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-black text-slate-600">
                    {isAr ? '🕒 ساعات العمل في اليوم:' : '🕒 Heures de travail / jour :'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[8, 9, 10].map(hrs => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setWorkHoursPerDay(hrs)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all border ${
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
                    <div key={idx} className={`p-3 bg-gradient-to-br from-slate-50 to-white rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-2.5 relative group ${poste.excluded ? 'border-amber-300 opacity-60' : 'border-slate-200/80'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-xl bg-violet-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md truncate max-w-[120px]">
                            {poste.machine}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePosteExcluded(idx)}
                            className={`p-1 rounded-lg transition-colors ${poste.excluded ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                            title={isAr ? 'استثناء من الحساب الإجمالي (يتحسب بوحدو)' : "Exclure du calcul total (compté séparément)"}
                          >
                            {poste.excluded ? '↩️' : '🚫'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePoste(idx)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            title={isAr ? 'حذف المرحلة' : 'Supprimer'}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {poste.excluded && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 self-start">
                          {isAr ? '⚠️ مستثناة من المجموع — تتحسب بوحدها' : '⚠️ Exclu du total — calculé séparément'}
                        </span>
                      )}

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
      )}

      {!isAiAnalyzing && !selectedAiPreset && !visionError && (
        <div className="py-16 text-center text-slate-400">
          <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-bold">{isAr ? 'اختر طريقة تحليل من فوق باش تبدا' : 'Choisissez une méthode ci-dessus pour commencer'}</p>
        </div>
      )}

      {/* Footer actions */}
      {selectedAiPreset && breakdown && (
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
      )}

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
                  className="p-3 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-2xl transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                    {f.photo ? (
                      <img src={f.photo} alt={f.modele} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-xs text-slate-900 truncate">{f.modele}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{f.type} {f.client ? `• ${f.client}` : ''}</div>
                    <div className="text-[10px] text-violet-600 font-bold mt-1">{f.tissuConsommation || 1.5} m/pièce</div>
                  </div>
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
