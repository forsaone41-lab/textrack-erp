import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, User, Shirt, Download, X, KeyRound, AlertTriangle, RefreshCw, Plus, Trash2 } from 'lucide-react';

const SAVED_MODELS_KEY = 'beya_tryon_saved_models';
const MAX_SAVED_MODELS = 12;

interface SavedModel {
  id: string;
  dataUrl: string;
  name: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadSavedModels(): SavedModel[] {
  try {
    const raw = localStorage.getItem(SAVED_MODELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const PRESET_MODEL_PROMPTS: { nameAr: string; nameFr: string; prompt: string }[] = [
  { nameAr: 'موديل رجالي - واقف أمامي', nameFr: 'Homme - face', prompt: 'A professional photorealistic full-body fashion photograph of a young adult man of average build, standing straight facing the camera, arms relaxed at his sides, plain light gray studio background, soft even studio lighting, wearing a simple plain white t-shirt and black pants, high resolution, no text, no watermark.' },
  { nameAr: 'موديل نسائي - واقفة أمامية', nameFr: 'Femme - face', prompt: 'A professional photorealistic full-body fashion photograph of a young adult woman of average build, standing straight facing the camera, arms relaxed at her sides, plain light gray studio background, soft even studio lighting, wearing a simple plain white t-shirt and black leggings, high resolution, no text, no watermark.' },
  { nameAr: 'موديل رجالي - جانبي 3/4', nameFr: 'Homme - 3/4', prompt: 'A professional photorealistic full-body fashion photograph of a young adult man, standing in a relaxed three-quarter turn pose, plain light gray studio background, soft studio lighting, wearing a simple plain white t-shirt and black pants, high resolution, no text, no watermark.' },
  { nameAr: 'موديل نسائي - جانبية 3/4', nameFr: 'Femme - 3/4', prompt: 'A professional photorealistic full-body fashion photograph of a young adult woman, standing in a relaxed three-quarter turn pose, plain light gray studio background, soft studio lighting, wearing a simple plain white t-shirt and black leggings, high resolution, no text, no watermark.' },
  { nameAr: 'موديل رجالي - أذرع مطوية', nameFr: 'Homme - bras croisés', prompt: 'A professional photorealistic full-body fashion photograph of a young adult man standing with arms crossed, confident pose, facing the camera, plain light gray studio background, soft studio lighting, wearing a simple plain white t-shirt and black pants, high resolution, no text, no watermark.' },
  { nameAr: 'موديل نسائي - يد على الخصر', nameFr: 'Femme - mains sur hanches', prompt: 'A professional photorealistic full-body fashion photograph of a young adult woman standing with one hand on her hip, confident pose, facing the camera, plain light gray studio background, soft studio lighting, wearing a simple plain white t-shirt and black leggings, high resolution, no text, no watermark.' },
  { nameAr: 'موديل رجالي - مشية', nameFr: 'Homme - marche', prompt: 'A professional photorealistic full-body fashion photograph of a young adult man captured mid-stride in a natural walking pose, side angle, plain light gray studio background, soft studio lighting, wearing a simple plain white t-shirt and black pants, high resolution, no text, no watermark.' },
  { nameAr: 'موديل نسائي - جالسة', nameFr: 'Femme - assise', prompt: 'A professional photorealistic full-body fashion photograph of a young adult woman sitting upright on a plain stool, facing the camera, plain light gray studio background, soft studio lighting, wearing a simple plain white t-shirt and black leggings, high resolution, no text, no watermark.' }
];

export default function BeyaVirtualTryOn() {
  const { isAr } = useLang();
  const navigate = useNavigate();

  const [personImage, setPersonImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);

  const [apiKeyInput, setApiKeyInput] = useState(
    (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key')) || ''
  );
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [presetGenProgress, setPresetGenProgress] = useState<{ current: number; total: number } | null>(null);
  const [presetGenError, setPresetGenError] = useState<string | null>(null);

  useEffect(() => {
    setSavedModels(loadSavedModels());
  }, []);

  const persistSavedModels = (models: SavedModel[]) => {
    setSavedModels(models);
    localStorage.setItem(SAVED_MODELS_KEY, JSON.stringify(models));
  };

  const addNewModel = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const entry: SavedModel = { id: `${Date.now()}`, dataUrl, name: `${isAr ? 'موديل' : 'Modèle'} ${savedModels.length + 1}` };
    const updated = [entry, ...savedModels].slice(0, MAX_SAVED_MODELS);
    persistSavedModels(updated);
    setPersonImage(dataUrl);
  };

  const removeSavedModel = (id: string) => {
    persistSavedModels(savedModels.filter(m => m.id !== id));
  };

  const renameSavedModel = (id: string, name: string) => {
    persistSavedModels(savedModels.map(m => m.id === id ? { ...m, name } : m));
  };

  const callGeminiImage = async (apiKey: string, parts: any[]) => {
    const callModel = (modelId: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
      })
    });

    let response = await callModel('gemini-2.5-flash-image');
    let data = await response.json();

    if (data.error && (data.error.code === 404 || (data.error.message || '').toLowerCase().includes('not found'))) {
      response = await callModel('gemini-2.5-flash-image-preview');
      data = await response.json();
    }

    if (data.error) {
      if (data.error.message?.includes('Quota exceeded') || data.error.message?.includes('429')) {
        throw new Error(isAr 
          ? 'تجاوزتي الحد المسموح به فالمجان (Quota Exceeded). تسنى شوية وعاود جرب، أو دخل مفتاح API جديد فيه الرصيد.' 
          : 'Quota dépassé. Veuillez patienter un peu ou utiliser une nouvelle clé API.');
      }
      throw new Error(data.error.message || 'Gemini API error');
    }

    const resultParts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = resultParts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
    if (imagePart) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    const textPart = resultParts.find((p: any) => p.text)?.text;
    throw new Error(textPart || (isAr ? 'لم يرجع النموذج أي صورة.' : "Le modèle n'a retourné aucune image."));
  };

  const generatePresetModels = async () => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (!apiKey) {
      setPresetGenError(isAr ? 'خاصك تدخل مفتاح Gemini API باش تولّد موديلات جاهزة.' : "Une clé Gemini API est requise pour générer des modèles.");
      setShowApiKeySettings(true);
      return;
    }

    setPresetGenError(null);
    setPresetGenProgress({ current: 0, total: PRESET_MODEL_PROMPTS.length });

    let current = [...savedModels];
    for (let i = 0; i < PRESET_MODEL_PROMPTS.length; i++) {
      const preset = PRESET_MODEL_PROMPTS[i];
      setPresetGenProgress({ current: i + 1, total: PRESET_MODEL_PROMPTS.length });
      try {
        const dataUrl = await callGeminiImage(apiKey, [{ text: preset.prompt }]);
        const entry: SavedModel = { id: `${Date.now()}-${i}`, dataUrl, name: isAr ? preset.nameAr : preset.nameFr };
        current = [entry, ...current].slice(0, MAX_SAVED_MODELS);
        persistSavedModels(current);
      } catch (err: any) {
        setPresetGenError(isAr
          ? `⚠️ توقف التوليد عند "${preset.nameAr}": ${err.message || 'خطأ غير معروف'}`
          : `⚠️ Arrêt à "${preset.nameFr}" : ${err.message || 'Erreur inconnue'}`);
        break;
      }
    }

    setPresetGenProgress(null);
  };

  const generateTryOn = async () => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (!apiKey) {
      setError(isAr ? 'خاصك تدخل مفتاح Gemini API باش تخدم هاد الميزة.' : "Une clé Gemini API est requise pour cette fonctionnalité.");
      setShowApiKeySettings(true);
      return;
    }
    if (!personImage || !garmentImage) {
      setError(isAr ? 'خاصك تختار صورة الموديل وصورة اللباس بجوج.' : 'Veuillez fournir la photo du modèle et celle du vêtement.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const personBase64 = personImage.split(',')[1];
      const personMime = personImage.split(';')[0].split(':')[1];
      const garmentBase64 = garmentImage.split(',')[1];
      const garmentMime = garmentImage.split(';')[0].split(':')[1];

      const prompt = isAr
        ? 'الصورة الأولى فيها شخص (الموديل). الصورة الثانية فيها قطعة لباس. دير تعديل للصورة الأولى بحيث يبان الشخص لابس بالضبط اللباس اللي فالصورة الثانية، عوض اللباس اللي كان لابسه. خاصك تحافظ بدقة على وجه الشخص، جسمه، وضعيته، والخلفية كما هي، وغادي تبدل غير اللباس. النتيجة خاصها تكون صورة واقعية وفوتوغرافية عالية الجودة.'
        : "La première image montre une personne (le modèle). La seconde image montre un vêtement. Modifie la première image pour que la personne porte exactement ce vêtement de la seconde image, à la place de ses vêtements actuels. Préserve fidèlement le visage, le corps, la pose de la personne et l'arrière-plan — ne change que les vêtements. Le résultat doit être une photo réaliste et de haute qualité.";

      const dataUrl = await callGeminiImage(apiKey, [
        { text: prompt },
        { inlineData: { data: personBase64, mimeType: personMime } },
        { inlineData: { data: garmentBase64, mimeType: garmentMime } }
      ]);
      setResultImage(dataUrl);
    } catch (err: any) {
      setError(isAr
        ? `⚠️ فشل التوليد: ${err.message || 'خطأ غير معروف'}`
        : `⚠️ Échec de la génération : ${err.message || 'Erreur inconnue'}`);
    } finally {
      setIsGenerating(false);
    }
  };

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
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-800">
              {isAr ? 'استوديو التجربة الافتراضية (Virtual Try-On)' : 'Studio Essayage Virtuel (Virtual Try-On)'}
            </h1>
            <p className="text-xs text-slate-500">
              {isAr ? 'لبّس أي لباس على موديل بالذكاء الاصطناعي (Gemini Image)' : "Habillez un modèle avec n'importe quel vêtement via l'IA (Gemini Image)"}
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
              ? 'نفس المفتاح المستعمل فـ AI Space وAtelier AI Expert. كيتخزن فقط فالمتصفح ديالك (localStorage).'
              : "Même clé que celle utilisée dans AI Space et Atelier AI Expert. Stockée uniquement dans votre navigateur (localStorage)."}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Split layout: settings/inputs (left) + preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT: garment + model selection */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-700">
              <Shirt className="w-4 h-4 text-violet-600" />
              {isAr ? '1. صورة اللباس' : '1. Photo du vêtement'}
            </label>
            <label className="block h-40 rounded-2xl border-2 border-dashed border-slate-300 hover:border-violet-400 transition-colors cursor-pointer relative overflow-hidden bg-slate-50">
              {garmentImage ? (
                <img src={garmentImage} alt="garment" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-bold">{isAr ? 'ارفع صورة اللباس' : 'Uploader la photo du vêtement'}</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setGarmentImage(await readFileAsDataUrl(file));
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="flex items-center gap-2 text-xs font-black text-slate-700">
                <User className="w-4 h-4 text-violet-600" />
                {isAr ? '2. اختر موديل' : '2. Sélectionner un modèle'}
              </label>
              <button
                type="button"
                onClick={generatePresetModels}
                disabled={!!presetGenProgress}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 disabled:opacity-60 text-violet-700 rounded-lg text-[10px] font-black transition-all"
              >
                {presetGenProgress ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {isAr ? `جاري التوليد ${presetGenProgress.current}/${presetGenProgress.total}` : `Génération ${presetGenProgress.current}/${presetGenProgress.total}`}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    {isAr ? 'ولّد موديلات AI' : 'Générer des modèles IA'}
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">
              {isAr ? 'اختار موديل رفعتيه من قبل، رفع صورة موديل جديد، أو ولّد موديلات جاهزة بالذكاء الاصطناعي' : 'Choisissez un modèle déjà uploadé, ajoutez-en un nouveau, ou générez des modèles prêts via IA'}
            </p>
            {presetGenError && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[10px] font-bold">
                {presetGenError}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 hover:border-violet-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-400 bg-slate-50">
                <Plus className="w-5 h-5" />
                <span className="text-[9px] font-bold">{isAr ? 'رفع جديد' : 'Ajouter'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await addNewModel(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {savedModels.map(model => (
                <div
                  key={model.id}
                  onClick={() => setPersonImage(model.dataUrl)}
                  className={`aspect-[3/4] rounded-xl overflow-hidden relative cursor-pointer border-2 transition-all group ${
                    personImage === model.dataUrl ? 'border-violet-600 ring-2 ring-violet-200' : 'border-transparent hover:border-violet-300'
                  }`}
                >
                  <img src={model.dataUrl} alt={model.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSavedModel(model.id); }}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title={isAr ? 'حذف' : 'Supprimer'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <input
                    type="text"
                    value={model.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => renameSavedModel(model.id, e.target.value)}
                    className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center outline-none py-0.5 px-1 truncate focus:bg-black/80"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateTryOn}
            disabled={isGenerating || !personImage || !garmentImage}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-violet-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isAr ? 'جاري التوليد... قد ياخد بضع ثواني' : 'Génération en cours... quelques secondes'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {isAr ? '✨ لبّس الموديل الآن' : '✨ Habiller le modèle'}
              </>
            )}
          </button>
        </div>

        {/* RIGHT: preview/result */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm lg:sticky lg:top-4">
          <label className="flex items-center justify-between text-xs font-black text-slate-700 mb-2">
            <span>{isAr ? 'النتيجة' : 'Résultat'}</span>
            {resultImage && (
              <a
                href={resultImage}
                download="beya-tryon-result.png"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-black transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                {isAr ? 'تحميل الصورة' : 'Télécharger'}
              </a>
            )}
          </label>
          <div className="aspect-[3/4] rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
            {resultImage ? (
              <img src={resultImage} alt="result" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400 px-6 space-y-3">
                <Sparkles className="w-8 h-8 mx-auto opacity-30" />
                <ol className="text-xs font-bold text-start space-y-1.5 max-w-[220px] mx-auto list-decimal list-inside">
                  <li>{isAr ? 'اختار / ارفع صورة اللباس' : 'Sélectionnez la photo du vêtement'}</li>
                  <li>{isAr ? 'اختار / ارفع صورة الموديل' : 'Sélectionnez la photo du modèle'}</li>
                  <li>{isAr ? 'اضغط "لبّس الموديل الآن"' : 'Cliquez sur "Habiller le modèle"'}</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
