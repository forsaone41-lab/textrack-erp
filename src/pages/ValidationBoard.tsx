// @ts-nocheck
import { useState, useEffect } from 'react';
import { Lead, saveRecord, User, loadData } from '../types';
import { useLang } from '../contexts/LangContext';
import { PageLoader } from '../components/PageLoader';
import { Phone, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

export default function ValidationBoard({ currentUser }: { currentUser: User }) {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await loadData<Lead>('leads');
        if (data) {
          const myLeads = data.filter(l => l.assignedTo === currentUser.id && l.status !== 'completed' && l.crmStage !== 'annule');
          setLeads(myLeads);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [currentUser.id]);

  const handleConfirm = async (lead: Lead) => {
    const updated = { ...lead, crmStage: 'confirme' as const, status: 'completed' as const, confirmedBy: currentUser.id };
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    await saveRecord('leads', updated, true);
  };

  const handleCancel = async (lead: Lead) => {
    if(!window.confirm(isAr ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Voulez-vous vraiment annuler cette demande ?')) return;
    const updated = { ...lead, crmStage: 'annule' as const, status: 'completed' as const, confirmedBy: currentUser.id };
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    await saveRecord('leads', updated, true);
  };

  const callClient = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };
  
  const waClient = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '212' + p.substring(1);
    window.open(`https://wa.me/${p}`, '_blank');
  };

  if (loading) return <PageLoader />;

  return (
    <div className={`p-4 md:p-8 max-w-5xl mx-auto space-y-6 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">{isAr ? 'لوحة تأكيد الطلبات' : 'Tableau de Validation'}</h1>
          <p className="text-slate-500 font-bold mt-2">{isAr ? 'الطلبات المخصصة لك للتأكيد' : 'Demandes qui vous sont assignées'}</p>
        </div>
        <div className="w-16 h-16 bg-indigo-100 rounded-[2rem] flex items-center justify-center shadow-inner">
          <span className="text-2xl font-black text-indigo-600">{leads.length}</span>
        </div>
      </div>
      
      {leads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-600">{isAr ? 'لا يوجد طلبات للـتأكيد حالياً' : 'Aucune demande à valider'}</h2>
        </div>
      ) : (
        <div className="grid gap-6">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:scale-[1.01]">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100">{lead.type}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(lead.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{lead.name}</h3>
                <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {lead.phone}
                </p>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantité</span>
                    <span className="text-sm font-black text-indigo-600">{lead.quantity} Pièces</span>
                  </div>
                  {lead.details && <p className="text-sm text-slate-600 font-medium">{lead.details}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                <div className="flex gap-2 w-full">
                  <button onClick={() => callClient(lead.phone)} className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                    <Phone className="w-5 h-5" /> {isAr ? 'اتصال' : 'Appel'}
                  </button>
                  <button onClick={() => waClient(lead.phone)} className="flex-1 p-4 bg-[#25D366]/10 text-[#25D366] rounded-2xl hover:bg-[#25D366]/20 transition-all flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </button>
                </div>
                
                <div className="flex gap-2 w-full mt-2">
                  <button onClick={() => handleCancel(lead)} className="flex-1 p-4 bg-white text-rose-500 rounded-2xl hover:bg-rose-50 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border-2 border-rose-100 hover:border-rose-300">
                    <XCircle className="w-5 h-5" /> {isAr ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button onClick={() => handleConfirm(lead)} className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200">
                    <CheckCircle className="w-5 h-5" /> {isAr ? 'تأكيد' : 'Confirmer'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
