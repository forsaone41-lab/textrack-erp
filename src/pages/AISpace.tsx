import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, MessageSquare, Ruler, Scissors, DollarSign, Camera, RefreshCw, Send, Image as ImageIcon, ChevronRight, Zap, Info, Trash2, Package, X, Eye, Check, Languages, Maximize2, Minimize2, Download } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveRecord, genId, FicheTechnique, loadLeads, Lead, loadCompanyProfile } from '../types';
import { printElement } from '../utils/pdf';
import { printRapportIA } from '../utils/print';

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
export default function AISpace({ initialLead, onClose }: { initialLead?: Lead, onClose?: () => void }) {
  const { isAr } = useLang();
  const company = loadCompanyProfile();
  const [pdfChatText, setPdfChatText] = useState('');
  const [aiLangOverride, setAiLangOverride] = useState<'ar' | 'fr' | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | {
    category: string;
    consumption: string;
    fit?: string;
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
    { role: 'ai', text: isAr ? 'مرحباً بك في مساحة التحليل. ارفع صورة موديل للبدء في تحليلها.' : 'Bienvenue dans l\'espace d\'analyse. Uploadez une photo de modèle pour commencer.' }
  ]);
  const [msg, setMsg] = useState('');
  const [isChatMaximized, setIsChatMaximized] = useState(false);
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
  const location = useLocation();

  // Gemini API integration
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; onConfirm?: () => void; isError?: boolean } | null>(null);

  // Custom Measurements States
  const [selectedCategory, setSelectedCategory] = useState<'Robe' | 'Caftan' | 'Djellaba' | 'Chemise' | 'Pantalon'>('Robe');
  const [customMesures, setCustomMesures] = useState<any[]>(() => JSON.parse(JSON.stringify(STANDARD_MESURES['Robe'])));
  const [selectedTailles] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);

  // Prospects Integration States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
      setSelectedLead(lead);

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

  useEffect(() => {
    if (initialLead) {
      setTimeout(() => {
        selectLeadModel(initialLead);
      }, 300);
    } else if (location.state?.leadAnalysis && leads.length > 0) {
      const lead = leads.find(l => l.id === location.state.leadAnalysis.id) || location.state.leadAnalysis;
      // Small timeout to let the UI settle
      setTimeout(() => {
        selectLeadModel(lead);
        // Clean up state so refreshing the page doesn't re-trigger
        navigate('/ai', { replace: true, state: {} });
      }, 500);
    }
  }, [initialLead, location.state?.leadAnalysis, leads]);

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

  const exportToFicheTechnique = async (mode: 'current' | 'complete' = 'current') => {
    if (!analysisResult) return;
    setExporting(true);

    try {
      const parseConso = (str: string): number => {
        if (!str) return 0;
        let s = str;
        if (s.includes(':')) {
          s = s.split(':')[1];
        }
        return parseFloat(s) || 0;
      };

      let ftModele = analysisResult.category;
      const fitStr = analysisResult.fit || (analysisResult.pieces?.[0]?.fit) || '';
      const compStr = analysisResult.complexity || '';

      const extrasAr = ` | القصة: ${fitStr || 'عادي'} | الصعوبة: ${compStr || 'متوسط'}`;
      const extrasFr = ` | Coupe: ${fitStr || 'Regular'} | Complexité: ${compStr || 'Moyenne'}`;

      let ftDescription = isAr
        ? `المكونات: ${analysisResult.components.join('، ')}${extrasAr}`
        : `Composants: ${analysisResult.components.join(', ')}${extrasFr}`;
      let ftMesures = customMesures;
      let ftConso = parseConso(analysisResult.consumption) || 2.50;

      if (mode === 'current' && analysisResult.pieces && analysisResult.pieces.length > 0) {
        const p = analysisResult.pieces[activePieceIdx];
        if (p) {
          const pFit = p.fit || fitStr;
          const pComp = p.complexity || compStr;
          const pExtAr = ` | القصة: ${pFit || 'عادي'} | الصعوبة: ${pComp || 'متوسط'}`;
          const pExtFr = ` | Coupe: ${pFit || 'Regular'} | Complexité: ${pComp || 'Moyenne'}`;

          ftModele = p.name;
          ftDescription = isAr ? `المكونات: ${(p.components || []).join('، ')}${pExtAr}` : `Composants: ${(p.components || []).join(', ')}${pExtFr}`;
          ftMesures = customMesures; // The active table
          ftConso = parseConso(p.consumption) || ftConso;
        }
      } else if (mode === 'complete') {
        ftModele = analysisResult.category;
        const allComps: string[] = [];

        if (analysisResult.pieces && analysisResult.pieces.length > 0) {
          const combinedMesures: any[] = [];
          let totalConso = 0;

          analysisResult.pieces.forEach((p: any) => {
            const prefix = p.name.trim();
            const pConso = parseConso(p.consumption);
            if (pConso > 0) {
              totalConso += pConso;
            }

            if (p.components && Array.isArray(p.components)) {
              allComps.push(...p.components);
            }
            if (p.mesures && Array.isArray(p.mesures)) {
              p.mesures.forEach((m: any) => {
                combinedMesures.push({
                  nom: `${prefix} - ${m.nom}`,
                  valeurs: { ...m.valeurs }
                });
              });
            }
          });
          if (combinedMesures.length > 0) {
            ftMesures = combinedMesures;
          }
          if (totalConso > 0) {
            ftConso = Math.round(totalConso * 100) / 100;
          }
        } else {
          ftMesures = customMesures;
        }

        if (allComps.length === 0 && analysisResult.components && Array.isArray(analysisResult.components)) {
          allComps.push(...analysisResult.components);
        }

        if (allComps.length > 0) {
          ftDescription = isAr ? `المكونات: ${allComps.join('، ')}${extrasAr}` : `Composants: ${allComps.join(', ')}${extrasFr}`;
        }
      } else {
        if (analysisResult.components && Array.isArray(analysisResult.components) && analysisResult.components.length > 0) {
          ftDescription = isAr ? `المكونات: ${analysisResult.components.join('، ')}${extrasAr}` : `Composants: ${analysisResult.components.join(', ')}${extrasFr}`;
        }
      }

      const newFT: FicheTechnique = {
        id: genId(),
        modele: ftModele,
        description: ftDescription,
        client: isAr ? 'اقتراح خبير BEYA' : 'Suggestion Expert',
        tailles: selectedTailles,
        mesures: ftMesures,
        tissuConsommation: ftConso,
        type: mode === 'complete' ? 'Ensemble' : (analysisResult.category || 'creations'),
        tissuRecommande: mode === 'current' && analysisResult.pieces?.[activePieceIdx]?.fabricSuggested ? analysisResult.pieces[activePieceIdx].fabricSuggested : (analysisResult.fabricSuggested || ''),
        createdAt: new Date().toISOString().split('T')[0],
        photo: image || undefined,
        fit: mode === 'current' && analysisResult.pieces?.[activePieceIdx]?.fit ? analysisResult.pieces[activePieceIdx].fit : fitStr,
        complexity: mode === 'current' && analysisResult.pieces?.[activePieceIdx]?.complexity ? analysisResult.pieces[activePieceIdx].complexity : compStr
      };

      await saveRecord('fiches', newFT);

      setCustomAlert({
        title: isAr ? "تصدير ناجح للبطاقة التقنية 🎉" : "Exportation Réussie 🎉",
        message: isAr
          ? `تم بنجاح تصدير "${ftModele}" إلى البطاقات التقنية! يمكنك الآن إكمال الباطرون والقياسات هناك.`
          : `Le modèle "${ftModele}" a été exporté avec succès vers les Fiches Techniques !`,
        onConfirm: () => navigate('/fiches-techniques')
      });
    } catch (err) {
      console.error("Export Error:", err);
      setCustomAlert({
        title: isAr ? "خطأ في التصدير ❌" : "Erreur d'exportation ❌",
        message: isAr ? "حدث خطأ أثناء تصدير الموديل. يرجى المحاولة مرة أخرى." : "Une erreur est survenue lors de l'exportation. Veuillez réessayer.",
        isError: true
      });
    } finally {
      setExporting(false);
    }
  };

  const exportChatToPDFAndSave = async (text: string) => {
    setPdfChatText(text);
    
    if (initialLead) {
      const allLeads = await loadLeads();
      const currentLead = allLeads.find(l => l.id === initialLead.id);
      if (currentLead) {
        currentLead.aiNotes = currentLead.aiNotes ? currentLead.aiNotes + '\n\n---\n\n' + text : text;
        await saveRecord('leads', currentLead, true);
      }
    } else {
      const newFT: FicheTechnique = {
        id: genId(),
        modele: isAr ? 'استشارة تقنية' : 'Consultation Experte',
        description: text,
        client: 'BEYA Expert',
        tailles: [],
        mesures: [],
        tissuConsommation: 0,
        type: 'creations',
        tissuRecommande: '',
        createdAt: new Date().toISOString().split('T')[0],
        photo: image || undefined,
        fit: '',
        complexity: ''
      };
      await saveRecord('fiches', newFT);
    }
    
    setTimeout(() => {
      printElement('chat-pdf-template');
      setCustomAlert({
        title: isAr ? "تم الحفظ بنجاح 🎉" : "Sauvegardé avec succès 🎉",
        message: isAr 
          ? (initialLead ? "تم حفظ التقرير وإرفاقه بتفاصيل الطلب، وتم تصديره كملف PDF احترافي." : "تم حفظ التقرير في 'البطاقات التقنية' وتصديره كملف PDF احترافي.")
          : (initialLead ? "Le rapport a été attaché aux détails du lead et exporté en PDF." : "Le rapport a été sauvegardé dans les Fiches Techniques et exporté en PDF."),
      });
    }, 500);
  };

  // Parse AI price table and send to DevisBuilder
  const sendToDevis = (text: string) => {
    try {
      // Extract table rows from markdown table
      const lines = text.split('\n');
      const tableLines = lines.filter(l => l.trim().startsWith('|') && !l.includes('---'));
      
      const items: { designation: string; montant: number; detail: string }[] = [];
      
      for (let i = 1; i < tableLines.length; i++) { // skip header
        const cells = tableLines[i].split('|').map(s => s.trim()).filter(Boolean);
        if (cells.length >= 2) {
          // Try to extract amount from cells
          const amountCell = cells.find(c => /\d+[.,\d]*/.test(c.replace(/\*+/g, '')));
          const nameCell = cells.find(c => !/^[\d.,]+/.test(c.replace(/\*+/g, '').trim()) && c.length > 1);
          const amount = amountCell ? parseFloat(amountCell.replace(/\*+/g, '').replace(',', '.').match(/[\d.]+/)?.[0] || '0') : 0;
          const name = nameCell?.replace(/\*+/g, '').trim() || '';
          if (name && amount > 0 && !name.toLowerCase().includes('total') && !name.toLowerCase().includes('مجموع') && !name.toLowerCase().includes('revient')) {
            items.push({ designation: name, montant: amount, detail: cells[cells.length-1]?.replace(/\*+/g, '') || '' });
          }
        }
      }
      
      // Find total
      const totalLine = tableLines.find(l => l.toLowerCase().includes('total') || l.includes('مجموع') || l.includes('revient'));
      let total = 0;
      if (totalLine) {
        const m = totalLine.match(/[\d.]+/g);
        if (m) total = Math.max(...m.map(Number));
      }

      // Store in localStorage for DevisBuilder to pick up
      const devisData = {
        fromAI: true,
        timestamp: Date.now(),
        items,
        total,
        rawText: text,
        modelName: analysisResult?.category || (isAr ? 'نموذج من الذكاء الاصطناعي' : 'Modèle AI Expert')
      };
      localStorage.setItem('beya_ai_to_devis', JSON.stringify(devisData));
      
      // Navigate to DevisBuilder
      navigate('/devis-builder');
    } catch (err) {
      console.error('sendToDevis error:', err);
      navigate('/devis-builder');
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

      const analysisPrompt = isAr 
        ? `أنت خبير نسيج وخياطة محترف في مصنع مغربي. حلل هذه الصورة بدقة عالية جداً.

أريد منك تحليل كل قطعة ملابس في الصورة بشكل منفصل (مثلاً إذا في الصورة تيشرت وسروال، حلل كل واحد لوحدو).

لكل قطعة أعطيني:
1. اسم القطعة (بالعربية والفرنسية)
2. كمية الثوب المطلوبة بالمتر. أعطني القياس بدقة لعرضين مختلفين للثوب: عرض 1.50م وعرض 1.80م.
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
  "totalConsumption": "عرض 1.50م: X.XXm | عرض 1.80م: X.XXm",
  "totalCost": "XX - XX MAD",
  "complexity": "متوسطة",
  "fabricSuggested": "نوع الثوب الرئيسي المقترح للموديل كامل",
  "fabricAlternatives": [
    {
      "name": "كريب ريحانة / Crêpe Rayhana",
      "pros": "طايح، مكيتبينش، وساهل في الخياطة ومريح",
      "cons": "كيشرب شوية في المصلوح"
    }
  ],
  "pieces": [
    {
      "name": "تيشرت / T-Shirt",
      "consumption": "عرض 1.50م: 1.50m | عرض 1.80م: 1.20m",
      "fit": "عادي (Regular)",
      "complexity": "بسيط",
      "costEstimate": "25 - 40 MAD",
      "components": ["صدر أمامي", "ظهر", "أكمام قصيرة", "ياقة دائرية"],
      "fabricSuggested": "قطن ليكرا / Coton Lycra",
      "fabricAlternatives": [],
      "mesures": [
        {"nom": "الصدر (Poitrine)", "valeurs": {"S": 90, "M": 96, "L": 102, "XL": 108, "XXL": 114}}
      ]
    }
  ]
}`
        : `Tu es un expert textile et confection professionnel. Analyse cette image avec une très haute précision.

Je veux une analyse de chaque vêtement présent sur l'image séparément.

Pour chaque pièce, donne-moi :
1. Nom de la pièce (en Français)
2. Consommation de tissu en mètres. Donne la mesure pour deux laizes : 1.50m et 1.80m.
3. Type de Fit (Slim, Regular, Loose/Large) - analyse si le modèle est serré ou large d'après la photo.
4. Niveau de complexité (Simple, Moyen, Complexe)
5. Coût estimé de confection en MAD
6. Composants de la pièce (Buste, dos, manches, col, poches...)
7. Tableau des mesures pour chaque taille (S, M, L, XL, XXL) :
   - Haut : Poitrine, Épaules, Longueur, Manche, Taille. (Ajoute Hanches si c'est une pièce longue comme une robe).
   - Pantalon : Taille, Hanches, Longueur, Cuisse, Bas.
8. Type de tissu principal suggéré et deux alternatives avec avantages/inconvénients.

Réponds UNIQUEMENT au format JSON sans texte additionnel :
{
  "category": "Nom général du modèle",
  "totalConsumption": "Laize 1.50m : X.XXm | Laize 1.80m : X.XXm",
  "totalCost": "XX - XX MAD",
  "complexity": "Moyenne",
  "fabricSuggested": "Tissu suggéré",
  "fabricAlternatives": [
    {
      "name": "Nom du tissu",
      "pros": "Avantages",
      "cons": "Inconvénients"
    }
  ],
  "pieces": [
    {
      "name": "T-Shirt",
      "consumption": "Laize 1.50m : 1.50m | Laize 1.80m : 1.20m",
      "fit": "Regular",
      "complexity": "Simple",
      "costEstimate": "25 - 40 MAD",
      "components": ["Buste avant", "Dos", "Manches courtes", "Col rond"],
      "fabricSuggested": "Coton Lycra",
      "fabricAlternatives": [],
      "mesures": [
        {"nom": "Poitrine", "valeurs": {"S": 90, "M": 96, "L": 102, "XL": 108, "XXL": 114}}
      ]
    }
  ]
}`;

      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
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
            temperature: 0.3
          }
        })
      });

      let data = await response.json();
      
      if (data.error && (data.error.message.includes('high demand') || data.error.code === 503 || data.error.code === 404 || data.error.message.includes('not found'))) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
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
              temperature: 0.3
            }
          })
        });
        data = await response.json();
      }

      if (data.error) {
        const errMsg = data.error.message || '';
        if (errMsg.includes('high demand')) {
          throw new Error("الخوادم ديال الذكاء الاصطناعي عليها ضغط كبير دابا. ⏳ تسنى شوية وعاود جرب مرة خرى!");
        } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
          throw new Error("⚠️ مفتاحك ماعندو حتى رصيد (Limit: 0). Google كتفرض تفعيل الدفع (Billing) في حساب Google Cloud ديالك باش تقدر تخدم الـ API في المغرب.");
        } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
          throw new Error("⚠️ هاد الموديل غير متاح للمفتاح ديالك (" + errMsg + "). تأكد باللي فعلتي الـ API الصحيح.");
        } else if (errMsg.includes('API key not valid')) {
          throw new Error("⚠️ المفتاح (API Key) اللي دخلتي غير صحيح.");
        }
        throw new Error(errMsg);
      }
      
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
          fit: parsed.fit || (parsed.pieces?.[0]?.fit) || 'عادي',
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

        // AUTO-TRANSLATE result labels if they are standard but in wrong language
        if (!isAr && result.category === 'موديل') result.category = 'Modèle';
        if (isAr && result.category === 'Modèle') result.category = 'موديل';

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
        ? 'وعليكم السلام! 👋 مرحباً بك في مساحة التحليل. كيف يمكنني مساعدتك اليوم؟ يمكنك رفع صورة موديل للبدء أو طرح أي سؤال تقني.'
        : 'Salam ! 👋 Bienvenue dans l\'espace d\'analyse. Comment puis-je vous aider aujourd\'hui ? Vous pouvez uploader une photo ou me poser une question technique.';
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

  const [translatingFabrics, setTranslatingFabrics] = useState(false);

  const translateFabricsBox = async () => {
    if (!analysisResult) return;
    const apiKey = localStorage.getItem('beya_gemini_api_key');
    if (!apiKey) {
      setCustomAlert({ title: isAr ? "مفتاح API مفقود" : "Clé API manquante", message: isAr ? "المرجو إضافة مفتاح Gemini الخاص بك لترجمة النص." : "Veuillez ajouter votre clé API Gemini pour traduire le texte.", isError: true });
      return;
    }

    setTranslatingFabrics(true);
    try {
      const piece = analysisResult.pieces?.[activePieceIdx];
      const dataToTranslate = {
        suggested: piece?.fabricSuggested || analysisResult.fabricSuggested || '',
        alternatives: piece?.fabricAlternatives || analysisResult.fabricAlternatives || []
      };
      
      const targetLang = isAr ? 'Arabic (Moroccan Darija)' : 'French';
      const prompt = `Translate the following JSON object containing fabric suggestions and alternatives into ${targetLang}. Keep the exact same JSON structure and keys (suggested, alternatives, name, pros, cons). Return ONLY valid JSON:\n${JSON.stringify(dataToTranslate)}`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      let translatedText = data.candidates[0].content.parts[0].text;
      translatedText = translatedText.replace(/```json/g, '').replace(/```/g, '').trim();
      const translatedJson = JSON.parse(translatedText);
      
      const newResult = { ...analysisResult };
      if (piece) {
        if (!newResult.pieces) newResult.pieces = [];
        newResult.pieces[activePieceIdx] = { ...piece };
        newResult.pieces[activePieceIdx].fabricSuggested = translatedJson.suggested;
        newResult.pieces[activePieceIdx].fabricAlternatives = translatedJson.alternatives;
      } else {
        newResult.fabricSuggested = translatedJson.suggested;
        newResult.fabricAlternatives = translatedJson.alternatives;
      }
      setAnalysisResult(newResult);
    } catch (err) {
      console.error(err);
      setCustomAlert({ title: isAr ? "خطأ في الترجمة" : "Erreur de traduction", message: isAr ? "فشل في ترجمة النص، حاول مرة أخرى." : "Échec de la traduction, veuillez réessayer.", isError: true });
    } finally {
      setTranslatingFabrics(false);
    }
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
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. مهمتك الأساسية: 1. حساب كميات الثوب بدقة. 2. إعطاء تقديرات دقيقة للأسعار في السوق المغربي (مثلا أثمنة الأثواب في درب عمر أو أسواق الجملة). 3. إذا سألك المستخدم عن التكلفة، أعطه تفصيلاً دقيقاً: ثمن الثوب (شحال للمتر والمجموع)، تكلفة الخياطة (اليد العاملة)، والتكلفة الإجمالية للقطعة (Prix de revient). 4. اقترح أماكن شراء الأثواب في المغرب. كن مفيداً، دقيقاً في الأرقام التقريبية، وتصرف كخبير نسيج حقيقي." }] } })
        });
        let data = await response.json();
        
        if (data.error && (data.error.message.includes('high demand') || data.error.code === 503)) {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. مهمتك الأساسية: 1. حساب كميات الثوب بدقة. 2. إعطاء تقديرات دقيقة للأسعار في السوق المغربي (مثلا أثمنة الأثواب في درب عمر أو أسواق الجملة). 3. إذا سألك المستخدم عن التكلفة، أعطه تفصيلاً دقيقاً: ثمن الثوب (شحال للمتر والمجموع)، تكلفة الخياطة (اليد العاملة)، والتكلفة الإجمالية للقطعة (Prix de revient). 4. اقترح أماكن شراء الأثواب في المغرب. كن مفيداً، دقيقاً في الأرقام التقريبية، وتصرف كخبير نسيج حقيقي." }] } })
          });
          data = await response.json();
        }

        let aiText = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          aiText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          const errMsg = data.error.message || '';
          if (errMsg.includes('high demand')) {
            aiText = "عذراً، الخوادم ديال الذكاء الاصطناعي عليها ضغط كبير دابا. ⏳ تسنى شوية وعاود جرب مرة خرى!";
          } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
            aiText = "⚠️ خطأ في المفتاح (API Key): مفتاحك ماعندو حتى رصيد (Limit: 0). هادشي كيوقع حيت Google كتفرض تفعيل الدفع (Billing) في حساب Google Cloud ديالك باش تقدر تخدم الـ API في المغرب.";
          } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
            aiText = "⚠️ خطأ في المفتاح: هاد الموديل غير متاح للمفتاح ديالك (" + errMsg + ").";
          } else if (errMsg.includes('API key not valid')) {
            aiText = "⚠️ خطأ: المفتاح (API Key) اللي دخلتي غير صحيح.";
          } else {
            aiText = "خطأ: " + errMsg;
          }
        } else {
          aiText = 'لم أستطع فهم الرد.';
        }
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

        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. مهمتك الأساسية: 1. حساب كميات الثوب بدقة. 2. إعطاء تقديرات دقيقة للأسعار في السوق المغربي (مثلا أثمنة الأثواب في درب عمر أو أسواق الجملة). 3. إذا سألك المستخدم عن التكلفة، أعطه تفصيلاً دقيقاً: ثمن الثوب (شحال للمتر والمجموع)، تكلفة الخياطة (اليد العاملة)، والتكلفة الإجمالية للقطعة (Prix de revient). 4. اقترح أماكن شراء الأثواب في المغرب. كن مفيداً، دقيقاً في الأرقام التقريبية، وتصرف كخبير نسيج حقيقي." }]
            }
          })
        });

        let data = await response.json();
        
        // Fallback to gemini-3.5-flash if flash is overloaded
        if (data.error && (data.error.message.includes('high demand') || data.error.code === 503 || data.error.code === 404 || data.error.message.includes('not found'))) {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. مهمتك الأساسية: 1. حساب كميات الثوب بدقة. 2. إعطاء تقديرات دقيقة للأسعار في السوق المغربي (مثلا أثمنة الأثواب في درب عمر أو أسواق الجملة). 3. إذا سألك المستخدم عن التكلفة، أعطه تفصيلاً دقيقاً: ثمن الثوب (شحال للمتر والمجموع)، تكلفة الخياطة (اليد العاملة)، والتكلفة الإجمالية للقطعة (Prix de revient). 4. اقترح أماكن شراء الأثواب في المغرب. كن مفيداً، دقيقاً في الأرقام التقريبية، وتصرف كخبير نسيج حقيقي." }]
              }
            })
          });
          data = await response.json();
        }

        let aiResponseText = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          aiResponseText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          const errMsg = data.error.message || '';
          if (errMsg.includes('high demand')) {
            aiResponseText = "عذراً، الخوادم ديال الذكاء الاصطناعي (Google API) عليها ضغط كبير دابا. ⏳ تسنى شوية وعاود جرب مرة خرى!";
          } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
            aiResponseText = "⚠️ خطأ في المفتاح (API Key): مفتاحك ماعندو حتى رصيد (Limit: 0). هادشي كيوقع حيت Google كتفرض تفعيل الدفع (Billing) وإضافة بطاقة بنكية في حساب Google Cloud ديالك باش تقدر تخدم الـ API في المغرب، واخا هو مجاني.";
          } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
            aiResponseText = "⚠️ خطأ في المفتاح: هاد الموديل (Gemini 1.5) غير متاح للمفتاح ديالك. تأكد باللي فعلتي الـ API الصحيح في Google Cloud Console.";
          } else if (errMsg.includes('API key not valid')) {
            aiResponseText = "⚠️ خطأ: المفتاح (API Key) اللي دخلتي غير صحيح. المرجو التأكد من نسخه بشكل صحيح من Google AI Studio.";
          } else {
            aiResponseText = "عذراً، وقع خطأ في واجهة برمجة التطبيقات (API Error): " + errMsg;
          }
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
        <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
          {onClose && (
            <button onClick={onClose} className="mt-1 p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-all flex-shrink-0">
               <X className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className={`flex items-center gap-3 mb-2 justify-start md:justify-start ${isAr ? 'flex-row-reverse' : ''}`}>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">BEYA <span className="text-indigo-600 not-italic">STUDIO</span></h1>
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{isAr ? 'مساحة التحليل والتصميم' : 'Espace d\'Analyse & Design'}</p>
          </div>
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
        <div className={`${isChatMaximized ? 'hidden' : 'lg:col-span-7'} space-y-6`}>
          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm p-4 md:p-8 h-[400px] lg:h-[550px] flex flex-col relative overflow-hidden group">
            {!image ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[32px] hover:border-indigo-100 hover:text-indigo-200 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-16 h-16 mb-4" />
                <p className="font-black text-xs uppercase tracking-[0.2em]">{isAr ? 'اضغط لرفع الموديل' : 'Cliquez pour uploader le modèle'}</p>
              </div>
            ) : (
              <div className="flex-1 relative rounded-[32px] overflow-hidden bg-slate-50">
                <img src={image} className="w-full h-full object-contain" alt="Model" />
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
                    <button key={idx} onClick={() => { 
                        setActivePieceIdx(idx); 
                        if (p.mesures?.length) setCustomMesures(p.mesures); 
                        if (activePieceIdx !== idx) {
                          const q = isAr 
                            ? `عطيني تفاصيل كاملة ونصائح الخياطة والتفصيل ديال هاد القطعة: "${p.name}". بغيت معلومات دقيقة تفيد الخياط.`
                            : `Donne-moi tous les détails, conseils de couture et coupe pour cette pièce : "${p.name}". Je veux des infos précises pour l'atelier.`;
                          sendDirect(q);
                        }
                      }}
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
                  const q = isAr 
                    ? `أعطيني تفاصيل أكثر على ${topic} ديال "${pieceName}" اللي في الصورة. بغي معلومات دقيقة وعملية للإنتاج.`
                    : `Donne-moi plus de détails sur ${topic} de "${pieceName}" sur l'image. Je veux des infos précises pour la production.`;
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
                          <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider pt-3 border-t border-slate-100 mt-2">
                            {isAr ? `${piece.mesures.length} قياسات متاحة — شوف الجدول الكامل في الأسفل ⬇️` : `${piece.mesures.length} mesures disponibles — voir le tableau ci-dessous ⬇️`}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fabric Suggestions and Alternatives with Pros/Cons */}
                    {((piece && (piece.fabricSuggested || (piece.fabricAlternatives && piece.fabricAlternatives.length > 0))) || 
                      (analysisResult.fabricSuggested || (analysisResult.fabricAlternatives && analysisResult.fabricAlternatives.length > 0))) && (
                      <div className="bg-gradient-to-br from-indigo-950/5 to-slate-50 rounded-3xl p-6 border border-indigo-100/40 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''} mb-4`}>
                          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-slate-800">{isAr ? 'تحليل واقتراحات الثوب المناسب' : 'Analyse & Suggestions de Tissus'}</h4>
                              <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'توصيات من خبير النسيج بالعيوب والمميزات لكل ثوب' : 'Recommandations d\'expert avec avantages et inconvénients'}</p>
                            </div>
                          </div>
                          <button
                            onClick={translateFabricsBox}
                            disabled={translatingFabrics}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-100 rounded-full font-bold text-[10px] transition-all shadow-sm disabled:opacity-50"
                            title={isAr ? 'ترجمة النص' : 'Traduire en Français'}
                          >
                            {translatingFabrics ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                            <span className="hidden sm:inline">{isAr ? 'ترجمة' : 'Traduire'}</span>
                          </button>
                        </div>

                         {/* Primary suggested fabric */}
                        <div className={`bg-white/80 p-5 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                          <div>
                            <span className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{isAr ? 'الثوب الرئيسي المقترح' : 'Tissu Principal Recommandé'}</span>
                            <span className="block text-base sm:text-lg font-black text-slate-800">
                              {piece?.fabricSuggested || analysisResult.fabricSuggested || (isAr ? 'لم يحدد' : 'Non spécifié')}
                            </span>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-block px-4 py-2 bg-indigo-50 border border-indigo-100 text-[10px] sm:text-xs font-black text-indigo-700 rounded-full shadow-sm">
                              {isAr ? 'مثالي للموديل' : 'Idéal'}
                            </span>
                          </div>
                        </div>

                        {/* Alternative Suggested Fabrics */}
                        {((piece?.fabricAlternatives && piece.fabricAlternatives.length > 0) || 
                          (analysisResult.fabricAlternatives && analysisResult.fabricAlternatives.length > 0)) && (
                          <div className="space-y-4">
                            <h5 className={`text-xs font-black text-slate-500 uppercase tracking-wider ${isAr ? 'text-right' : ''}`}>
                              {isAr ? 'خيارات أثواب بديلة' : 'Options de Tissus Alternatives'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {((piece?.fabricAlternatives || analysisResult.fabricAlternatives) as any[]).map((alt, ai) => (
                                <div key={ai} className="bg-white/95 p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative group hover:border-indigo-100 hover:shadow-md transition-all">
                                  <div className={`flex justify-between items-start gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                    <h6 className="text-sm font-black text-slate-800 leading-tight">{alt.name}</h6>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">{isAr ? 'بديل' : 'Alternative'}</span>
                                  </div>
                                  <div className="space-y-2.5 text-xs leading-relaxed">
                                    <div className={`flex gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                      <span className="text-emerald-500 font-black mt-0.5">✔</span>
                                      <span className="text-slate-600 font-medium"><strong className="text-emerald-600 font-bold">{isAr ? 'المزايا: ' : 'Avantages: '}</strong>{alt.pros}</span>
                                    </div>
                                    <div className={`flex gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                      <span className="text-rose-500 font-black mt-0.5">✘</span>
                                      <span className="text-slate-600 font-medium"><strong className="text-rose-600 font-bold">{isAr ? 'العيوب: ' : 'Inconvénients: '}</strong>{alt.cons}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                      </div>
                    )}

                    {/* Action Buttons (Always Visible when analysisResult exists) */}
                    <div className={`pt-6 mt-4 flex flex-col sm:flex-row justify-end items-center gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => printRapportIA(analysisResult, image, isAr)}
                        className="flex items-center justify-center gap-2 bg-white text-indigo-600 border-2 border-indigo-100 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm w-full sm:w-auto group"
                      >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {isAr ? 'تحميل التقرير العام (PDF)' : 'Télécharger Rapport (PDF)'}
                      </button>

                      <button
                        onClick={() => {
                          const isEnsemble = analysisResult.pieces && analysisResult.pieces.length > 1;
                          let msgText = isAr 
                            ? `مرحباً! 👋\nبناءً على طلبكم الخاص بموديل *${analysisResult.category}*، قمنا بتحليل الموديل بدقة وهذه هي اقتراحاتنا:\n\n`
                            : `Bonjour! 👋\nSuite à votre demande concernant le modèle *${analysisResult.category}*, nous avons analysé le modèle et voici nos suggestions :\n\n`;

                          if (isEnsemble) {
                            analysisResult.pieces?.forEach((p: any) => {
                              const suggested = p.fabricSuggested || (isAr ? 'غير محدد' : 'Non spécifié');
                              const conso = p.consumption || (isAr ? 'غير محدد' : 'Non spécifié');
                              const alternatives = p.fabricAlternatives || [];

                              msgText += `📦 *${p.name}*\n`;
                              msgText += isAr ? `✅ *الثوب المقترح:* ${suggested}\n` : `✅ *Tissu recommandé:* ${suggested}\n`;
                              msgText += isAr ? `📏 *الكمية:* ${conso}\n` : `📏 *Quantité:* ${conso}\n`;
                              
                              if (alternatives.length > 0) {
                                msgText += isAr ? `🔄 *بدائل:* ` : `🔄 *Alternatives:* `;
                                msgText += alternatives.map((alt: any) => alt.name).join('، ') + '\n';
                              }
                              msgText += '\n';
                            });
                          } else {
                            const suggested = piece?.fabricSuggested || analysisResult.fabricSuggested || (isAr ? 'غير محدد' : 'Non spécifié');
                            const conso = piece?.consumption || analysisResult.consumption || (isAr ? 'غير محدد' : 'Non spécifié');
                            const alternatives = ((piece?.fabricAlternatives || analysisResult.fabricAlternatives) as any[]) || [];
                            
                            msgText += isAr ? `✅ *الثوب المقترح:* ${suggested}\n` : `✅ *Tissu recommandé:* ${suggested}\n`;
                            msgText += isAr ? `📏 *كمية الثوب المطلوبة:* ${conso}\n\n` : `📏 *Quantité nécessaire:* ${conso}\n\n`;
                            
                            if (alternatives.length > 0) {
                              msgText += isAr ? `🔄 *خيارات بديلة للثوب:*\n` : `🔄 *Options alternatives:*\n`;
                              alternatives.forEach((alt: any) => {
                                msgText += `\n🔹 *${alt.name}*\n`;
                                msgText += isAr ? `   ➕ المزايا: ${alt.pros}\n` : `   ➕ Avantages: ${alt.pros}\n`;
                                msgText += isAr ? `   ➖ العيوب: ${alt.cons}\n` : `   ➖ Inconvénients: ${alt.cons}\n`;
                              });
                            }
                          }
                          
                          msgText += isAr ? `\nنحن رهن إشارتكم لأي استفسار أو لتأكيد الطلب! ✨\n*BEYA CREATIVE*` : `\nNous restons à votre disposition pour toute question ou confirmation! ✨\n*BEYA CREATIVE*`;
                          
                          const encoded = encodeURIComponent(msgText);
                          let phone = selectedLead?.phone || '';
                          if (phone) {
                            phone = phone.replace(/\D/g, '');
                            if (phone.startsWith('0')) phone = '212' + phone.substring(1);
                          }
                          
                          const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
                          
                          if (image) {
                            try {
                              fetch(image)
                                .then(res => res.blob())
                                .then(blob => {
                                  navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]).catch(() => {});
                                }).catch(() => {});
                            } catch (e) {}

                            setCustomAlert({
                              title: isAr ? 'خطوة أخيرة! 📋' : 'Dernière étape ! 📋',
                              message: isAr 
                                ? 'تم نسخ صورة الموديل. ملي يفتح واتساب دير "لصق" (Coller) فالبلاصة ديال الكُتبة باش تصيفطها.' 
                                : 'L\'image du modèle a été copiée. Dans WhatsApp, faites "Coller" pour l\'envoyer avec le message.',
                              isError: false,
                              onConfirm: () => window.open(url, '_blank')
                            });
                          } else {
                            window.open(url, '_blank');
                          }
                        }}
                        className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-md shadow-[#25D366]/20 w-full sm:w-auto"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        {isAr ? 'إرسال الاقتراح عبر واتساب' : 'Envoyer par WhatsApp'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right: Chatbot space */}
        <div className={`${isChatMaximized ? 'lg:col-span-12 lg:h-[800px]' : 'lg:col-span-5 lg:h-[550px]'} flex flex-col h-[400px] bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden border border-slate-100/80 transition-all duration-300`}>
          
          {/* Subtle top gradient */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none" />

          {/* Chat Header */}
          <div className={`p-5 px-6 border-b border-slate-50 flex items-center justify-between relative z-10 bg-white/90 backdrop-blur-md ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3.5 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className={`absolute -bottom-0.5 ${isAr ? '-left-0.5' : '-right-0.5'} w-3 h-3 bg-emerald-400 border-[2.5px] border-white rounded-full`} />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <h3 className="font-bold text-slate-800 text-sm tracking-wide">{isAr ? 'الخبير التقني BEYA' : 'Expert BEYA'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isAr ? 'متصل دائماً' : 'Toujours Actif'}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setIsChatMaximized(!isChatMaximized)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title={isChatMaximized ? (isAr ? 'تصغير' : 'Réduire') : (isAr ? 'تكبير' : 'Agrandir')}>
                {isChatMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowApiKeyModal(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="API Key">
                <Zap className="w-4 h-4" />
              </button>
              <button onClick={() => setChat([{ role: 'ai', text: isAr ? 'مرحباً بك في مساحة التحليل. ارفع صورة موديل للبدء في تحليلها.' : 'Bienvenue dans l\'espace d\'analyse. Uploadez une photo de modèle pour commencer.' }])} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all" title={isAr ? 'مسح المحادثة' : 'Effacer la discussion'}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 flex flex-col scroll-smooth bg-slate-50/30">
            <div className="flex-grow" />
            <div className="space-y-6">
              {chat.map((c, i) => (
                <div key={i} className={`flex w-full ${c.role === 'user' ? (isAr ? 'justify-start' : 'justify-end') : (isAr ? 'justify-end' : 'justify-start')} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  
                  {/* AI Avatar */}
                  {c.role === 'ai' && (
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center border border-white shadow-sm mt-auto ${isAr ? 'ml-3' : 'mr-3'}`}>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  )}

                  <div dir={isAr ? 'rtl' : 'ltr'} className={`max-w-[75%] p-4 text-[13px] font-medium leading-relaxed whitespace-pre-line shadow-sm relative group ${
                    c.role === 'user'
                      ? 'bg-slate-800 text-white rounded-3xl ' + (isAr ? 'rounded-bl-md' : 'rounded-br-md')
                      : 'bg-white text-slate-700 border border-slate-100 rounded-3xl ' + (isAr ? 'rounded-br-md' : 'rounded-bl-md')
                  } ${isAr ? 'text-right' : 'text-left'}`}>
                    {c.text}
                    {c.role === 'ai' && c.text !== '...' && (
                      <button 
                        onClick={() => exportChatToPDFAndSave(c.text)}
                        className={`absolute -bottom-3 ${isAr ? 'left-2' : 'right-2'} transition-all bg-white border border-slate-200 text-indigo-600 p-1.5 rounded-full shadow-sm hover:bg-indigo-50 hover:scale-110 z-10`}
                        title={isAr ? 'حفظ وتصدير PDF' : 'Sauvegarder & Exporter PDF'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {/* User Avatar */}
                  {c.role === 'user' && (
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center border border-white shadow-sm mt-auto ${isAr ? 'mr-3' : 'ml-3'}`}>
                      <span className="text-[10px] font-black text-slate-500">{isAr ? 'أنت' : 'Moi'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-5 bg-white relative z-10 border-t border-slate-50/80">
            <div className="relative flex items-center bg-slate-50/80 border border-slate-200/60 rounded-full p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-sm">
              <input
                type="text"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Écrivez votre message...'}
                className={`flex-1 bg-transparent border-none py-2.5 ${isAr ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12'} text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0`}
              />
              <button
                onClick={sendMsg}
                className={`absolute ${isAr ? 'left-1.5' : 'right-1.5'} w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-600/20`}
              >
                <Send className={`w-4 h-4 ${isAr ? 'rotate-180 -ml-0.5' : 'ml-0.5'}`} />
              </button>
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] font-medium text-slate-400">
                {isAr ? 'الذكاء الاصطناعي قد يخطئ أحياناً، يرجى التحقق من المعلومات المهمة.' : 'L\'IA peut parfois se tromper. Veuillez vérifier les informations importantes.'}
              </p>
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
                    <button key={idx} onClick={() => { 
                        setActivePieceIdx(idx); 
                        if (p.mesures?.length) setCustomMesures(p.mesures); 
                        if (activePieceIdx !== idx) {
                          const q = isAr 
                            ? `عطيني تفاصيل كاملة ونصائح الخياطة والتفصيل ديال هاد القطعة: "${p.name}". بغيت معلومات دقيقة تفيد الخياط.`
                            : `Donne-moi tous les détails, conseils de couture et coupe pour cette pièce : "${p.name}". Je veux des infos précises pour l'atelier.`;
                          sendDirect(q);
                        }
                      }}
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
                      {cat === 'Robe' ? (isAr ? 'فستان' : 'Robe') : cat === 'Caftan' ? (isAr ? 'قفطان' : 'Caftan') : cat === 'Djellaba' ? (isAr ? 'جلابة' : 'Djellaba') : cat === 'Chemise' ? (isAr ? 'قميص' : 'Chemise') : (isAr ? 'سروال' : 'Pantalon')}
                    </button>
                  ))}
                </div>
              )}
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
                {(analysisResult.pieces?.[activePieceIdx]?.components || analysisResult.components).map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <ChevronRight className={`w-4 h-4 text-indigo-400 ${isAr ? 'rotate-180' : ''}`} />
                    <span className="text-[11px] font-black text-slate-600">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Action */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => exportToFicheTechnique('current')}
                disabled={exporting}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-slate-900/15"
              >
                {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />}
                {isAr ? `تصدير القطعة الحالية فقط (${analysisResult.pieces?.[activePieceIdx]?.name?.split('/')[0]?.trim() || analysisResult.category || 'قطعة'})` : `Exporter cette pièce uniquement`}
              </button>
              <button
                onClick={() => exportToFicheTechnique('complete')}
                disabled={exporting}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-indigo-600/20"
              >
                {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                {isAr ? 'تصدير الطقم كامل (Ensemble Complet)' : 'Exporter l\'ensemble complet'}
              </button>
            </div>
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
                {isAr ? 'حفظ التغييرات' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* HIDDEN PDF TEMPLATE FOR CHAT */}
      <div id="chat-pdf-template" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-white font-sans" style={{ color: '#0f172a', direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4f46e5', padding: '20px 32px 14px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            {company.logoInvoice && company.logoInvoice !== '/logo.png' ? (
              <img src={company.logoInvoice} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '44px', height: '44px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                {company.name?.charAt(0) || 'B'}
              </div>
            )}
            <div style={{ textAlign: isAr ? 'right' : 'left' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0, textTransform: 'uppercase' }}>{company.name || 'BEYA CREATIVE'}</h1>
              <p style={{ fontSize: '8px', fontWeight: 700, color: '#6366f1', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{company.subtitle || (isAr ? 'صناعة النسيج' : 'Confection Textile')}</p>
            </div>
          </div>
          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#1e1b4b', textTransform: 'uppercase' }}>{isAr ? 'استشارة تقنية' : 'CONSULTATION EXPERTE'}</h2>
            <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', margin: '2px 0 0' }}>{new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div style={{ padding: '30px 32px' }}>
          <div style={{ display: 'flex', gap: '20px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            {image && (
              <div style={{ width: '250px', flexShrink: 0 }}>
                <img src={image} style={{ width: '100%', borderRadius: '16px', border: '2px solid #e2e8f0', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: '16px' }}>✨</span>
                  {isAr ? 'تحليل وخبرة BEYA Expert' : 'Analyse et Expertise BEYA Expert'}
                </h3>
                <div style={{ fontSize: '12px', lineHeight: '2.0', color: '#1e293b', fontWeight: 600, whiteSpace: 'pre-wrap', textAlign: isAr ? 'right' : 'left' }}>
                  {pdfChatText}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ margin: '20px 32px 30px', borderTop: '2px solid #e2e8f0', paddingTop: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 3px' }}>
            {isAr ? `شكرا على ثقتكم — ${company.name}` : `Merci de votre confiance — ${company.name}`}
          </p>
          <p style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
            {company.address} | <span dir="ltr">{company.phone}</span> | {company.email}
          </p>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {showFullImage && image && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all z-10 border border-white/10">
            <X className="w-6 h-6" />
          </button>
          <img src={image} className="max-w-[95vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl" alt="Model Full" onClick={e => e.stopPropagation()} />
        </div>
      )}
      {/* Beautiful Custom Alert Modal */}
      {customAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border-2 border-slate-100 w-full max-w-md p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            {/* Top decorative badge */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${
              customAlert.isError 
                ? 'bg-rose-50 border border-rose-100 text-rose-500 shadow-rose-200/50' 
                : 'bg-emerald-50 border border-emerald-100 text-emerald-500 shadow-emerald-200/50'
            }`}>
              {customAlert.isError ? <X className="w-8 h-8" /> : <Check className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">{customAlert.title}</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-500 mb-6">{customAlert.message}</p>

            <button
              onClick={() => {
                const onConf = customAlert.onConfirm;
                setCustomAlert(null);
                if (onConf) onConf();
              }}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md ${
                customAlert.isError
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {isAr ? 'موافق' : 'D\'accord'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
