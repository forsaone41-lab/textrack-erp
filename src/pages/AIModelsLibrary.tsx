import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, FileText, Download, Trash2, Sparkles, FolderHeart, MessageSquare, 
  Scissors, Eye, Clock, X, Search, Layers, ExternalLink, Printer, Info, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadData, deleteRecord, FicheTechnique } from '../types';
import { useLang } from '../contexts/LangContext';
import { printFicheTechnique } from '../utils/print';
import { getFabricInfo } from './AISpace';
import { getGarmentTechnicalBreakdown, PosteTravail } from '../lib/atelierAi';

export default function AIModelsLibrary() {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const [models, setModels] = useState<FicheTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedGammeModel, setSelectedGammeModel] = useState<FicheTechnique | null>(null);
  const [selectedDetailModel, setSelectedDetailModel] = useState<FicheTechnique | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      // Read all fiches and include any expert suggestions, AI analyses, or fiches with aiNotes
      const data = await loadData<FicheTechnique>('fiches');
      const filtered = (data || []).filter(f => 
        f.client === 'Suggestion Expert' ||
        f.client === 'اقتراح خبير BEYA' ||
        f.client === 'BEYA Expert' ||
        (f.client && f.client.toLowerCase().includes('expert')) ||
        (f.client && f.client.includes('خبير')) ||
        (f.client && f.client.includes('اقتراح')) ||
        Boolean(f.aiNotes)
      );
      setModels(filtered);
    } catch (err) {
      console.error('Failed to load AI models:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeModel = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الموديل؟' : 'Voulez-vous vraiment supprimer ce modèle ?')) {
      await deleteRecord('fiches', id);
      setModels(prev => prev.filter(m => m.id !== id));
      if (selectedGammeModel?.id === id) setSelectedGammeModel(null);
      if (selectedDetailModel?.id === id) setSelectedDetailModel(null);
    }
  };

  // Helper to extract or generate the Gamme de Montage for any model
  const extractGamme = (m: FicheTechnique): {
    postes: PosteTravail[];
    totalMin: number;
    totalSec: number;
    categorie: string;
  } => {
    // 1. Try to extract from GAMME_JSON in aiNotes if present
    if (m.aiNotes) {
      const jsonMatch = m.aiNotes.match(/<<<GAMME_JSON:([\s\S]*?)>>>/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          if (parsed.postes && Array.isArray(parsed.postes) && parsed.postes.length > 0) {
            const postes: PosteTravail[] = parsed.postes.map((p: any) => ({
              nomAr: p.nomAr || p.nomFr || 'عملية خياطة',
              nomFr: p.nomFr || p.nomAr || 'Opération couture',
              machine: p.machine || 'Piqueuse Plate',
              tempsMin: Math.max(0.1, Number(parseFloat(String(p.tempsMin || 1)).toFixed(2))),
              roleOuvrier: p.roleOuvrier || 'عاملة خياطة'
            }));
            const totalMin = Number(postes.reduce((s, p) => s + (p.tempsMin || 0), 0).toFixed(2));
            return {
              postes,
              totalMin,
              totalSec: Math.round(totalMin * 60),
              categorie: parsed.modelName || m.modele
            };
          }
        } catch (_) {}
      }

      // 2. Try to parse formatted text from aiNotes (e.g. "1. تجميع الأكتاف — [الآلة: Surjeteuse 4 fils] — ⏱️ 0.8 د")
      const regex = /(\d+)\.\s*([^\n—\-–]+)[—\-–]\s*\[(?:الآلة|Machine):\s*([^\]]+)\][—\-–]?\s*(?:⏱️)?\s*([0-9.,]+)\s*(?:د|min)/gi;
      const foundPostes: PosteTravail[] = [];
      let match;
      while ((match = regex.exec(m.aiNotes)) !== null) {
        const nom = match[2].trim();
        const machine = match[3].trim();
        const tMin = parseFloat(match[4].replace(',', '.')) || 1;
        foundPostes.push({
          nomAr: nom,
          nomFr: nom,
          machine,
          tempsMin: Math.max(0.1, Number(tMin.toFixed(2))),
          roleOuvrier: 'عاملة خياطة'
        });
      }
      if (foundPostes.length > 0) {
        const totalMin = Number(foundPostes.reduce((s, p) => s + (p.tempsMin || 0), 0).toFixed(2));
        return {
          postes: foundPostes,
          totalMin,
          totalSec: Math.round(totalMin * 60),
          categorie: m.modele
        };
      }
    }

    // 3. Fallback to expert technical breakdown based on model name, type, and description
    const searchCtx = `${m.modele || ''} ${m.type || ''} ${m.description || ''} ${m.tissuRecommande || ''}`;
    const breakdown = getGarmentTechnicalBreakdown(searchCtx, m.tissuConsommation);
    const totalMin = Number(breakdown.postesTravail.reduce((s, p) => s + (p.tempsMin || 0), 0).toFixed(2));
    return {
      postes: breakdown.postesTravail,
      totalMin,
      totalSec: Math.round(totalMin * 60),
      categorie: breakdown.categorie || m.modele
    };
  };

  // Helper to dispatch Gamme directly to Atelier Calculator
  const handleSendGammeToAtelier = (m: FicheTechnique) => {
    const gamme = extractGamme(m);
    const consMetrage = m.tissuConsommation && m.tissuConsommation > 0 ? m.tissuConsommation : 1.5;
    const unitMaterialCost = Math.round(consMetrage * 35 * 100) / 100;
    const detectedQty = 1000;
    const totalMaterialsCost = Math.round(unitMaterialCost * detectedQty);

    let unitPrice = 45;
    if (m.costEstimate) {
      const num = parseFloat(m.costEstimate.replace(/[^\d.]/g, ''));
      if (num > 0) unitPrice = num;
    }

    const workersCount = Math.max(1, gamme.postes.length);
    const estimatedDays = Math.max(1, Math.ceil((detectedQty * gamme.totalMin) / (workersCount * 8 * 60)));

    const pilotExportData = {
      itemName: m.modele,
      photo: m.photo || undefined,
      customPostes: gamme.postes,
      workers: workersCount,
      quantity: detectedQty,
      materials: totalMaterialsCost,
      pricePerPiece: unitPrice,
      days: estimatedDays,
      timestamp: Date.now()
    };

    localStorage.setItem('beya_ai_gamme_pilot_export', JSON.stringify(pilotExportData));
    navigate('/atelier-calculator');
  };

  // Filtered models according to search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const q = searchQuery.toLowerCase().trim();
    return models.filter(m => 
      (m.modele && m.modele.toLowerCase().includes(q)) ||
      (m.type && m.type.toLowerCase().includes(q)) ||
      (m.tissuRecommande && m.tissuRecommande.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.aiNotes && m.aiNotes.toLowerCase().includes(q))
    );
  }, [models, searchQuery]);

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto space-y-6 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {isAr ? 'مكتبة الموديلات المحفوظة' : 'Bibliothèque des Modèles IA'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              {isAr ? 'احتفظ بجميع الموديلات التي قمت بتحليلها وتصفح لاڭام والتفاصيل الكاملة' : 'Retrouvez toutes vos analyses, gammes de montage et fiches techniques'}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في الموديلات، الثوب، التفاصيل...' : 'Rechercher un modèle, tissu, détails...'}
            className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-lg font-black text-slate-700 mb-2">
            {searchQuery ? (isAr ? 'لا توجد نتائج مطابقة' : 'Aucun résultat') : (isAr ? 'المكتبة فارغة' : 'Bibliothèque vide')}
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-md">
            {searchQuery 
              ? (isAr ? 'جرب البحث بكلمات أخرى أو امسح خانة البحث.' : 'Essayez d\'autres mots clés ou réinitialisez la recherche.')
              : (isAr ? 'قم بتحليل موديل في المستشار الذكي واضغط على حفظ ليظهر هنا مع تفاصيله ولاڭام الخاصة به.' : 'Analysez un modèle dans le Chat IA et sauvegardez-le pour le voir ici avec sa gamme et ses détails.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredModels.map(m => {
            // Extractor for old models that didn't save tissuRecommande / costEstimate correctly
            let displayTissu = m.tissuRecommande && m.tissuRecommande !== '—' && m.tissuRecommande !== '-' ? m.tissuRecommande : null;
            let displayCost = m.costEstimate && m.costEstimate !== '—' && m.costEstimate !== '-' ? m.costEstimate : null;

            if (!displayTissu && m.aiNotes) {
              const tissuMatch = m.aiNotes.match(/(?:Type de tissu|نوع الثوب)[^\n:]*:\s*([^\n]+)/i);
              if (tissuMatch) displayTissu = tissuMatch[1].trim();
            }
            if (!displayCost && m.aiNotes) {
              const costMatch = m.aiNotes.match(/(?:Coût total|التكلفة)[^\n:]*:\s*([^\n]+)/i);
              if (costMatch) displayCost = costMatch[1].trim();
            }

            const fabricInfo = getFabricInfo(displayTissu || '');
            const gammeInfo = extractGamme(m);

            return (
              <div 
                key={m.id} 
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo area */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {m.photo ? (
                      <img src={m.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.modele} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-10 h-10 text-slate-300" />
                      </div>
                    )}

                    {/* Top overlay badges */}
                    <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] font-black pointer-events-auto">
                        {m.type || 'Création'}
                      </span>
                      <button 
                        onClick={(e) => removeModel(m.id, e)} 
                        title={isAr ? 'حذف الموديل' : 'Supprimer'}
                        className="w-8 h-8 bg-black/50 hover:bg-rose-600 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all pointer-events-auto shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => setSelectedDetailModel(m)} 
                          className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" /> {isAr ? 'تفاصيل' : 'Détails'}
                        </button>
                        <button 
                          onClick={() => setSelectedGammeModel(m)} 
                          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Scissors className="w-4 h-4" /> {isAr ? 'لاڭام' : 'Gamme'}
                        </button>
                        <button 
                          onClick={() => printFicheTechnique(m)} 
                          title="PDF"
                          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5 space-y-3 relative">
                    {m.tissuPhoto && (
                      <div className={`absolute top-[-30px] ${isAr ? 'left-4' : 'right-4'} w-14 h-14 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 z-10`}>
                        <img src={m.tissuPhoto} className="w-full h-full object-cover" alt="Tissu" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-black text-slate-900 text-base line-clamp-1" title={m.modele}>
                        {m.modele || 'Nouveau Modèle'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-400">{m.createdAt}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {gammeInfo.totalMin} min SAM
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] font-black text-slate-400 uppercase">{isAr ? 'الثوب المقترح' : 'Tissu'}</span>
                          <span className="text-[9px] font-bold text-slate-400">{isAr ? 'ثمن الجملة:' : 'Prix gros:'}</span>
                        </div>
                        <div className="flex justify-between items-center w-full gap-2">
                          <span className="text-xs font-black text-slate-800 line-clamp-1 flex-1" title={displayTissu || '-'}>
                            {displayTissu || '-'}
                          </span>
                          <span className="text-xs font-black text-indigo-600 text-right shrink-0">
                            {isAr ? fabricInfo.pricePerMeterMAD : fabricInfo.pricePerMeterMADFr}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex flex-col gap-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-emerald-600 uppercase block">
                            {isAr ? 'التكلفة التقديرية للإنتاج' : 'Coût total estimé'}
                          </span>
                          <span className="text-sm font-black text-emerald-700" title={displayCost || '-'}>
                            {displayCost || '-'}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600/70">
                          {isAr ? 'تشمل الثوب واليد العاملة بالورشة' : 'Tissu + Façon inclus'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Card Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    {/* 1. Bouton La Gamme */}
                    <button
                      onClick={() => setSelectedGammeModel(m)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-500/30 rounded-xl text-xs font-black transition-all active:scale-95 group"
                    >
                      <Scissors className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                      <span>{isAr ? 'قراءة لاڭام' : 'La Gamme'}</span>
                    </button>

                    {/* 2. Bouton Détails */}
                    <button
                      onClick={() => setSelectedDetailModel(m)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 rounded-xl text-xs font-black transition-all active:scale-95 group"
                    >
                      <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>{isAr ? 'تفاصيل التحليل' : 'Détails'}</span>
                    </button>
                  </div>

                  {/* 3. Bouton Chat IA */}
                  <button 
                    onClick={() => navigate('/ai-space', { state: { resumeModel: m } })}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black hover:shadow-md hover:shadow-indigo-500/20 transition-all active:scale-95 group"
                  >
                    <MessageSquare className="w-3.5 h-3.5 group-hover:animate-bounce" />
                    <span>{isAr ? 'استشارة الذكاء الاصطناعي حول الموديل' : 'Consulter l\'IA sur ce modèle'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LA GAMME DE MONTAGE (قراءة لاڭام وبوستات العمل) */}
      {/* ========================================================================= */}
      {selectedGammeModel && (() => {
        const m = selectedGammeModel;
        const gamme = extractGamme(m);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black">{isAr ? 'لاڭام ديال الخياطة (Gamme de Montage)' : 'Gamme de Montage & Postes Atelier'}</h2>
                      <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-black">
                        {gamme.postes.length} {isAr ? 'محطات' : 'postes'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-100 font-bold line-clamp-1">{m.modele}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedGammeModel(null)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Metrics Strip */}
              <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white p-3 rounded-2xl border border-amber-200/60 shadow-xs">
                  <span className="text-[10px] font-black text-amber-800 uppercase block">{isAr ? 'إجمالي وقت البياسة (SAM)' : 'Temps Total (SAM)'}</span>
                  <span className="text-base font-black text-slate-900">{gamme.totalMin} min</span>
                  <span className="text-[10px] font-bold text-slate-400 block">({gamme.totalSec} {isAr ? 'ثانية' : 'sec'})</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/60 shadow-xs">
                  <span className="text-[10px] font-black text-amber-800 uppercase block">{isAr ? 'عدد محطات العمل' : 'Postes de Travail'}</span>
                  <span className="text-base font-black text-slate-900">{gamme.postes.length}</span>
                  <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'آلات ومراحل' : 'machines requises'}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/60 shadow-xs">
                  <span className="text-[10px] font-black text-amber-800 uppercase block">{isAr ? 'الإنتاجية بالساعة (8 عمال)' : 'Cadence / Heure (8 op.)'}</span>
                  <span className="text-base font-black text-slate-900">{gamme.totalMin > 0 ? Math.round((8 * 60) / gamme.totalMin) : 0} pcs/h</span>
                  <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'تقديري للورشة' : 'estimation atelier'}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/60 shadow-xs">
                  <span className="text-[10px] font-black text-amber-800 uppercase block">{isAr ? 'الإنتاجية باليوم (8 ساعات)' : 'Cadence / Jour (8h)'}</span>
                  <span className="text-base font-black text-slate-900">{gamme.totalMin > 0 ? Math.round((8 * 8 * 60) / gamme.totalMin) : 0} pcs/j</span>
                  <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'وردية كاملة' : 'par équipe'}</span>
                </div>
              </div>

              {/* Postes List Table */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
                {gamme.postes.map((p, idx) => {
                  const sec = Math.round((p.tempsMin || 0) * 60);
                  const isPiqueuse = p.machine.toLowerCase().includes('piqueuse');
                  const isSurjet = p.machine.toLowerCase().includes('surjet');
                  const isRecouvreuse = p.machine.toLowerCase().includes('recouvr') || p.machine.toLowerCase().includes('ourle');

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
                      className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-amber-500 text-white rounded-xl text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-black text-slate-900 text-sm">
                            {isAr ? p.nomAr : (p.nomFr || p.nomAr)}
                          </p>
                          {p.nomFr && p.nomFr !== p.nomAr && (
                            <p className="text-[11px] font-bold text-slate-400">
                              {isAr ? p.nomFr : p.nomAr}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${badgeColor}`}>
                          {p.machine}
                        </span>
                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-right shrink-0">
                          <span className="text-xs font-black text-amber-600">{p.tempsMin} د</span>
                          <span className="text-[10px] font-bold text-slate-400 mr-1">({sec}s)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printFicheTechnique(m)}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? 'طباعة لاڭام PDF' : 'Imprimer Gamme PDF'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGammeModel(null);
                      setSelectedDetailModel(m);
                    }}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? 'عرض باقي التفاصيل' : 'Voir les Détails'}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleSendGammeToAtelier(m)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isAr ? 'إرسال هاد لاڭام لحاسبة الورشة ⚡' : 'Envoyer à l\'Atelier Calculator ⚡'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2: DÉTAILS DE L'ANALYSE (تفاصيل التحليل الكامل والمواصفات) */}
      {/* ========================================================================= */}
      {selectedDetailModel && (() => {
        const m = selectedDetailModel;
        const fabricInfo = getFabricInfo(m.tissuRecommande || '');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black line-clamp-1">{m.modele || 'Modèle IA'}</h2>
                    <p className="text-xs text-indigo-200 font-bold">{isAr ? 'التقرير التقني وتفاصيل التحليل الذكي' : 'Rapport Technique et Détails Complets de l\'Analyse'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDetailModel(null)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* Visual Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Photo Thumbnail */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    {m.photo ? (
                      <img src={m.photo} className="w-full h-full object-cover" alt="Model" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    {m.tissuPhoto && (
                      <div className="absolute bottom-2 right-2 w-12 h-12 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
                        <img src={m.tissuPhoto} className="w-full h-full object-cover" alt="Tissu" />
                      </div>
                    )}
                  </div>

                  {/* Specs Columns */}
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{isAr ? 'النوع / الصنف' : 'Catégorie'}</span>
                      <span className="text-xs font-black text-slate-900 mt-1 block">{m.type || 'Création'}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{isAr ? 'القصة (Fit)' : 'Coupe (Fit)'}</span>
                      <span className="text-xs font-black text-slate-900 mt-1 block">{m.fit || 'Regular'}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{isAr ? 'الصعوبة' : 'Complexité'}</span>
                      <span className="text-xs font-black text-amber-600 mt-1 block">{m.complexity || 'Moyenne'}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{isAr ? 'استهلاك القماش' : 'Métrage Tissu'}</span>
                      <span className="text-xs font-black text-indigo-600 mt-1 block">{m.tissuConsommation || 1.5} m / pc</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{isAr ? 'الثوب المقترح' : 'Tissu'}</span>
                      <span className="text-xs font-black text-slate-900 mt-1 block line-clamp-1" title={m.tissuRecommande || '-'}>
                        {m.tissuRecommande || '-'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{isAr ? 'ثمن المتر' : 'Prix tissu'}</span>
                      <span className="text-xs font-black text-emerald-600 mt-1 block">
                        {isAr ? fabricInfo.pricePerMeterMAD : fabricInfo.pricePerMeterMADFr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description & Components */}
                {m.description && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      {isAr ? 'الوصف ومكونات الموديل' : 'Description & Composants'}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                      {m.description}
                    </p>
                  </div>
                )}

                {/* AI Analysis Notes / Chat content */}
                {m.aiNotes ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      {isAr ? 'تفاصيل استشارة الذكاء الاصطناعي الكاملة' : 'Détails Complets de l\'Analyse IA'}
                    </h3>

                    <div className="p-5 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white rounded-3xl border border-indigo-100 text-slate-800 text-xs leading-relaxed space-y-4">
                      {m.aiNotes.split('\n\n---\n\n').map((block, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                          <p className="font-bold text-slate-800 whitespace-pre-line leading-relaxed">
                            {block.replace(/<<<GAMME_JSON:[\s\S]*?>>>/g, '').trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-500">
                      {isAr ? 'هذا الموديل لا يحتوي على ملاحظات شات إضافية، تم حفظه كبطاقة تقنية مباشرة.' : 'Ce modèle a été enregistré directement sans historique de chat.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDetailModel(null);
                      setSelectedGammeModel(m);
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>{isAr ? 'قراءة لاڭام لهذا الموديل' : 'Voir La Gamme'}</span>
                  </button>
                  <button
                    onClick={() => printFicheTechnique(m)}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? 'طباعة البطاقة التقنية' : 'Imprimer Fiche'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedDetailModel(null);
                    navigate('/ai-space', { state: { resumeModel: m } });
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isAr ? 'متابعة الاستشارة في الشات الذكي' : 'Reprendre dans le Chat IA'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
