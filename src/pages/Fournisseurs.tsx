import { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, X, Edit2, Trash2, Package } from 'lucide-react';
import { Fournisseur, genId, loadFournisseurs, saveFournisseur, deleteFournisseur } from '../types';
import { useLang } from '../contexts/LangContext';

export default function Fournisseurs() {
  const { isAr } = useLang();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Fournisseur | null>(null);
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
    setShowModal(false);
    await saveFournisseur(fData);
  }

  function handleDelete(f: Fournisseur) {
    setDeleteConfirm(f);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    await deleteFournisseur(deleteConfirm.id);
    setFournisseurs(fournisseurs.filter(item => item.id !== deleteConfirm.id));
    setDeleteConfirm(null);
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
                <div className={`flex items-center justify-between`}>
                  <a href={`tel:${f.telephone.replace(/\s/g, '')}`} className={`flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold tabular-nums" dir="ltr">{f.telephone}</span>
                  </a>
                  <div className="flex gap-2">
                    <a 
                      href={`https://wa.me/c/${f.telephone.replace(/\s/g, '').replace(/^0/, '212')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title={isAr ? 'كتالوج واتساب (البوتيك)' : 'Catalogue WhatsApp (Boutique)'}
                    >
                      <Package className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://wa.me/${f.telephone.replace(/\s/g, '').replace(/^0/, '212')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title={isAr ? 'مراسلة عبر واتساب' : 'Message WhatsApp'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    </a>
                  </div>
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[160] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in duration-300 p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{isAr ? 'تأكيد الحذف' : 'Confirmer la suppression'}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              {isAr ? `هل أنت متأكد من حذف المورد "${deleteConfirm.nom}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Voulez-vous vraiment supprimer le fournisseur "${deleteConfirm.nom}" ? Cette action est irréversible.`}
            </p>
            <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-200"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 h-12 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-500/20 hover:bg-rose-600"
              >
                {isAr ? 'نعم، احذف' : 'Oui, Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
