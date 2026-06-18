import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { Plus, Search, Tag, DollarSign, Layers, Edit, Trash2, X, Check, FileText } from 'lucide-react';
import { TarifService, User, loadPermissions, loadData, saveRecord, deleteRecord, genId } from '../types';

export default function Tarifs() {
  const { isAr } = useLang();
  
  const [currentUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('textrack_user') || 'null'); } catch { return null; }
  });

  const can = (page: string) => {
    if (!currentUser) return false;
    const perms = loadPermissions();
    let role = (currentUser.role || '').toLowerCase();
    if (role === 'agent' || role.includes('pointage')) role = 'agent_pointage';
    return (perms[role as keyof typeof perms] || []).includes(page as any);
  };

  const [tarifs, setTarifs] = useState<TarifService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Toutes');
  const [isEditing, setIsEditing] = useState<TarifService | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<TarifService>>({
    categorie: 'Confection',
    unite: 'Pièce',
    actif: true
  });

  useEffect(() => {
    loadTarifs();
  }, []);

  const loadTarifs = async () => {
    setLoading(true);
    // Instant cache load
    try {
      const local = localStorage.getItem('textrack_data_tarifs');
      if (local) setTarifs(JSON.parse(local));
    } catch {}

    const data = await loadData<TarifService>('tarifs');
    setTarifs(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titre || formData.prixMin === undefined) return;

    const record: TarifService = {
      id: isEditing ? isEditing.id : genId(),
      titre: formData.titre,
      categorie: formData.categorie as any,
      prixMin: Number(formData.prixMin),
      prixMax: formData.prixMax ? Number(formData.prixMax) : undefined,
      unite: formData.unite as any,
      description: formData.description || '',
      actif: formData.actif ?? true
    };

    // Optimistic update
    setTarifs(prev => {
      if (isEditing) return prev.map(t => t.id === record.id ? record : t);
      return [record, ...prev];
    });

    setShowForm(false);
    setIsEditing(null);
    setFormData({ categorie: 'Confection', unite: 'Pièce', actif: true });

    await saveRecord('tarifs', record);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من الحذف؟' : 'Voulez-vous vraiment supprimer ce tarif ?')) return;
    setTarifs(prev => prev.filter(t => t.id !== id));
    await deleteRecord('tarifs', id);
  };

  const categories = ['Toutes', 'Confection', 'Impression', 'Broderie', 'Finition', 'Matière Première', 'Autre'];

  const filtered = tarifs.filter(t => {
    const matchSearch = t.titre.toLowerCase().includes(search.toLowerCase()) || 
                        (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Toutes' || t.categorie === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Tag className="w-5 h-5 text-white" />
            </div>
            {isAr ? 'كتالوج الخدمات والأسعار' : 'Catalogue des Tarifs'}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isAr ? 'مرجع أسعار الخدمات والمنتجات للفريق التجاري' : 'Référentiel des prix des services pour l\'équipe commerciale'}
          </p>
        </div>
        {can('tarifs') && (
          <button 
            onClick={() => { setIsEditing(null); setFormData({ categorie: 'Confection', unite: 'Pièce', actif: true }); setShowForm(true); }}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة خدمة' : 'Nouveau Tarif'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] p-4 border-2 border-slate-50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
          <input 
            type="text"
            placeholder={isAr ? 'بحث عن خدمة...' : 'Rechercher un service...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                categoryFilter === c 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {c === 'Toutes' ? (isAr ? 'الكل' : 'Tous') : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading && tarifs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white/50 animate-pulse rounded-[2rem] h-48 border-2 border-slate-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[3rem] py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100">
          <FileText className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-2">
            {isAr ? 'لا توجد خدمات' : 'Aucun tarif trouvé'}
          </h3>
          <p className="text-slate-400 font-medium text-sm">
            {isAr ? 'لم يتم إضافة أي أسعار بعد' : 'La grille tarifaire est vide pour le moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-[2rem] p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-indigo-50 transition-all group flex flex-col h-full relative overflow-hidden">
              {!t.actif && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                  Inactif
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  t.categorie === 'Confection' ? 'bg-pink-50 text-pink-500' :
                  t.categorie === 'Impression' ? 'bg-blue-50 text-blue-500' :
                  t.categorie === 'Broderie' ? 'bg-purple-50 text-purple-500' :
                  t.categorie === 'Finition' ? 'bg-amber-50 text-amber-500' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    t.categorie === 'Confection' ? 'text-pink-500' :
                    t.categorie === 'Impression' ? 'text-blue-500' :
                    t.categorie === 'Broderie' ? 'text-purple-500' :
                    t.categorie === 'Finition' ? 'text-amber-500' :
                    'text-slate-500'
                  }`}>
                    {t.categorie}
                  </span>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight mt-1">{t.titre}</h3>
                </div>
              </div>
              
              {t.description && (
                <p className="text-sm text-slate-500 font-medium mb-6 flex-1 line-clamp-3">
                  {t.description}
                </p>
              )}
              
              <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'السعر' : 'Prix'}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-600">{t.prixMin}</span>
                    {t.prixMax && (
                      <>
                        <span className="text-slate-400 font-bold mx-1">-</span>
                        <span className="text-2xl font-black text-indigo-600">{t.prixMax}</span>
                      </>
                    )}
                    <span className="text-xs font-bold text-slate-500 ml-1">MAD</span>
                  </div>
                  <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md mt-1 inline-block">/ {t.unite}</span>
                </div>
                
                {can('tarifs') && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setIsEditing(t); setFormData(t); setShowForm(true); }}
                      className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  {isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                {isEditing ? (isAr ? 'تعديل الخدمة' : 'Modifier le Tarif') : (isAr ? 'إضافة خدمة جديدة' : 'Nouveau Tarif')}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'اسم الخدمة' : 'Titre du service'} *</label>
                <input 
                  type="text" 
                  required
                  value={formData.titre || ''}
                  onChange={e => setFormData({...formData, titre: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none"
                  placeholder="Ex: Confection T-shirt Col Rond"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'الفئة' : 'Catégorie'} *</label>
                  <select 
                    value={formData.categorie || 'Confection'}
                    onChange={e => setFormData({...formData, categorie: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none"
                  >
                    <option value="Confection">Confection</option>
                    <option value="Impression">Impression</option>
                    <option value="Broderie">Broderie</option>
                    <option value="Finition">Finition</option>
                    <option value="Matière Première">Matière Première</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'الوحدة' : 'Unité'} *</label>
                  <select 
                    value={formData.unite || 'Pièce'}
                    onChange={e => setFormData({...formData, unite: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-500 outline-none"
                  >
                    <option value="Pièce">Pièce</option>
                    <option value="Mètre">Mètre</option>
                    <option value="Logo">Logo</option>
                    <option value="Heure">Heure</option>
                    <option value="Forfait">Forfait</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'السعر (Min)' : 'Prix (Min)'} *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={formData.prixMin || ''}
                      onChange={e => setFormData({...formData, prixMin: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm font-bold focus:border-indigo-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">MAD</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'السعر (Max)' : 'Prix (Max)'}</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prixMax || ''}
                      onChange={e => setFormData({...formData, prixMax: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm font-bold focus:border-indigo-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">MAD</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'الوصف / ملاحظات' : 'Description'}</label>
                <textarea 
                  rows={3}
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none resize-none"
                  placeholder="Détails supplémentaires..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="actif"
                  checked={formData.actif}
                  onChange={e => setFormData({...formData, actif: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="actif" className="text-sm font-bold text-slate-700 select-none">
                  {isAr ? 'الخدمة متاحة (نشطة)' : 'Service actif'}
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isAr ? 'حفظ' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
