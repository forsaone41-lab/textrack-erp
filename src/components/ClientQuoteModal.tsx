import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Download, Send, MessageCircle, FileText, Check, Plus, Trash2, 
  Sparkles, DollarSign, Clock, ShieldCheck, Ruler, Building, Phone, MapPin, 
  Percent, Copy, CheckCircle2, ChevronRight, Layers, Tag, Eye
} from 'lucide-react';
import { loadCompanyProfile, saveRecord, genId, Facture } from '../types';
import { printElement } from '../utils/pdf';

export interface ClientQuoteArticle {
  id: string;
  name: string;
  fabricCommercial: string;
  unitPrice: number;
  quantity: number;
  baseCost?: number;
  notes?: string;
}

export interface ClientQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  modelImage: string | null;
  isAr: boolean;
  onSaved?: () => void;
  onNotify?: (title: string, message: string) => void;
}

export const ClientQuoteModal: React.FC<ClientQuoteModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  modelImage,
  isAr,
  onSaved,
  onNotify
}) => {
  const company = loadCompanyProfile();

  // ─── STATE ──────────────────────────────────────────────────────────
  const [docMode, setDocMode] = useState<'devis' | 'fiche' | 'both'>('devis');
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

  // ─── INITIALIZATION ON OPEN ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const dateToday = new Date().toISOString().split('T')[0];
    const refCode = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setDocMode('devis'); // Default to clean, un-cluttered 1-page Devis
    setDevisRef(refCode);
    setDevisDate(dateToday);
    setClientName(isAr ? 'الزبون / العلامة التجارية' : 'Client / Marque Partenaire');
    setClientCity(isAr ? 'الدار البيضاء، المغرب' : 'Casablanca, Maroc');
    setClientPhone('');
    setDelaiConfection(isAr ? '7 إلى 10 أيام عمل' : '7 à 10 jours ouvrés');
    setConditions(
      isAr
        ? 'تسبيق 50% عند المصادقة على النموذج الأولي (Prototype)، و50% عند التسليم النهائي. مراقبة الجودة مضمونة قبل التسليم.'
        : 'Acompte de 50% à la validation du prototype, solde à la livraison finale. Contrôle qualité unitaire garanti avant expédition.'
    );

    // Build articles from analysis
    if (analysisResult) {
      if (analysisResult.pieces && analysisResult.pieces.length > 0) {
        const loaded = analysisResult.pieces.map((p: any, idx: number) => {
          let cleanFabric = p.fabricSuggested || '';
          cleanFabric = cleanFabric
            .replace(/\(.*?\)/g, '')
            .replace(/درب عمر|القريعة|المسيرة|Derb Omar|Griaa/gi, '')
            .trim();
          if (!cleanFabric) {
            cleanFabric = isAr ? 'قماش ممتاز عالي الجودة' : 'Tissu Confection Supérieure';
          }

          const rawCost = parseFloat(String(p.costEstimate || '0').match(/[\d.]+/)?.[0] || '70') || 70;
          const sellingPrice = Math.max(20, Math.round((rawCost * 1.5) / 5) * 5);

          return {
            id: `art-${idx}-${Date.now()}`,
            name: p.name || (isAr ? `قطعة ${idx + 1}` : `Pièce ${idx + 1}`),
            fabricCommercial: cleanFabric,
            unitPrice: sellingPrice,
            baseCost: rawCost,
            quantity: 50,
            notes: p.fit || ''
          };
        });
        setArticles(loaded);
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
        const sellingPrice = Math.max(30, Math.round((rawCost * 1.6) / 5) * 5);

        setArticles([
          {
            id: `single-${Date.now()}`,
            name: analysisResult.category || (isAr ? 'موديل تفصيل راقي' : 'Modèle Confection'),
            fabricCommercial: cleanFabric,
            unitPrice: sellingPrice,
            baseCost: rawCost,
            quantity: 50,
            notes: analysisResult.fit || ''
          }
        ]);
      }
    }
  }, [isOpen, analysisResult, isAr]);

  if (!isOpen) return null;

  // ─── CALCULATIONS ───────────────────────────────────────────────────
  const totalHT = articles.reduce((sum, a) => sum + (Number(a.unitPrice) || 0) * (Number(a.quantity) || 0), 0);
  const totalTVA = showTva ? Math.round(totalHT * (tvaRate / 100)) : 0;
  const totalTTC = totalHT + totalTVA;
  const totalPiecesCount = articles.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);

  // ─── HANDLERS ───────────────────────────────────────────────────────
  const handleUpdateArticle = (id: string, field: keyof ClientQuoteArticle, value: any) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleApplyMargin = (marginPct: number) => {
    setActiveMargin(marginPct);
    setArticles(prev => prev.map(a => {
      const base = a.baseCost || a.unitPrice;
      const newPrice = Math.max(10, Math.round((base * (1 + marginPct / 100)) / 5) * 5);
      return { ...a, unitPrice: newPrice };
    }));
  };

  const handleApplyBulkQty = () => {
    if (bulkQty <= 0) return;
    setArticles(prev => prev.map(a => ({ ...a, quantity: bulkQty })));
  };

  const handleAddArticle = () => {
    setArticles(prev => [
      ...prev,
      {
        id: `extra-${Date.now()}`,
        name: isAr ? 'قطعة إضافية / إكسسوار' : 'Article Supplémentaire',
        fabricCommercial: isAr ? 'حسب الاختيار' : 'Au choix',
        unitPrice: 50,
        baseCost: 35,
        quantity: bulkQty || 50
      }
    ]);
  };

  const handleRemoveArticle = (id: string) => {
    if (articles.length <= 1) return;
    setArticles(prev => prev.filter(a => a.id !== id));
  };

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
      const newDevis: Facture = {
        id: genId(),
        numero: devisRef,
        client: clientName || (isAr ? 'زبون تجاري' : 'Client Partenaire'),
        montant: totalTTC,
        avance: 0,
        date: devisDate,
        echeance: new Date(Date.now() + validityDays * 24 * 3600 * 1000).toISOString().split('T')[0],
        statut: 'en_attente',
        typeDoc: 'devis',
        articles: articles.map(a => ({
          id: genId(),
          designation: `${a.name} [Tissu: ${a.fabricCommercial}]`,
          type: 'matiere',
          quantite: a.quantity,
          prixUnitaire: a.unitPrice,
          total: a.quantity * a.unitPrice
        }))
      };

      await saveRecord('factures', newDevis);
      if (onNotify) {
        onNotify(
          isAr ? 'تم الحفظ في Devis' : 'Enregistré dans Devis',
          isAr
            ? `تم حفظ عرض السعر (${devisRef}) في سجلات Devis بالـ ERP بنجاح!`
            : `Le devis (${devisRef}) a été enregistré dans le module Devis avec succès !`
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
    const text = articles.map(a => `${a.name} - ${a.fabricCommercial} | ${a.quantity} pcs x ${a.unitPrice} MAD = ${a.quantity * a.unitPrice} MAD`).join('\n');
    const full = `DEVIS ${devisRef} - ${clientName}\nDate: ${devisDate}\nTotal: ${totalTTC} MAD\n${text}\nDélai: ${delaiConfection}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  // ─── RENDER ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── TOP HEADER / TOOLBAR ── */}
        <div className={`p-4 md:p-5 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                  {isAr ? 'منشئ عرض السعر وملف الزبون الاحترافي (PDF Client)' : 'Générateur Fiche & Devis Client B2B'}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  B2B Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {isAr
                  ? 'فصل ورقة الدوڤي المالي على ورقة المقاسات والفيش تكنيك بوضوح تام'
                  : 'Séparation nette du Devis commercial et de la Fiche Technique / Mesures'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs transition-all shadow-md active:scale-95"
              title={isAr ? 'تحميل كـ PDF أو طباعة A4' : 'Télécharger en PDF ou Imprimer A4'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل PDF / طباعة' : 'Télécharger PDF / Imprimer'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black text-xs transition-all shadow-md active:scale-95"
              title={isAr ? 'إرسال العرض عبر واتساب' : 'Envoyer Devis sur WhatsApp'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handleSaveToDevis}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              title={isAr ? 'حفظ في قاعدة بيانات Devis' : 'Enregistrer dans le module Devis'}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? (isAr ? 'جارِ الحفظ...' : 'Sauvegarde...') : (isAr ? 'حفظ في Devis' : 'Enregistrer')}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
              title={isAr ? 'نسخ ملخص العرض' : 'Copier le résumé'}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── MODAL BODY: SPLIT VIEW (EDITOR vs PREVIEW) ── */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-950">
          
          {/* ── LEFT PANEL: LIVE CONTROLS & CUSTOMIZATION (5 cols) ── */}
          <div className="lg:col-span-5 p-4 md:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800 space-y-4 custom-scrollbar">
            
            {/* Document Mode Selector in Left Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
              <label className="block text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                {isAr ? 'نوع الوثيقة المراد تجهيزها للزبون:' : 'Type de document pour le client :'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDocMode('devis')}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all ${
                    docMode === 'devis'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isAr ? '📄 دوڤي فقط' : '📄 Devis Seul'}
                </button>
                <button
                  type="button"
                  onClick={() => setDocMode('fiche')}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all ${
                    docMode === 'fiche'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isAr ? '📐 مقاسات فقط' : '📐 Fiche Tailles'}
                </button>
                <button
                  type="button"
                  onClick={() => setDocMode('both')}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all ${
                    docMode === 'both'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isAr ? '📑 ملف كامل' : '📑 Pack 2 Pages'}
                </button>
              </div>
            </div>

            {/* Quick Margin Presets Banner */}
            <div className="p-3 bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-800/40 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{isAr ? 'معامل الربح السريع للمصنع' : 'Marge Rapide Atelier'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  {isAr ? 'إعادة حساب أسعار القطع فورا' : 'Recalcul automatique'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 50, 75, 100].map(m => (
                  <button
                    key={m}
                    onClick={() => handleApplyMargin(m)}
                    className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                      activeMargin === m
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    +{m}%
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Client Information */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-white border-b border-slate-800 pb-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>{isAr ? '1. معلومات الزبون والعرض' : '1. Coordonnées Client & Devis'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    {isAr ? 'اسم الزبون / الماركة' : 'Nom du Client / Marque'}
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Ex: Boutique Elegance / Marque X"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    {isAr ? 'رقم الهاتف (واتساب)' : 'Téléphone (WhatsApp)'}
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="0661000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    {isAr ? 'المدينة / العنوان' : 'Ville / Adresse'}
                  </label>
                  <input
                    type="text"
                    value={clientCity}
                    onChange={e => setClientCity(e.target.value)}
                    placeholder="Casablanca, Maroc"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    {isAr ? 'رقم المرجع (Devis N°)' : 'Référence Devis'}
                  </label>
                  <input
                    type="text"
                    value={devisRef}
                    onChange={e => setDevisRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Articles & Fabric Customization */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? '2. تخصيص الأثواب والأسعار للقطع' : '2. Pièces, Tissus & Tarification'}</span>
                </div>
                <button
                  onClick={handleAddArticle}
                  className="flex items-center gap-1 text-[10px] font-black text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAr ? 'إضافة قطعة' : 'Ajouter pièce'}</span>
                </button>
              </div>

              {/* Bulk Quantity Setter */}
              <div className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                  {isAr ? 'توحيد الكمية:' : 'Quantité groupée :'}
                </span>
                <input
                  type="number"
                  value={bulkQty}
                  onChange={e => setBulkQty(Number(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-white font-black"
                />
                <button
                  onClick={handleApplyBulkQty}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-[10px] font-black rounded-lg transition-all"
                >
                  {isAr ? 'تطبيق على الكل' : 'Appliquer'}
                </button>
              </div>

              {/* Articles List */}
              <div className="space-y-3">
                {articles.map((art, idx) => (
                  <div key={art.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={art.name}
                          onChange={e => handleUpdateArticle(art.id, 'name', e.target.value)}
                          placeholder="Nom de l'article"
                          className="bg-transparent font-black text-xs text-white focus:outline-none focus:border-b border-indigo-500 flex-1"
                        />
                      </div>
                      {articles.length > 1 && (
                        <button
                          onClick={() => handleRemoveArticle(art.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title={isAr ? 'حذف هذه القطعة' : 'Supprimer'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Fabric description editable by user */}
                    <div>
                      <label className="block text-[9px] font-black text-amber-400 uppercase mb-0.5">
                        {isAr ? 'اسم الثوب التجاري الظاهر للزبون (قابلة للتعديل):' : 'Tissu commercial proposé au client :'}
                      </label>
                      <input
                        type="text"
                        value={art.fabricCommercial}
                        onChange={e => handleUpdateArticle(art.id, 'fabricCommercial', e.target.value)}
                        placeholder="Ex: Coton Molleton 100% Gratté 320g - Haute Qualité"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">
                          {isAr ? 'الكمية' : 'Quantité'}
                        </label>
                        <input
                          type="number"
                          value={art.quantity}
                          onChange={e => handleUpdateArticle(art.id, 'quantity', Number(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-white font-black focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-emerald-400 uppercase mb-0.5">
                          {isAr ? 'ثمن البيع (درهم)' : 'Prix Vente (MAD)'}
                        </label>
                        <input
                          type="number"
                          value={art.unitPrice}
                          onChange={e => handleUpdateArticle(art.id, 'unitPrice', Number(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-emerald-900/60 rounded-lg px-2 py-1 text-xs text-center text-emerald-400 font-black focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">
                          {isAr ? 'الإجمالي' : 'Total HT'}
                        </label>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-white font-mono font-bold">
                          {((art.quantity || 0) * (art.unitPrice || 0)).toLocaleString()} DH
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Delivery Delays & Terms */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-white border-b border-slate-800 pb-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <span>{isAr ? '3. مدة الإنجاز والشروط' : '3. Délais & Conditions de Confection'}</span>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                  {isAr ? 'مدة الإنجاز المقدرة' : 'Délai estimé de fabrication'}
                </label>
                <input
                  type="text"
                  value={delaiConfection}
                  onChange={e => setDelaiConfection(e.target.value)}
                  placeholder="Ex: 7 à 10 jours ouvrés"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                  {isAr ? 'شروط الدفع والمصادقة على النموذج' : 'Conditions de règlement & Prototype'}
                </label>
                <textarea
                  rows={2}
                  value={conditions}
                  onChange={e => setConditions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium resize-none"
                />
              </div>

              {/* TVA Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showTva}
                    onChange={e => setShowTva(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                  />
                  <span>{isAr ? 'تطبيق الضريبة على القيمة المضافة (TVA 20%)' : 'Appliquer la TVA (20%)'}</span>
                </label>
              </div>
            </div>

          </div>

          {/* ── RIGHT PANEL: LIVE LUXURY A4 DOCUMENT PREVIEW (7 cols) ── */}
          <div className="lg:col-span-7 bg-slate-950 p-4 md:p-6 overflow-y-auto flex flex-col items-center custom-scrollbar">
            
            {/* Quick Document View Mode Selector Tab Bar */}
            <div className="w-full max-w-2xl mb-4 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-lg">
              <button
                type="button"
                onClick={() => setDocMode('devis')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  docMode === 'devis'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? '1. ورقة الدوڤي المالي فقط (Page 1)' : '1. Devis Chiffré Seul (Page 1)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDocMode('fiche')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  docMode === 'fiche'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{isAr ? '2. ورقة المقاسات فقط (Page 2)' : '2. Fiche Tailles Seule (Page 2)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDocMode('both')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  docMode === 'both'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? '3. الملف الكامل (صفحتين A4)' : '3. Dossier Complet (2 Pages)'}</span>
              </button>
            </div>

            {/* The printable A4 Container */}
            <div 
              id="beya-client-proposal-a4" 
              className="w-full max-w-2xl font-sans text-xs space-y-6"
            >
              
              {/* ══════════════════════════════════════════════════════════════
                  PAGE 1: LE DEVIS COMMERCIAL & ESTIMATIF PUR (1 PAGE PRO)
                  ══════════════════════════════════════════════════════════════ */}
              {(docMode === 'devis' || docMode === 'both') && (
                <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 w-full border border-slate-200" style={{ minHeight: '800px' }}>
                  {/* Document Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                    <div>
                      {(company.logoInvoice || company.logoUrl) ? (
                        <img src={company.logoInvoice || company.logoUrl} alt={company.name} className="h-10 object-contain mb-2" />
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                            B
                          </div>
                          <span className="text-base font-black tracking-tight text-slate-900 uppercase">
                            {company.name || 'BEYA ATELIER'}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-slate-600">{company.subtitle || 'Atelier de Modélisme & Confection Textile'}</p>
                      <p className="text-[10px] text-slate-500">{company.address || 'Casablanca, Maroc'}</p>
                      <p className="text-[10px] text-slate-500">Tél: {company.phone || '0661000000'} | {company.email || 'contact@beya.ma'}</p>
                      {(company.ice || company.rc) && (
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {company.ice ? `ICE: ${company.ice}` : ''} {company.rc ? `| RC: ${company.rc}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-md tracking-wider uppercase mb-2">
                        {isAr ? 'عرض سعر تجاري' : 'DEVIS ESTIMATIF'}
                      </span>
                      <div className="text-sm font-black text-slate-900 font-mono">{devisRef}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Date: {devisDate}</div>
                      <div className="text-[10px] text-slate-500">Validité: {validityDays} jours</div>
                    </div>
                  </div>

                  {/* Client & Reference Info Box */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Destinataire / Client :</div>
                      <div className="font-black text-slate-900 text-xs">{clientName || 'Client Partenaire'}</div>
                      {clientPhone && <div className="text-[10px] text-slate-600 font-mono">{clientPhone}</div>}
                      {clientCity && <div className="text-[10px] text-slate-500">{clientCity}</div>}
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Projet & Modèle :</div>
                      <div className="font-black text-indigo-700 text-xs">{analysisResult?.category || 'Ensemble Confection'}</div>
                      <div className="text-[10px] text-slate-600 font-bold">{totalPiecesCount} pièces au total</div>
                      <div className="text-[10px] text-emerald-700 font-bold">{delaiConfection}</div>
                    </div>
                  </div>

                  {/* Garment Visual & Compact Presentation */}
                  {modelImage && (
                    <div className="flex gap-4 p-3 bg-white rounded-xl border border-slate-200 mb-5 items-center">
                      <div className="w-18 h-22 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 relative">
                        <img src={modelImage} alt="Modèle" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[7px] font-black px-1 py-0.2 rounded">
                          RÉF
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-black text-slate-900 uppercase">
                          {analysisResult?.category || 'Modèle Référence Confection'}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                          Confection soignée en atelier professionnel : patronage industriel assisté par IA, finitions soignées, surpiqûres de renfort et repassage vapeur sous pli.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            Qualité Contrôlée
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Échantillon Prototype Validé
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items Quotation Table */}
                  <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 font-black">#</th>
                          <th className="py-2.5 px-3 font-black">Désignation / Article</th>
                          <th className="py-2.5 px-3 font-black">Tissu Recommandé</th>
                          <th className="py-2.5 px-3 font-black text-center">Quantité</th>
                          <th className="py-2.5 px-3 font-black text-right">P.U (MAD)</th>
                          <th className="py-2.5 px-3 font-black text-right">Total (MAD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[10px]">
                        {articles.map((art, idx) => (
                          <tr key={art.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-black text-slate-900">{art.name}</td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">{art.fabricCommercial}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">{art.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">{art.unitPrice}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                              {((art.quantity || 0) * (art.unitPrice || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Summary */}
                  <div className="flex justify-end mb-5">
                    <div className="w-64 space-y-1.5 text-right text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-bold">Sous-Total HT :</span>
                        <span className="font-mono font-black text-slate-900">{totalHT.toLocaleString()} MAD</span>
                      </div>
                      {showTva ? (
                        <div className="flex justify-between text-slate-600">
                          <span className="font-bold">TVA ({tvaRate}%) :</span>
                          <span className="font-mono font-black text-slate-900">{totalTVA.toLocaleString()} MAD</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Régime TVA :</span>
                          <span>Exonéré / Franchise</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                        <span>NET À PAYER :</span>
                        <span className="text-base text-emerald-700 font-mono font-black">
                          {totalTTC.toLocaleString()} MAD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions & Terms */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-6 space-y-1 text-[10px] text-slate-600">
                    <div><strong>Délai de Confection :</strong> {delaiConfection}</div>
                    <div><strong>Conditions :</strong> {conditions}</div>
                    <div><strong>Validité du Devis :</strong> {validityDays} jours à compter de la date d'émission.</div>
                  </div>

                  {/* Signatures & Seal Box */}
                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-[10px]">
                    <div className="border border-dashed border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between">
                      <span className="font-bold text-slate-500">Cachet & Signature de l'Atelier :</span>
                      <span className="text-[9px] text-slate-400 font-mono">{company.name || 'BEYA ATELIER'}</span>
                    </div>

                    <div className="border border-dashed border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between text-right">
                      <span className="font-bold text-slate-500">Bon pour Accord & Commande :</span>
                      <span className="text-[9px] text-slate-400">Date & Signature du Client</span>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between text-[8px] text-slate-400">
                    <span>Document officiel de chiffrage commercial · BEYA TACTICAL HUD ERP</span>
                    <span>Page 1/1</span>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  PAGE 2: LA FICHE TECHNIQUE & GUIDE DES TAILLES CLIENT
                  ══════════════════════════════════════════════════════════════ */}
              {(docMode === 'fiche' || docMode === 'both') && (
                <div 
                  className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 w-full border border-slate-200" 
                  style={{ minHeight: '800px', pageBreakBefore: docMode === 'both' ? 'always' : 'auto' }}
                >
                  {/* Header Fiche Technique */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                    <div>
                      {(company.logoInvoice || company.logoUrl) ? (
                        <img src={company.logoInvoice || company.logoUrl} alt={company.name} className="h-10 object-contain mb-2" />
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                            B
                          </div>
                          <span className="text-base font-black tracking-tight text-slate-900 uppercase">
                            {company.name || 'BEYA ATELIER'}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-slate-600">{company.subtitle || 'Atelier de Modélisme & Confection Textile'}</p>
                      <p className="text-[10px] text-slate-500">{company.address || 'Casablanca, Maroc'}</p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-indigo-700 text-white text-[10px] font-black rounded-md tracking-wider uppercase mb-2">
                        {isAr ? 'بطاقة المواصفات والمقاسات' : 'FICHE TECHNIQUE & TAILLES'}
                      </span>
                      <div className="text-sm font-black text-slate-900 font-mono">FT-{devisRef}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Date: {devisDate}</div>
                      <div className="text-[10px] text-slate-500">Client: {clientName || 'Client Partenaire'}</div>
                    </div>
                  </div>

                  {/* Main Product Showcase Block */}
                  <div className="grid grid-cols-12 gap-5 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="col-span-4 flex justify-center">
                      {modelImage ? (
                        <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                          <img src={modelImage} alt="Modèle" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-52 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                          Photo Modèle
                        </div>
                      )}
                    </div>

                    <div className="col-span-8 space-y-3">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">Désignation du Modèle :</span>
                        <h3 className="text-sm font-black text-slate-900 uppercase">{analysisResult?.category || 'Modèle Confection'}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 block">Tissus Sélectionnés :</span>
                          <span className="font-black text-slate-800">{articles.map(a => a.fabricCommercial).filter(Boolean).join(' + ') || 'Tissu Supérieur'}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 block">Type de Coupe :</span>
                          <span className="font-black text-slate-800">{analysisResult?.fit || 'Coupe Régulière / Standard'}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[10px]">
                        <span className="text-[9px] font-bold text-slate-400 block mb-1">Finitions & Confection Atelier :</span>
                        <p className="text-slate-600 leading-relaxed">
                          • Assemblage haute précision par piqueuse plate et surjeteuse safety 5 fils.<br />
                          • Surpiqûres doubles aiguilles sur les zones de tension et poches.<br />
                          • Repassage vapeur professionnel et contrôle qualité avant mise sous pli individuelle.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Standard Size Guide Table */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 mb-6 shadow-xs">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Barème des Mensurations du Vêtement (En Centimètres) :</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">Tolérance: +/- 1.5 cm</span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-center border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider">
                            <th className="py-2 px-2 text-left">Point de Mesure</th>
                            <th className="py-2 px-2">S (36-38)</th>
                            <th className="py-2 px-2">M (38-40)</th>
                            <th className="py-2 px-2">L (42-44)</th>
                            <th className="py-2 px-2">XL (46)</th>
                            <th className="py-2 px-2">XXL (48)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-slate-700 bg-slate-50">Tour de Poitrine</td>
                            <td className="py-2 px-2 font-mono">88 - 92 cm</td>
                            <td className="py-2 px-2 font-mono">94 - 98 cm</td>
                            <td className="py-2 px-2 font-mono">100 - 104 cm</td>
                            <td className="py-2 px-2 font-mono">106 - 110 cm</td>
                            <td className="py-2 px-2 font-mono">112 - 116 cm</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-slate-700 bg-slate-50">Tour de Taille</td>
                            <td className="py-2 px-2 font-mono">70 - 74 cm</td>
                            <td className="py-2 px-2 font-mono">76 - 80 cm</td>
                            <td className="py-2 px-2 font-mono">82 - 86 cm</td>
                            <td className="py-2 px-2 font-mono">88 - 92 cm</td>
                            <td className="py-2 px-2 font-mono">94 - 98 cm</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-slate-700 bg-slate-50">Tour de Bassin / Hanche</td>
                            <td className="py-2 px-2 font-mono">92 - 96 cm</td>
                            <td className="py-2 px-2 font-mono">98 - 102 cm</td>
                            <td className="py-2 px-2 font-mono">104 - 108 cm</td>
                            <td className="py-2 px-2 font-mono">110 - 114 cm</td>
                            <td className="py-2 px-2 font-mono">116 - 120 cm</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2 text-left font-bold text-slate-700 bg-slate-50">Longueur Totale du Vêtement</td>
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
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-[10px] text-slate-600 leading-relaxed">
                    <strong>Validation du Modèle :</strong> La signature de cette fiche technique atteste de la validation définitive des spécifications tissu, des matières et du barème des mensurations pour le lancement en confection industrielle.
                  </div>

                  {/* Signatures & Seal Box */}
                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-[10px]">
                    <div className="border border-dashed border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between">
                      <span className="font-bold text-slate-500">Validation Modéliste Atelier :</span>
                      <span className="text-[9px] text-slate-400 font-mono">Conforme aux spécifications · BEYA</span>
                    </div>

                    <div className="border border-dashed border-slate-300 rounded-xl p-3 h-24 flex flex-col justify-between text-right">
                      <span className="font-bold text-slate-500">Bon pour Coupe & Confection :</span>
                      <span className="text-[9px] text-slate-400">Date & Signature du Client</span>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between text-[8px] text-slate-400">
                    <span>Fiche Technique & Barème Tailles · BEYA TACTICAL HUD ERP</span>
                    <span>Page {docMode === 'both' ? '2/2' : '1/1'}</span>
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
