import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, MessageSquare, Ruler, Scissors, DollarSign, Camera, RefreshCw, Send, Image as ImageIcon, ChevronRight, Zap, Info, Plus, Trash2, Package, X } from 'lucide-react';
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
  }>(null);
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: isAr ? 'أنا مساعدك الذكي BEYA AI. ارفع صورة موديل لأقوم بتحليلها لك.' : 'Bonjour ! Je suis votre assistant BEYA AI. Téléchargez la photo d\'un modèle pour que je puisse l\'analyser.' }
  ]);
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  // Custom Measurements States
  const [selectedCategory, setSelectedCategory] = useState<'Robe' | 'Caftan' | 'Djellaba' | 'Chemise' | 'Pantalon'>('Robe');
  const [customMesures, setCustomMesures] = useState<any[]>(() => JSON.parse(JSON.stringify(STANDARD_MESURES['Robe'])));
  const [selectedTailles, setSelectedTailles] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);

  // Prospects Integration States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  useEffect(() => {
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

  const startAnalysis = () => {
    setAnalyzing(true);
    // Simulate AI Processing
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
        text: isAr ? 'تم تحليل الموديل بنجاح! هذا الفستان يحتاج لحوالي 2.60 متر من الثوب. هل تريد مني تفصيل مراحل الإنتاج؟' : 'Analyse terminée ! Cette robe nécessite environ 2.60m de tissu. Voulez-vous que je détaille les étapes de production ?' 
      }]);
    }, 2500);
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

  const sendMsg = () => {
    if (!msg.trim()) return;
    const userMessage = msg;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMsg('');
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'ai', text: getSmartReply(userMessage) }]);
    }, 800);
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
          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm p-8 h-[500px] flex flex-col relative overflow-hidden group">
            {!image ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[32px] hover:border-indigo-100 hover:text-indigo-200 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <Camera className="w-16 h-16 mb-4" />
                 <p className="font-black text-xs uppercase tracking-[0.2em]">{isAr ? 'اضغط لرفع الموديل' : 'Cliquez pour uploader le modèle'}</p>
              </div>
            ) : (
              <div className="flex-1 relative rounded-[32px] overflow-hidden">
                <img src={image} className="w-full h-full object-cover" alt="Model" />
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

               {/* Metrics Row */}
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center">
                     <Ruler className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                     <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'استهلاك الثوب' : 'Consommation'}</span>
                     <span className="text-xs font-black text-slate-800">{analysisResult.consumption}</span>
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center">
                     <Scissors className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                     <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'التعقيد' : 'Complexité'}</span>
                     <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">{analysisResult.complexity}</span>
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 text-center">
                     <DollarSign className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                     <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'التكلفة التقديرية' : 'Coût Estimé'}</span>
                     <span className="text-xs font-black text-slate-800">{analysisResult.costEstimate}</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right: Chatbot space */}
        <div className="lg:col-span-5 flex flex-col h-[500px] bg-slate-900 rounded-[40px] shadow-2xl relative overflow-hidden border border-slate-800">
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
              <button 
                onClick={() => setChat([{ role: 'ai', text: isAr ? 'أنا مساعدك الذكي BEYA AI. ارفع صورة موديل لأقوم بتحليلها لك.' : 'Bonjour ! Je suis votre assistant BEYA AI. Téléchargez la photo d\'un modèle pour que je puisse l\'analyser.' }])}
                className="p-2.5 bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/20 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
           </div>

           {/* Chat Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 flex flex-col justify-end">
              <div className="space-y-4 animate-in fade-in duration-300">
                 {chat.map((c, i) => (
                    <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm ${
                          c.role === 'user' 
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
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{isAr ? 'تخصيص القياسات حسب رغبتك' : 'Ajustez les valeurs pour le patron'}</p>
                </div>
                
                {/* Category Switcher inside Results */}
                <div className="flex gap-1.5 flex-wrap">
                   {(['Robe', 'Caftan', 'Djellaba', 'Chemise', 'Pantalon'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                          selectedCategory === cat 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                         {cat}
                      </button>
                   ))}
                </div>
             </div>

             <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
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
                                    className="w-16 bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 text-center text-xs font-black text-slate-800 py-1.5 px-1 rounded-lg outline-none transition-all shadow-sm"
                                  />
                               </td>
                            ))}
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Components Breakdown */}
             <div>
                <div className={`flex items-center gap-3 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                   <div className="p-2 bg-rose-50 rounded-xl"><Scissors className="w-5 h-5 text-rose-500" /></div>
                   <h4 className="font-black text-xs text-slate-900 uppercase tracking-tighter">{isAr ? 'مكونات وقطع الموديل المقترحة' : 'Composants & Pièces du modèle'}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   {analysisResult.components.map((c, i) => (
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
    </div>
  );
}
