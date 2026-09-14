import React, { useState, useEffect } from 'react';
import { Camera, FileText, Download, Trash2, Sparkles, FolderHeart } from 'lucide-react';
import { loadData, saveRecord, deleteRecord, FicheTechnique } from '../types';
import { useLang } from '../contexts/LangContext';
import { printFicheTechnique } from '../utils/print';

export default function AIModelsLibrary() {
  const { isAr } = useLang();
  const [models, setModels] = useState<FicheTechnique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      // We read from the standard fiches table but filter by client="Suggestion Expert"
      // to avoid breaking the data structure, but conceptually keeping them isolated in UI.
      // Wait, earlier I said I'll save them to 'ai_models' to completely separate them!
      // Let's use 'ai_models' collection to be 100% separate from Fiches Techniques.
      const data = await loadData<FicheTechnique>('ai_models');
      setModels(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeModel = async (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا الموديل؟' : 'Voulez-vous vraiment supprimer ce modèle ?')) {
      await deleteRecord('ai_models', id);
      setModels(models.filter(m => m.id !== id));
    }
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{isAr ? 'مكتبة الموديلات المحفوظة' : 'Bibliothèque des Modèles IA'}</h1>
            <p className="text-sm font-bold text-slate-500">{isAr ? 'احتفظ بجميع الموديلات التي قمت بتحليلها هنا' : 'Retrouvez toutes vos analyses sauvegardées'}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-lg font-black text-slate-700 mb-2">{isAr ? 'المكتبة فارغة' : 'Bibliothèque vide'}</h2>
          <p className="text-sm font-medium text-slate-500">{isAr ? 'قم بتحليل موديل في المستشار الذكي واضغط على حفظ ليظهر هنا.' : 'Analysez un modèle dans le Chat IA et sauvegardez-le pour le voir ici.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {models.map(m => (
            <div key={m.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {m.photo ? (
                  <img src={m.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Model" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex gap-2 w-full">
                    <button onClick={() => printFicheTechnique(m)} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={() => removeModel(m.id)} className="w-12 h-10 bg-white/20 hover:bg-rose-500 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-5 space-y-3 relative">
                {m.tissuPhoto && (
                  <div className={`absolute top-[-30px] ${isAr ? 'left-4' : 'right-4'} w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100`}>
                    <img src={m.tissuPhoto} className="w-full h-full object-cover" alt="Tissu" />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="pr-16">
                    <h3 className="font-black text-slate-900 line-clamp-1">{m.modele || 'Nouveau Modèle'}</h3>
                    <p className="text-xs font-bold text-indigo-600">{m.createdAt}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">{isAr ? 'الثوب المقترح' : 'Tissu'}</span>
                    <span className="text-xs font-black text-slate-800 line-clamp-1">{m.tissuRecommande || '-'}</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[9px] font-black text-emerald-600 uppercase block mb-0.5">{isAr ? 'التكلفة' : 'Coût'}</span>
                    <span className="text-xs font-black text-emerald-700">{m.costEstimate || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
