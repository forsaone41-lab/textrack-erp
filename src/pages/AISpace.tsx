import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, MessageSquare, Ruler, Scissors, DollarSign, Camera, RefreshCw, Send, Image as ImageIcon, ChevronRight, Zap, Info, Trash2, Package, X, Eye, Check, Languages, Maximize2, Minimize2, Download, FileText, Printer, Settings, KeyRound } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveRecord, genId, FicheTechnique, loadLeads, Lead, loadCompanyProfile, loadLeadPhoto } from '../types';
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

const FABRIC_CATALOG: Record<string, {
  arName: string;
  frName: string;
  pricePerMeterMAD: string;
  pricePerMeterMADFr: string;
  markets: string;
  marketsFr: string;
  pros: string;
  prosFr: string;
  cons: string;
  consFr: string;
}> = {
  'crêpe': {
    arName: 'كريب دي شين / كريب جورجيت (Crêpe)',
    frName: 'Crêpe de Chine / Georgette',
    pricePerMeterMAD: '25 - 45 درهم/متر (جملة)',
    pricePerMeterMADFr: '25 - 45 MAD/mètre (gros)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، القيساريات الكبرى',
    marketsFr: 'Derb Omar (Casablanca), Souk Griaa, grandes Kissariat',
    pros: 'طايح وخفيف، مريح في اللبس، ما كيتكمش بسهولة، ممتاز للفساتين والعبايات',
    prosFr: 'Fluide et léger, confortable, ne se froisse pas facilement, excellent pour robes et abayas',
    cons: 'كيتطلب عناية خاصة في الخياطة باش ما يزلقش في الماكينة',
    consFr: 'Nécessite un soin particulier à la couture pour éviter le glissement sous la machine'
  },
  'satin': {
    arName: 'ساتان حرير / ساتان دوتشيس (Satin)',
    frName: 'Satin de Soie / Satin Duchesse',
    pricePerMeterMAD: '30 - 65 درهم/متر (جملة)',
    pricePerMeterMADFr: '30 - 65 MAD/mètre (gros)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، سوق الأثواب',
    marketsFr: 'Derb Omar (Casablanca), Souk Griaa, Souk des tissus',
    pros: 'لمعة فاخرة، ملمس ناعم، يعطي قيمة عالية للبياسة في السهرات والمناسبات',
    prosFr: 'Brillance luxueuse, toucher doux, apporte une haute valeur pour les tenues de soirée',
    cons: 'حساس للحرارة والماء، كيبين عيوب الخياطة إذا ما كانتش متقنة 100%',
    consFr: 'Sensible à la chaleur et à l\'eau, révèle les défauts de couture si non parfaitement exécutée'
  },
  'dentelle': {
    arName: 'دانتيلا / كيبير فرنسي (Dentelle / Guipure)',
    frName: 'Dentelle / Guipure de luxe',
    pricePerMeterMAD: '60 - 180 درهم/متر',
    pricePerMeterMADFr: '60 - 180 MAD/mètre',
    markets: 'درب عمر (شارع القصور)، محلات الأثواب المستوردة',
    marketsFr: 'Derb Omar (rue des palais), boutiques de tissus importés',
    pros: 'مظهر راقي جداً، يضيف لمسة كوتور (Couture) وتفاصيل فاخرة للبياسة',
    prosFr: 'Aspect très raffiné, apporte une touche couture et des détails luxueux',
    cons: 'سعر مرتفع، يحتاج تبطين (Doublure) ودقة عالية في التفصيل والقص',
    consFr: 'Prix élevé, nécessite une doublure et une grande précision de coupe'
  },
  'lin': {
    arName: 'كتان طبيعي / لينن ممتاز (Lin)',
    frName: 'Lin naturel de qualité',
    pricePerMeterMAD: '40 - 75 درهم/متر (جملة)',
    pricePerMeterMADFr: '40 - 75 MAD/mètre (gros)',
    markets: 'درب عمر، القيساريات التجارية بالمغرب',
    marketsFr: 'Derb Omar, Kissariat commerciales du Maroc',
    pros: 'بارد وممتاز للصيف، متين جداً، موضة مطلوبة بكثرة في السوق المغربي',
    prosFr: 'Frais et idéal pour l\'été, très résistant, forte demande sur le marché marocain',
    cons: 'كيتكمش بسرعة وكيتطلب التحديد (الحديد) المستمر',
    consFr: 'Se froisse rapidement et nécessite un repassage fréquent'
  },
  'brocart': {
    arName: 'بروكار مغربي / بهجة ملكية (Brocart)',
    frName: 'Brocart / Bahja Traditionnelle',
    pricePerMeterMAD: '120 - 350 درهم/متر',
    pricePerMeterMADFr: '120 - 350 MAD/mètre',
    markets: 'سوق الغزل بفاس، درب السلطان والدرب الكبير بالدار البيضاء',
    marketsFr: 'Souk Ghezel à Fès, Derb Sultan et Derb Kebir à Casablanca',
    pros: 'فخامة مغربية أصيلة، قوام واقف ومناسب للقفطان والتكشيطة والمناسبات الكبرى',
    prosFr: 'Luxe marocain authentique, tenue rigide idéale pour caftan, takchita et grandes occasions',
    cons: 'ثقيل في اللبس، مكلف من ناحية السلع والخياطة اليدوية (المعلم)',
    consFr: 'Lourd à porter, coûteux en matière et en couture artisanale (maalem)'
  },
  'mousseline': {
    arName: 'موسلين / شيفون شفاف (Mousseline / Chiffon)',
    frName: 'Mousseline / Chiffon',
    pricePerMeterMAD: '15 - 35 درهم/متر (جملة)',
    pricePerMeterMADFr: '15 - 35 MAD/mètre (gros)',
    markets: 'درب عمر، القريعة، قيسارية الأثواب',
    marketsFr: 'Derb Omar, Griaa, Kissariat des tissus',
    pros: 'خفيف جداً، انسيابي ورومانسي، رائع للطبقات والفساتين الصيفية',
    prosFr: 'Très léger, fluide et romantique, parfait pour les superpositions et robes d\'été',
    cons: 'شفاف يحتاج بطانة، حساس جداً للتمزق في الخياطة',
    consFr: 'Transparent, nécessite une doublure, très sensible à la déchirure à la couture'
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
    pricePerMeterMADFr: '25 - 55 MAD/mètre (estimatif selon qualité)',
    markets: 'درب عمر (الدار البيضاء)، سوق القريعة، القيساريات المحلية',
    marketsFr: 'Derb Omar (Casablanca), Souk Griaa, Kissariat locales',
    pros: 'جودة ممتازة وسهل في التفصيل والخياطة بالورشة',
    prosFr: 'Excellente qualité et facile à travailler à l\'atelier',
    cons: 'يجب التأكد من جودة الغزل وغسله أو تجربته قبل القص النهائي',
    consFr: 'Vérifier la qualité du fil et le tester avant la coupe finale'
  };
}

// Keeps only the fabric consumption for a single 1.50m laize (drops any "Laize 1.50m: X | Laize 1.80m: Y" style label/alt-width text the AI may still return)
function simplifyConsumption(raw?: string): string {
  if (!raw) return '';
  let s = raw.split('|')[0];
  if (s.includes(':')) {
    s = s.split(':').pop() || s;
  }
  return s.trim();
}

// Builds the full technical report chat message in the requested language, so it can be (re)generated
// both right after analysis and again whenever the user toggles the app language.
function buildRapportText(result: any, arLang: boolean): string {
  const suggestedFabricName = result.fabricSuggested || (result.pieces?.[0]?.fabricSuggested) || '';
  const fabInfo = getFabricInfo(suggestedFabricName);

  let chatMsg = '';
  if (arLang) {
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
    chatMsg += `📏 استهلاك الثوب (لعرض 1.50م):\n`;
    chatMsg += `   • ${result.consumption || '1.80m'}\n\n`;
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
    chatMsg += `   • Prix de gros estimé : ${fabInfo.pricePerMeterMADFr}\n`;
    chatMsg += `   • Marchés de référence : ${fabInfo.marketsFr}\n\n`;
    chatMsg += `💰 Estimation du coût unitaire (Prix de revient) :\n`;
    chatMsg += `   • Coût total : ${result.costEstimate || '150 - 250 MAD'}\n`;
    chatMsg += `   • (Inclus : tissu + façon atelier de confection)\n\n`;
    chatMsg += `📏 Consommation de tissu (laize 1.50m) :\n`;
    chatMsg += `   • ${result.consumption || '1.80m'}\n\n`;
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
    chatMsg += `   • Propriété du tissu : ${fabInfo.prosFr}\n`;
    chatMsg += `────────────────────────────\n`;
    chatMsg += `⚡ Utilisez les boutons d'export rapide en bas pour envoyer vers Devis PRO, l'Atelier ou les Achats !`;
  }
  return chatMsg;
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
    { role: 'ai', text: isAr ? 'مرحباً بك في المستشار الذكي لتحليل الموديلات. ارفع صورة الموديل للبدء في التحليل الفوري للثوب والتكلفة والقياسات.' : 'Bienvenue dans l\'espace d\'analyse. Uploadez une photo de modèle pour commencer.' }
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
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    setApiKeyInput((import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key')) || '');
    loadLeads().then(data => {
      const withPhotos = data.filter(l => l.photo || l.photoCount || (l.photos && l.photos.length > 0));
      setLeads(withPhotos);
      // Photos are stripped from the bulk load for performance; fetch them progressively.
      const missing = withPhotos.filter(l => !l.photo);
      (async () => {
        for (let i = 0; i < missing.length; i += 5) {
          const batch = missing.slice(i, i + 5);
          const results = await Promise.allSettled(batch.map(l => loadLeadPhoto(l.id).then(photo => ({ id: l.id, photo }))));
          const updates: Record<string, string> = {};
          results.forEach(r => { if (r.status === 'fulfilled' && r.value.photo) updates[r.value.id] = r.value.photo; });
          if (Object.keys(updates).length > 0) {
            setLeads(prev => prev.map(l => updates[l.id] ? { ...l, photo: updates[l.id] } : l));
          }
        }
      })();
    }).finally(() => setLeadsLoading(false));
  }, []);

  const selectLeadModel = async (lead: Lead) => {
    if (!lead.photo) {
      const fetched = await loadLeadPhoto(lead.id);
      if (fetched) lead = { ...lead, photo: fetched };
    }
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

  const [piecesMesures, setPiecesMesures] = useState<any[][]>([]);

  const handleCellChange = (rowIndex: number, size: string, value: number) => {
    const updated = [...customMesures];
    updated[rowIndex].valeurs[size] = value;
    setCustomMesures(updated);
  };

  const handlePieceCellChange = (pieceIdx: number, rowIndex: number, size: string, value: number) => {
    setPiecesMesures(prev => prev.map((rows, idx) => {
      if (idx !== pieceIdx) return rows;
      const updated = rows.map(r => ({ ...r, valeurs: { ...r.valeurs } }));
      updated[rowIndex].valeurs[size] = value;
      return updated;
    }));
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
      const extrasFr = ` | Coupe: ${fitStr || 'Regular'} | Complexité: ${compStr || 'Moyenne'}`;

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
          const pExtFr = ` | Coupe: ${pFit || 'Regular'} | Complexité: ${pComp || 'Moyenne'}`;

          ftModele = p.name;
          ftDescription = isAr ? `Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª: ${(p.components || []).join('ØŒ ')}${pExtAr}` : `Composants: ${(p.components || []).join(', ')}${pExtFr}`;
          ftMesures = piecesMesures[activePieceIdx] || customMesures; // The active table (with any manual edits)
          ftConso = parseConso(p.consumption) || ftConso;
        }
      } else if (mode === 'complete') {
        ftModele = analysisResult.category;
        const allComps: string[] = [];

        if (analysisResult.pieces && analysisResult.pieces.length > 0) {
          const combinedMesures: any[] = [];
          let totalConso = 0;

          analysisResult.pieces.forEach((p: any, pIdx: number) => {
            const prefix = p.name.trim();
            const pConso = parseConso(p.consumption);
            if (pConso > 0) {
              totalConso += pConso;
            }

            if (p.components && Array.isArray(p.components)) {
              allComps.push(...p.components);
            }
            const pMesures = piecesMesures[pIdx] || p.mesures;
            if (pMesures && Array.isArray(pMesures)) {
              pMesures.forEach((m: any) => {
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
      localStorage.setItem('beya_ai_to_ft', JSON.stringify(newFT));
      window.open('/#/fiches-techniques', '_blank');
    } catch (err) {
      console.error("Export Error:", err);
      setCustomAlert({
        title: isAr ? "Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØµØ¯ÙŠØ± âŒ" : "Erreur d'exportation âŒ",
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
      
      const items: { designation: string; montant: number; detail: string; image?: string }[] = [];
      
      for (let i = 1; i < tableLines.length; i++) { // skip header
        const cells = tableLines[i].split('|').map(s => s.trim()).filter(Boolean);
        if (cells.length >= 2) {
          // Try to extract amount from cells
          const amountCell = cells.find(c => /\d+[.,\d]*/.test(c.replace(/\*+/g, '')));
          const nameCell = cells.find(c => !/^[\d.,]+/.test(c.replace(/\*+/g, '').trim()) && c.length > 1);
          const amount = amountCell ? parseFloat(amountCell.replace(/\*+/g, '').replace(',', '.').match(/[\d.]+/)?.[0] || '0') : 0;
          const name = nameCell?.replace(/\*+/g, '').trim() || '';
          if (name && amount > 0 && !name.toLowerCase().includes('total') && !name.toLowerCase().includes('مجموع') && !name.toLowerCase().includes('revient')) {
            items.push({ designation: name, montant: amount, detail: cells[cells.length-1]?.replace(/\*+/g, '') || '', image: image || '' });
          }
        }
      }
      
      // Fallback if markdown parsing yielded 0 items
      if (items.length === 0 && analysisResult) {
        if (analysisResult.pieces && analysisResult.pieces.length > 0) {
          analysisResult.pieces.forEach((p: any) => {
            const cost = parseFloat(String(p.costEstimate || '0').match(/[\d.]+/)?.[0] || '150') || 150;
            items.push({
              designation: p.name || analysisResult.category || 'Modèle AI',
              montant: cost,
              detail: (p.fabricSuggested || analysisResult.fabricSuggested || '') + (p.consumption ? ` (${p.consumption})` : ''),
              image: image || ''
            });
          });
        } else {
          const cost = parseFloat(String(analysisResult.costEstimate || '0').match(/[\d.]+/)?.[0] || '150') || 150;
          items.push({
            designation: analysisResult.category || (isAr ? 'موديل من الذكاء الاصطناعي' : 'Modèle AI Expert'),
            montant: cost,
            detail: (analysisResult.fabricSuggested || '') + (analysisResult.consumption ? ` (${analysisResult.consumption})` : ''),
            image: image || ''
          });
        }
      }

      // Find total
      const totalLine = tableLines.find(l => l.toLowerCase().includes('total') || l.includes('مجموع') || l.includes('revient'));
      let total = 0;
      if (totalLine) {
        const m = totalLine.match(/[\d.]+/g);
        if (m) total = Math.max(...m.map(Number));
      }
      if (total === 0 && items.length > 0) {
        total = items.reduce((acc, it) => acc + (it.montant || 0), 0);
      }

      // Store in localStorage for DevisBuilder to pick up
      const devisData = {
        fromAI: true,
        timestamp: Date.now(),
        items,
        total,
        rawText: text,
        modelName: analysisResult?.category || (isAr ? 'نموذج من الذكاء الاصطناعي' : 'Modèle AI Expert'),
        image: image || ''
      };
      localStorage.setItem('beya_ai_to_devis', JSON.stringify(devisData));

      // Open Devis PRO in a new tab so the current AI analysis stays open
      window.open('/#/devis-pro', '_blank');
    } catch (err) {
      console.error('sendToDevis error:', err);
      window.open('/#/devis-pro', '_blank');
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
          complexity: isAr ? 'متوسطة' : 'Moyenne',
          components: [
            isAr ? 'صدر مبطن' : 'Buste doublé',
            isAr ? 'أكمام طويلة' : 'Manches longues',
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
        ? `أنت خبير نسيج وخياطة محترف في مصنع مغربي. حلل هذه الصورة بدقة عالية جداً.

أريد منك تحليل كل قطعة ملابس في الصورة بشكل منفصل (مثلاً إذا في الصورة تيشرت وسروال، حلل كل واحد لوحدو).

لكل قطعة أعطيني:
1. اسم القطعة (بالعربية والفرنسية)
2. كمية الثوب المطلوبة بالمتر، لعرض ثوب واحد فقط 1.50م (أعطني رقم دقيق فقط مثلاً "1.80m"، بدون أي نص إضافي).
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
  "totalConsumption": "X.XXm",
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
      "consumption": "1.50m",
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
2. Consommation de tissu en mètres, pour une laize unique de 1.50m (donne un chiffre précis uniquement, ex: "1.80m", sans texte additionnel).
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
  "totalConsumption": "X.XXm",
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
      "consumption": "1.50m",
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
          category: parsed.category || 'موديل',
          consumption: simplifyConsumption(parsed.totalConsumption || parsed.consumption) || '—',
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
            consumption: simplifyConsumption(p.consumption) || '—',
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

        // Build one editable measurements table per piece (so every piece gets its own S-XXL table)
        if (result.pieces.length > 0) {
          setPiecesMesures(result.pieces.map((p: any) =>
            p.mesures && p.mesures.length > 0
              ? JSON.parse(JSON.stringify(p.mesures))
              : JSON.parse(JSON.stringify(STANDARD_MESURES['Robe']))
          ));
        } else {
          setPiecesMesures([]);
        }

        // AUTO-TRANSLATE result labels if they are standard but in wrong language
        if (!isAr && result.category === 'Ù…ÙˆØ¯ÙŠÙ„') result.category = 'ModÃ¨le';
        if (isAr && result.category === 'ModÃ¨le') result.category = 'Ù…ÙˆØ¯ÙŠÙ„';

        setAnalysisResult(result);
        setActiveTab('fiche');
        setAnalyzing(false);

        // Build rich chat message (mktoba mzn martba)
        setChat(prev => [...prev, { role: 'ai', text: buildRapportText(result, isAr) }]);

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
    if (/(merci|شكرا|شكر|بارك|thanks|thank|chokran|jazak)/i.test(m)) {
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
            aiText = "عذراً، خوادم الذكاء الاصطناعي عليها ضغط كبير الآن. ⏳ انتظر قليلاً وحاول مرة أخرى!";
          } else if (errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded')) {
            aiText = "âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù…ÙØªØ§Ø­ (API Key): Ù…ÙØªØ§Ø­Ùƒ Ù…Ø§Ø¹Ù†Ø¯Ùˆ Ø­ØªÙ‰ Ø±ØµÙŠØ¯ (Limit: 0). Ù‡Ø§Ø¯Ø´ÙŠ ÙƒÙŠÙˆÙ‚Ø¹ Ø­ÙŠØª Google ÙƒØªÙØ±Ø¶ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¯ÙØ¹ (Billing) ÙÙŠ Ø­Ø³Ø§Ø¨ Google Cloud Ø¯ÙŠØ§Ù„Ùƒ Ø¨Ø§Ø´ ØªÙ‚Ø¯Ø± ØªØ®Ø¯Ù… Ø§Ù„Ù€ API ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨.";
          } else if (errMsg.includes('not found') || errMsg.includes('not supported')) {
            aiText = "âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù…ÙØªØ§Ø­: Ù‡Ø§Ø¯ Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„ ØºÙŠØ± Ù…ØªØ§Ø­ Ù„Ù„Ù…ÙØªØ§Ø­ Ø¯ÙŠØ§Ù„Ùƒ (" + errMsg + ").";
          } else if (errMsg.includes('API key not valid')) {
            aiText = "âš ï¸ Ø®Ø·Ø£: Ø§Ù„Ù…ÙØªØ§Ø­ (API Key) Ø§Ù„Ù„ÙŠ Ø¯Ø®Ù„ØªÙŠ ØºÙŠØ± ØµØ­ÙŠØ­.";
          } else {
            aiText = "خطأ: " + errMsg;
          }
        } else {
          aiText = 'Ù„Ù… Ø£Ø³ØªØ·Ø¹ ÙÙ‡Ù… Ø§Ù„Ø±Ø¯.';
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
            aiResponseText = "عذراً، خوادم الذكاء الاصطناعي عليها ضغط كبير الآن. ⏳ انتظر قليلاً وحاول مرة أخرى!";
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
          <button
            onClick={() => setShowApiKeyModal(true)}
            title={isAr ? 'إعدادات مفتاح الذكاء الاصطناعي' : 'Paramètres clé API'}
            className="p-2 bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100 rounded-xl transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
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
                    window.open('/#/atelier-calculator', '_blank');
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
                    window.open('/#/achats', '_blank');
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
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'المستشار الذكي' : 'Chat IA'}</span>
              </button>

              <button
                onClick={() => setActiveTab('mesures')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'mesures'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{isAr ? 'جدول المقاسات' : 'Mesures'}</span>
              </button>

              <button
                onClick={() => setActiveTab('fiche')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'fiche'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? 'البطاقة التقنية' : 'Fiche & Prix'}</span>
              </button>

              <button
                onClick={() => {
                  const nextIsAr = !isAr;
                  toggle();
                  if (analysisResult) {
                    const newReport = buildRapportText(analysisResult, nextIsAr);
                    setChat(prev => {
                      const lastAiIdx = [...prev].reverse().findIndex(c => c.role === 'ai' && c.text.includes('BEYA EXPERT'));
                      if (lastAiIdx === -1) return [...prev, { role: 'ai', text: newReport }];
                      const idx = prev.length - 1 - lastAiIdx;
                      const updated = [...prev];
                      updated[idx] = { role: 'ai', text: newReport };
                      return updated;
                    });
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200/80 transition-all flex items-center gap-1.5 shadow-sm"
                title={isAr ? "التبديل إلى الفرنسية" : "Basculer en Arabe (Darija)"}
              >
                <span>{isAr ? 'Français' : 'العربية'}</span>
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

                  {/* Fabric & Cost Cards — one block per piece so info is shown for ALL pieces, not just the active one */}
                  {(analysisResult.pieces && analysisResult.pieces.length > 0 ? analysisResult.pieces : [{ ...analysisResult, name: analysisResult.category }]).map((p, pIdx) => {
                    const pFabInfo = getFabricInfo(p.fabricSuggested || analysisResult.fabricSuggested || '');
                    return (
                      <div key={pIdx} className="space-y-3">
                        {analysisResult.pieces && analysisResult.pieces.length > 1 && (
                          <h4 className="text-sm font-black text-indigo-700 flex items-center gap-2">📦 {p.name}</h4>
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
                              <p className="text-base font-black text-slate-900">{pFabInfo.arName}</p>
                              <p className="text-xs font-bold text-indigo-600">{pFabInfo.frName}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'ثمن الجملة التقديري:' : 'Prix Gros au Mètre :'}</span>
                              <p className="text-base font-black text-emerald-600">{isAr ? pFabInfo.pricePerMeterMAD : pFabInfo.pricePerMeterMADFr}</p>
                              <p className="text-[10px] font-bold text-slate-500">{isAr ? pFabInfo.markets : pFabInfo.marketsFr}</p>
                            </div>
                          </div>

                          <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                            <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <span className="text-emerald-600 font-black">✔</span>
                              <p className="text-slate-700 font-medium"><strong className="text-emerald-700 font-bold">{isAr ? 'المزايا: ' : 'Avantages : '}</strong>{isAr ? pFabInfo.pros : pFabInfo.prosFr}</p>
                            </div>
                            <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <span className="text-rose-600 font-black">✖</span>
                              <p className="text-slate-700 font-medium"><strong className="text-rose-700 font-bold">{isAr ? 'العيوب: ' : 'Inconvénients : '}</strong>{isAr ? pFabInfo.cons : pFabInfo.consFr}</p>
                            </div>
                          </div>
                        </div>

                        {/* Cost Breakdown & Complexity Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'استهلاك الثوب (لعرض 1.50م)' : 'Consommation (laize 1.50m)'}</span>
                            <p className="text-sm font-black text-slate-900">{p.consumption || '2.00 - 2.50m'}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'نوع القصة (Fit)' : 'Coupe & Fit'}</span>
                            <p className="text-sm font-black text-slate-900">{p.fit || 'Regular / عادي'}</p>
                          </div>
                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                            <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">{isAr ? 'التكلفة التقديرية للقطعة' : 'Coût Estimé'}</span>
                            <p className="text-base font-black text-emerald-700">{p.costEstimate || '—'}</p>
                          </div>
                        </div>

                        {/* Components List */}
                        {p.components && p.components.length > 0 && (
                          <div className="bg-white p-4 rounded-2xl border border-slate-200">
                            <span className="text-xs font-black text-slate-500 uppercase block mb-2">{isAr ? 'مكونات وأجزاء البياسة:' : 'Composants :'}</span>
                            <div className="flex flex-wrap gap-2">
                              {p.components.map((comp, ci) => (
                                <span key={ci} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60">
                                  ✂️ {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

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
            <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0">
              <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h3 className="font-black text-base text-slate-900">{isAr ? 'جدول المقاسات الكامل (S - XXL)' : 'Tableau de Mesures Complet (S - XXL)'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{isAr ? 'يمكنك تعديل أي قياس لتخصيص الباترون لورشتك' : 'Modifiez les valeurs selon votre patronage'}</p>
                </div>
              </div>

              {analysisResult?.pieces && analysisResult.pieces.length > 0 && piecesMesures.length > 0 ? (
                analysisResult.pieces.map((p, pIdx) => (
                  <div key={pIdx} className="space-y-2">
                    {analysisResult.pieces && analysisResult.pieces.length > 1 && (
                      <h4 className="text-sm font-black text-indigo-700 flex items-center gap-2">📦 {p.name}</h4>
                    )}
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
                          {(piecesMesures[pIdx] || []).map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 text-xs font-black text-slate-800">{row.nom}</td>
                              {selectedTailles.map(size => (
                                <td key={size} className="p-3 text-center">
                                  <input
                                    type="number"
                                    value={row.valeurs[size] || ''}
                                    onChange={e => handlePieceCellChange(pIdx, rowIndex, size, Number(e.target.value))}
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
                ))
              ) : (
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
              )}
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

      {/* API KEY SETTINGS MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowApiKeyModal(false)}>
          <div className="bg-white rounded-3xl border border-slate-200/80 w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">{isAr ? 'إعدادات مفتاح Gemini API' : 'Paramètres clé Gemini API'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'خاص بالتحليل الذكي الحقيقي للصور' : 'Requis pour l\'analyse IA réelle des images'}</p>
                </div>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block text-xs font-black text-slate-700">
                {isAr ? 'مفتاح Google Gemini API الخاص بك:' : 'Votre clé Google Gemini API :'}
              </label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                {isAr
                  ? 'كيتخزن المفتاح فقط فالمتصفح ديالك (localStorage)، ماشي كيتبعث لأي سيرفر آخر. يمكنك الحصول عليه من Google AI Studio مجاناً.'
                  : 'La clé est stockée uniquement dans votre navigateur (localStorage), jamais envoyée à un autre serveur. Vous pouvez l\'obtenir gratuitement sur Google AI Studio.'}
              </p>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex justify-end gap-2">
              {apiKeyInput && (
                <button
                  onClick={() => { localStorage.removeItem('beya_gemini_api_key'); setApiKeyInput(''); }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-black text-xs transition-all"
                >
                  {isAr ? 'حذف المفتاح' : 'Supprimer'}
                </button>
              )}
              <button
                onClick={() => {
                  if (apiKeyInput.trim()) localStorage.setItem('beya_gemini_api_key', apiKeyInput.trim());
                  setShowApiKeyModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-all"
              >
                {isAr ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              {leadsLoading ? (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-bold text-slate-400">{isAr ? 'جاري التحميل...' : 'Chargement...'}</p>
                </div>
              ) : leads && leads.length > 0 ? (
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
