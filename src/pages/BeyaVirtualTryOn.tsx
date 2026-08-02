import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, User, Shirt, Download, X, KeyRound, AlertTriangle, RefreshCw } from 'lucide-react';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BeyaVirtualTryOn() {
  const { isAr } = useLang();
  const navigate = useNavigate();

  const [personImage, setPersonImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiKeyInput, setApiKeyInput] = useState(
    (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key')) || ''
  );
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  const generateTryOn = async () => {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (!apiKey) {
      setError(isAr ? 'خاصك تدخل مفتاح Gemini API باش تخدم هاد الميزة.' : "Une clé Gemini API est requise pour cette fonctionnalité.");
      setShowApiKeySettings(true);
      return;
    }
    if (!personImage || !garmentImage) {
      setError(isAr ? 'خاصك ترفع صورة الموديل وصورة اللباس بجوج.' : 'Veuillez fournir la photo du modèle et celle du vêtement.');
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

      const callModel = (modelId: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: personBase64, mimeType: personMime } },
              { inlineData: { data: garmentBase64, mimeType: garmentMime } }
            ]
          }],
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
        throw new Error(data.error.message || 'Gemini API error');
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart) {
        setResultImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
      } else {
        const textPart = parts.find((p: any) => p.text)?.text;
        throw new Error(textPart || (isAr ? 'لم يرجع النموذج أي صورة.' : "Le modèle n'a retourné aucune image."));
      }
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

      {/* Two upload zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-slate-700">
            <User className="w-4 h-4 text-violet-600" />
            {isAr ? '1. صورة الموديل (الشخص)' : '1. Photo du modèle (personne)'}
          </label>
          <label className="block aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 hover:border-violet-400 transition-colors cursor-pointer relative overflow-hidden bg-slate-50">
            {personImage ? (
              <img src={personImage} alt="model" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-bold">{isAr ? 'ارفع صورة الموديل' : 'Uploader la photo du modèle'}</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setPersonImage(await readFileAsDataUrl(file));
                e.target.value = '';
              }}
            />
          </label>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-slate-700">
            <Shirt className="w-4 h-4 text-violet-600" />
            {isAr ? '2. صورة اللباس' : '2. Photo du vêtement'}
          </label>
          <label className="block aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 hover:border-violet-400 transition-colors cursor-pointer relative overflow-hidden bg-slate-50">
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

      {/* Result */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
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
        <div className="aspect-[3/4] max-w-sm mx-auto rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          {resultImage ? (
            <img src={resultImage} alt="result" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-slate-400 px-6">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">
                {isAr ? 'ارفع صورة الموديل واللباس وضغط "لبّس الموديل" باش تبان النتيجة هنا' : 'Uploadez les deux photos puis cliquez sur "Habiller le modèle"'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
