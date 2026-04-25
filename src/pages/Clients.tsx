import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, ExternalLink, MessageSquare, DollarSign, ChevronRight, TrendingUp, History, FileText, X, Printer, Download, Edit2 } from 'lucide-react';
import { Commande, loadData, saveRecord, genId, loadCompanyProfile } from '../types';

interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  notes: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const company = loadCompanyProfile();

  useEffect(() => {
    Promise.all([
      loadData<Client>('clients_profiles'),
      loadData<Commande>('commandes')
    ]).then(([storedClients, storedCommandes]) => {
      // If no clients yet, derive from existing commandes with safety
      if (storedClients.length === 0 && storedCommandes.length > 0) {
        const uniqueNames = [...new Set(storedCommandes.map(c => c.clientNom).filter(Boolean))];
        const derived = uniqueNames.map(name => ({
          id: genId(),
          nom: name || 'Client Inconnu',
          telephone: '',
          email: '',
          adresse: '',
          ville: '',
          notes: ''
        }));
        setClients(derived);
      } else {
        setClients(storedClients);
      }
      setCommandes(storedCommandes || []);
    }).catch(err => console.error("Error loading clients data:", err));
  }, []);

  const clientStats = useMemo(() => {
    if (!clients) return [];
    return clients.map(client => {
      const clientName = (client.nom || '').toLowerCase();
      const clientCmds = (commandes || []).filter(c => (c.clientNom || '').toLowerCase() === clientName);
      const totalAffaire = clientCmds.reduce((sum, c) => sum + (c.total || 0), 0);
      const totalPaye = clientCmds.reduce((sum, c) => sum + (c.avance || 0), 0);
      const totalDette = totalAffaire - totalPaye;
      const cmdCount = clientCmds.length;
      return { ...client, totalAffaire, totalPaye, totalDette, cmdCount };
    });
  }, [clients, commandes]);

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
    const clientData = { id: cId, ...form } as Client;

    const updated = isNew
      ? [...clients, clientData]
      : clients.map(c => c.id === editId ? clientData : c);

    setClients(updated);
    setShowModal(false);
    await saveRecord('clients_profiles', clientData);
  }

  return (
    <div className="space-y-6">
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
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px]">{c.nom || 'Client Sans Nom'}</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.ville || 'Ville non spécifiée'}</p>
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
                  onClick={() => setSelectedClient(c)}
                  className="flex-1 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Situation
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Situation Client</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedClient.nom || 'Client'}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className="p-12" id="printable-situation">
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
                  {commandes
                    .filter(c => (c.clientNom || '').toLowerCase() === (selectedClient.nom || '').toLowerCase())
                    .map(cmd => (
                      <div key={cmd.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">CMD-{cmd.id.slice(-4)}</p>
                          <p className="text-[10px] font-bold text-slate-400">{cmd.designation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">{(cmd.total || 0).toLocaleString()} MAD</p>
                          <p className={`text-[10px] font-black uppercase ${cmd.statut === 'payé' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {cmd.statut}
                          </p>
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

            <div className="p-8 bg-slate-50 grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.print()}
                className="h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/20"
              >
                <Printer className="w-5 h-5" />
                Imprimer le rapport
              </button>
              <button 
                className="h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-[20px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                <Download className="w-5 h-5" />
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
