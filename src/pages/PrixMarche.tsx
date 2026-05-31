import { useState, useEffect } from 'react';
import { TrendingUp, Edit2, Save, X, Calculator, RefreshCw, Sparkles, Info, Percent } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { loadData, Commande } from '../types';

interface PrixTier { min: number; max: number; }
interface PrixItem {
  id: string; categorie: string; emoji: string;
  souk: PrixTier; moyen: PrixTier; export: PrixTier;
  keywords: string[]; notes?: string;
}

const DEFAULT_PRIX: PrixItem[] = [
  { id:'tshirt',   categorie:'T-Shirt / Polo',         emoji:'👕', souk:{min:12,max:20}, moyen:{min:25,max:40}, export:{min:45,max:80},  keywords:['t-shirt','tshirt','polo','قميص','تيشيرت'] },
  { id:'pantalon', categorie:'Pantalon / Jean',         emoji:'👖', souk:{min:20,max:35}, moyen:{min:40,max:70}, export:{min:80,max:150}, keywords:['pantalon','jeans','jean','سروال'] },
  { id:'robe',     categorie:'Robe / Jilbab',           emoji:'👗', souk:{min:25,max:45}, moyen:{min:50,max:90}, export:{min:100,max:200},keywords:['robe','jilbab','قفطان','كفتان','جلباب'] },
  { id:'veste',    categorie:'Veste / Blazer / Manteau',emoji:'🧥', souk:{min:60,max:100},moyen:{min:120,max:200},export:{min:220,max:500},keywords:['veste','blazer','manteau','جاكيت'] },
  { id:'chemise',  categorie:'Chemise',                 emoji:'👔', souk:{min:18,max:30}, moyen:{min:35,max:60}, export:{min:65,max:130}, keywords:['chemise','قميص'] },
  { id:'short',    categorie:'Short / Bermuda',         emoji:'🩳', souk:{min:15,max:25}, moyen:{min:28,max:50}, export:{min:55,max:100}, keywords:['short','bermuda','شورت'] },
  { id:'djellaba', categorie:'Djellaba / Caftan',       emoji:'🥻', souk:{min:40,max:80}, moyen:{min:90,max:180},export:{min:200,max:500},keywords:['djellaba','caftan','قفطان','جلابة'] },
  { id:'sportswear',categorie:'Sportswear / Survêt',   emoji:'🏃', souk:{min:20,max:35}, moyen:{min:40,max:70}, export:{min:75,max:140}, keywords:['sport','survêt','jogging'] },
];

const STORAGE_KEY = 'beya_prix_marche';
const UPDATED_KEY = 'beya_prix_updated';

function loadPrix(): PrixItem[] {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : DEFAULT_PRIX; } catch { return DEFAULT_PRIX; }
}
function savePrix(data: PrixItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(UPDATED_KEY, new Date().toISOString());
}

export default function PrixMarche() {
  const { isAr } = useLang();
  const [prix, setPrix] = useState<PrixItem[]>(loadPrix);
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<PrixItem|null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(localStorage.getItem(UPDATED_KEY)||'');
  const [showCalc, setShowCalc] = useState(true);
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    loadData<Commande>('commandes').then(setCommandes);
  }, []);

  // Unique model names from existing orders
  const modelSuggestions = Array.from(new Set(commandes.map(c => c.modele).filter(Boolean))).sort();

  // Calculator state
  const [calcModel, setCalcModel] = useState('');
  const [calcQty, setCalcQty] = useState(100);
  const [calcTier, setCalcTier] = useState<'souk'|'moyen'|'export'>('moyen');
  const [calcResult, setCalcResult] = useState<{
    item: PrixItem;
    unitMin: number; unitMax: number;
    totalMin: number; totalMax: number;
    discount: number;
    marginMin: number; marginMax: number;
    sellingMin: number; sellingMax: number;
  }|null>(null);

  function startEdit(item: PrixItem) {
    setEditId(item.id);
    setEditForm({...item});
  }
  function cancelEdit() { setEditId(null); setEditForm(null); }
  function saveEdit() {
    if (!editForm) return;
    const updated = prix.map(p => p.id === editForm.id ? editForm : p);
    setPrix(updated);
    savePrix(updated);
    setLastUpdated(new Date().toISOString());
    setEditId(null); setEditForm(null);
  }
  function resetToDefault() {
    if (!confirm(isAr ? 'إعادة تعيين كل الأسعار للقيم الافتراضية؟' : 'Réinitialiser tous les prix aux valeurs par défaut ?')) return;
    setPrix(DEFAULT_PRIX);
    savePrix(DEFAULT_PRIX);
    setLastUpdated(new Date().toISOString());
  }

  function calcDevis() {
    const m = calcModel.toLowerCase();
    const matched = prix.find(p => p.keywords.some(k => m.includes(k)));
    if (!matched) { setCalcResult(null); return; }
    const tier = matched[calcTier];

    // Quantity discount: -5% per 500 pcs bracket, max -30%
    const discount = Math.min(30, Math.floor(calcQty / 500) * 5);
    const factor = 1 - discount / 100;
    const unitMin = Math.round(tier.min * factor * 10) / 10;
    const unitMax = Math.round(tier.max * factor * 10) / 10;

    // Suggested margin: based on tier and quantity
    const baseMargin = calcTier === 'export' ? 35 : calcTier === 'moyen' ? 25 : 15;
    const qtyBonus = calcQty >= 1000 ? 5 : calcQty >= 500 ? 3 : 0;
    const marginMin = baseMargin;
    const marginMax = baseMargin + qtyBonus + 10;

    // Suggested selling price (façonnage + margin)
    const sellingMin = Math.round(unitMin * (1 + marginMin / 100));
    const sellingMax = Math.round(unitMax * (1 + marginMax / 100));

    setCalcResult({
      item: matched,
      unitMin, unitMax,
      totalMin: Math.round(unitMin * calcQty),
      totalMax: Math.round(unitMax * calcQty),
      discount,
      marginMin, marginMax,
      sellingMin, sellingMax,
    });
  }

  const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('fr-MA',{day:'2-digit',month:'long',year:'numeric'}) : '—';

  const tierColors = {
    souk:   { bg:'bg-slate-50',   border:'border-slate-200',  text:'text-slate-700',   badge:'bg-slate-100 text-slate-600',   label: isAr?'سوق شعبي':'Souk / Basique' },
    moyen:  { bg:'bg-amber-50',   border:'border-amber-200',  text:'text-amber-700',   badge:'bg-amber-100 text-amber-700',   label: isAr?'جودة متوسطة':'Qualité Moyenne' },
    export: { bg:'bg-emerald-50', border:'border-emerald-200',text:'text-emerald-700', badge:'bg-emerald-100 text-emerald-700',label: isAr?'جودة عالية (تصدير)':'Qualité Export' },
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">

      {/* Header */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl -ml-30 -mb-30 pointer-events-none" />
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 ${isAr?'flex-row-reverse text-right':''}`}>
          <div className={`flex items-center gap-5 ${isAr?'flex-row-reverse':''}`}>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-amber-500/20 flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {isAr ? 'أسعار الفاصون بالمغرب' : 'Prix Façonnage Maroc'}
              </h1>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest opacity-80 mt-1">
                2024 – 2025 · {isAr?'مرجع قابل للتعديل':'Référentiel modifiable'}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 flex-wrap ${isAr?'flex-row-reverse':''}`}>
            {lastUpdated && (
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                {isAr?'آخر تحديث:':'Màj:'} {fmtDate(lastUpdated)}
              </span>
            )}
            <button onClick={resetToDefault} className="flex items-center gap-2 bg-white/5 text-slate-300 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> {isAr?'إعادة تعيين':'Réinitialiser'}
            </button>
            <button onClick={()=>setShowCalc(!showCalc)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all">
              <Calculator className="w-3.5 h-3.5" /> {isAr?'حاسبة الديفيس':'Calculateur Devis'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-blue-700 leading-relaxed">
          {isAr
            ? 'هاد الأسعار تقريبية مبنية على السوق المغربي لسنة 2024-2025. كتقدر تعدلها في أي وقت بالضغط على أيقونة القلم. الأسعار ديالك محفوظة محلياً.'
            : 'Ces prix sont indicatifs, basés sur le marché marocain 2024-2025. Vous pouvez les modifier à tout moment en cliquant sur l\'icône crayon. Vos prix sont sauvegardés localement.'
          }
        </p>
      </div>

      {/* Devis Calculator */}
      {showCalc && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            {isAr ? 'حاسبة اقتراح السعر' : 'Calculateur de Prix Devis'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isAr?'نوع الموديل':'Type de modèle'}</label>
              <input
                list="model-suggestions"
                value={calcModel}
                onChange={e=>{ setCalcModel(e.target.value); setCalcResult(null); }}
                placeholder={isAr?'مثال: Robe longue, Pantalon...':'Ex: Robe longue, T-shirt...'}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none focus:border-amber-400 transition-all"
              />
              <datalist id="model-suggestions">
                {modelSuggestions.map(m => <option key={m} value={m} />)}
              </datalist>
              {modelSuggestions.length > 0 && (
                <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  ✨ {isAr?`${modelSuggestions.length} موديل موجود في طلبياتك`:`${modelSuggestions.length} modèles depuis vos commandes`}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isAr?'الكمية (قطعة)':'Quantité (pcs)'}</label>
              <input
                type="number" min={1}
                value={calcQty}
                onChange={e=>setCalcQty(parseInt(e.target.value)||1)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none focus:border-amber-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{isAr?'مستوى الجودة':'Niveau qualité'}</label>
              <select
                value={calcTier}
                onChange={e=>setCalcTier(e.target.value as 'souk'|'moyen'|'export')}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none focus:border-amber-400 transition-all"
              >
                <option value="souk">{tierColors.souk.label}</option>
                <option value="moyen">{tierColors.moyen.label}</option>
                <option value="export">{tierColors.export.label}</option>
              </select>
            </div>
          </div>
          <button onClick={calcDevis} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
            <Calculator className="w-4 h-4 text-amber-400" />
            {isAr?'احسب السعر المقترح':'Calculer le prix suggéré'}
          </button>

          {calcResult && (
            <div className="mt-6 space-y-4">
              {/* Main result card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                <div className={`flex items-center justify-between mb-4 ${isAr?'flex-row-reverse':''}`}>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr?'موديل:':'Modèle :'}</p>
                    <p className="text-sm font-black">{calcResult.item.emoji} {calcResult.item.categorie}</p>
                  </div>
                  {calcResult.discount > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      🎁 -{calcResult.discount}% {isAr?'تخفيض الكمية':'remise quantité'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr?'السعر/قطعة':'Prix/pcs'}</p>
                    <p className="text-xl font-black text-amber-400">{calcResult.unitMin}–{calcResult.unitMax} <span className="text-xs">MAD</span></p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr?`الإجمالي (${calcQty} قطعة)`:`Total (${calcQty} pcs)`}</p>
                    <p className="text-xl font-black text-white">{calcResult.totalMin.toLocaleString()}–{calcResult.totalMax.toLocaleString()} <span className="text-xs text-amber-400">MAD</span></p>
                  </div>
                </div>

                <p className="text-[9px] font-bold text-slate-500 uppercase">* {isAr?'فاصون فقط، بلا قماش':'Façonnage uniquement, hors tissu'}</p>
              </div>

              {/* Margin suggestion card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className={`flex items-center gap-3 mb-4 ${isAr?'flex-row-reverse':''}`}>
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Percent className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">{isAr?'نسبة الربح المقترحة':'Marge bénéficiaire suggérée'}</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{isAr?'على أساس الجودة والكمية':'Basée sur qualité et quantité'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-white rounded-xl p-4 border border-indigo-100 text-center">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{isAr?'هامش الربح':'Marge conseillée'}</p>
                    <p className="text-2xl font-black text-indigo-700">{calcResult.marginMin}–{calcResult.marginMax}%</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div className="flex-1 bg-indigo-600 rounded-xl p-4 border border-indigo-700 text-center">
                    <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">{isAr?'سعر البيع المقترح':'Prix vente suggéré'}</p>
                    <p className="text-2xl font-black text-white">{calcResult.sellingMin}–{calcResult.sellingMax} <span className="text-xs">MAD</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { pct: calcResult.marginMin,     label: isAr?'هامش أدنى':'Marge min' },
                    { pct: Math.round((calcResult.marginMin+calcResult.marginMax)/2), label: isAr?'هامش متوسط':'Marge moy.' },
                    { pct: calcResult.marginMax,     label: isAr?'هامش أعلى':'Marge max' },
                  ].map((row,i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-indigo-100 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{row.label}</p>
                      <p className="text-sm font-black text-indigo-700">{row.pct}%</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                        {Math.round(calcResult.unitMin*(1+row.pct/100))}–{Math.round(calcResult.unitMax*(1+row.pct/100))} MAD
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {calcModel && !calcResult && (
            <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 text-xs font-bold text-red-600">
              {isAr?'⚠️ ما قدرناش نتعرف على نوع الموديل. جرب: Robe, Pantalon, T-shirt...':'⚠️ Modèle non reconnu. Essayez: Robe, Pantalon, T-shirt...'}
            </div>
          )}
        </div>
      )}

      {/* Pricing Table */}
      <div className="space-y-4">
        <div className={`flex items-center justify-between ${isAr?'flex-row-reverse':''}`}>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {isAr?'جدول الأسعار المرجعية':'Tableau des Prix de Référence'}
          </h2>
          {/* Legend */}
          <div className={`flex items-center gap-2 flex-wrap ${isAr?'flex-row-reverse':''}`}>
            {(['souk','moyen','export'] as const).map(t => (
              <span key={t} className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${tierColors[t].badge} ${tierColors[t].border}`}>
                {tierColors[t].label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">{isAr?'النوع':'Type'}</th>
                  <th className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 py-4 bg-slate-100/50">{isAr?'سوق شعبي':'Souk / Basique'}</th>
                  <th className="text-center text-[9px] font-black text-amber-600 uppercase tracking-widest px-4 py-4 bg-amber-50/50">{isAr?'جودة متوسطة':'Qualité Moyenne'}</th>
                  <th className="text-center text-[9px] font-black text-emerald-600 uppercase tracking-widest px-4 py-4 bg-emerald-50/50">{isAr?'جودة تصدير':'Qualité Export'}</th>
                  <th className="px-4 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {prix.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {editId === item.id && editForm ? (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{editForm.emoji}</span>
                            <input
                              value={editForm.categorie}
                              onChange={e=>setEditForm({...editForm, categorie:e.target.value})}
                              className="text-sm font-black text-slate-800 bg-slate-100 rounded-lg px-2 py-1 outline-none w-40"
                            />
                          </div>
                        </td>
                        {(['souk','moyen','export'] as const).map(tier=>(
                          <td key={tier} className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input type="number" value={editForm[tier].min}
                                onChange={e=>setEditForm({...editForm,[tier]:{...editForm[tier],min:+e.target.value}})}
                                className="w-16 text-center text-xs font-black bg-slate-100 rounded-lg px-1 py-1 outline-none"
                              />
                              <span className="text-slate-300 text-xs">–</span>
                              <input type="number" value={editForm[tier].max}
                                onChange={e=>setEditForm({...editForm,[tier]:{...editForm[tier],max:+e.target.value}})}
                                className="w-16 text-center text-xs font-black bg-slate-100 rounded-lg px-1 py-1 outline-none"
                              />
                            </div>
                            <p className="text-[8px] text-slate-400 mt-0.5">MAD/pcs</p>
                          </td>
                        ))}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={saveEdit} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.emoji}</span>
                            <p className="text-sm font-black text-slate-800">{item.categorie}</p>
                          </div>
                        </td>
                        {(['souk','moyen','export'] as const).map(tier=>(
                          <td key={tier} className={`px-4 py-4 text-center ${tier==='souk'?'bg-slate-50/30':tier==='moyen'?'bg-amber-50/20':'bg-emerald-50/20'}`}>
                            <span className={`text-sm font-black ${tierColors[tier].text}`}>
                              {item[tier].min} – {item[tier].max}
                            </span>
                            <p className="text-[9px] text-slate-400 font-bold">MAD/pcs</p>
                          </td>
                        ))}
                        <td className="px-4 py-4">
                          <button onClick={()=>startEdit(item)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          {isAr?'⚠️ ملاحظات مهمة':'⚠️ Notes importantes'}
        </p>
        <ul className="space-y-1.5">
          {(isAr ? [
            'الأسعار فاصون فقط — بلا قماش ولا أكسسوارات',
            'المصانع الكبيرة في كازا كتشتغل من 500 قطعة فما فوق',
            'الكميات الكبيرة (+1000 قطعة) كتعطي سعر أرخص بـ 15-30%',
            'AMITH كتوفر معلومات رسمية عن السوق المغربي',
          ] : [
            'Prix façonnage uniquement — tissu et accessoires en sus',
            'Les grandes usines de Casa travaillent à partir de 500 pcs',
            'Les grandes quantités (+1000 pcs) réduisent le prix de 15-30%',
            'L\'AMITH fournit des données officielles sur le marché marocain',
          ]).map((note,i)=>(
            <li key={i} className="text-xs text-slate-500 font-semibold flex items-start gap-2">
              <span className="text-slate-300 mt-0.5">•</span> {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
