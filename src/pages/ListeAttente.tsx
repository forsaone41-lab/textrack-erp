import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { Users, Search, Trash2, CheckCircle, UserPlus, Clock, Phone, FileText, ArrowLeft, X } from 'lucide-react';
import { saveRecord, deleteRecord, genId, Employe, syncListeAttente, pushCandidatToCloud, deleteCandidatFromCloud } from '../types';

interface WaitlistedCandidate {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  poste: string;
  dateAjout: string;
  notes?: string;
  confirmedBy?: string;
  chefFeedback?: 'pending' | 'approved' | 'rejected';
}

// Local storage helpers for Waiting List
function getLocalList<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(`textrack_${key}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveLocalList<T>(key: string, data: T[]) {
  localStorage.setItem(`textrack_${key}`, JSON.stringify(data));
}

export default function ListeAttente() {
  const { isAr } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<WaitlistedCandidate[]>(getLocalList('liste_attente'));
  const [search, setSearch] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<WaitlistedCandidate | null>(null);

  useEffect(() => {
    syncListeAttente().then(data => setCandidates(data));
  }, []);

  useEffect(() => {
    // Catch data from Recruitment
    if (location.state?.fromRecruitment) {
      const lead = location.state.fromRecruitment;
      const [firstName, ...lastNameParts] = lead.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const currentUser = JSON.parse(localStorage.getItem('textrack_auth') || '{}');
      const newCandidate: WaitlistedCandidate = {
        id: genId(),
        nom: lastName || firstName,
        prenom: lastName ? firstName : '',
        telephone: lead.phone,
        poste: lead.type.replace('RECRUTEMENT: ', ''),
        dateAjout: new Date().toISOString(),
        notes: lead.details,
        confirmedBy: currentUser.nom || 'Admin',
        chefFeedback: 'pending'
      };

      handleAddNew(newCandidate);

      // Auto-delete lead from Demandes so it doesn't appear in both places
      if (lead.id) {
        deleteRecord('leads', lead.id, lead.email).catch(() => 
          console.warn('Could not auto-delete lead from Demandes')
        );
      }

      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddNew = async (candidate: WaitlistedCandidate) => {
    setCandidates(prev => {
      const updated = [candidate, ...prev];
      saveLocalList('liste_attente', updated);
      return updated;
    });
    await pushCandidatToCloud(candidate);
  };

  const handleDelete = async (id: string) => {
    setCandidates(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveLocalList('liste_attente', updated);
      return updated;
    });
    await deleteCandidatFromCloud(id);
  };

  const handleEmbaucher = async (candidate: WaitlistedCandidate) => {
    // 1. Prepare Employee Data for SuiviRH
    const newEmployee: Employe = {
      id: genId(),
      nom: candidate.nom,
      prenom: candidate.prenom,
      poste: candidate.poste,
      telephone: candidate.telephone,
      email: '',
      type: 'atelier',
      actif: true,
      salaireMensuel: 0,
      remunerationType: 'mensuel'
    };

    // 2. Save to Employees table
    await saveRecord('employes', newEmployee);
    
    // 3. Remove from waiting list
    await handleDelete(candidate.id);

    // 4. Redirect to RH to finish setup
    navigate('/suivi-rh', { state: { fromWaitlist: newEmployee } });
  };

  const handleReturnToRecruitment = async (candidate: WaitlistedCandidate) => {
    // Return candidate to leads table
    const lead = {
      id: genId(),
      name: `${candidate.prenom} ${candidate.nom}`.trim(),
      phone: candidate.telephone,
      ville: '', // Unknown at this stage
      type: `RECRUTEMENT: ${candidate.poste}`,
      quantity: 0,
      details: candidate.notes || '',
      date: new Date().toISOString(),
      status: 'new' as const,
      crmStage: 'entretien' as const
    };
    await saveRecord('leads', lead, true);
    handleDelete(candidate.id);
  };

  const filtered = candidates.filter(c => 
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    c.poste.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {isAr ? 'لائحة الانتظار (قبل التوظيف)' : 'Liste d\'Attente (Pré-embauche)'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isAr ? 'إدارة المترشحين المقبولين مبدئياً قبل إدراجهم في النظام المالي' : 'Gérez les candidats validés avant leur intégration officielle RH'}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
        <input 
          type="text"
          placeholder={isAr ? 'بحث عن مترشح...' : 'Rechercher un candidat...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full bg-white border-2 border-slate-50 rounded-2xl py-4 ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} text-sm font-bold outline-none focus:border-indigo-500 shadow-sm`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  {c.confirmedBy && (
                    <div className="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1 shadow-sm">
                      {isAr ? 'من طرف:' : 'Par:'} {c.confirmedBy}
                    </div>
                  )}
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{c.prenom} {c.nom}</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{c.poste}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                  <Phone className="w-4 h-4 text-slate-300" /> {c.telephone}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-4 h-4" /> {isAr ? 'أضيف في:' : 'Ajouté le :'} {new Date(c.dateAjout).toLocaleDateString()}
                </div>
                {['Piqueuse', 'Machiniste', 'Surjeteuse', 'Finition', 'Coupeur', 'Repasseur'].some(p => c.poste.includes(p)) && (
                  <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                    c.chefFeedback === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                    c.chefFeedback === 'rejected' ? 'bg-rose-100 text-rose-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {c.chefFeedback === 'approved' ? (isAr ? 'مقبول من الشاف' : 'Accepté (Chef)') :
                     c.chefFeedback === 'rejected' ? (isAr ? 'مرفوض من الشاف' : 'Refusé (Chef)') :
                     (isAr ? 'قيد تجربة الشاف' : 'En test (Chef)')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowConfirmModal(c)}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                >
                  <UserPlus className="w-4 h-4" />
                  {isAr ? 'توظيف رسمي (RH)' : 'Embaucher Officiellement'}
                </button>
                {(() => {
                  const cvData = c.notes?.split('| CV_ATTACHMENT:')[1];
                  if (!cvData) return null;
                  return (
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = cvData;
                        link.download = `CV_${c.nom.replace(/\s/g, '_')}`;
                        link.click();
                      }}
                      className="w-12 h-12 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-indigo-100"
                      title={isAr ? 'تحميل السيرة الذاتية' : 'Télécharger le CV'}
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => handleReturnToRecruitment(c)}
                  className="flex-1 py-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {isAr ? 'إرجاع لإدارة التوظيف' : 'Retour au recrutement'}
                </button>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="px-4 py-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                >
                  <X className="w-3 h-3" />
                  {isAr ? 'رفض' : 'Rejeter'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              {isAr ? 'لائحة الانتظار فارغة' : 'La liste d\'attente est vide'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              {isAr ? 'تأكيد التوظيف؟' : 'Confirmer l\'Embauche ?'}
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
              {isAr 
                ? `هل أنت متأكد من نقل "${showConfirmModal.prenom} ${showConfirmModal.nom}" إلى النظام المالي والموارد البشرية؟`
                : `Voulez-vous vraiment transférer "${showConfirmModal.prenom} ${showConfirmModal.nom}" vers le système RH officiel ?`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirmModal(null)} className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={() => handleEmbaucher(showConfirmModal)}
                className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200"
              >
                {isAr ? 'تأكيد ونقل' : 'Confirmer & Transférer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
