import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, MessageSquare, Ruler, Scissors, DollarSign, Camera, RefreshCw, Send, Image as ImageIcon, ChevronRight, Zap, Info, Trash2, Package, X, Eye } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useNavigate } from 'react-router-dom';
import { saveRecord, genId, FicheTechnique, loadLeads, Lead } from '../types';

const STANDARD_MESURES: Record<string, { nom: string; valeurs: Record<string, number> }[]> = {
  Robe: [
    { nom: 'الصدر (Poitrine)', valeurs: { S: 88, M: 92, L: 96, XL: 100, XXL: 104 } },
    { nom: 'الخصر (Taille)', valeurs: { S: 70, M: 74, L: 78, XL: 82, XXL: 86 } },
    { nom: 'الورك (Hanches)', valeurs: { S: 94, M: 98, L: 102, XL: 106, XXL: 110 } },
    { nom: 'الطول (Longueur)', valeurs: { S: 138, M: 140, L: 142, XL: 144, XXL: 146 } }
  ],
  Caftan: [
    { nom: 'الصدر (Poitrine)', valeurs: { S: 92, M: 96, L: 100, XL: 104, XXL: 108 } },
    { nom: 'الكتف (Épaules)', valeurs: { S: 38, M: 39, L: 40, XL: 41, XXL: 42 } },
    { nom: 'الورك (Hanches)', valeurs: { S: 102, M: 106, L: 110, XL: 114, XXL: 118 } },
    { nom: 'الطول (Longueur)', valeurs: { S: 145, M: 147, L: 149, XL: 151, XXL: 153 } }
  ],
  Djellaba: [
    { nom: 'الصدر (Poitrine)', valeurs: { S: 94, M: 98, L: 102, XL: 106, XXL: 110 } },
    { nom: 'الكتف (Épaules)', valeurs: { S: 39, M: 40, L: 41, XL: 42, XXL: 43 } },
    { nom: 'الورك (Hanches)', valeurs: { S: 104, M: 108, L: 112, XL: 116, XXL: 120 } },
    { nom: 'الطول (Longueur)', valeurs: { S: 135, M: 137, L: 139, XL: 141, XXL: 143 } }
  ],
  Chemise: [
    { nom: 'الصدر (Poitrine)', valeurs: { S: 90, M: 94, L: 98, XL: 102, XXL: 106 } },
    { nom: 'الكتف (Épaules)', valeurs: { S: 38, M: 40, L: 42, XL: 44, XXL: 46 } },
    { nom: 'الطول (Longueur)', valeurs: { S: 68, M: 70, L: 72, XL: 74, XXL: 76 } },
    { nom: 'الكم (Manche)', valeurs: { S: 58, M: 59, L: 60, XL: 61, XXL: 62 } }
  ],
  Pantalon: [
    { nom: 'الخصر (Taille)', valeurs: { S: 72, M: 76, L: 80, XL: 84, XXL: 88 } },
    { nom: 'الورك (Hanches)', valeurs: { S: 92, M: 96, L: 100, XL: 104, XXL: 108 } },
    { nom: 'الطول (Longueur)', valeurs: { S: 100, M: 102, L: 104, XL: 106, XXL: 108 } }
  ]
};
const TechnicalDrawing2D = ({ category, mesures, isAr, selectedSize = 'M' }: { category: string; mesures: any[]; isAr: boolean; selectedSize?: string }) => {
  const isTop = ['Chemise', 'T-Shirt', 'Veste'].includes(category);
  const isBottom = ['Pantalon', 'Short', 'Jupe'].includes(category);
  const isFull = ['Robe', 'Caftan', 'Djellaba', 'Manteau'].includes(category) || (!isTop && !isBottom);

  const getVal = (keywords: string[]) => {
    const m = mesures.find(m => keywords.some(k => m.nom.toLowerCase().includes(k)));
    return m && m.valeurs ? m.valeurs[selectedSize] || '-' : '-';
  };

  const chest = getVal(['صدر', 'poitrine']);
  const shoulder = getVal(['كتف', 'épaule', 'epaules']);
  const length = getVal(['طول', 'longueur']);
  const sleeve = getVal(['كم', 'manche']);
  const waist = getVal(['خصر', 'taille']);
  const hips = getVal(['ورك', 'hanche']);

  return (
    <div className="relative w-full h-80 bg-slate-50/50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden group">
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black text-indigo-500 uppercase tracking-widest shadow-sm border border-indigo-100 z-10 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        {isAr ? 'رسم تقني 2D مباشر' : 'Croquis Technique 2D'}
      </div>
      
      <svg viewBox="0 0 400 400" className="w-full h-full opacity-90 stroke-indigo-900 fill-none transition-all duration-700 group-hover:scale-105" style={{ strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
        
        {(isTop || isFull) && (
          <g className="animate-in fade-in duration-1000">
            <path d={isFull ? "M 150 50 C 180 50, 220 50, 250 50 L 300 120 L 280 200 L 250 180 L 250 350 L 150 350 L 150 180 L 120 200 L 100 120 Z" : "M 150 50 C 180 50, 220 50, 250 50 L 300 120 L 280 200 L 250 180 L 250 250 L 150 250 L 150 180 L 120 200 L 100 120 Z"} className="fill-white stroke-slate-300" strokeWidth="3" />
            
            <line x1="150" y1="35" x2="250" y2="35" strokeDasharray="4 4" className="stroke-rose-400" />
            <text x="200" y="25" className="text-[12px] fill-rose-600 font-bold" textAnchor="middle" stroke="none">{shoulder} cm</text>
            
            <line x1="140" y1="120" x2="260" y2="120" strokeDasharray="4 4" className="stroke-emerald-500" />
            <text x="200" y="115" className="text-[12px] fill-emerald-600 font-bold" textAnchor="middle" stroke="none">{chest} cm</text>
            
            <line x1="260" y1="60" x2="295" y2="115" strokeDasharray="4 4" className="stroke-amber-500" />
            <text x="300" y="80" className="text-[12px] fill-amber-600 font-bold" textAnchor="start" stroke="none">{sleeve} cm</text>
            
            <line x1="110" y1="50" x2="110" y2={isFull ? "350" : "250"} strokeDasharray="4 4" className="stroke-indigo-400" />
            <text x="100" y={isFull ? "200" : "150"} className="text-[12px] fill-indigo-600 font-bold" textAnchor="end" stroke="none">{length} cm</text>
            
            {isFull && hips !== '-' && (
              <>
                <line x1="150" y1="200" x2="250" y2="200" strokeDasharray="4 4" className="stroke-purple-500" />
                <text x="200" y="195" className="text-[12px] fill-purple-600 font-bold" textAnchor="middle" stroke="none">{hips} cm</text>
              </>
            )}
          </g>
        )}

        {isBottom && (
          <g className="animate-in fade-in duration-1000">
            <path d="M 160 50 L 240 50 L 260 120 L 250 350 L 200 350 L 200 150 L 150 350 L 100 350 L 140 120 Z" className="fill-white stroke-slate-300" strokeWidth="3" />
            
            <line x1="160" y1="40" x2="240" y2="40" strokeDasharray="4 4" className="stroke-rose-400" />
            <text x="200" y="30" className="text-[12px] fill-rose-600 font-bold" textAnchor="middle" stroke="none">{waist} cm</text>

            <line x1="140" y1="120" x2="260" y2="120" strokeDasharray="4 4" className="stroke-purple-500" />
            <text x="200" y="110" className="text-[12px] fill-purple-600 font-bold" textAnchor="middle" stroke="none">{hips} cm</text>
            
            <line x1="80" y1="50" x2="80" y2="350" strokeDasharray="4 4" className="stroke-indigo-400" />
            <text x="70" y="200" className="text-[12px] fill-indigo-600 font-bold" textAnchor="end" stroke="none">{length} cm</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default function AISpace() {
  const { isAr } = useLang();
  const [aiLangOverride, setAiLangOverride] = useState<'ar' | 'fr' | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | {
    category: string;
    consumption: string;
    complexity: string;
    components: string[];
    costEstimate: string;
    pieces?: {
      name: string;
      consumption: string;
      fit: string;
      complexity: string;
      costEstimate: string;
      components: string[];
      mesures: { nom: string; valeurs: Record<string, number> }[];
      fabricSuggested?: string;
      fabricAlternatives?: { name: string; pros: string; cons: string }[];
    }[];
    rawAnalysis?: string;
    fabricSuggested?: string;
    fabricAlternatives?: { name: string; pros: string; cons: string }[];
  }>(null);
  const [activePieceIdx, setActivePieceIdx] = useState(0);
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: isAr ? 'أنا مساعدك الذكي BEYA AI. ارفع صورة موديل لأقوم بتحليلها لك.' : 'Bonjour ! Je suis votre assistant BEYA AI. Téléchargez la photo d\'un modèle pour que je puisse l\'analyser.' }
  ]);
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const [exporting, setExporting] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const navigate = useNavigate();

  // Gemini API integration
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Custom Measurements States
  const [selectedCategory, setSelectedCategory] = useState<'Robe' | 'Caftan' | 'Djellaba' | 'Chemise' | 'Pantalon'>('Robe');
  const [customMesures, setCustomMesures] = useState<any[]>(() => JSON.parse(JSON.stringify(STANDARD_MESURES['Robe'])));
  const [selectedTailles] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);

  // Prospects Integration States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  useEffect(() => {
    setApiKeyInput(localStorage.getItem('beya_gemini_api_key') || '');
    loadLeads().then(data => {
      setLeads(data.filter(l => l.photo));
    });
  }, []);

  const selectLeadModel = (lead: Lead) => {
    if (lead.photo) {
      setImage(lead.photo);
      setAnalysisResult(null);

      const matchedCat = (['Robe', 'Caftan', 'Djellaba', 'Chemise', 'Pantalon'] as const).find(
        c => lead.type.toLowerCase().includes(c.toLowerCase()) ||
          (c === 'Robe' && lead.type.toLowerCase().includes('robe')) ||
          (c === 'Caftan' && lead.type.toLowerCase().includes('caftan')) ||
          (c === 'Djellaba' && lead.type.toLowerCase().includes('djellaba')) ||
          (c === 'Chemise' && lead.type.toLowerCase().includes('chemise')) ||
          (c === 'Pantalon' && lead.type.toLowerCase().includes('pantalon'))
      );

      if (matchedCat) {
        setSelectedCategory(matchedCat);
        setCustomMesures(JSON.parse(JSON.stringify(STANDARD_MESURES[matchedCat])));
      }

      setChat(prev => [...prev, {
        role: 'ai',
        text: isAr
          ? `✅ تم تحميل صورة طلب الزبون ${lead.name} (${lead.type}). اضغط الآن على "بدء التحليل" لتوليد البطاقة التقنية الذكية!`
          : `✅ Image chargée depuis la demande de ${lead.name} (${lead.type}). Cliquez sur "Lancer l'analyse" pour générer la fiche technique !`
      }]);
    }
    setShowLeadsModal(false);
  };

  const handleCategoryChange = (cat: 'Robe' | 'Caftan' | 'Djellaba' | 'Chemise' | 'Pantalon') => {
    setSelectedCategory(cat);
    setCustomMesures(JSON.parse(JSON.stringify(STANDARD_MESURES[cat])));
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        category: cat === 'Robe' ? (isAr ? 'فستان عصري (Robe)' : 'Robe Moderne') :
          cat === 'Caftan' ? (isAr ? 'قفطان مغربي (Caftan)' : 'Caftan Marocain') :
            cat === 'Djellaba' ? (isAr ? 'جلابة عصرية (Djellaba)' : 'Djellaba Moderne') :
              cat === 'Chemise' ? (isAr ? 'قميص كلاسيكي (Chemise)' : 'Chemise Classique') :
                (isAr ? 'سروال عصري (Pantalon)' : 'Pantalon Moderne')
      });
    }
  };

  const handleCellChange = (rowIndex: number, size: string, value: number) => {
    const updated = [...customMesures];
    updated[rowIndex].valeurs[size] = value;
    setCustomMesures(updated);
  };

  const exportToFicheTechnique = async () => {
    if (!analysisResult) return;
    setExporting(true);

    try {
      const newFT: FicheTechnique = {
        id: genId(),
        modele: analysisResult.category,
        description: isAr
          ? `تم إنشاؤها تلقائياً بواسطة BEYA AI. المكونات المقترحة: ${analysisResult.components.join(', ')}`
          : `Généré automatiquement par BEYA AI. Composants suggérés: ${analysisResult.components.join(', ')}`,
        client: isAr ? 'اقتراح الذكاء الاصطناعي' : 'Suggestion IA',
        tailles: selectedTailles,
        mesures: customMesures,
        tissuConsommation: parseFloat(analysisResult.consumption.split(' - ')[0]) || 2.50,
        type: 'creations',
        createdAt: new Date().toISOString().split('T')[0],
        photo: image || undefined
      };

      await saveRecord('fiches', newFT);

      alert(isAr
        ? `✅ تم بنجاح تصدير الموديل "${analysisResult.category}" إلى البطاقات التقنية! يمكنك الآن إكمال الباطرون هناك.`
        : `✅ Modèle "${analysisResult.category}" exporté avec succès vers les Fiches Techniques !`
      );

      navigate('/fiches-techniques');
    } catch (err) {
      console.error("Export Error:", err);
      alert(isAr ? "حدث خطأ أثناء التصدير" : "Erreur lors de l'exportation");
    } finally {
      setExporting(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    setActivePieceIdx(0);

    const apiKey = localStorage.getItem('beya_gemini_api_key');
    if (!apiKey) {
      // Fallback: simulated analysis
      setTimeout(() => {
        setAnalysisResult({
          category: isAr ? 'فستان عصري (Robe)' : 'Robe Moderne',
          consumption: '2.40m - 2.80m',
          complexity: isAr ? 'متوسطة' : 'Moyenne',
          components: [
            isAr ? 'صدر مبطن' : 'Buste doublé',
            isAr ? 'أكمام طويلة' : 'Manches longues',
            isAr ? 'سحاب مخفي' : 'Fermeture invisible',
            isAr ? 'حزام منفصل' : 'Ceinture amovible'
          ],
          costEstimate: '85 MAD - 120 MAD'
        });
        setAnalyzing(false);
        setChat(prev => [...prev, {
          role: 'ai',
          text: (isAr ? 'تم تحليل الموديل (محاكاة). لتحليل حقيقي ودقيق مع تفصيل كل قطعة، أضف مفتاح Gemini API من زر ⚡ أعلاه!' : 'Analyse simulée. Pour une analyse réelle et détaillée, ajoutez la clé API Gemini !')
        }]);
      }, 2500);
      return;
    }

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

       const analysisPrompt = `أنت خبير نسيج وخياطة محترف في مصنع مغربي. حلل هذه الصورة بدقة عالية جداً.

أريد منك تحليل كل قطعة ملابس في الصورة بشكل منفصل (مثلاً إذا في الصورة تيشرت وسروال، حلل كل واحد لوحدو).

لكل قطعة أعطيني:
1. اسم القطعة (بالعربية والفرنسية)
2. كمية الثوب المطلوبة بالمتر (لعرض ثوب 1.50م)
3. نوع الفيت (لاصق/ضيق، عادي/ريكيلار، واسع/لارج) - حلل من الصورة واش الموديل لاصق ولا واسع
4. مستوى التعقيد (بسيط، متوسط، معقد)
5. التكلفة التقديرية للخياطة بالدرهم
6. مكونات القطعة (الأجزاء: صدر، ظهر، أكمام، ياقة، جيوب...)
7. جدول القياسات لكل مقاس (S, M, L, XL, XXL) - أعطي قياسات واقعية:
   - للجزء العلوي: الصدر، الكتف، الطول، الكم، الخصر.
   - تنبيه هام جداً: إذا كانت القطعة العلوية طويلة (تصل أو تتجاوز منطقة الأرداف/الورك، مثل الفستان، الجلابة، القفطان، أو البلوزة الطويلة Tunique)، يجب عليك إضافة قياس "الورك (Hanches)" كقياس سادس أساسي في جدول هذه القطعة!
   - للسروال: الخصر، الورك، الطول، الفخذ، أسفل الرجل.
8. نوع الثوب الرئيسي المقترح لصناعة هذه القطعة مع اقتراحين بديلين للثوب، مع ذكر المزايا والعيوب لكل بديل بالدارجة المغربية بشكل مختصر ومفيد للمصنع.

أجب بصيغة JSON فقط بدون أي نص إضافي، بهذا الشكل:
{
  "category": "اسم عام للموديل",
  "totalConsumption": "X.XXm - X.XXm",
  "totalCost": "XX - XX MAD",
  "complexity": "متوسطة",
  "fabricSuggested": "نوع الثوب الرئيسي المقترح للموديل كامل",
  "fabricAlternatives": [
    {
      "name": "كريب ريحانة / Crêpe Rayhana",
      "pros": "طايح، مكيتبينش، وساهل في الخياطة ومريح",
      "cons": "كيشرب شوية في المصلوح"
    },
    {
      "name": "كتان لينوه / Lin",
      "pros": "بارد في الصيف، مظهر طبيعي فخم ومريح",
      "cons": "كيتكمش بسرعة وكيبغي المصلوح ديما"
    }
  ],
  "pieces": [
    {
      "name": "تيشرت / T-Shirt",
      "consumption": "1.20m - 1.50m",
      "fit": "عادي (Regular)",
      "complexity": "بسيط",
      "costEstimate": "25 - 40 MAD",
      "components": ["صدر أمامي", "ظهر", "أكمام قصيرة", "ياقة دائرية"],
      "fabricSuggested": "قطن ليكرا / Coton Lycra",
      "fabricAlternatives": [
        {
          "name": "ميكروفيبر / Microfibre",
          "pros": "خفيف جداً وسريع الجفاف",
          "cons": "مكيمتصش العرق بحال القطن الطبيعي"
        }
      ],
      "mesures": [
        {"nom": "الصدر (Poitrine)", "valeurs": {"S": 90, "M": 96, "L": 102, "XL": 108, "XXL": 114}},
        {"nom": "الكتف (Épaules)", "valeurs": {"S": 42, "M": 44, "L": 46, "XL": 48, "XXL": 50}},
        {"nom": "الطول (Longueur)", "valeurs": {"S": 68, "M": 70, "L": 72, "XL": 74, "XXL": 76}},
        {"nom": "الكم (Manche)", "valeurs": {"S": 20, "M": 21, "L": 22, "XL": 23, "XXL": 24}}
      ]
    }
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: analysisPrompt },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
          }
        })
      });

      const data = await response.json();
      let rawText = '';
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = data.candidates[0].content.parts[0].text;
      }

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = rawText;
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      try {
        const parsed = JSON.parse(jsonStr);
        const result: any = {
          category: parsed.category || 'موديل',
          consumption: parsed.totalConsumption || parsed.consumption || '—',
          complexity: parsed.complexity || 'متوسطة',
          costEstimate: parsed.totalCost || parsed.costEstimate || '—',
          components: [],
          pieces: [],
          fabricSuggested: parsed.fabricSuggested || '—',
          fabricAlternatives: parsed.fabricAlternatives || [],
          rawAnalysis: rawText
        };

        if (parsed.pieces && Array.isArray(parsed.pieces)) {
          result.pieces = parsed.pieces.map((p: any) => ({
            name: p.name || 'قطعة',
            consumption: p.consumption || '—',
            fit: p.fit || 'عادي',
            complexity: p.complexity || 'متوسط',
            costEstimate: p.costEstimate || '—',
            components: p.components || [],
            fabricSuggested: p.fabricSuggested || '',
            fabricAlternatives: p.fabricAlternatives || [],
            mesures: (p.mesures || []).map((m: any) => ({
              nom: m.nom || '',
              valeurs: m.valeurs || {}
            }))
          }));
          // Flatten all components
          result.components = result.pieces.flatMap((p: any) => p.components);
        }

        // Update custom measurements from first piece
        if (result.pieces.length > 0 && result.pieces[0].mesures.length > 0) {
          setCustomMesures(result.pieces[0].mesures);
        }

        setAnalysisResult(result);
        setAnalyzing(false);

        // Build rich chat message
        let chatMsg = isAr ? '✅ تم تحليل الموديل بنجاح بالذكاء الاصطناعي!\n\n' : '✅ Analyse IA terminée !\n\n';
        if (result.pieces.length > 0) {
          result.pieces.forEach((p: any, i: number) => {
            chatMsg += `📦 ${i + 1}. ${p.name}\n`;
            chatMsg += `   🧵 ${isAr ? 'الثوب' : 'Tissu'}: ${p.consumption}\n`;
            chatMsg += `   📐 ${isAr ? 'الفيت' : 'Fit'}: ${p.fit}\n`;
            chatMsg += `   💰 ${isAr ? 'التكلفة' : 'Coût'}: ${p.costEstimate}\n\n`;
          });
        }
        chatMsg += isAr ? '⬇️ شوف التفاصيل الكاملة في الأسفل — يمكنك تبديل بين القطع!' : '⬇️ Voir les détails complets ci-dessous.';
        setChat(prev => [...prev, { role: 'ai', text: chatMsg }]);

      } catch (parseErr) {
        // JSON parsing failed, show raw text
        setAnalysisResult({
          category: isAr ? 'تحليل الموديل' : 'Analyse du modèle',
          consumption: '—',
          complexity: '—',
          components: [],
          costEstimate: '—',
          rawAnalysis: rawText
        });
        setAnalyzing(false);
        setChat(prev => [...prev, { role: 'ai', text: rawText }]);
      }
    } catch (err: any) {
      setAnalyzing(false);
      setChat(prev => [...prev, { role: 'ai', text: 'خطأ في التحليل: ' + err.message }]);
    }
  };

  const getSmartReply = (userMsg: string): string => {
    const m = userMsg.toLowerCase().trim();

    // Language switch overrides
    if (/(dwi.*arbya|dwi.*arbia|hder.*blarbya|hder.*arbya|hder.*arbia|parle.*arabe|arabe|arbya|arabic|العربية|تكلم.*عربي|تحدث.*عربي)/i.test(m)) {
      setAiLangOverride('ar');
      return 'واخا! 😊 من دابا غانهضر معاك بالدارجة المغربية والعربية. كيفاش نقدر نعاونك اليوم؟';
    }
    if (/(parle.*francais|parle.*français|dwi.*fransya|dwi.*fransia|dwi.*lfransya|french|francais|français|الفرنسية)/i.test(m)) {
      setAiLangOverride('fr');
      return "D'accord ! 😊 À partir de maintenant, je vais vous répondre en français. Comment puis-je vous aider aujourd'hui ?";
    }

    const speakAr = aiLangOverride === 'ar' || (aiLangOverride === null && isAr);

    // Greetings
    if (/^(salam|salaam|slm|hi|hello|bonjour|bonsoir|hey|مرحبا|السلام|سلام|صباح|مساء|ahlan)/.test(m)) {
      return speakAr
        ? 'وعليكم السلام! 👋 مرحباً بك في BEYA AI. كيف يمكنني مساعدتك اليوم؟ يمكنك رفع صورة موديل لتحليله أو طرح أي سؤال تقني.'
        : 'Salam ! 👋 Bienvenue sur BEYA AI. Comment puis-je vous aider aujourd\'hui ? Vous pouvez uploader une photo de modèle ou me poser une question technique.';
    }
    // How are you
    if (/^(kif|kifash|cv|ça va|labas|labess|comment|كيف|لاباس|واش)/.test(m)) {
      return speakAr
        ? 'الحمد لله لاباس! 😊 أنا جاهز لمساعدتك. واش عندك شي موديل جديد بغيتي نحللو ليك؟'
        : 'Ça va bien, merci ! 😊 Je suis prêt à vous aider. Avez-vous un nouveau modèle à analyser ?';
    }
    // Fabric / Tissu questions
    if (/(toub|tissu|fabric|قماش|ثوب|متر|metre|consomm|conso|كمية|قدش|chehal|combien.*tissu|combien.*metre)/i.test(m)) {
      return speakAr
        ? '🧵 لتحديد كمية الثوب بدقة، أحتاج لصورة الموديل + عرض الثوب (مثلاً 1.50م أو 2.80م). بشكل عام:\n• قميص: 1.20 - 1.60م\n• سروال: 1.40 - 1.80م\n• فستان قصير: 2.00 - 2.50م\n• فستان طويل: 2.80 - 3.50م\n• جلابة: 3.00 - 4.00م\n\nارفع صورة الموديل وسأعطيك تقديراً أدق!'
        : '🧵 Pour estimer la consommation précise, j\'ai besoin de la photo du modèle + la laize du tissu (ex: 1.50m ou 2.80m). En général :\n• Chemise : 1.20 - 1.60m\n• Pantalon : 1.40 - 1.80m\n• Robe courte : 2.00 - 2.50m\n• Robe longue : 2.80 - 3.50m\n• Djellaba : 3.00 - 4.00m\n\nUploadez la photo pour une estimation plus précise !';
    }
    // Cost / Price questions
    if (/(prix|cout|coût|cost|taman|ثمن|سعر|تكلفة|كلفة|chehal|combien|price|devis|فلوس|flous|money)/i.test(m)) {
      return speakAr
        ? '💰 تكلفة الإنتاج تعتمد على عدة عوامل:\n• نوع الثوب وسعره بالمتر\n• تعقيد الموديل (عدد القطع، التفاصيل)\n• تكلفة اليد العاملة\n• الإكسسوارات (أزرار، سحابات...)\n\nارفع صورة الموديل وسأقدر لك التكلفة التقريبية، أو استخدم حاسبة الأسعار في البطاقات التقنية.'
        : '💰 Le coût de production dépend de plusieurs facteurs :\n• Type de tissu et prix au mètre\n• Complexité du modèle (nombre de pièces, détails)\n• Coût de main d\'œuvre\n• Accessoires (boutons, fermetures...)\n\nUploadez la photo du modèle et j\'estimerai le coût, ou utilisez le Calculateur de Prix dans Fiches Techniques.';
    }
    // Patronage / Pattern
    if (/(patron|pattern|باطرون|باترون|تصميم|design|قص|coupe|taille|مقاس|قياس)/i.test(m)) {
      return speakAr
        ? '✂️ بالنسبة للباطرون، حالياً يمكنني مساعدتك في:\n• تحديد مكونات الموديل (صدر، أكمام، ظهر...)\n• تقدير عدد القطع المطلوبة\n• اقتراح مراحل الخياطة\n\nارفع صورة الموديل وسأحلل المكونات ليك. لباطرون احترافي (DXF) يمكنك استخدام برنامج مثل Lectra أو Optitex.'
        : '✂️ Concernant le patronage, je peux vous aider avec :\n• Identification des composants du modèle (buste, manches, dos...)\n• Estimation du nombre de pièces nécessaires\n• Suggestion des étapes de confection\n\nUploadez la photo et j\'analyserai les composants. Pour un patronage professionnel (DXF), utilisez Lectra ou Optitex.';
    }
    // Production steps
    if (/(étape|etape|مراحل|مرحلة|production|confection|خياطة|montage|تركيب|process|كيفاش|comment faire)/i.test(m)) {
      return speakAr
        ? '🏭 مراحل الإنتاج العامة لأي قطعة:\n1️⃣ الباطرون (Patronage) - تصميم القالب\n2️⃣ القص (Coupe) - قص الثوب\n3️⃣ التركيب (Montage) - خياطة القطع\n4️⃣ التشطيب (Finition) - التفاصيل النهائية\n5️⃣ الكي (Repassage)\n6️⃣ المراقبة (Contrôle Qualité)\n7️⃣ التغليف (Emballage)\n\nارفع صورة الموديل وسأحدد لك المراحل الخاصة به بدقة أكبر!'
        : '🏭 Étapes de production standard :\n1️⃣ Patronage - Création du patron\n2️⃣ Coupe - Découpe du tissu\n3️⃣ Montage - Assemblage des pièces\n4️⃣ Finition - Détails et retouches\n5️⃣ Repassage\n6️⃣ Contrôle Qualité\n7️⃣ Emballage\n\nUploadez la photo du modèle et je détaillerai les étapes spécifiques !';
    }
    // Thanks
    if (/(merci|شكر|بارك|thanks|thank|chokran|jazak)/i.test(m)) {
      return speakAr
        ? 'بلا جميل! 😊 أنا هنا دائماً لمساعدتك. إذا احتجت أي شيء آخر لا تتردد!'
        : 'Avec plaisir ! 😊 Je suis toujours là pour vous aider. N\'hésitez pas si vous avez d\'autres questions !';
    }
    // Default - intelligent fallback
    return speakAr
      ? `فهمت سؤالك حول "${userMsg}". 🤔 لأعطيك إجابة دقيقة، أنصحك:\n\n1. ارفع صورة الموديل المعني لتحليل مفصل\n2. أو اطرح سؤالك بشكل أدق (مثلاً: "شحال من متر كيحتاج هاد الموديل؟")\n\nيمكنني مساعدتك في: كمية الثوب، التكلفة، مراحل الإنتاج، والباطرون.`
      : `J'ai noté votre question sur "${userMsg}". 🤔 Pour une réponse précise, je vous conseille :\n\n1. D'uploader la photo du modèle concerné\n2. Ou de préciser votre question (ex: "Combien de mètres pour ce modèle ?")\n\nJe peux vous aider avec : consommation tissu, coûts, étapes de production, et patronage.`;
  };

  const sendDirect = async (directMsg: string) => {
    const userMessage = directMsg;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);

    const apiKey = localStorage.getItem('beya_gemini_api_key');
    if (apiKey) {
      try {
        setChat(prev => [...prev, { role: 'ai', text: '...' }]);
        const contents: any[] = [{ role: "user", parts: [{ text: userMessage }] }];
        if (image) {
          const base64Data = image.split(',')[1];
          const mimeType = image.split(';')[0].split(':')[1];
          contents[0].parts.push({ inlineData: { data: base64Data, mimeType } });
        }
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "أنت المساعد الذكي BEYA AI في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. ساعد المستخدم في حساب كميات الثوب، تكاليف الإنتاج، مراحل الخياطة، وتحليل الموديلات. إذا سألك أسئلة تقنية، أجب بدقة. كن مفيداً جداً وتصرف كخبير نسيج وخياطة." }] } })
        });
        const data = await response.json();
        let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || (data.error ? 'خطأ: ' + data.error.message : 'لم أستطع فهم الرد.');
        setChat(prev => { const n = [...prev]; n.pop(); return [...n, { role: 'ai', text: aiText }]; });
      } catch (e: any) {
        setChat(prev => { const n = [...prev]; n.pop(); return [...n, { role: 'ai', text: 'خطأ: ' + e.message }]; });
      }
    } else {
      setChat(prev => [...prev, { role: 'ai', text: getSmartReply(userMessage) }]);
    }
  };

  const sendMsg = async () => {
    if (!msg.trim()) return;
    const userMessage = msg;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMsg('');

    const apiKey = localStorage.getItem('beya_gemini_api_key');
    if (apiKey) {
      try {
        // show loading indicator
        setChat(prev => [...prev, { role: 'ai', text: '...' }]);

        const contents: any[] = [
          {
            role: "user",
            parts: [
              { text: userMessage }
            ]
          }
        ];

        if (image) {
          const base64Data = image.split(',')[1];
          const mimeType = image.split(';')[0].split(':')[1];
          contents[0].parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: "أنت المساعد الذكي BEYA AI في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. ساعد المستخدم في حساب كميات الثوب، تكاليف الإنتاج، مراحل الخياطة، وتحليل الموديلات. إذا سألك أسئلة تقنية، أجب بدقة. كن مفيداً جداً وتصرف كخبير نسيج وخياطة." }]
            }
          })
        });

        const data = await response.json();
        let aiResponseText = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          aiResponseText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          aiResponseText = "عذراً، وقع خطأ في واجهة برمجة التطبيقات (API Error): " + data.error.message;
        } else {
          aiResponseText = "لم أستطع فهم الرد. حاول مرة أخرى.";
        }

        setChat(prev => {
          const newChat = [...prev];
          newChat.pop(); // remove loading
          return [...newChat, { role: 'ai', text: aiResponseText }];
        });
      } catch (e: any) {
        setChat(prev => {
          const newChat = [...prev];
          newChat.pop();
          return [...newChat, { role: 'ai', text: "وقع خطأ في الاتصال: " + e.message }];
        });
      }
    } else {
      setTimeout(() => {
        setChat(prev => [...prev, { role: 'ai', text: getSmartReply(userMessage) + "\n\n💡 (للحصول على ذكاء اصطناعي حقيقي يفهم الدارجة ويحلل الصور بدقة، قم بإضافة مفتاح Gemini API من زر الإعدادات أعلاه!)" }]);
      }, 800);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <div className="flex items-center gap-3 mb-2 justify-start md:justify-start">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">BEYA <span className="text-indigo-600 not-italic">AI</span></h1>
          </div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{isAr ? 'مساعدك الذكي للتصميم والإنتاج' : 'Votre assistant intelligent de design & production'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowLeadsModal(true)}
            className="flex items-center gap-2 bg-indigo-50 border-2 border-indigo-100 text-indigo-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 hover:text-indigo-800 transition-all shadow-sm"
          >
            <Package className="w-4 h-4" /> {isAr ? 'اختيار من الطلبات' : 'Demandes Prospects'}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Upload className="w-4 h-4" /> {isAr ? 'رفع صورة' : 'Uploader Image'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Visualization & Analysis */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm p-8 h-[400px] flex flex-col relative overflow-hidden group">
            {!image ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[32px] hover:border-indigo-100 hover:text-indigo-200 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-16 h-16 mb-4" />
                <p className="font-black text-xs uppercase tracking-[0.2em]">{isAr ? 'اضغط لرفع الموديل' : 'Cliquez pour uploader le modèle'}</p>
              </div>
            ) : (
              <div className="flex-1 relative rounded-[32px] overflow-hidden">
                <img src={image} className="w-full h-full object-cover" alt="Model" />
                {/* Zoom Button - always visible */}
                <button onClick={() => setShowFullImage(true)} className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-2xl text-slate-700 hover:bg-white hover:scale-105 transition-all shadow-lg border border-slate-100" title={isAr ? 'تكبير الصورة' : 'Agrandir'}>
                  <Eye className="w-5 h-5" />
                </button>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => setImage(null)} className="bg-white/90 p-4 rounded-2xl text-rose-600 hover:bg-white transition-all shadow-xl"><RefreshCw className="w-6 h-6" /></button>
                  {!analysisResult && <button onClick={startAnalysis} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"><Sparkles className="w-4 h-4" /> {isAr ? 'بدء التحليل' : 'Lancer l\'analyse'}</button>}
                </div>
                {analyzing && (
                  <div className="absolute inset-0 bg-indigo-600/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                    <RefreshCw className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-black text-lg uppercase tracking-tighter animate-pulse">{isAr ? 'جاري تحليل الأنسجة والقياسات...' : 'Analyse des tissus et mesures...'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Smart Technical Analysis Results */}
          {analysisResult && (
            <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className={`flex items-center justify-between border-b border-slate-100 pb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={isAr ? 'text-right' : ''}>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{isAr ? 'البطاقة التقنية الذكية' : 'Fiche Technique IA'}</h2>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">{analysisResult.category}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{isAr ? 'تحليل رقمي' : 'Analyse IA'}</span>
                </div>
              </div>

              {/* Piece Tabs */}
              {analysisResult.pieces && analysisResult.pieces.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {analysisResult.pieces.map((p, idx) => (
                    <button key={idx} onClick={() => { setActivePieceIdx(idx); if (p.mesures?.length) setCustomMesures(p.mesures); }}
                      className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${activePieceIdx === idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}>
                      📦 {p.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Metrics Row - show active piece or global - CLICKABLE */}
              {(() => {
                const piece = analysisResult.pieces?.[activePieceIdx];
                const consumption = piece?.consumption || analysisResult.consumption;
                const complexity = piece?.complexity || analysisResult.complexity;
                const cost = piece?.costEstimate || analysisResult.costEstimate;
                const fit = piece?.fit;
                const pieceName = piece?.name || analysisResult.category;
                const askAI = (topic: string) => {
                  const q = `أعطيني تفاصيل أكثر على ${topic} ديال "${pieceName}" اللي في الصورة. بغي معلومات دقيقة وعملية للإنتاج.`;
                  sendDirect(q);
                };
                return (
                  <>
                    <div className={`grid ${fit ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} gap-4`}>
                      <div onClick={() => askAI('استهلاك الثوب والمتراج')} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                        <Ruler className="w-5 h-5 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'استهلاك الثوب' : 'Consommation'}</span>
                        <span className="text-xs font-black text-slate-800">{consumption}</span>
                        <span className="block text-[8px] text-indigo-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{isAr ? '🔍 اضغط لتفاصيل أكثر' : '🔍 Cliquez pour détails'}</span>
                      </div>
                      <div onClick={() => askAI('التعقيد ومراحل الخياطة')} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                        <Scissors className="w-5 h-5 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'التعقيد' : 'Complexité'}</span>
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">{complexity}</span>
                        <span className="block text-[8px] text-emerald-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{isAr ? '🔍 اضغط لتفاصيل أكثر' : '🔍 Cliquez pour détails'}</span>
                      </div>
                      {fit && (
                        <div onClick={() => askAI('الفيت والقصة واش لاصق ولا واسع')} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center cursor-pointer hover:border-violet-200 hover:bg-violet-50/30 transition-all group">
                          <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الفيت / القصة' : 'Fit / Coupe'}</span>
                          <span className="text-xs font-black text-violet-700">{fit}</span>
                          <span className="block text-[8px] text-violet-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{isAr ? '🔍 اضغط لتفاصيل أكثر' : '🔍 Cliquez pour détails'}</span>
                        </div>
                      )}
                      <div onClick={() => askAI('التكلفة التقديرية والتفصيل المالي')} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center cursor-pointer hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                        <DollarSign className="w-5 h-5 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'التكلفة التقديرية' : 'Coût Estimé'}</span>
                        <span className="text-xs font-black text-slate-800">{cost}</span>
                        <span className="block text-[8px] text-amber-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{isAr ? '🔍 اضغط لتفاصيل أكثر' : '🔍 Cliquez pour détails'}</span>
                      </div>
                    </div>

                    {/* Active Piece Detail Panel */}
                    {piece && (
                      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-3xl p-6 border border-slate-100 space-y-4">
                        <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                          <h4 className="font-black text-sm text-slate-800">📦 {piece.name}</h4>
                          <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{piece.fit}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {piece.components.map((comp, ci) => (
                            <div key={ci} className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600">
                              <ChevronRight className="w-3 h-3 text-indigo-400 flex-shrink-0" /> {comp}
                            </div>
                          ))}
                        </div>
                        {piece.mesures && piece.mesures.length > 0 && (
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
                            {isAr ? `${piece.mesures.length} قياسات متاحة — شوف الجدول الكامل في الأسفل ⬇️` : `${piece.mesures.length} mesures disponibles — voir le tableau ci-dessous ⬇️`}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fabric Suggestions and Alternatives with Pros/Cons */}
                    {((piece && (piece.fabricSuggested || (piece.fabricAlternatives && piece.fabricAlternatives.length > 0))) || 
                      (analysisResult.fabricSuggested || (analysisResult.fabricAlternatives && analysisResult.fabricAlternatives.length > 0))) && (
                      <div className="bg-gradient-to-br from-indigo-950/5 to-slate-50 rounded-3xl p-6 border border-indigo-100/40 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-slate-800">{isAr ? 'تحليل واقتراحات الثوب المناسب' : 'Analyse & Suggestions de Tissus'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'توصيات من خبير النسيج بالعيوب والمميزات لكل ثوب' : 'Recommandations d\'expert avec avantages et inconvénients'}</p>
                          </div>
                        </div>

                         {/* Primary suggested fabric */}
                        <div className={`bg-white/80 p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <div>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الثوب الرئيسي المقترح' : 'Tissu Principal Recommandé'}</span>
                            <span className="text-sm font-black text-slate-800 mt-0.5">
                              {piece?.fabricSuggested || analysisResult.fabricSuggested || (isAr ? 'لم يحدد' : 'Non spécifié')}
                            </span>
                          </div>
                          <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-[9px] font-black text-indigo-700 rounded-full">
                            {isAr ? 'مثالي للموديل' : 'Idéal'}
                          </span>
                        </div>

                        {/* Alternative Suggested Fabrics */}
                        {((piece?.fabricAlternatives && piece.fabricAlternatives.length > 0) || 
                          (analysisResult.fabricAlternatives && analysisResult.fabricAlternatives.length > 0)) && (
                          <div className="space-y-3">
                            <h5 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>
                              {isAr ? 'خيارات أثواب بديلة' : 'Options de Tissus Alternatives'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {((piece?.fabricAlternatives || analysisResult.fabricAlternatives) as any[]).map((alt, ai) => (
                                <div key={ai} className="bg-white/95 p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative group hover:border-indigo-100 hover:shadow-md transition-all">
                                  <div className={`flex justify-between items-center ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                    <h6 className="text-xs font-black text-slate-800">{alt.name}</h6>
                                    <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{isAr ? 'بديل' : 'Alternative'}</span>
                                  </div>
                                  <div className="space-y-2 text-[10px] leading-relaxed">
                                    <div className={`flex gap-1.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                      <span className="text-emerald-500 font-black">✔</span>
                                      <span className="text-slate-600 font-medium"><strong className="text-emerald-600 font-bold">{isAr ? 'المزايا: ' : 'Membres: '}</strong>{alt.pros}</span>
                                    </div>
                                    <div className={`flex gap-1.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                      <span className="text-rose-500 font-black">✘</span>
                                      <span className="text-slate-600 font-medium"><strong className="text-rose-600 font-bold">{isAr ? 'العيوب: ' : 'Cons: '}</strong>{alt.cons}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right: Chatbot space */}
        <div className="lg:col-span-5 flex flex-col h-[700px] bg-slate-900 rounded-[40px] shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Chat Header */}
          <div className={`p-6 border-b border-slate-800 flex items-center justify-between relative z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">{isAr ? 'مساعد الإنتاج والتصميم' : 'Assistant Design & Prod'}</h3>
                <div className={`flex items-center gap-1 mt-0.5 justify-start ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{isAr ? 'متصل' : 'Actif'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="p-2.5 bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-700/50 hover:border-indigo-500/20 rounded-xl transition-all"
                title="إعدادات الذكاء الاصطناعي (API Key)"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChat([{ role: 'ai', text: isAr ? 'أنا مساعدك الذكي BEYA AI. ارفع صورة موديل لأقوم بتحليلها لك.' : 'Bonjour ! Je suis votre assistant BEYA AI. Téléchargez la photo d\'un modèle pour que je puisse l\'analyser.' }])}
                className="p-2.5 bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/20 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 flex flex-col scroll-smooth">
            <div className="flex-grow" />
            <div className="space-y-4 animate-in fade-in duration-300">
              {chat.map((c, i) => (
                <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm whitespace-pre-line ${c.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none'
                    }`}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                placeholder={isAr ? 'اسأل المساعد...' : 'Demandez à l\'assistant...'}
                className={`w-full bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 rounded-2xl py-3.5 ${isAr ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12'} text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
              />
              <button
                onClick={sendMsg}
                className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-600/10`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Custom Measurements Config & Components */}
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">

          {/* Custom Measurement Matrix */}
          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm p-8 space-y-6">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : ''}>
                <h3 className="font-black text-slate-900 text-base">{isAr ? 'جدول المقاسات التفاعلي' : 'Matrice des Mesures Interactive'}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                  {analysisResult.pieces?.[activePieceIdx]?.name || (isAr ? 'تخصيص القياسات حسب رغبتك' : 'Ajustez les valeurs pour le patron')}
                </p>
              </div>

              {analysisResult.pieces && analysisResult.pieces.length > 0 ? (
                <div className="flex gap-1.5 flex-wrap">
                  {analysisResult.pieces.map((p, idx) => (
                    <button key={idx} onClick={() => { setActivePieceIdx(idx); if (p.mesures?.length) setCustomMesures(p.mesures); }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activePieceIdx === idx ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      📦 {p.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-1.5 flex-wrap">
                  {(['Robe', 'Caftan', 'Djellaba', 'Chemise', 'Pantalon'] as const).map(cat => (
                    <button key={cat} onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="overflow-x-auto border border-slate-100 rounded-2xl h-full flex flex-col">
                <table className="w-full text-left border-collapse flex-1">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">{isAr ? 'القياس' : 'Mesure'}</th>
                      {selectedTailles.map(size => (
                        <th key={size} className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {customMesures.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-xs font-black text-slate-700">{row.nom}</td>
                        {selectedTailles.map(size => (
                          <td key={size} className="p-2 text-center">
                            <input
                              type="number"
                              value={row.valeurs[size] || 0}
                              onChange={e => handleCellChange(rowIndex, size, parseFloat(e.target.value) || 0)}
                              className="w-12 sm:w-16 bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 text-center text-xs font-black text-slate-800 py-1.5 px-1 rounded-lg outline-none transition-all shadow-sm"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col h-full justify-center">
                <TechnicalDrawing2D 
                  category={analysisResult.pieces?.[activePieceIdx]?.name || selectedCategory} 
                  mesures={customMesures} 
                  isAr={isAr} 
                  selectedSize="M" 
                />
              </div>
            </div>

            {/* Components Breakdown */}
            <div>
              <div className={`flex items-center gap-3 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-rose-50 rounded-xl"><Scissors className="w-5 h-5 text-rose-500" /></div>
                <h4 className="font-black text-xs text-slate-900 uppercase tracking-tighter">{isAr ? 'مكونات وقطع الموديل المقترحة' : 'Composants & Pièces du modèle'}</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(analysisResult.pieces?.[activePieceIdx]?.components || analysisResult.components).map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <ChevronRight className={`w-4 h-4 text-indigo-400 ${isAr ? 'rotate-180' : ''}`} />
                    <span className="text-[11px] font-black text-slate-600">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Action */}
            <button
              onClick={exportToFicheTechnique}
              disabled={exporting}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-slate-900/15"
            >
              {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />}
              {isAr ? 'تأكيد وحفظ في ملفات البطاقة التقنية' : 'Valider & Exporter vers Fiche Technique'}
            </button>
          </div>

          {/* Guidelines Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-8 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Abstract background decorative patterns */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm"><Info className="w-6 h-6 text-indigo-600" /></div>
                <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">{isAr ? 'إرشادات الاستخدام والتحقق' : 'Notice d\'utilisation'}</h4>
              </div>
              <p className="text-[12px] text-indigo-700 font-bold leading-relaxed opacity-85 uppercase tracking-wide">
                {isAr
                  ? 'التحليلات والمقاسات المقترحة من طرف الذكاء الاصطناعي هي قياسات تقديرية مبنية على رؤية الموديل. يرجى دائماً مراجعة وضبط القياسات النهائية قبل عملية قص الأقمشة لضمان الدقة المطلقة.'
                  : 'Les analyses IA sont estimatives et basées sur la vision par ordinateur. Veuillez toujours valider le patronage final avant la coupe pour garantir une précision totale.'
                }
              </p>
            </div>

            <div className="mt-8 border-t border-indigo-100/50 pt-6">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{isAr ? 'نظام بيا الذكي v2.1' : 'BEYA Intelligent System v2.1'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Prospects Modal */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] border-2 border-slate-50 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className={`p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div>
                <h3 className="font-black text-lg text-slate-900 tracking-tight">{isAr ? 'اختيار موديل من طلبات الزبائن' : 'Choisir un modèle depuis les demandes'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'الطلبات التي تحتوي على صور إلهام' : 'Demandes avec photos d\'inspiration'}</p>
              </div>
              <button onClick={() => setShowLeadsModal(false)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-2xl transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {leads.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold italic text-sm">
                  {isAr ? 'لا توجد طلبات نشطة تحتوي على صور حالياً.' : 'Aucune demande avec photo disponible pour le moment.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => selectLeadModel(lead)}
                      className={`flex items-center gap-4 bg-slate-50 border border-slate-100/80 p-4 rounded-3xl hover:bg-indigo-50/40 hover:border-indigo-100 transition-all cursor-pointer group ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                      {lead.photo ? (
                        <img src={lead.photo} className="w-16 h-20 object-cover rounded-2xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform" alt={lead.name} />
                      ) : (
                        <div className="w-16 h-20 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400"><ImageIcon className="w-6 h-6" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs text-slate-800 uppercase tracking-tight truncate">{lead.name}</p>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">{lead.type}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lead.ville} • {lead.quantity} pcs</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-black text-slate-900 uppercase">إعدادات Gemini API</h3>
              <button onClick={() => setShowApiKeyModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X className="w-4 h-4" /></button>
            </div>
            <div className={`p-6 space-y-4 ${isAr ? 'text-right' : ''}`}>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                للحصول على مساعد ذكي حقيقي يفهم الدارجة ويحلل الصور بدقة، قم بإضافة مفتاح <strong>Google Gemini API</strong> الخاص بك هنا. (يتم حفظه في متصفحك فقط)
              </p>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-indigo-500 transition"
                  dir="ltr"
                />
              </div>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-600 hover:underline">
                احصل على مفتاح API مجاني من هنا &rarr;
              </a>
            </div>
            <div className="p-6 bg-slate-50">
              <button
                onClick={() => {
                  localStorage.setItem('beya_gemini_api_key', apiKeyInput);
                  setShowApiKeyModal(false);
                  if (apiKeyInput) {
                    setChat([{ role: 'ai', text: isAr ? 'تم تفعيل الذكاء الاصطناعي الحقيقي! كيف يمكنني مساعدتك؟' : 'IA activée ! Comment puis-je vous aider ?' }]);
                  }
                }}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Image Modal */}
      {showFullImage && image && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all z-10 border border-white/10">
            <X className="w-6 h-6" />
          </button>
          <img src={image} className="max-w-[95vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl" alt="Model Full" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
