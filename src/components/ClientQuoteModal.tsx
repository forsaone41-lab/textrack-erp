import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Download, Send, MessageCircle, FileText, Check, Plus, Trash2, 
  Sparkles, DollarSign, Clock, ShieldCheck, Ruler, Building, Phone, MapPin, 
  Percent, Copy, CheckCircle2, ChevronRight, Layers, Tag, Eye, ShoppingBag, 
  TrendingUp, Compass, AlertCircle, Edit3, Store, Scissors, Package
} from 'lucide-react';
import { loadCompanyProfile, saveRecord, genId, Facture, loadData, User, upsertClientDevis } from '../types';
import { printElement } from '../utils/pdf';
import { getFabricInfo, estimateSourcingBreakdown } from '../lib/fabricCatalog';

export interface ClientQuoteArticle {
  id: string;
  name: string;
  fabricCommercial: string;
  unitPrice: number;
  quantity: number;
  baseCost?: number;
  notes?: string;

  // ── SOURCING & CHIFFRAGE MATIÈRES (DÉTAILS SL3A) ──
  tissuNom?: string;
  tissuMetrage: number;
  tissuPrixMetre: number;
  marcheSourcing: string;
  coutFournitures: number;
  detailsFournitures?: string;
  coutFacon: number;
  detailsFacon?: string;
  coutRevientTotal: number;
  fabricPros?: string;
  fabricCons?: string;
}

export interface ClientQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  modelImage: string | null;
  isAr: boolean;
  initialDocMode?: 'devis' | 'fiche' | 'chiffrage' | 'both';
  initialClient?: { name?: string; phone?: string; city?: string } | null;
  onSaved?: () => void;
  onNotify?: (title: string, message: string) => void;
}

export const ClientQuoteModal: React.FC<ClientQuoteModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  modelImage,
  isAr,
  initialDocMode = 'devis',
  initialClient = null,
  onSaved,
  onNotify
}) => {
  const company = loadCompanyProfile();

  // ─── STATE ──────────────────────────────────────────────────────────
  const [docMode, setDocMode] = useState<'devis' | 'fiche' | 'chiffrage' | 'both'>(initialDocMode || 'devis');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [devisRef, setDevisRef] = useState('');
  const [devisDate, setDevisDate] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [delaiConfection, setDelaiConfection] = useState('');
  const [conditions, setConditions] = useState('');
  const [showTva, setShowTva] = useState(false);
  const [tvaRate, setTvaRate] = useState(20);
  const [articles, setArticles] = useState<ClientQuoteArticle[]>([]);
  const [activeMargin, setActiveMargin] = useState<number | null>(50);
  const [bulkQty, setBulkQty] = useState(50);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [knownClients, setKnownClients] = useState<User[]>([]);

  // ─── INITIALIZATION ON OPEN ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (initialDocMode) {
      setDocMode(initialDocMode);
    }

    const dateToday = new Date().toISOString().split('T')[0];
    const refCode = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setDevisRef(refCode);
    setDevisDate(dateToday);
    setClientName(initialClient?.name?.trim() || (isAr ? 'الزبون / العلامة التجارية' : 'Client / Marque Partenaire'));
    setClientCity(initialClient?.city?.trim() || (isAr ? 'الدار البيضاء، المغرب' : 'Casablanca, Maroc'));
    setClientPhone(initialClient?.phone?.trim() || '');
    loadData<User>('users').then(users => {
      if (Array.isArray(users)) {
        setKnownClients(users.filter(u => u.role === 'client' || u.role === 'merchant'));
      }
    }).catch(() => {});
    setDelaiConfection(isAr ? '7 إلى 10 أيام عمل' : '7 à 10 jours ouvrés');
    setConditions(
      isAr
        ? 'تسبيق 50% إلزامي مسبقاً لتأمين القماش قبل الشراء (الأقمشة تباع باللفافات في سوق الجملة ولا تباع بالمتر المفرّق). يتم إنجاز النموذج الأولي (Échantillon) أولاً، ويبقى إطلاق الإنتاج الإجمالي معلقاً حتى معاينة ومصادقة الزبون التامة عليه.'
        : 'Acompte de 50% obligatoire pour approvisionnement tissu (matières vendues au rouleau en gros, non détaillées au mètre). Échantillon confectionné en premier, production série lancée uniquement après validation ferme du client.'
    );

    // Build articles from analysis
    if (analysisResult) {
      if (analysisResult.pieces && analysisResult.pieces.length > 0) {
        const loaded: ClientQuoteArticle[] = analysisResult.pieces.map((p: any, idx: number) => {
          let cleanFabric = p.fabricSuggested || '';
          cleanFabric = cleanFabric
            .replace(/\(.*?\)/g, '')
            .replace(/درب عمر|القريعة|المسيرة|Derb Omar|Griaa/gi, '')
            .trim();
          if (!cleanFabric) {
            cleanFabric = isAr ? 'قماش ممتاز عالي الجودة' : 'Tissu Confection Supérieure';
          }

          const rawCost = parseFloat(String(p.costEstimate || '0').match(/[\d.]+/)?.[0] || '70') || 70;
          const sourcing = estimateSourcingBreakdown({
            pieceName: p.name || (isAr ? `قطعة ${idx + 1}` : `Pièce ${idx + 1}`),
            fabricName: p.fabricSuggested || '',
            consumptionStr: p.consumption || '',
            baseCost: rawCost,
            isAr
          });

          return {
            id: `art-${idx}-${Date.now()}`,
            name: p.name || (isAr ? `قطعة ${idx + 1}` : `Pièce ${idx + 1}`),
            fabricCommercial: cleanFabric,
            unitPrice: sourcing.sellingPrice,
            quantity: 50,
            baseCost: rawCost,
            notes: p.fit || '',
            tissuNom: p.fabricSuggested || cleanFabric,
            tissuMetrage: sourcing.metrage,
            tissuPrixMetre: sourcing.prixMetre,
            marcheSourcing: sourcing.marche,
            coutFournitures: sourcing.fournitures,
            detailsFournitures: sourcing.detailsFournitures,
            coutFacon: sourcing.facon,
            detailsFacon: sourcing.detailsFacon,
            coutRevientTotal: sourcing.coutRevientTotal,
            fabricPros: sourcing.fabricPros,
            fabricCons: sourcing.fabricCons
          };
        });
        setArticles(loaded);
        if (loaded.length > 0) setExpandedArticleId(loaded[0].id);
      } else {
        let cleanFabric = analysisResult.fabricSuggested || '';
        cleanFabric = cleanFabric
          .replace(/\(.*?\)/g, '')
          .replace(/درب عمر|القريعة|المسيرة|Derb Omar|Griaa/gi, '')
          .trim();
        if (!cleanFabric) {
          cleanFabric = isAr ? 'قماش ممتاز عالي الجودة' : 'Tissu Confection Supérieure';
        }

        const rawCost = parseFloat(String(analysisResult.costEstimate || '0').match(/[\d.]+/)?.[0] || '120') || 120;
        const sourcing = estimateSourcingBreakdown({
          pieceName: analysisResult.category || (isAr ? 'موديل تفصيل راقي' : 'Modèle Confection'),
          fabricName: analysisResult.fabricSuggested || '',
          consumptionStr: analysisResult.consumption || '2.0m',
          baseCost: rawCost,
          isAr
        });

        const singleArt: ClientQuoteArticle = {
          id: `single-${Date.now()}`,
          name: analysisResult.category || (isAr ? 'موديل تفصيل راقي' : 'Modèle Confection'),
          fabricCommercial: cleanFabric,
          unitPrice: sourcing.sellingPrice,
          quantity: 50,
          baseCost: rawCost,
          notes: analysisResult.fit || '',
          tissuNom: analysisResult.fabricSuggested || cleanFabric,
          tissuMetrage: sourcing.metrage,
          tissuPrixMetre: sourcing.prixMetre,
          marcheSourcing: sourcing.marche,
          coutFournitures: sourcing.fournitures,
          detailsFournitures: sourcing.detailsFournitures,
          coutFacon: sourcing.facon,
          detailsFacon: sourcing.detailsFacon,
          coutRevientTotal: sourcing.coutRevientTotal,
          fabricPros: sourcing.fabricPros,
          fabricCons: sourcing.fabricCons
        };

        setArticles([singleArt]);
        setExpandedArticleId(singleArt.id);
      }
    }
  }, [isOpen, analysisResult, isAr, initialDocMode]);

  if (!isOpen) return null;

  // ─── CALCULATIONS ───────────────────────────────────────────────────
  const totalHT = articles.reduce((sum, a) => sum + (Number(a.unitPrice) || 0) * (Number(a.quantity) || 0), 0);
  const totalTVA = showTva ? Math.round(totalHT * (tvaRate / 100)) : 0;
  const totalTTC = totalHT + totalTVA;
  const totalPiecesCount = articles.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);

  // Financial Sourcing & Costing Summaries (L'oco global dial sl3a)
  const totalCoutTissus = articles.reduce((sum, a) => sum + (Number(a.tissuMetrage) || 0) * (Number(a.tissuPrixMetre) || 0) * (Number(a.quantity) || 0), 0);
  const totalCoutFournitures = articles.reduce((sum, a) => sum + (Number(a.coutFournitures) || 0) * (Number(a.quantity) || 0), 0);
  const totalCoutFacon = articles.reduce((sum, a) => sum + (Number(a.coutFacon) || 0) * (Number(a.quantity) || 0), 0);
  const totalCoutRevientGlobal = articles.reduce((sum, a) => sum + (Number(a.coutRevientTotal) || 0) * (Number(a.quantity) || 0), 0);
  const totalBeneficeBrut = totalHT - totalCoutRevientGlobal;
  const margeGlobalePct = totalHT > 0 ? Math.round((totalBeneficeBrut / totalHT) * 100) : 0;

  // ─── HANDLERS ───────────────────────────────────────────────────────
  const handleUpdateArticle = (id: string, field: keyof ClientQuoteArticle, value: any) => {
    setArticles(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, [field]: value };

      // Recalculate Coût de Revient Unitaire automatically if any component changes
      if (field === 'tissuMetrage' || field === 'tissuPrixMetre' || field === 'coutFournitures' || field === 'coutFacon') {
        const tm = field === 'tissuMetrage' ? Number(value) || 0 : Number(a.tissuMetrage) || 0;
        const tp = field === 'tissuPrixMetre' ? Number(value) || 0 : Number(a.tissuPrixMetre) || 0;
        const cf = field === 'coutFournitures' ? Number(value) || 0 : Number(a.coutFournitures) || 0;
        const cfac = field === 'coutFacon' ? Number(value) || 0 : Number(a.coutFacon) || 0;
        updated.coutRevientTotal = Math.round((tm * tp) + cf + cfac);
      }
      return updated;
    }));
  };

  const handleApplyMargin = (marginPct: number) => {
    setActiveMargin(marginPct);
    setArticles(prev => prev.map(a => {
      const base = a.coutRevientTotal || a.baseCost || a.unitPrice;
      const newPrice = Math.max(10, Math.round((base * (1 + marginPct / 100)) / 5) * 5);
      return { ...a, unitPrice: newPrice };
    }));
  };

  const handleApplyBulkQty = () => {
    if (bulkQty <= 0) return;
    setArticles(prev => prev.map(a => ({ ...a, quantity: bulkQty })));
  };

  const handleAddArticle = () => {
    const newId = `extra-${Date.now()}`;
    const newArt: ClientQuoteArticle = {
      id: newId,
      name: isAr ? 'قطعة إضافية / إكسسوار' : 'Article Supplémentaire',
      fabricCommercial: isAr ? 'حسب الاختيار' : 'Au choix',
      unitPrice: 50,
      baseCost: 32,
      quantity: bulkQty || 50,
      tissuNom: isAr ? 'قماش مخصص' : 'Tissu Personnalisé',
      tissuMetrage: 1.0,
      tissuPrixMetre: 35,
      marcheSourcing: isAr ? 'درب عمر، سوق القريعة، الدار البيضاء' : 'Derb Omar, Souk Griaa, Casablanca',
      coutFournitures: 8,
      detailsFournitures: isAr ? 'خيط بوليستر + أزرار/سحاب' : 'Fil polyester + accessoires',
      coutFacon: 15,
      detailsFacon: isAr ? 'فصالة مطلوة + تجميع الأجزاء + فينيسيون' : 'Coupe matelas + assemblage + finitions',
      coutRevientTotal: 58
    };
    setArticles(prev => [...prev, newArt]);
    setExpandedArticleId(newId);
  };

  const handleRemoveArticle = (id: string) => {
    if (articles.length <= 1) return;
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // Quick preset markets chips
  const MOROCCAN_MARKETS = [
    { ar: 'درب عمر (سوق المسيرة)', fr: 'Derb Omar (Souk Al Massira)' },
    { ar: 'سوق القريعة (شارع الأثواب)', fr: 'Souk Griaa (Avenue des tissus)' },
    { ar: 'عين السبع (المنطقة الصناعية)', fr: 'Aïn Sebaâ (Zone Industrielle)' },
    { ar: 'درب السلطان (الكبير)', fr: 'Derb Sultan (Derb Kebir)' },
    { ar: 'سوق الغزل (فاس)', fr: 'Souk Ghezel (Fès)' }
  ];

  // ─── PRINT / PDF EXPORT ─────────────────────────────────────────────
  const handlePrintPDF = () => {
    printElement('beya-client-proposal-a4');
  };

  // ─── WHATSAPP SHARING ───────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    const piecesSummary = articles.map(a => 
      `• *${a.name}*: ${a.quantity} pcs × ${a.unitPrice} MAD (Tissu: ${a.fabricCommercial}) = ${(a.quantity * a.unitPrice).toLocaleString()} MAD`
    ).join('\n');

    const msg = isAr
      ? `السلام عليكم ${clientName || 'أخي الكريم'}،\n\nإليك عرض السعر وملف تفصيل الموديل المقترح من ورشة *${company.name || 'BEYA ATELIER'}*:\n\n📋 *رقم العرض:* ${devisRef}\n👗 *الموديل:* ${analysisResult?.category || 'Ensemble Confection'}\n📅 *التاريخ:* ${devisDate}\n\n*تفاصيل القطع والأسعار:*\n${piecesSummary}\n\n💰 *المجموع الإجمالي:* *${totalTTC.toLocaleString()} درهم* ${showTva ? '(TTC)' : ''}\n📦 *الكمية الإجمالية:* ${totalPiecesCount} قطعة\n⏱️ *مدة الإنجاز:* ${delaiConfection}\n📌 *شروط الدفع:* ${conditions}\n\nشكراً لثقتكم بنا، رهن إشارتكم لأي تعديل أو إطلاق النموذج الأولي! ✨`
      : `Bonjour ${clientName || 'Cher Client'},\n\nSuite à l'analyse de votre modèle, voici notre proposition commerciale et devis de confection de l'atelier *${company.name || 'BEYA ATELIER'}* :\n\n📋 *Réf Devis :* ${devisRef}\n👗 *Modèle :* ${analysisResult?.category || 'Ensemble Confection'}\n📅 *Date :* ${devisDate}\n\n*Détail de la proposition :*\n${piecesSummary}\n\n💰 *TOTAL ESTIMATIF :* *${totalTTC.toLocaleString()} MAD* ${showTva ? '(TTC)' : ''}\n📦 *Quantité totale :* ${totalPiecesCount} pièces\n⏱️ *Délai de fabrication :* ${delaiConfection}\n📌 *Modalités :* ${conditions}\n\nRestant à votre entière disposition pour le lancement du prototype ! ✨`;

    const cleanPhone = clientPhone.replace(/\D/g, '');
    let url = 'https://wa.me/';
    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith('0') ? '212' + cleanPhone.slice(1) : cleanPhone;
      url += `${fullPhone}?text=${encodeURIComponent(msg)}`;
    } else {
      url += `?text=${encodeURIComponent(msg)}`;
    }
    window.open(url, '_blank');
  };

  // ─── SAVE TO ERP DEVIS ──────────────────────────────────────────────
  const handleSaveToDevis = async () => {
    setSaving(true);
    try {
      const mappedArticles = articles.map(a => ({
        id: genId(),
        designation: `${a.name} [Tissu: ${a.fabricCommercial} | Sourcing: ${a.marcheSourcing || 'Marché'}]`,
        type: 'matiere' as const,
        quantite: a.quantity,
        prixUnitaire: a.unitPrice,
        total: a.quantity * a.unitPrice
      }));

      const { devis: savedDevis, updated: wasUpdated } = await upsertClientDevis({
        preferredNumero: devisRef,
        client: clientName || (isAr ? 'زبون تجاري' : 'Client Partenaire'),
        clientPhone,
        montant: totalTTC,
        avance: 0,
        date: devisDate,
        echeance: new Date(Date.now() + validityDays * 24 * 3600 * 1000).toISOString().split('T')[0],
        statut: 'en_attente',
        articles: mappedArticles
      });
      setDevisRef(savedDevis.numero);

      if (onNotify) {
        onNotify(
          wasUpdated
            ? (isAr ? 'تم تحديث عرض السعر السابق' : 'Devis existant mis à jour')
            : (isAr ? 'تم الحفظ في Devis' : 'Enregistré dans Devis'),
          wasUpdated
            ? (isAr
                ? `تم تعديل عرض السعر (${savedDevis.numero}) تلقائياً بالأسعار الجديدة دون تكرار!`
                : `Le devis existant (${savedDevis.numero}) a été mis à jour automatiquement (sans doublon) !`)
            : (isAr
                ? `تم حفظ عرض السعر (${savedDevis.numero}) في سجلات Devis بالـ ERP بنجاح!`
                : `Le devis (${savedDevis.numero}) a été enregistré dans le module Devis avec succès !`)
        );
      }
      if (onSaved) onSaved();
    } catch (e: any) {
      console.error('Error saving devis:', e);
    } finally {
      setSaving(false);
    }
  };

  // ─── COPY TEXT SUMMARY ──────────────────────────────────────────────
  const handleCopySummary = async () => {
    const text = articles.map(a => 
      `${a.name}: ${a.quantity} pcs x ${a.unitPrice} DH [Coût Revient: ${a.coutRevientTotal} DH | Tissu: ${a.tissuPrixMetre}DH/m x ${a.tissuMetrage}m @ ${a.marcheSourcing}]`
    ).join('\n');
    const full = `CHIFFRAGE & DEVIS ${devisRef} - ${clientName}\nDate: ${devisDate}\nTotal Vente: ${totalTTC} MAD\nCoût Revient Total: ${totalCoutRevientGlobal} MAD\nBénéfice Prévisionnel: ${totalBeneficeBrut} MAD (${margeGlobalePct}%)\n\n${text}\nDélai: ${delaiConfection}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  // ─── RENDER (MONOCHROME NOIR & BLANC PRO EDITION) ───────────────────
  return (
    <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-black border border-neutral-800 rounded-2xl md:rounded-3xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── TOP HEADER / MONOCHROME TOOLBAR ── */}
        <div className={`px-4 py-3.5 md:px-6 md:py-4 border-b border-neutral-800 bg-black flex flex-wrap items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-sm flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-black text-white tracking-tight uppercase">
                  {isAr ? 'كلفة السلعة، التوريد وعرض السعر الاحترافي' : 'Chiffrage Sourcing Matières & Devis Atelier'}
                </h2>
                <span className="bg-neutral-900 text-white border border-neutral-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  SOURCING MAROC
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                {isAr
                  ? 'تفاصيل الأثواب، أسواق الجملة، كلفة البياسة (L\'Oco) وعرض سعر احترافي بالأبيض والأسود'
                  : 'Détails des tissus, marchés de gros, coût de revient unitaire et devis monochrome pro'}
              </p>
            </div>
          </div>

          {/* Monochrome Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              title={isAr ? 'تحميل كـ PDF أو طباعة A4' : 'Télécharger en PDF ou Imprimer A4'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل PDF / طباعة' : 'Télécharger PDF / Imprimer'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer"
              title={isAr ? 'إرسال العرض عبر واتساب' : 'Envoyer Devis sur WhatsApp'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handleSaveToDevis}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-xl font-black text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title={isAr ? 'حفظ في قاعدة بيانات Devis' : 'Enregistrer dans le module Devis'}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? (isAr ? 'جارِ الحفظ...' : 'Sauvegarde...') : (isAr ? 'حفظ في Devis' : 'Enregistrer')}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-xl transition-all cursor-pointer"
              title={isAr ? 'نسخ ملخص كلفة السلعة والعرض' : 'Copier le résumé chiffrage & devis'}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-neutral-900 hover:bg-white hover:text-black text-neutral-400 border border-neutral-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── MODAL BODY: SPLIT VIEW (EDITOR vs MONOCHROME A4 PREVIEW) ── */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-neutral-950">
          
          {/* ── LEFT PANEL: ORGANIZED MONOCHROME CONTROLS (5 cols) ── */}
          <div className="lg:col-span-5 p-4 md:p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r border-neutral-800 space-y-4 custom-scrollbar bg-neutral-950">
            
            {/* Document Mode Selector in Left Panel */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-3 space-y-2">
              <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                {isAr ? 'نوع الوثيقة المراد تجهيزها:' : 'Type de document à afficher / exporter :'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { key: 'chiffrage' as const, icon: DollarSign, labelAr: 'كلفة السلعة', labelFr: 'Chiffrage' },
                  { key: 'devis' as const, icon: FileText, labelAr: 'دوڤي البيع', labelFr: 'Devis' },
                  { key: 'fiche' as const, icon: Ruler, labelAr: 'المقاسات', labelFr: 'Tailles' },
                  { key: 'both' as const, icon: Layers, labelAr: 'الملف الشامل', labelFr: 'Complet' },
                ].map(tab => {
                  const Icon = tab.icon;
                  const active = docMode === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDocMode(tab.key)}
                      className={`py-2 px-2 text-center rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        active
                          ? 'bg-white text-black shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{isAr ? tab.labelAr : tab.labelFr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clean Monochrome KPI Summary Banner */}
            <div className="p-3.5 bg-black border border-neutral-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                  <span>{isAr ? 'ملخص الكلفة والربح (L\'Oco & Marge)' : 'Rentabilité & Coût de Revient'}</span>
                </div>
                <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-black font-mono">
                  +{margeGlobalePct}% {isAr ? 'ربح' : 'marge'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold">{isAr ? 'كلفة الإنتاج' : 'Coût Fab.'}</span>
                  <span className="text-white font-mono font-black text-xs">{totalCoutRevientGlobal.toLocaleString()} DH</span>
                </div>
                <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px] uppercase font-bold">{isAr ? 'إجمالي البيع' : 'Total Vente'}</span>
                  <span className="text-white font-mono font-black text-xs">{totalHT.toLocaleString()} DH</span>
                </div>
                <div className="p-2 bg-white text-black rounded-xl border border-white">
                  <span className="text-neutral-600 block text-[9px] uppercase font-black">{isAr ? 'الربح الصافي' : 'Bénéfice Net'}</span>
                  <span className="text-black font-mono font-black text-xs">+{totalBeneficeBrut.toLocaleString()} DH</span>
                </div>
              </div>
            </div>

            {/* Quick Margin Presets */}
            <div className="p-3 bg-black border border-neutral-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{isAr ? 'هامش الربح التلقائي:' : 'Ajustement rapide de marge :'}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-bold">
                  {isAr ? 'على كلفة البياسة' : 'Sur Coût de Revient'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 50, 75, 100].map(m => (
                  <button
                    key={m}
                    onClick={() => handleApplyMargin(m)}
                    className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      activeMargin === m
                        ? 'bg-white text-black'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    +{m}%
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Client Information */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-white border-b border-neutral-800 pb-2">
                <span className="px-1.5 py-0.5 bg-white text-black rounded text-[10px] font-mono font-black">01</span>
                <span>{isAr ? 'معلومات الزبون والعرض' : 'Coordonnées Client & Devis'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-black text-neutral-400 uppercase mb-1">
                    {isAr ? 'اسم الزبون / الماركة' : 'Nom du Client / Marque'}
                  </label>
                  <input
                    type="text"
                    list="beya-quote-clients"
                    value={clientName}
                    onChange={e => {
                      const val = e.target.value;
                      setClientName(val);
                      const matched = knownClients.find(u => (u.nom || '').trim().toLowerCase() === val.trim().toLowerCase());
                      if (matched?.telephone && !clientPhone) {
                        setClientPhone(matched.telephone);
                      }
                      if (matched?.ville) {
                        setClientCity(matched.ville);
                      }
                    }}
                    placeholder="Ex: Boutique Elegance"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-medium"
                  />
                  <datalist id="beya-quote-clients">
                    {Array.from(new Set(knownClients.map(c => (c.nom || '').trim()).filter(Boolean))).map(nom => (
                      <option key={nom} value={nom} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-neutral-400 uppercase mb-1">
                    {isAr ? 'رقم الهاتف (واتساب)' : 'Téléphone (WhatsApp)'}
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="0661000000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-neutral-400 uppercase mb-1">
                    {isAr ? 'المدينة / العنوان' : 'Ville / Adresse'}
                  </label>
                  <input
                    type="text"
                    value={clientCity}
                    onChange={e => setClientCity(e.target.value)}
                    placeholder="Casablanca, Maroc"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-neutral-400 uppercase mb-1">
                    {isAr ? 'رقم المرجع (Devis N°)' : 'Référence Devis'}
                  </label>
                  <input
                    type="text"
                    value={devisRef}
                    onChange={e => setDevisRef(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: GRANULAR SOURCING & RAW MATERIALS EDITOR */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <span className="px-1.5 py-0.5 bg-white text-black rounded text-[10px] font-mono font-black">02</span>
                  <span>{isAr ? 'تفاصيل السلعة والتوريد (تعديل مباشر)' : 'Sourcing, Matières & Coût de Revient'}</span>
                </div>
                <button
                  onClick={handleAddArticle}
                  className="flex items-center gap-1 text-[10px] font-black text-black bg-white hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAr ? 'إضافة' : 'Ajouter'}</span>
                </button>
              </div>

              {/* Bulk Quantity Setter */}
              <div className="flex items-center justify-between gap-2 p-2 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
                <span className="text-[10px] text-neutral-400 font-bold whitespace-nowrap">
                  {isAr ? 'توحيد كمية البياسات:' : 'Quantité groupée :'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bulkQty}
                    onChange={e => setBulkQty(Number(e.target.value) || 0)}
                    className="w-16 bg-black border border-neutral-700 rounded-lg px-2 py-1 text-xs text-center text-white font-black"
                  />
                  <button
                    onClick={handleApplyBulkQty}
                    className="px-3 py-1 bg-neutral-800 hover:bg-white hover:text-black text-white text-[10px] font-black rounded-lg transition-all cursor-pointer"
                  >
                    {isAr ? 'تطبيق' : 'Appliquer'}
                  </button>
                </div>
              </div>

              {/* Articles List */}
              <div className="space-y-3">
                {articles.map((art, idx) => {
                  const isExpanded = expandedArticleId === art.id || articles.length === 1;
                  const margeUnit = (Number(art.unitPrice) || 0) - (Number(art.coutRevientTotal) || 0);

                  return (
                    <div key={art.id} className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                      
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center text-xs font-black shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={art.name}
                            onChange={e => handleUpdateArticle(art.id, 'name', e.target.value)}
                            placeholder="Nom de la pièce"
                            className="bg-transparent font-black text-xs text-white focus:outline-none focus:border-b border-white flex-1 min-w-0"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono font-black text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700" title="Coût de revient unitaire">
                            L'Oco: {art.coutRevientTotal} DH
                          </span>
                          <button
                            onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                            className="text-neutral-400 hover:text-white p-1 text-[10px] font-bold cursor-pointer"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                          {articles.length > 1 && (
                            <button
                              onClick={() => handleRemoveArticle(art.id)}
                              className="text-neutral-500 hover:text-white p-1 transition-colors cursor-pointer"
                              title={isAr ? 'حذف هذه القطعة' : 'Supprimer'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Fields */}
                      {isExpanded && (
                        <div className="space-y-3 pt-1 text-xs">
                          
                          {/* Commercial Fabric Name */}
                          <div>
                            <label className="block text-[9px] font-black text-neutral-400 uppercase mb-1">
                              {isAr ? 'اسم الثوب ونوعه التجاري:' : 'Tissu commercial recommandé :'}
                            </label>
                            <input
                              type="text"
                              value={art.fabricCommercial}
                              onChange={e => handleUpdateArticle(art.id, 'fabricCommercial', e.target.value)}
                              placeholder="Ex: Popeline de coton"
                              className="w-full bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-medium"
                            />
                          </div>

                          {/* Sourcing Market */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[9px] font-black text-neutral-400 uppercase flex items-center gap-1">
                                <Store className="w-3 h-3 text-white" />
                                <span>{isAr ? 'سوق الشراء بالجملة:' : 'Marché de gros (Où acheter) :'}</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              value={art.marcheSourcing}
                              onChange={e => handleUpdateArticle(art.id, 'marcheSourcing', e.target.value)}
                              placeholder="Ex: Derb Omar, Casablanca"
                              className="w-full bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-medium"
                            />
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {MOROCCAN_MARKETS.map((m, mIdx) => (
                                <button
                                  key={mIdx}
                                  type="button"
                                  onClick={() => handleUpdateArticle(art.id, 'marcheSourcing', isAr ? m.ar : m.fr)}
                                  className="text-[9px] px-2 py-0.5 bg-neutral-900 hover:bg-white hover:text-black text-neutral-300 rounded border border-neutral-800 transition-colors cursor-pointer"
                                >
                                  {isAr ? m.ar.split('(')[0] : m.fr.split('(')[0]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Raw Materials Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-black rounded-xl border border-neutral-800">
                            <div>
                              <label className="block text-[8px] font-black text-neutral-400 uppercase mb-0.5">
                                {isAr ? 'المتراج (m)' : 'Métrage (m)'}
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={art.tissuMetrage}
                                onChange={e => handleUpdateArticle(art.id, 'tissuMetrage', parseFloat(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-black focus:outline-none focus:border-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[8px] font-black text-neutral-300 uppercase mb-0.5">
                                {isAr ? 'ثمن المتر (DH)' : 'Prix/m Tissu'}
                              </label>
                              <input
                                type="number"
                                value={art.tissuPrixMetre}
                                onChange={e => handleUpdateArticle(art.id, 'tissuPrixMetre', parseFloat(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-black focus:outline-none focus:border-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[8px] font-black text-neutral-400 uppercase mb-0.5">
                                {isAr ? 'اللوازم (DH)' : 'Fournitures (DH)'}
                              </label>
                              <input
                                type="number"
                                value={art.coutFournitures}
                                onChange={e => handleUpdateArticle(art.id, 'coutFournitures', parseFloat(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-black focus:outline-none focus:border-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[8px] font-black text-neutral-400 uppercase mb-0.5">
                                {isAr ? 'الصنعة (DH)' : 'Façon (DH)'}
                              </label>
                              <input
                                type="number"
                                value={art.coutFacon}
                                onChange={e => handleUpdateArticle(art.id, 'coutFacon', parseFloat(e.target.value) || 0)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-black focus:outline-none focus:border-white"
                              />
                            </div>
                          </div>

                          {/* Accessories details */}
                          <div>
                            <label className="block text-[8px] font-black text-neutral-400 uppercase mb-0.5">
                              {isAr ? 'تفاصيل اللوازم:' : 'Détail des accessoires & fournitures :'}
                            </label>
                            <input
                              type="text"
                              value={art.detailsFournitures || ''}
                              onChange={e => handleUpdateArticle(art.id, 'detailsFournitures', e.target.value)}
                              placeholder="Ex: Boutons + triplure thermocollante"
                              className="w-full bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white"
                            />
                          </div>

                          {/* Confection details */}
                          <div>
                            <label className="block text-[8px] font-black text-neutral-400 uppercase mb-0.5">
                              {isAr ? 'تفاصيل الصنعة والخياطة:' : 'Détail des opérations atelier & façon :'}
                            </label>
                            <input
                              type="text"
                              value={art.detailsFacon || ''}
                              onChange={e => handleUpdateArticle(art.id, 'detailsFacon', e.target.value)}
                              placeholder="Ex: Coupe matelas + assemblage + finitions"
                              className="w-full bg-black border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white"
                            />
                          </div>

                          {/* Commercial Pricing row */}
                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-neutral-800">
                            <div>
                              <label className="block text-[8px] font-black text-neutral-400 uppercase mb-0.5">
                                {isAr ? 'الكمية' : 'Quantité'}
                              </label>
                              <input
                                type="number"
                                value={art.quantity}
                                onChange={e => handleUpdateArticle(art.id, 'quantity', Number(e.target.value) || 0)}
                                className="w-full bg-black border border-neutral-800 rounded-lg px-2 py-1 text-xs text-center text-white font-black focus:outline-none focus:border-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[8px] font-black text-neutral-300 uppercase mb-0.5">
                                {isAr ? 'كلفة البياسة' : 'Coût Revient'}
                              </label>
                              <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-black">
                                {art.coutRevientTotal} DH
                              </div>
                            </div>

                            <div>
                              <label className="block text-[8px] font-black text-white uppercase mb-0.5">
                                {isAr ? 'ثمن البيع' : 'Prix Vente'}
                              </label>
                              <input
                                type="number"
                                value={art.unitPrice}
                                onChange={e => handleUpdateArticle(art.id, 'unitPrice', Number(e.target.value) || 0)}
                                className="w-full bg-neutral-900 border border-white/40 rounded-lg px-2 py-1 text-xs text-center text-white font-black focus:outline-none focus:border-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[8px] font-black text-white uppercase mb-0.5">
                                {isAr ? 'الربح / pc' : 'Marge / pc'}
                              </label>
                              <div className="bg-white text-black border border-white rounded-lg px-2 py-1 text-xs text-center font-mono font-black">
                                +{margeUnit} DH
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Delivery Delays & Terms */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-white border-b border-neutral-800 pb-2">
                <span className="px-1.5 py-0.5 bg-white text-black rounded text-[10px] font-mono font-black">03</span>
                <span>{isAr ? 'مدة الإنجاز والشروط' : 'Délais & Conditions de Confection'}</span>
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase mb-1">
                  {isAr ? 'مدة الإنجاز المقدرة' : 'Délai estimé de fabrication'}
                </label>
                <input
                  type="text"
                  value={delaiConfection}
                  onChange={e => setDelaiConfection(e.target.value)}
                  placeholder="Ex: 7 à 10 jours ouvrés"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black text-neutral-400 uppercase">
                    {isAr ? 'شروط الدفع والمصادقة:' : 'Conditions de règlement & Prototype'}
                  </label>
                  <span className="text-[9px] text-neutral-300 font-black uppercase">
                    {isAr ? 'تسبيق القماش إلزامي' : 'Acompte tissu requis'}
                  </span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setConditions(
                      isAr
                        ? 'تسبيق 50% إلزامي مسبقاً قبل شراء القماش (السلعة لا تباع بالمتر المفرّق في أسواق الجملة). يتم إنجاز النموذج الأولي (Échantillon) أولاً، ويبقى الإنتاج الإجمالي معلقاً حتى المصادقة النهائية (Validation) من طرف العميل.'
                        : 'Acompte de 50% obligatoire avant approvisionnement tissu (matières vendues au rouleau en gros, non détaillées au mètre). Échantillon réalisé en premier, production série lancée uniquement après validation ferme du client.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-[10px] font-black transition-all cursor-pointer"
                  >
                    {isAr ? 'القماش علينا (50%)' : 'Sourcing Atelier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConditions(
                      isAr
                        ? 'القماش يوفره الزبون. تسبيق 30% عند بدء تفصيل العينة (Prototype)، والباقي عند التسليم النهائي بعد مراقبة الجودة.'
                        : 'Tissu fourni par le client. Acompte de 30% au lancement du prototype, solde à la livraison finale après contrôle qualité.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-200 font-bold transition-all cursor-pointer"
                  >
                    {isAr ? 'القماش من عند الزبون' : 'Tissu Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConditions(
                      isAr
                        ? 'أداء مصاريف العينة (Échantillon) وتأمين القماش 100% مسبقاً قبل الخروج للسوق. تحتسب قيمة العينة مخصومة من الفاتورة الإجمالية عند تأكيد طلبية الإنتاج بالجملة.'
                        : 'Paiement 100% de l\'échantillon et approvisionnement tissu à l\'avance. Montant déduit de la facture finale lors de la confirmation de la série.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] text-neutral-200 font-bold transition-all cursor-pointer"
                  >
                    {isAr ? 'عينة فقط' : 'Proto Seul'}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={conditions}
                  onChange={e => setConditions(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-white font-medium resize-none leading-relaxed"
                />
              </div>

              {/* TVA Toggle */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-300 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showTva}
                    onChange={e => setShowTva(e.target.checked)}
                    className="rounded border-neutral-700 text-black focus:ring-white bg-neutral-950"
                  />
                  <span>{isAr ? 'تطبيق الضريبة على القيمة المضافة (TVA 20%)' : 'Appliquer la TVA (20%)'}</span>
                </label>
              </div>
            </div>

          </div>

          {/* ── RIGHT PANEL: CRISP NOIR & BLANC A4 DOCUMENT PREVIEW (7 cols) ── */}
          <div className="lg:col-span-7 bg-neutral-950 p-4 md:p-6 overflow-y-auto flex flex-col items-center custom-scrollbar">
            
            {/* Monochrome Document Mode Selector Tab Bar */}
            <div className="w-full max-w-3xl mb-4 bg-black border border-neutral-800 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-lg">
              {[
                { key: 'chiffrage' as const, icon: DollarSign, labelAr: '1. كلفة السلعة والتوريد', labelFr: '1. Chiffrage Sourcing' },
                { key: 'devis' as const, icon: FileText, labelAr: '2. دوڤي البيع للزبون', labelFr: '2. Devis Client' },
                { key: 'fiche' as const, icon: Ruler, labelAr: '3. المقاسات', labelFr: '3. Tailles' },
                { key: 'both' as const, icon: Layers, labelAr: '4. الملف الشامل', labelFr: '4. Dossier Complet' },
              ].map(tab => {
                const Icon = tab.icon;
                const active = docMode === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDocMode(tab.key)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{isAr ? tab.labelAr : tab.labelFr}</span>
                  </button>
                );
              })}
            </div>

            {/* The Printable A4 Monochrome Container (STRICTLY NOIR & BLANC) */}
            <div 
              id="beya-client-proposal-a4" 
              className="w-full max-w-3xl font-sans text-xs space-y-6 text-black"
            >
              
              {/* ══════════════════════════════════════════════════════════════
                  PAGE 1: SOURCING & CHIFFRAGE (PURE BLACK & WHITE EDITORIAL)
                  ══════════════════════════════════════════════════════════════ */}
              {(docMode === 'chiffrage' || docMode === 'both') && (
                <div className="bg-white text-black rounded-xl shadow-2xl p-7 sm:p-9 w-full border border-neutral-300">
                  
                  {/* Document Header */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-5 mb-5 gap-4">
                    <div>
                      {(company.logoInvoice || company.logoUrl) ? (
                        <img src={company.logoInvoice || company.logoUrl} alt={company.name} className="h-10 object-contain mb-2 grayscale contrast-125" />
                      ) : (
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm">
                            B
                          </div>
                          <span className="text-base font-black tracking-tight text-black uppercase">
                            {company.name || 'BEYA ATELIER'}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-black">{company.subtitle || 'Atelier de Modélisme & Confection Textile'}</p>
                      <p className="text-[10px] text-neutral-600">{company.address || 'Zone Industrielle, Meknès'}</p>
                      <p className="text-[10px] text-neutral-600">Tél: {company.phone || '0661000000'} | {company.email || 'contact@beya.ma'}</p>
                      {(company.ice || company.rc) && (
                        <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                          {company.ice ? `ICE: ${company.ice}` : ''} {company.rc ? `| RC: ${company.rc}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-3.5 py-1 bg-black text-white text-[10px] font-black rounded tracking-widest uppercase mb-2">
                        {isAr ? 'كلفة السلعة وتفاصيل التوريد' : 'FICHE CHIFFRAGE & SOURCING'}
                      </span>
                      <div className="text-sm font-black text-black font-mono">SOURC-{devisRef}</div>
                      <div className="text-[10px] text-neutral-600 mt-0.5">Date : {devisDate}</div>
                      <div className="text-[10px] text-black font-bold">{totalPiecesCount} pièces</div>
                    </div>
                  </div>

                  {/* Clean Monochrome Model Showcase */}
                  <div className="flex gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-300 mb-6 items-center">
                    {modelImage && (
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-black flex-shrink-0 bg-white relative">
                        <img src={modelImage} alt="Modèle" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-black text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase">
                          RÉF
                        </div>
                      </div>
                    )}
                    <div className="flex-1 text-left space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">
                          Étude Technique des Matières & Sourcing Maroc
                        </span>
                        <span className="text-[9px] font-mono font-bold text-black bg-white px-2 py-0.5 border border-neutral-300 rounded">
                          {articles.length} article(s)
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-black uppercase tracking-tight">
                        {analysisResult?.category || 'Modèle Référence Confection'}
                      </h3>
                      <p className="text-[10px] text-neutral-800 leading-relaxed">
                        <strong className="text-black">Tissu Recommandé :</strong> {articles.map(a => a.tissuNom || a.fabricCommercial).join(' + ')}
                      </p>
                      {articles[0]?.fabricPros && (
                        <p className="text-[9px] text-neutral-700">
                          <strong className="text-black">Avantages :</strong> {articles[0].fabricPros}
                        </p>
                      )}
                      {articles[0]?.fabricCons && (
                        <p className="text-[9px] text-neutral-600">
                          <strong className="text-black">Note coupe :</strong> {articles[0].fabricCons}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TABLEAU 1: SOURCING TISSUS & MATIÈRES PREMIÈRES */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-mono font-black rounded-sm">01</span>
                        <h4 className="text-[10px] font-black uppercase text-black tracking-wider">
                          Sourcing Tissus & Matières Premières (شراء الأثواب ومصادر الجملة)
                        </h4>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Marchés Gros Maroc</span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black text-white text-[8px] uppercase tracking-wider">
                            <th className="py-2.5 px-2.5 font-black w-6">#</th>
                            <th className="py-2.5 px-2.5 font-black">Article & Modèle</th>
                            <th className="py-2.5 px-2.5 font-black">Tissu Recommandé</th>
                            <th className="py-2.5 px-2.5 font-black">Marché de Gros</th>
                            <th className="py-2.5 px-2 font-black text-center whitespace-nowrap">Métrage</th>
                            <th className="py-2.5 px-2 font-black text-center whitespace-nowrap">Prix / m</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap">Coût Tissu</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap">Total ({totalPiecesCount} pcs)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-[9px]">
                          {articles.map((art, idx) => {
                            const coutTissuPiece = Math.round((art.tissuMetrage || 0) * (art.tissuPrixMetre || 0));
                            const totalTissuLot = coutTissuPiece * (art.quantity || 1);

                            return (
                              <tr key={art.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                                <td className="py-2.5 px-2.5 font-bold text-neutral-500">{idx + 1}</td>
                                <td className="py-2.5 px-2.5 font-black text-black">{art.name}</td>
                                <td className="py-2.5 px-2.5 text-neutral-800">
                                  <div className="font-bold text-black">{art.tissuNom || art.fabricCommercial}</div>
                                  {art.fabricPros && <div className="text-[8px] text-neutral-500 truncate max-w-[170px]">{art.fabricPros}</div>}
                                </td>
                                <td className="py-2.5 px-2.5 text-neutral-800 font-semibold leading-snug">
                                  {art.marcheSourcing || 'درب عمر (سوق المسيرة)، الدار البيضاء'}
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-black whitespace-nowrap tabular-nums">{art.tissuMetrage} m</td>
                                <td className="py-2.5 px-2 text-center font-mono font-bold text-neutral-700 whitespace-nowrap tabular-nums">{art.tissuPrixMetre} DH</td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-black text-black bg-neutral-100 whitespace-nowrap tabular-nums">
                                  {coutTissuPiece} DH
                                </td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-black text-black whitespace-nowrap tabular-nums">
                                  {totalTissuLot.toLocaleString()} DH
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TABLEAU 2: FOURNITURES, ACCESSOIRES & FAÇON ATELIER */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-mono font-black rounded-sm">02</span>
                        <h4 className="text-[10px] font-black uppercase text-black tracking-wider">
                          Fournitures, Accessoires & Façon Atelier (اللوازم والصنعة)
                        </h4>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Détails Confection</span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black text-white text-[8px] uppercase tracking-wider">
                            <th className="py-2.5 px-2.5 font-black w-6">#</th>
                            <th className="py-2.5 px-2.5 font-black">Article</th>
                            <th className="py-2.5 px-2.5 font-black">Détail Fournitures (اللوازم)</th>
                            <th className="py-2.5 px-2 font-black text-right whitespace-nowrap">Fourn.</th>
                            <th className="py-2.5 px-2.5 font-black">Opérations Atelier (الصنعة)</th>
                            <th className="py-2.5 px-2 font-black text-right whitespace-nowrap">Façon</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap">Sous-Total</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap">Total Lot</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-[9px]">
                          {articles.map((art, idx) => {
                            const sousTotalFournFacon = (Number(art.coutFournitures) || 0) + (Number(art.coutFacon) || 0);
                            const totalLotFournFacon = sousTotalFournFacon * (art.quantity || 1);

                            return (
                              <tr key={art.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                                <td className="py-2.5 px-2.5 font-bold text-neutral-500">{idx + 1}</td>
                                <td className="py-2.5 px-2.5 font-black text-black">{art.name}</td>
                                <td className="py-2.5 px-2.5 text-neutral-700 leading-snug">
                                  {art.detailsFournitures || 'خيط بوليستر، أزرار، فيزلين، إتيكيت وبولي باݣ'}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono font-bold text-black whitespace-nowrap tabular-nums">
                                  {art.coutFournitures} DH
                                </td>
                                <td className="py-2.5 px-2.5 text-neutral-700 leading-snug">
                                  {art.detailsFacon || 'فصالة + خياطة الأجزاء + فينيسيون وكيّ'}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono font-bold text-black whitespace-nowrap tabular-nums">
                                  {art.coutFacon} DH
                                </td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-black text-black bg-neutral-100 whitespace-nowrap tabular-nums">
                                  {sousTotalFournFacon} DH
                                </td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-black text-black whitespace-nowrap tabular-nums">
                                  {totalLotFournFacon.toLocaleString()} DH
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TABLEAU 3: RÉCAPITULATIF COÛT DE REVIENT (L'OCO) & RENTABILITÉ */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-mono font-black rounded-sm">03</span>
                        <h4 className="text-[10px] font-black uppercase text-black tracking-wider">
                          Bilan de Revient Unitaire (L'OCO) & Marge Commerciale
                        </h4>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Calcul Marge Nette</span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black text-white text-[8px] uppercase tracking-wider">
                            <th className="py-2.5 px-2.5 font-black">Article</th>
                            <th className="py-2.5 px-2 font-black text-right whitespace-nowrap">Tissu / Pc</th>
                            <th className="py-2.5 px-2 font-black text-right whitespace-nowrap">Fourn.</th>
                            <th className="py-2.5 px-2 font-black text-right whitespace-nowrap">Façon</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap bg-neutral-800">Coût Revient</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap">Prix Vente</th>
                            <th className="py-2.5 px-2.5 font-black text-right whitespace-nowrap">Marge Nette</th>
                            <th className="py-2.5 px-2 font-black text-right whitespace-nowrap">Rentab. %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-[9px]">
                          {articles.map((art, idx) => {
                            const coutTissuPiece = Math.round((art.tissuMetrage || 0) * (art.tissuPrixMetre || 0));
                            const margeUnit = (art.unitPrice || 0) - (art.coutRevientTotal || 0);
                            const margePct = art.unitPrice > 0 ? Math.round((margeUnit / art.unitPrice) * 100) : 0;

                            return (
                              <tr key={art.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                                <td className="py-2.5 px-2.5 font-black text-black">{art.name}</td>
                                <td className="py-2.5 px-2 text-right font-mono text-neutral-700 whitespace-nowrap tabular-nums">{coutTissuPiece} DH</td>
                                <td className="py-2.5 px-2 text-right font-mono text-neutral-700 whitespace-nowrap tabular-nums">{art.coutFournitures} DH</td>
                                <td className="py-2.5 px-2 text-right font-mono text-neutral-700 whitespace-nowrap tabular-nums">{art.coutFacon} DH</td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-black text-black bg-neutral-100 text-[10px] whitespace-nowrap tabular-nums">
                                  {art.coutRevientTotal} DH
                                </td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-bold text-black text-[10px] whitespace-nowrap tabular-nums">
                                  {art.unitPrice} DH
                                </td>
                                <td className="py-2.5 px-2.5 text-right font-mono font-black text-black bg-neutral-100 text-[10px] whitespace-nowrap tabular-nums">
                                  +{margeUnit} DH
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono font-black text-black whitespace-nowrap tabular-nums">
                                  {margePct}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Monochrome Financial Breakdown Cards */}
                  <div className="grid grid-cols-4 gap-2.5 mb-5">
                    <div className="p-2.5 bg-white rounded-lg border border-neutral-300 text-center">
                      <span className="text-[8px] font-bold text-neutral-500 uppercase block">Total Tissus Gros</span>
                      <span className="text-xs font-black font-mono text-black">{totalCoutTissus.toLocaleString()} DH</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-neutral-300 text-center">
                      <span className="text-[8px] font-bold text-neutral-500 uppercase block">Total Fournitures</span>
                      <span className="text-xs font-black font-mono text-black">{totalCoutFournitures.toLocaleString()} DH</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-neutral-300 text-center">
                      <span className="text-[8px] font-bold text-neutral-500 uppercase block">Total Façon Atelier</span>
                      <span className="text-xs font-black font-mono text-black">{totalCoutFacon.toLocaleString()} DH</span>
                    </div>

                    <div className="p-2.5 bg-neutral-100 rounded-lg border-2 border-black text-center">
                      <span className="text-[8px] font-black text-black uppercase block">Total Coût Fabrication</span>
                      <span className="text-xs font-black font-mono text-black">{totalCoutRevientGlobal.toLocaleString()} DH</span>
                    </div>
                  </div>

                  {/* Monochrome Black Executive Profit Banner */}
                  <div className="p-4 bg-black text-white rounded-xl mb-5 flex justify-between items-center gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                        Bilan Financier & Rentabilité Estimée
                      </div>
                      <div className="text-xs text-neutral-200 mt-0.5 font-mono">
                        Chiffre d'Affaires : <strong className="text-white">{totalHT.toLocaleString()} MAD</strong> &nbsp;|&nbsp; Coût Revient : <strong className="text-white">{totalCoutRevientGlobal.toLocaleString()} MAD</strong>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                        Bénéfice Brut Prévisionnel
                      </div>
                      <div className="text-base font-black text-white font-mono">
                        +{totalBeneficeBrut.toLocaleString()} MAD <span className="px-1.5 py-0.5 bg-white text-black rounded text-[10px] ml-1">{margeGlobalePct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Monochrome Wholesale Guide Note */}
                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-300 border-l-4 border-l-black mb-5 space-y-1 text-[9px] text-neutral-700 leading-relaxed">
                    <div className="font-black text-black uppercase tracking-wider mb-1">Recommandations Achat & Sourcing Maroc :</div>
                    <div>• <strong className="text-black">Marché de référence :</strong> درب عمر (سوق المسيرة) وسوق القريعة بالدار البيضاء توفر أفضل أسعار الجملة للرولو الكامل (Rouleau).</div>
                    <div>• <strong className="text-black">عرض الثوب (Laize) :</strong> تأكد من عرض الثوب (1.50m أو 1.80m) لضبط استهلاك الباترون بدقة قبل القص.</div>
                    <div>• <strong className="text-black">اختبار الغسيل (Rétrécissement) :</strong> ينصح بغسل عينة 10x10 سم من الثوب قبل إطلاق الفصالة للتأكد من نسبة التمدد والانكماش.</div>
                  </div>

                  {/* Signatures Box */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-300 text-[10px]">
                    <div className="border border-dashed border-neutral-400 rounded-lg p-3 h-20 flex flex-col justify-between">
                      <span className="font-black text-black uppercase text-[9px]">Responsable Achats & Sourcing :</span>
                      <span className="text-[8px] text-neutral-500 font-mono">Validation Marché & Matières</span>
                    </div>

                    <div className="border border-dashed border-neutral-400 rounded-lg p-3 h-20 flex flex-col justify-between text-right">
                      <span className="font-black text-black uppercase text-[9px]">Chef de Production Atelier :</span>
                      <span className="text-[8px] text-neutral-500">Date & Bon pour Lancement</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-2.5 border-t border-neutral-200 flex justify-between text-[8px] text-neutral-500 uppercase tracking-wider font-mono">
                    <span>Fiche Interne Chiffrage & Sourcing · BEYA CREATIVE</span>
                    <span>Document Confidentiel Atelier</span>
                  </div>

                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  PAGE 2: DEVIS COMMERCIAL (MONOCHROME NOIR & BLANC)
                  ══════════════════════════════════════════════════════════════ */}
              {(docMode === 'devis' || docMode === 'both') && (
                <div 
                  className="bg-white text-black rounded-xl shadow-2xl p-7 sm:p-9 w-full border border-neutral-300" 
                  style={{ pageBreakBefore: docMode === 'both' ? 'always' : 'auto' }}
                >
                  {/* Document Header */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-5 mb-5 gap-4">
                    <div>
                      {(company.logoInvoice || company.logoUrl) ? (
                        <img src={company.logoInvoice || company.logoUrl} alt={company.name} className="h-10 object-contain mb-2 grayscale contrast-125" />
                      ) : (
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm">
                            B
                          </div>
                          <span className="text-base font-black tracking-tight text-black uppercase">
                            {company.name || 'BEYA ATELIER'}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-black">{company.subtitle || 'Atelier de Modélisme & Confection Textile'}</p>
                      <p className="text-[10px] text-neutral-600">{company.address || 'Zone Industrielle, Meknès'}</p>
                      <p className="text-[10px] text-neutral-600">Tél: {company.phone || '0661000000'} | {company.email || 'contact@beya.ma'}</p>
                      {(company.ice || company.rc) && (
                        <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                          {company.ice ? `ICE: ${company.ice}` : ''} {company.rc ? `| RC: ${company.rc}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-3.5 py-1 bg-black text-white text-[10px] font-black rounded tracking-widest uppercase mb-2">
                        {isAr ? 'عرض سعر تجاري' : 'DEVIS COMMERCIAL'}
                      </span>
                      <div className="text-sm font-black text-black font-mono">{devisRef}</div>
                      <div className="text-[10px] text-neutral-600 mt-0.5">Date : {devisDate}</div>
                      <div className="text-[10px] text-neutral-600">Validité : {validityDays} jours</div>
                    </div>
                  </div>

                  {/* Client & Reference Info Box */}
                  <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-300 mb-5">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Destinataire / Client :</div>
                      <div className="font-black text-black text-xs">{clientName || 'Client Partenaire'}</div>
                      {clientPhone && <div className="text-[10px] text-neutral-700 font-mono">{clientPhone}</div>}
                      {clientCity && <div className="text-[10px] text-neutral-600">{clientCity}</div>}
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Projet & Modèle :</div>
                      <div className="font-black text-black text-xs">{analysisResult?.category || 'Ensemble Confection'}</div>
                      <div className="text-[10px] text-neutral-800 font-bold">{totalPiecesCount} pièces au total</div>
                      <div className="text-[10px] text-black font-semibold">{delaiConfection}</div>
                    </div>
                  </div>

                  {/* Garment Visual & Compact Monochrome Presentation */}
                  {modelImage && (
                    <div className="flex gap-4 p-3.5 bg-white rounded-xl border border-neutral-300 mb-5 items-center">
                      <div className="w-20 h-24 rounded-lg overflow-hidden border border-black flex-shrink-0 bg-neutral-100 relative">
                        <img src={modelImage} alt="Modèle" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-black text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase">
                          RÉF
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-black text-black uppercase">
                          {analysisResult?.category || 'Modèle Référence Confection'}
                        </div>
                        <p className="text-[10px] text-neutral-700 mt-1 leading-relaxed">
                          Confection soignée en atelier professionnel : patronage industriel, assemblage haute précision, surpiqûres de renfort et contrôle qualité avant livraison.
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-black" />
                            Qualité Contrôlée
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3 text-black" />
                            Prototype Validé
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items Quotation Table */}
                  <div className="mb-5 overflow-hidden rounded-lg border border-black">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black text-white text-[9px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 font-black">#</th>
                          <th className="py-2.5 px-3 font-black">Désignation / Article</th>
                          <th className="py-2.5 px-3 font-black">Tissu Recommandé</th>
                          <th className="py-2.5 px-3 font-black text-center whitespace-nowrap">Quantité</th>
                          <th className="py-2.5 px-3 font-black text-right whitespace-nowrap">P.U (MAD)</th>
                          <th className="py-2.5 px-3 font-black text-right whitespace-nowrap">Total (MAD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 text-[10px]">
                        {articles.map((art, idx) => (
                          <tr key={art.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                            <td className="py-2.5 px-3 font-bold text-neutral-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-black text-black">{art.name}</td>
                            <td className="py-2.5 px-3 text-neutral-700 font-medium">{art.fabricCommercial}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-black whitespace-nowrap tabular-nums">{art.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-800 whitespace-nowrap tabular-nums">{art.unitPrice} MAD</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-black whitespace-nowrap tabular-nums">
                              {((art.quantity || 0) * (art.unitPrice || 0)).toLocaleString()} MAD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Summary */}
                  <div className="flex justify-end mb-5">
                    <div className="w-64 space-y-1.5 text-right text-[11px]">
                      <div className="flex justify-between text-neutral-700">
                        <span className="font-bold">Sous-Total HT :</span>
                        <span className="font-mono font-black text-black">{totalHT.toLocaleString()} MAD</span>
                      </div>
                      {showTva ? (
                        <div className="flex justify-between text-neutral-700">
                          <span className="font-bold">TVA ({tvaRate}%) :</span>
                          <span className="font-mono font-black text-black">{totalTVA.toLocaleString()} MAD</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>Régime TVA :</span>
                          <span>Exonéré / Franchise</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-black text-sm font-black text-black bg-neutral-100 px-3 py-2 rounded-lg">
                        <span>NET À PAYER :</span>
                        <span className="text-base text-black font-mono font-black">
                          {totalTTC.toLocaleString()} MAD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions & Terms */}
                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-300 border-l-4 border-l-black mb-6 space-y-1 text-[10px] text-neutral-700">
                    <div><strong className="text-black">Délai de Confection :</strong> {delaiConfection}</div>
                    <div><strong className="text-black">Conditions :</strong> {conditions}</div>
                    <div><strong className="text-black">Validité du Devis :</strong> {validityDays} jours à compter de la date d'émission.</div>
                  </div>

                  {/* Signatures Box */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-300 text-[10px]">
                    <div className="border border-dashed border-neutral-400 rounded-lg p-3 h-24 flex flex-col justify-between">
                      <span className="font-black text-black uppercase text-[9px]">Cachet & Signature de l'Atelier :</span>
                      <span className="text-[9px] text-neutral-500 font-mono">{company.name || 'BEYA ATELIER'}</span>
                    </div>

                    <div className="border border-dashed border-neutral-400 rounded-lg p-3 h-24 flex flex-col justify-between text-right">
                      <span className="font-black text-black uppercase text-[9px]">Bon pour Accord & Commande :</span>
                      <span className="text-[9px] text-neutral-500">Date & Signature du Client</span>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-6 pt-3 border-t border-neutral-200 flex justify-between text-[8px] text-neutral-500 uppercase tracking-wider font-mono">
                    <span>Document officiel de chiffrage commercial · BEYA CREATIVE</span>
                    <span>Page {docMode === 'both' ? '2/3' : '1/1'}</span>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  PAGE 3: FICHE TECHNIQUE & GUIDE DES TAILLES (MONOCHROME)
                  ══════════════════════════════════════════════════════════════ */}
              {(docMode === 'fiche' || docMode === 'both') && (
                <div 
                  className="bg-white text-black rounded-xl shadow-2xl p-7 sm:p-9 w-full border border-neutral-300" 
                  style={{ pageBreakBefore: docMode === 'both' ? 'always' : 'auto' }}
                >
                  {/* Header Fiche Technique */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-5 mb-5 gap-4">
                    <div>
                      {(company.logoInvoice || company.logoUrl) ? (
                        <img src={company.logoInvoice || company.logoUrl} alt={company.name} className="h-10 object-contain mb-2 grayscale contrast-125" />
                      ) : (
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm">
                            B
                          </div>
                          <span className="text-base font-black tracking-tight text-black uppercase">
                            {company.name || 'BEYA ATELIER'}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-black">{company.subtitle || 'Atelier de Modélisme & Confection Textile'}</p>
                      <p className="text-[10px] text-neutral-600">{company.address || 'Zone Industrielle, Meknès'}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-3.5 py-1 bg-black text-white text-[10px] font-black rounded tracking-widest uppercase mb-2">
                        {isAr ? 'بطاقة المواصفات والمقاسات' : 'FICHE TECHNIQUE & TAILLES'}
                      </span>
                      <div className="text-sm font-black text-black font-mono">FT-{devisRef}</div>
                      <div className="text-[10px] text-neutral-600 mt-0.5">Date : {devisDate}</div>
                      <div className="text-[10px] text-neutral-600">Client : {clientName || 'Client Partenaire'}</div>
                    </div>
                  </div>

                  {/* Main Product Showcase Block */}
                  <div className="grid grid-cols-12 gap-5 mb-6 bg-neutral-50 p-4 rounded-xl border border-neutral-300">
                    <div className="col-span-4 flex justify-center">
                      {modelImage ? (
                        <div className="w-full h-52 rounded-xl overflow-hidden border border-black bg-white">
                          <img src={modelImage} alt="Modèle" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-52 rounded-xl bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold text-xs border border-neutral-300">
                          Photo Modèle
                        </div>
                      )}
                    </div>

                    <div className="col-span-8 space-y-3">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Désignation du Modèle :</span>
                        <h3 className="text-sm font-black text-black uppercase">{analysisResult?.category || 'Modèle Confection'}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2.5 bg-white rounded-lg border border-neutral-300">
                          <span className="text-[9px] font-bold text-neutral-500 block">Tissus Sélectionnés :</span>
                          <span className="font-black text-black">{articles.map(a => a.fabricCommercial).filter(Boolean).join(' + ') || 'Tissu Supérieur'}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-neutral-300">
                          <span className="text-[9px] font-bold text-neutral-500 block">Type de Coupe :</span>
                          <span className="font-black text-black">{analysisResult?.fit || 'Coupe Régulière / Standard'}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-neutral-300 text-[10px]">
                        <span className="text-[9px] font-bold text-neutral-500 block mb-1">Finitions & Confection Atelier :</span>
                        <p className="text-neutral-700 leading-relaxed">
                          • Assemblage haute précision par piqueuse plate et surjeteuse safety 5 fils.<br />
                          • Surpiqûres doubles aiguilles sur les zones de tension et poches.<br />
                          • Repassage vapeur professionnel et contrôle qualité avant mise sous pli individuelle.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Standard Size Guide Table */}
                  <div className="p-4 bg-white rounded-xl border border-neutral-300 mb-6">
                    <div className="text-[10px] font-black uppercase tracking-wider text-black mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-black" />
                        <span>Barème des Mensurations du Vêtement (En Centimètres) :</span>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-bold font-mono">Tolérance: +/- 1.5 cm</span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-black">
                      <table className="w-full text-center border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-black text-white font-black text-[9px] uppercase tracking-wider">
                            <th className="py-2 px-2 text-left">Point de Mesure</th>
                            <th className="py-2 px-2">S (36-38)</th>
                            <th className="py-2 px-2">M (38-40)</th>
                            <th className="py-2 px-2">L (42-44)</th>
                            <th className="py-2 px-2">XL (46)</th>
                            <th className="py-2 px-2">XXL (48)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-black bg-neutral-100">Tour de Poitrine</td>
                            <td className="py-2 px-2 font-mono">88 - 92 cm</td>
                            <td className="py-2 px-2 font-mono">94 - 98 cm</td>
                            <td className="py-2 px-2 font-mono">100 - 104 cm</td>
                            <td className="py-2 px-2 font-mono">106 - 110 cm</td>
                            <td className="py-2 px-2 font-mono">112 - 116 cm</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-black bg-neutral-100">Tour de Taille</td>
                            <td className="py-2 px-2 font-mono">70 - 74 cm</td>
                            <td className="py-2 px-2 font-mono">76 - 80 cm</td>
                            <td className="py-2 px-2 font-mono">82 - 86 cm</td>
                            <td className="py-2 px-2 font-mono">88 - 92 cm</td>
                            <td className="py-2 px-2 font-mono">94 - 98 cm</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-black bg-neutral-100">Tour de Bassin / Hanche</td>
                            <td className="py-2 px-2 font-mono">92 - 96 cm</td>
                            <td className="py-2 px-2 font-mono">98 - 102 cm</td>
                            <td className="py-2 px-2 font-mono">104 - 108 cm</td>
                            <td className="py-2 px-2 font-mono">110 - 114 cm</td>
                            <td className="py-2 px-2 font-mono">116 - 120 cm</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-black bg-neutral-100">Longueur Totale du Vêtement</td>
                            <td className="py-2 px-2 font-mono">68 - 70 cm</td>
                            <td className="py-2 px-2 font-mono">70 - 72 cm</td>
                            <td className="py-2 px-2 font-mono">72 - 74 cm</td>
                            <td className="py-2 px-2 font-mono">74 - 76 cm</td>
                            <td className="py-2 px-2 font-mono">76 - 78 cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Validation Agreement */}
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-300 border-l-4 border-l-black mb-6 text-[10px] text-neutral-700 leading-relaxed">
                    <strong className="text-black">Validation du Modèle :</strong> La signature de cette fiche technique atteste de la validation définitive des spécifications tissu, des matières et du barème des mensurations pour le lancement en confection industrielle.
                  </div>

                  {/* Signatures Box */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-300 text-[10px]">
                    <div className="border border-dashed border-neutral-400 rounded-lg p-3 h-24 flex flex-col justify-between">
                      <span className="font-black text-black uppercase text-[9px]">Validation Modéliste Atelier :</span>
                      <span className="text-[9px] text-neutral-500 font-mono">Conforme aux spécifications · BEYA</span>
                    </div>

                    <div className="border border-dashed border-neutral-400 rounded-lg p-3 h-24 flex flex-col justify-between text-right">
                      <span className="font-black text-black uppercase text-[9px]">Bon pour Coupe & Confection :</span>
                      <span className="text-[9px] text-neutral-500">Date & Signature du Client</span>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-6 pt-3 border-t border-neutral-200 flex justify-between text-[8px] text-neutral-500 uppercase tracking-wider font-mono">
                    <span>Fiche Technique & Barème Tailles · BEYA CREATIVE</span>
                    <span>Page {docMode === 'both' ? '3/3' : '1/1'}</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
