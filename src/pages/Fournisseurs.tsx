import { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, X, Edit2, Trash2, Package } from 'lucide-react';
import { Fournisseur, genId, loadFournisseurs, saveFournisseur, deleteFournisseur } from '../types';
import { useLang } from '../contexts/LangContext';

export default function Fournisseurs() {
  const { isAr } = useLang();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Fournisseur>>({});

  useEffect(() => {
    loadFournisseurs().then(data => {
      setFournisseurs(data || []);
    });
  }, []);

  const filtered = fournisseurs.filter(f => 
    (f.nom || '').toLowerCase().includes(search.toLowerCase()) || 
    (f.telephone || '').includes(search)
  );

  function openCreate() {
    setEditId(null);
    setForm({ nom: '', type: 'tissu', telephone: '', email: '', adresse: '', notes: '' });
    setShowModal(true);
  }

  function openEdit(f: Fournisseur) {
    setEditId(f.id);
    setForm({ ...f });
    setShowModal(true);
  }

  async function save() {
    if (!form.nom) return;
    const isNew = !editId;
    const fId = editId || genId();
    
    const fData: Fournisseur = { 
      id: fId, 
      nom: form.nom, 
      type: form.type || 'tissu',
      telephone: form.telephone || '',
      email: form.email || '',
      adresse: form.adresse || '',
      notes: form.notes || '',
      dateCreation: form.dateCreation || new Date().toISOString()
    };

    const updated = isNew ? [...fournisseurs, fData] : fournisseurs.map(f => f.id === editId ? fData : f);
    setFournisseurs(updated);
    await saveFournisseur(fData);
    setShowModal(false);
  }

  async function handleDelete(f: Fournisseur) {
    if (window.confirm(isAr ? `هل أنت متأكد من حذف المورد ${f.nom}؟` : `Voulez-vous supprimer le fournisseur ${f.nom} ?`)) {
      await deleteFournisseur(f.id);
      setFournisseurs(fournisseurs.filter(item => item.id !== f.id));
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAr ? 'md:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'إدارة الموردين' : 'Gestion Fournisseurs'}</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">{isAr ? 'لائحة مزودي السلع والأثواب' : 'Liste des fournisseurs de matières et fournitures'}</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'مورد جديد' : 'Nouveau Fournisseur'}
        </button>
      </div>

      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isAr ? 'right-4' : 'left-4'}`} />
        <input 
          type="text"
          placeholder={isAr ? 'بحث عن مورد...' : "Rechercher un fournisseur..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
          dir={isAr ? 'rtl' : 'ltr'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(f => (
          <div key={f.id} className="bg-white rounded-[32px] border-2 border-slate-50 shadow-sm hover:shadow-md transition-all overflow-hidden group p-6">
            <div className={`flex items-start justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 bg-indigo-50 rounded-[20px] flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm border border-indigo-100">
                  <Package className="w-6 h-6" />
                </div>
                <div className={isAr ? 'text-right' : ''}>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px]">{f.nom}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase mt-1 inline-block">{f.type}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(f)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button onClick={() => handleDelete(f)} className="p-2 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {f.telephone && (
                <div className={`flex items-center gap-3 text-slate-500 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tabular-nums">{f.telephone}</span>
                </div>
              )}
              {f.email && (
                <div className={`flex items-center gap-3 text-slate-500 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{f.email}</span>
                </div>
              )}
            </div>
            
            {f.notes && (
               <div className={`mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 italic ${isAr ? 'text-right' : ''}`}>
                 {f.notes}
               </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                {editId ? (isAr ? 'تعديل بيانات المورد' : 'Modifier Fournisseur') : (isAr ? 'مورد جديد' : 'Nouveau Fournisseur')}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            <div className={`p-8 space-y-4 max-h-[70vh] overflow-y-auto ${isAr ? 'text-right' : ''}`}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'اسم المورد / الشركة *' : 'Nom du Fournisseur / Société *'}</label>
                <input 
                  value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                />
              </div>
              <div className={`grid grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'النوع' : 'Type'}</label>
                  <select 
                    value={form.type || 'tissu'} onChange={e => setForm({...form, type: e.target.value as any})}
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                  >
                    <option value="tissu">{isAr ? 'أثواب' : 'Tissu'}</option>
                    <option value="fourniture">{isAr ? 'لوازم الخياطة' : 'Fourniture'}</option>
                    <option value="machine">{isAr ? 'آلات' : 'Machine'}</option>
                    <option value="autre">{isAr ? 'أخرى' : 'Autre'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الهاتف' : 'Téléphone'}</label>
                  <input 
                    value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})}
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-left tabular-nums' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'العنوان' : 'Adresse'}</label>
                <input 
                  value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'ملاحظات' : 'Notes'}</label>
                <textarea 
                  value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 h-20 ${isAr ? 'text-right' : ''}`}
                />
              </div>
            </div>
            <div className={`p-6 bg-slate-50 flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">{isAr ? 'إلغاء' : 'Annuler'}</button>
              <button 
                onClick={save}
                className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                {isAr ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
