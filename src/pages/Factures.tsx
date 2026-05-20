import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, Eye, CheckCircle, Clock, AlertCircle, ArrowUpRight, X, Download, Table2 } from 'lucide-react';
import { Facture, Commande, User, loadData, saveRecord, deleteRecord, genId, loadCompanyProfile } from '../types';
import { printFacture, exportFacturesCSV } from '../utils/print';
import { printElement } from '../utils/pdf';
import { InvoicePRO } from '../components/InvoicePRO';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function Factures() {
  const { lang, isAr } = useLang();
  const company = loadCompanyProfile();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Facture>>({});
  const [viewFacture, setViewFacture] = useState<Facture | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  useEffect(() => {
    Promise.all([
      loadData<Facture>('factures'),
      loadData<Commande>('commandes'),
      loadData<User>('utilisateurs')
    ]).then(([facs, cmds, users]) => {
      setFactures(facs);
      setCommandes(cmds);
      setClients(users.filter(u => u.role === 'client'));
    });
  }, []);

  // Compute unique client names from users, orders, and invoices
  const uniqueClientNames = Array.from(new Set([
    ...clients.map(c => c.nom),
    ...commandes.map(c => c.client),
    ...factures.map(f => f.client)
  ])).filter(Boolean).sort();

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

    // Trouver le numéro le plus élevé pour l'année en cours
    const prefix = `FAC-${year}-`;
    const existingNums = factures
      .filter(f => f.numero.startsWith(prefix))
      .map(f => parseInt(f.numero.replace(prefix, '')))
      .filter(n => !isNaN(n));

    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;

    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm({
      numero: `${prefix}${String(nextNum).padStart(3, '0')}`,
      client: '',
      montant: 0,
      date: today,
      echeance: due.toISOString().split('T')[0],
      statut: 'en_attente',
      typeDoc: 'facture',
      // commandeId is omitted to allow null by default
    });
    setIsNewClient(false);
    setShowModal(true);
  }

  function openEdit(f: Facture) {
    setEditId(f.id);
    setForm({ ...f });
    
    // Check if client is in the known list
    const knownClient = uniqueClientNames.includes(f.client);
    setIsNewClient(!knownClient && !!f.client);
    
    setShowModal(true);
  }

  async function save() {
    if (!form.numero || !form.client) return;
    const isNew = !editId;

    // Vérifier si le numéro de facture existe déjà
    if (isNew && factures.some(f => f.numero === form.numero)) {
      alert(`Le numéro de facture "${form.numero}" est déjà utilisé. Veuillez utiliser un numéro unique.`);
      return;
    }

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

  const cmdOf = (cmdId?: string | null) => cmdId ? commandes.find(c => c.id === cmdId) : undefined;

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
    { key: 'all', label: t('all', lang) },
    { key: 'payée', label: t('paid', lang) },
    { key: 'en_attente', label: t('pending', lang) },
    { key: 'impayée', label: t('unpaid', lang) },
    { key: 'en_retard', label: t('overdue', lang) },
  ] as const;

  return (
    <div className="space-y-6">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('factures_title', lang)}</h1>
          <p className="text-slate-500 mt-1">{factures.length} {t('factures_subtitle', lang)}</p>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
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
            <Plus className="w-4 h-4" /> {t('new_facture', lang)}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('total_invoiced', lang)}</p>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">MAD</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{t('paid', lang)}</p>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.payee.toLocaleString()}</p>
          <p className="text-xs text-emerald-500 mt-1">MAD</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{t('pending', lang)}</p>
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.attente.toLocaleString()}</p>
          <p className="text-xs text-amber-500 mt-1">MAD</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">{t('overdue', lang)}</p>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.retard.toLocaleString()}</p>
          <p className="text-xs text-red-500 mt-1">MAD</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_placeholder', lang)}
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
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${filterStatut === f.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('num_facture', lang)}</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('client', lang)}</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('commande_liee', lang)}</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('montant', lang)}</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('date_emission', lang)}</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('date_echeance', lang)}</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('statut', lang)}</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('actions', lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => {
                const cmd = cmdOf(f.commandeId || undefined);
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
                        <span className="text-sm font-semibold text-slate-700">
                          {f.numero}
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                            {f.typeDoc === 'devis' ? 'Devis' : f.typeDoc === 'recu' ? 'Reçu d\'avance' : 'Facture'}
                          </span>
                        </span>
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
                        <button onClick={() => printFacture(f, cmdOf(f.commandeId || undefined))} title="Télécharger PDF" className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition">
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
            <p className="text-slate-500 font-semibold">{t('no_facture', lang)}</p>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{t('delete_confirm', lang)}</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
                {t('cancel', lang)}
              </button>
              <button onClick={() => remove(confirmDelete)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition">
                {t('delete', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewFacture && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Détails de la Facture</h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setViewFacture(null)} className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">Fermer</button>
                <button 
                  onClick={() => printElement(`facture-pro-view-${viewFacture.id}`)}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest"
                >
                  <Download className="w-4 h-4" /> Imprimer / PDF
                </button>
              </div>
            </div>

            <div className="p-12 bg-slate-50/50">
               <InvoicePRO 
                 id={`facture-pro-view-${viewFacture.id}`}
                 facture={viewFacture}
                 commande={commandes.find(c => c.id === viewFacture.commandeId)}
                 company={company}
               />
            </div>

            {viewFacture.statut !== 'payée' && (
              <div className="p-8 border-t border-slate-100 bg-white flex justify-center">
                <button
                  onClick={() => markPaid(viewFacture.id)}
                  className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest"
                >
                  <CheckCircle className="w-5 h-5" /> Marquer comme payée
                </button>
              </div>
            )}
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
                  {!isNewClient ? (
                    <select
                      value={form.client || ''}
                      onChange={e => {
                        if (e.target.value === '__NEW__') {
                          setIsNewClient(true);
                          setForm({ ...form, client: '' });
                        } else {
                          setForm({ ...form, client: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">Sélectionner un client</option>
                      <option value="__NEW__" className="font-bold text-indigo-600">➕ Nouveau Client (Saisir)</option>
                      {uniqueClientNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nom du nouveau client..."
                        value={form.client || ''}
                        onChange={e => setForm({ ...form, client: e.target.value })}
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={() => { setIsNewClient(false); setForm({ ...form, client: '' }); }}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type de document</label>
                <select
                  value={form.typeDoc || 'facture'}
                  onChange={e => setForm({ ...form, typeDoc: e.target.value as Facture['typeDoc'] })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="facture">Facture</option>
                  <option value="devis">Devis</option>
                  <option value="recu">Reçu de paiement / Avance</option>
                </select>
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
