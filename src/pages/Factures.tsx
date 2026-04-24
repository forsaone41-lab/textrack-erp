import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, Eye, CheckCircle, Clock, AlertCircle, ArrowUpRight, X, Download, Table2 } from 'lucide-react';
import { Facture, Commande, loadData, saveRecord, deleteRecord, genId, loadCompanyProfile } from '../types';
import { printFacture, exportFacturesCSV } from '../utils/print';

export default function Factures() {
  const company = loadCompanyProfile();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Facture>>({});
  const [viewFacture, setViewFacture] = useState<Facture | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      loadData<Facture>('factures'),
      loadData<Commande>('commandes')
    ]).then(([facs, cmds]) => {
      setFactures(facs);
      setCommandes(cmds);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const isOverdue = (f: Facture) =>
    !!f.echeance && f.echeance < today && f.statut !== 'payée';

  const filtered = factures.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = f.numero.toLowerCase().includes(q) || f.client.toLowerCase().includes(q);
    const matchStatut =
      filterStatut === 'all' ||
      (filterStatut === 'en_retard' ? isOverdue(f) : f.statut === filterStatut);
    return matchSearch && matchStatut;
  });

  const stats = {
    total: factures.reduce((a, f) => a + f.montant, 0),
    payee: factures.filter(f => f.statut === 'payée').reduce((a, f) => a + f.montant, 0),
    attente: factures.filter(f => f.statut === 'en_attente' && !isOverdue(f)).reduce((a, f) => a + f.montant, 0),
    retard: factures.filter(f => isOverdue(f)).reduce((a, f) => a + f.montant, 0),
    countPayee: factures.filter(f => f.statut === 'payée').length,
    countAttente: factures.filter(f => f.statut === 'en_attente' && !isOverdue(f)).length,
    countRetard: factures.filter(f => isOverdue(f)).length,
  };

  function openCreate() {
    setEditId(null);
    const year = new Date().getFullYear();
    const count = factures.length + 1;
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm({
      numero: `FAC-${year}-${String(count).padStart(3, '0')}`,
      client: '',
      montant: 0,
      date: today,
      echeance: due.toISOString().split('T')[0],
      statut: 'en_attente',
      // commandeId is omitted to allow null by default
    });
    setShowModal(true);
  }

  function openEdit(f: Facture) {
    setEditId(f.id);
    setForm({ ...f });
    setShowModal(true);
  }

  async function save() {
    if (!form.numero || !form.client) return;
    const isNew = !editId;
    const facId = editId || genId();
    const facData = { id: facId, ...form } as Facture;
    if (!facData.commandeId) facData.commandeId = null;

    const updated = isNew
      ? [...factures, facData]
      : factures.map(f => f.id === editId ? facData : f);

    setFactures(updated);
    setShowModal(false);
    await saveRecord('factures', facData);
  }

  async function markPaid(id: string) {
    const fac = factures.find(f => f.id === id);
    if (!fac) return;
    
    const updatedFac = { ...fac, statut: 'payée' as const };
    const updated = factures.map(f => f.id === id ? updatedFac : f);
    
    setFactures(updated);
    if (viewFacture?.id === id) setViewFacture({ ...viewFacture, statut: 'payée' });
    
    await saveRecord('factures', updatedFac);
  }

  async function remove(id: string) {
    const updated = factures.filter(f => f.id !== id);
    setFactures(updated);
    setConfirmDelete(null);
    await deleteRecord('factures', id);
  }

  const cmdOf = (cmdId?: string) => cmdId ? commandes.find(c => c.id === cmdId) : undefined;

  function getStatutInfo(f: Facture) {
    if (isOverdue(f)) return { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'En retard' };
    if (f.statut === 'payée') return { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Payée' };
    if (f.statut === 'en_attente') return { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', label: 'En attente' };
    return { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Impayée' };
  }

  function daysLeft(echeance: string) {
    return Math.ceil((new Date(echeance).getTime() - Date.now()) / 86400000);
  }

  function fmtDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const FILTERS = [
    { key: 'all', label: 'Toutes' },
    { key: 'payée', label: 'Payées' },
    { key: 'en_attente', label: 'En attente' },
    { key: 'impayée', label: 'Impayées' },
    { key: 'en_retard', label: 'En retard' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Factures</h1>
          <p className="text-sm text-slate-500">{factures.length} facture{factures.length !== 1 ? 's' : ''} enregistrée{factures.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportFacturesCSV(filtered)}
            title="Exporter CSV"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm font-semibold shadow-sm"
          >
            <Table2 className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouvelle Facture
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Facturé</p>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">MAD · {factures.length} factures</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Payées</p>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.payee.toLocaleString()}</p>
          <p className="text-xs text-emerald-500 mt-1">MAD · {stats.countPayee} facture{stats.countPayee !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">En Attente</p>
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.attente.toLocaleString()}</p>
          <p className="text-xs text-amber-500 mt-1">MAD · {stats.countAttente} facture{stats.countAttente !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">En Retard</p>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.retard.toLocaleString()}</p>
          <p className="text-xs text-red-500 mt-1">MAD · {stats.countRetard} en retard</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° facture ou client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatut(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                filterStatut === f.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">N° Facture</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Client</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Commande</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Montant</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Émission</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Échéance</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Statut</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => {
                const cmd = cmdOf(f.commandeId);
                const si = getStatutInfo(f);
                const overdue = isOverdue(f);
                const days = f.echeance ? daysLeft(f.echeance) : null;
                return (
                  <tr key={f.id} className={`hover:bg-slate-50/60 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-red-100' : 'bg-indigo-50'}`}>
                          <FileText className={`w-3.5 h-3.5 ${overdue ? 'text-red-500' : 'text-indigo-500'}`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{f.numero}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{f.client}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {cmd ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                          <ArrowUpRight className="w-3 h-3" />{cmd.reference}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-800">{f.montant.toLocaleString()} <span className="font-normal text-slate-400 text-xs">MAD</span></span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm text-slate-500">{fmtDate(f.date)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {f.echeance ? (
                        <div>
                          <p className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>{fmtDate(f.echeance)}</p>
                          {days !== null && f.statut !== 'payée' && (
                            <p className={`text-[11px] mt-0.5 font-medium ${days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {days < 0 ? `${Math.abs(days)}j de retard` : days === 0 ? "Auj." : `J-${days}`}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${si.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                        {si.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewFacture(f)} title="Aperçu" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => printFacture(f, cmdOf(f.commandeId))} title="Télécharger PDF" className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {f.statut !== 'payée' && (
                          <button onClick={() => markPaid(f.id)} title="Marquer payée" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => openEdit(f)} title="Modifier" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(f.id)} title="Supprimer" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">Aucune facture trouvée</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterStatut !== 'all' ? 'Modifiez vos filtres' : 'Créez votre première facture'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Supprimer cette facture ?</h3>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
                Annuler
              </button>
              <button onClick={() => remove(confirmDelete)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {viewFacture && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 border border-slate-200">
                      <img src={company.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight uppercase">{company.name}</h2>
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest">{company.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Facture</p>
                  <p className="text-2xl font-bold">{viewFacture.numero}</p>
                  <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                    viewFacture.statut === 'payée' ? 'bg-emerald-500/20 text-emerald-300' :
                    isOverdue(viewFacture) ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {getStatutInfo(viewFacture).label.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Facturer à</p>
                  <p className="text-xl font-bold text-slate-800">{viewFacture.client}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Date d'émission</span>
                    <span className="text-xs font-semibold text-slate-700">{fmtDate(viewFacture.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Date d'échéance</span>
                    <span className={`text-xs font-semibold ${isOverdue(viewFacture) ? 'text-red-600' : 'text-slate-700'}`}>
                      {fmtDate(viewFacture.echeance)}
                    </span>
                  </div>
                  {cmdOf(viewFacture.commandeId) && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Commande</span>
                      <span className="text-xs font-semibold text-indigo-600">{cmdOf(viewFacture.commandeId)?.reference}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Description</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Qté</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Prix U.</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const cmd = cmdOf(viewFacture.commandeId);
                      return cmd ? (
                        <tr>
                          <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{cmd.modele}</td>
                          <td className="px-4 py-3.5 text-sm text-center text-slate-600">{cmd.quantite} pcs</td>
                          <td className="px-4 py-3.5 text-sm text-right text-slate-600">{cmd.prix.toLocaleString()} MAD</td>
                          <td className="px-4 py-3.5 text-sm text-right font-bold text-slate-800">{(cmd.quantite * cmd.prix).toLocaleString()} MAD</td>
                        </tr>
                      ) : (
                        <tr>
                          <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">Prestation</td>
                          <td className="px-4 py-3.5 text-sm text-center text-slate-600">1</td>
                          <td className="px-4 py-3.5 text-sm text-right text-slate-600">{viewFacture.montant.toLocaleString()} MAD</td>
                          <td className="px-4 py-3.5 text-sm text-right font-bold text-slate-800">{viewFacture.montant.toLocaleString()} MAD</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="bg-slate-900 text-white rounded-xl px-6 py-4 text-right min-w-52">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Montant Total TTC</p>
                  <p className="text-3xl font-black">{viewFacture.montant.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm mt-0.5">Dirhams (MAD)</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <p className="text-xs text-slate-400 font-medium uppercase">{company.name} {company.subtitle}</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => printFacture(viewFacture, cmdOf(viewFacture.commandeId))}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Télécharger PDF
                </button>
                {viewFacture.statut !== 'payée' && (
                  <button
                    onClick={() => markPaid(viewFacture.id)}
                    className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold"
                  >
                    ✓ Marquer Payée
                  </button>
                )}
                <button
                  onClick={() => setViewFacture(null)}
                  className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{editId ? 'Modifier la Facture' : 'Nouvelle Facture'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">N° Facture *</label>
                  <input
                    value={form.numero || ''}
                    onChange={e => setForm({ ...form, numero: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Client *</label>
                  <input
                    value={form.client || ''}
                    onChange={e => setForm({ ...form, client: e.target.value })}
                    placeholder="Nom du client"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Commande associée</label>
                <select
                  value={form.commandeId || ''}
                  onChange={e => {
                    const cmd = commandes.find(c => c.id === e.target.value);
                    setForm({
                      ...form,
                      commandeId: e.target.value,
                      client: cmd?.client || form.client || '',
                      montant: cmd ? cmd.quantite * cmd.prix : form.montant || 0,
                    });
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">— Sans commande —</option>
                  {commandes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.reference} — {c.client} ({(c.quantite * c.prix).toLocaleString()} MAD)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Montant (MAD)</label>
                <input
                  type="number"
                  value={form.montant || 0}
                  onChange={e => setForm({ ...form, montant: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date d'émission</label>
                  <input
                    type="date"
                    value={form.date || ''}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date d'échéance</label>
                  <input
                    type="date"
                    value={form.echeance || ''}
                    onChange={e => setForm({ ...form, echeance: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Statut</label>
                <select
                  value={form.statut || 'en_attente'}
                  onChange={e => setForm({ ...form, statut: e.target.value as Facture['statut'] })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="en_attente">En attente</option>
                  <option value="payée">Payée</option>
                  <option value="impayée">Impayée</option>
                </select>
              </div>

              {(form.montant ?? 0) > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">Montant à facturer</span>
                  <span className="text-base font-bold text-indigo-700">{Number(form.montant).toLocaleString()} MAD</span>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                Annuler
              </button>
              <button onClick={save} className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm">
                {editId ? 'Enregistrer' : 'Créer la Facture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
