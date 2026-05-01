import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Ruler, Calculator, Camera, FileText, Download, MessageCircle, X, ChevronRight, Upload, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  FicheTechnique, StockTissu, loadData, saveRecord, deleteRecord, genId,
} from '../types';
import { printFicheTechnique as printFT } from '../utils/print';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

function FicheCard({ f, openEdit, remove, downloadFile, printFicheTechnique, onViewMesures, onShare }: {
  f: FicheTechnique;
  openEdit: (f: FicheTechnique) => void;
  remove: (id: string) => void;
  downloadFile: (data: string, filename: string) => void;
  printFicheTechnique: (f: FicheTechnique) => void;
  onViewMesures: (f: FicheTechnique) => void;
  onShare: (f: FicheTechnique) => void;
  onLaunchSample: (f: FicheTechnique) => void;
}) {
  const { lang, isAr } = useLang();
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden group flex flex-col ${isAr ? 'text-right' : 'text-left'}`}>
      {/* Main Content Area */}
      <div className={`flex flex-col sm:flex-row flex-1 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        {/* Photo Section */}
        <div className={`relative w-full sm:w-56 aspect-[4/5] sm:aspect-auto bg-slate-50 border-slate-100/50 overflow-hidden group/image ${isAr ? 'border-l' : 'border-r'}`}>
          {f.photo ? (
            <img
              src={f.photo}
              alt={f.modele}
              className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
              <Camera className="w-12 h-12 mb-3 opacity-20" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">{t('aucun_visuel', lang)}</span>
            </div>
          )}

          {/* Badges & Quick Actions on Image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            {f.photo && (
              <button
                onClick={() => downloadFile(f.photo!, `Photo_${f.modele}.png`)}
                className="w-full py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-white hover:text-indigo-600 transition-all"
              >
                <Download className="w-3 h-3" /> {t('download_label', lang)}
              </button>
            )}
          </div>

          {f.patronagePhoto && (
            <div className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'}`}>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full shadow-lg border border-indigo-400/30">
                <FileText className="w-3 h-3" /> {t('patron_ok', lang)}
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 p-6 flex flex-col">
          <div className={`flex justify-between items-start mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`space-y-1 ${isAr ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{f.modele}</h3>
                {f.type && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">{f.type}</span>
                )}
              </div>
              <p className={`text-sm font-medium text-slate-500 flex items-center gap-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                {f.client}
              </p>
            </div>

            <div className={`flex gap-1 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => openEdit(f)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => remove(f.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {f.description && (
            <p className="text-xs text-slate-400 line-clamp-2 italic mb-6 leading-relaxed">"{f.description}"</p>
          )}

          <div className="mt-auto space-y-6">
            {/* Downloads Grid */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{t('assets_docs', lang)}</p>
              <div className="flex flex-col gap-2">
                <div className={`grid grid-cols-2 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <button
                    disabled={!f.patronagePhoto}
                    onClick={() => downloadFile(f.patronagePhoto!, f.patronageFileName || `Patron_${f.modele}`)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${f.patronagePhoto
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200'
                      : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                      }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> {isAr ? 'الباتيرون' : 'PATRON'}
                  </button>
                  <button
                    onClick={() => printFicheTechnique(f)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                  >
                    <Download className="w-3.5 h-3.5" /> {isAr ? 'ملف PDF' : 'FICHE PDF'}
                  </button>
                </div>
                <button
                  onClick={() => onViewMesures(f)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-50 hover:border-indigo-500 transition-all shadow-sm"
                >
                  <Ruler className="w-3.5 h-3.5" /> {t('voir_mesures', lang)}
                </button>
                {/* Button 'ENVOYER AU CLIENT' removed as per user request */}
                {(() => {
                  const isReadyForSample = f.patronagePhoto && f.tailles.length > 0 && f.mesures.length > 0;
                  return (
                    <button
                      onClick={() => isReadyForSample && onLaunchSample(f)}
                      disabled={!isReadyForSample}
                      title={!isReadyForSample ? (isAr ? 'يجب إرفاق الباترون وإدخال المقاسات والقياسات أولاً' : 'Veuillez uploader le patron et définir les mesures d\'abord') : ''}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all mt-1 ${
                        isReadyForSample 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/30' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70 grayscale'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" /> {isAr ? 'إطلاق العينة' : 'LANCER ÉCHANTILLON'}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Stats Row */}
            <div className={`flex items-center gap-4 border-t border-slate-100 pt-5 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('conso', lang)}</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/50">
                  <Ruler className="w-3 h-3 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700">{f.tissuConsommation}m</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('tailles', lang)}</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200/50">
                  <Calculator className="w-3 h-3 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700">{f.tailles.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Area: Tailles Chips only */}
      <div className={`bg-slate-50/50 border-t border-slate-100 overflow-hidden px-5 py-4 ${isAr ? 'text-right' : 'text-left'}`}>
        {f.tailles.length > 0 ? (
          <div className={`flex flex-wrap items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-1">{t('tailles', lang)}:</span>
            {f.tailles.map(t => (
              <span key={t} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg shadow-sm">{t}</span>
            ))}
          </div>
        ) : (
          <div className={`flex items-center gap-2 text-slate-400 italic text-[10px] ${isAr ? 'flex-row-reverse' : ''}`}>
            <Ruler className="w-3 h-3 opacity-30" /> {t('ready_production', lang)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FichesTechniques() {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewMesuresFiche, setViewMesuresFiche] = useState<FicheTechnique | null>(null);
  const [showShareModal, setShowShareModal] = useState<FicheTechnique | null>(null);
  const [confirmFiche, setConfirmFiche] = useState<FicheTechnique | null>(null);
  const [confirmDetails, setConfirmDetails] = useState({
    tissu: '',
    couleurs: '',
    tailles: {} as Record<string, number>,
    tissuPhoto: '',
    modelePhoto: ''
  });
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [form, setForm] = useState<Partial<FicheTechnique>>({
    modele: '', description: '', client: '', tailles: [], type: '',
    tissuConsommation: 0, mesures: [],
  });
  const [newTaille, setNewTaille] = useState('');
  const [newMesureNom, setNewMesureNom] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  const [tissus, setTissus] = useState<StockTissu[]>([]);

  // Calculateur state
  const [calcFicheId, setCalcFicheId] = useState('');
  const [calcTissuId, setCalcTissuId] = useState('');
  const [calcQty, setCalcQty] = useState(1);
  const [calcPrixTissu, setCalcPrixTissu] = useState(0);
  const [calcMainOeuvre, setCalcMainOeuvre] = useState(0);
  const [calcCharges, setCalcCharges] = useState(0);
  const [calcAutres, setCalcAutres] = useState(0);
  const [calcMarge, setCalcMarge] = useState(30);
  const [calcConsommation, setCalcConsommation] = useState(0);

  function shareOnWhatsApp(f: FicheTechnique, targetPhone?: string) {
    let msg = `*FICHE TECHNIQUE: ${f.modele}*\n`;
    msg += `*Client:* ${f.client}\n`;
    if (f.type) msg += `*Type:* ${f.type}\n`;
    msg += `\n*MESURES:*\n`;

    f.mesures.forEach(m => {
      msg += `- *${m.nom}:* `;
      const vals = f.tailles.map(t => `${t}(${m.valeurs[t] || 0}cm)`).join(', ');
      msg += `${vals}\n`;
    });

    const cleanPhone = (targetPhone || '').replace(/\s/g, '').replace('+', '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setShowShareModal(null);
  }

  useEffect(() => {
    Promise.all([
      loadData<FicheTechnique>('fiches'),
      loadData<StockTissu>('tissus'),
      loadData<any>('users')
    ]).then(([f, t, u]) => {
      setFiches(f);
      setTissus(t);
      setClients(u.filter((x: any) => x.role === 'client'));

      // Check for lead pre-filling from location state (via HashRouter)
      const state = (window as any).history.state?.usr;
      if (state && state.fromLead) {
        setForm({
          modele: `${state.fromLead.type} - ${state.fromLead.name.split(' ')[0]}`,
          type: state.fromLead.type,
          client: state.fromLead.name,
          photo: state.fromLead.photo,
          description: `Demande reçue via Landing Page (${state.fromLead.phone}).\n${state.fromLead.details ? `Détails du client : ${state.fromLead.details}` : ''}`,
          tailles: state.fromLead.tailles 
            ? Object.entries(state.fromLead.tailles as Record<string, number>).filter(([_, v]) => v > 0).map(([k]) => k) 
            : [],
          mesures: [],
          tissuConsommation: 0
        });
        setShowModal(true);
        // Clear history state to avoid re-opening on refresh
        window.history.replaceState({}, document.title);
      }
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'patronagePhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Pour le patronage, on peut aussi stocker le nom du fichier pour l'affichage
        if (field === 'patronagePhoto') {
          setForm({ ...form, [field]: reader.result as string, patronageFileName: file.name });
        } else {
          setForm({ ...form, [field]: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = fiches.filter(f =>
    f.modele.toLowerCase().includes(search.toLowerCase()) ||
    f.client.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditId(null);
    setForm({ modele: '', description: '', client: '', tailles: [], type: '', tissuConsommation: 0, mesures: [] });
    setShowModal(true);
  }

  function openEdit(f: FicheTechnique) {
    setEditId(f.id);
    setForm({ ...f, mesures: [...f.mesures], tailles: [...f.tailles] });
    setShowModal(true);
  }

  async function save() {
    if (!form.modele || !form.client) return;
    const isNew = !editId;
    const fId = editId || genId();

    const fData: FicheTechnique = {
      id: fId,
      modele: form.modele || '', description: form.description || '',
      client: form.client || '', tailles: form.tailles || [], mesures: form.mesures || [],
      tissuConsommation: form.tissuConsommation || 0,
      type: form.type || '',
      photo: form.photo, patronagePhoto: form.patronagePhoto,
      patronageFileName: form.patronageFileName,
      createdAt: form.createdAt || new Date().toISOString().split('T')[0],
    };

    const updated = isNew
      ? [...fiches, fData]
      : fiches.map(f => f.id === editId ? fData : f);

    setFiches(updated);
    setShowModal(false);

    await saveRecord('fiches', fData);
  }

  async function remove(id: string) {
    const updated = fiches.filter(f => f.id !== id);
    setFiches(updated);
    await deleteRecord('fiches', id);
  }

  function downloadFile(data: string, filename: string) {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function addTaille() {
    if (newTaille && !(form.tailles || []).includes(newTaille)) {
      setForm({ ...form, tailles: [...(form.tailles || []), newTaille] });
      setNewTaille('');
    }
  }

  function removeTaille(t: string) {
    setForm({ ...form, tailles: (form.tailles || []).filter(x => x !== t) });
  }

  function addMesure(manualName?: string) {
    const name = manualName || newMesureNom;
    if (name.trim()) {
      const initialValeurs: Record<string, number> = {};
      (form.tailles || []).forEach(t => {
        initialValeurs[t] = 0;
      });
      setForm({
        ...form,
        mesures: [...(form.mesures || []), { nom: name.trim(), valeurs: initialValeurs }]
      });
      if (!manualName) setNewMesureNom('');
    }
  }

  async function handleLaunchEchantillon() {
    if (!confirmFiche) return;
    const totalSizes = Object.values(confirmDetails.tailles).reduce((a, b) => a + b, 0);
    const newCommande = {
      id: genId(),
      reference: `CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      client: confirmFiche.client,
      modele: confirmFiche.modele,
      tissu: confirmDetails.tissu,
      quantite: totalSizes > 0 ? totalSizes : 1,
      quantiteLivre: 0,
      dateCommande: new Date().toISOString(),
      dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      phase: 'patronage' as const,
      prix: 0,
      rebut: 0,
      statut: 'echantillon_en_cours' as const,
      suivi: [{ phase: 'patronage' as const, date: new Date().toISOString(), note: 'Échantillon lancé par modéliste' }],
      couleurs: confirmDetails.couleurs.split(',').map(c => c.trim()).filter(Boolean),
      tailles: confirmDetails.tailles,
      tissuPhoto: confirmDetails.tissuPhoto,
      modelePhoto: confirmDetails.modelePhoto || confirmFiche.photo,
    };
    await saveRecord('commandes', newCommande);
    setConfirmFiche(null);
    alert(isAr ? 'تم إطلاق العينة بنجاح!' : 'Échantillon lancé avec succès !');
    navigate('/echantillons');
  }

  function toggleColor(c: string) {
    const current = confirmDetails.couleurs.split(',').map(x => x.trim()).filter(Boolean);
    if (current.includes(c)) {
      setConfirmDetails({ ...confirmDetails, couleurs: current.filter(x => x !== c).join(', ') });
    } else {
      setConfirmDetails({ ...confirmDetails, couleurs: [...current, c].join(', ') });
    }
  }

  function removeMesure(idx: number) {
    setForm({ ...form, mesures: (form.mesures || []).filter((_, i) => i !== idx) });
  }

  function updateMesureValeur(mesureIdx: number, taille: string, val: number) {
    const updatedMesures = [...(form.mesures || [])];
    const mesure = { ...updatedMesures[mesureIdx] };
    mesure.valeurs = { ...mesure.valeurs, [taille]: val };
    updatedMesures[mesureIdx] = mesure;
    setForm({ ...form, mesures: updatedMesures });
  }

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold text-slate-800">{t('fiches', lang)}</h1>
          <p className="text-slate-500 text-sm">{t('fiches_subtitle', lang)}</p>
        </div>
        <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => {
            Promise.all([
              loadData<FicheTechnique>('fiches'),
              loadData<StockTissu>('tissus')
            ]).then(([f, t]) => {
              setFiches(f);
              setTissus(t);
              setShowCalc(true);
            });
          }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
            <Calculator className="w-4 h-4" /> {t('calc_prix', lang)}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" /> {t('new_fiche', lang)}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
        <input
          type="text" placeholder={t('search_fiche', lang)}
          value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full ${isAr ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none`}
        />
      </div>

      {/* Two Sections: With and Without Patron */}
      <div className="space-y-12">
        {/* Section 1: With Patron */}
        {filtered.filter(f => f.patronagePhoto).length > 0 && (
          <div className="space-y-6">
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {t('avec_patron', lang)}
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {filtered.filter(f => f.patronagePhoto).length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {filtered.filter(f => f.patronagePhoto).map(f => (
                <FicheCard 
                  key={f.id} 
                  f={f} 
                  openEdit={openEdit} 
                  remove={remove} 
                  downloadFile={downloadFile} 
                  printFicheTechnique={printFT} 
                  onViewMesures={setViewMesuresFiche} 
                  onShare={setShowShareModal} 
                  onLaunchSample={(fiche) => {
                    setConfirmFiche(fiche);
                    setConfirmDetails(prev => ({
                      ...prev,
                      modelePhoto: fiche.photo || '',
                      tailles: fiche.tailles.reduce((acc, t) => ({...acc, [t]: 0}), {})
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Without Patron */}
        {filtered.filter(f => !f.patronagePhoto).length > 0 && (
          <div className="space-y-6">
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {t('sans_patron', lang)}
                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {filtered.filter(f => !f.patronagePhoto).length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {filtered.filter(f => !f.patronagePhoto).map(f => (
                <FicheCard 
                  key={f.id} 
                  f={f} 
                  openEdit={openEdit} 
                  remove={remove} 
                  downloadFile={downloadFile} 
                  printFicheTechnique={printFT} 
                  onViewMesures={setViewMesuresFiche} 
                  onShare={setShowShareModal} 
                  onLaunchSample={(fiche) => {
                    setConfirmFiche(fiche);
                    setConfirmDetails(prev => ({
                      ...prev,
                      modelePhoto: fiche.photo || '',
                      tailles: fiche.tailles.reduce((acc, t) => ({...acc, [t]: 0}), {})
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">{t('no_fiche_found', lang)}</p>
          </div>
        )}
      </div>

      {/* Calculateur de Prix Modal */}
      {showCalc && (() => {
        const matieres = calcConsommation * calcPrixTissu * calcQty;
        const mo = calcMainOeuvre * calcQty;
        const charges = calcCharges * calcQty;
        const autres = calcAutres * calcQty;
        const coutRevient = matieres + mo + charges + autres;
        const marge = coutRevient * (calcMarge / 100);
        const prixVente = coutRevient + marge;
        const prixUnitaire = calcQty > 0 ? prixVente / calcQty : 0;

        function handleFicheChange(id: string) {
          setCalcFicheId(id);
          const f = fiches.find(x => x.id === id);
          if (f) setCalcConsommation(f.tissuConsommation);
          else { setCalcConsommation(0); }
        }

        function handleTissuChange(id: string) {
          setCalcTissuId(id);
          const t = tissus.find(x => x.id === id);
          if (t) setCalcPrixTissu(t.prixMetre);
          else setCalcPrixTissu(0);
        }

        const selectedTissu = tissus.find(t => t.id === calcTissuId);
        const metrageNecessaire = calcConsommation * calcQty;
        const stockSuffisant = selectedTissu ? selectedTissu.metrage >= metrageNecessaire : true;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Calculateur de Coût Automatique
                </h2>
                <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fiche Technique</label>
                    <select value={calcFicheId} onChange={e => handleFicheChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">Sélectionner une fiche</option>
                      {fiches.map(f => <option key={f.id} value={f.id}>{f.modele} — {f.client}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consommation (m/pièce)</label>
                    <input type="number" step="0.01" value={calcConsommation || ''} onChange={e => setCalcConsommation(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantité à produire</label>
                    <input type="number" min="1" value={calcQty || ''} onChange={e => setCalcQty(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>

                  {/* Tissu from Stock — the key field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Tissu du Stock
                      <span className="ml-1.5 text-[10px] font-normal text-slate-400">(prix auto depuis stock)</span>
                    </label>
                    <select value={calcTissuId} onChange={e => handleTissuChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">— Choisir un rouleau —</option>
                      {tissus.filter(t => t.metrage > 0).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.couleur} · {t.type} — {t.metrage}m dispo · {t.prixMetre} MAD/m
                        </option>
                      ))}
                      {tissus.filter(t => t.metrage <= 0).length > 0 && (
                        <optgroup label="── Épuisés ──">
                          {tissus.filter(t => t.metrage <= 0).map(t => (
                            <option key={t.id} value={t.id} disabled>
                              {t.couleur} · {t.type} — Épuisé
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    {/* Stock info card */}
                    {selectedTissu && (
                      <div className={`mt-2 rounded-xl p-3 border text-xs ${stockSuffisant ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-700">{selectedTissu.couleur} — {selectedTissu.type}</span>
                          <span className={`font-bold ${stockSuffisant ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stockSuffisant ? '✓ Stock OK' : '⚠ Stock insuffisant'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-slate-500">
                          <span>Disponible: <strong className="text-slate-700">{selectedTissu.metrage} m</strong></span>
                          <span>Nécessaire: <strong className={stockSuffisant ? 'text-slate-700' : 'text-red-600'}>{metrageNecessaire.toFixed(1)} m</strong></span>
                        </div>
                        {selectedTissu.composition && (
                          <span className="text-slate-400 mt-1 block">{selectedTissu.composition}</span>
                        )}
                      </div>
                    )}

                    {tissus.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-600">Aucun tissu en stock — ajoutez d'abord des rouleaux dans Stock Matériaux</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Prix tissu (MAD/mètre)</label>
                      {selectedTissu && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ {t('auto_from_stock', lang)}</span>}
                    </div>
                    <input type="number" min="0" value={calcPrixTissu || ''} onChange={e => setCalcPrixTissu(parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none ${selectedTissu ? 'border-green-300 bg-green-50/50' : 'border-slate-200'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Main d'œuvre (DH/pièce)</label>
                    <input type="number" min="0" value={calcMainOeuvre || ''} onChange={e => setCalcMainOeuvre(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Charges fixes (DH/pièce)</label>
                    <input type="number" min="0" value={calcCharges || ''} onChange={e => setCalcCharges(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Autres coûts (DH/pièce)</label>
                    <input type="number" min="0" value={calcAutres || ''} onChange={e => setCalcAutres(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Marge bénéficiaire (%)</label>
                    <input type="number" min="0" max="200" value={calcMarge || ''} onChange={e => setCalcMarge(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>

                {/* Résultats */}
                <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Résultat du Calcul</h3>
                  {[
                    { label: 'Matières premières', value: matieres },
                    { label: "Main d'œuvre", value: mo },
                    { label: 'Charges fixes', value: charges },
                    { label: 'Autres coûts', value: autres },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm border-b border-slate-200 pb-2">
                      <span className="text-slate-500">{row.label}:</span>
                      <span className="font-medium text-slate-700">{row.value.toFixed(2)} DH</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-indigo-700 pt-1">
                    <span>Coût de revient:</span>
                    <span>{coutRevient.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Marge ({calcMarge}%):</span>
                    <span>{marge.toFixed(2)} DH</span>
                  </div>
                  <div className="bg-green-600 text-white rounded-xl p-4 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Prix de vente total:</span>
                      <span className="font-bold text-2xl">{prixVente.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 opacity-80 text-sm">
                      <span>Prix unitaire:</span>
                      <span className="font-semibold">{prixUnitaire.toFixed(2)} DH / pièce</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

            {/* Header */}
            <div className={`p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{editId ? t('edit', lang) : t('new', lang)} {t('fiches', lang)}</h2>
                  <p className="text-xs text-slate-400 font-medium italic">{t('fiche_form_desc', lang)}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
                ×
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">

              {/* ── Photos ── */}
              <div>
                <p className={`text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>{isAr ? 'الوسائط' : 'Médias'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold text-slate-600 ${isAr ? 'text-right' : ''}`}>{t('photo_modele', lang)}</label>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-indigo-400 transition-colors">
                      {form.photo ? (
                        <>
                          <img src={form.photo} alt="Preview" className="w-full h-full object-contain" />
                          <button onClick={() => setForm({ ...form, photo: undefined })} className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} p-1.5 bg-red-500 text-white rounded-full shadow-md z-20 hover:bg-red-600 transition-colors`}>
                            <span className="text-xs leading-none">×</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadFile(form.photo!, `Photo_${form.modele || 'fiche'}.png`)}
                            className={`absolute bottom-2 ${isAr ? 'left-2' : 'right-2'} flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-lg z-20 hover:bg-indigo-700 transition-all font-bold text-[10px]`}
                          >
                            <Download className="w-3 h-3" /> {t('download_label', lang)}
                          </button>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <Camera className="w-7 h-7 text-slate-300 mb-1" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">{t('add_photo', lang)}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'photo')} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-semibold text-slate-600 ${isAr ? 'text-right' : ''}`}>{t('patronage_label', lang)}</label>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group hover:border-indigo-400 transition-colors cursor-pointer">
                      {form.patronagePhoto ? (
                        <>
                          {form.patronagePhoto.startsWith('data:image/') ? (
                            <img src={form.patronagePhoto} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                              <p className="text-[10px] font-bold text-indigo-600 text-center px-4 truncate w-full">{form.patronageFileName}</p>
                            </div>
                          )}
                          <button onClick={() => setForm({ ...form, patronagePhoto: undefined, patronageFileName: undefined })} className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} p-1.5 bg-red-500 text-white rounded-full shadow-md z-20 hover:bg-red-600 transition-colors`}>
                            <span className="text-xs leading-none">×</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadFile(form.patronagePhoto!, form.patronageFileName || 'patronage')}
                            className={`absolute bottom-2 ${isAr ? 'left-2' : 'right-2'} flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg shadow-lg z-20 hover:bg-emerald-700 transition-all font-bold text-[10px]`}
                          >
                            <Download className="w-3 h-3" /> {t('download_label', lang)}
                          </button>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <FileText className="w-7 h-7 text-slate-300 mb-1" />
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">{t('add_patron', lang)}</span>
                          <input type="file" accept=".pdf,.dxf,image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'patronagePhoto')} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Infos de base ── */}
              <div className={isAr ? 'text-right' : ''}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{isAr ? 'المعلومات' : 'Informations'}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={`block text-xs font-semibold text-slate-600 mb-1.5 ${isAr ? 'text-right' : ''}`}>{t('modele_label', lang)} *</label>
                    <input value={form.modele || ''} onChange={e => setForm({ ...form, modele: e.target.value })}
                      className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold text-slate-600 mb-1.5 ${isAr ? 'text-right' : ''}`}>{t('type_label', lang)}</label>
                    <input value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })}
                      placeholder={isAr ? 'مثلا: قميص، فستان...' : 'ex: Chemise, Robe...'}
                      className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors ${isAr ? 'text-right' : ''}`} />
                    <div className={`flex flex-wrap gap-2 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner ${isAr ? 'flex-row-reverse' : ''}`}>
                      {['T-shirt', 'Polo', 'Chemise', 'Pantalon', 'Sweat', 'Veste', 'Robe'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, type: t })}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${form.type === t
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-sm'
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className={`block text-xs font-semibold text-slate-600 mb-1.5 ${isAr ? 'text-right' : ''}`}>{t('client_label', lang)} *</label>
                  <input value={form.client || ''} onChange={e => setForm({ ...form, client: e.target.value })}
                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors ${isAr ? 'text-right' : ''}`} />
                </div>
                <div className="mb-3">
                  <label className={`block text-xs font-semibold text-slate-600 mb-1.5 ${isAr ? 'text-right' : ''}`}>{t('desc_label', lang)}</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2} className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors resize-none ${isAr ? 'text-right' : ''}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold text-slate-600 mb-1.5 ${isAr ? 'text-right' : ''}`}>
                    <Ruler className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                    {t('conso_tissu', lang)}
                  </label>
                  <input type="number" step="0.01" value={form.tissuConsommation || 0} onChange={e => setForm({ ...form, tissuConsommation: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors ${isAr ? 'text-right' : ''}`} />
                </div>
              </div>

              {/* ── Tailles ── */}
              <div>
                <p className={`text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>{t('tailles_dispo', lang)}</p>
                <div className={`flex gap-2 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <input value={newTaille} onChange={e => setNewTaille(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTaille())}
                    placeholder={isAr ? 'مثلا: S, M, L...' : 'Ex: XS, S, M, L, XL...'}
                    className={`flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors ${isAr ? 'text-right' : ''}`} />
                  <button onClick={addTaille} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">+ {t('add_label', lang)}</button>
                </div>
                <div className={`flex flex-wrap gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {(form.tailles || []).map(t => (
                    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl">
                      {t}
                      <button onClick={() => removeTaille(t)} className="hover:text-red-300 transition text-slate-400 text-sm leading-none">×</button>
                    </span>
                  ))}
                  {(form.tailles || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic">Aucune taille ajoutée</p>
                  )}
                </div>
              </div>

              {/* ── Mesures (Patronage) ── */}
              <div>
                <p className={`text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>
                  {isAr ? 'القياسات (الباترون)' : 'Mesures (Patronage)'}
                </p>

                {/* Input row */}
                <div className={`flex gap-2 mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <input value={newMesureNom} onChange={e => setNewMesureNom(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMesure())}
                    placeholder={t('mesure_nom_placeholder', lang)}
                    className={`flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors ${isAr ? 'text-right' : ''}`} />
                  <button onClick={() => addMesure()} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">+ {t('add_label', lang)}</button>
                </div>

                {/* Suggestions chips */}
                <div className={`flex flex-wrap gap-1.5 mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {['Longueur', 'Poitrine', 'Épaules', 'Manches', 'Taille', 'Hanches', 'Entrejambe', 'Bas'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addMesure(s)}
                      className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-lg transition-all shadow-sm"
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                {/* Mesures Spreadsheet Table */}
                {(form.mesures || []).length > 0 ? (
                  <div className="rounded-xl overflow-x-auto border border-slate-200">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className={`px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider sticky left-0 bg-slate-100 z-10 w-48 border-r border-slate-200 ${isAr ? 'text-right' : 'text-left'}`}>{t('point_mesure', lang)}</th>
                          {(form.tailles || []).map(t => (
                            <th key={t} className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center min-w-[80px] border-r border-slate-200 last:border-r-0">
                              {t}
                            </th>
                          ))}
                          <th className="w-10 px-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(form.mesures || []).map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 group/row transition-colors">
                            <td className={`px-4 py-2 font-medium text-slate-700 sticky left-0 bg-white group-hover/row:bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)] ${isAr ? 'text-right' : 'text-left'}`}>
                              {m.nom}
                            </td>
                            {(form.tailles || []).map(t => (
                              <td key={t} className="p-0 border-r border-slate-100 last:border-r-0">
                                <input
                                  type="number"
                                  value={m.valeurs[t] === 0 ? '' : m.valeurs[t]}
                                  onChange={e => updateMesureValeur(i, t, parseFloat(e.target.value) || 0)}
                                  className="w-full h-full px-3 py-3 text-center focus:ring-2 focus:ring-inset focus:ring-emerald-500 outline-none bg-transparent font-medium text-slate-800 transition-all"
                                  placeholder="0"
                                />
                              </td>
                            ))}
                            <td className="px-2 text-center">
                              <button onClick={() => removeMesure(i)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover/row:opacity-100">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                    <Ruler className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">{t('no_mesure', lang)}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{t('mesure_auto_desc', lang)}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className={`p-5 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-slate-50/50 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition">
                {t('cancel', lang)}
              </button>
              <button onClick={save} className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/30">
                {editId ? `✓ ${t('save', lang)}` : `+ ${t('create_fiche_btn', lang)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Mesures Modal (Dossier Technique) */}
      {viewMesuresFiche && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">

            {/* Header */}
            <div className={`p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center shadow-xl shadow-indigo-100">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{t('dossier_technique', lang)}</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5">{viewMesuresFiche.modele} <span className="mx-2 text-slate-200">|</span> {viewMesuresFiche.client}</p>
                </div>
              </div>
              <button onClick={() => setViewMesuresFiche(null)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                <span className="text-3xl font-light group-hover:rotate-90 transition-transform duration-300">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Visual & Info */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="space-y-4">
                    <p className={`text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] ${isAr ? 'pr-1' : 'pl-1'}`}>{t('apercu_visuel', lang)}</p>
                    <div className="aspect-[3/4] bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden shadow-inner group/photo relative">
                      {viewMesuresFiche.photo ? (
                        <>
                          <img src={viewMesuresFiche.photo} alt={viewMesuresFiche.modele} className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <button
                              onClick={() => downloadFile(viewMesuresFiche.photo!, `Photo_${viewMesuresFiche.modele}.png`)}
                              className="w-full py-3 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all"
                            >
                              {t('download_label', lang)}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <Camera className="w-16 h-16 mb-4 opacity-10" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('aucun_visuel', lang)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 space-y-4">
                    <p className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ${isAr ? 'text-right' : ''}`}>{t('notes_obs', lang)}</p>
                    <p className={`text-sm text-slate-600 leading-relaxed italic ${isAr ? 'text-right' : ''}`}>
                      {viewMesuresFiche.description || (isAr ? "لم يتم إضافة أي ملاحظات تقنية لهذا النموذج." : "Aucune observation technique n'a été ajoutée pour ce modèle.")}
                    </p>
                  </div>
                </div>

                {/* Right Column: Measurements */}
                <div className="lg:col-span-8 space-y-8">
                  <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <p className={`text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] ${isAr ? 'pr-1' : 'pl-1'}`}>{t('tab_graduation', lang)}</p>
                    <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      {viewMesuresFiche.tailles.map(t => (
                        <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-tighter">{t}</span>
                      ))}
                    </div>
                  </div>

                  {viewMesuresFiche.mesures.length > 0 && viewMesuresFiche.tailles.length > 0 ? (
                    <div className="rounded-[32px] border border-slate-100 overflow-hidden shadow-sm bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-900">
                            <th className={`px-8 py-5 text-indigo-100 font-bold uppercase tracking-widest text-[10px] border-r border-slate-800 ${isAr ? 'text-right' : 'text-left'}`}>{t('point_mesure', lang)}</th>
                            {viewMesuresFiche.tailles.map(t => (
                              <th key={t} className="px-6 py-5 text-center text-white font-black uppercase tracking-widest text-[10px]">
                                {t}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewMesuresFiche.mesures.map((m, i) => (
                            <tr key={i} className="hover:bg-indigo-50/30 transition-colors group/row">
                              <td className={`px-8 py-4 font-bold text-slate-700 border-r border-slate-100 bg-slate-50/30 group-hover/row:bg-white ${isAr ? 'text-right' : 'text-left'}`}>{m.nom}</td>
                              {viewMesuresFiche.tailles.map(taille => (
                                <td key={taille} className="px-6 py-4 text-center font-black text-indigo-600">
                                  {m.valeurs?.[taille] || 0}<span className="text-[10px] font-normal text-slate-400 ml-1">{t('cm', lang)}</span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                      <Ruler className="w-20 h-20 mx-auto mb-6 opacity-5 text-slate-900" />
                      <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{isAr ? 'جدول القياسات فارغ' : 'Tableau de mesures vide'}</p>
                      <p className="text-[11px] text-slate-300 mt-2">{isAr ? 'يرجى تعديل البطاقة لإضافة القياسات' : 'Veuillez éditer la fiche pour ajouter des mesures'}</p>
                    </div>
                  )}

                  {/* Export Options */}
                  <div className={`pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => printFT(viewMesuresFiche!)}
                      className="flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
                    >
                      <Download className="w-4 h-4" /> {t('export_pdf', lang)}
                    </button>
                    <button
                      onClick={() => setShowShareModal(viewMesuresFiche!)}
                      className="flex items-center justify-center gap-3 px-8 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 hover:shadow-emerald-200 active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5" /> {isAr ? 'إرسال بالواتساب' : 'PARTAGER WHATSAPP'}
                    </button>
                    <button
                      onClick={() => {
                        // Simuler un pack en téléchargeant la photo et ouvrant le PDF
                        printFT(viewMesuresFiche!);
                        if (viewMesuresFiche.photo) downloadFile(viewMesuresFiche.photo, `Photo_${viewMesuresFiche.modele}.png`);
                        if (viewMesuresFiche.patronagePhoto) downloadFile(viewMesuresFiche.patronagePhoto, viewMesuresFiche.patronageFileName || `Patron_${viewMesuresFiche.modele}`);
                      }}
                      className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 active:scale-95"
                    >
                      <FileText className="w-4 h-4" /> {t('download_pack', lang)}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center flex-shrink-0">
              <button onClick={() => setViewMesuresFiche(null)} className="px-10 py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
                {t('close_preview', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Client Selector Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[300] p-4" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in duration-300 flex flex-col overflow-hidden">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'إرسال للزبون' : 'Partager avec Client'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{showShareModal.modele}</p>
              </div>
              <button onClick={() => setShowShareModal(null)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all">
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="relative">
                <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث عن زبون...' : 'Chercher un client...'}
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className={`w-full py-4 ${isAr ? 'pr-12 text-right' : 'pl-12'} bg-slate-50 border-2 border-slate-50 rounded-[20px] text-sm font-bold outline-none focus:border-indigo-500 shadow-inner`}
                />
              </div>

              {(() => {
                const match = clients.find(c => (c.nom || '').toLowerCase().includes((showShareModal.client || '').toLowerCase()));
                if (match && !clientSearch) {
                  return (
                    <div className="p-6 bg-indigo-50 border-2 border-indigo-100 rounded-[32px]">
                      <p className={`text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 ${isAr ? 'text-right' : ''}`}>{isAr ? 'الزبون المذكور فـ البطاقة' : 'Client mentionné dans la fiche'}</p>
                      <button
                        onClick={() => shareOnWhatsApp(showShareModal, match.telephone)}
                        className={`w-full p-5 bg-white rounded-2xl flex items-center justify-between group hover:border-indigo-500 border-2 border-transparent transition-all shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">{(match.nom || 'C')[0].toUpperCase()}</div>
                          <div className={isAr ? 'text-right' : 'text-left'}>
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-tight">{match.nom}</p>
                            <p className="text-[11px] font-bold text-slate-400 tracking-widest">{match.telephone}</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                      </button>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-2">
                <p className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ${isAr ? 'text-right' : ''}`}>{isAr ? 'اختيار من القائمة' : 'Sélectionner dans la liste'}</p>
                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {clients
                    .filter(c => (c.nom || '').toLowerCase().includes(clientSearch.toLowerCase()) || (c.telephone || '').includes(clientSearch))
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => shareOnWhatsApp(showShareModal, c.telephone)}
                        className={`w-full p-4 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 rounded-[20px] flex items-center justify-between transition-all group ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-white border border-slate-200 text-slate-900 rounded-xl flex items-center justify-center font-black group-hover:bg-slate-900 group-hover:text-white transition-all">{(c.nom || 'C')[0].toUpperCase()}</div>
                          <div className={isAr ? 'text-right' : 'text-left'}>
                            <p className="font-black text-slate-900 uppercase tracking-tighter leading-tight">{c.nom}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest">{c.telephone}</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-all ${isAr ? 'rotate-180' : ''}`} />
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50">
              <button onClick={() => setShowShareModal(null)} className="w-full h-14 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
    </svg>
  );
}

