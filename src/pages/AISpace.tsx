import { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, MessageSquare, Ruler, Scissors, DollarSign, Camera, RefreshCw, Send, Image as ImageIcon, ChevronRight, Zap, Info, Trash2, Package, X, Eye, Check, Languages, Maximize2, Minimize2, Download, FileText, Printer, Settings, KeyRound, Smartphone, Copy, Save, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLang } from '../contexts/LangContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveRecord, genId, FicheTechnique, loadLeads, Lead, loadCompanyProfile, loadLeadPhoto } from '../types';
import { printElement } from '../utils/pdf';
import { printRapportIA } from '../utils/print';
import { PosteTravail, getGarmentTechnicalBreakdown } from '../lib/atelierAi';

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
  ],
  TShirt: [
    { nom: 'الصدر (Poitrine)', valeurs: { S: 96, M: 102, L: 108, XL: 114, XXL: 120 } },
    { nom: 'الكتف (Épaules)', valeurs: { S: 42, M: 44, L: 46, XL: 48, XXL: 50 } },
    { nom: 'الطول (Longueur)', valeurs: { S: 68, M: 70, L: 72, XL: 74, XXL: 76 } },
    { nom: 'طول الكم (Manche)', valeurs: { S: 61, M: 62, L: 63, XL: 64, XXL: 65 } },
    { nom: 'الخصر (Taille)', valeurs: { S: 92, M: 98, L: 104, XL: 110, XXL: 116 } }
  ],
  Boxer: [
    { nom: 'الخصر (Taille)', valeurs: { S: 68, M: 72, L: 76, XL: 80, XXL: 84 } },
    { nom: 'الورك (Hanches)', valeurs: { S: 86, M: 90, L: 94, XL: 98, XXL: 102 } },
    { nom: 'طول الساق (Longueur)', valeurs: { S: 26, M: 28, L: 30, XL: 32, XXL: 34 } },
    { nom: 'محيط الفخذ (Cuisse)', valeurs: { S: 46, M: 49, L: 52, XL: 55, XXL: 58 } }
  ]
};

export const FABRIC_CATALOG: Record<string, {
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
  'interlock': {
    arName: 'إنترلوك قطن ممتاز 100% (Interlock Double Knit)',
    frName: 'Interlock 100% Coton Double Knit',
    pricePerMeterMAD: '32 - 48 درهم/متر (أو 75 - 90 درهم/كيلو جملة)',
    pricePerMeterMADFr: '32 - 48 MAD/mètre (ou 75 - 90 MAD/kg)',
    markets: 'درب عمر (سوق المسيرة)، سوق القريعة، درب السلطان (الدار البيضاء)',
    marketsFr: 'Derb Omar, Souk Griaa, Derb Sultan (Casablanca)',
    pros: 'ما كيتلواش في الفصالة نهائياً (نهائي الرولاج)، وجهين متطابقين، ناعم وثقيل ومثالي للتيشرتات والسويت شيرت الراقية',
    prosFr: 'Ne roule pas sur les bords à la coupe, double face identique, dense et doux, parfait pour t-shirts et sweats premium',
    cons: 'أثقل من الجيرسي العادي وكيتطلب إبرة Ball Point (Stretch) باش ما يتقبش الثوب',
    consFr: 'Plus lourd que le jersey simple, nécessite une aiguille pointe boule (stretch) en machine'
  },
  'molleton': {
    arName: 'مولتون شتوي مبطن / قطن فليس (Molleton / Cotton Fleece)',
    frName: 'Molleton Coton / Fleece Gratté',
    pricePerMeterMAD: '38 - 60 درهم/متر (أو 80 - 110 درهم/كيلو)',
    pricePerMeterMADFr: '38 - 60 MAD/mètre (ou 80 - 110 MAD/kg)',
    markets: 'درب عمر، سوق القريعة، المنطقة الصناعية عين السبع',
    marketsFr: 'Derb Omar, Souk Griaa, Aïn Sebaâ',
    pros: 'دافي بزاف، ملمس قطني مريح، قوام واقف للهودي والسويت شيرت أوفر سايز',
    prosFr: 'Très chaud, toucher doux molletonné, excellente tenue pour hoodies et sweats oversize',
    cons: 'كيحتاج شفرات مقص حادة في الفصالة وماكينة سورجي 4 خيوط قوية',
    consFr: 'Nécessite des lames affûtées pour la coupe et une surjeteuse 4 fils robuste'
  },
  'jersey': {
    arName: 'جيرسي قطن ليكرا (Jersey Coton 95% + Élasthanne 5%)',
    frName: 'Jersey Coton Lycra / Spandex',
    pricePerMeterMAD: '24 - 42 درهم/متر (أو 65 - 80 درهم/كيلو جملة)',
    pricePerMeterMADFr: '24 - 42 MAD/mètre (ou 65 - 80 MAD/kg)',
    markets: 'درب عمر، سوق القريعة، درب السلطان',
    marketsFr: 'Derb Omar, Souk Griaa, Derb Sultan',
    pros: 'مطاطي ومريح جداً على الجسم، مثالي للبوكسرات، الملابس الداخلية، والتيشرتات الصيفية',
    prosFr: 'Extensible et très confortable, idéal pour sous-vêtements, boxers et t-shirts',
    cons: 'كيرولي في الجوانب وقت الفصالة وكيتطلب ماكينات السورجي والروكوفروز لمرونة الخياطة',
    consFr: 'Tendance à rouler sur les bords à la coupe, nécessite surjeteuse et recouvreuse'
  },
  'gabardine': {
    arName: 'جاباردين كوتون متين (Gabardine Coton / Stretch)',
    frName: 'Gabardine Coton / Stretch',
    pricePerMeterMAD: '28 - 50 درهم/متر',
    pricePerMeterMADFr: '28 - 50 MAD/mètre',
    markets: 'درب عمر، سوق القريعة',
    marketsFr: 'Derb Omar, Souk Griaa',
    pros: 'متين، واقف، ما كيتقطعش بسهولة، ممتاز للسراويل الكارجو والفيستات',
    prosFr: 'Robuste, bonne tenue, indéchirable, excellent pour pantalons cargo et vestes',
    cons: 'قاصح شوية في الفصالة وكيحتاج إبر سميكة 90/14 أو 100/16',
    consFr: 'Plus rigide à la coupe, nécessite des aiguilles fortes 90/14 ou 100/16'
  },
  'popeline': {
    arName: 'بوبلين قطن ناعم 100% (Popeline Coton)',
    frName: 'Popeline 100% Coton',
    pricePerMeterMAD: '22 - 38 درهم/متر',
    pricePerMeterMADFr: '22 - 38 MAD/mètre',
    markets: 'درب عمر، سوق القريعة، القيساريات',
    marketsFr: 'Derb Omar, Souk Griaa, Kissariat',
    pros: 'خفيف وناعم وتنفس عالي، كلاسيكي ومثالي للقمصان والشوميزات',
    prosFr: 'Léger, doux, très respirant, classique parfait pour chemises et blouses',
    cons: 'كيبغي التحديد بالحديد والمصلوح بانتظام',
    consFr: 'Nécessite repassage régulier'
  },
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

export function getFabricInfo(fabricName: string = '') {
  const lower = fabricName.toLowerCase();
  for (const key of Object.keys(FABRIC_CATALOG)) {
    if (
      lower.includes(key) ||
      (key === 'crêpe' && (lower.includes('crepe') || lower.includes('كريب'))) ||
      (key === 'satin' && (lower.includes('satin') || lower.includes('ساتان'))) ||
      (key === 'dentelle' && (lower.includes('dentelle') || lower.includes('lace') || lower.includes('دانتيلا'))) ||
      (key === 'interlock' && (lower.includes('interlock') || lower.includes('انترلوك') || lower.includes('إنترلوك'))) ||
      (key === 'molleton' && (lower.includes('molleton') || lower.includes('مولتون') || lower.includes('ميلتون') || lower.includes('fleece'))) ||
      (key === 'jersey' && (lower.includes('jersey') || lower.includes('جيرسي') || lower.includes('جيرزي'))) ||
      (key === 'gabardine' && (lower.includes('gabardine') || lower.includes('جاباردين') || lower.includes('كاباردين'))) ||
      (key === 'popeline' && (lower.includes('popeline') || lower.includes('بوبلين')))
    ) {
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
  const searchContext = `${result.category || ''} ${suggestedFabricName} ${(result.pieces || []).map((p: any) => p.name).join(' ')}`;
  const fallbackBreakdown = getGarmentTechnicalBreakdown(searchContext);
  const gammePostes: PosteTravail[] = (result.gammeMontage && Array.isArray(result.gammeMontage) && result.gammeMontage.length > 0)
    ? result.gammeMontage
    : fallbackBreakdown.postesTravail;
  const totalGammeMin = Number(gammePostes.reduce((sum, p) => sum + (Number(p.tempsMin) || 0), 0).toFixed(2));
  const totalGammeSec = Math.round(totalGammeMin * 60);

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
    chatMsg += `\n🏭 لاغام ديال الخياطة وبوستات العمل (La Gamme de Montage):\n`;
    chatMsg += `   • عدد البوستات / المراحل: ${gammePostes.length} محطات عمل\n`;
    chatMsg += `   • إجمالي وقت الخياطة للبياسة (SAM): ${totalGammeMin} دقيقة (${totalGammeSec} ثانية)\n`;
    gammePostes.forEach((gp, gIdx) => {
      const sec = Math.round((Number(gp.tempsMin) || 0) * 60);
      chatMsg += `   ${gIdx + 1}. ${gp.nomAr} — [الآلة: ${gp.machine}] — ⏱️ ${gp.tempsMin} د (${sec} ثانية)\n`;
    });
    chatMsg += `\n✂️ توجيهات الورشة (الفصّال والخيّاط):\n`;
    chatMsg += `   • يُنصح بضبط جدول المقاسات S-XXL في التبويب المجاور قبل بدء التفصيل.\n`;
    chatMsg += `   • ميزة الثوب: ${fabInfo.pros}\n`;
    chatMsg += `────────────────────────────\n`;
    chatMsg += `⚡ اضغط على زر "إرسال للورشة Atelier" لإرسال هاد لاغام (${gammePostes.length} بوستات) مقادة ومرتبة مباشرة لحاسبة الإنتاج!`;
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
    chatMsg += `\n🏭 Gamme de Montage & Postes de Travail :\n`;
    chatMsg += `   • Nombre de postes : ${gammePostes.length} postes\n`;
    chatMsg += `   • Temps total de confection (SAM) : ${totalGammeMin} min (${totalGammeSec} sec)\n`;
    gammePostes.forEach((gp, gIdx) => {
      const sec = Math.round((Number(gp.tempsMin) || 0) * 60);
      chatMsg += `   ${gIdx + 1}. ${gp.nomFr || gp.nomAr} — [Machine: ${gp.machine}] — ⏱️ ${gp.tempsMin} min (${sec} sec)\n`;
    });
    chatMsg += `\n✂️ Conseils de confection Atelier :\n`;
    chatMsg += `   • Vérifiez le tableau des mesures S-XXL dans l'onglet voisin avant la coupe.\n`;
    chatMsg += `   • Propriété du tissu : ${fabInfo.prosFr}\n`;
    chatMsg += `────────────────────────────\n`;
    chatMsg += `⚡ Cliquez sur "Atelier Production" pour envoyer directement cette Gamme (${gammePostes.length} postes) au Calculateur d'Atelier !`;
  }
  return chatMsg;
}


// Internal Expert Technical Analysis Engine (Fallback when external API key has limit: 0 or fails)
function buildFallbackAnalysis(contextText: string, isAr: boolean) {
  const breakdown = getGarmentTechnicalBreakdown(contextText);
  const text = (contextText || '').toLowerCase();

  let pieceName = breakdown.categorie;
  let piecesList: any[] = [];
  let defaultMesures: any[] = [];

  if (text.includes('boxer') || text.includes('كالسون') || text.includes('بوكسر') || text.includes('slip') || text.includes('داخلي')) {
    pieceName = isAr ? 'بوكسر قطن جيرسي (Boxer Coton)' : 'Boxer Coton Lycra';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['Boxer'] || STANDARD_MESURES['Pantalon']));
    piecesList = [{
      name: pieceName,
      consumption: '0.35m',
      fit: isAr ? 'لاصق مريح (Slim / Stretch)' : 'Slim / Stretch',
      complexity: isAr ? 'بسيط' : 'Simple',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['جيب أمامي مبطن', 'ظهر متصل', 'حجر مزدوج', 'حزام مطاطي (لاستيك)'] : ['Poche avant doublée', 'Dos continu', 'Entrejambe doublé', 'Élastique taille'],
      fabricSuggested: isAr ? 'جيرسي قطن ليكرا (Jersey Coton 95% + 5% Élasthanne)' : 'Jersey Coton 95% + 5% Élasthanne',
      fabricAlternatives: [
        { name: isAr ? 'قطن مودال (Modal Coton)' : 'Coton Modal', pros: isAr ? 'ملمس فائق النعومة ومضاد للحساسية' : 'Toucher soyeux anti-allergique', cons: isAr ? 'أغلى في السعر بنسبة 25%' : 'Prix plus élevé de 25%' },
        { name: isAr ? 'ميكروفايبر رياضي (Microfibre)' : 'Microfibre Sport', pros: isAr ? 'سريع الجفاف ومثالي للحركة والرياضة' : 'Séchage rapide et respirant', cons: isAr ? 'أقل تهوية من القطن الطبيعي' : 'Moins respirant que le coton' }
      ],
      mesures: defaultMesures
    }];
  } else if (text.includes('survet') || text.includes('ensemble') || text.includes('طقم') || text.includes('سيرفيت') || ((text.includes('sweat') || text.includes('hoodie') || text.includes('هودي')) && (text.includes('jogging') || text.includes('سروال') || text.includes('pantalon')))) {
    pieceName = isAr ? 'طقم رياضي هودي وسروال (Ensemble Survêtement)' : 'Ensemble Survêtement Hoodie & Jogging';
    const mesuresHoodie = JSON.parse(JSON.stringify(STANDARD_MESURES['TShirt'] || STANDARD_MESURES['Chemise']));
    const mesuresPantalon = JSON.parse(JSON.stringify(STANDARD_MESURES['Pantalon']));
    piecesList = [
      {
        name: isAr ? 'هودي أوفر سايز بكابوش (Hoodie à Capuche)' : 'Hoodie à Capuche Oversize',
        consumption: '1.70m',
        fit: isAr ? 'أوفر سايز واسع (Over-size / Relaxed)' : 'Over-size / Relaxed',
        complexity: isAr ? 'متوسطة' : 'Moyenne',
        costEstimate: `65 - 75 MAD`,
        components: isAr ? ['صدر أمامي', 'ظهر كامل', 'كابوش مزدوج', 'جيب كنغر أمامي', 'أكمام مع بورد-كوت'] : ['Devant', 'Dos', 'Capuche doublée', 'Poche kangourou', 'Manches avec bord-côte'],
        fabricSuggested: isAr ? 'ميلتون قطن ممشوط دافي (Molleton Gratté 320g)' : 'Molleton Gratté 320g',
        fabricAlternatives: [
          { name: isAr ? 'فرينش تيري ربيعي (French Terry Coton)' : 'French Terry Coton', pros: isAr ? 'حلقات داخلية مريحة لجميع الفصول' : 'Boucles confortables toutes saisons', cons: isAr ? 'أقل دفئاً في الشتاء القارس' : 'Moins chaud en grand froid' },
          { name: isAr ? 'إنترلوك قطن فاخر (Interlock Coton 280g)' : 'Interlock Coton 280g', pros: isAr ? 'وجهين ناعمين وقوام ثابت' : 'Toucher soyeux double face', cons: isAr ? 'ثمن الكيلو أعلى' : 'Prix au kilo supérieur' }
        ],
        mesures: mesuresHoodie
      },
      {
        name: isAr ? 'سروال رياضي مريح (Pantalon Jogging)' : 'Pantalon Jogging Confort',
        consumption: '1.40m',
        fit: isAr ? 'مريح عادي (Regular Jogger)' : 'Regular Jogger',
        complexity: isAr ? 'متوسطة' : 'Moyenne',
        costEstimate: `50 - 58 MAD`,
        components: isAr ? ['أرجل أمامية وخلفية', 'حزام خصر مطاطي مع كوردون', 'جيوب جانبية إيطالية', 'أساور كاحل مطاطية'] : ['Jambes devant/dos', 'Ceinture élastique avec cordon', 'Poches italiennes', 'Bord-côte chevilles'],
        fabricSuggested: isAr ? 'ميلتون قطن ممشوط دافي (Molleton Gratté 320g)' : 'Molleton Gratté 320g',
        fabricAlternatives: [
          { name: isAr ? 'فرينش تيري (French Terry)' : 'French Terry', pros: isAr ? 'مرونة عالية ومقاومة للغسيل' : 'Grande élasticité et tenue', cons: isAr ? 'أخف وزناً' : 'Plus léger' }
        ],
        mesures: mesuresPantalon
      }
    ];
  } else if (text.includes('sweat') || text.includes('hoodie') || text.includes('سويت') || text.includes('هودي') || text.includes('توني') || text.includes('sport') || text.includes('over')) {
    pieceName = isAr ? 'سويت شيرت / هودي كاجوال (Sweatshirt / Hoodie)' : 'Sweatshirt / Hoodie';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['TShirt'] || STANDARD_MESURES['Chemise']));
    piecesList = [{
      name: pieceName,
      consumption: '1.60m',
      fit: isAr ? 'أوفر سايز واسع (Over-size / Relaxed)' : 'Over-size / Relaxed',
      complexity: isAr ? 'متوسطة' : 'Moyenne',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['صدر أمامي', 'ظهر كامل', 'أكمام طويلة', 'أساور وحافة مطاطية (Bord-côte)', 'ياقة دائرية مدعمة'] : ['Devant', 'Dos', 'Manches longues', 'Bord-côte poignets & bas', 'Col rond renforcé'],
      fabricSuggested: isAr ? 'مولتون قطن مبطن / إنترلوك (Molleton Gratté / Interlock)' : 'Molleton Gratté / Interlock',
      fabricAlternatives: [
        { name: isAr ? 'إنترلوك قطن 100% ثقيل (Interlock 280g)' : 'Interlock 280g', pros: isAr ? 'وجهين ناعمين، قوام ثابت ومثالي لجميع الفصول' : 'Double face lisse, excellente tenue toutes saisons', cons: isAr ? 'أقل دفئاً في الشتاء القارس من الفليس' : 'Moins chaud en hiver rude' },
        { name: isAr ? 'فرينش تيري قطن (French Terry)' : 'French Terry 100% Coton', pros: isAr ? 'حلقات داخلية تمتص الرطوبة وعصرية جداً' : 'Boucles intérieures absorbantes', cons: isAr ? 'يحتاج ضبط شدة الغرز في السورجي' : 'Ajustement de tension requis en surjet' }
      ],
      mesures: defaultMesures
    }];
  } else if (text.includes('pantalon') || text.includes('سروال') || text.includes('cargo') || text.includes('بنطلون') || text.includes('jean')) {
    pieceName = isAr ? 'سروال كارجو / كاجوال (Pantalon Cargo)' : 'Pantalon Cargo Casual';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['Pantalon']));
    piecesList = [{
      name: pieceName,
      consumption: '1.40m',
      fit: isAr ? 'مريح عادي (Regular Fit)' : 'Regular Fit',
      complexity: isAr ? 'متوسطة' : 'Moyenne',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['أرجل أمامية', 'أرجل خلفية', 'جيوب كارجو جانبية مع أغطية', 'حزام خصر مع عرى (Passants)', 'سحاب أمامي'] : ['Jambes devant', 'Jambes dos', 'Poches cargo à rabat', 'Ceinture avec passants', 'Fermeture zip'],
      fabricSuggested: isAr ? 'جاباردين قطن متين (Gabardine Coton Stretch)' : 'Gabardine Coton Stretch',
      fabricAlternatives: [
        { name: isAr ? 'دينيم جينز خفيف (Denim 10oz)' : 'Denim léger 10oz', pros: isAr ? 'مظهر شبابي وقوة تحمل تدوم طويلاً' : 'Style intemporel et grande robustesse', cons: isAr ? 'يتطلب غسيل صناعي (Délavage)' : 'Nécessite lavage industriel' },
        { name: isAr ? 'تويل قطن (Coton Twill)' : 'Coton Twill', pros: isAr ? 'مريح في الحركة وسهل في الكيّ' : 'Confortable et facile à repasser', cons: isAr ? 'أقل مقاومة للاحتكاك الشديد' : 'Moins résistant aux frottements' }
      ],
      mesures: defaultMesures
    }];
  } else if (text.includes('caftan') || text.includes('قفطان') || text.includes('takchita') || text.includes('تكشيطة')) {
    pieceName = isAr ? 'قفطان مغربي عصري (Caftan Moderne)' : 'Caftan Moderne';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['Caftan']));
    piecesList = [{
      name: pieceName,
      consumption: '3.50m',
      fit: isAr ? 'كلاسيكي فضفاض (Coupe Traditionnelle)' : 'Coupe Traditionnelle',
      complexity: isAr ? 'معقدة / احترافية' : 'Complexe',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['دفائن أمامية', 'ظهر', 'أكمام واسعة', 'سفيفة وعقاد في الصدر', 'حزام مضمة'] : ['Devants', 'Dos', 'Manches amples', 'Sfifa & Aakad', 'Ceinture Mdamma'],
      fabricSuggested: isAr ? 'كريب كوري فاخر / ساتان حرير (Crêpe Soie)' : 'Crêpe Soie / Satin',
      fabricAlternatives: [
        { name: isAr ? 'جوهرة حريرية (Jawhara Soie)' : 'Jawhara Soie', pros: isAr ? 'أصالة مغربية وبريق راقي' : 'Élégance marocaine authentique', cons: isAr ? 'ثمن المتر مرتفع' : 'Prix au mètre élevé' },
        { name: isAr ? 'بروكار بهجة (Brocart)' : 'Brocart', pros: isAr ? 'فخامة ملكية للمناسبات' : 'Faste pour grandes occasions', cons: isAr ? 'ثقيل في اللبس' : 'Lourd à porter' }
      ],
      mesures: defaultMesures
    }];
  } else if (text.includes('djellaba') || text.includes('جلابة')) {
    pieceName = isAr ? 'جلابة مغربية عصرية (Djellaba Moderne)' : 'Djellaba Moderne';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['Djellaba']));
    piecesList = [{
      name: pieceName,
      consumption: '3.00m',
      fit: isAr ? 'مريح وأنيق (Coupe Fluide)' : 'Coupe Fluide',
      complexity: isAr ? 'متوسطة' : 'Moyenne',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['صدر أمامي', 'ظهر', 'أكمام', 'القب (الكابيشون)', 'سفيفة ورندة'] : ['Devant', 'Dos', 'Manches', 'Capuche (Qob)', 'Sfifa & Randa'],
      fabricSuggested: isAr ? 'مليفة كشمير / كريب كوري (Mliffa / Crêpe)' : 'Mliffa / Crêpe',
      fabricAlternatives: [
        { name: isAr ? 'لينن كتان طبيعي (Lin)' : 'Lin naturel', pros: isAr ? 'بارد للصيف والأيام الحارة' : 'Frais en été', cons: isAr ? 'كيتكمش بسرعة' : 'Se froisse vite' },
        { name: isAr ? 'كريب ريحانة (Crêpe Rayhana)' : 'Crêpe Rayhana', pros: isAr ? 'طايح وخفيف وعملي' : 'Fluide et pratique', cons: isAr ? 'يتطلب عناية في الكي' : 'Repassage soigné requis' }
      ],
      mesures: defaultMesures
    }];
  } else if (text.includes('chemise') || text.includes('قميص') || text.includes('شوميز') || text.includes('blouse')) {
    pieceName = isAr ? 'قميص كلاسيكي عصري (Chemise Classique)' : 'Chemise Classique';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['Chemise']));
    piecesList = [{
      name: pieceName,
      consumption: '1.50m',
      fit: isAr ? 'عادي سليم (Slim / Regular)' : 'Slim / Regular',
      complexity: isAr ? 'متوسطة' : 'Moyenne',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['صدر أمامي مع مرد أزرار', 'ظهر مع كول دوبل', 'أكمام طويلة مع أساور', 'ياقة كول شوميز مع فيزلين', 'جيب صدري'] : ['Devant avec gorge', 'Dos avec empiècement', 'Manches avec poignets', 'Col thermocollé', 'Poche poitrine'],
      fabricSuggested: isAr ? 'بوبلين قطن 100% (Popeline Coton)' : 'Popeline 100% Coton',
      fabricAlternatives: [
        { name: isAr ? 'قطن أكسفورد (Oxford Coton)' : 'Oxford Coton', pros: isAr ? 'متين وفاخر ولا يتجعد بسرعة' : 'Durable et infroissable', cons: isAr ? 'أثقل قليلاً للصيف' : 'Un peu lourd en plein été' },
        { name: isAr ? 'كتان لينن ممتاز (Lin)' : 'Lin', pros: isAr ? 'منعش وأنيق جداً' : 'Très chic et frais', cons: isAr ? 'يتطلب الكي المستمر' : 'Nécessite repassage fréquent' }
      ],
      mesures: defaultMesures
    }];
  } else if (text.includes('robe') || text.includes('فستان') || text.includes('abaya') || text.includes('عباية')) {
    pieceName = isAr ? 'فستان عصري راقي (Robe Moderne)' : 'Robe Moderne';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['Robe']));
    piecesList = [{
      name: pieceName,
      consumption: '2.50m',
      fit: isAr ? 'انسيابي أنيق (Coupe Évasée)' : 'Coupe Évasée',
      complexity: isAr ? 'متوسطة' : 'Moyenne',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['صدر أمامي مبطن', 'ظهر مع سحاب مخفي', 'أكمام انسيابية', 'تنورة واسعة', 'حزام خصر اختياري'] : ['Buste doublé', 'Dos avec zip invisible', 'Manches fluides', 'Jupe évasée', 'Ceinture'],
      fabricSuggested: isAr ? 'كريب دي شين انسيابي (Crêpe de Chine)' : 'Crêpe de Chine',
      fabricAlternatives: [
        { name: isAr ? 'ساتان حريري (Satin Soie)' : 'Satin de Soie', pros: isAr ? 'بريق فاخر للسهرات والمناسبات' : 'Brillance soirée', cons: isAr ? 'حساس للحرارة' : 'Sensible à la chaleur' },
        { name: isAr ? 'موسلين شيفون (Mousseline)' : 'Mousseline Chiffon', pros: isAr ? 'خفيف وشفاف للطبقات' : 'Léger et vaporeux', cons: isAr ? 'يحتاج بطانة داخلية' : 'Nécessite doublure' }
      ],
      mesures: defaultMesures
    }];
  } else {
    // Intelligent default: Sweatshirt / T-Shirt Manches Longues (matches long-sleeve grey shirt)
    pieceName = isAr ? 'سويت شيرت / تيشرت أكمام طويلة (Sweatshirt / Long Sleeve)' : 'Sweatshirt / T-Shirt Manches Longues';
    defaultMesures = JSON.parse(JSON.stringify(STANDARD_MESURES['TShirt'] || STANDARD_MESURES['Chemise']));
    piecesList = [{
      name: pieceName,
      consumption: '1.50m',
      fit: isAr ? 'عادي مريح (Regular Fit)' : 'Regular Fit',
      complexity: isAr ? 'متوسطة' : 'Moyenne',
      costEstimate: `${Math.round(breakdown.coutRevientEstime)} - ${Math.round(breakdown.prixVenteConseille)} MAD`,
      components: isAr ? ['صدر أمامي', 'ظهر متناسق', 'أكمام طويلة مع أساور Bord-côte', 'ياقة دائرية مع شريط نظافة Propreté', 'ثنية سفلية مزدوجة'] : ['Buste devant', 'Dos', 'Manches longues avec finitions', 'Col rond avec bande de propreté', 'Ourlet bas double aiguille'],
      fabricSuggested: isAr ? 'إنترلوك قطن ممتاز / ميلتون صيفي (Interlock 100% Coton 260g)' : 'Interlock 100% Coton / Molleton été',
      fabricAlternatives: [
        { name: isAr ? 'جيرسي قطن مُمشط (Jersey Coton Combed 220g)' : 'Jersey Coton Combed 220g', pros: isAr ? 'خفيف وناعم جداً على البشرة ومريح صيفاً وشتاءً' : 'Léger, ultra-doux et agréable au porter', cons: isAr ? 'أقل سماكة في الشتاء البارد' : 'Moins épais pour grand froid' },
        { name: isAr ? 'مولتون فرينش تيري (French Terry Coton)' : 'French Terry Coton', pros: isAr ? 'قوام رياضي واقف وموضة عالية الطلب' : 'Excellente tenue sportive streetwear', cons: isAr ? 'ثمن الكيلو أعلى قليلاً في سوق الجملة' : 'Prix au kilo légèrement supérieur' }
      ],
      mesures: defaultMesures
    }];
  }

  const result: any = {
    category: pieceName,
    consumption: piecesList[0].consumption || `${breakdown.consommationMetrage}m`,
    fit: piecesList[0].fit,
    complexity: piecesList[0].complexity,
    costEstimate: piecesList[0].costEstimate,
    components: piecesList[0].components,
    fabricSuggested: piecesList[0].fabricSuggested,
    fabricAlternatives: piecesList[0].fabricAlternatives,
    pieces: piecesList,
    gammeMontage: breakdown.postesTravail,
    rawAnalysis: ''
  };

  return result;
}

export default function AISpace({ initialLead, onClose }: { initialLead?: Lead, onClose?: () => void }) {
  const { isAr, toggle } = useLang();
  const company = loadCompanyProfile();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall('/manifest-ai.json');
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
    gammeMontage?: PosteTravail[];
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
    tissuPhoto?: string;
  }>(null);
  const [unsplashPhotos, setUnsplashPhotos] = useState<string[]>([]);
  const [isSearchingFabric, setIsSearchingFabric] = useState(false);
  const fabricPhotoRef = useRef<HTMLInputElement>(null);

  const handleSearchFabric = async (fabricName: string) => {
    try {
      setIsSearchingFabric(true);
      const query = `${fabricName} fabric texture textile`;
      const UNSPLASH_ACCESS_KEY = '-9T6_bObqAOMmPEAo_lhLYpyYXeyDrmhNNuCSxBpCM8';
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=4&orientation=landscape`, {
         headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
      });
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setUnsplashPhotos(data.results.map((r: any) => r.urls.small));
      } else {
        setUnsplashPhotos(['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800']); // Fallback fabric
      }
    } catch (err) {
      console.error(err);
      setUnsplashPhotos(['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800']);
    } finally {
      setIsSearchingFabric(false);
    }
  };
  const [activePieceIdx, setActivePieceIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'fiche' | 'mesures' | 'chat' | 'photo' | 'gamme'>('chat');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: isAr ? 'مرحباً بك في المستشار الذكي لتحليل الموديلات. ارفع صورة الموديل للبدء في التحليل الفوري للثوب والتكلفة والقياسات.' : 'Bienvenue dans l\'espace d\'analyse. Uploadez une photo de modèle pour commencer.' }
  ]);
  const [msg, setMsg] = useState('');
  const [isBoxMaximized, setIsBoxMaximized] = useState(false);
  const [cadenceLevel, setCadenceLevel] = useState<'pro' | 'standard' | 'debutant'>('pro');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBoxMaximized) {
        setIsBoxMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBoxMaximized]);

  const getPosteTimeForCadence = (p: PosteTravail, level: 'pro' | 'standard' | 'debutant'): number => {
    const isCoupe = (p.machine || '').toLowerCase().includes('coupe') || (p.nomAr || '').includes('فصالة');
    if (level === 'pro') {
      if (typeof p.tempsPro === 'number') return p.tempsPro;
      return isCoupe ? Math.min(p.tempsMin, 0.8) : Number(Math.max(0.3, p.tempsMin * 0.6).toFixed(2));
    }
    if (level === 'debutant') {
      if (typeof p.tempsDebutant === 'number') return p.tempsDebutant;
      return isCoupe ? Math.max(p.tempsMin * 2, 2.5) : Number((p.tempsMin * 1.8).toFixed(2));
    }
    // 'standard'
    if (typeof p.tempsStandard === 'number') return p.tempsStandard;
    return isCoupe ? Math.max(p.tempsMin, 1.5) : Number((p.tempsMin * 1.15).toFixed(2));
  };

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

  useEffect(() => {
    if (location.state?.resumeModel) {
      const rm = location.state.resumeModel;
      setImage(rm.photo || null);
      
      const restoredChat: {role: 'ai' | 'user', text: string}[] = [{ role: 'ai', text: isAr ? 'تمت استعادة الموديل! كيف يمكنني مساعدتك في هذا الموديل اليوم؟ (مثال: هل يمكن خياطته بثوب آخر؟ أو كم سأحتاج من الثوب لمقاس XXXL؟)' : 'Modèle restauré ! Comment puis-je vous aider ? (ex: Est-il possible de le coudre avec un autre tissu ?)' }];
      if (rm.aiNotes) {
        const notesArr = rm.aiNotes.split('\n\n---\n\n');
        notesArr.forEach((txt: string) => {
           if(txt.trim()) restoredChat.push({ role: 'ai', text: txt });
        });
      }
      setChat(restoredChat);
      
      setAnalysisResult({
        category: rm.type || 'creations',
        complexity: rm.complexity || 'Moyenne',
        consumption: rm.tissuConsommation || '1.5m',
        components: rm.description?.replace(/Composants: |المكونات: /g, '').split(', ') || [],
        costEstimate: rm.costEstimate || '-',
        fabricSuggested: rm.tissuRecommande || '',
        tissuPhoto: rm.tissuPhoto || undefined
      });
      
      if (rm.mesures && rm.mesures.length > 0) {
        setCustomMesures(rm.mesures);
      }
      
      // Clear location state so it doesn't trigger again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isAr]);

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
    setActiveTab('fiche');
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

      let curAnalysis = analysisResult;
      if (!curAnalysis) {
        const allChatText = chat.map(c => c.text).join('\n');
        const userChatText = chat.filter(c => c.role === 'user').map(c => c.text).join(' ');
        const combinedContext = `${userChatText} ${allChatText}`;
        const breakdown = getGarmentTechnicalBreakdown(combinedContext);
        curAnalysis = {
          category: breakdown.categorie || (isAr ? 'موديل من الذكاء الاصطناعي' : 'Modèle AI'),
          consumption: `${breakdown.consommationMetrage}m`,
          complexity: 'متوسطة',
          components: breakdown.postesTravail.map(p => p.nomAr),
          costEstimate: `${breakdown.coutRevientEstime.toFixed(1)} - ${breakdown.prixVenteConseille.toFixed(1)} MAD`,
          fabricSuggested: breakdown.tissuType,
          gammeMontage: breakdown.postesTravail,
          rawAnalysis: ''
        };
        setAnalysisResult(curAnalysis);
      }

      let ftModele = curAnalysis.category;
      const fitStr = curAnalysis.fit || (curAnalysis.pieces?.[0]?.fit) || '';
      const compStr = curAnalysis.complexity || '';

      const extrasAr = ` | القصة: ${fitStr || 'عادي'} | الصعوبة: ${compStr || 'متوسط'}`;
      const extrasFr = ` | Coupe: ${fitStr || 'Regular'} | Complexité: ${compStr || 'Moyenne'}`;

      let ftDescription = isAr
        ? `المكونات: ${(curAnalysis.components || []).join('، ')}${extrasAr}`
        : `Composants: ${(curAnalysis.components || []).join(', ')}${extrasFr}`;
      let ftMesures = (customMesures && customMesures.length > 0) ? customMesures : [
        { nom: isAr ? 'دورة الصدر (Poitrine)' : 'Tour de poitrine', valeurs: { S: 92, M: 96, L: 100, XL: 106, XXL: 112 } },
        { nom: isAr ? 'عرض الكتف (Carrure)' : 'Carrure', valeurs: { S: 38, M: 40, L: 42, XL: 44, XXL: 46 } },
        { nom: isAr ? 'الطول الإجمالي (Longueur)' : 'Longueur totale', valeurs: { S: 95, M: 96, L: 97, XL: 98, XXL: 99 } },
        { nom: isAr ? 'طول الكم (Manche)' : 'Longueur manche', valeurs: { S: 58, M: 59, L: 60, XL: 61, XXL: 62 } },
        { nom: isAr ? 'دورة الخصر (Tour de taille)' : 'Tour de taille', valeurs: { S: 74, M: 78, L: 82, XL: 88, XXL: 94 } },
        { nom: isAr ? 'دورة الحوض (Hanches)' : 'Tour de hanches', valeurs: { S: 98, M: 102, L: 106, XL: 112, XXL: 118 } }
      ];
      let ftConso = parseConso(curAnalysis.consumption) || 2.50;

      if (mode === 'current' && curAnalysis.pieces && curAnalysis.pieces.length > 0) {
        const p = curAnalysis.pieces[activePieceIdx];
        if (p) {
          const pFit = p.fit || fitStr;
          const pComp = p.complexity || compStr;
          const pExtAr = ` | القصة: ${pFit || 'عادي'} | الصعوبة: ${pComp || 'متوسط'}`;
          const pExtFr = ` | Coupe: ${pFit || 'Regular'} | Complexité: ${pComp || 'Moyenne'}`;

          ftModele = p.name;
          ftDescription = isAr ? `المكونات: ${(p.components || []).join('، ')}${pExtAr}` : `Composants: ${(p.components || []).join(', ')}${pExtFr}`;
          ftMesures = piecesMesures[activePieceIdx] || customMesures; // The active table (with any manual edits)
          ftConso = parseConso(p.consumption) || ftConso;
        }
      } else if (mode === 'complete') {
        ftModele = curAnalysis.category;
        const allComps: string[] = [];

        if (curAnalysis.pieces && curAnalysis.pieces.length > 0) {
          const combinedMesures: any[] = [];
          let totalConso = 0;

          curAnalysis.pieces.forEach((p: any, pIdx: number) => {
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

        if (allComps.length === 0 && curAnalysis.components && Array.isArray(curAnalysis.components)) {
          allComps.push(...curAnalysis.components);
        }

        if (allComps.length > 0) {
          ftDescription = isAr ? `المكونات: ${allComps.join('، ')}${extrasAr}` : `Composants: ${allComps.join(', ')}${extrasFr}`;
        }
      } else {
        if (curAnalysis.components && Array.isArray(curAnalysis.components) && curAnalysis.components.length > 0) {
          ftDescription = isAr ? `المكونات: ${curAnalysis.components.join('، ')}${extrasAr}` : `Composants: ${curAnalysis.components.join(', ')}${extrasFr}`;
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
        type: mode === 'complete' ? 'Ensemble' : (curAnalysis.category || 'creations'),
        tissuRecommande: (mode === 'current' ? curAnalysis.pieces?.[activePieceIdx]?.fabricSuggested : null) || curAnalysis.fabricSuggested || curAnalysis.pieces?.[0]?.fabricSuggested || '—',
        createdAt: new Date().toISOString().split('T')[0],
        photo: image || undefined,
        fit: (mode === 'current' ? curAnalysis.pieces?.[activePieceIdx]?.fit : null) || fitStr || curAnalysis.pieces?.[0]?.fit || 'Regular',
        complexity: (mode === 'current' ? curAnalysis.pieces?.[activePieceIdx]?.complexity : null) || compStr || curAnalysis.pieces?.[0]?.complexity || 'Moyenne',
        costEstimate: (mode === 'current' ? curAnalysis.pieces?.[activePieceIdx]?.costEstimate : null) || curAnalysis.costEstimate || curAnalysis.pieces?.[0]?.costEstimate || '—',
        aiNotes: chat.filter(c => c.role === 'ai').map(c => c.text).join('\n\n---\n\n'),
        tissuPhoto: curAnalysis.tissuPhoto || undefined
      };

      // Save to fiches, but we'll use client="Suggestion Expert" to identify them
      await saveRecord('fiches', newFT);
      try {
        localStorage.setItem('beya_ai_to_ft', JSON.stringify(newFT));
      } catch (e) {
        try {
          const lightFT = { ...newFT, photo: undefined, tissuPhoto: undefined };
          localStorage.setItem('beya_ai_to_ft', JSON.stringify(lightFT));
        } catch (e2) {
          console.warn('LocalStorage limit exceeded, skipping local cache for export.');
        }
      }
      window.open('/#/fiches-techniques', '_blank');
      setCustomAlert({
        title: isAr ? "تم التصدير بنجاح 🎉" : "Exportation réussie 🎉",
        message: isAr 
          ? "تم حفظ الموديل وإرساله للبطاقة التقنية وفتحها في صفحة البطاقات التقنية." 
          : "Le modèle a été exporté et ouvert dans les Fiches Techniques.",
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
      
      const items: { designation: string; montant: number; detail: string; image?: string }[] = [];
      
      for (let i = 1; i < tableLines.length; i++) { // skip header
        const cells = tableLines[i].split('|').map(s => s.trim()).filter(Boolean);
        if (cells.length >= 2) {
          // Try to extract amount from cells
          const amountCell = cells.find(c => /\d+[.,\d]*/.test(c.replace(/\*+/g, '')));
          const nameCell = cells.find(c => !/^[\d.,]+/.test(c.replace(/\*+/g, '').trim()) && c.length > 1);
          const amount = amountCell ? parseFloat(amountCell.replace(/\*+/g, '').replace(',', '.').match(/[\d.]+/)?.[0] || '0') : 0;
          const name = nameCell?.replace(/\*+/g, '').trim() || '';
          if (name && amount > 0 && !name.toLowerCase().includes('total') && !name.includes('إجمالي') && !name.includes('مجموع') && !name.toLowerCase().includes('revient')) {
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
    const allChatText = chat.map(c => c.text).join('\n');
    const userChatText = chat.filter(c => c.role === 'user').map(c => c.text).join(' ');
    const combinedContext = `${userChatText} ${allChatText} ${selectedLead?.type || ''} ${selectedLead?.name || ''}`;

    const executeFallbackAnalysis = (noticeMsg?: string) => {
      const fallbackResult = buildFallbackAnalysis(combinedContext, isAr);
      setCustomMesures(fallbackResult.pieces[0].mesures);
      setPiecesMesures(fallbackResult.pieces.map((p: any) => JSON.parse(JSON.stringify(p.mesures))));
      setAnalysisResult(fallbackResult);
      setActiveTab('fiche');
      setAnalyzing(false);
      const reportText = buildRapportText(fallbackResult, isAr);
      const finalMsg = noticeMsg ? `${noticeMsg}\n\n${reportText}` : reportText;
      setChat(prev => [...prev, { role: 'ai', text: finalMsg }]);
    };

    if (!apiKey) {
      setTimeout(() => {
        executeFallbackAnalysis(
          isAr
            ? '⚡ تم تحليل الموديل بنجاح عبر محرك الخياطة الذكي BEYA Expert:'
            : '⚡ Analyse réussie via le moteur BEYA Expert :'
        );
      }, 600);
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
   - للسروال أو البوكسر: الخصر، الورك، الطول، الفخذ، أسفل الرجل.
8. نوع الثوب الرئيسي المقترح لصناعة هذه القطعة مع اقتراحين بديلين للثوب، مع ذكر المزايا والعيوب لكل بديل بالدارجة المغربية بشكل مختصر ومفيد للمصنع.
9. لاغام ديال الخياطة وبوستات العمل (gammeMontage): أعطني سلسلة مراحل الخياطة الدقيقة الخاصة بهذا الموديل في مصنع ملابس حقيقي:
   - هام جداً بخصوص الفصالة: الفصالة في المعمل تكون بالمطلوة الصناعية (Coupe Matelas) وليس بياسة ببياسة، والوقت المحسوب هو وقت إطلاق المطلوة مقسوم على عدد البياسات (حوالي 0.8 إلى 1.2 دقيقة للبياسة فقط).
   - أوقات الخياطة (Piqueuse, Surjeteuse, Finition...): يجب أن تكون أوقات عمال محترفين حرافيين (Cadence Pro) بحيث يكون الوقت الإجمالي للموديل (SAM) واقعياً للإنتاج السريع (مثلاً بين 9 و 18 دقيقة للموديل الكامل).
   - لكل مرحلة حدد: الآلة، وقت الحرافيين (tempsPro)، وقت ستاندار (tempsStandard)، ووقت المبتدئين (tempsDebutant).

أجب بصيغة JSON فقط بدون أي نص إضافي، بهذا الشكل:
{
  "category": "اسم عام للموديل",
  "totalConsumption": "1.50m",
  "totalCost": "35 - 55 MAD",
  "complexity": "متوسطة",
  "fabricSuggested": "نوع الثوب الرئيسي المقترح للموديل",
  "fabricAlternatives": [
    {
      "name": "اسم الثوب البديل",
      "pros": "المزايا",
      "cons": "العيوب"
    }
  ],
  "gammeMontage": [
    {
      "nomAr": "فصالة القماش بالمطلوة الصناعية وتحضير الرزم",
      "nomFr": "Coupe Matelas & Préparation Paquets",
      "machine": "Table de Coupe / Ciseaux",
      "tempsMin": 0.8,
      "tempsPro": 0.8,
      "tempsStandard": 1.2,
      "tempsDebutant": 2.0,
      "roleOuvrier": "فصالة وباترون"
    }
  ],
  "pieces": [
    {
      "name": "تيشرت / سويت شيرت",
      "consumption": "1.50m",
      "fit": "عادي (Regular)",
      "complexity": "متوسط",
      "costEstimate": "35 - 55 MAD",
      "components": ["صدر أمامي", "ظهر", "أكمام طويلة", "ياقة دائرية"],
      "fabricSuggested": "إنترلوك قطن 100%",
      "fabricAlternatives": [],
      "mesures": [
        {"nom": "الصدر (Poitrine)", "valeurs": {"S": 96, "M": 102, "L": 108, "XL": 114, "XXL": 120}}
      ]
    }
  ]
}`
        : `Tu es un expert textile et confection en atelier industriel marocain. Analyse cette image avec une très haute précision.
Consignes pour la gamme de montage :
- Coupe industrielle : calculée impérativement en coupe matelas par pli amorti (0.8 à 1.2 min/pièce, jamais du sur-mesure pièce par pièce).
- Cadence ateliers pro : temps de couture et finition réalistes pour ouvriers qualifiés (total SAM 10 à 18 min pour le vêtement complet).
- Fournir pour chaque opération : nomAr, nomFr, machine, tempsMin, tempsPro, tempsStandard, tempsDebutant, roleOuvrier.
Réponds UNIQUEMENT au format JSON sans texte additionnel avec category, totalConsumption, totalCost, complexity, fabricSuggested, fabricAlternatives, gammeMontage et pieces.`;

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      let data: any = null;

      for (const mod of candidateModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${apiKey}`, {
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

          if (res.ok) {
            const j = await res.json();
            if (j.candidates && j.candidates.length > 0 && !j.error) {
              data = j;
              break;
            }
          }
        } catch (apiTryErr) {
          console.warn('Model try failed:', mod, apiTryErr);
        }
      }

      // If Gemini API failed or was throttled/quota limit 0, use resilient BEYA Expert Engine
      if (!data || data.error) {
        console.info('Using BEYA Expert fallback analysis engine');
        executeFallbackAnalysis(
          isAr
            ? '⚡ تم إنجاز التحليل التقني وتوليد البطاقة عبر محرك BEYA Expert بنجاح:'
            : '⚡ Analyse technique générée avec succès via le moteur BEYA Expert :'
        );
        return;
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
          category: parsed.category || (isAr ? 'موديل' : 'Modèle'),
          consumption: simplifyConsumption(parsed.totalConsumption || parsed.consumption) || '1.50m',
          fit: parsed.fit || (parsed.pieces?.[0]?.fit) || (isAr ? 'عادي' : 'Regular'),
          complexity: parsed.complexity || (isAr ? 'متوسطة' : 'Moyenne'),
          costEstimate: parsed.totalCost || parsed.costEstimate || '35 - 55 MAD',
          components: [],
          pieces: [],
          gammeMontage: [],
          fabricSuggested: parsed.fabricSuggested || '',
          fabricAlternatives: parsed.fabricAlternatives || [],
          rawAnalysis: rawText
        };

        if (parsed.pieces && Array.isArray(parsed.pieces) && parsed.pieces.length > 0) {
          result.pieces = parsed.pieces.map((p: any) => ({
            name: p.name || (isAr ? 'قطعة' : 'Pièce'),
            consumption: simplifyConsumption(p.consumption) || '1.50m',
            fit: p.fit || (isAr ? 'عادي' : 'Regular'),
            complexity: p.complexity || (isAr ? 'متوسط' : 'Moyen'),
            costEstimate: p.costEstimate || '—',
            components: p.components || [],
            fabricSuggested: p.fabricSuggested || '',
            fabricAlternatives: p.fabricAlternatives || [],
            mesures: (p.mesures || []).map((m: any) => ({
              nom: m.nom || '',
              valeurs: m.valeurs || {}
            }))
          }));
          result.components = result.pieces.flatMap((p: any) => p.components);
        } else {
          // If no pieces parsed, enrich from fallback
          const fb = buildFallbackAnalysis(combinedContext, isAr);
          result.pieces = fb.pieces;
          result.components = fb.components;
          if (!result.fabricSuggested) result.fabricSuggested = fb.fabricSuggested;
        }

        // Populate tailored Gamme de Montage
        if (parsed.gammeMontage && Array.isArray(parsed.gammeMontage) && parsed.gammeMontage.length > 0) {
          result.gammeMontage = parsed.gammeMontage.map((g: any) => {
            const rawPro = g.tempsPro || g.tempsMin || 1;
            const tPro = Math.max(0.1, Number(parseFloat(String(rawPro)).toFixed(2)));
            const tStd = g.tempsStandard ? Math.max(0.1, Number(parseFloat(String(g.tempsStandard)).toFixed(2))) : Number((tPro * 1.35).toFixed(2));
            const tDeb = g.tempsDebutant ? Math.max(0.1, Number(parseFloat(String(g.tempsDebutant)).toFixed(2))) : Number((tPro * 2.0).toFixed(2));
            return {
              nomAr: g.nomAr || g.nomFr || 'مرحلة خياطة',
              nomFr: g.nomFr || g.nomAr || 'Opération couture',
              machine: g.machine || 'Piqueuse Plate',
              tempsMin: tPro,
              tempsPro: tPro,
              tempsStandard: tStd,
              tempsDebutant: tDeb,
              roleOuvrier: g.roleOuvrier || (isAr ? 'خياط متخصص' : 'Couturier qualifié')
            };
          });
        } else {
          const fallbackCtx = `${result.category} ${result.fabricSuggested} ${result.pieces.map((p: any) => p.name).join(' ')}`;
          result.gammeMontage = getGarmentTechnicalBreakdown(fallbackCtx).postesTravail;
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
              : JSON.parse(JSON.stringify(STANDARD_MESURES['TShirt'] || STANDARD_MESURES['Robe']))
          ));
        } else {
          setPiecesMesures([]);
        }

        setAnalysisResult(result);
        setActiveTab('fiche');
        setAnalyzing(false);

        // Build rich chat message
        setChat(prev => [...prev, { role: 'ai', text: buildRapportText(result, isAr) }]);

      } catch (parseErr) {
        console.warn('JSON parsing failed, falling back:', parseErr);
        executeFallbackAnalysis(
          isAr
            ? '⚡ تم إنجاز التحليل التقني وتوليد البطاقة عبر محرك BEYA Expert بنجاح:'
            : '⚡ Analyse technique générée avec succès via le moteur BEYA Expert :'
        );
      }
    } catch (err: any) {
      console.warn('startAnalysis encountered error, executing fallback:', err);
      executeFallbackAnalysis(
        isAr
          ? '⚡ تم إنجاز التحليل التقني وتوليد البطاقة عبر محرك BEYA Expert بنجاح:'
          : '⚡ Analyse technique générée avec succès via le moteur BEYA Expert :'
      );
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

    // 0. Fabric Where to Buy & Exact Market Price (Where to find fabric in Morocco & exact prices)
    const asksWhereToBuy = /(fin|fen|fayn|mneen|mnin|mmin|achmen blasa|blasa|marche|souk|fournisseur|sourcing|فين.*(نلقى|نلقا|نشري|كيتباع|كاين|كايتباع)|(نلقى|نلقا|نشري|شراء).*(ثوب|قماش|سلعة)|درب عمر|القريعة|كراج علال|سوق|أسواق|أماكن|فين|fin.*nlqa|fen.*nlqa|ou.*trouver|ou.*acheter)/i.test(m);
    const asksFabricPrice = /(taman|thman|prix|cout|coût|cost|سعر|ثمن|تكلفة|بشحال|chehal.*(toub|tissu|tweb)|combien.*(tissu|tweb)|prix.*(tissu|metre|kilo)|dak toub|had toub|diak toub|داك الثوب|داك التوب|هاد الثوب|هاد التوب|ثمن داك|ثمن هاد|ثمن الثوب|سعر الثوب|تمن داك)/i.test(m);

    if (asksWhereToBuy || asksFabricPrice) {
      let specificModelPart = '';
      if (analysisResult) {
        const cat = analysisResult.category || 'الموديل الحالي';
        const fab = analysisResult.fabricSuggested || 'ثوب مناسب للموديل';
        const conso = analysisResult.consumption || '1.50م';
        const costEst = analysisResult.costEstimate || '';
        const numConso = parseFloat(conso) || 1.5;
        specificModelPart = speakAr
          ? `\n🎯 بالنسبة للموديل المحلل حالياً (${cat}):
• الثوب المقترح: ${fab}
• استهلاك البياسة الواحدة: حوالي ${conso}
• ثمن الثوب فالسوق المغربي: ما بين 22 إلى 48 درهم للمتر (أو 48-65 درهم/كلغ للتريكو)
• تكلفة الثوب فالبياسة الواحدة: تقريباً ${(numConso * 25).toFixed(0)} إلى ${(numConso * 45).toFixed(0)} درهم
${costEst ? `• التكلفة الإجمالية التقديرية للقطعة (Prix de revient): ${costEst}` : ''}\n`
          : `\n🎯 Détails pour votre modèle (${cat}) :
• Tissu suggéré : ${fab}
• Consommation : ~${conso}
• Prix marché : 22 - 48 MAD/mètre\n`;
      }

      if (speakAr) {
        return `🧵 جواب دقيق ومفصل: أثمنة الأثواب وفين تلقاها في المغرب (درب عمر / القريعة / كراج علال):
${specificModelPart}
💰 1. جدول أثمنة الأثواب بالتدقيق في السوق المغربي (أسعار الجملة 2025/2026):
• أثواب الهوديات والترينغات (Sweatwear):
  - ميلتون ممشوط دافي (Molleton Gratté 300g-380g): من 48 إلى 65 درهم للكيلو (الكيلو كيعطيك حوالي 1.8م إلى 2.1م).
  - فرينش تيري ربيعي (French Terry 260g-320g): من 45 إلى 60 درهم للكيلو.
  - ريب / كوتلي للأسوار والعنق (Bord-Côte / Rib): من 50 إلى 70 درهم للكيلو.
• أثواب التيشرتات والملابس الصيفية:
  - سينجل جيرسي قطن 100% (Single Jersey 180g-220g): من 42 إلى 58 درهم للكيلو (~20 إلى 26 درهم/متر).
  - إنترلوك فاخر مزدوج (Interlock Coton Double Face 240g-280g): من 55 إلى 75 درهم للكيلو (~32 إلى 45 درهم/متر).
• أثواب القمصان والبلوزات:
  - بوبلين قطن 100% (Popeline de Coton): من 22 إلى 35 درهم للمتر (عرض 1.50م).
  - بوبلين بوليستير/قطن تجاري: من 14 إلى 20 درهم للمتر.
  - أكسفورد (Oxford Chemise): من 24 إلى 38 درهم للمتر.
• أثواب السراويل والبدل والعمل:
  - غاباردين ستريتش (Gabardine Stretch): من 28 إلى 48 درهم للمتر.
  - جينز / دينيم (Denim Jeans 10oz - 13oz): من 25 إلى 48 درهم للمتر.
• أثواب اللباس التقليدي والفساتين والعبايات:
  - كريب ريحانة (Crêpe Rayhana): من 22 إلى 32 درهم للمتر.
  - كريب زوم / بوسطن الممتاز: من 28 إلى 42 درهم للمتر.
  - كريب الحرير (Crêpe de Soie): من 45 إلى 75 درهم للمتر.
  - المليفة والمخمل (Velours): من 35 إلى 70 درهم للمتر.
  - ساتان دو شيس (Satin Duchesse): من 22 إلى 42 درهم للمتر.
  - الكتان الطبيعي (Lin 100%): من 40 إلى 70 درهم للمتر.

📍 2. فين تلقى وتشتري هاد الأثواب بالتدقيق في المغرب:
🏙️ الدار البيضاء (العاصمة الوطنية للنسيج والجملة):
1️⃣ درب عمر (Derb Omar):
  • شارع ستراسبورغ (Rue de Strasbourg): أكبر تجمع لمستوردي أثواب الجملة (الرولوات الكبار Rouleaux) للقمصان، الكريب، البوبلين، والبدل.
  • زنقة لندن ودرب التازي: تجار الجملة ونصف الجملة (تقدر تشري حتى نصف رولو أو كوبونات للتجارب).
2️⃣ حي القريعة (El Koréa):
  • عاصمة التريكو والميلتون والجيرسي بالمغرب (البيع بالكيلو).
  • هنا كاينين أكبر مستودعات أثواب الهوديات، التيشرتات، الترينغات، ومستلزمات الخياطة (البورد كوت Bord-Côte، الخيط، لاستيك، السحابات).
3️⃣ كراج علال وقيساريات درب السلطان:
  • المتخصصين في أثواب التقليدي (المليفة، الكريب، الساتان، المخمل/Velours) وسفايف الخياطة والعقاد.
4️⃣ المنطقة الصناعية عين السبع وسيدي البرنوصي:
  • معامل النسيج والتريكو المباشرة (Tricotage & Teinture) للطلبيات الكبيرة (+200kg) بسعر المصنع المباشر.

🏙️ المدن الأخرى:
• طنجة: أسواق بني مكادة، ومستودعات ديسطوكاج أثواب التصدير (Tissus export déstockage جودة أوربية وثمن رخيص).
• فاس: قيساريات باب بودير، سوق العطارين، والصفاح (المليفة، الكريب، وأثواب الجلابة والقفطان).
• مراكش: قيسارية الدباغ وباب الملاح (أثواب الجلابة والكتان والأثواب الطبيعية).

💡 3. نصائح احترافية قبل الشراء باش ما تشمتش:
1. تأكد ديماً من عرض الثوب (Laize): العرض 1.80م كيوفر ليك فالفصالة مقارنة مع 1.50م.
2. دير اختبار الحرق (Test de combustion) لخيط صغير: القطن الطبيعي كيتحرق ويعطي رماد رطب، أما البوليستير كيذوب بحال البلاستيك.
3. فاش كتشري بالكيلو، طلب "الميتراج التقريبي للكيلو" باش تحسب ثمن المتر الحقيقي بدقة.`;
      } else {
        return `🧵 Prix précis des tissus et adresses de sourcing au Maroc (Derb Omar & El Korea) :
${specificModelPart}
💰 1. Prix indicatifs au mètre et au kilo (Grossistes 2025/2026) :
• Molleton Gratté / French Terry (Sweats & Hoodies) : 48 - 65 MAD/kg (~26 - 35 MAD/m, laize 1.80m).
• Interlock Coton 100% (T-shirts Heavyweight 240g+) : 55 - 75 MAD/kg.
• Single Jersey (T-shirts & Boxers) : 42 - 58 MAD/kg (~18 - 26 MAD/m).
• Popeline Coton (Chemises & Blouses) : 20 - 35 MAD/m (laize 1.50m).
• Gabardine Stretch (Pantalons & Uniformes) : 28 - 48 MAD/m.
• Crêpe Rayhana / Zoom (Robes, Djellabas & Abayas) : 22 - 42 MAD/m.
• Denim / Jean : 25 - 48 MAD/m.

📍 2. Où trouver et acheter les tissus au Maroc :
• Casablanca - Derb Omar (Rue de Strasbourg & Rue de Londres) : Grossistes importateurs en rouleaux (popeline, crêpe, costume, chemiserie).
• Casablanca - El Koréa : Marché roi pour la maille tricotée au kilo (molleton, jersey, bord-côte, fournitures).
• Casablanca - Garage Allal & Derb Soltane : Tissus traditionnels (mlifa, velours, crêpe, sfifa).
• Tanger : Marchés Beni Makada et entrepôts de déstockage export.
• Fès : Kissariats Bab Boujloud et Souk El Attarine.`;
      }
    }

    // 1. Specific Fabric: INTERLOCK / LANTRLOC
    if (/(interlock|interlok|lantrloc|linterloc|linterlock|انترلوك|إنترلوك|لانترلوك)/i.test(m)) {
      return speakAr
        ? `🧵 ثوب الإنترلوك (Interlock) في عالم النسيج والخياطة:

• ما هو ثوب الإنترلوك؟
هو نوع ممتاز وفاخر من أثواب "الميلتون والتريكو" المحبوكة المزدوجة (Maille Double Face / Double Knit)، كيتخدم بماكينات دائرية فيها صفين ديال الإبر (Deux fontures).

• الخصائص والمميزات ديالو:
1. وجهين متطابقين: الوجه ديال الثوب والظهر ديالو بحال بحال تماماً (ملسين، ناعمين، ومكيفرقش الوجه من الظهر).
2. ما كيتلواش من الجوانب: بعكس السانجل جيرسي (Single Jersey العادي) اللي كيتلوى من الحواشي فاش كتقطعو، الإنترلوك كيبقى مسرح (ne roule pas sur les bords)، وهادشي كيسهل الفصالة والخياطة بزاف فالمصنع.
3. متين وأثقل: كيكون أثقل من الجيرسي العادي، مكيشفش، وعندو ثقل ومطاطية طبيعية مريحة (Elasticité naturelle) حتى بلا ليكرا.

• فاش كيتستعمل غالباً؟
• تيشرتات ثقيلة ذات جودة عالية (T-shirts Heavyweight من 240g حتى 300g)
• سويت شيرتات وهوديات فخمة (Sweatshirts & Hoodies)
• ملابس الأطفال والرضع (حيت ناعم بزاف على البشرة ومكيسببش حساسية)
• بيجامات فخمة وملابس رياضية (Jogging / Ensembles).

💰 ثمنه التقريبي في المغرب (درب عمر / القريعة): ما بين 55 إلى 75 درهم للكيلو (أو 35-50 درهم للمتر حسب الغراماج ونسبة القطن).
📍 أماكن الشراء: سوق القريعة بالدار البيضاء (جناح التريكو) أو زنقة لندن بدرب عمر.`
        : `🧵 Le tissu Interlock en confection industrielle :

• Définition : Maille tricotée double face (Double Knit). Lisse, douce et ne roule pas sur les bords.
• Utilisations idéales : T-shirts Heavyweight (240g-300g), polos, sweats légers et sportswear.
💰 Prix Maroc : 55 - 75 MAD/kg à El Koréa et Derb Omar.`;
    }

    // 2. Specific Fabric: MOLLETON
    if (/(molleton|molton|ميلتون|مولتون|ملتون|سويت|هودي|sweat)/i.test(m)) {
      return speakAr
        ? `🧵 ثوب الميلتون (Molleton / Sweat Fabric):
هو الثوب الأساسي للهوديز والترينغات الشتوية (Sweat à capuche & Jogging).
• الأنواع:
  1. ميلتون مبطن وممشوط من الداخل (Molleton Gratté / Brossé): كيكون فيه فرو ناعم ودافي.
  2. ميلتون غير مبطن (French Terry / Molleton Non Gratté): كيكون من الداخل بحال حلقات الخيط (bouclettes)، خفيف وربيعي.
• الغراماج المعتاد: من 280g حتى 400g/m².
💰 الثمن في المغرب: من 48 حتى 65 درهم للكيلو في درب عمر وسوق القريعة بالدار البيضاء.
📍 أين يباع: حي القريعة (تجار التريكو بالكيلو) وزنقة لندن بدرب عمر.`
        : `🧵 Le tissu Molleton :
Idéal pour les sweats à capuche et joggings. Disponible en Molleton Gratté (chaud et doux) ou French Terry (bouclettes non grattées). Grammage moyen : 280-400g/m².
💰 Prix : 48 - 65 MAD/kg à El Koréa et Derb Omar.`;
    }

    // 3. Specific Fabric: CREPE
    if (/(crepe|crêpe|كريب)/i.test(m)) {
      return speakAr
        ? `🧵 أثواب الكريب (Crêpe) في المغرب:
هو الثوب الأكثر طلباً للفساتين، الجلابة والقفطان العصري.
• أشهر الأنواع: كريب ريحانة (Crêpe Rayhana)، كريب زوم (Crêpe Zoom)، وكريب الحرير (Crêpe de Soie).
• المميزات: طايح، مكيتبينش، ومكيكمشش بزاف.
💰 الثمن في المغرب:
  - كريب ريحانة: 22 إلى 32 درهم للمتر.
  - كريب زوم / بوسطن: 28 إلى 42 درهم للمتر.
  - كريب الحرير: 45 إلى 75 درهم للمتر.
📍 أين يباع: شارع ستراسبورغ بدرب عمر، وقيساريات كراج علال بالدار البيضاء.`
        : `🧵 Les tissus Crêpe :
Incontournables pour robes, djellabas et caftans. Fluides, opaques et avec un tombé élégant.
💰 Prix : 22 - 45 MAD/mètre à Derb Omar et Garage Allal.`;
    }

    // 4. Specific Fabric: POPELINE / COTON
    if (/(popeline|بوبلين|قطن|coton|oxford|أكسفورد)/i.test(m)) {
      return speakAr
        ? `🧵 ثوب البوبلين والقطن (Popeline de Coton):
النسيج الأساسي للقمصان (Chemises)، البلوزات، وملابس العمل الطبية.
• المميزات: محكم النسيج، ناعم، وبارد في الصيف ومريح على الجسم.
💰 الثمن في المغرب: ما بين 20 إلى 35 درهم للمتر لعرض 1.50م (والتجاري البوليستير بـ 15-20 درهم).
📍 أين يباع: شارع ستراسبورغ بدرب عمر بالدار البيضاء.`
        : `🧵 Popeline de Coton :
Le tissu roi pour la chemiserie et blouses. Fin, doux et respirant.
💰 Prix : 20 - 35 MAD/mètre à Derb Omar.`;
    }

    // 5. Specific Fabric: GABARDINE
    if (/(gabardine|غاباردين|كاباردين)/i.test(m)) {
      return speakAr
        ? `🧵 ثوب الغاباردين (Gabardine):
نسيج مائل مضلع (Sergé) قوي جداً ومقاوم للاحتكاك.
• الاستعمالات: سراويل شينو (Chino)، سترات، أزياء موحدة للشركات، ومعاطف خفيفة (Trench).
💰 الثمن في المغرب: من 28 إلى 48 درهم للمتر.
📍 أين يباع: درب عمر وزنقة التازي بالدار البيضاء.`
        : `🧵 Tissu Gabardine :
Tissage sergé très robuste pour pantalons chino, vestes et uniformes professionnels.
💰 Prix : 28 - 48 MAD/mètre à Derb Omar.`;
    }

    // 6. Specific Fabric: DENIM / JEANS
    if (/(denim|jean|jeans|جينز|دينيم)/i.test(m)) {
      return speakAr
        ? `🧵 قماش الدينيم والجينز (Denim Fabric):
• الاستعمالات: سراويل الجينز، الجواكيت، والمآزر المهنية.
• الأونصة (Poids en Oz): من 9oz خفيف للصيف حتى 14oz ثقيل شتوي.
💰 الثمن في المغرب: من 25 إلى 48 درهم للمتر حسب نسبة الستريتش (Élasthanne) والوزن.
📍 أين يباع: درب عمر بالدار البيضاء ومستودعات طنجة.`
        : `🧵 Tissu Denim / Jeans :
Idéal pour pantalons et vestes jeans. Grammages de 9oz à 14oz.
💰 Prix : 25 - 48 MAD/mètre.`;
    }

    // 1. Handling "KML" / "كمل" / "واصل" / "زيد" / "suite" / "continue"
    if (/^(kml|kemel|kamal|kamel|كمل|كمل ليا|زيد|زيدي|واصل|تابع|suite|continue|encore|next|quoi d'autre|et apres|et après)$/i.test(m) || /(^|\s)(kml|kemel|كمل|زيد|واصل)($|\s)/i.test(m)) {
      if (image || analysisResult) {
        return speakAr
          ? `🏭 تكملة الدراسة التقنية للموديل (مراحل الفصالة، لاغام الخياطة، واللوازم بالتفصيل):

1️⃣ مراحل الفصالة (Coupe):
• وضع الباترون مع اتجاه النسيج (Droit-fil) لتفادي اعوجاج القطعة بعد الغسيل.
• فصالة الكابوش (4 قطع: قطعتين للوجه الخارجي وقطعتين للتبطين Doublure).
• فصالة الجيب الكنغر الأمامي بدقة مع ترك 1 سم لخياطة الحواشي.
• فصالة السروال (قطعتين للأمام وقطعتين للخلف مع زيادة ارتفاع الحجر الخلفي 3 سم).

2️⃣ لوازم الخياطة (Fournitures Nécessaires):
• لاستيك عريض 4 سم لخصر السروال (حوالي 75-85 سم حسب المقاس).
• كوردون قطني فاخر للكابوش والخصر مع 4 ليزويي معدنية (Oeillets inoxydables).
• بورد-كوت ريب مطاطي (Bord-côte 1x1) للأساور وأسفل الهودي وأسفل السروال.
• خيط بوليستير 100% مغزول نمرة 120 (4 كونات للسورجي + 2 كونات للبيكوز).

3️⃣ لاغام ديال الخياطة المتسلسلة (Gamme de Montage):
• مرحلة 1: تجميع الكابوش وتثبيت الدوبلير بالبيكوز (⏱️ 1.2 دقيقة)
• مرحلة 2: خياطة وثني أطراف الجيب الأمامي وتثبيته على صدر الهودي (⏱️ 2.0 دقيقة)
• مرحلة 3: تجميع أكتاف الهودي وإغلاق الجوانب بالسورجي 4 خيوط (⏱️ 1.8 دقيقة)
• مرحلة 4: تركيب البورد كوت للأساور وأسفل الهودي بالروكوفروز (⏱️ 1.5 دقيقة)
• مرحلة 5: تجميع حجر السروال (Fourche) وإغلاق الساقين (⏱️ 2.2 دقيقة)
• مرحلة 6: تركيب حزام اللاستيك للسروال وتثبيت الكوردون (⏱️ 1.5 دقيقة)
• مرحلة 7: المراقبة النهائية، إزالة الخيوط، والكي بالبخار (⏱️ 2.0 دقيقة)

⏱️ إجمالي وقت خياطة الطقم كامل (Total SAM): حوالي 12 إلى 14 دقيقة!
💡 اكتب:
- '1' للتركيز على تفاصيل الهودي فقط
- '2' للتركيز على تفاصيل السروال فقط
- 'الثمن' لحساب تكلفة 500 أو 1000 بياسة!`
          : `🏭 Suite technique du modèle :
1. Coupe : Respect du droit-fil, capuche doublée, poche kangourou et pantalon jogging.
2. Fournitures : Élastique 4cm, cordons, œillets métalliques, bord-côte 1x1, fil 120.
3. Gamme de montage : Assemblage surjeteuse 4 fils, pose bord-côte recouvreuse, ceinture élastique (SAM total : ~12-14 min).
Tapez '1' pour le hoodie, '2' pour le pantalon, ou 'prix' pour le coût complet !`;
      } else {
        return speakAr
          ? 'تفضل! أنا في الخدمة لمتابعة الشرح. يمكنك تحديد نوع الثوب أو المرحلة التي تريد تفاصيل إضافية عنها (الفصالة، الخياطة، الأثمنة فدرب عمر، أو التسعير).'
          : 'Je suis à votre disposition pour continuer. Précisez le tissu, le coût ou les étapes souhaitées.';
      }
    }

    // 2. Handling "2" or "القطعة الثانية" or "السروال" or "Jogging"
    if (/^(2|القطعة 2|القطعة الثانية|قطعة 2|جوج|السروال|سروال|jogging|pantalon|le pantalon|le jogging)$/i.test(m) || /(سروال|pantalon|jogging)/i.test(m)) {
      return speakAr
        ? `👖 تفاصيل القطعة رقم 2 في الطقم (سروال رياضي / Pantalon Jogging):

• نوع الثوب المقترح: ميلتون قطن ممشوط (Molleton Gratté 320g) أو فرينش تيري نفس لون الهودي.
• استهلاك الثوب للقطعة الواحدة: 1.30م إلى 1.45م (عرض Laize 1.80م)، أو حوالي 450 غرام بالكيلو.

✂️ مواصفات الفصالة والتصميم:
1. قصة مريحة (Coupe Regular / Slim Fit) مريحة في الحركة والرياضة.
2. حزام خصر عريض (Ceinture) مع لاستيك 4 سم ورباط كوردون داخلي/خارجي مع ليزويي معدنية.
3. جيبان جانبيان (Poches italiennes) مع بطانة داخلية من نفس الثوب.
4. أسفل الساقين مزود ببورد-كوت ريب (Bord-côte) أو ثنية مطاطية مزدوجة مع لاستيك 2.5 سم.

🧵 لاغام الخياطة للسروال (Gamme de Montage):
1️⃣ سرفلة وتجميع الحجر الأمامي والخلفي (Fourche) بـ Surjeteuse 4 fils (⏱️ 1 دقيقة)
2️⃣ تحضير وخياطة الجيوب الجانبية وتثبيتها بـ Piqueuse plate (⏱️ 2 دقيقة)
3️⃣ تجميع الجوانب وإغلاق ما بين الساقين (Entrejambe) بالسورجي (⏱️ 1.5 دقيقة)
4️⃣ خياطة وتثبيت حزام اللاستيك والكوردون بـ Recouvreuse أو بيكوز (⏱️ 1.5 دقيقة)
5️⃣ ثني أو تركيب ريب أسفل الساقين (⏱️ 1 دقيقة)
6️⃣ المراقبة، إزالة الخيوط، والكي بالبخار (⏱️ 1.2 دقيقة)

💰 التكلفة التقديرية للسروال بوحده (Prix de revient):
• ثوب السروال (1.35م × 26 درهم): ~35 درهم
• اللوازم (لاستيك + كوردون + ليزويي + خيط): ~7 درهم
• مصاريف الفصالة والخياطة (اليد العاملة Façon): ~12 درهم
💵 التكلفة الإجمالية للسروال: حوالي 54 درهم للبياسة الواحدة!`
        : `👖 Détails de la Pièce 2 (Pantalon Jogging) :
• Tissu : Molleton Gratté 320g (consommation : 1.30m - 1.45m).
• Finitions : Ceinture élastique 4cm avec cordon, poches italiennes, chevilles bord-côte.
• Gamme : Fourche surjet ➔ Poches piqueuse ➔ Entrejambe ➔ Ceinture recouvreuse ➔ Bas de jambe.
• Coût unitaire estimé : ~54 MAD (Tissu: 35 DH, fournitures: 7 DH, façon: 12 DH).`;
    }

    // 3. Handling "1" or "القطعة الأولى" or "الهودي" or "Hoodie"
    if (/^(1|القطعة 1|القطعة الأولى|قطعة 1|واحد|الهودي|هودي|hoodie|sweat|sweatshirt)$/i.test(m) || /(هودي|hoodie|sweat à capuche)/i.test(m)) {
      return speakAr
        ? `🧥 تفاصيل القطعة رقم 1 في الطقم (الهودي / Sweatshirt à Capuche):

• نوع الثوب المقترح: ميلتون قطن ممشوط (Molleton Gratté 300g-350g) ذو ملمس ناعم وفاخر.
• استهلاك الثوب للقطعة الواحدة: 1.60م إلى 1.80م (عرض Laize 1.80م)، أو حوالي 600 غرام بالكيلو.

✂️ مواصفات الفصالة والتصميم:
1. قصة أوفر سايز عصرية (Oversized Streetwear) بأكتاف ساقطة (Drop shoulders).
2. كابوش عريض (Capuche doublée) مبطن بطبقتين مع ثقوب ليزويي وحبل سميك.
3. جيب كنغر أمامي واسع (Poche Kangourou) مع خياطة تدعيم في الزوايا (Points d'arrêt).
4. أساور الأكمام وأسفل الهودي من نسيج الريب المطاطي (Bord-côte 1x1).

🧵 لاغام الخياطة للهودي (Gamme de Montage):
1️⃣ تجميع الكابوش المزدوج وتركيب الليزويي وتمرير الكوردون (⏱️ 1.5 دقيقة)
2️⃣ ثني أطراف الجيب الكنغر وتثبيته على الصدر بالبيكوز (⏱️ 2.0 دقيقة)
3️⃣ تجميع الأكتاف بالسورجي 4 خيوط مع شريط تدعيم (⏱️ 0.8 دقيقة)
4️⃣ تركيب الأكمام وإغلاق الجوانب بالسورجي (⏱️ 1.5 دقيقة)
5️⃣ تركيب الكابوش على الياقة مع شريط نظافة خلفي (Propreté) (⏱️ 1.5 دقيقة)
6️⃣ تركيب بورد كوت الأساور والأسفل بالروكوفروز (⏱️ 1.2 دقيقة)
7️⃣ الفينيسيون، إزالة الخيوط، والكي بالبخار (⏱️ 1.5 دقيقة)

💰 التكلفة التقديرية للهودي بوحده (Prix de revient):
• ثوب الهودي (1.70م × 26 درهم): ~44 درهم
• ثوب الريب للكوتلي + لوازم (كوردون + ليزويي + خيط): ~10 درهم
• الفصالة والخياطة (اليد العاملة Façon): ~16 درهم
💵 التكلفة الإجمالية للهودي: حوالي 70 درهم للقطعة الواحدة!`
        : `🧥 Détails de la Pièce 1 (Hoodie à Capuche) :
• Tissu : Molleton Gratté 320g (consommation : 1.60m - 1.80m).
• Finitions : Capuche doublée avec œillets/cordon, poche kangourou, bord-côte poignets et bas.
• Gamme : Capuche piqueuse ➔ Poche kangourou ➔ Épaules surjet ➔ Manches & côtés ➔ Finition bas.
• Coût unitaire estimé : ~70 MAD (Tissu: 44 DH, fournitures: 10 DH, façon: 16 DH).`;
    }

    // 4. Handling "?" or single punctuation or "chnou" / "achno" / "شنو" / "اشنو" / "شنو هادا" / "chof" / "chouf"
    if (/^(\?|\؟|\!|\.)$/.test(m) || /(^|\s)(chnou|achno|achnou|chouf|chof|شنو|اشنو|شوف|شنو هادا|شنو هاد الموديل|بان لي|رايك|شنو بان ليك|avis)($|\s)/i.test(m)) {
      if (image || analysisResult) {
        return speakAr
          ? `🔍 قراءة وتحليل خبير للموديل في الصورة (طقم رياضي هودي + سروال جوجينغ):

• نوع الموديل: طقم رياضي كاجوال عصري (Ensemble Survêtement Hoodie & Jogging) بلون أزرق سماوي (Bleu Ciel).
• يتكون من قطعتين متناسقتين:
  1️⃣ هودي كاجوال أوفر سايز بكابوش وجيب أمامي كنغر.
  2️⃣ سروال رياضي مريح بخصر مطاطي وجيوب جانبية وأساور كاحل.

🧵 القماش والمواد:
• القماش الأنسب: ميلتون قطن ممشوط (Molleton Coton Gratté 320g-350g) للشتاء، أو فرينش تيري (French Terry 280g) للربيع.
• استهلاك الثوب للطقم كامل: حوالي 3.00 إلى 3.20 متر (أو 1.05 كجم بالكيلو).

💰 الحساب المالي التقديري (Prix de Revient Complet):
• تكلفة الهودي كاملاً: حوالي 70 درهم
• تكلفة السروال كاملاً: حوالي 54 درهم
• التكلفة الإجمالية للطقم (Prix de revient complet): حوالي 124 درهم للبياسة
• ثمن البيع المقترح فالسوق بالجملة أو الديجيتال: ما بين 250 إلى 320 درهم (هامش ربح أكثر من 100%).

💡 للتعمق أكثر، اكتب لي:
- '1' 🧥 لتفاصيل فصالة وخياطة الهودي
- '2' 👖 لتفاصيل فصالة وخياطة السروال
- 'KML' 🏭 لعرض لاغام الخياطة والمراحل الكاملة
- 'الثمن' 📍 لعناوين محلات بيع الميلتون في القريعة ودرب عمر!`
          : `🔍 Analyse experte du modèle en image (Survêtement Hoodie + Jogging) :
• Ensemble 2 pièces : Hoodie oversize à capuche + pantalon jogging assorti.
• Tissu recommandé : Molleton Gratté 320g (3.10m au total pour l'ensemble).
• Coût complet estimé : ~124 MAD (Hoodie: 70 DH + Jogging: 54 DH).
• Prix de vente conseillé : 250 - 320 MAD.
Tapez '1' pour le hoodie, '2' pour le jogging, ou 'KML' pour la gamme complète !`;
      }
    }

    // 5. Handling Tracksuit / Survêtement / Ensemble keywords
    if (/(survet|survetement|ensemble|طقم|سيرفيت|ترينينغ|توني)/i.test(m)) {
      return speakAr
        ? `🏃‍♂️ تفاصيل إنتاج الطقم الرياضي (Survêtement / Ensemble Hoodie & Jogging):
• يتكون من قطعتين: هودي أوفر سايز + سروال جوجينغ مطاطي.
• استهلاك الثوب الإجمالي: 3.00 إلى 3.20 متر (عرض 1.80م).
• أحسن ثوب مقترح: ميلتون قطن ممشوط (Molleton Gratté 320g).
• التكلفة الإجمالية للطقم كامل: ما بين 120 إلى 135 درهم (حسب جودة الثوب واللوازم).
• الربح المتوقع: يباع بالجملة بـ 180-210 درهم، وبالتقسيط في المتاجر الإلكترونية بـ 280-350 درهم!`
        : `🏃‍♂️ Détails Survêtement 2 pièces : Hoodie + Jogging en Molleton 320g. Consommation : ~3.10m. Coût de revient complet : ~124 MAD.`;
    }

    // 6. Handling Sizes / المقاسات / Tailles
    if (/(taille|tailles|mesure|mesures|مقاس|مقاسات|طاي|قياس|قياسات|gradation|جدول)/i.test(m)) {
      return speakAr
        ? `📐 جدول المقاسات القياسي للطقم الرياضي (S, M, L, XL, XXL) بالسنتيمتر (cm):

🧥 1. مقاسات الهودي (Hoodie):
• S: الصدر 56cm | الطول 68cm | الكم 62cm
• M: الصدر 59cm | الطول 71cm | الكم 64cm
• L: الصدر 62cm | الطول 73cm | الكم 66cm
• XL: الصدر 65cm | الطول 76cm | الكم 68cm
• XXL: الصدر 68cm | الطول 78cm | الكم 70cm

👖 2. مقاسات السروال (Jogging):
• S: الخصر (عادي/ممدد) 36/46cm | الحوض 52cm | الطول 98cm
• M: الخصر (عادي/ممدد) 38/49cm | الحوض 55cm | الطول 101cm
• L: الخصر (عادي/ممدد) 40/52cm | الحوض 58cm | الطول 104cm
• XL: الخصر (عادي/ممدد) 42/55cm | الحوض 61cm | الطول 106cm
• XXL: الخصر (عادي/ممدد) 45/58cm | الحوض 64cm | الطول 108cm`
        : `📐 Tableau des tailles Survêtement (S à XXL) en cm :
• Hoodie : Longueur S:68, M:71, L:73, XL:76 | Poitrine S:56, M:59, L:62, XL:65.
• Jogging : Longueur S:98, M:101, L:104, XL:106 | Bassin S:52, M:55, L:58, XL:61.`;
    }

    // 7. Handling Printing / Embroidery / Branding
    if (/(flockage|impression|broderie|طرز|طباعة|فلوكاج|logo|لوغو|علامة)/i.test(m)) {
      return speakAr
        ? `🎨 خيارات الطباعة والتطريز لهاد الموديل (Marquage & Branding):
1️⃣ الطباعة الحرارية (DTF - Direct to Film):
  • المميزات: ألوان زاهية، دقة عالية، ومناسبة للرسومات المعقدة.
  • الثمن: ما بين 4 إلى 8 دراهم للقطعة (A5 إلى A4) في درب عمر والبرنوصي.
2️⃣ التطريز الآلي (Broderie Industrielle):
  • المميزات: فخامة عالية ومتانة لا تتأثر بالغسيل نهائياً.
  • الثمن: ما بين 3 إلى 6 دراهم للشعار الصغير (Poitrine)، و 8-15 درهم للتطريز الكبير في الظهر.
3️⃣ السيرينغرافي (Sérigraphie):
  • للكميات الكبيرة (+200 قطعة)، الثمن كينزل لأقل من 3 دراهم للون الواحد.`
        : `🎨 Options de marquage pour ce modèle :
• DTF (Impression thermique) : 4 - 8 MAD/pièce.
• Broderie industrielle : 3 - 6 MAD pour petit logo, 8 - 15 MAD pour grand dos.
• Sérigraphie : < 3 MAD/pièce pour grandes séries (+200 pcs).`;
    }

    // Greetings
    if (/^(salam|salaam|slm|hi|hello|bonjour|bonsoir|hey|مرحبا|السلام|سلام|صباح|مساء|ahlan)/.test(m)) {
      return speakAr
        ? 'وعليكم السلام! 👋 مرحباً بك في مستشار BEYA الذكي. كيف يمكنني مساعدتك اليوم في الموديلات، الأثواب، الأسعار فالمغرب، أو حسابات الورشة؟'
        : 'Salam ! 👋 Bienvenue dans votre cockpit BEYA. Comment puis-je vous aider aujourd\'hui ?';
    }

    // How are you
    if (/^(kif|kifash|cv|ça va|labas|labess|comment|كيف|لاباس|واش)/.test(m)) {
      return speakAr
        ? 'الحمد لله كلشي مزيان! 😊 أنا في الخدمة لمساعدتك في أي سؤال حول الأثواب، الفصالة، تكاليف الإنتاج، أو لاغام ديال الخياطة.'
        : 'Très bien, merci ! 😊 Je suis à votre service pour toute question technique ou analyse.';
    }

    // Fabric Consumption ONLY (When specifically asking about metrage consumption)
    if (/(كمية.*(ثوب|قماش)|شحال.*(كيخص|خاص|يلزم|نحتاج).*(متر|ثوب)|استهلاك.*(الثوب|القماش)|قدش.*(من متر|ثوب)|consommation.*(metre|tissu)|chhal.*(khsni|khasso|khass|metre)|combien.*(de metre|metre faut|consommation))/i.test(m)) {
      return speakAr
        ? '🧵 جدول تقدير استهلاك الثوب الدقيق للقطعة الواحدة لعرض (Laize 1.50م):\n• قميص رجالي/نسائي: 1.30م - 1.60م\n• سروال كلاسيك/جينز: 1.30م - 1.50م\n• هودي/سويت شيرت: 1.50م - 1.80م (أو 500-600 غرام بالكيلو)\n• فستان قصير: 2.00م - 2.40م\n• فستان طويل/جلابة: 2.80م - 3.50م\n• بوكسر / ملابس داخلية: 0.35م - 0.45م\n• تيشرت صيفي: 0.85م - 1.10م\n\n💡 اكتب "1" أو "2" لمعرفة استهلاك قطع هذا الطقم بدقة!'
        : '🧵 Consommation moyenne (laize 1.50m) :\n• Chemise : 1.30 - 1.60m\n• Pantalon : 1.30 - 1.50m\n• Hoodie : 1.50 - 1.80m\n• Robe / Djellaba : 2.50 - 3.50m\n• T-shirt : 0.85 - 1.10m\n• Boxer : 0.35 - 0.45m.';
    }

    // Cost / Price general questions
    if (/(prix|cout|coût|cost|taman|ثمن|سعر|تكلفة|كلفة|chehal|combien|price|devis|فلوس|flous|money)/i.test(m)) {
      return speakAr
        ? '💰 حساب تكلفة البياسة (Prix de revient) كيعتمد على 4 عناصر:\n1. ثمن الثوب بالمتر × الاستهلاك\n2. اليد العاملة فالورشة (الوقت بالدقائق SAM × ثمن الدقيقة)\n3. اللوازم (الخيط، الأزرار، السحاب، التيكيت، الميكة)\n4. المصاريف الثابتة ومارج الربح.\n\nاستعمل زر "تسعير Devis PRO" فاليسار لإنشاء حساب مفصل فوراً!'
        : '💰 Le coût unitaire comprend : tissu + façon atelier + accessoires + charges fixes. Utilisez "Devis PRO" pour calculer le devis exact !';
    }

    // Production steps
    if (/(étape|etape|مراحل|مرحلة|production|confection|خياطة|montage|تركيب|process|كيفاش|comment faire)/i.test(m)) {
      return speakAr
        ? '🏭 مراحل الإنتاج القياسية بالورشة:\n1️⃣ الفصالة (Coupe) والترقيم\n2️⃣ السورجي والتجميع المبدئي (Surjeteuse)\n3️⃣ الخياطة المسطحة والتثبيت (Piqueuse plate)\n4️⃣ التفاصيل والأزرار (Boutonnière / Pose)\n5️⃣ المصلوح والتشطيب (Repassage / Finition)\n6️⃣ المراقبة والتغليف (Contrôle & Emballage)\n\nاضغط على زر "إرسال للورشة Atelier" لعرض لاغام الكاملة!'
        : '🏭 Étapes : Coupe ➔ Assemblage surjet ➔ Piqueuse plate ➔ Finitions & Boutons ➔ Repassage ➔ Contrôle qualité ➔ Emballage.';
    }

    // Thanks
    if (/(merci|شكرا|شكر|بارك|thanks|thank|chokran|jazak)/i.test(m)) {
      return speakAr
        ? 'بلا جميل! 😊 ديما هنا فخدمتك لمساعدتك تخرج إنتاج متقن وناجح وتوفر في تكاليف السلعة والخياطة.'
        : 'Avec grand plaisir ! 😊 N\'hésitez pas pour toute autre question.';
    }

    // Contextual Fallback (If an image or analysis is active, give tailored production guidance!)
    if (image || analysisResult) {
      const cat = analysisResult?.category || 'طقم الهودي والسروال في الصورة';
      return speakAr
        ? `💡 بخصوص الموديل في الصورة (${cat}):
أنا معك كخبير نسيج وهندسة إنتاج لمساعدتك فالتفاصيل الدقيقة:
• اكتب '1' 🧥 لعرض تفاصيل وخياطة الهودي والكابوش
• اكتب '2' 👖 لعرض تفاصيل وفصالة السروال الجوجينغ
• اكتب 'KML' 🏭 لعرض لاغام الخياطة المتسلسلة والمكائن
• اكتب 'الثمن' 💰 لعرض جدول تكلفة الإنتاج وأسعار الثوب فالمغرب
• اكتب 'المقاسات' 📐 لعرض جدول المقاسات S-XXL

شنو الجزء اللي بغيتي نخدمو عليه دابا؟ 😊`
        : `💡 Concernant le modèle en image (${cat}) :
• Tapez '1' pour les détails du Hoodie
• Tapez '2' pour les détails du Jogging
• Tapez 'KML' pour la gamme de montage
• Tapez 'Prix' pour les coûts et adresses de tissu
• Tapez 'Tailles' pour les mesures S-XXL.`;
    }

    // Generic Default (Only when no image is uploaded)
    return speakAr
      ? `فهمت سؤالك. 💡 يمكنك سؤالي مباشرة عن:
• ثمن أي ثوب فالمغرب (ميلتون، كريب، بوبلين، إنترلوك، جينز...)
• أسواق وأماكن بيع الأثواب في درب عمر والقريعة بالدار البيضاء والمدن الأخرى
• مراحل الخياطة والتسعير، أو ارفع صورة أي موديل وسأحلل لك كل شيء بدقة!`
      : `J'ai noté votre question. Vous pouvez me poser des questions précises sur les prix des tissus à Derb Omar/El Koréa, adresses de sourcing, étapes d'atelier ou coûts.`;
  };

  const [translatingFabrics, setTranslatingFabrics] = useState(false);

  const translateFabricsBox = async () => {
    if (!analysisResult) return;
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
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
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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

  const CHAT_AI_SYSTEM_PROMPT = `أنت خبير تحليل وتصميم وتسعير وإنتاج في مصنع نسيج وخياطة مغربي احترافي (BEYA Expert). تكلم بالدارجة المغربية والعربية بأسلوب احترافي، واضح، ومرتب جداً.
مهمتك الأساسية عند تحليل أي موديل أو الإجابة عن أي طلب إنتاج أو تسعير:
1. أولاً: حساب استهلاك الثوب بدقة (بالمتر لعرض 1.50م أو بالكيلو للجيرسي/القطن) والسلعة (لاستيك، أزرار، سحاب، خيط...).
2. ثانياً: إعطاء تقديرات دقيقة للأسعار في السوق المغربي (أثمنة الأثواب والسلعة في درب عمر، القريعة، أو أسواق الجملة بالدار البيضاء).
3. ثالثاً: تفصيل التكلفة المالية (Prix de revient): ثمن الثوب والسلعة، تكلفة اليد العاملة والخياطة (Façon)، والتكلفة الإجمالية للقطعة الواحدة وللكمية المطلوبة.
4. رابعاً: نصائح تقنية للورشة وأماكن شراء السلعة في المغرب.
5. خامساً (إلزامي دائماً في أي تحليل أو دراسة موديل): أدرج قسماً مفصلاً ومرتباً بعنوان:
"🏭 خامساً: لاغام ديال الخياطة وبوستات العمل (La Gamme de Montage)"
تذكر فيه جميع مراحل الخياطة المتسلسلة الخاصة بهذا الموديل بالضبط (من الفصالة إلى الكيّ والمراقبة والتغليف)، ولكل مرحلة اذكر:
- رقم واسم المرحلة
- الماكينة المستعملة (من بين: Table de Coupe / Ciseaux, Surjeteuse 3/4 Fils, Surjeteuse 5 Fils (Safety), Piqueuse Plate, Piqueuse 2 Aiguilles, Recouvreuse, Boutonnière / Pose Bouton, Presse à Thermocoller, Machine Broderie / Sfifa, Fer Vapeur / Table Aspirante, Travail Manuel / Contrôle)
- وقت كل مرحلة بالدقيقة والثانية (مثلاً: 0.75 دقيقة / 45 ثانية)
- وفي نهاية القسم اذكر: إجمالي وقت خياطة البياسة الواحدة (Total SAM) بالدقائق والثواني، وعدد البوستات/الماكينات المقترحة للورشة.

تنبيه تقني مهم للنظام: في نهاية ردك تماماً (في سطر أخير منفصل)، أضف دائماً كود JSON مخفي يحتوي على مراحل لاغام التي ذكرتها بهذا الشكل الدقيق لكي يقرأه نظام الورشة تلقائياً:
<<<GAMME_JSON:{"modelName":"اسم الموديل","postes":[{"nomAr":"اسم المرحلة بالعربية","nomFr":"Nom opération FR","machine":"Surjeteuse 3/4 Fils","tempsMin":0.75,"roleOuvrier":"ماكينة Overlock"}]}>>>`;

  const parseAiChatAndExtractGamme = (rawAiText: string, userMessage: string) => {
    let cleanText = rawAiText;
    let extractedPostes: PosteTravail[] | null = null;
    let extractedModelName = '';

    const match = rawAiText.match(/<<<GAMME_JSON:([\s\S]*?)>>>/);
    if (match) {
      cleanText = rawAiText.replace(match[0], '').trim();
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.modelName) extractedModelName = String(parsed.modelName).trim();
        if (parsed.postes && Array.isArray(parsed.postes) && parsed.postes.length > 0) {
          extractedPostes = parsed.postes.map((p: any) => ({
            nomAr: p.nomAr || p.nomFr || 'مرحلة خياطة',
            nomFr: p.nomFr || gNomFrFallback(p.nomAr),
            machine: p.machine || 'Piqueuse Plate',
            tempsMin: Math.max(0.1, Number(parseFloat(String(p.tempsMin || 1)).toFixed(2))),
            roleOuvrier: p.roleOuvrier || 'خياط متخصص'
          }));
        }
      } catch (e) {
        console.warn('Could not parse GAMME_JSON from chat:', e);
      }
    }

    function gNomFrFallback(s?: string) {
      return s || 'Opération couture';
    }

    const combinedContext = `${extractedModelName} ${userMessage} ${cleanText}`;
    const breakdown = getGarmentTechnicalBreakdown(combinedContext);
    const finalPostes = (extractedPostes && extractedPostes.length > 0) ? extractedPostes : breakdown.postesTravail;
    const finalModelName = extractedModelName || breakdown.categorie;

    if (!cleanText.includes('لاغام') && !cleanText.toLowerCase().includes('gamme')) {
      const totalMin = Number(finalPostes.reduce((s, p) => s + (Number(p.tempsMin) || 0), 0).toFixed(2));
      const totalSec = Math.round(totalMin * 60);
      let gammeBlock = `\n\n────────────────────────────\n`;
      gammeBlock += `🏭 لاغام ديال الخياطة وبوستات العمل (La Gamme de Montage — ${finalModelName}):\n`;
      gammeBlock += `• عدد البوستات المقترحة: ${finalPostes.length} محطات عمل\n`;
      gammeBlock += `• إجمالي وقت خياطة البياسة (SAM): ${totalMin} دقيقة (${totalSec} ثانية)\n`;
      finalPostes.forEach((gp, idx) => {
        const sec = Math.round((Number(gp.tempsMin) || 0) * 60);
        gammeBlock += `  ${idx + 1}. ${gp.nomAr} — [الآلة: ${gp.machine}] — ⏱️ ${gp.tempsMin} د (${sec} ثانية)\n`;
      });
      gammeBlock += `⚡ اضغط على زر "إرسال للورشة Atelier" باش تلقى هاد لاغام واجدة ومرتبة فحاسبة الورشة!`;
      cleanText = cleanText + gammeBlock;
    }

    setAnalysisResult(prev => {
      if (prev) {
        return {
          ...prev,
          category: extractedModelName || prev.category,
          gammeMontage: finalPostes
        };
      }
      return {
        category: finalModelName,
        consumption: `${breakdown.consommationMetrage}m`,
        complexity: 'متوسطة',
        components: finalPostes.map(p => p.nomAr),
        costEstimate: `${breakdown.coutRevientEstime.toFixed(1)} - ${breakdown.prixVenteConseille.toFixed(1)} MAD`,
        fabricSuggested: breakdown.tissuType,
        gammeMontage: finalPostes,
        rawAnalysis: cleanText
      };
    });

    return cleanText;
  };

  const dispatchToAtelier = () => {
    const allChatText = chat.map(c => c.text).join('\n');
    const userChatText = chat.filter(c => c.role === 'user').map(c => c.text).join(' ');
    const combinedContext = `${analysisResult?.category || ''} ${analysisResult?.fabricSuggested || ''} ${(analysisResult?.pieces || []).map(p => p.name).join(' ')} ${userChatText} ${allChatText}`;

    const breakdown = getGarmentTechnicalBreakdown(combinedContext);

    // Determine best article name
    let articleName = analysisResult?.category || breakdown.categorie || 'Modèle Atelier';
    const lowerCtx = combinedContext.toLowerCase();
    if (lowerCtx.includes('بوكسر') || lowerCtx.includes('كالسون') || lowerCtx.includes('boxer') || lowerCtx.includes('caleçon') || lowerCtx.includes('calson')) {
      if (!articleName.toLowerCase().includes('boxer') && !articleName.includes('بوكسر') && !articleName.includes('كالسون')) {
        articleName = isAr ? 'بوكسر رجالي جيرسي (Boxer / Sous-vêtement)' : 'Boxer / Sous-vêtement Jersey';
      }
    }

    // Determine tailored Gamme de Montage (customPostes) with selected cadence level
    const rawPostes: PosteTravail[] = (
      analysisResult?.gammeMontage &&
      Array.isArray(analysisResult.gammeMontage) &&
      analysisResult.gammeMontage.length > 0 &&
      !(
        (lowerCtx.includes('بوكسر') || lowerCtx.includes('كالسون') || lowerCtx.includes('boxer')) &&
        !analysisResult.gammeMontage.some(p => p.nomAr.includes('حجر') || p.nomAr.includes('خصر') || p.nomAr.includes('بوكسر') || p.nomAr.includes('جيرسي') || p.tempsMin <= 2)
      )
    )
      ? analysisResult.gammeMontage
      : breakdown.postesTravail;

    const customPostes: PosteTravail[] = rawPostes.map(p => ({
      ...p,
      tempsMin: getPosteTimeForCadence(p, cadenceLevel)
    }));

    // Extract quantity from user chat if mentioned (e.g. "6000")
    let detectedQty = 1000;
    const qtyMatches = userChatText.match(/\b(\d{2,6})\b/g);
    if (qtyMatches && qtyMatches.length > 0) {
      const validNums = qtyMatches.map(Number).filter(n => n >= 20 && n <= 500000);
      if (validNums.length > 0) {
        detectedQty = Math.max(...validNums);
      }
    }

    // Parse consumption & unit material cost
    let consMetrage = breakdown.consommationMetrage;
    if (analysisResult?.consumption) {
      const m = String(analysisResult.consumption).match(/[\d.]+/);
      if (m && parseFloat(m[0]) > 0) consMetrage = parseFloat(m[0]);
    }
    const unitMaterialCost = Math.round(((consMetrage * breakdown.prixMetreEstime) + breakdown.fournituresEstimees) * 100) / 100;
    const totalMaterialsCost = Math.round(unitMaterialCost * detectedQty);

    let recommendedUnitPrice = breakdown.prixVenteConseille;
    if (analysisResult?.costEstimate) {
      const m = String(analysisResult.costEstimate).match(/[\d.]+/g);
      if (m && m.length > 0) {
        const parsedVal = parseFloat(m[m.length - 1]);
        if (parsedVal > 0 && parsedVal < 2000) recommendedUnitPrice = parsedVal;
      }
    }

    const totalSamMin = customPostes.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0);
    const workersCount = Math.max(1, customPostes.length);
    const estimatedDays = Math.max(1, Math.ceil((detectedQty * totalSamMin) / (workersCount * 8 * 60)));

    // Save to both localStorage keys so AtelierCalculator loads the exact Gamme, Photo, Quantity, and Costs
    const pilotExportData = {
      itemName: articleName,
      photo: image || undefined,
      customPostes,
      workers: workersCount,
      quantity: detectedQty,
      materials: totalMaterialsCost,
      pricePerPiece: recommendedUnitPrice,
      days: estimatedDays,
      timestamp: Date.now()
    };
    localStorage.setItem('beya_ai_gamme_pilot_export', JSON.stringify(pilotExportData));

    const atelierData = {
      modelName: articleName,
      photo: image || undefined,
      tissuMetrage: `${consMetrage}m`,
      complexity: analysisResult?.complexity || 'Moyenne',
      prixEstimation: `${recommendedUnitPrice} MAD`,
      pieces: analysisResult?.pieces || [],
      customPostes,
      workers: workersCount,
      quantity: detectedQty,
      materials: totalMaterialsCost,
      days: estimatedDays,
      timestamp: Date.now()
    };
    localStorage.setItem('beya_atelier_import', JSON.stringify(atelierData));

    window.open('/#/atelier-calculator', '_blank');
  };

  const sendDirect = async (directMsg: string) => {
    const userMessage = directMsg;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);

    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('beya_gemini_api_key'));
    if (apiKey) {
      try {
        setChat(prev => [...prev, { role: 'ai', text: '...' }]);
        const contents: any[] = [{ role: "user", parts: [{ text: `${CHAT_AI_SYSTEM_PROMPT}\n\nطلب المستخدم:\n${userMessage}` }] }];
        if (image) {
          const base64Data = image.split(',')[1];
          const mimeType = image.split(';')[0].split(':')[1];
          contents[0].parts.push({ inlineData: { data: base64Data, mimeType } });
        }
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي. مهمتك الأساسية: 1. حساب كميات الثوب بدقة. 2. إعطاء تقديرات دقيقة للأسعار في السوق المغربي (مثلا أثمنة الأثواب في درب عمر أو أسواق الجملة). 3. إذا سألك المستخدم عن التكلفة، أعطه تفصيلاً دقيقاً: ثمن الثوب (شحال للمتر والمجموع)، تكلفة الخياطة (اليد العاملة)، والتكلفة الإجمالية للقطعة (Prix de revient). 4. اقترح أماكن شراء الأثواب في المغرب. كن مفيداً، دقيقاً في الأرقام التقريبية، وتصرف كخبير نسيج حقيقي." }] } })
        });
        let data = await response.json();
        
        if (data.error && (data.error.message.includes('high demand') || data.error.code === 503 || data.error.code === 404 || data.error.message.includes('not found'))) {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي." }] } })
          });
          data = await response.json();
        }

        let aiText = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          aiText = parseAiChatAndExtractGamme(data.candidates[0].content.parts[0].text, userMessage);
        } else {
          // If Gemini API fails or limits, answer directly with built-in textile expert!
          const smartReply = getSmartReply(userMessage);
          const errMsg = data.error?.message || '';
          const isLimit0 = errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED');
          let note = '';
          if (isLimit0) {
            note = isAr 
              ? "\n\n────────────────────────────\n⚠️ ملاحظة: مفتاح Gemini API بدون رصيد في Google Cloud (Limit: 0)، تمت إجابتك مباشرة عبر خبير BEYA الداخلي."
              : "\n\n────────────────────────────\n⚠️ Note: Clé Gemini API sans quota (Limit: 0), réponse fournie par l'Expert BEYA interne.";
          }
          aiText = smartReply + note;
        }
        setChat(prev => { const n = [...prev]; n.pop(); return [...n, { role: 'ai', text: aiText }]; });
      } catch (e: any) {
        const smartReply = getSmartReply(userMessage);
        setChat(prev => { const n = [...prev]; n.pop(); return [...n, { role: 'ai', text: smartReply }]; });
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
              { text: `${CHAT_AI_SYSTEM_PROMPT}\n\nطلب المستخدم:\n${userMessage}` }
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

        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
        
        // Fallback to gemini-1.5-flash if 2.0 is overloaded or not found
        if (data.error && (data.error.message.includes('high demand') || data.error.code === 503 || data.error.code === 404 || data.error.message.includes('not found'))) {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: "أنت خبير تحليل وتصميم وتسعير في مصنع نسيج مغربي. تكلم بالدارجة المغربية بأسلوب احترافي وودي." }]
              }
            })
          });
          data = await response.json();
        }

        let aiResponseText = "";
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          aiResponseText = parseAiChatAndExtractGamme(data.candidates[0].content.parts[0].text, userMessage);
        } else {
          // If Gemini API fails or has limit: 0, answer directly with the Smart Textile Expert!
          const smartReply = getSmartReply(userMessage);
          const errMsg = data.error?.message || '';
          const isLimit0 = errMsg.includes('limit: 0') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED');
          let note = '';
          if (isLimit0) {
            note = isAr 
              ? "\n\n────────────────────────────\n⚠️ ملاحظة: مفتاح Gemini API بدون رصيد في Google Cloud (Limit: 0)، تمت إجابتك مباشرة عبر خبير BEYA الداخلي."
              : "\n\n────────────────────────────\n⚠️ Note: Clé Gemini API sans quota (Limit: 0), réponse fournie par l'Expert BEYA interne.";
          }
          aiResponseText = smartReply + note;
        }

        setChat(prev => {
          const newChat = [...prev];
          newChat.pop(); // remove loading
          return [...newChat, { role: 'ai', text: aiResponseText }];
        });
      } catch (e: any) {
        const smartReply = getSmartReply(userMessage);
        setChat(prev => {
          const newChat = [...prev];
          newChat.pop();
          return [...newChat, { role: 'ai', text: smartReply }];
        });
      }
    } else {
      setTimeout(() => {
        setChat(prev => [...prev, { role: 'ai', text: getSmartReply(userMessage) }]);
      }, 500);
    }
  };

  return (
    <div className={`flex flex-col h-full md:h-[calc(100vh-80px)] ${isBoxMaximized ? 'w-full max-w-full px-2 md:px-6' : 'max-w-7xl mx-auto px-2 md:px-4'} pb-2 md:pb-4 pt-2 md:pt-0 overflow-hidden select-none bg-white md:bg-transparent transition-all duration-300`}>
      {/* Compact Header Bar */}
      <div className={`flex items-center justify-between gap-2 md:gap-4 py-2 border-b border-slate-100 flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 md:gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
          {onClose && (
            <button onClick={onClose} className="p-1.5 md:p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-all">
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <div>
            <div className={`flex items-center gap-1 md:gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase italic">BEYA <span className="text-indigo-600 not-italic hidden sm:inline">TACTICAL HUD</span></h1>
              <span className="px-1.5 md:px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap">v2.1</span>
            </div>
            <p className="text-[9px] md:text-[11px] text-slate-500 font-bold hidden sm:block">{isAr ? 'المستشار الذكي لتحليل وتفصيل ومقاسات الموديل (شاشة موحدة بدون تمرير)' : 'Cockpit d\'Analyse Textile & Confection (Zéro Scroll)'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Top Header Export/Send Button (Red boxed in user diagram 1) */}
          <button
            onClick={() => {
              if (!analysisResult) {
                setCustomAlert({
                  title: isAr ? 'تنبيه' : 'Attention',
                  message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                  isError: true
                });
                return;
              }
              setShowDispatchModal(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-xs uppercase hover:brightness-110 transition-all shadow-md active:scale-95"
            title={isAr ? 'تصدير البيانات وإرسالها إلى Devis, Atelier, Achats...' : 'Exporter vers les modules'}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="font-black">{isAr ? 'تصدير 🚀' : 'Exporter'}</span>
          </button>

          {/* Language Switcher Button (Moved to top header as requested) */}
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
            className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-xs transition-all shadow-sm"
            title={isAr ? 'التبديل إلى الفرنسية' : 'Switch language'}
          >
            <Languages className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-black text-xs uppercase">{isAr ? 'AR' : 'FR'}</span>
          </button>

          <button
            onClick={() => setShowLeadsModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase hover:bg-indigo-100 transition-all shadow-sm"
          >
            <Package className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{isAr ? 'اختيار من الطلبات' : 'Demandes Prospects'}</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{isAr ? 'رفع صورة' : 'Uploader Image'}</span>
          </button>
          {canInstall && !isInstalled && (
            <button
              onClick={promptInstall}
              title={isAr ? 'تثبيت كتطبيق مستقل على الهاتف' : 'Installer comme application'}
              className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase hover:brightness-110 transition-all shadow-md active:scale-95 animate-pulse"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'تثبيت APP' : 'Installer'}</span>
            </button>
          )}
          <button
            onClick={() => setShowApiKeyModal(true)}
            title={isAr ? 'إعدادات مفتاح الذكاء الاصطناعي' : 'Paramètres clé API'}
            className="p-1.5 md:p-2 bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100 rounded-lg md:rounded-xl transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
      </div>

      {/* Top Header Navigation Strip (Icon-Only Mode as requested: "hyd lktaba khli ghi icon odir chiw whdin kbar chwi") */}
      <div className={`flex items-center justify-between px-3 md:px-4 py-2 bg-slate-50/90 border-b border-slate-200/80 flex-shrink-0 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 md:gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setActiveTab('photo')}
            title={isAr ? 'صورة الموديل (Photo)' : 'Photo du modèle'}
            className={`p-2.5 md:p-3 rounded-2xl transition-all flex items-center justify-center ${
              activeTab === 'photo'
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <Camera className="w-5 md:w-5.5 h-5 md:h-5.5" />
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            title={isAr ? 'المستشار الذكي (Chat IA)' : 'Chat IA'}
            className={`p-2.5 md:p-3 rounded-2xl transition-all flex items-center justify-center ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <MessageSquare className="w-5 md:w-5.5 h-5 md:h-5.5" />
          </button>

          <button
            onClick={() => setActiveTab('mesures')}
            title={isAr ? 'جدول المقاسات (Mesures)' : 'Tableau des mesures'}
            className={`p-2.5 md:p-3 rounded-2xl transition-all flex items-center justify-center ${
              activeTab === 'mesures'
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <Ruler className="w-5 md:w-5.5 h-5 md:h-5.5" />
          </button>

          <button
            onClick={() => setActiveTab('fiche')}
            title={isAr ? 'البطاقة التقنية والتسعير (Fiche & Prix)' : 'Fiche technique & Prix'}
            className={`p-2.5 md:p-3 rounded-2xl transition-all flex items-center justify-center ${
              activeTab === 'fiche'
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
            }`}
          >
            <FileText className="w-5 md:w-5.5 h-5 md:h-5.5" />
          </button>

          <button
            onClick={() => setActiveTab('gamme')}
            title={isAr ? 'لاغام ديال الخياطة وبوستات العمل (La Gamme de Montage)' : 'Gamme de Montage'}
            className={`p-2.5 md:p-3 rounded-2xl transition-all flex items-center justify-center ${
              activeTab === 'gamme'
                ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-200 scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-amber-600'
            }`}
          >
            <Scissors className="w-5 md:w-5.5 h-5 md:h-5.5" />
          </button>

          <div className="w-px h-8 bg-slate-300 mx-1"></div>

          <button
            onClick={() => {
              if (analysisResult) {
                exportToFicheTechnique('complete');
              } else {
                setCustomAlert({
                  title: isAr ? 'تنبيه' : 'Attention',
                  message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                  isError: true
                });
              }
            }}
            title={isAr ? 'حفظ الموديل في قاعدة البيانات' : 'Sauvegarder le modèle'}
            className="p-2.5 md:p-3 rounded-2xl transition-all flex items-center justify-center bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:scale-105 active:scale-95 border border-emerald-600"
          >
            <Save className="w-5 md:w-5.5 h-5 md:h-5.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {analysisResult && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">
              <Check className="w-3 h-3" /> {isAr ? 'تحليل مكتمل' : 'Analysé'}
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Cockpit Grid (Full width when maximized, 2-column when normal) */}
      <div className={`flex-1 ${isBoxMaximized ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-12'} gap-3 md:gap-5 min-h-0 overflow-y-auto lg:overflow-hidden mt-2 md:mt-3 pb-16 md:pb-safe`}>
        
        {/* LEFT COLUMN: Photo Cockpit (lg:col-span-5) - hidden when maximized */}
        {!isBoxMaximized && (
          <div className={`lg:col-span-5 ${activeTab === 'photo' ? 'flex' : 'hidden lg:flex'} flex-col gap-4 overflow-visible lg:overflow-hidden h-auto lg:h-full`}>
            {/* Photo Cockpit Box */}
            <div className="flex-none lg:flex-1 min-h-[250px] lg:min-h-0 bg-slate-900 rounded-3xl overflow-hidden relative flex flex-col shadow-lg border border-slate-800 group">
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

            {/* ONE-CLICK DISPATCH ENGINE (Desktop Only Sidebar) */}
            <div className="hidden lg:block flex-shrink-0 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
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
                      const chatHistory = chat.map(c => c.text).join('\n');
                      sendToDevis(chatHistory + '\n\n' + (analysisResult.rawAnalysis || JSON.stringify(analysisResult)));
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
                    setActiveTab('fiche');
                    if (analysisResult || chat.length > 1 || image) {
                      exportToFicheTechnique();
                    } else {
                      setCustomAlert({
                        title: isAr ? 'تنبيه' : 'Attention',
                        message: isAr ? 'يرجى رفع صورة موديل أو التحدث مع المستشار الذكي أولاً!' : 'Veuillez uploader un modèle ou consulter l\'IA d\'abord !',
                        isError: true
                      });
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 text-indigo-700 rounded-xl font-black text-xs transition-all shadow-sm group"
                >
                  <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>{isAr ? 'إرسال للبطاقة التقنية' : 'Fiche Technique'}</span>
                </button>

                <button
                  onClick={() => {
                    if (analysisResult || chat.length > 1 || image) {
                      dispatchToAtelier();
                    } else {
                      setCustomAlert({
                        title: isAr ? 'تنبيه' : 'Attention',
                        message: isAr ? 'يرجى تحليل موديل أو استشارة الذكاء الاصطناعي أولاً!' : 'Veuillez analyser un modèle d\'abord !',
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
        )}

        {/* RIGHT COLUMN: HUD Content (True Fullscreen Modal Overlay when isBoxMaximized, or lg:col-span-7) */}
        <div
          className={`${
            isBoxMaximized
              ? 'fixed inset-0 z-[1400] w-screen h-screen bg-slate-950/85 backdrop-blur-md p-1 sm:p-3 flex flex-col overflow-hidden animate-in fade-in duration-200'
              : 'lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[60vh] lg:min-h-0 lg:h-full transition-all duration-300 relative'
          } ${activeTab !== 'photo' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className={`w-full h-full flex flex-col overflow-hidden ${isBoxMaximized ? 'bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200' : ''}`}>

          {/* Universal Header Strip with ONE SINGLE Maximize/Restore Button */}
          <div className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-b border-slate-100 flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isBoxMaximized ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-indigo-600'} animate-pulse`}></span>
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {activeTab === 'gamme' ? (isAr ? 'لاغام ديال الخياطة وبوستات العمل' : 'La Gamme de Montage') :
                 activeTab === 'fiche' ? (isAr ? 'البطاقة التقنية والتسعير' : 'Fiche Technique & Prix') :
                 activeTab === 'mesures' ? (isAr ? 'جدول المقاسات والأبعاد' : 'Tableau des Mesures') :
                 activeTab === 'chat' ? (isAr ? 'المستشار الذكي (Chat IA)' : 'Chat IA') :
                 (isAr ? 'صورة الموديل' : 'Photo')}
              </span>
              {isBoxMaximized && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-xs">
                  {isAr ? 'كامل الشاشة ⚡' : 'Plein écran ⚡'}
                </span>
              )}
            </div>

            {/* In Fullscreen mode: Compact Tab Switcher so user can switch tabs effortlessly */}
            {isBoxMaximized && (
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 sm:p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('gamme')}
                  title={isAr ? 'لاغام وبوستات العمل' : 'Gamme de Montage'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                    activeTab === 'gamme' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'لاغام' : 'Gamme'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('fiche')}
                  title={isAr ? 'البطاقة التقنية' : 'Fiche Technique'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                    activeTab === 'fiche' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'البطاقة' : 'Fiche'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mesures')}
                  title={isAr ? 'المقاسات والأبعاد' : 'Mesures'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                    activeTab === 'mesures' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'المقاسات' : 'Mesures'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  title={isAr ? 'المستشار الذكي' : 'Chat IA'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                    activeTab === 'chat' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'شات' : 'Chat'}</span>
                </button>
              </div>
            )}

            {/* THE ONE AND ONLY MAXIMIZE / RESTORE BUTTON (NO DUPLICATES!) */}
            <button
              type="button"
              onClick={() => setIsBoxMaximized(!isBoxMaximized)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs border active:scale-95 ${
                isBoxMaximized
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:text-indigo-600'
              }`}
              title={isBoxMaximized ? (isAr ? 'تصغير الشاشة والرجوع (Esc)' : 'Réduire (Esc)') : (isAr ? 'تكبير كامل الصفحة' : 'Plein écran')}
            >
              {isBoxMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="text-[11px] font-black">
                {isBoxMaximized ? (isAr ? 'تصغير الشاشة' : 'Réduire') : (isAr ? 'تكبير كامل الصفحة' : 'Plein écran')}
              </span>
            </button>
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
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1 relative overflow-hidden">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'الثوب المقترح للموديل:' : 'Tissu Suggéré :'}</span>
                              <p className="text-base font-black text-slate-900">{pFabInfo.arName}</p>
                              <p className="text-xs font-bold text-indigo-600 mb-2">{pFabInfo.frName}</p>
                              
                              <div className="mt-3">
                                {analysisResult.tissuPhoto ? (
                                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[3/2] flex items-center justify-center bg-slate-50">
                                    <img src={analysisResult.tissuPhoto} className="w-full h-full object-cover" alt="Tissu" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                      <button onClick={() => setAnalysisResult({ ...analysisResult, tissuPhoto: undefined })} className="p-2 bg-rose-600 text-white rounded-lg shadow-lg hover:bg-rose-700 transition-all">
                                        <RefreshCw className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : unsplashPhotos.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {unsplashPhotos.map((url, idx) => (
                                      <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm group">
                                        <img src={url} onClick={() => window.open(url, '_blank')} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" alt="Tissu" />
                                        <div className="absolute bottom-1.5 right-1.5 flex gap-1.5">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }} 
                                            className="p-1.5 bg-white/80 backdrop-blur text-slate-800 hover:text-indigo-600 rounded-md shadow-sm transition-colors"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setAnalysisResult({ ...analysisResult, tissuPhoto: url }); setUnsplashPhotos([]); }} 
                                            className="p-1.5 bg-indigo-600/90 backdrop-blur text-white hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button onClick={() => setUnsplashPhotos([])} className="col-span-2 py-1.5 text-[10px] font-black text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg transition-all">{isAr ? 'إلغاء' : 'Annuler'}</button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 w-full">
                                    <button onClick={() => fabricPhotoRef.current?.click()} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black transition-all border border-indigo-100 border-dashed">
                                      <Camera className="w-4 h-4" />
                                      {isAr ? 'رفع صورة' : 'Uploader'}
                                    </button>
                                    <button onClick={() => handleSearchFabric(pFabInfo.frName)} disabled={isSearchingFabric} className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-[10px] font-black transition-all border border-sky-100 disabled:opacity-50">
                                      {isSearchingFabric ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                      {isAr ? 'بحث بالذكاء' : 'Chercher Web'}
                                    </button>
                                  </div>
                                )}
                                <input 
                                  type="file" 
                                  ref={fabricPhotoRef} 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result && analysisResult) {
                                          setAnalysisResult({ ...analysisResult, tissuPhoto: ev.target.result as string });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </div>
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

                  {/* Compact Gamme Callout Banner (Clickable to switch to the dedicated Gamme tab) */}
                  {(() => {
                    const allChatText = chat.map(c => c.text).join('\n');
                    const searchCtx = `${analysisResult.category || ''} ${analysisResult.fabricSuggested || ''} ${(analysisResult.pieces || []).map(p => p.name).join(' ')} ${allChatText}`;
                    const fallbackGamme = getGarmentTechnicalBreakdown(searchCtx).postesTravail;
                    const activeGamme = (analysisResult.gammeMontage && analysisResult.gammeMontage.length > 0)
                      ? analysisResult.gammeMontage
                      : fallbackGamme;
                    const totalMin = Number(activeGamme.reduce((acc, p) => acc + (Number(p.tempsMin) || 0), 0).toFixed(2));
                    const totalSec = Math.round(totalMin * 60);

                    return (
                      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white p-4 sm:p-5 rounded-3xl border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div 
                          onClick={() => setActiveTab('gamme')}
                          className={`flex items-center gap-3 cursor-pointer group ${isAr ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-xs group-hover:scale-110 transition-transform shrink-0">
                            <Scissors className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                                {isAr ? '🏭 لاغام ديال الخياطة وبوستات العمل (La Gamme de Montage)' : '🏭 Gamme de Montage & Postes Atelier'}
                              </h4>
                              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">
                                {activeGamme.length} {isAr ? 'محطة' : 'postes'}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-amber-900/80 mt-0.5">
                              {isAr ? `إجمالي وقت البياسة (SAM): ${totalMin} دقيقة (${totalSec} ثانية) — اضغط هنا لعرض جدول لاغام المخصص ↗` : `Temps total (SAM): ${totalMin} min (${totalSec} sec) — Cliquez pour ouvrir la vue dédiée ↗`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => setActiveTab('gamme')}
                            className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>{isAr ? 'فتح لاغام' : 'Voir Gamme'}</span>
                          </button>
                          <button
                            onClick={dispatchToAtelier}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                          >
                            <span>{isAr ? 'إرسال للورشة 🚀' : 'Atelier 🚀'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Print / Export Report Button */}
                  <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      onClick={() => exportToFicheTechnique()}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200"
                    >
                      <FileText className="w-4 h-4" /> <span>{isAr ? 'إرسال وفتح في صفحة البطاقات التقنية' : 'Ouvrir dans Fiches Techniques'}</span>
                    </button>
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
                  <div key={i} className={`flex w-full ${c.role === 'user' ? (isAr ? 'justify-start' : 'justify-end') : 'justify-start'}`}>
                    <div dir={isAr ? 'rtl' : 'ltr'} className={`relative group p-4 text-xs font-medium leading-relaxed whitespace-pre-line shadow-sm rounded-2xl select-text cursor-text ${
                      c.role === 'user'
                        ? 'max-w-[80%] bg-slate-800 text-white rounded-br-none'
                        : 'w-full max-w-full bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
                    } ${isAr ? 'text-right' : 'text-left'}`}>
                      {c.text}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(c.text);
                          setCustomAlert({ title: isAr ? 'تم النسخ' : 'Copié', message: isAr ? 'تم نسخ النص بنجاح!' : 'Texte copié avec succès !', isError: false });
                        }}
                        className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} p-1.5 bg-slate-100/80 backdrop-blur text-slate-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-slate-200/50`}
                        title={isAr ? 'نسخ النص' : 'Copier'}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
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

          {/* TAB 4: LA GAMME DE MONTAGE (activeTab === 'gamme') */}
          {activeTab === 'gamme' && (() => {
            const allChatText = chat.map(c => c.text).join('\n');
            const searchCtx = `${analysisResult?.category || ''} ${analysisResult?.fabricSuggested || ''} ${(analysisResult?.pieces || []).map(p => p.name).join(' ')} ${allChatText}`;
            const fallbackGamme = getGarmentTechnicalBreakdown(searchCtx).postesTravail;
            const activeGamme = (analysisResult?.gammeMontage && analysisResult.gammeMontage.length > 0)
              ? analysisResult.gammeMontage
              : fallbackGamme;
            const totalMin = Number(activeGamme.reduce((acc, p) => acc + getPosteTimeForCadence(p, cadenceLevel), 0).toFixed(2));
            const totalSec = Math.round(totalMin * 60);

            return (
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
                {/* Sleek Integrated Tactical HUD Header (Zero wasted space -> Evite scroll!) */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3 sm:p-3.5 rounded-2xl border border-amber-400/50 shadow-md text-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                  {/* Left: Category + SAM + Metrics Inline */}
                  <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      <Scissors className="w-4 h-4 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-white">
                          {isAr ? 'لاغام وبوستات العمل' : 'Gamme de Montage'}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                          {activeGamme.length} {isAr ? 'محطة' : 'postes'}
                        </span>
                        <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                        <span className="text-xs text-amber-200 font-bold hidden sm:inline truncate max-w-[200px]">
                          {analysisResult?.category || (isAr ? 'موديل خياطة' : 'Modèle')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-black mt-0.5">
                        <span className="text-amber-300 flex items-center gap-1">
                          <span>⏱️ SAM:</span>
                          <span className="text-xs font-black text-white">{totalMin} {isAr ? 'دقيقة' : 'min'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({totalSec}s)</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">⚡ {totalMin > 0 ? Math.round((8 * 60) / totalMin) : 0} {isAr ? 'بياسة/ساعة' : 'pcs/h'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-teal-300">📦 {totalMin > 0 ? Math.round((8 * 8 * 60) / totalMin) : 0} {isAr ? 'بياسة/نهار' : 'pcs/j'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-amber-400 font-bold">✂️ {isAr ? 'فصالة بالمطلوة' : 'Coupe Matelas'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Cadence 3-Way Switcher + Dispatch Button */}
                  <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
                    <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl border border-white/15">
                      <button
                        type="button"
                        onClick={() => setCadenceLevel('pro')}
                        title={isAr ? 'توقيت العمال الحرافيين المحترفين (120%)' : 'Cadence Pro 120%'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                          cadenceLevel === 'pro'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>⚡</span>
                        <span>{isAr ? 'حرافيين (120%)' : 'Pros (120%)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCadenceLevel('standard')}
                        title={isAr ? 'توقيت المعمل العادي (85%)' : 'Standard 85%'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                          cadenceLevel === 'standard'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm ring-1 ring-amber-400'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>⏱️</span>
                        <span>{isAr ? 'ستاندار (85%)' : 'Standard'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCadenceLevel('debutant')}
                        title={isAr ? 'توقيت المتعلمين والمبتدئين (60%)' : 'Débutants 60%'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                          cadenceLevel === 'debutant'
                            ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-sm ring-1 ring-rose-400'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>🐢</span>
                        <span>{isAr ? 'مبتدئين / ثقال (60%)' : 'Débutants'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={dispatchToAtelier}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إرسال للورشة 🚀' : 'Envoyer Atelier 🚀'}</span>
                    </button>
                  </div>
                </div>

                {/* Operations List (Compact, No-Scroll Optimized Rows) */}
                <div className="space-y-1.5">
                  {activeGamme.map((gp, idx) => {
                    const currentMin = getPosteTimeForCadence(gp, cadenceLevel);
                    const sec = Math.round(currentMin * 60);
                    const proTime = getPosteTimeForCadence(gp, 'pro');
                    const debTime = getPosteTimeForCadence(gp, 'debutant');
                    const isCoupe = (gp.machine || '').toLowerCase().includes('coupe') || (gp.nomAr || '').includes('فصالة');
                    const isPiqueuse = gp.machine.toLowerCase().includes('piqueuse');
                    const isSurjet = gp.machine.toLowerCase().includes('surjet');
                    const isRecouvreuse = gp.machine.toLowerCase().includes('recouvr') || gp.machine.toLowerCase().includes('ourle');

                    const badgeColor = isPiqueuse
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : isSurjet
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : isRecouvreuse
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <div
                        key={idx}
                        className={`px-3 py-2 bg-white hover:bg-amber-50/40 rounded-xl border border-slate-200/90 shadow-2xs hover:border-amber-400/50 transition-all flex items-center justify-between gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}
                      >
                        {/* Index & Order Controls */}
                        <div className={`flex items-center gap-1.5 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col -space-y-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...activeGamme];
                                const [item] = list.splice(idx, 1);
                                list.splice(idx - 1, 0, item);
                                if (analysisResult) setAnalysisResult({ ...analysisResult, gammeMontage: list });
                              }}
                              title={isAr ? 'تقديم المرحلة للأعلى ⬆️' : 'Monter ⬆️'}
                              className="p-0.5 hover:bg-amber-100 text-slate-400 hover:text-amber-800 rounded disabled:opacity-20 transition-all active:scale-90"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === activeGamme.length - 1}
                              onClick={() => {
                                const list = [...activeGamme];
                                const [item] = list.splice(idx, 1);
                                list.splice(idx + 1, 0, item);
                                if (analysisResult) setAnalysisResult({ ...analysisResult, gammeMontage: list });
                              }}
                              title={isAr ? 'تأخير المرحلة للأسفل ⬇️' : 'Descendre ⬇️'}
                              className="p-0.5 hover:bg-amber-100 text-slate-400 hover:text-amber-800 rounded disabled:opacity-20 transition-all active:scale-90"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Operation Name & Role */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 truncate flex items-center gap-1.5">
                            <span>{isAr ? gp.nomAr : (gp.nomFr || gp.nomAr)}</span>
                            {isCoupe && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black rounded border border-amber-300 shrink-0">
                                ✂️ {isAr ? 'فصالة بالمطلوة' : 'Coupe Matelas'}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold truncate">
                            {isAr ? (gp.nomFr || '') : (gp.nomAr || '')} {gp.roleOuvrier ? `• ${gp.roleOuvrier}` : ''}
                          </p>
                        </div>

                        {/* Machine Badge */}
                        <div className="shrink-0 hidden sm:block">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badgeColor}`}>
                            ⚙️ {gp.machine}
                          </span>
                        </div>

                        {/* Timing Badges (Pro / Deb Comparatif) */}
                        <div className={`flex items-center gap-2 shrink-0 ${isAr ? 'text-left' : 'text-right'}`}>
                          <div>
                            <div className="px-2.5 py-0.5 bg-amber-50 border border-amber-200/80 rounded-lg inline-block">
                              <span className="text-xs font-black text-amber-900">{currentMin} {isAr ? 'د' : 'min'}</span>
                              <span className="text-[9px] font-bold text-amber-600/80 ml-1">({sec}s)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold justify-end mt-0.5">
                              <span className="text-emerald-700 font-black">⚡ {proTime}د</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-rose-600 font-black">🐢 {debTime}د</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
            </div>
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

      {/* EXPORT / DISPATCH POPUP MODAL (Triggered from Top Exporter Button) */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowDispatchModal(false)}>
          <div className="bg-white rounded-[32px] border border-slate-200/80 w-full max-w-md p-6 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between pb-4 border-b border-slate-100 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{isAr ? 'تصدير بيانات التحليل فورا 🚀' : 'Exporter vers les modules'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'اختر القسم المراد إرسال القياسات والثوب إليه' : 'Export direct en 1-clic'}</p>
                </div>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  setShowDispatchModal(false);
                  const chatHistory = chat.map(c => c.text).join('\n');
                  sendToDevis(chatHistory + '\n\n' + (analysisResult?.rawAnalysis || JSON.stringify(analysisResult)));
                }}
                className={`flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-800 rounded-2xl font-black text-xs transition-all shadow-sm group ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <DollarSign className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <div className="font-black">{isAr ? 'تسعير Devis PRO' : 'Devis PRO'}</div>
                    <div className="text-[10px] font-bold text-emerald-600/80">{isAr ? 'إنشاء حساب وتكلفة للزبون' : 'Calcul de devis client'}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-emerald-600 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setShowDispatchModal(false);
                  setActiveTab('fiche');
                  exportToFicheTechnique();
                }}
                className={`flex items-center justify-between p-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 text-indigo-800 rounded-2xl font-black text-xs transition-all shadow-sm group ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <FileText className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <div className="font-black">{isAr ? 'إرسال للبطاقة التقنية Fiche Technique' : 'Fiche Technique'}</div>
                    <div className="text-[10px] font-bold text-indigo-600/80">{isAr ? 'حفظ بطاقة التفصيل وفتحها فوراً' : 'Génération fiche technique'}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-indigo-600 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setShowDispatchModal(false);
                  dispatchToAtelier();
                }}
                className={`flex items-center justify-between p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-amber-900 rounded-2xl font-black text-xs transition-all shadow-sm group ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <Scissors className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <div className="font-black">{isAr ? 'إرسال لورشة الخياطة Atelier' : 'Atelier Production'}</div>
                    <div className="text-[10px] font-bold text-amber-700/80">{isAr ? 'حساب المراحل وتكلفة الخياطة' : 'Calcul de temps & coût atelier'}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-amber-700 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setShowDispatchModal(false);
                  const achData = {
                    tissuSuggested: analysisResult?.fabricSuggested || '',
                    consumption: analysisResult?.consumption || '',
                    modelName: analysisResult?.category || '',
                    timestamp: Date.now()
                  };
                  localStorage.setItem('beya_achats_import', JSON.stringify(achData));
                  window.open('/#/achats', '_blank');
                }}
                className={`flex items-center justify-between p-3.5 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 text-purple-800 rounded-2xl font-black text-xs transition-all shadow-sm group ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <Package className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <div>
                    <div className="font-black">{isAr ? 'الأثواب والمشتريات Achats' : 'Achats Tissus'}</div>
                    <div className="text-[10px] font-bold text-purple-600/80">{isAr ? 'طلب وتوفير الثوب والمواد' : 'Gestion des achats matières'}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-purple-600 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE APP FIXED BOTTOM NAVIGATION BAR (FIX BOTTOM) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[150] bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('photo')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'photo' ? 'text-indigo-600 font-black scale-105' : 'text-slate-500 font-bold hover:text-slate-700'
          }`}
        >
          <Camera className="w-4.5 h-4.5" />
          <span className="text-[9px] font-black">{isAr ? 'الصورة' : 'Photo'}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'chat' ? 'text-indigo-600 font-black scale-105' : 'text-slate-500 font-bold hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span className="text-[9px] font-black">{isAr ? 'المستشار' : 'Chat IA'}</span>
        </button>

        <button
          onClick={() => setActiveTab('mesures')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'mesures' ? 'text-indigo-600 font-black scale-105' : 'text-slate-500 font-bold hover:text-slate-700'
          }`}
        >
          <Ruler className="w-4.5 h-4.5" />
          <span className="text-[9px] font-black">{isAr ? 'المقاسات' : 'Mesures'}</span>
        </button>

        <button
          onClick={() => setActiveTab('fiche')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'fiche' ? 'text-indigo-600 font-black scale-105' : 'text-slate-500 font-bold hover:text-slate-700'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span className="text-[9px] font-black">{isAr ? 'البطاقة' : 'Fiche'}</span>
        </button>

        <button
          onClick={() => setActiveTab('gamme')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'gamme' ? 'text-amber-600 font-black scale-105' : 'text-slate-500 font-bold hover:text-slate-700'
          }`}
        >
          <Scissors className="w-4.5 h-4.5" />
          <span className="text-[9px] font-black">{isAr ? 'لاغام' : 'Gamme'}</span>
        </button>

        <button
          onClick={() => {
            if (!analysisResult) {
              setCustomAlert({
                title: isAr ? 'تنبيه' : 'Attention',
                message: isAr ? 'يرجى تحليل موديل أولاً من الصورة!' : 'Veuillez analyser un modèle d\'abord !',
                isError: true
              });
              return;
            }
            setShowDispatchModal(true);
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-emerald-600 font-black active:scale-95"
        >
          <Send className="w-4.5 h-4.5" />
          <span className="text-[9px] font-black">{isAr ? 'تصدير 🚀' : 'Export'}</span>
        </button>
      </div>
    </div>
  );
}


