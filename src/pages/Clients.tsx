import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, User, Phone, Mail, MapPin, ExternalLink, MessageSquare, DollarSign, ChevronRight, TrendingUp, History, FileText, X, Printer, Download, Edit2, Copy, Check, Trash2, Key } from 'lucide-react';
import { Commande, loadData, genId, loadCompanyProfile, deleteRecord } from '../types';
import { generatePDF } from '../utils/pdf';

interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  notes: string;
  pinCode?: string;
  password?: string;
}
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';
// Local storage helpers for clients specifically to avoid Supabase table errors
function getLocalClients(): Client[] {
  try {
    const data = localStorage.getItem('textrack_clients_profiles');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveLocalClients(clients: Client[]) {
  localStorage.setItem('textrack_clients_profiles', JSON.stringify(clients));
}

export default function Clients() {
  const { lang, isAr } = useLang();
  const [clients, setClients] = useState<Client[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [factures, setFactures] = useState<any[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [selectedOrderDoc, setSelectedOrderDoc] = useState<Commande | null>(null);
  const [showClientCode, setShowClientCode] = useState<Client | null>(null);
  const company = loadCompanyProfile();
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load remote users (role client), orders, and invoices
    Promise.all([
      loadData<any>('users'),
      loadData<Commande>('commandes'),
      loadData<any>('factures')
    ]).then(([storedUsers, storedCommandes, storedFactures]) => {
      const dbClients = storedUsers.filter((u: any) => u.role === 'client');
      setClients(dbClients);
      setCommandes(storedCommandes || []);
      setFactures(storedFactures || []);
    }).catch(err => {
      console.error("Error loading clients/orders/factures data:", err);
    });
  }, []);

  useEffect(() => {
    if (location.state?.openClientName && clients.length > 0) {
      const c = clients.find(cl => cl.nom.toLowerCase() === location.state.openClientName.toLowerCase());
      if (c) {
        setActiveClientId(c.id);
        setView('detail');
        // Clear state so it doesn't reopen if we navigate back
        navigate('/clients', { replace: true, state: {} });
      }
    }
  }, [location.state, clients, navigate]);

  const clientStats = useMemo(() => {
    if (!clients) return [];
    return clients.map(client => {
      const clientName = (client.nom || '').toLowerCase();
      const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === clientName);
      const clientFactures = (factures || []).filter(f => (f.client || '').toLowerCase() === clientName);

      const totalAffaire = clientCmds.reduce((sum, c) => sum + ((c.quantite || 0) * (c.prix || 0)), 0);
      
      // Payé = Advances on orders + Paid invoices
      const totalAvances = clientCmds.reduce((sum, c) => sum + (c.avance || 0), 0);
      const totalFacturesPayees = clientFactures
        .filter(f => f.statut === 'payée')
        .reduce((sum, f) => sum + (f.montant || 0), 0);
      
      // We take the max of advances or paid invoices to avoid double counting if 
      // an advance was already included in the paid invoice amount.
      // But in this system, usually they are additive or the invoice covers the rest.
      // For simplicity and safety against the user's screenshot:
      const totalPaye = Math.max(totalAvances, totalFacturesPayees);
      
      const totalDette = Math.max(0, totalAffaire - totalPaye);
      const cmdCount = clientCmds.length;
      return { ...client, totalAffaire, totalPaye, totalDette, cmdCount };
    });
  }, [clients, commandes, factures]);

  const filtered = clientStats.filter(c => 
    (c.nom || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.telephone || '').includes(search)
  );

  const totalDetteGlobale = clientStats.reduce((sum, c) => sum + (c.totalDette || 0), 0);
  const clientActifCount = clientStats.filter(c => (c.cmdCount || 0) > 0).length;

  function openCreate() {
    setEditId(null);
    setForm({ nom: '', telephone: '', email: '', adresse: '', ville: '', notes: '' });
    setShowModal(true);
  }

  async function openEdit(c: Client) {
    setEditId(c.id);
    const formCopy = { ...c };
    try {
      const leads = await loadData<any>('leads');
      if (leads && leads.length > 0) {
        const matchedLead = leads.find(l => 
          (l.email && c.email && l.email.toLowerCase().trim() === c.email.toLowerCase().trim()) ||
          (l.name && c.nom && l.name.toLowerCase().trim() === c.nom.toLowerCase().trim()) ||
          (l.phone && c.telephone && l.phone.replace(/\D/g, '') === c.telephone.replace(/\D/g, ''))
        );
        if (matchedLead) {
          if (!formCopy.telephone && matchedLead.phone) {
            formCopy.telephone = matchedLead.phone;
          }
          if (!formCopy.ville && matchedLead.ville) {
            formCopy.ville = matchedLead.ville;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to autofill from leads:", err);
    }
    setForm(formCopy);
    setShowModal(true);
  }

  async function save() {
    if (!form.nom) return;
    const isNew = !editId;
    const cId = editId || genId();
    // Map Client form to User interface
    const clientData = { 
      id: cId, 
      nom: form.nom, 
      telephone: form.telephone || '',
      email: (form.email || '').toLowerCase().trim(),
      adresse: form.adresse || '',
      ville: form.ville || '',
      notes: form.notes || '',
      role: 'client',
      pinCode: isNew ? Math.floor(100000 + Math.random() * 900000).toString() : ((form as any).pinCode || (form as any).password),
      password: isNew ? '' : ((form as any).password !== 'client_default_pass' ? (form as any).password : (form as any).pinCode)
    };
    if (isNew) {
      clientData.password = clientData.pinCode;
    } else if (clientData.password === 'client_default_pass') {
      clientData.password = clientData.pinCode;
    }

    // Save to local for UI responsiveness
    const updated = isNew
      ? [...clients, clientData as any]
      : clients.map(c => c.id === editId ? clientData as any : c);
    setClients(updated);
    saveLocalClients(updated);

    // Save to Supabase (as a user with role 'client')
    const { saveRecord } = await import('../types');
    await saveRecord('users', clientData);
    
    setShowModal(false);
  }

  async function handleDelete(c: Client) {
    const confirmMsg = isAr 
      ? `هل أنت متأكد من حذف الزبون ${c.nom}؟` 
      : `Voulez-vous vraiment supprimer le client ${c.nom} ?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        await deleteRecord('users', c.id);
        const updated = clients.filter(item => item.id !== c.id);
        setClients(updated);
        saveLocalClients(updated);
      } catch (e: any) {
        alert(isAr ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  }

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeClient = useMemo(() => {
    return clientStats.find(c => c.id === activeClientId);
  }, [clientStats, activeClientId]);

  function copyPin(pin: string, id: string) {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {view === 'detail' && activeClient ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Detail Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setView('list'); setActiveClientId(null); }}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
              >
                <X className={`w-5 h-5 text-slate-400 ${isAr ? 'rotate-180' : ''}`} />
              </button>
              <div className={isAr ? 'text-right' : ''}>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'ملف الزبون' : 'Profil Client'}</h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">{isAr ? 'السجل والمعاملات' : 'Historique & Transactions'}</p>
              </div>
            </div>
            <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowClientCode(activeClient)} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all shadow-sm">
                <Key className="w-4 h-4" /> {isAr ? 'بيانات الدخول' : 'Identifiants'}
              </button>
              <button onClick={() => openEdit(activeClient)} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Edit2 className="w-4 h-4" /> {isAr ? 'تعديل' : 'Modifier'}
              </button>
              <button 
                onClick={() => setSelectedClient(activeClient)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                <Printer className="w-4 h-4" /> {isAr ? 'طبع الوضعية' : 'Imprimer Situation'}
              </button>
            </div>
          </div>

          {/* Client Top Card */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`lg:col-span-1 bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-sm relative overflow-hidden ${isAr ? 'text-right' : ''}`}>
              <div className={`absolute top-0 w-32 h-32 bg-slate-50 rounded-bl-[80px] -z-0 opacity-50 ${isAr ? 'left-0 rounded-br-[80px] rounded-bl-none' : 'right-0'}`} />
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl mb-6 ${isAr ? 'mr-0 ml-auto' : ''}`}>
                  {(activeClient.nom || 'C')[0].toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">{activeClient.nom}</h2>
                <div className="space-y-3 mt-6">
                  <div className={`flex items-center gap-3 text-slate-600 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <Phone className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-sm tabular-nums">{activeClient.telephone || (isAr ? 'غير مسجل' : 'Non renseigné')}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-slate-600 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                       <span className="font-bold text-sm uppercase">{activeClient.ville || (isAr ? 'مدينة غير محددة' : 'Ville non spécifiée')}</span>
                       {(activeClient as any).password && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText((activeClient as any).password);
                                setCopiedId(activeClient.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className={`text-[10px] font-black px-3 py-1 rounded-lg border transition-all flex items-center gap-2 tabular-nums ${
                                copiedId === activeClient.id 
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                              }`}
                            >
                              {copiedId === activeClient.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedId === activeClient.id ? (isAr ? 'تم النسخ!' : 'Copié !') : (activeClient as any).password}
                            </button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-200 ${isAr ? 'text-right' : ''}`}>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">{isAr ? 'حجم المعاملات' : "Volume d'Affaires"}</p>
                <p className="text-4xl font-black tabular-nums">{(activeClient.totalAffaire || 0).toLocaleString()} <span className="text-sm">MAD</span></p>
                <div className={`mt-8 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tabular-nums">{activeClient.cmdCount} {isAr ? 'طلبيات' : 'Commandes'}</div>
                </div>
              </div>
              <div className={`bg-emerald-500 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-100 ${isAr ? 'text-right' : ''}`}>
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-4">{isAr ? 'مجموع المؤدى' : 'Total Payé'}</p>
                <p className="text-4xl font-black tabular-nums">{(activeClient.totalPaye || 0).toLocaleString()} <span className="text-sm">MAD</span></p>
                <div className="mt-8 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-white rounded-full ${isAr ? 'float-right' : ''}`} style={{ width: `${((activeClient.totalPaye || 0) / (activeClient.totalAffaire || 1)) * 100}%` }} />
                </div>
              </div>
              <div className={`bg-rose-500 p-8 rounded-[40px] text-white shadow-xl shadow-rose-100 ${isAr ? 'text-right' : ''}`}>
                <p className="text-[10px] font-black text-rose-100 uppercase tracking-[0.2em] mb-4">{isAr ? 'الباقي للأداء' : 'Reste à Payer'}</p>
                <p className="text-4xl font-black tabular-nums">{(activeClient.totalDette || 0).toLocaleString()} <span className="text-sm">MAD</span></p>
                <p className="mt-8 text-[10px] font-black uppercase opacity-60">{isAr ? 'الرصيد الحالي المستحق' : 'Balance débitrice actuelle'}</p>
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm overflow-hidden">
            <div className={`p-8 border-b border-slate-50 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'سجل الطلبيات' : 'Historique des Commandes'}</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest tabular-nums">{(() => {
                const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === (activeClient.nom || '').toLowerCase());
                return clientCmds.length;
              })()} {isAr ? 'معاملة' : 'Transactions'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full ${isAr ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className={`px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'المرجع والموديل' : 'Réf & Modèle'}</th>
                    <th className={`px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className={`px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'الكمية' : 'Quantité'}</th>
                    <th className={`px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'المبلغ الإجمالي' : 'Montant Total'}</th>
                    <th className={`px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isAr ? 'text-right' : ''}`}>{isAr ? 'تسبيق' : 'Avance'}</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{isAr ? 'الحالة' : 'Statut'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(() => {
                    const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === (activeClient.nom || '').toLowerCase());
                    return clientCmds.map(cmd => {
                      const total = (cmd.quantite || 0) * (cmd.prix || 0);
                      const remains = total - (cmd.avance || 0);
                      return (
                        <tr key={cmd.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row" onClick={() => setSelectedOrderDoc(cmd)}>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 group/ref">
                               <p className="text-lg font-black text-slate-900 uppercase tracking-tighter group-hover/row:text-indigo-600 transition-colors">{cmd.reference}</p>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); copyPin(cmd.reference, cmd.id); }}
                                 className={`p-1.5 rounded-lg transition-all ${
                                   copiedId === cmd.id 
                                     ? 'bg-emerald-100 text-emerald-600' 
                                     : 'bg-slate-50 text-slate-400 opacity-0 group-hover/ref:opacity-100 hover:bg-indigo-50 hover:text-indigo-600'
                                 }`}
                               >
                                 {copiedId === cmd.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                               </button>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cmd.modele}</p>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-500 tabular-nums">{new Date(cmd.dateCommande).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')}</td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-900 tabular-nums">{total.toLocaleString()} MAD</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs font-black text-emerald-600 tabular-nums">{cmd.avance?.toLocaleString() || 0} MAD</p>
                            {remains > 0 && <p className="text-[9px] font-bold text-rose-400 mt-0.5 tabular-nums">{isAr ? 'الباقي:' : 'Reste:'} {remains.toLocaleString()} MAD</p>}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              cmd.statut === 'livré' ? 'bg-green-100 text-green-700' : 
                              cmd.statut === 'terminé' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {cmd.statut}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              {(() => {
                const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === (activeClient.nom || '').toLowerCase());
                if (clientCmds.length === 0) return (
                  <div className="p-20 text-center">
                    <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{isAr ? 'لا توجد طلبيات مسجلة' : 'Aucune commande trouvée'}</p>
                  </div>
                );
                return null;
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header & Stats */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAr ? 'md:flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : ''}>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'إدارة الزبناء' : 'Gestion Clients'}</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">{isAr ? 'دليل ومتابعة مالية للزبناء' : 'Répertoire et suivi financier des clients'}</p>
            </div>
            <button 
              onClick={openCreate}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {isAr ? 'زبون جديد' : 'Nouveau Client'}
            </button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'مجموع الزبناء' : 'Total Clients'}</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">{clients.length}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 tabular-nums">{clientActifCount} {isAr ? 'نشط هذا الشهر' : 'actifs cette période'}</p>
            </div>
            <div className={`bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-1">{isAr ? 'رقم المعاملات' : "Chiffre d'Affaires"}</p>
              <p className="text-3xl font-black text-emerald-700 tabular-nums">
                {clientStats.reduce((sum, c) => sum + (c.totalAffaire || 0), 0).toLocaleString()} <span className="text-sm">MAD</span>
              </p>
            </div>
            <div className={`bg-rose-50 p-6 rounded-[32px] border-2 border-rose-100 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em] mb-1">{isAr ? 'الديون الإجمالية' : 'Dette Globale'}</p>
              <p className="text-3xl font-black text-rose-700 tabular-nums">
                {(totalDetteGlobale || 0).toLocaleString()} <span className="text-sm">MAD</span>
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isAr ? 'right-4' : 'left-4'}`} />
            <input 
              type="text"
              placeholder={isAr ? 'بحث عن زبون (الاسم، الهاتف...)' : "Rechercher un client (Nom, Tél...)"}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-[32px] border-2 border-slate-50 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-6">
                  <div className={`flex items-start justify-between mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {(c.nom || 'C')[0].toUpperCase()}
                      </div>
                      <div className={`cursor-pointer group/name ${isAr ? 'text-right' : ''}`} onClick={() => { setActiveClientId(c.id); setView('detail'); }}>
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px] group-hover/name:text-indigo-600 transition-colors">{c.nom || (isAr ? 'زبون بدون اسم' : 'Client Sans Nom')}</h3>
                        <div className={`flex items-center gap-2 mt-0.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.ville || (isAr ? 'مدينة غير محددة' : 'Ville non spécifiée')}</p>
                          {(c as any).password && (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg group/copy relative ${isAr ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] font-black text-indigo-600 tabular-nums">{(c as any).password}</span>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigator.clipboard.writeText((c as any).password);
                                  setCopiedId(c.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-indigo-400 hover:text-indigo-700 transition-colors"
                              >
                                {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                              {copiedId === c.id && (
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded shadow-xl animate-in fade-in slide-in-from-bottom-1 uppercase font-black tracking-widest">
                                  {isAr ? 'تم النسخ' : 'Copié'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(c)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(c); }} className="p-2 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {c.telephone && (
                      <div className={`flex items-center gap-3 text-slate-500 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone className="w-3.5 h-3.5" /></div>
                        <span className="text-xs font-bold tabular-nums">{c.telephone}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-3 text-slate-500 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5" /></div>
                      <span className="text-xs font-bold tabular-nums">{c.cmdCount || 0} {isAr ? 'طلبيات سابقة' : 'Commandes passées'}</span>
                    </div>
                  </div>

                  {/* Mini Financial Summary */}
                  <div className={`grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl mb-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'المؤدى' : 'Réglé'}</p>
                      <p className="text-xs font-black text-emerald-600 tabular-nums">{(c.totalPaye || 0).toLocaleString()} MAD</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الباقي' : 'Reste'}</p>
                      <p className="text-xs font-black text-rose-600 tabular-nums">{(c.totalDette || 0).toLocaleString()} MAD</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button 
                      onClick={() => { setActiveClientId(c.id); setView('detail'); }}
                      className="flex-1 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isAr ? 'ملف الزبون' : 'Dossier Client'}
                    </button>
                    {c.telephone && (
                      <a 
                        href={`https://wa.me/${(c.telephone || '').replace(/\s/g, '')}`} 
                        target="_blank"
                        className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Client */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                {editId ? (isAr ? 'تعديل بيانات الزبون' : 'Modifier le Client') : (isAr ? 'زبون جديد' : 'Nouveau Client')}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            <div className={`p-8 space-y-4 max-h-[70vh] overflow-y-auto ${isAr ? 'text-right' : ''}`}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الاسم الكامل / الشركة *' : 'Nom Complet / Société *'}</label>
                <input 
                  value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                />
              </div>
              <div className={`grid grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الهاتف' : 'Téléphone'}</label>
                  <input 
                    value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})}
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-left tabular-nums' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المدينة' : 'Ville'}</label>
                  <input 
                    value={form.ville || ''} onChange={e => setForm({...form, ville: e.target.value})}
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <input 
                  value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-left' : ''}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'العنوان' : 'Adresse'}</label>
                <textarea 
                  value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 h-20 ${isAr ? 'text-right' : ''}`}
                />
              </div>
            </div>
            <div className={`p-6 bg-slate-50 flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">{isAr ? 'إلغاء' : 'Annuler'}</button>
              <button 
                onClick={save}
                className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                {isAr ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client Situation (Printable) */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4 overflow-y-auto">
          {/* Global Close Click Area */}
          <div className="fixed inset-0" onClick={() => setSelectedClient(null)} />
          
          <div className="bg-white rounded-[50px] w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] my-8 animate-in zoom-in duration-300 relative z-10">
            {/* Top Close Button (Floating) */}
            <button 
              onClick={() => setSelectedClient(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:scale-110 active:scale-95 group z-[100]"
              style={{ transform: 'translateX(80px)' }}
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : ''}>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'وضعية الزبون' : 'Situation Client'}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedClient.nom || 'Client'}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className={`py-24 px-12 bg-white ${isAr ? 'text-right' : ''}`} id="printable-situation">
              {/* Beya Header */}
              <div className={`flex justify-between items-start mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={isAr ? 'text-right' : ''}>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">{company.name}</h1>
                  <p className="text-[10px] font-bold text-indigo-600 tracking-[0.3em] uppercase">{isAr ? 'تقرير الوضعية المالية' : 'Rapport de Situation Financière'}</p>
                </div>
                <div className={isAr ? 'text-left' : 'text-right'}>
                  <p className="text-xs font-black text-slate-900 uppercase">{isAr ? 'تم استخراجه في' : 'Généré le'}</p>
                  <p className="text-xs text-slate-400 font-bold tabular-nums">{new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')}</p>
                </div>
              </div>

              {/* Client Info Block */}
              <div className={`grid grid-cols-2 gap-8 mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`bg-slate-50 p-6 rounded-3xl ${isAr ? 'text-right' : ''}`}>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{isAr ? 'الزبون' : 'Client'}</h3>
                  <p className="text-xl font-black text-slate-900">{selectedClient.nom || (isAr ? 'بدون اسم' : 'Sans Nom')}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1 tabular-nums">{selectedClient.telephone || 'N/A'}</p>
                  <p className="text-xs text-slate-400 mt-2 italic">{selectedClient.adresse || (isAr ? 'لا يوجد عنوان' : 'Pas d\'adresse')}</p>
                </div>
                <div className={`bg-slate-900 p-6 rounded-3xl text-white ${isAr ? 'text-right' : ''}`}>
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">{isAr ? 'الرصيد الحالي' : 'Balance Actuelle'}</h3>
                  <p className="text-3xl font-black text-rose-400 tabular-nums">
                    {((selectedClient as any).totalDette || 0).toLocaleString()} <span className="text-sm">MAD</span>
                  </p>
                  <p className="text-[10px] font-bold text-white/60 mt-2 uppercase">{isAr ? 'إجمالي المبالغ المستحقة' : 'Total Dû par le client'}</p>
                </div>
              </div>

              {/* Summary Table */}
              <div className="mb-12">
                <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ${isAr ? 'text-right' : ''}`}>{isAr ? 'ملخص الطلبيات' : 'Récapitulatif des Commandes'}</h3>
                <div className="space-y-3">
                  {(commandes || [])
                    .filter(c => (c.client || '').toLowerCase() === (selectedClient.nom || '').toLowerCase())
                    .map(c => (
                      <div key={c.id} className={`flex items-center justify-between p-4 bg-slate-50 rounded-2xl ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                            <FileText className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{c.reference}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{c.modele}</p>
                          </div>
                        </div>
                        <div className={isAr ? 'text-left' : 'text-right'}>
                          <p className="text-xs font-black text-slate-900 tracking-tight tabular-nums">
                            {((c.quantite || 0) * (c.prix || 0)).toLocaleString()} DH
                          </p>
                          <div className={`flex flex-col gap-0.5 ${isAr ? 'items-start' : 'items-end'}`}>
                            <p className="text-[8px] font-black text-emerald-600 uppercase tabular-nums">{isAr ? 'مؤدى:' : 'Payé:'} {(c.avance || 0).toLocaleString()} DH</p>
                            <p className="text-[8px] font-black text-rose-600 uppercase tabular-nums">{isAr ? 'الباقي:' : 'Reste:'} {(((c.quantite || 0) * (c.prix || 0)) - (c.avance || 0)).toLocaleString()} DH</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className={`p-8 bg-indigo-50 rounded-[32px] border-2 border-indigo-100 flex justify-between items-center ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={isAr ? 'text-right' : ''}>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{isAr ? 'إجمالي المعاملات' : 'Total des Affaires'}</p>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{((selectedClient as any).totalAffaire || 0).toLocaleString()} MAD</p>
                </div>
                <div className={isAr ? 'text-left' : 'text-right'}>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{isAr ? 'إجمالي المؤدى' : 'Total Déjà Réglé'}</p>
                  <p className="text-2xl font-black text-emerald-600 tabular-nums">{((selectedClient as any).totalPaye || 0).toLocaleString()} MAD</p>
                </div>
              </div>
            </div>

            <div className={`p-8 bg-slate-50 grid grid-cols-3 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => window.print()}
                className="h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                <Printer className="w-5 h-5" />
                {isAr ? 'طباعة' : 'Imprimer'}
              </button>
              <button 
                onClick={() => generatePDF('printable-situation', `Situation_${selectedClient.nom.replace(/\s+/g, '_')}`)}
                className="h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                {isAr ? 'تصدير PDF' : 'Exporter PDF'}
              </button>
              <button 
                onClick={() => setSelectedClient(null)}
                className="h-14 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-rose-600 hover:text-white"
              >
                <X className="w-5 h-5" />
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Order Documents */}
      {selectedOrderDoc && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className={`p-8 border-b border-slate-50 flex items-center justify-between ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                     <FileText className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{isAr ? 'وثائق الطلبية' : 'Documents de la Commande'}</h3>
                     <p className="text-indigo-600 text-[10px] font-black tracking-widest uppercase">{selectedOrderDoc.reference}</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedOrderDoc(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                   <X className="w-6 h-6 text-slate-300" />
                 </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrderDoc.tissuPhoto && (
                    <div>
                      <h4 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>{isAr ? 'صورة الثوب المختار' : 'Photo du Tissu Choisi'}</h4>
                      <img src={selectedOrderDoc.tissuPhoto} alt="Tissu" className="w-full h-48 object-cover rounded-[1.5rem] border-2 border-slate-100 shadow-sm" />
                    </div>
                  )}
                  {selectedOrderDoc.modelePhoto && (
                    <div>
                      <h4 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>{isAr ? 'صورة الموديل المطلوب' : 'Photo du Modèle Demandé'}</h4>
                      <img src={selectedOrderDoc.modelePhoto} alt="Modele" className="w-full h-48 object-cover rounded-[1.5rem] border-2 border-slate-100 shadow-sm" />
                    </div>
                  )}
                </div>
                {selectedOrderDoc.preuveValidation && (
                  <div>
                    <h4 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>{isAr ? 'دليل موافقة الكليان' : 'Preuve de Validation du Client'}</h4>
                    {selectedOrderDoc.preuveValidation.startsWith('data:audio') ? (
                      <div className="bg-slate-50 p-6 rounded-[1.5rem] border-2 border-slate-100 flex items-center justify-center">
                        <audio controls src={selectedOrderDoc.preuveValidation} className="w-full" />
                      </div>
                    ) : (
                      <img src={selectedOrderDoc.preuveValidation} alt="Preuve" className="w-full h-auto max-h-64 object-contain rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 shadow-sm" />
                    )}
                  </div>
                )}
                {!selectedOrderDoc.tissuPhoto && !selectedOrderDoc.modelePhoto && !selectedOrderDoc.preuveValidation && (
                  <div className="bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase">{isAr ? 'لا توجد وثائق مرفقة' : 'Aucun document attaché'}</p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedOrderDoc(null)}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-sm"
                >
                  {isAr ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
           </div>
        </div>
      )}
      {/* Client Credentials Modal */}
      {showClientCode && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{isAr ? 'بيانات الدخول' : 'Identifiants Client'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{showClientCode.nom}</p>
                  </div>
                </div>
                <button onClick={() => setShowClientCode(null)} className="w-8 h-8 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email + Code */}
              <div className="space-y-2 mb-5">
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-xs font-bold text-slate-700">{showClientCode.email}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(showClientCode.email)}
                    className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-lg flex items-center justify-center transition-all">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center justify-between border border-emerald-100">
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{isAr ? 'الرمز السري' : 'Code secret'}</p>
                    <p className="text-2xl font-black tracking-[0.2em] text-slate-900 font-mono">{showClientCode.pinCode || showClientCode.password || '------'}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(showClientCode.pinCode || showClientCode.password || '')}
                    className="w-8 h-8 bg-white border border-emerald-200 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg flex items-center justify-center transition-all">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {(() => {
                  const storageKey = `beya_welcome_${showClientCode.email}`;
                  const sentData = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; } })();
                  return (
                    <>
                      {sentData && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          {isAr ? `أُرسل في ${new Date(sentData.date).toLocaleDateString('ar-MA')}` : `Envoyé le ${new Date(sentData.date).toLocaleDateString('fr-FR')}`}
                          {sentData.method === 'whatsapp' ? ' • WhatsApp' : ' • PDF'}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const rawPhone = String(showClientCode.telephone || '').replace(/\D/g, '');
                          const phone = rawPhone ? (rawPhone.startsWith('0') ? '212' + rawPhone.substring(1) : rawPhone.startsWith('212') ? rawPhone : '212' + rawPhone) : '';
                          const code = showClientCode.pinCode || showClientCode.password || '------';
                          const msg = isAr
                            ? `🎉 مرحباً بك في *BEYA CREATIVE* !\n\nأهلاً *${showClientCode.nom}*، حسابك جاهز :\n\n🌐 *https://beyacreative.com*\n📧 البريد : *${showClientCode.email}*\n🔑 الرمز : *${code}*\n\nسجل دخولك لمتابعة طلباتك. 🇲🇦`
                            : `🎉 Bienvenue chez *BEYA CREATIVE* !\n\nBonjour *${showClientCode.nom}*, votre espace client est prêt :\n\n🌐 *https://beyacreative.com*\n📧 Email : *${showClientCode.email}*\n🔑 Code : *${code}*\n\nConnectez-vous pour suivre vos commandes. À bientôt ! 🇲🇦`;
                          const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                          localStorage.setItem(storageKey, JSON.stringify({ date: new Date().toISOString(), method: 'whatsapp' }));
                        }}
                        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100">
                        <MessageSquare className="w-4 h-4" />
                        {sentData ? (isAr ? 'إعادة الإرسال — WhatsApp' : 'Renvoyer — WhatsApp') : (isAr ? 'إرسال عبر WhatsApp' : 'Envoyer via WhatsApp')}
                      </button>
                      <button
                        onClick={async () => {
                          const clientName = showClientCode.nom.replace(/\s+/g, '_');
                          const filename = `BeyaCreative_Bienvenue_${clientName}`;
                          const el = document.getElementById('welcome-pdf-' + showClientCode.id);
                          if (el) {
                            el.classList.remove('opacity-0');
                            el.style.display = 'block';
                          }
                          await generatePDF('welcome-pdf-' + showClientCode.id, filename);
                          if (el) {
                            el.classList.add('opacity-0');
                            el.style.display = 'none';
                          }
                          localStorage.setItem(storageKey, JSON.stringify({ date: new Date().toISOString(), method: 'pdf' }));
                        }}
                        className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                        <Download className="w-4 h-4" />
                        {sentData ? (isAr ? 'إعادة التحميل — PDF' : 'Re-télécharger PDF') : (isAr ? 'تحميل Welcome PDF' : 'Télécharger Welcome PDF')}
                      </button>
                    </>
                  );
                })()}
                <button onClick={() => setShowClientCode(null)}
                  className="w-full h-9 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all">
                  {isAr ? 'إغلاق' : 'Fermer'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Hidden Welcome PDF Template */}
          {(() => {
            const t = isAr ? {
              welcomeLabel: 'مرحباً بك في فضائك الخاص',
              hi: `مرحباً، ${showClientCode.nom} 👋`,
              welcomeDesc: 'تم تفعيل حسابك في BEYA CREATIVE. يمكنك الآن متابعة طلباتك وتحميل وثائقك والتواصل مع فريقنا مباشرة من بوابتك.',
              emailLabel: 'البريد الإلكتروني',
              codeLabel: 'الرمز السري',
              whoTitle: 'من نحن؟',
              whoDesc: 'BEYA CREATIVE مصنع نسيج مغربي متخصص في الخياطة المخصصة. فريقنا من الخياطات الخبيرات يعملن بأنماط دقيقة وعينات مصادق عليها لضمان أن كل قطعة تتوافق تمامًا مع رؤيتك.',
              processTitle: 'طريقة عملنا',
              steps: [
                ['01', 'الطلب والتسعير', 'تقدم مشروعك بصورة النموذج والكميات. نقوم بإعداد عرض سعر مخصص.'],
                ['02', 'الباترون والعينة', 'خبيراتنا يصنعن الباترون التقني ويخطن عينة للتحقق.'],
                ['03', 'مراقبة الجودة', 'تصادق على العينة. فرقنا تتحقق من كل تفصيل قبل الإطلاق.'],
                ['04', 'الإنتاج والتسليم', 'إطلاق الإنتاج التسلسلي مع مراقبة الجودة في كل مرحلة.'],
              ],
              contactTitle: 'تواصل معنا',
              contactSub: 'نحن دائماً في خدمتك',
            } : {
              welcomeLabel: 'BIENVENUE DANS VOTRE ESPACE',
              hi: `Bonjour, ${showClientCode.nom} 👋`,
              welcomeDesc: 'Votre compte client BEYA CREATIVE a été activé. Vous pouvez désormais suivre vos commandes, télécharger vos documents et échanger avec notre équipe directement depuis votre portail.',
              emailLabel: 'Adresse Email',
              codeLabel: 'Code Secret',
              whoTitle: 'QUI SOMMES-NOUS ?',
              whoDesc: 'BEYA CREATIVE est un atelier de confection textile marocain spécialisé dans le sur-mesure. Notre équipe de couturières expertes travaille avec des patronages précis et des échantillons validés pour garantir que chaque pièce correspond exactement à votre vision.',
              processTitle: 'NOTRE PROCESSUS',
              steps: [
                ['01', 'DEMANDE & DEVIS', 'Vous soumettez votre projet avec photo du modèle et quantités. Nous établissons un devis sur-mesure.'],
                ['02', 'PATRONAGE & ÉCHANTILLON', 'Nos expertes créent le patronage technique et confectionnent un échantillon pour validation.'],
                ['03', 'CONTRÔLE QUALITÉ', 'Vous validez l\'échantillon. Nos équipes vérifient chaque détail avant le lancement.'],
                ['04', 'PRODUCTION & LIVRAISON', 'Lancement de la production en série avec contrôle qualité à chaque étape.'],
              ],
              contactTitle: 'CONTACTEZ-NOUS',
              contactSub: 'Nous sommes à votre écoute',
            };

            return (
              <div
                id={`welcome-pdf-${showClientCode.id}`}
                className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-slate-50 font-sans"
                style={{ color: '#0f172a', direction: isAr ? 'rtl' : 'ltr' }}
              >
                <div className="h-3 bg-gradient-to-r from-indigo-400 to-blue-500" />
                <div className="p-10">
                  <div className="flex items-center justify-between mb-12 pb-6 border-b-2 border-slate-200/60">
                    <div>
                      {company.logoUrl && company.logoUrl !== '/logo.png' ? (
                        <img src={company.logoUrl} alt="Logo" className="h-10 object-contain mb-2" />
                      ) : (
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">BEYA<span className="text-indigo-500">CREATIVE</span></h1>
                      )}
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{company.name}</p>
                    </div>
                    <div className={isAr ? 'text-left' : 'text-right'}>
                      <span className="px-4 py-2 bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-widest rounded-full">
                        {t.welcomeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-3">{t.hi}</h2>
                      <p className="text-slate-600 leading-relaxed text-base">{t.welcomeDesc}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                      <div className="mb-5">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t.emailLabel}</p>
                        <p className="text-base font-bold text-slate-900">{showClientCode.email}</p>
                      </div>
                      <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 relative overflow-hidden">
                        <div className={`absolute top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl ${isAr ? 'left-0' : 'right-0'} -translate-y-1/2`} />
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 relative z-10">{t.codeLabel}</p>
                        <p className="text-3xl font-black tracking-[0.2em] text-slate-900 font-mono relative z-10">{showClientCode.pinCode || showClientCode.password || '------'}</p>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 font-bold mt-4">https://beyacreative.com</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-3xl p-8 mb-10 relative overflow-hidden">
                    <div className={`absolute top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl ${isAr ? 'left-0' : 'right-0'}`} />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-3 text-indigo-400">{t.whoTitle}</h3>
                    <p className="text-slate-300 leading-relaxed text-base relative z-10">{t.whoDesc}</p>
                  </div>

                  <div className="mb-10">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6 text-slate-900">{t.processTitle}</h3>
                    <div className="grid grid-cols-2 gap-5">
                      {t.steps.map((step, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex gap-4 items-start">
                          <span className="text-2xl font-black text-indigo-200 leading-none">{step[0]}</span>
                          <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight mb-1 text-sm">{step[1]}</h4>
                            <p className="text-slate-500 text-xs">{step[2]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black uppercase tracking-widest text-slate-900 mb-1">{t.contactTitle}</h3>
                      <p className="text-indigo-600 font-bold text-xs">{t.contactSub}</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm"><Phone className="w-4 h-4" /></div>
                        <span className="font-bold text-slate-700 text-sm">{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm"><Mail className="w-4 h-4" /></div>
                        <span className="font-bold text-slate-700 text-sm">{company.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
