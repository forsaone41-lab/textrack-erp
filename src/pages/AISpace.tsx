import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, MessageSquare, Ruler, Scissors, DollarSign, Camera, RefreshCw, Send, Image as ImageIcon, ChevronRight, Zap, Info, Trash2, Package, X, Eye, Check, Languages, Maximize2, Minimize2, Download, FileText, Printer } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveRecord, genId, FicheTechnique, loadLeads, Lead, loadCompanyProfile } from '../types';
import { printElement } from '../utils/pdf';
import { printRapportIA } from '../utils/print';

const STANDARD_MESURES: Record<string, { nom: string; valeurs: Record<string, number> }[]> = {
  Robe: [
    { nom: 'Ø§Ù„ØµØ¯Ø± (Poitrine)', valeurs: { S: 88, M: 92, L: 96, XL: 100, XXL: 104 } },
    { nom: 'Ø§Ù„Ø®ØµØ± (Taille)', valeurs: { S: 70, M: 74, L: 78, XL: 82, XXL: 86 } },
    { nom: 'Ø§Ù„ÙˆØ±Ùƒ (Hanches)', valeurs: { S: 94, M: 98, L: 102, XL: 106, XXL: 110 } },
    { nom: 'Ø§Ù„Ø·ÙˆÙ„ (Longueur)', valeurs: { S: 138, M: 140, L: 142, XL: 144, XXL: 146 } }
  ],
  Caftan: [
    { nom: 'Ø§Ù„ØµØ¯Ø± (Poitrine)', valeurs: { S: 92, M: 96, L: 100, XL: 104, XXL: 108 } },
    { nom: 'Ø§Ù„ÙƒØªÙ (Ã‰paules)', valeurs: { S: 38, M: 39, L: 40, XL: 41, XXL: 42 } },
    { nom: 'Ø§Ù„ÙˆØ±Ùƒ (Hanches)', valeurs: { S: 102, M: 106, L: 110, XL: 114, XXL: 118 } },
    { nom: 'Ø§Ù„Ø·ÙˆÙ„ (Longueur)', valeurs: { S: 145, M: 147, L: 149, XL: 151, XXL: 153 } }
  ],
  Djellaba: [
    { nom: 'Ø§Ù„ØµØ¯Ø± (Poitrine)', valeurs: { S: 94, M: 98, L: 102, XL: 106, XXL: 110 } },
    { nom: 'Ø§Ù„ÙƒØªÙ (Ã‰paules)', valeurs: { S: 39, M: 40, L: 41, XL: 42, XXL: 43 } },
    { nom: 'Ø§Ù„ÙˆØ±Ùƒ (Hanches)', valeurs: { S: 104, M: 108, L: 112, XL: 116, XXL: 120 } },
    { nom: 'Ø§Ù„Ø·ÙˆÙ„ (Longueur)', valeurs: { S: 135, M: 137, L: 139, XL: 141, XXL: 143 } }
  ],
  Chemise: [
    { nom: 'Ø§Ù„ØµØ¯Ø± (Poitrine)', valeurs: { S: 90, M: 94, L: 98, XL: 102, XXL: 106 } },
    { nom: 'Ø§Ù„ÙƒØªÙ (Ã‰paules)', valeurs: { S: 38, M: 40, L: 42, XL: 44, XXL: 46 } },
    { nom: 'Ø§Ù„Ø·ÙˆÙ„ (Longueur)', valeurs: { S: 68, M: 70, L: 72, XL: 74, XXL: 76 } },
    { nom: 'Ø§Ù„ÙƒÙ… (Manche)', valeurs: { S: 58, M: 59, L: 60, XL: 61, XXL: 62 } }
  ],
  Pantalon: [
    { nom: 'Ø§Ù„Ø®ØµØ± (Taille)', valeurs: { S: 72, M: 76, L: 80, XL: 84, XXL: 88 } },
    { nom: 'Ø§Ù„ÙˆØ±Ùƒ (Hanches)', valeurs: { S: 92, M: 96, L: 100, XL: 104, XXL: 108 } },
    { nom: 'Ø§Ù„Ø·ÙˆÙ„ (Longueur)', valeurs: { S: 100, M: 102, L: 104, XL: 106, XXL: 108 } }
  ]
};

const FABRIC_CATALOG: Record<string, {
  arName: string;
  frName: string;
  pricePerMeterMAD: string;
  markets: string;
  pros: string;
  cons: string;
}> = {
  'crêpe': {
    arName: 'كريب دي شين / كريب جورجيت (Crêpe)',
    frName: 'Crêpe de Chine / Georgette',
    pricePerMeterMAD: '25 - 45 درهم/متر (جملة)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، القيساريات الكبرى',
    pros: 'طايح وخفيف، مريح في اللبس، ما كيتكمش بسهولة، ممتاز للفساتين والعبايات',
    cons: 'كيتطلب عناية خاصة في الخياطة باش ما يزلقش في الماكينة'
  },
  'satin': {
    arName: 'ساتان حرير / ساتان دوتشيس (Satin)',
    frName: 'Satin de Soie / Satin Duchesse',
    pricePerMeterMAD: '30 - 65 درهم/متر (جملة)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، سوق الأثواب',
    pros: 'لمعة فاخرة، ملمس ناعم، يعطي قيمة عالية للبياسة في السهرات والمناسبات',
    cons: 'حساس للحرارة والماء، كيبين عيوب الخياطة إذا ما كانتش متقنة 100%'
  },
  'dentelle': {
    arName: 'دانتيلا / كيبير فرنسي (Dentelle / Guipure)',
    frName: 'Dentelle / Guipure de luxe',
    pricePerMeterMAD: '60 - 180 درهم/متر',
    markets: 'درب عمر (شارع القصور)، محلات الأثواب المستوردة',
    pros: 'مظهر راقي جداً، يضيف لمسة كوتور (Couture) وتفاصيل فاخرة للبياسة',
    cons: 'سعر مرتفع، يحتاج تبطين (Doublure) ودقة عالية في التفصيل والقص'
  },
  'lin': {
    arName: 'كتان طبيعي / لينن ممتاز (Lin)',
    frName: 'Lin naturel de qualité',
    pricePerMeterMAD: '40 - 75 درهم/متر (جملة)',
    markets: 'درب عمر، القيساريات التجارية بالمغرب',
    pros: 'بارد وممتاز للصيف، متين جداً، موضة مطلوبة بكثرة في السوق المغربي',
    cons: 'كيتكمش بسرعة وكيتطلب التحديد (الحديد) المستمر'
  },
  'brocart': {
    arName: 'بروكار مغربي / بهجة ملكية (Brocart)',
    frName: 'Brocart / Bahja Traditionnelle',
    pricePerMeterMAD: '120 - 350 درهم/متر',
    markets: 'سوق الغزل بفاس، درب السلطان والدرب الكبير بالدار البيضاء',
    pros: 'فخامة مغربية أصيلة، قوام واقف ومناسب للقفطان والتكشيطة والمناسبات الكبرى',
    cons: 'ثقيل في اللبس، مكلف من ناحية السلع والخياطة اليدوية (المعلم)'
  },
  'mousseline': {
    arName: 'موسلين / شيفون شفاف (Mousseline / Chiffon)',
    frName: 'Mousseline / Chiffon',
    pricePerMeterMAD: '15 - 35 درهم/متر (جملة)',
    markets: 'درب عمر، القريعة، قيسارية الأثواب',
    pros: 'خفيف جداً، انسيابي ورومانسي، رائع للطبقات والفساتين الصيفية',
    cons: 'شفاف يحتاج بطانة، حساس جداً للتمزق في الخياطة'
  }
};

function getFabricInfo(fabricName: string = '') {
  const lower = fabricName.toLowerCase();
  for (const key of Object.keys(FABRIC_CATALOG)) {
    if (lower.includes(key) || (key === 'crêpe' && (lower.includes('crepe') || lower.includes('كريب'))) || (key === 'satin' && (lower.includes('satin') || lower.includes('ساتان'))) || (key === 'dentelle' && (lower.includes('dentelle') || lower.includes('lace') || lower.includes('دانتيلا')))) {
      return FABRIC_CATALOG[key];
    }
  }
  return {
    arName: fabricName || 'ثوب مناسب للموديل (توصية عامة)',
    frName: fabricName || 'Tissu adapté au modèle',
    pricePerMeterMAD: '25 - 55 درهم/متر (تقديري حسب الجودة)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، القيساريات المحلية',
    pros: 'جودة ممتازة وسهل في التفصيل والخياطة بالورشة',
    cons: 'يجب التأكد من جودة الغزل وغسله أو تجربته قبل القص النهائي'
  };
}

export default function AISpace({ initialLead, onClose }: { initialLead?: Lead, onClose?: () => void }) {
  const { isAr, toggle } = useLang();
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
  const [activeTab, setActiveTab] = useState<'fiche' | 'mesures' | 'chat'>('chat');
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: isAr ? 'Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Ù…Ø³Ø§Ø­Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„. Ø§Ø±ÙØ¹ ØµÙˆØ±Ø© Ù…ÙˆØ¯ÙŠÙ„ Ù„Ù„Ø¨Ø¯Ø¡ ÙÙŠ ØªØ­Ù„ÙŠÙ„Ù‡Ø§.' : 'Bienvenue dans l\'espace d\'analyse. Uploadez une photo de modÃ¨le pour commencer.' }
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
    setApiKeyInput((import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key')) || '');
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
          ? `âœ… ØªÙ… ØªØ­Ù…ÙŠÙ„ ØµÙˆØ±Ø© Ø·Ù„Ø¨ Ø§Ù„Ø²Ø¨ÙˆÙ† ${lead.name} (${lead.type}). Ø§Ø¶ØºØ· Ø§Ù„Ø¢Ù† Ø¹Ù„Ù‰ "Ø¨Ø¯Ø¡ Ø§Ù„ØªØ­Ù„ÙŠÙ„" Ù„ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙ‚Ù†ÙŠØ© Ø§Ù„Ø°ÙƒÙŠØ©!`
          : `âœ… Image chargÃ©e depuis la demande de ${lead.name} (${lead.type}). Cliquez sur "Lancer l'analyse" pour gÃ©nÃ©rer la fiche technique !`
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
        category: cat === 'Robe' ? (isAr ? 'ÙØ³ØªØ§Ù† Ø¹ØµØ±ÙŠ (Robe)' : 'Robe Moderne') :
          cat === 'Caftan' ? (isAr ? 'Ù‚ÙØ·Ø§Ù† Ù…ØºØ±Ø¨ÙŠ (Caftan)' : 'Caftan Marocain') :
            cat === 'Djellaba' ? (isAr ? 'Ø¬Ù„Ø§Ø¨Ø© Ø¹ØµØ±ÙŠØ© (Djellaba)' : 'Djellaba Moderne') :
              cat === 'Chemise' ? (isAr ? 'Ù‚Ù…ÙŠØµ ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠ (Chemise)' : 'Chemise Classique') :
                (isAr ? 'Ø³Ø±ÙˆØ§Ù„ Ø¹ØµØ±ÙŠ (Pantalon)' : 'Pantalon Moderne')
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

      const extrasAr = ` | Ø§Ù„Ù‚ØµØ©: ${fitStr || 'Ø¹Ø§Ø¯ÙŠ'} | Ø§Ù„ØµØ¹ÙˆØ¨Ø©: ${compStr || 'Ù…ØªÙˆØ³Ø·'}`;
      const extrasFr = ` | Coupe: ${fitStr || 'Regular'} | ComplexitÃ©: ${compStr || 'Moyenne'}`;

      let ftDescription = isAr
        ? `Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª: ${analysisResult.components.join('ØŒ ')}${extrasAr}`
        : `Composants: ${analysisResult.components.join(', ')}${extrasFr}`;
      let ftMesures = customMesures;
      let ftConso = parseConso(analysisResult.consumption) || 2.50;

      if (mode === 'current' && analysisResult.pieces && analysisResult.pieces.length > 0) {
        const p = analysisResult.pieces[activePieceIdx];
        if (p) {
          const pFit = p.fit || fitStr;
          const pComp = p.complexity || compStr;
          const pExtAr = ` | Ø§Ù„Ù‚ØµØ©: ${pFit || 'Ø¹Ø§Ø¯ÙŠ'} | Ø§Ù„ØµØ¹ÙˆØ¨Ø©: ${pComp || 'Ù…ØªÙˆØ³Ø·'}`;
          const pExtFr = ` | Coupe: ${pFit || 'Regular'} | ComplexitÃ©: ${pComp || 'Moyenne'}`;

          ftModele = p.name;
          ftDescription = isAr ? `Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª: ${(p.components || []).join('ØŒ ')}${pExtAr}` : `Composants: ${(p.components || []).join(', ')}${pExtFr}`;
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
          ftDescription = isAr ? `Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª: ${allComps.join('ØŒ ')}${extrasAr}` : `Composants: ${allComps.join(', ')}${extrasFr}`;
        }
      } else {
        if (analysisResult.components && Array.isArray(analysisResult.components) && analysisResult.components.length > 0) {
          ftDescription = isAr ? `Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª: ${analysisResult.components.join('ØŒ ')}${extrasAr}` : `Composants: ${analysisResult.components.join(', ')}${extrasFr}`;
        }
      }

      const newFT: FicheTechnique = {
        id: genId(),
        modele: ftModele,
        description: ftDescription,
        client: isAr ? 'Ø§Ù‚ØªØ±Ø§Ø­ Ø®Ø¨ÙŠØ± BEYA' : 'Suggestion Expert',
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
        title: isAr ? "ØªØµØ¯ÙŠØ± Ù†Ø§Ø¬Ø­ Ù„Ù„Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„ØªÙ‚Ù†ÙŠØ© ðŸŽ‰" : "Exportation RÃ©ussie ðŸŽ‰",
        message: isAr
          ? `ØªÙ… Ø¨Ù†Ø¬Ø§Ø­ ØªØµØ¯ÙŠØ± "${ftModele}" Ø¥Ù„Ù‰ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©! ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¢Ù† Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø¨Ø§Ø·Ø±ÙˆÙ† ÙˆØ§Ù„Ù‚ÙŠØ§Ø³Ø§Øª Ù‡Ù†Ø§Ùƒ.`
          : `Le modÃ¨le "${ftModele}" a Ã©tÃ© exportÃ© avec succÃ¨s vers les Fiches Techniques !`,
        onConfirm: () => navigate('/fiches-techniques')
      });
    } catch (err) {
      console.error("Export Error:", err);
      setCustomAlert({
        title: isAr ? "Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØµØ¯ÙŠØ± âŒ" : "Erreur d'exportation âŒ",
        message: isAr ? "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØµØ¯ÙŠØ± Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰." : "Une erreur est survenue lors de l'exportation. Veuillez rÃ©essayer.",
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
        modele: isAr ? 'Ø§Ø³ØªØ´Ø§Ø±Ø© ØªÙ‚Ù†ÙŠØ©' : 'Consultation Experte',
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
        title: isAr ? "ØªÙ… Ø§Ù„Ø­ÙØ¸ Ø¨Ù†Ø¬Ø§Ø­ ðŸŽ‰" : "SauvegardÃ© avec succÃ¨s ðŸŽ‰",
        message: isAr 
          ? (initialLead ? "ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªÙ‚Ø±ÙŠØ± ÙˆØ¥Ø±ÙØ§Ù‚Ù‡ Ø¨ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ØŒ ÙˆØªÙ… ØªØµØ¯ÙŠØ±Ù‡ ÙƒÙ…Ù„Ù PDF Ø§Ø­ØªØ±Ø§ÙÙŠ." : "ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªÙ‚Ø±ÙŠØ± ÙÙŠ 'Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©' ÙˆØªØµØ¯ÙŠØ±Ù‡ ÙƒÙ…Ù„Ù PDF Ø§Ø­ØªØ±Ø§ÙÙŠ.")
          : (initialLead ? "Le rapport a Ã©tÃ© attachÃ© aux dÃ©tails du lead et exportÃ© en PDF." : "Le rapport a Ã©tÃ© sauvegardÃ© dans les Fiches Techniques et exportÃ© en PDF."),
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
          if (name && amount > 0 && !name.toLowerCase().includes('total') && !name.toLowerCase().includes('Ù…Ø¬Ù…ÙˆØ¹') && !name.toLowerCase().includes('revient')) {
            items.push({ designation: name, montant: amount, detail: cells[cells.length-1]?.replace(/\*+/g, '') || '' });
          }
        }
      }
      
      // Find total
      const totalLine = tableLines.find(l => l.toLowerCase().includes('total') || l.includes('Ù…Ø¬Ù…ÙˆØ¹') || l.includes('revient'));
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
        modelName: analysisResult?.category || (isAr ? 'Ù†Ù…ÙˆØ°Ø¬ Ù…Ù† Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ' : 'ModÃ¨le AI Expert')
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

    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (!apiKey) {
      // Fallback: simulated analysis
      setTimeout(() => {
        setAnalysisResult({
          category: isAr ? 'ÙØ³ØªØ§Ù† Ø¹ØµØ±ÙŠ (Robe)' : 'Robe Moderne',
          consumption: '2.40m - 2.80m',
          complexity: isAr ? 'Ù…ØªÙˆØ³Ø·Ø©' : 'Moyenne',
          components: [
            isAr ? 'ØµØ¯Ø± Ù…Ø¨Ø·Ù†' : 'Buste doublÃ©',
            isAr ? 'Ø£ÙƒÙ…Ø§Ù… Ø·ÙˆÙŠÙ„Ø©' : 'Manches longues',
            isAr ? 'Ø³Ø­Ø§Ø¨ Ù…Ø®ÙÙŠ' : 'Fermeture invisible',
            isAr ? 'Ø­Ø²Ø§Ù… Ù…Ù†ÙØµÙ„' : 'Ceinture amovible'
          ],
          costEstimate: '85 MAD - 120 MAD'
        });
        setAnalyzing(false);
        setChat(prev => [...prev, {
          role: 'ai',
          text: (isAr ? 'ØªÙ… ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ (Ù…Ø­Ø§ÙƒØ§Ø©). Ù„ØªØ­Ù„ÙŠÙ„ Ø­Ù‚ÙŠÙ‚ÙŠ ÙˆØ¯Ù‚ÙŠÙ‚ Ù…Ø¹ ØªÙØµÙŠÙ„ ÙƒÙ„ Ù‚Ø·Ø¹Ø©ØŒ Ø£Ø¶Ù Ù…ÙØªØ§Ø­ Gemini API Ù…Ù† Ø²Ø± âš¡ Ø£Ø¹Ù„Ø§Ù‡!' : 'Analyse simulÃ©e. Pour une analyse rÃ©elle et dÃ©taillÃ©e, ajoutez la clÃ© API Gemini !')
        }]);
      }, 2500);
      return;
    }

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const analysisPrompt = isAr 
        ? `Ø£Ù†Øª Ø®Ø¨ÙŠØ± Ù†Ø³ÙŠØ¬ ÙˆØ®ÙŠØ§Ø·Ø© Ù…Ø­ØªØ±Ù ÙÙŠ Ù…ØµÙ†Ø¹ Ù…ØºØ±Ø¨ÙŠ. Ø­Ù„Ù„ Ù‡Ø°Ù‡ Ø§Ù„ØµÙˆØ±Ø© Ø¨Ø¯Ù‚Ø© Ø¹Ø§Ù„ÙŠØ© Ø¬Ø¯Ø§Ù‹.

Ø£Ø±ÙŠØ¯ Ù…Ù†Ùƒ ØªØ­Ù„ÙŠÙ„ ÙƒÙ„ Ù‚Ø·Ø¹Ø© Ù…Ù„Ø§Ø¨Ø³ ÙÙŠ Ø§Ù„ØµÙˆØ±Ø© Ø¨Ø´ÙƒÙ„ Ù…Ù†ÙØµÙ„ (Ù…Ø«Ù„Ø§Ù‹ Ø¥Ø°Ø§ ÙÙŠ Ø§Ù„ØµÙˆØ±Ø© ØªÙŠØ´Ø±Øª ÙˆØ³Ø±ÙˆØ§Ù„ØŒ Ø­Ù„Ù„ ÙƒÙ„ ÙˆØ§Ø­Ø¯ Ù„ÙˆØ­Ø¯Ùˆ).

Ù„ÙƒÙ„ Ù‚Ø·Ø¹Ø© Ø£Ø¹Ø·ÙŠÙ†ÙŠ:
1. Ø§Ø³Ù… Ø§Ù„Ù‚Ø·Ø¹Ø© (Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ÙˆØ§Ù„ÙØ±Ù†Ø³ÙŠØ©)
2. ÙƒÙ…ÙŠØ© Ø§Ù„Ø«ÙˆØ¨ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ø¨Ø§Ù„Ù…ØªØ±. Ø£Ø¹Ø·Ù†ÙŠ Ø§Ù„Ù‚ÙŠØ§Ø³ Ø¨Ø¯Ù‚Ø© Ù„Ø¹Ø±Ø¶ÙŠÙ† Ù…Ø®ØªÙ„ÙÙŠÙ† Ù„Ù„Ø«ÙˆØ¨: Ø¹Ø±Ø¶ 1.50Ù… ÙˆØ¹Ø±Ø¶ 1.80Ù….
3. Ù†ÙˆØ¹ Ø§Ù„ÙÙŠØª (Ù„Ø§ØµÙ‚/Ø¶ÙŠÙ‚ØŒ Ø¹Ø§Ø¯ÙŠ/Ø±ÙŠÙƒÙŠÙ„Ø§Ø±ØŒ ÙˆØ§Ø³Ø¹/Ù„Ø§Ø±Ø¬) - Ø­Ù„Ù„ Ù…Ù† Ø§Ù„ØµÙˆØ±Ø© ÙˆØ§Ø´ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ Ù„Ø§ØµÙ‚ ÙˆÙ„Ø§ ÙˆØ§Ø³Ø¹
4. Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØªØ¹Ù‚ÙŠØ¯ (Ø¨Ø³ÙŠØ·ØŒ Ù…ØªÙˆØ³Ø·ØŒ Ù…Ø¹Ù‚Ø¯)
5. Ø§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠØ© Ù„Ù„Ø®ÙŠØ§Ø·Ø© Ø¨Ø§Ù„Ø¯Ø±Ù‡Ù…
6. Ù…ÙƒÙˆÙ†Ø§Øª Ø§Ù„Ù‚Ø·Ø¹Ø© (Ø§Ù„Ø£Ø¬Ø²Ø§Ø¡: ØµØ¯Ø±ØŒ Ø¸Ù‡Ø±ØŒ Ø£ÙƒÙ…Ø§Ù…ØŒ ÙŠØ§Ù‚Ø©ØŒ Ø¬ÙŠÙˆØ¨...)
7. Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù‚ÙŠØ§Ø³Ø§Øª Ù„ÙƒÙ„ Ù…Ù‚Ø§Ø³ (S, M, L, XL, XXL) - Ø£Ø¹Ø·ÙŠ Ù‚ÙŠØ§Ø³Ø§Øª ÙˆØ§Ù‚Ø¹ÙŠØ©:
   - Ù„Ù„Ø¬Ø²Ø¡ Ø§Ù„Ø¹Ù„ÙˆÙŠ: Ø§Ù„ØµØ¯Ø±ØŒ Ø§Ù„ÙƒØªÙØŒ Ø§Ù„Ø·ÙˆÙ„ØŒ Ø§Ù„ÙƒÙ…ØŒ Ø§Ù„Ø®ØµØ±.
   - ØªÙ†Ø¨ÙŠÙ‡ Ù‡Ø§Ù… Ø¬Ø¯Ø§Ù‹: Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ø¹Ù„ÙˆÙŠØ© Ø·ÙˆÙŠÙ„Ø© (ØªØµÙ„ Ø£Ùˆ ØªØªØ¬Ø§ÙˆØ² Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø£Ø±Ø¯Ø§Ù/Ø§Ù„ÙˆØ±ÙƒØŒ Ù…Ø«Ù„ Ø§Ù„ÙØ³ØªØ§Ù†ØŒ Ø§Ù„Ø¬Ù„Ø§Ø¨Ø©ØŒ Ø§Ù„Ù‚ÙØ·Ø§Ù†ØŒ Ø£Ùˆ Ø§Ù„Ø¨Ù„ÙˆØ²Ø© Ø§Ù„Ø·ÙˆÙŠÙ„Ø© Tunique)ØŒ ÙŠØ¬Ø¨ Ø¹Ù„ÙŠÙƒ Ø¥Ø¶Ø§ÙØ© Ù‚ÙŠØ§Ø³ "Ø§Ù„ÙˆØ±Ùƒ (Hanches)" ÙƒÙ‚ÙŠØ§Ø³ Ø³Ø§Ø¯Ø³ Ø£Ø³Ø§Ø³ÙŠ ÙÙŠ Ø¬Ø¯ÙˆÙ„ Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø·Ø¹Ø©!
   - Ù„Ù„Ø³Ø±ÙˆØ§Ù„: Ø§Ù„Ø®ØµØ±ØŒ Ø§Ù„ÙˆØ±ÙƒØŒ Ø§Ù„Ø·ÙˆÙ„ØŒ Ø§Ù„ÙØ®Ø°ØŒ Ø£Ø³ÙÙ„ Ø§Ù„Ø±Ø¬Ù„.
8. Ù†ÙˆØ¹ Ø§Ù„Ø«ÙˆØ¨ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ Ø§Ù„Ù…Ù‚ØªØ±Ø­ Ù„ØµÙ†Ø§Ø¹Ø© Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø·Ø¹Ø© Ù…Ø¹ Ø§Ù‚ØªØ±Ø§Ø­ÙŠÙ† Ø¨Ø¯ÙŠÙ„ÙŠÙ† Ù„Ù„Ø«ÙˆØ¨ØŒ Ù…Ø¹ Ø°ÙƒØ± Ø§Ù„Ù…Ø²Ø§ÙŠØ§ ÙˆØ§Ù„Ø¹ÙŠÙˆØ¨ Ù„ÙƒÙ„ Ø¨Ø¯ÙŠÙ„ Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ© Ø¨Ø´ÙƒÙ„ Ù…Ø®ØªØµØ± ÙˆÙ…ÙÙŠØ¯ Ù„Ù„Ù…ØµÙ†Ø¹.

Ø£Ø¬Ø¨ Ø¨ØµÙŠØºØ© JSON ÙÙ‚Ø· Ø¨Ø¯ÙˆÙ† Ø£ÙŠ Ù†Øµ Ø¥Ø¶Ø§ÙÙŠØŒ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø´ÙƒÙ„:
{
  "category": "Ø§Ø³Ù… Ø¹Ø§Ù… Ù„Ù„Ù…ÙˆØ¯ÙŠÙ„",
  "totalConsumption": "Ø¹Ø±Ø¶ 1.50Ù…: X.XXm | Ø¹Ø±Ø¶ 1.80Ù…: X.XXm",
  "totalCost": "XX - XX MAD",
  "complexity": "Ù…ØªÙˆØ³Ø·Ø©",
  "fabricSuggested": "Ù†ÙˆØ¹ Ø§Ù„Ø«ÙˆØ¨ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ Ø§Ù„Ù…Ù‚ØªØ±Ø­ Ù„Ù„Ù…ÙˆØ¯ÙŠÙ„ ÙƒØ§Ù…Ù„",
  "fabricAlternatives": [
    {
      "name": "ÙƒØ±ÙŠØ¨ Ø±ÙŠØ­Ø§Ù†Ø© / CrÃªpe Rayhana",
      "pros": "Ø·Ø§ÙŠØ­ØŒ Ù…ÙƒÙŠØªØ¨ÙŠÙ†Ø´ØŒ ÙˆØ³Ø§Ù‡Ù„ ÙÙŠ Ø§Ù„Ø®ÙŠØ§Ø·Ø© ÙˆÙ…Ø±ÙŠØ­",
      "cons": "ÙƒÙŠØ´Ø±Ø¨ Ø´ÙˆÙŠØ© ÙÙŠ Ø§Ù„Ù…ØµÙ„ÙˆØ­"
    }
  ],
  "pieces": [
    {
      "name": "ØªÙŠØ´Ø±Øª / T-Shirt",
      "consumption": "Ø¹Ø±Ø¶ 1.50Ù…: 1.50m | Ø¹Ø±Ø¶ 1.80Ù…: 1.20m",
      "fit": "Ø¹Ø§Ø¯ÙŠ (Regular)",
      "complexity": "Ø¨Ø³ÙŠØ·",
      "costEstimate": "25 - 40 MAD",
      "components": ["ØµØ¯Ø± Ø£Ù…Ø§Ù…ÙŠ", "Ø¸Ù‡Ø±", "Ø£ÙƒÙ…Ø§Ù… Ù‚ØµÙŠØ±Ø©", "ÙŠØ§Ù‚Ø© Ø¯Ø§Ø¦Ø±ÙŠØ©"],
      "fabricSuggested": "Ù‚Ø·Ù† Ù„ÙŠÙƒØ±Ø§ / Coton Lycra",
      "fabricAlternatives": [],
      "mesures": [
        {"nom": "Ø§Ù„ØµØ¯Ø± (Poitrine)", "valeurs": {"S": 90, "M": 96, "L": 102, "XL": 108, "XXL": 114}}
      ]
    }
  ]
}`
        : `Tu es un expert textile et confection professionnel. Analyse cette image avec une trÃ¨s haute prÃ©cision.

Je veux une analyse de chaque vÃªtement prÃ©sent sur l'image sÃ©parÃ©ment.

Pour chaque piÃ¨ce, donne-moi :
1. Nom de la piÃ¨ce (en FranÃ§ais)
2. Consommation de tissu en mÃ¨tres. Donne la mesure pour deux laizes : 1.50m et 1.80m.
3. Type de Fit (Slim, Regular, Loose/Large) - analyse si le modÃ¨le est serrÃ© ou large d'aprÃ¨s la photo.
4. Niveau de complexitÃ© (Simple, Moyen, Complexe)
5. CoÃ»t estimÃ© de confection en MAD
6. Composants de la piÃ¨ce (Buste, dos, manches, col, poches...)
7. Tableau des mesures pour chaque taille (S, M, L, XL, XXL) :
   - Haut : Poitrine, Ã‰paules, Longueur, Manche, Taille. (Ajoute Hanches si c'est une piÃ¨ce longue comme une robe).
   - Pantalon : Taille, Hanches, Longueur, Cuisse, Bas.
8. Type de tissu principal suggÃ©rÃ© et deux alternatives avec avantages/inconvÃ©nients.

RÃ©ponds UNIQUEMENT au format JSON sans texte additionnel :
{
  "category": "Nom gÃ©nÃ©ral du modÃ¨le",
  "totalConsumption": "Laize 1.50m : X.XXm | Laize 1.80m : X.XXm",
  "totalCost": "XX - XX MAD",
  "complexity": "Moyenne",
  "fabricSuggested": "Tissu suggÃ©rÃ©",
  "fabricAlternatives": [
    {
      "name": "Nom du tissu",
      "pros": "Avantages",
      "cons": "InconvÃ©nients"
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
          throw new Error("Ø§Ù„Ø®ÙˆØ§Ø¯Ù… Ø¯ÙŠØ§Ù„ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø¹Ù„ÙŠÙ‡Ø§ Ø¶ØºØ· ÙƒØ¨ÙŠØ± Ø¯Ø§Ø¨Ø§. â³ ØªØ³Ù†Ù‰ Ø´ÙˆÙŠØ© ÙˆØ¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨ Ù…Ø±Ø© Ø®Ø±Ù‰!");
        } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
          throw new Error("âš ï¸ Ù…ÙØªØ§Ø­Ùƒ Ù…Ø§Ø¹Ù†Ø¯Ùˆ Ø­ØªÙ‰ Ø±ØµÙŠØ¯ (Limit: 0). Google ÙƒØªÙØ±Ø¶ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¯ÙØ¹ (Billing) ÙÙŠ Ø­Ø³Ø§Ø¨ Google Cloud Ø¯ÙŠØ§Ù„Ùƒ Ø¨Ø§Ø´ ØªÙ‚Ø¯Ø± ØªØ®Ø¯Ù… Ø§Ù„Ù€ API ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨.");
        } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
          throw new Error("âš ï¸ Ù‡Ø§Ø¯ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ØºÙŠØ± Ù…ØªØ§Ø­ Ù„Ù„Ù…ÙØªØ§Ø­ Ø¯ÙŠØ§Ù„Ùƒ (" + errMsg + "). ØªØ£ÙƒØ¯ Ø¨Ø§Ù„Ù„ÙŠ ÙØ¹Ù„ØªÙŠ Ø§Ù„Ù€ API Ø§Ù„ØµØ­ÙŠØ­.");
        } else if (errMsg.includes('API key not valid')) {
          throw new Error("âš ï¸ Ø§Ù„Ù…ÙØªØ§Ø­ (API Key) Ø§Ù„Ù„ÙŠ Ø¯Ø®Ù„ØªÙŠ ØºÙŠØ± ØµØ­ÙŠØ­.");
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
          category: parsed.category || 'Ù…ÙˆØ¯ÙŠÙ„',
          consumption: parsed.totalConsumption || parsed.consumption || 'â€”',
          fit: parsed.fit || (parsed.pieces?.[0]?.fit) || 'Ø¹Ø§Ø¯ÙŠ',
          complexity: parsed.complexity || 'Ù…ØªÙˆØ³Ø·Ø©',
          costEstimate: parsed.totalCost || parsed.costEstimate || 'â€”',
          components: [],
          pieces: [],
          fabricSuggested: parsed.fabricSuggested || 'â€”',
          fabricAlternatives: parsed.fabricAlternatives || [],
          rawAnalysis: rawText
        };

        if (parsed.pieces && Array.isArray(parsed.pieces)) {
          result.pieces = parsed.pieces.map((p: any) => ({
            name: p.name || 'Ù‚Ø·Ø¹Ø©',
            consumption: p.consumption || 'â€”',
            fit: p.fit || 'Ø¹Ø§Ø¯ÙŠ',
            complexity: p.complexity || 'Ù…ØªÙˆØ³Ø·',
            costEstimate: p.costEstimate || 'â€”',
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
        if (!isAr && result.category === 'Ù…ÙˆØ¯ÙŠÙ„') result.category = 'ModÃ¨le';
        if (isAr && result.category === 'ModÃ¨le') result.category = 'Ù…ÙˆØ¯ÙŠÙ„';

        setAnalysisResult(result);
        setActiveTab('fiche');
        setAnalyzing(false);

        // Build rich chat message (mktoba mzn martba)
        const suggestedFabricName = result.fabricSuggested || (result.pieces?.[0]?.fabricSuggested) || '';
        const fabInfo = getFabricInfo(suggestedFabricName);

        let chatMsg = '';
        if (isAr) {
          chatMsg = `✅ تقرير التحليل التقني والتسعير للموديل (BEYA EXPERT)\n`;
          chatMsg += `────────────────────────────\n\n`;
          chatMsg += `🎯 التصنيف العام: [ ${result.category || 'موديل'} ] | درجة الصعوبة: [ ${result.complexity || 'متوسطة'} ]\n\n`;
          chatMsg += `🧵 الثوب الموصى به للموديل:\n`;
          chatMsg += `   • نوع الثوب: ${fabInfo.arName}\n`;
          chatMsg += `   • ثمن الجملة في المغرب: ${fabInfo.pricePerMeterMAD}\n`;
          chatMsg += `   • أماكن الشراء المعتمدة: ${fabInfo.markets}\n\n`;
          chatMsg += `💰 التكلفة التقديرية للبياسة (Prix de revient):\n`;
          chatMsg += `   • الإجمالي المقترح: ${result.costEstimate || '150 - 250 MAD'}\n`;
          chatMsg += `   • (يشمل ثمن القماش + الخياطة واليد العاملة بالورشة)\n\n`;
          chatMsg += `📏 استهلاك الثوب والقصة (المتراج):\n`;
          chatMsg += `   • ${result.consumption || 'عرض 1.50م: 1.80m | عرض 1.80م: 1.50m'}\n\n`;
          chatMsg += `📦 قائمة قطع الموديل ومكوناتها:\n`;
          if (result.pieces && result.pieces.length > 0) {
            result.pieces.forEach((p: any, idx: number) => {
              chatMsg += `   ${idx + 1}. ${p.name} (الفيت: ${p.fit || 'سليم/عادي'}) — التكلفة: ${p.costEstimate || '—'}\n`;
              if (p.components && p.components.length > 0) {
                chatMsg += `      ▪️ أجزاء الباترون: ${p.components.join('، ')}\n`;
              }
            });
          } else {
            chatMsg += `   • قطعة واحدة متكاملة للموديل\n`;
          }
          chatMsg += `\n✂️ توجيهات الورشة (الفصّال والخيّاط):\n`;
          chatMsg += `   • يُنصح بضبط جدول المقاسات S-XXL في التبويب المجاور قبل بدء التفصيل.\n`;
          chatMsg += `   • ميزة الثوب: ${fabInfo.pros}\n`;
          chatMsg += `────────────────────────────\n`;
          chatMsg += `⚡ يمكنك الآن استخدام أزرار التوزيع الفوري أدناه لإرسال التقرير لـ Devis PRO، الورشة، أو المشتريات!`;
        } else {
          chatMsg = `✅ RAPPORT D'ANALYSE TECHNIQUE & SOURCING (BEYA EXPERT)\n`;
          chatMsg += `────────────────────────────\n\n`;
          chatMsg += `🎯 Catégorie : [ ${result.category || 'Modèle'} ] | Complexité : [ ${result.complexity || 'Moyenne'} ]\n\n`;
          chatMsg += `🧵 Tissu recommandé & Sourcing Maroc :\n`;
          chatMsg += `   • Type de tissu : ${fabInfo.frName}\n`;
          chatMsg += `   • Prix de gros estimé : ${fabInfo.pricePerMeterMAD}\n`;
          chatMsg += `   • Marchés de référence : ${fabInfo.markets}\n\n`;
          chatMsg += `💰 Estimation du coût unitaire (Prix de revient) :\n`;
          chatMsg += `   • Coût total : ${result.costEstimate || '150 - 250 MAD'}\n`;
          chatMsg += `   • (Inclus : tissu + façon atelier de confection)\n\n`;
          chatMsg += `📏 Consommation de tissu par laize :\n`;
          chatMsg += `   • ${result.consumption || 'Laize 1.50m: 1.80m | Laize 1.80m: 1.50m'}\n\n`;
          chatMsg += `📦 Composition & Pièces du modèle :\n`;
          if (result.pieces && result.pieces.length > 0) {
            result.pieces.forEach((p: any, idx: number) => {
              chatMsg += `   ${idx + 1}. ${p.name} (Fit: ${p.fit || 'Regular'}) — Coût: ${p.costEstimate || '—'}\n`;
              if (p.components && p.components.length > 0) {
                chatMsg += `      ▪️ Patronage : ${p.components.join(', ')}\n`;
              }
            });
          } else {
            chatMsg += `   • Pièce complète et intégrée\n`;
          }
          chatMsg += `\n✂️ Conseils de confection Atelier :\n`;
          chatMsg += `   • Vérifiez le tableau des mesures S-XXL dans l'onglet voisin avant la coupe.\n`;
          chatMsg += `   • Propriété du tissu : ${fabInfo.pros}\n`;
          chatMsg += `────────────────────────────\n`;
          chatMsg += `⚡ Utilisez les boutons d'export rapide en bas pour envoyer vers Devis PRO, l'Atelier ou les Achats !`;
        }
        setChat(prev => [...prev, { role: 'ai', text: chatMsg }]);

      } catch (parseErr) {
        // JSON parsing failed, show raw text
        setAnalysisResult({
          category: isAr ? 'ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„' : 'Analyse du modÃ¨le',
          consumption: 'â€”',
          complexity: 'â€”',
          components: [],
          costEstimate: 'â€”',
          rawAnalysis: rawText
        });
        setAnalyzing(false);
        setChat(prev => [...prev, { role: 'ai', text: rawText }]);
      }
    } catch (err: any) {
      setAnalyzing(false);
      setChat(prev => [...prev, { role: 'ai', text: 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù„ÙŠÙ„: ' + err.message }]);
    }
  };

  const getSmartReply = (userMsg: string): string => {
    const m = userMsg.toLowerCase().trim();

    // Language switch overrides
    if (/(dwi.*arbya|dwi.*arbia|hder.*blarbya|hder.*arbya|hder.*arbia|parle.*arabe|arabe|arbya|arabic|Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©|ØªÙƒÙ„Ù….*Ø¹Ø±Ø¨ÙŠ|ØªØ­Ø¯Ø«.*Ø¹Ø±Ø¨ÙŠ)/i.test(m)) {
      setAiLangOverride('ar');
      return 'ÙˆØ§Ø®Ø§! ðŸ˜Š Ù…Ù† Ø¯Ø§Ø¨Ø§ ØºØ§Ù†Ù‡Ø¶Ø± Ù…Ø¹Ø§Ùƒ Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ© ÙˆØ§Ù„Ø¹Ø±Ø¨ÙŠØ©. ÙƒÙŠÙØ§Ø´ Ù†Ù‚Ø¯Ø± Ù†Ø¹Ø§ÙˆÙ†Ùƒ Ø§Ù„ÙŠÙˆÙ…ØŸ';
    }
    if (/(parle.*francais|parle.*franÃ§ais|dwi.*fransya|dwi.*fransia|dwi.*lfransya|french|francais|franÃ§ais|Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©)/i.test(m)) {
      setAiLangOverride('fr');
      return "D'accord ! ðŸ˜Š Ã€ partir de maintenant, je vais vous rÃ©pondre en franÃ§ais. Comment puis-je vous aider aujourd'hui ?";
    }

    const speakAr = aiLangOverride === 'ar' || (aiLangOverride === null && isAr);

    // Greetings
    if (/^(salam|salaam|slm|hi|hello|bonjour|bonsoir|hey|Ù…Ø±Ø­Ø¨Ø§|Ø§Ù„Ø³Ù„Ø§Ù…|Ø³Ù„Ø§Ù…|ØµØ¨Ø§Ø­|Ù…Ø³Ø§Ø¡|ahlan)/.test(m)) {
      return speakAr
        ? 'ÙˆØ¹Ù„ÙŠÙƒÙ… Ø§Ù„Ø³Ù„Ø§Ù…! ðŸ‘‹ Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Ù…Ø³Ø§Ø­Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„. ÙƒÙŠÙ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ØŸ ÙŠÙ…ÙƒÙ†Ùƒ Ø±ÙØ¹ ØµÙˆØ±Ø© Ù…ÙˆØ¯ÙŠÙ„ Ù„Ù„Ø¨Ø¯Ø¡ Ø£Ùˆ Ø·Ø±Ø­ Ø£ÙŠ Ø³Ø¤Ø§Ù„ ØªÙ‚Ù†ÙŠ.'
        : 'Salam ! ðŸ‘‹ Bienvenue dans l\'espace d\'analyse. Comment puis-je vous aider aujourd\'hui ? Vous pouvez uploader une photo ou me poser une question technique.';
    }
    // How are you
    if (/^(kif|kifash|cv|Ã§a va|labas|labess|comment|ÙƒÙŠÙ|Ù„Ø§Ø¨Ø§Ø³|ÙˆØ§Ø´)/.test(m)) {
      return speakAr
        ? 'Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ Ù„Ø§Ø¨Ø§Ø³! ðŸ˜Š Ø£Ù†Ø§ Ø¬Ø§Ù‡Ø² Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ. ÙˆØ§Ø´ Ø¹Ù†Ø¯Ùƒ Ø´ÙŠ Ù…ÙˆØ¯ÙŠÙ„ Ø¬Ø¯ÙŠØ¯ Ø¨ØºÙŠØªÙŠ Ù†Ø­Ù„Ù„Ùˆ Ù„ÙŠÙƒØŸ'
        : 'Ã‡a va bien, merci ! ðŸ˜Š Je suis prÃªt Ã  vous aider. Avez-vous un nouveau modÃ¨le Ã  analyser ?';
    }
    // Fabric / Tissu questions
    if (/(toub|tissu|fabric|Ù‚Ù…Ø§Ø´|Ø«ÙˆØ¨|Ù…ØªØ±|metre|consomm|conso|ÙƒÙ…ÙŠØ©|Ù‚Ø¯Ø´|chehal|combien.*tissu|combien.*metre)/i.test(m)) {
      return speakAr
        ? 'ðŸ§µ Ù„ØªØ­Ø¯ÙŠØ¯ ÙƒÙ…ÙŠØ© Ø§Ù„Ø«ÙˆØ¨ Ø¨Ø¯Ù‚Ø©ØŒ Ø£Ø­ØªØ§Ø¬ Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ + Ø¹Ø±Ø¶ Ø§Ù„Ø«ÙˆØ¨ (Ù…Ø«Ù„Ø§Ù‹ 1.50Ù… Ø£Ùˆ 2.80Ù…). Ø¨Ø´ÙƒÙ„ Ø¹Ø§Ù…:\nâ€¢ Ù‚Ù…ÙŠØµ: 1.20 - 1.60Ù…\nâ€¢ Ø³Ø±ÙˆØ§Ù„: 1.40 - 1.80Ù…\nâ€¢ ÙØ³ØªØ§Ù† Ù‚ØµÙŠØ±: 2.00 - 2.50Ù…\nâ€¢ ÙØ³ØªØ§Ù† Ø·ÙˆÙŠÙ„: 2.80 - 3.50Ù…\nâ€¢ Ø¬Ù„Ø§Ø¨Ø©: 3.00 - 4.00Ù…\n\nØ§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ÙˆØ³Ø£Ø¹Ø·ÙŠÙƒ ØªÙ‚Ø¯ÙŠØ±Ø§Ù‹ Ø£Ø¯Ù‚!'
        : 'ðŸ§µ Pour estimer la consommation prÃ©cise, j\'ai besoin de la photo du modÃ¨le + la laize du tissu (ex: 1.50m ou 2.80m). En gÃ©nÃ©ral :\nâ€¢ Chemise : 1.20 - 1.60m\nâ€¢ Pantalon : 1.40 - 1.80m\nâ€¢ Robe courte : 2.00 - 2.50m\nâ€¢ Robe longue : 2.80 - 3.50m\nâ€¢ Djellaba : 3.00 - 4.00m\n\nUploadez la photo pour une estimation plus prÃ©cise !';
    }
    // Cost / Price questions
    if (/(prix|cout|coÃ»t|cost|taman|Ø«Ù…Ù†|Ø³Ø¹Ø±|ØªÙƒÙ„ÙØ©|ÙƒÙ„ÙØ©|chehal|combien|price|devis|ÙÙ„ÙˆØ³|flous|money)/i.test(m)) {
      return speakAr
        ? 'ðŸ’° ØªÙƒÙ„ÙØ© Ø§Ù„Ø¥Ù†ØªØ§Ø¬ ØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø¹Ø¯Ø© Ø¹ÙˆØ§Ù…Ù„:\nâ€¢ Ù†ÙˆØ¹ Ø§Ù„Ø«ÙˆØ¨ ÙˆØ³Ø¹Ø±Ù‡ Ø¨Ø§Ù„Ù…ØªØ±\nâ€¢ ØªØ¹Ù‚ÙŠØ¯ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ (Ø¹Ø¯Ø¯ Ø§Ù„Ù‚Ø·Ø¹ØŒ Ø§Ù„ØªÙØ§ØµÙŠÙ„)\nâ€¢ ØªÙƒÙ„ÙØ© Ø§Ù„ÙŠØ¯ Ø§Ù„Ø¹Ø§Ù…Ù„Ø©\nâ€¢ Ø§Ù„Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª (Ø£Ø²Ø±Ø§Ø±ØŒ Ø³Ø­Ø§Ø¨Ø§Øª...)\n\nØ§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ÙˆØ³Ø£Ù‚Ø¯Ø± Ù„Ùƒ Ø§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©ØŒ Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù… Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙÙŠ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©.'
        : 'ðŸ’° Le coÃ»t de production dÃ©pend de plusieurs facteurs :\nâ€¢ Type de tissu et prix au mÃ¨tre\nâ€¢ ComplexitÃ© du modÃ¨le (nombre de piÃ¨ces, dÃ©tails)\nâ€¢ CoÃ»t de main d\'Å“uvre\nâ€¢ Accessoires (boutons, fermetures...)\n\nUploadez la photo du modÃ¨le et j\'estimerai le coÃ»t, ou utilisez le Calculateur de Prix dans Fiches Techniques.';
    }
    // Patronage / Pattern
    if (/(patron|pattern|Ø¨Ø§Ø·Ø±ÙˆÙ†|Ø¨Ø§ØªØ±ÙˆÙ†|ØªØµÙ…ÙŠÙ…|design|Ù‚Øµ|coupe|taille|Ù…Ù‚Ø§Ø³|Ù‚ÙŠØ§Ø³)/i.test(m)) {
      return speakAr
        ? 'âœ‚ï¸ Ø¨Ø§Ù„Ù†Ø³Ø¨Ø© Ù„Ù„Ø¨Ø§Ø·Ø±ÙˆÙ†ØŒ Ø­Ø§Ù„ÙŠØ§Ù‹ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ:\nâ€¢ ØªØ­Ø¯ÙŠØ¯ Ù…ÙƒÙˆÙ†Ø§Øª Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ (ØµØ¯Ø±ØŒ Ø£ÙƒÙ…Ø§Ù…ØŒ Ø¸Ù‡Ø±...)\nâ€¢ ØªÙ‚Ø¯ÙŠØ± Ø¹Ø¯Ø¯ Ø§Ù„Ù‚Ø·Ø¹ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©\nâ€¢ Ø§Ù‚ØªØ±Ø§Ø­ Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø®ÙŠØ§Ø·Ø©\n\nØ§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ÙˆØ³Ø£Ø­Ù„Ù„ Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª Ù„ÙŠÙƒ. Ù„Ø¨Ø§Ø·Ø±ÙˆÙ† Ø§Ø­ØªØ±Ø§ÙÙŠ (DXF) ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨Ø±Ù†Ø§Ù…Ø¬ Ù…Ø«Ù„ Lectra Ø£Ùˆ Optitex.'
        : 'âœ‚ï¸ Concernant le patronage, je peux vous aider avec :\nâ€¢ Identification des composants du modÃ¨le (buste, manches, dos...)\nâ€¢ Estimation du nombre de piÃ¨ces nÃ©cessaires\nâ€¢ Suggestion des Ã©tapes de confection\n\nUploadez la photo et j\'analyserai les composants. Pour un patronage professionnel (DXF), utilisez Lectra ou Optitex.';
    }
    // Production steps
    if (/(Ã©tape|etape|Ù…Ø±Ø§Ø­Ù„|Ù…Ø±Ø­Ù„Ø©|production|confection|Ø®ÙŠØ§Ø·Ø©|montage|ØªØ±ÙƒÙŠØ¨|process|ÙƒÙŠÙØ§Ø´|comment faire)/i.test(m)) {
      return speakAr
        ? 'ðŸ­ Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ø£ÙŠ Ù‚Ø·Ø¹Ø©:\n1ï¸âƒ£ Ø§Ù„Ø¨Ø§Ø·Ø±ÙˆÙ† (Patronage) - ØªØµÙ…ÙŠÙ… Ø§Ù„Ù‚Ø§Ù„Ø¨\n2ï¸âƒ£ Ø§Ù„Ù‚Øµ (Coupe) - Ù‚Øµ Ø§Ù„Ø«ÙˆØ¨\n3ï¸âƒ£ Ø§Ù„ØªØ±ÙƒÙŠØ¨ (Montage) - Ø®ÙŠØ§Ø·Ø© Ø§Ù„Ù‚Ø·Ø¹\n4ï¸âƒ£ Ø§Ù„ØªØ´Ø·ÙŠØ¨ (Finition) - Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©\n5ï¸âƒ£ Ø§Ù„ÙƒÙŠ (Repassage)\n6ï¸âƒ£ Ø§Ù„Ù…Ø±Ø§Ù‚Ø¨Ø© (ContrÃ´le QualitÃ©)\n7ï¸âƒ£ Ø§Ù„ØªØºÙ„ÙŠÙ (Emballage)\n\nØ§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ÙˆØ³Ø£Ø­Ø¯Ø¯ Ù„Ùƒ Ø§Ù„Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø®Ø§ØµØ© Ø¨Ù‡ Ø¨Ø¯Ù‚Ø© Ø£ÙƒØ¨Ø±!'
        : 'ðŸ­ Ã‰tapes de production standard :\n1ï¸âƒ£ Patronage - CrÃ©ation du patron\n2ï¸âƒ£ Coupe - DÃ©coupe du tissu\n3ï¸âƒ£ Montage - Assemblage des piÃ¨ces\n4ï¸âƒ£ Finition - DÃ©tails et retouches\n5ï¸âƒ£ Repassage\n6ï¸âƒ£ ContrÃ´le QualitÃ©\n7ï¸âƒ£ Emballage\n\nUploadez la photo du modÃ¨le et je dÃ©taillerai les Ã©tapes spÃ©cifiques !';
    }
    // Thanks
    if (/(merci|Ø´ÙƒØ±|Ø¨Ø§Ø±Ùƒ|thanks|thank|chokran|jazak)/i.test(m)) {
      return speakAr
        ? 'Ø¨Ù„Ø§ Ø¬Ù…ÙŠÙ„! ðŸ˜Š Ø£Ù†Ø§ Ù‡Ù†Ø§ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ. Ø¥Ø°Ø§ Ø§Ø­ØªØ¬Øª Ø£ÙŠ Ø´ÙŠØ¡ Ø¢Ø®Ø± Ù„Ø§ ØªØªØ±Ø¯Ø¯!'
        : 'Avec plaisir ! ðŸ˜Š Je suis toujours lÃ  pour vous aider. N\'hÃ©sitez pas si vous avez d\'autres questions !';
    }
    // Default - intelligent fallback
    return speakAr
      ? `ÙÙ‡Ù…Øª Ø³Ø¤Ø§Ù„Ùƒ Ø­ÙˆÙ„ "${userMsg}". ðŸ¤” Ù„Ø£Ø¹Ø·ÙŠÙƒ Ø¥Ø¬Ø§Ø¨Ø© Ø¯Ù‚ÙŠÙ‚Ø©ØŒ Ø£Ù†ØµØ­Ùƒ:\n\n1. Ø§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ Ø§Ù„Ù…Ø¹Ù†ÙŠ Ù„ØªØ­Ù„ÙŠÙ„ Ù…ÙØµÙ„\n2. Ø£Ùˆ Ø§Ø·Ø±Ø­ Ø³Ø¤Ø§Ù„Ùƒ Ø¨Ø´ÙƒÙ„ Ø£Ø¯Ù‚ (Ù…Ø«Ù„Ø§Ù‹: "Ø´Ø­Ø§Ù„ Ù…Ù† Ù…ØªØ± ÙƒÙŠØ­ØªØ§Ø¬ Ù‡Ø§Ø¯ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ØŸ")\n\nÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ: ÙƒÙ…ÙŠØ© Ø§Ù„Ø«ÙˆØ¨ØŒ Ø§Ù„ØªÙƒÙ„ÙØ©ØŒ Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ØŒ ÙˆØ§Ù„Ø¨Ø§Ø·Ø±ÙˆÙ†.`
      : `J'ai notÃ© votre question sur "${userMsg}". ðŸ¤” Pour une rÃ©ponse prÃ©cise, je vous conseille :\n\n1. D'uploader la photo du modÃ¨le concernÃ©\n2. Ou de prÃ©ciser votre question (ex: "Combien de mÃ¨tres pour ce modÃ¨le ?")\n\nJe peux vous aider avec : consommation tissu, coÃ»ts, Ã©tapes de production, et patronage.`;
  };

  const [translatingFabrics, setTranslatingFabrics] = useState(false);

  const translateFabricsBox = async () => {
    if (!analysisResult) return;
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (!apiKey) {
      setCustomAlert({ title: isAr ? "Ù…ÙØªØ§Ø­ API Ù…ÙÙ‚ÙˆØ¯" : "ClÃ© API manquante", message: isAr ? "Ø§Ù„Ù…Ø±Ø¬Ùˆ Ø¥Ø¶Ø§ÙØ© Ù…ÙØªØ§Ø­ Gemini Ø§Ù„Ø®Ø§Øµ Ø¨Ùƒ Ù„ØªØ±Ø¬Ù…Ø© Ø§Ù„Ù†Øµ." : "Veuillez ajouter votre clÃ© API Gemini pour traduire le texte.", isError: true });
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
      setCustomAlert({ title: isAr ? "Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ±Ø¬Ù…Ø©" : "Erreur de traduction", message: isAr ? "ÙØ´Ù„ ÙÙŠ ØªØ±Ø¬Ù…Ø© Ø§Ù„Ù†ØµØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰." : "Ã‰chec de la traduction, veuillez rÃ©essayer.", isError: true });
    } finally {
      setTranslatingFabrics(false);
    }
  };

  const sendDirect = async (directMsg: string) => {
    const userMessage = directMsg;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);

    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
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
          body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "Ø£Ù†Øª Ø®Ø¨ÙŠØ± ØªØ­Ù„ÙŠÙ„ ÙˆØªØµÙ…ÙŠÙ… ÙˆØªØ³Ø¹ÙŠØ± ÙÙŠ Ù…ØµÙ†Ø¹ Ù†Ø³ÙŠØ¬ Ù…ØºØ±Ø¨ÙŠ. ØªÙƒÙ„Ù… Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø§Ø­ØªØ±Ø§ÙÙŠ ÙˆÙˆØ¯ÙŠ. Ù…Ù‡Ù…ØªÙƒ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©: 1. Ø­Ø³Ø§Ø¨ ÙƒÙ…ÙŠØ§Øª Ø§Ù„Ø«ÙˆØ¨ Ø¨Ø¯Ù‚Ø©. 2. Ø¥Ø¹Ø·Ø§Ø¡ ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³Ø¹Ø§Ø± ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ØºØ±Ø¨ÙŠ (Ù…Ø«Ù„Ø§ Ø£Ø«Ù…Ù†Ø© Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø¯Ø±Ø¨ Ø¹Ù…Ø± Ø£Ùˆ Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¬Ù…Ù„Ø©). 3. Ø¥Ø°Ø§ Ø³Ø£Ù„Ùƒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù† Ø§Ù„ØªÙƒÙ„ÙØ©ØŒ Ø£Ø¹Ø·Ù‡ ØªÙØµÙŠÙ„Ø§Ù‹ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹: Ø«Ù…Ù† Ø§Ù„Ø«ÙˆØ¨ (Ø´Ø­Ø§Ù„ Ù„Ù„Ù…ØªØ± ÙˆØ§Ù„Ù…Ø¬Ù…ÙˆØ¹)ØŒ ØªÙƒÙ„ÙØ© Ø§Ù„Ø®ÙŠØ§Ø·Ø© (Ø§Ù„ÙŠØ¯ Ø§Ù„Ø¹Ø§Ù…Ù„Ø©)ØŒ ÙˆØ§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù‚Ø·Ø¹Ø© (Prix de revient). 4. Ø§Ù‚ØªØ±Ø­ Ø£Ù…Ø§ÙƒÙ† Ø´Ø±Ø§Ø¡ Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨. ÙƒÙ† Ù…ÙÙŠØ¯Ø§Ù‹ØŒ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹ ÙÙŠ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©ØŒ ÙˆØªØµØ±Ù ÙƒØ®Ø¨ÙŠØ± Ù†Ø³ÙŠØ¬ Ø­Ù‚ÙŠÙ‚ÙŠ." }] } })
        });
        let data = await response.json();
        
        if (data.error && (data.error.message.includes('high demand') || data.error.code === 503)) {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "Ø£Ù†Øª Ø®Ø¨ÙŠØ± ØªØ­Ù„ÙŠÙ„ ÙˆØªØµÙ…ÙŠÙ… ÙˆØªØ³Ø¹ÙŠØ± ÙÙŠ Ù…ØµÙ†Ø¹ Ù†Ø³ÙŠØ¬ Ù…ØºØ±Ø¨ÙŠ. ØªÙƒÙ„Ù… Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø§Ø­ØªØ±Ø§ÙÙŠ ÙˆÙˆØ¯ÙŠ. Ù…Ù‡Ù…ØªÙƒ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©: 1. Ø­Ø³Ø§Ø¨ ÙƒÙ…ÙŠØ§Øª Ø§Ù„Ø«ÙˆØ¨ Ø¨Ø¯Ù‚Ø©. 2. Ø¥Ø¹Ø·Ø§Ø¡ ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³Ø¹Ø§Ø± ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ØºØ±Ø¨ÙŠ (Ù…Ø«Ù„Ø§ Ø£Ø«Ù…Ù†Ø© Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø¯Ø±Ø¨ Ø¹Ù…Ø± Ø£Ùˆ Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¬Ù…Ù„Ø©). 3. Ø¥Ø°Ø§ Ø³Ø£Ù„Ùƒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù† Ø§Ù„ØªÙƒÙ„ÙØ©ØŒ Ø£Ø¹Ø·Ù‡ ØªÙØµÙŠÙ„Ø§Ù‹ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹: Ø«Ù…Ù† Ø§Ù„Ø«ÙˆØ¨ (Ø´Ø­Ø§Ù„ Ù„Ù„Ù…ØªØ± ÙˆØ§Ù„Ù…Ø¬Ù…ÙˆØ¹)ØŒ ØªÙƒÙ„ÙØ© Ø§Ù„Ø®ÙŠØ§Ø·Ø© (Ø§Ù„ÙŠØ¯ Ø§Ù„Ø¹Ø§Ù…Ù„Ø©)ØŒ ÙˆØ§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù‚Ø·Ø¹Ø© (Prix de revient). 4. Ø§Ù‚ØªØ±Ø­ Ø£Ù…Ø§ÙƒÙ† Ø´Ø±Ø§Ø¡ Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨. ÙƒÙ† Ù…ÙÙŠØ¯Ø§Ù‹ØŒ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹ ÙÙŠ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©ØŒ ÙˆØªØµØ±Ù ÙƒØ®Ø¨ÙŠØ± Ù†Ø³ÙŠØ¬ Ø­Ù‚ÙŠÙ‚ÙŠ." }] } })
          });
          data = await response.json();
        }

        let aiText = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          aiText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          const errMsg = data.error.message || '';
          if (errMsg.includes('high demand')) {
            aiText = "Ø¹Ø°Ø±Ø§Ù‹ØŒ Ø§Ù„Ø®ÙˆØ§Ø¯Ù… Ø¯ÙŠØ§Ù„ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø¹Ù„ÙŠÙ‡Ø§ Ø¶ØºØ· ÙƒØ¨ÙŠØ± Ø¯Ø§Ø¨Ø§. â³ ØªØ³Ù†Ù‰ Ø´ÙˆÙŠØ© ÙˆØ¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨ Ù…Ø±Ø© Ø®Ø±Ù‰!";
          } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
            aiText = "âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù…ÙØªØ§Ø­ (API Key): Ù…ÙØªØ§Ø­Ùƒ Ù…Ø§Ø¹Ù†Ø¯Ùˆ Ø­ØªÙ‰ Ø±ØµÙŠØ¯ (Limit: 0). Ù‡Ø§Ø¯Ø´ÙŠ ÙƒÙŠÙˆÙ‚Ø¹ Ø­ÙŠØª Google ÙƒØªÙØ±Ø¶ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¯ÙØ¹ (Billing) ÙÙŠ Ø­Ø³Ø§Ø¨ Google Cloud Ø¯ÙŠØ§Ù„Ùƒ Ø¨Ø§Ø´ ØªÙ‚Ø¯Ø± ØªØ®Ø¯Ù… Ø§Ù„Ù€ API ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨.";
          } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
            aiText = "âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù…ÙØªØ§Ø­: Ù‡Ø§Ø¯ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ØºÙŠØ± Ù…ØªØ§Ø­ Ù„Ù„Ù…ÙØªØ§Ø­ Ø¯ÙŠØ§Ù„Ùƒ (" + errMsg + ").";
          } else if (errMsg.includes('API key not valid')) {
            aiText = "âš ï¸ Ø®Ø·Ø£: Ø§Ù„Ù…ÙØªØ§Ø­ (API Key) Ø§Ù„Ù„ÙŠ Ø¯Ø®Ù„ØªÙŠ ØºÙŠØ± ØµØ­ÙŠØ­.";
          } else {
            aiText = "Ø®Ø·Ø£: " + errMsg;
          }
        } else {
          aiText = 'Ù„Ù… Ø£Ø³ØªØ·Ø¹ ÙÙ‡Ù… Ø§Ù„Ø±Ø¯.';
        }
        setChat(prev => { const n = [...prev]; n.pop(); return [...n, { role: 'ai', text: aiText }]; });
      } catch (e: any) {
        setChat(prev => { const n = [...prev]; n.pop(); return [...n, { role: 'ai', text: 'Ø®Ø·Ø£: ' + e.message }]; });
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

    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
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
              parts: [{ text: "Ø£Ù†Øª Ø®Ø¨ÙŠØ± ØªØ­Ù„ÙŠÙ„ ÙˆØªØµÙ…ÙŠÙ… ÙˆØªØ³Ø¹ÙŠØ± ÙÙŠ Ù…ØµÙ†Ø¹ Ù†Ø³ÙŠØ¬ Ù…ØºØ±Ø¨ÙŠ. ØªÙƒÙ„Ù… Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø§Ø­ØªØ±Ø§ÙÙŠ ÙˆÙˆØ¯ÙŠ. Ù…Ù‡Ù…ØªÙƒ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©: 1. Ø­Ø³Ø§Ø¨ ÙƒÙ…ÙŠØ§Øª Ø§Ù„Ø«ÙˆØ¨ Ø¨Ø¯Ù‚Ø©. 2. Ø¥Ø¹Ø·Ø§Ø¡ ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³Ø¹Ø§Ø± ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ØºØ±Ø¨ÙŠ (Ù…Ø«Ù„Ø§ Ø£Ø«Ù…Ù†Ø© Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø¯Ø±Ø¨ Ø¹Ù…Ø± Ø£Ùˆ Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¬Ù…Ù„Ø©). 3. Ø¥Ø°Ø§ Ø³Ø£Ù„Ùƒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù† Ø§Ù„ØªÙƒÙ„ÙØ©ØŒ Ø£Ø¹Ø·Ù‡ ØªÙØµÙŠÙ„Ø§Ù‹ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹: Ø«Ù…Ù† Ø§Ù„Ø«ÙˆØ¨ (Ø´Ø­Ø§Ù„ Ù„Ù„Ù…ØªØ± ÙˆØ§Ù„Ù…Ø¬Ù…ÙˆØ¹)ØŒ ØªÙƒÙ„ÙØ© Ø§Ù„Ø®ÙŠØ§Ø·Ø© (Ø§Ù„ÙŠØ¯ Ø§Ù„Ø¹Ø§Ù…Ù„Ø©)ØŒ ÙˆØ§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù‚Ø·Ø¹Ø© (Prix de revient). 4. Ø§Ù‚ØªØ±Ø­ Ø£Ù…Ø§ÙƒÙ† Ø´Ø±Ø§Ø¡ Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨. ÙƒÙ† Ù…ÙÙŠØ¯Ø§Ù‹ØŒ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹ ÙÙŠ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©ØŒ ÙˆØªØµØ±Ù ÙƒØ®Ø¨ÙŠØ± Ù†Ø³ÙŠØ¬ Ø­Ù‚ÙŠÙ‚ÙŠ." }]
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
                parts: [{ text: "Ø£Ù†Øª Ø®Ø¨ÙŠØ± ØªØ­Ù„ÙŠÙ„ ÙˆØªØµÙ…ÙŠÙ… ÙˆØªØ³Ø¹ÙŠØ± ÙÙŠ Ù…ØµÙ†Ø¹ Ù†Ø³ÙŠØ¬ Ù…ØºØ±Ø¨ÙŠ. ØªÙƒÙ„Ù… Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ© Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø§Ø­ØªØ±Ø§ÙÙŠ ÙˆÙˆØ¯ÙŠ. Ù…Ù‡Ù…ØªÙƒ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©: 1. Ø­Ø³Ø§Ø¨ ÙƒÙ…ÙŠØ§Øª Ø§Ù„Ø«ÙˆØ¨ Ø¨Ø¯Ù‚Ø©. 2. Ø¥Ø¹Ø·Ø§Ø¡ ØªÙ‚Ø¯ÙŠØ±Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ø£Ø³Ø¹Ø§Ø± ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ØºØ±Ø¨ÙŠ (Ù…Ø«Ù„Ø§ Ø£Ø«Ù…Ù†Ø© Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø¯Ø±Ø¨ Ø¹Ù…Ø± Ø£Ùˆ Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¬Ù…Ù„Ø©). 3. Ø¥Ø°Ø§ Ø³Ø£Ù„Ùƒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù† Ø§Ù„ØªÙƒÙ„ÙØ©ØŒ Ø£Ø¹Ø·Ù‡ ØªÙØµÙŠÙ„Ø§Ù‹ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹: Ø«Ù…Ù† Ø§Ù„Ø«ÙˆØ¨ (Ø´Ø­Ø§Ù„ Ù„Ù„Ù…ØªØ± ÙˆØ§Ù„Ù…Ø¬Ù…ÙˆØ¹)ØŒ ØªÙƒÙ„ÙØ© Ø§Ù„Ø®ÙŠØ§Ø·Ø© (Ø§Ù„ÙŠØ¯ Ø§Ù„Ø¹Ø§Ù…Ù„Ø©)ØŒ ÙˆØ§Ù„ØªÙƒÙ„ÙØ© Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ù„Ù‚Ø·Ø¹Ø© (Prix de revient). 4. Ø§Ù‚ØªØ±Ø­ Ø£Ù…Ø§ÙƒÙ† Ø´Ø±Ø§Ø¡ Ø§Ù„Ø£Ø«ÙˆØ§Ø¨ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨. ÙƒÙ† Ù…ÙÙŠØ¯Ø§Ù‹ØŒ Ø¯Ù‚ÙŠÙ‚Ø§Ù‹ ÙÙŠ Ø§Ù„Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠØ©ØŒ ÙˆØªØµØ±Ù ÙƒØ®Ø¨ÙŠØ± Ù†Ø³ÙŠØ¬ Ø­Ù‚ÙŠÙ‚ÙŠ." }]
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
            aiResponseText = "Ø¹Ø°Ø±Ø§Ù‹ØŒ Ø§Ù„Ø®ÙˆØ§Ø¯Ù… Ø¯ÙŠØ§Ù„ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ (Google API) Ø¹Ù„ÙŠÙ‡Ø§ Ø¶ØºØ· ÙƒØ¨ÙŠØ± Ø¯Ø§Ø¨Ø§. â³ ØªØ³Ù†Ù‰ Ø´ÙˆÙŠØ© ÙˆØ¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨ Ù…Ø±Ø© Ø®Ø±Ù‰!";
          } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
            aiResponseText = "âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù…ÙØªØ§Ø­ (API Key): Ù…ÙØªØ§Ø­Ùƒ Ù…Ø§Ø¹Ù†Ø¯Ùˆ Ø­ØªÙ‰ Ø±ØµÙŠØ¯ (Limit: 0). Ù‡Ø§Ø¯Ø´ÙŠ ÙƒÙŠÙˆÙ‚Ø¹ Ø­ÙŠØª Google ÙƒØªÙØ±Ø¶ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¯ÙØ¹ (Billing) ÙˆØ¥Ø¶Ø§ÙØ© Ø¨Ø·Ø§Ù‚Ø© Ø¨Ù†ÙƒÙŠØ© ÙÙŠ Ø­Ø³Ø§Ø¨ Google Cloud Ø¯ÙŠØ§Ù„Ùƒ Ø¨Ø§Ø´ ØªÙ‚Ø¯Ø± ØªØ®Ø¯Ù… Ø§Ù„Ù€ API ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨ØŒ ÙˆØ§Ø®Ø§ Ù‡Ùˆ Ù…Ø¬Ø§Ù†ÙŠ.";
          } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
            aiResponseText = "âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù…ÙØªØ§Ø­: Ù‡Ø§Ø¯ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ (Gemini 1.5) ØºÙŠØ± Ù…ØªØ§Ø­ Ù„Ù„Ù…ÙØªØ§Ø­ Ø¯ÙŠØ§Ù„Ùƒ. ØªØ£ÙƒØ¯ Ø¨Ø§Ù„Ù„ÙŠ ÙØ¹Ù„ØªÙŠ Ø§Ù„Ù€ API Ø§Ù„ØµØ­ÙŠØ­ ÙÙŠ Google Cloud Console.";
          } else if (errMsg.includes('API key not valid')) {
            aiResponseText = "âš ï¸ Ø®Ø·Ø£: Ø§Ù„Ù…ÙØªØ§Ø­ (API Key) Ø§Ù„Ù„ÙŠ Ø¯Ø®Ù„ØªÙŠ ØºÙŠØ± ØµØ­ÙŠØ­. Ø§Ù„Ù…Ø±Ø¬Ùˆ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ù†Ø³Ø®Ù‡ Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­ Ù…Ù† Google AI Studio.";
          } else {
            aiResponseText = "Ø¹Ø°Ø±Ø§Ù‹ØŒ ÙˆÙ‚Ø¹ Ø®Ø·Ø£ ÙÙŠ ÙˆØ§Ø¬Ù‡Ø© Ø¨Ø±Ù…Ø¬Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª (API Error): " + errMsg;
          }
        } else {
          aiResponseText = "Ù„Ù… Ø£Ø³ØªØ·Ø¹ ÙÙ‡Ù… Ø§Ù„Ø±Ø¯. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.";
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
          return [...newChat, { role: 'ai', text: "ÙˆÙ‚Ø¹ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„: " + e.message }];
        });
      }
    } else {
      setTimeout(() => {
        setChat(prev => [...prev, { role: 'ai', text: getSmartReply(userMessage) + "\n\nðŸ’¡ (Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø­Ù‚ÙŠÙ‚ÙŠ ÙŠÙÙ‡Ù… Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© ÙˆÙŠØ­Ù„Ù„ Ø§Ù„ØµÙˆØ± Ø¨Ø¯Ù‚Ø©ØŒ Ù‚Ù… Ø¨Ø¥Ø¶Ø§ÙØ© Ù…ÙØªØ§Ø­ Gemini API Ù…Ù† Ø²Ø± Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø£Ø¹Ù„Ø§Ù‡!)" }]);
      }, 800);
    }
  };

  const activePiece = analysisResult?.pieces?.[activePieceIdx] || null;
  const currentFabricSuggested = activePiece?.fabricSuggested || analysisResult?.fabricSuggested || '';
  const fabInfo = getFabricInfo(currentFabricSuggested);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 pb-4 overflow-hidden select-none">
      {/* Compact Header Bar */}
      <div className={`flex items-center justify-between gap-4 py-2 border-b border-slate-100 flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">BEYA <span className="text-indigo-600 not-italic">TACTICAL HUD</span></h1>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">v2.1 Zero-Scroll</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">{isAr ? 'المستشار الذكي لتحليل وتفصيل ومقاسات الموديل (شاشة موحدة بدون تمرير)' : 'Cockpit d\'Analyse Textile & Confection (Zéro Scroll)'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeadsModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl font-black text-xs uppercase hover:bg-indigo-100 transition-all shadow-sm"
          >
            <Package className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{isAr ? 'اختيار من الطلبات' : 'Demandes Prospects'}</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" /> <span>{isAr ? 'رفع صورة' : 'Uploader Image'}</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
      </div>

      {/* Main 2-Column Cockpit Grid (Zero-Scroll) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden mt-3">
        
        {/* LEFT COLUMN: Photo Cockpit & One-Click Dispatch Engine (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden h-full">
          {/* Photo Cockpit Box */}
          <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden relative flex flex-col min-h-0 shadow-lg border border-slate-800 group">
            {!image ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-700 rounded-3xl hover:border-indigo-400 hover:text-indigo-300 transition-all cursor-pointer p-6 text-center" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-12 h-12 mb-3 text-indigo-400" />
                <p className="font-black text-xs uppercase tracking-wider">{isAr ? 'اضغط لرفع صورة الموديل أو التصميم' : 'Cliquez pour uploader le modèle'}</p>
                <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'يدعم الصور عالية الدقة (JPG, PNG)' : 'JPG, PNG haute résolution'}</p>
              </div>
            ) : (
              <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-950/80 flex items-center justify-center">
                <img src={image} className="w-full h-full object-contain max-h-[320px]" alt="Model" />
                <button onClick={() => setShowFullImage(true)} className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-slate-700 hover:bg-white hover:scale-105 transition-all shadow-md border border-slate-100" title={isAr ? 'تكبير الصورة' : 'Agrandir'}>
                  <Eye className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => setImage(null)} className="bg-white/90 p-3 rounded-xl text-rose-600 hover:bg-white transition-all shadow-xl" title="حذف الصورة"><RefreshCw className="w-5 h-5" /></button>
                  {!analysisResult && <button onClick={startAnalysis} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:bg-indigo-700"><Sparkles className="w-4 h-4" /> {isAr ? 'بدء التحليل الفوري' : 'Lancer l\'analyse'}</button>}
                </div>
                {analyzing && (
                  <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                    <RefreshCw className="w-10 h-10 animate-spin mb-3" />
                    <p className="font-black text-sm uppercase tracking-tight animate-pulse">{isAr ? 'جاري تحليل الأثواب والمقاسات...' : 'Analyse des tissus...'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ONE-CLICK DISPATCH ENGINE (محرك التوزيع الفوري) */}
          <div className="flex-shrink-0 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">{isAr ? 'توزيع بيانات التحليل فورا (One-Click Dispatch)' : 'Engine de Distribution Rapide'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'أرسل المقاسات والثوب للأدوات بضغطة زر واحدة' : 'Export direct vers les modules de production'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (analysisResult) {
                    sendToDevis(analysisResult.rawAnalysis || JSON.stringify(analysisResult));
                  } else {
                    setCustomAlert({
                      title: isAr ? 'تنبيه' : 'Attention',
                      message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                      isError: true
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-700 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <DollarSign className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'تسعير Devis PRO' : 'Devis PRO'}</span>
              </button>

              <button
                onClick={() => {
                  if (analysisResult) {
                    exportToFicheTechnique();
                  } else {
                    setCustomAlert({
                      title: isAr ? 'تنبيه' : 'Attention',
                      message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                      isError: true
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 text-indigo-700 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'البطاقة التقنية' : 'Fiche Technique'}</span>
              </button>

              <button
                onClick={() => {
                  if (analysisResult) {
                    const atelierData = {
                      modelName: analysisResult.category || 'Modèle Atelier',
                      tissuMetrage: analysisResult.consumption || '2.0m',
                      complexity: analysisResult.complexity || 'Moyenne',
                      prixEstimation: analysisResult.costEstimate || '150 MAD',
                      pieces: analysisResult.pieces || [],
                      timestamp: Date.now()
                    };
                    localStorage.setItem('beya_atelier_import', JSON.stringify(atelierData));
                    setCustomAlert({
                      title: isAr ? "تم إرسال الموديل لورشة الإنتاج ✂️" : "Transmis à l'Atelier ✂️",
                      message: isAr 
                        ? "تم تسجيل بيانات القص والخياطة (المتراج، الصعوبة، وقطع الموديل) لعمال الورشة. هل تريد فتح حاسبة الورشة الآن؟"
                        : "Instructions de coupe et confection transmises à l'Atelier. Ouvrir le calculateur atelier ?",
                      onConfirm: () => navigate('/atelier-calculator')
                    });
                  } else {
                    setCustomAlert({
                      title: isAr ? 'تنبيه' : 'Attention',
                      message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                      isError: true
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 text-amber-800 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <Scissors className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'إرسال للورشة Atelier' : 'Atelier Production'}</span>
              </button>

              <button
                onClick={() => {
                  if (analysisResult) {
                    const achData = {
                      tissuSuggested: analysisResult.fabricSuggested || '',
                      consumption: analysisResult.consumption || '',
                      modelName: analysisResult.category || '',
                      timestamp: Date.now()
                    };
                    localStorage.setItem('beya_achats_import', JSON.stringify(achData));
                    setCustomAlert({
                      title: isAr ? "تم إرسال الطلب لقسم المشتريات 📦" : "Transmis aux Achats 📦",
                      message: isAr 
                        ? "تم توجيه توصية القماش المطلوب وسعر الجملة (درب عمر / القريعة) والكمية لمسؤول الشراء. هل تريد الانتقال للمشتريات؟"
                        : "Demande de tissu et prix de gros Maroc transmise aux achats. Ouvrir la page Achats ?",
                      onConfirm: () => navigate('/achats')
                    });
                  } else {
                    setCustomAlert({
                      title: isAr ? 'تنبيه' : 'Attention',
                      message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                      isError: true
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 text-purple-700 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <Package className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'المشتريات والأثواب' : 'Achats Tissus'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed HUD Cockpit (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-full">
          {/* Tab Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50/70 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('fiche')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'fiche'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? '📊 البطاقة التقنية و الأثمنة' : 'Fiche & Prix IA'}</span>
              </button>

              <button
                onClick={() => setActiveTab('mesures')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'mesures'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{isAr ? '📏 جدول المقاسات S-XXL' : 'Tableau Mesures'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? '💬 المستشار الذكي' : 'Chat IA'}</span>
              </button>

              <button
                onClick={toggle}
                className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200/80 transition-all flex items-center gap-1.5 shadow-sm"
                title={isAr ? "التبديل إلى الفرنسية" : "Basculer en Arabe (Darija)"}
              >
                <span className="font-bold">🌐</span>
                <span>{isAr ? 'Français' : 'الدارجة 🇲🇦'}</span>
              </button>
            </div>

            {analysisResult && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">
                <Check className="w-3 h-3" /> {isAr ? 'تحليل مكتمل' : 'Analysé'}
              </span>
            )}
          </div>

          {/* TAB 1: FICHE TECHNIQUE & PRIX (activeTab === 'fiche') */}
          {activeTab === 'fiche' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {analysisResult ? (
                <>
                  {/* Piece selector tabs if multiple pieces */}
                  {analysisResult.pieces && analysisResult.pieces.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-400 uppercase">{isAr ? 'القطع المحللة:' : 'Pièces :'}</span>
                      {analysisResult.pieces.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActivePieceIdx(idx);
                            if (p.mesures?.length) setCustomMesures(p.mesures);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                            activePieceIdx === idx
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          📦 {p.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Moroccan Fabric & Sourcing Card (كتالوج الأثواب المغربي) */}
                  <div className="bg-gradient-to-br from-indigo-950/5 to-slate-50 rounded-3xl p-5 border border-indigo-100/60 shadow-sm space-y-4">
                    <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900">{isAr ? 'كتالوج الأثواب المغربي و أماكن الشراء' : 'Catalogue Tissus & Marchés Marocains'}</h3>
                          <p className="text-[10px] text-slate-500 font-bold">{isAr ? 'توصيات الثوب المثالي + أثمنة أسواق الجملة (درب عمر / القريعة)' : 'Prix gros au mètre et sourcing au Maroc'}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full">
                        {isAr ? 'سوق المغرب' : 'Marché MA'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'الثوب المقترح للموديل:' : 'Tissu Suggéré :'}</span>
                        <p className="text-base font-black text-slate-900">{fabInfo.arName}</p>
                        <p className="text-xs font-bold text-indigo-600">{fabInfo.frName}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'ثمن الجملة التقديري:' : 'Prix Gros au Mètre :'}</span>
                        <p className="text-base font-black text-emerald-600">{fabInfo.pricePerMeterMAD}</p>
                        <p className="text-[10px] font-bold text-slate-500">{fabInfo.markets}</p>
                      </div>
                    </div>

                    <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                      <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-emerald-600 font-black">✔</span>
                        <p className="text-slate-700 font-medium"><strong className="text-emerald-700 font-bold">{isAr ? 'المزايا: ' : 'Avantages : '}</strong>{fabInfo.pros}</p>
                      </div>
                      <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                        <span className="text-rose-600 font-black">✖</span>
                        <p className="text-slate-700 font-medium"><strong className="text-rose-700 font-bold">{isAr ? 'العيوب: ' : 'Inconvénients : '}</strong>{fabInfo.cons}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown & Complexity Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'استهلاك الثوب (المتراج)' : 'Consommation'}</span>
                      <p className="text-sm font-black text-slate-900">{activePiece?.consumption || analysisResult.consumption || '2.00 - 2.50m'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'نوع القصة (Fit)' : 'Coupe & Fit'}</span>
                      <p className="text-sm font-black text-slate-900">{activePiece?.fit || analysisResult.fit || 'Regular / عادي'}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">{isAr ? 'التكلفة التقديرية للقطعة' : 'Coût Estimé'}</span>
                      <p className="text-base font-black text-emerald-700">{activePiece?.costEstimate || analysisResult.costEstimate || '—'}</p>
                    </div>
                  </div>

                  {/* Components List */}
                  {((activePiece?.components && activePiece.components.length > 0) || (analysisResult.components && analysisResult.components.length > 0)) && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200">
                      <span className="text-xs font-black text-slate-500 uppercase block mb-2">{isAr ? 'مكونات وأجزاء البياسة:' : 'Composants :'}</span>
                      <div className="flex flex-wrap gap-2">
                        {(activePiece?.components || analysisResult.components).map((comp, ci) => (
                          <span key={ci} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60">
                            ✂️ {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Print / Export Report Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => printRapportIA(analysisResult, image, isAr)}
                      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <Printer className="w-4 h-4" /> <span>{isAr ? 'طباعة تقرير التحليل الكامل A4' : 'Imprimer Rapport A4'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <FileText className="w-16 h-16 mb-4 text-slate-300" />
                  <h4 className="text-lg font-black text-slate-700 mb-1">{isAr ? 'البطاقة التقنية فارغة' : 'Fiche Technique Vide'}</h4>
                  <p className="text-xs max-w-sm mb-6">{isAr ? 'ارفع صورة الموديل واضغط على "بدء التحليل الفوري" للحصول على جدول الثمن، كتالوج الأثواب، وتفاصيل الخياطة.' : 'Uploadez une image et lancez l\'analyse pour générer la fiche technique.'}</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-md">
                    {isAr ? 'رفع صورة الموديل الآن' : 'Uploader une photo'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TABLEAU DE MESURES S-XXL (activeTab === 'mesures') */}
          {activeTab === 'mesures' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h3 className="font-black text-base text-slate-900">{isAr ? 'جدول المقاسات الكامل (S - XXL)' : 'Tableau de Mesures Complet (S - XXL)'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{isAr ? 'يمكنك تعديل أي قياس لتخصيص الباترون لورشتك' : 'Modifiez les valeurs selon votre patronage'}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{isAr ? 'القياس' : 'Mesure'}</th>
                      {selectedTailles.map(size => (
                        <th key={size} className="p-3 text-xs font-black text-slate-700 uppercase tracking-wider text-center">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {customMesures.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-xs font-black text-slate-800">{row.nom}</td>
                        {selectedTailles.map(size => (
                          <td key={size} className="p-3 text-center">
                            <input
                              type="number"
                              value={row.valeurs[size] || ''}
                              onChange={e => handleCellChange(rowIndex, size, Number(e.target.value))}
                              className="w-16 p-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CHAT IA (activeTab === 'chat') */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {chat.map((c, i) => (
                  <div key={i} className={`flex w-full ${c.role === 'user' ? (isAr ? 'justify-start' : 'justify-end') : (isAr ? 'justify-end' : 'justify-start')}`}>
                    <div dir={isAr ? 'rtl' : 'ltr'} className={`max-w-[80%] p-4 text-xs font-medium leading-relaxed whitespace-pre-line shadow-sm rounded-2xl ${
                      c.role === 'user'
                        ? 'bg-slate-800 text-white rounded-br-none'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none'
                    } ${isAr ? 'text-right' : 'text-left'}`}>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t border-slate-200/80 flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); sendMsg(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder={isAr ? 'اسأل عن ثمن الخياطة، نوع الثوب، أو المقاسات...' : 'Posez une question technique...'}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Envoyer'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEMANDES PROSPECTS MODAL */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowLeadsModal(false)}>
          <div className="bg-white rounded-3xl border border-slate-200/80 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">{isAr ? 'طلبات الزبائن والمشاريع (DEMANDES PROSPECTS)' : 'Demandes & Prospects'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'اختر موديل من طلبات العملاء لتحليله فوراً' : 'Sélectionnez un modèle client pour l\'analyser'}</p>
                </div>
              </div>
              <button onClick={() => setShowLeadsModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {leads && leads.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {leads.map((l, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectLeadModel(l)}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 group shadow-sm hover:shadow-md"
                    >
                      <img
                        src={l.photo}
                        alt={l.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-black text-xs text-slate-900 truncate">{l.name}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md">{l.type}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate mb-1">{l.details || (isAr ? 'طلب خياطة وتفصيل' : 'Demande confection')}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span>{l.phone}</span>
                          <span className="text-indigo-600 font-black group-hover:underline">{isAr ? 'تحليل الموديل →' : 'Analyser →'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">{isAr ? 'لا توجد طلبات تحتوي على صور حالياً' : 'Aucune demande avec photo disponible.'}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex justify-end">
              <button
                onClick={() => setShowLeadsModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black text-xs transition-all"
              >
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full image overlay modal */}
      {showFullImage && image && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all z-10 border border-white/10">
            <X className="w-6 h-6" />
          </button>
          <img src={image} className="max-w-[95vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl" alt="Model Full" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Custom Alert Modal */}
      {customAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] border border-slate-200 w-full max-w-md p-6 shadow-2xl relative flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md ${
              customAlert.isError 
                ? 'bg-rose-50 border border-rose-100 text-rose-600' 
                : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
            }`}>
              {customAlert.isError ? <X className="w-6 h-6" /> : <Check className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">{customAlert.title}</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-600 mb-6">{customAlert.message}</p>
            <button
              onClick={() => {
                const onConf = customAlert.onConfirm;
                setCustomAlert(null);
                if (onConf) onConf();
              }}
              className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              {isAr ? 'موافق' : 'D\'accord'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
