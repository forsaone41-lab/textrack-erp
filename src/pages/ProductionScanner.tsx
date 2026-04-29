import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Users, 
  Package, 
  ArrowLeft,
  Factory,
  Save
} from 'lucide-react';
import { 
  Commande, 
  Employe, 
  OperationModele, 
  SuiviHoraire, 
  loadData, 
  saveRecord, 
  genId 
} from '../types';
import { useNavigate } from 'react-router-dom';

export default function ProductionScanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    commandes: Commande[];
    employes: Employe[];
    operations: OperationModele[];
  }>({
    commandes: [],
    employes: [],
    operations: []
  });

  const [scanResult, setScanResult] = useState<{
    cmdId: string;
    opId: string;
  } | null>(null);

  const [form, setForm] = useState({
    employeId: '',
    quantite: 0,
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'none';
    message: string;
  }>({ type: 'none', message: '' });

  useEffect(() => {
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<Employe>('employes'),
      loadData<OperationModele>('operations_modele')
    ]).then(([cmds, emps, ops]) => {
      setData({
        commandes: cmds,
        employes: emps.filter(e => e.actif),
        operations: ops
      });
      setLoading(false);
    });
  }, []);

  const handleScan = (result: any) => {
    if (!result) return;
    const rawValue = result[0]?.rawValue || result;
    
    // Format: beya-prod://{cmdId}/{opId}
    if (rawValue.startsWith('beya-prod://')) {
      const parts = rawValue.replace('beya-prod://', '').split('/');
      if (parts.length === 2) {
        setScanResult({
          cmdId: parts[0],
          opId: parts[1]
        });
        setStatus({ type: 'none', message: '' });
      } else {
        setStatus({ type: 'error', message: 'Format QR invalide' });
      }
    }
  };

  async function handleSave() {
    if (!scanResult || !form.employeId || !form.quantite) {
      setStatus({ type: 'error', message: 'Veuillez remplir tous les champs' });
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const hDebut = `${String(currentHour).padStart(2, '0')}:00`;
    const hFin = `${String(currentHour + 1).padStart(2, '0')}:00`;

    const newEntry: any = {
      id: genId(),
      commande_id: scanResult.cmdId,
      employe_id: form.employeId,
      operation_id: scanResult.opId,
      heure_debut: hDebut,
      heure_fin: hFin,
      quantite_realisee: form.quantite,
      date_production: now.toISOString().split('T')[0]
    };

    try {
      await saveRecord('suivi_horaire', newEntry);
      setStatus({ type: 'success', message: 'Production enregistrée !' });
      
      // Reset for next scan after 2 seconds
      setTimeout(() => {
        setScanResult(null);
        setForm({ ...form, quantite: 0 });
        setStatus({ type: 'none', message: '' });
      }, 2000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur lors de l\'enregistrement' });
    }
  }

  const scannedOp = data.operations.find(o => o.id === scanResult?.opId);
  const scannedCmd = data.commandes.find(c => c.id === scanResult?.cmdId);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Initialisation...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest">Scanner Production</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
        {!scanResult ? (
          <div className="flex-1 flex flex-col">
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/20">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black mb-2">Prêt à scanner</h2>
              <p className="text-slate-400 text-sm">Veuillez scanner le code QR du poste de travail</p>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border-4 border-indigo-600/20 shadow-2xl relative aspect-square">
              <Scanner
                onScan={handleScan}
                allowMultiple={false}
                styles={{ container: { width: '100%', height: '100%' } }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-indigo-400/50 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-indigo-500" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-indigo-500" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-indigo-500" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-indigo-500" />
                </div>
              </div>
            </div>

            {status.type === 'error' && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">{status.message}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-indigo-100 opacity-60">Poste Scanné</h3>
                  <p className="text-xl font-black">{scannedOp?.nom_operation || 'Inconnu'}</p>
                </div>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex justify-between text-[10px] font-black text-indigo-200 uppercase mb-1">
                  <span>Commande</span>
                  <span>Modèle</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{scannedCmd?.reference || '—'}</span>
                  <span>{scannedCmd?.modele || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Ouvrier / Opérateur</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select 
                    value={form.employeId}
                    onChange={e => setForm({ ...form, employeId: e.target.value })}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    {data.employes.map(e => (
                      <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Quantité Réalisée</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="number"
                    value={form.quantite || ''}
                    onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 pl-12 pr-5 text-2xl font-black outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {status.type !== 'none' && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                  status.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-xs font-black uppercase">{status.message}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setScanResult(null)}
                  className="flex-1 py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
