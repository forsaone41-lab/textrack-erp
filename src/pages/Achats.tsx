import React, { useState, useEffect, useMemo } from 'react';
import { useLang } from '../contexts/LangContext';
import { ShoppingCart, Clock, CheckCircle, Plus, Trash2, Edit2, PackageOpen, X, Search, Coins, User, ArrowRight, Tag, AlertTriangle, Calculator, Scissors, CheckCircle2, Factory } from 'lucide-react';
import { loadData, saveRecord, deleteRecord, genId, StockTissu, StockFourniture } from '../types';

export interface BesoinAchat {
  id: string;
  client: string;
  commandeRef?: string;
  article: string;
  couleur?: string;
  quantiteRequise: number; // Mètres
  quantiteKg?: number; // Kg
  unite: string;
  statut: 'a_acheter' | 'commande' | 'recu';
  dateDemande: string;
  categorie: 'tissus' | 'fournitures';
  prixUnitaire?: number;
  fournisseur?: string;
  quantiteLivre?: number;
}

export default function Achats() {
  const { isAr } = useLang();
  const [besoins, setBesoins] = useState<BesoinAchat[]>([]);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<Partial<BesoinAchat>>({
    categorie: 'tissus',
    unite: 'm',
    statut: 'a_acheter',
    quantiteRequise: 0,
    dateDemande: new Date().toISOString().split('T')[0],
    commandeRef: ''
  });

  const [showReceiveModal, setShowReceiveModal] = useState<BesoinAchat | null>(null);
  const [receiveForm, setReceiveForm] = useState({
    quantite: 0,
    prixUnitaire: 0,
    fournisseur: '',
    seuilAlerte: 10
  });

  const [clients, setClients] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      loadData<BesoinAchat>('achats'),
      loadData<any>('users'),
      loadData<any>('factures'),
      loadData<any>('commandes')
    ]).then(([achatsData, usersData, facturesData, commandesData]) => {
      setBesoins(achatsData || []);
      setClients((usersData || []).filter((u: any) => u.role === 'client'));
      setFactures(facturesData || []);
      setCommandes(commandesData || []);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.article || !form.client || !form.quantiteRequise) return;
    
    const newItem: BesoinAchat = {
      id: genId(),
      client: form.client,
      commandeRef: form.commandeRef || '',
      article: form.article,
      couleur: form.couleur || '',
      quantiteRequise: Number(form.quantiteRequise),
      quantiteKg: form.quantiteKg ? Number(form.quantiteKg) : undefined,
      unite: form.unite || 'm',
      statut: 'a_acheter',
      dateDemande: form.dateDemande || new Date().toISOString().split('T')[0],
      categorie: form.categorie || 'tissus'
    };

    const updated = [...besoins, newItem];
    setBesoins(updated);
    await saveRecord('achats', newItem as any);
    
    setShowAddModal(false);
    setForm({ categorie: 'tissus', unite: 'm', statut: 'a_acheter', quantiteRequise: 0, quantiteKg: undefined, dateDemande: new Date().toISOString().split('T')[0], commandeRef: '' });
  };

  const moveStatus = async (item: BesoinAchat, newStatus: 'a_acheter' | 'commande') => {
    const updatedItem = { ...item, statut: newStatus };
    const updated = besoins.map(b => b.id === item.id ? updatedItem : b);
    setBesoins(updated);
    await saveRecord('achats', updatedItem as any);
  };

  const handleDelete = async (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد أنك تريد حذف هذا الطلب؟' : 'Voulez-vous vraiment supprimer cet achat ?')) {
      const updated = besoins.filter(b => b.id !== id);
      setBesoins(updated);
      await deleteRecord('achats', id);
    }
  };

  const handleReceive = async () => {
    if (!showReceiveModal || !receiveForm.quantite || !receiveForm.prixUnitaire) return;
    
    const b = showReceiveModal;
    const updatedItem: BesoinAchat = { 
      ...b, 
      statut: 'recu', 
      quantiteLivre: receiveForm.quantite, 
      prixUnitaire: receiveForm.prixUnitaire, 
      fournisseur: receiveForm.fournisseur 
    };
    
    // 1. Mark as received in Achats
    const updatedBesoins = besoins.map(item => item.id === b.id ? updatedItem : item);
    setBesoins(updatedBesoins);
    await saveRecord('achats', updatedItem as any);

    // 2. Add to Stock
    const totalCost = receiveForm.quantite * receiveForm.prixUnitaire;
    const dateNow = new Date().toISOString().split('T')[0];

    if (b.categorie === 'tissus') {
      const newTissu: StockTissu = {
        id: genId(),
        type: b.article,
        couleur: b.couleur || 'Non spécifié',
        metrage: receiveForm.quantite,
        metrageTotal: receiveForm.quantite,
        prixMetre: receiveForm.prixUnitaire,
        seuilAlerte: receiveForm.seuilAlerte,
        fournisseur: receiveForm.fournisseur,
        dateReception: dateNow,
      };
      await saveRecord('tissus', newTissu);
    } else {
      const newFourni: StockFourniture = {
        id: genId(),
        nom: b.article,
        categorie: 'autre',
        description: `Commandé pour client: ${b.client}`,
        quantite: receiveForm.quantite,
        prixUnitaire: receiveForm.prixUnitaire,
        unite: b.unite,
        stockMin: receiveForm.seuilAlerte,
        fournisseur: receiveForm.fournisseur,
      };
      await saveRecord('fournitures', newFourni);
    }

    // 3. Add to Finance (Charges)
    const chargeData = {
      id: genId(),
      designation: `Achat (${b.categorie}): ${b.article} ${b.couleur || ''} pour ${b.client}`,
      categorie: 'achats_matieres',
      montant: totalCost,
      date: dateNow,
      statut: 'payé',
      recurrence: 'ponctuel',
      fournisseur: receiveForm.fournisseur || 'Fournisseur',
      notes: `Ajouté automatiquement depuis les Achats. Réf Besoin: ${b.id.substring(0,6)}`,
    };
    await saveRecord('charges', chargeData);

    setShowReceiveModal(null);
  };

  const filtered = useMemo(() => besoins.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.client.toLowerCase().includes(q) || b.article.toLowerCase().includes(q) || (b.couleur && b.couleur.toLowerCase().includes(q));
  }), [besoins, search]);

  const cols = [
    { id: 'a_acheter', title: isAr ? '🛒 يجب شراؤها' : '🛒 À Acheter', color: 'bg-rose-50 border-rose-200', text: 'text-rose-700', icon: ShoppingCart },
    { id: 'commande', title: isAr ? '⏳ قيد الطلب (فالسوق)' : '⏳ Commandé', color: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
    { id: 'recu', title: isAr ? '✅ تم الاستلام (فالستوك)' : '✅ Reçu (En Stock)', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? 'المشتريات والتموين' : 'Achats & Approvisionnement'}
            </h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
              {isAr ? 'تتبع طلبات السلع، الكليان، وإدخالها للستوك مباشرة' : 'Suivi des besoins matériels par client'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input 
              type="text" 
              placeholder={isAr ? "بحث عن كليان أو سلعة..." : "Chercher..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-10 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold w-64 focus:ring-2 focus:ring-indigo-500 transition-all`} 
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-black text-sm"
          >
            <Plus className="w-5 h-5" /> {isAr ? 'إضافة احتياج' : 'Nouveau Besoin'}
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cols.map(col => {
          const items = filtered.filter(b => b.statut === col.id);
          return (
            <div key={col.id} className="flex flex-col h-[calc(100vh-250px)]">
              <div className={`p-4 rounded-t-2xl border-t border-x border-b-0 ${col.color}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-black text-sm uppercase tracking-widest ${col.text}`}>{col.title}</h3>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black bg-white/50 ${col.text}`}>{items.length}</span>
                </div>
              </div>
              <div className="flex-1 bg-slate-50/50 border border-slate-200 rounded-b-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
                {items.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <col.icon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'فارغ' : 'Vide'}</span>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
                      {/* Delete button (top right corner) */}
                      <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-start gap-3 mb-4 pr-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                          {item.categorie === 'tissus' ? <Scissors className="w-5 h-5 text-indigo-500" /> : <PackageOpen className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.dateDemande}</p>
                          <h4 className="font-black text-slate-800 leading-tight">
                            {item.article} {item.couleur && <span className="text-slate-500">({item.couleur})</span>}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User className="w-3 h-3"/> {isAr ? 'الكليان' : 'Client'}</p>
                          <p className="text-xs font-black text-slate-700 truncate">{item.client}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calculator className="w-3 h-3"/> {isAr ? 'الكمية المطلوبة' : 'Qté Requise'}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.quantiteRequise > 0 && (
                              <p className="text-xs font-black text-indigo-600">{item.quantiteRequise} <span className="text-[10px]">m</span></p>
                            )}
                            {item.quantiteRequise > 0 && item.quantiteKg ? <span className="text-slate-300">|</span> : null}
                            {item.quantiteKg && (
                              <p className="text-xs font-black text-amber-600">{item.quantiteKg} <span className="text-[10px]">Kg</span></p>
                            )}
                            {!item.quantiteRequise && !item.quantiteKg && (
                              <p className="text-xs font-black text-slate-400">-</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        {item.statut === 'a_acheter' && (
                          <button onClick={() => moveStatus(item, 'commande')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-colors">
                            {isAr ? 'تم الطلب فالسوق' : 'Marquer Commandé'} <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {item.statut === 'commande' && (
                          <button onClick={() => { setReceiveForm(prev => ({ ...prev, quantite: item.quantiteRequise })); setShowReceiveModal(item); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm shadow-emerald-100">
                            <CheckCircle2 className="w-4 h-4" /> {isAr ? 'تأكيد الاستلام' : 'Confirmer Réception'}
                          </button>
                        )}
                        {item.statut === 'recu' && (
                          <div className="flex-1 flex items-center justify-center gap-2 py-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50/50 rounded-xl">
                            <Factory className="w-4 h-4" /> {isAr ? 'موجود في الستوك' : 'Ajouté au Stock'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-500" />
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">{isAr ? 'إضافة احتياج جديد' : 'Nouveau Besoin'}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'القسم' : 'Catégorie'}</label>
                  <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value as any, unite: e.target.value === 'tissus' ? 'm' : 'pcs'})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-500">
                    <option value="tissus">{isAr ? 'ثوب / قماش' : 'Tissus'}</option>
                    <option value="fournitures">{isAr ? 'لوازم (صدف، خيط...)' : 'Fournitures'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'اسم الكليان' : 'Client'}</label>
                  <input list="achats-clients" type="text" value={form.client || ''} onChange={e => setForm({...form, client: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-500" placeholder={isAr ? "أحمد..." : "Ahmed..."} />
                  <datalist id="achats-clients">
                    {Array.from(new Set(clients.map(c => c.name || c.nom))).map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {form.client && (() => {
                const clientName = form.client.trim().toLowerCase();
                const clientCommandes = commandes.filter(c => c.client && c.client.trim().toLowerCase() === clientName);
                const selectedCmd = form.commandeRef ? clientCommandes.find(c => c.reference === form.commandeRef) : null;
                
                return (
                  <div className="space-y-4">
                    {clientCommandes.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'مرتبطة بطلبية؟ (اختياري)' : 'Lié à une commande ? (Optionnel)'}</label>
                        <select 
                          value={form.commandeRef || ''} 
                          onChange={e => setForm({...form, commandeRef: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-500"
                        >
                          <option value="">{isAr ? '-- بدون طلبية --' : '-- Sans commande --'}</option>
                          {clientCommandes.map(cmd => (
                            <option key={cmd.id} value={cmd.reference}>{cmd.reference} - {cmd.modele}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedCmd && (
                      <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-indigo-500" />
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            {isAr ? 'التسبيق الخاص بالطلبية' : 'Avance de la Commande'}
                          </span>
                        </div>
                        <span className="text-sm font-black text-indigo-700">
                          {(() => {
                            const sum = factures
                              .filter(r => r.typeDoc === 'recu' && r.commandeId === selectedCmd.id && r.statut !== 'annulé')
                              .reduce((total, r) => total + (r.avance || 0), 0);
                            return sum.toLocaleString() + ' MAD';
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'اسم السلعة / الثوب' : 'Article / Tissu'}</label>
                <input list="achats-tissus" type="text" value={form.article || ''} onChange={e => setForm({...form, article: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-500" placeholder={isAr ? "قطن 100%..." : "Coton 100%..."} />
                <datalist id="achats-tissus">
                  {[
                    'Coton 100%', 'Coton / Élasthanne', 'Coton Peigné', 'Lin', 'Soie', 'Soie Naturelle', 'Laine', 'Cachemire',
                    'Polyester', 'Polyamide (Nylon)', 'Viscose', 'Lycra / Spandex', 'Acrylique', 'Rayonne',
                    'Jersey', 'French Terry', 'Fleece (Polaire)', 'Rib (Côte)', 'Interlock', 'Piqué (Polo)',
                    'Denim / Jean', 'Popeline', 'Gabardine', 'Flanelle', 'Tweed', 'Toile (Canvas)', 'Velours Côtelé', 'Velours Lisse',
                    'Crêpe', 'Crêpe Georgette', 'Chiffon', 'Mousseline', 'Satin', 'Tulle', 'Dentelle', 'Organza',
                    'Mlifa', 'Mlifa Cachemire', 'Jawhara', 'Tlija', 'Brocard', 'Sousdi', 'Drap de Soie', 'Sfifa'
                  ].map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'اللون (اختياري)' : 'Couleur (Optionnel)'}</label>
                  <input list="achats-couleurs" type="text" value={form.couleur || ''} onChange={e => setForm({...form, couleur: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-500" placeholder="Noir, Blanc..." />
                  <datalist id="achats-couleurs">
                    {['Noir', 'Blanc', 'Bleu Marine', 'Rouge', 'Vert', 'Gris', 'Beige', 'Rose', 'Jaune', 'Bordeaux', 'Ciel', 'Marron', 'Kaki', 'Argent', 'Or'].map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الكمية المطلوبة' : 'Quantités (Mètre & Kg)'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500">
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={form.quantiteKg || ''} 
                        onChange={e => setForm({...form, quantiteKg: Number(e.target.value)})} 
                        className="w-full py-3 px-3 text-sm font-bold outline-none bg-transparent" 
                        placeholder={isAr ? "بالكيلو" : "En Kg"}
                      />
                      <span className="flex items-center px-3 bg-slate-100 text-slate-500 text-xs font-bold border-l border-slate-200">
                        Kg
                      </span>
                    </div>
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500">
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={form.quantiteRequise || ''} 
                        onChange={e => setForm({...form, quantiteRequise: Number(e.target.value)})} 
                        className="w-full py-3 px-3 text-sm font-bold outline-none bg-transparent" 
                        placeholder={isAr ? "بالمتر" : "En M"}
                      />
                      <span className="flex items-center px-3 bg-slate-100 text-slate-500 text-xs font-bold border-l border-slate-200">
                        m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button onClick={handleAdd} className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                {isAr ? 'حفظ الطلب' : 'Enregistrer le besoin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal (Sync with Stock & Finance) */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden border border-emerald-100">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
            <button onClick={() => setShowReceiveModal(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <PackageOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{isAr ? 'تأكيد الاستلام' : 'Réception Stock'}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{showReceiveModal.article} - {showReceiveModal.client}</p>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-4 mb-6 border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {isAr ? 'ملاحظة هامة' : 'Note Importante'}</p>
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                {isAr ? 'هاد المعلومات غادي تمشي نيشان لـ Stock (المخزون) وغادي تسجل فـ المصاريف (Charges) أوتوماتيكيا باش الحساب يبقى مضبوط!' : 'Ces informations seront automatiquement synchronisées avec le Stock et la comptabilité (Charges).'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الكمية المستلمة' : 'Qté Livrée'} ({showReceiveModal.unite})</label>
                  <input type="number" value={receiveForm.quantite || ''} onChange={e => setReceiveForm({...receiveForm, quantite: Number(e.target.value)})} className="w-full bg-white border-2 border-emerald-100 rounded-xl py-3 px-4 text-base font-black text-slate-800 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'ثمن الوحدة (MAD)' : 'Prix Unitaire'}</label>
                  <div className="relative">
                    <input type="number" value={receiveForm.prixUnitaire || ''} onChange={e => setReceiveForm({...receiveForm, prixUnitaire: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-base font-black text-slate-800 outline-none focus:border-emerald-500 transition-colors" />
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'اسم المزود (الفورنيسور)' : 'Fournisseur'}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={receiveForm.fournisseur || ''} onChange={e => setReceiveForm({...receiveForm, fournisseur: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" placeholder={isAr ? "اختياري..." : "Optionnel..."} />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isAr ? 'المجموع (يضاف للمصاريف):' : 'Total (Charges):'}</span>
                <span className="text-lg font-black text-emerald-600">{(receiveForm.quantite * receiveForm.prixUnitaire).toLocaleString()} MAD</span>
              </div>
              
              <button onClick={handleReceive} disabled={!receiveForm.quantite || !receiveForm.prixUnitaire} className="w-full py-4 mt-2 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {isAr ? 'تأكيد الاستلام وحفظ في الستوك' : 'Valider & Ajouter au Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
