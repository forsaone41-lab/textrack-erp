import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, ExternalLink, MessageSquare, DollarSign, ChevronRight, TrendingUp, History, FileText, X, Printer, Download, Edit2 } from 'lucide-react';
import { Commande, loadData, genId, loadCompanyProfile } from '../types';
import { generatePDF } from '../utils/pdf';

interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  notes: string;
}

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
  const company = loadCompanyProfile();

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

  function openEdit(c: Client) {
    setEditId(c.id);
    setForm(c);
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
      email: form.email || '',
      adresse: form.adresse || '',
      ville: form.ville || '',
      notes: form.notes || '',
      role: 'client',
      password: 'client_default_pass',
      pinCode: isNew ? Math.floor(1000 + Math.random() * 9000).toString() : (form as any).pinCode
    };

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

  const activeClient = useMemo(() => {
    return clientStats.find(c => c.id === activeClientId);
  }, [clientStats, activeClientId]);

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
                <X className="w-5 h-5 text-slate-400" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Profil Client</h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Historique & Transactions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(activeClient)} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
              <button 
                onClick={() => setSelectedClient(activeClient)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                <Printer className="w-4 h-4" /> Imprimer Situation
              </button>
            </div>
          </div>

          {/* Client Top Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[80px] -z-0 opacity-50" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl mb-6">
                  {(activeClient.nom || 'C')[0].toUpperCase()}
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">{activeClient.nom}</h2>
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-sm">{activeClient.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-sm">{activeClient.ville || 'Ville non spécifiée'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-200">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">Volume d'Affaires</p>
                <p className="text-4xl font-black">{(activeClient.totalAffaire || 0).toLocaleString()} <span className="text-sm">MAD</span></p>
                <div className="mt-8 flex items-center gap-2">
                  <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase">{activeClient.cmdCount} Commandes</div>
                </div>
              </div>
              <div className="bg-emerald-500 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-100">
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-4">Total Payé</p>
                <p className="text-4xl font-black">{(activeClient.totalPaye || 0).toLocaleString()} <span className="text-sm">MAD</span></p>
                <div className="mt-8 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${((activeClient.totalPaye || 0) / (activeClient.totalAffaire || 1)) * 100}%` }} />
                </div>
              </div>
              <div className="bg-rose-500 p-8 rounded-[40px] text-white shadow-xl shadow-rose-100">
                <p className="text-[10px] font-black text-rose-100 uppercase tracking-[0.2em] mb-4">Reste à Payer</p>
                <p className="text-4xl font-black">{(activeClient.totalDette || 0).toLocaleString()} <span className="text-sm">MAD</span></p>
                <p className="mt-8 text-[10px] font-black uppercase opacity-60">Balance débitrice actuelle</p>
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Historique des Commandes</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{(() => {
                const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === (activeClient.nom || '').toLowerCase());
                return clientCmds.length;
              })()} Transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Réf & Modèle</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantité</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant Total</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avance</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(() => {
                    const clientCmds = (commandes || []).filter(c => (c.client || '').toLowerCase() === (activeClient.nom || '').toLowerCase());
                    return clientCmds.map(cmd => {
                      const total = (cmd.quantite || 0) * (cmd.prix || 0);
                      const remains = total - (cmd.avance || 0);
                      return (
                        <tr key={cmd.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{cmd.reference}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{cmd.modele}</p>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(cmd.dateCommande).toLocaleDateString()}</td>
                          <td className="px-8 py-5 text-sm font-black text-slate-700">{cmd.quantite} pcs</td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-900">{total.toLocaleString()} MAD</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs font-black text-emerald-600">{cmd.avance?.toLocaleString() || 0} MAD</p>
                            {remains > 0 && <p className="text-[9px] font-bold text-rose-400 mt-0.5">Reste: {remains.toLocaleString()} MAD</p>}
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
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Aucune commande trouvée</p>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gestion Clients</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Répertoire et suivi financier des clients</p>
            </div>
            <button 
              onClick={openCreate}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouveau Client
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Clients</p>
              <p className="text-3xl font-black text-slate-900">{clients.length}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">{clientActifCount} actifs cette période</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 shadow-sm">
              <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-1">Chiffre d'Affaires</p>
              <p className="text-3xl font-black text-emerald-700">
                {clientStats.reduce((sum, c) => sum + (c.totalAffaire || 0), 0).toLocaleString()} <span className="text-sm">MAD</span>
              </p>
            </div>
            <div className="bg-rose-50 p-6 rounded-[32px] border-2 border-rose-100 shadow-sm">
              <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em] mb-1">Dette Globale</p>
              <p className="text-3xl font-black text-rose-700">
                {(totalDetteGlobale || 0).toLocaleString()} <span className="text-sm">MAD</span>
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un client (Nom, Tél...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-[32px] border-2 border-slate-50 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {(c.nom || 'C')[0].toUpperCase()}
                      </div>
                      <div className="cursor-pointer group/name" onClick={() => { setActiveClientId(c.id); setView('detail'); }}>
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px] group-hover/name:text-indigo-600 transition-colors">{c.nom || 'Client Sans Nom'}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.ville || 'Ville non spécifiée'}</p>
                          {(c as any).pinCode && (
                            <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200">
                              PIN: {(c as any).pinCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => openEdit(c)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-6">
                    {c.telephone && (
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone className="w-3.5 h-3.5" /></div>
                        <span className="text-xs font-bold">{c.telephone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5" /></div>
                      <span className="text-xs font-bold">{c.cmdCount || 0} Commandes passées</span>
                    </div>
                  </div>

                  {/* Mini Financial Summary */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl mb-4">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Réglé</p>
                      <p className="text-xs font-black text-emerald-600">{(c.totalPaye || 0).toLocaleString()} MAD</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reste</p>
                      <p className="text-xs font-black text-rose-600">{(c.totalDette || 0).toLocaleString()} MAD</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setActiveClientId(c.id); setView('detail'); }}
                      className="flex-1 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Dossier Client
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                {editId ? 'Modifier le Client' : 'Nouveau Client'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom Complet / Société *</label>
                <input 
                  value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Téléphone</label>
                  <input 
                    value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ville</label>
                  <input 
                    value={form.ville || ''} onChange={e => setForm({...form, ville: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                <input 
                  value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adresse</label>
                <textarea 
                  value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 h-20"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Annuler</button>
              <button 
                onClick={save}
                className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Enregistrer
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
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Situation Client</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedClient.nom || 'Client'}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className="py-24 px-12" id="printable-situation">
              {/* Beya Header */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">{company.name}</h1>
                  <p className="text-[10px] font-bold text-indigo-600 tracking-[0.3em] uppercase">Rapport de Situation Financière</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 uppercase">Généré le</p>
                  <p className="text-xs text-slate-400 font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Client Info Block */}
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client</h3>
                  <p className="text-xl font-black text-slate-900">{selectedClient.nom || 'Sans Nom'}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1">{selectedClient.telephone || 'N/A'}</p>
                  <p className="text-xs text-slate-400 mt-2 italic">{selectedClient.adresse || 'Pas d\'adresse'}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl text-white">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Balance Actuelle</h3>
                  <p className="text-3xl font-black text-rose-400">
                    {((selectedClient as any).totalDette || 0).toLocaleString()} <span className="text-sm">MAD</span>
                  </p>
                  <p className="text-[10px] font-bold text-white/60 mt-2 uppercase">Total Dû par le client</p>
                </div>
              </div>

              {/* Summary Table */}
              <div className="mb-12">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Récapitulatif des Commandes</h3>
                <div className="space-y-3">
                  {(commandes || [])
                    .filter(c => (c.client || '').toLowerCase() === (selectedClient.nom || '').toLowerCase())
                    .map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                            <FileText className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{c.reference}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{c.modele}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900 tracking-tight">
                            {((c.quantite || 0) * (c.prix || 0)).toLocaleString()} DH
                          </p>
                          <div className="flex flex-col items-end gap-0.5">
                            <p className="text-[8px] font-black text-emerald-600 uppercase">Payé: {(c.avance || 0).toLocaleString()} DH</p>
                            <p className="text-[8px] font-black text-rose-600 uppercase">Reste: {(((c.quantite || 0) * (c.prix || 0)) - (c.avance || 0)).toLocaleString()} DH</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-8 bg-indigo-50 rounded-[32px] border-2 border-indigo-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total des Affaires</p>
                  <p className="text-2xl font-black text-slate-900">{((selectedClient as any).totalAffaire || 0).toLocaleString()} MAD</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Déjà Réglé</p>
                  <p className="text-2xl font-black text-emerald-600">{((selectedClient as any).totalPaye || 0).toLocaleString()} MAD</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 grid grid-cols-3 gap-4">
              <button 
                onClick={() => window.print()}
                className="h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
              <button 
                onClick={() => generatePDF('printable-situation', `Situation_${selectedClient.nom.replace(/\s+/g, '_')}`)}
                className="h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                Exporter PDF
              </button>
              <button 
                onClick={() => setSelectedClient(null)}
                className="h-14 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-rose-600 hover:text-white"
              >
                <X className="w-5 h-5" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
