import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Package, Trash2, CheckCircle, MessageSquare, Clock, UserPlus, X, AlertTriangle, Calculator, PhoneCall, Eye, FileText, Download } from 'lucide-react';
import { Lead, loadLeads, saveRecord, User, genId } from '../types';
import { useLang } from '../contexts/LangContext';
import { generatePDF } from '../utils/pdf';

export default function Demandes() {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'completed'>('all');

  const [confirmLead, setConfirmLead] = useState<Lead | null>(null);
  const [successLead, setSuccessLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [devisLead, setDevisLead] = useState<Lead | null>(null);
  const [matierePrice, setMatierePrice] = useState<string>('');
  const [laborPrice, setLaborPrice] = useState<string>('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  const handleConvert = async () => {
    if (!confirmLead) return;
    const lead = confirmLead;
    
    try {
      // Create a user for this client
      const newClient: User = {
        id: genId(),
        nom: lead.name,
        role: 'client',
        email: lead.email || `${lead.name.toLowerCase().replace(/\s/g, '.')}@client.ma`,
        password: 'Client' + lead.phone.slice(-4), // Default password
        pinCode: lead.phone.slice(-4), // Default PIN is last 4 digits
      };

      await saveRecord('users', newClient);
      
      // Mark lead as completed
      updateStatus(lead.id, 'completed');
      
      setSuccessLead(confirmLead);
      setConfirmLead(null);
    } catch (e) {
      alert('Error creating client');
    }
  };

  const updateStatus = (id: string, status: Lead['status']) => {
    const updated = leads.map(l => l.id === id ? { ...l, status } : l);
    setLeads(updated);
    localStorage.setItem('textrack_leads', JSON.stringify(updated));
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const updated = leads.filter(l => l.id !== deleteId);
    setLeads(updated);
    localStorage.setItem('textrack_leads', JSON.stringify(updated));
    setDeleteId(null);
  };

  const sendDevis = (isPDF: boolean = false) => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
    const total = unitPrice * devisLead.quantity;
    
    let message = '';
    if (isPDF) {
      message = isAr
        ? `السلام عليكم ${devisLead.name}، معكم BEYA CREATIVE. 📄\n\nتجدون أسفله تقدير الثمن (PDF) لطلبكم الخاص بـ ${devisLead.type}.\n\nشكراً لثقتكم! 🇲🇦`
        : `Bonjour ${devisLead.name}, ici BEYA CREATIVE. 📄\n\nCi-joint votre devis PDF pour votre demande de ${devisLead.type}.\n\nMerci de votre confiance ! 🇲🇦`;
    } else {
      message = isAr
        ? `السلام عليكم ${devisLead.name}، معكم BEYA CREATIVE.\n\nإليكم تقدير الثمن لطلبكم:\n- النوع: ${devisLead.type}\n- الكمية: ${devisLead.quantity} قطعة\n- الثمن للقطعة: ${unitPrice} درهم (Matière: ${matierePrice || 0} + MO: ${laborPrice || 0})\n- المجموع الإجمالي: ${total} درهم\n\nنحن في انتظار تأكيدكم للبدء في العمل. شكراً لثقتكم! 🇲🇦`
        : `Bonjour ${devisLead.name}, ici BEYA CREATIVE.\n\nVoici votre devis pour votre demande :\n- Type : ${devisLead.type}\n- Quantité : ${devisLead.quantity} pcs\n- Prix Unitaire : ${unitPrice} MAD (Matière: ${matierePrice || 0} + MO: ${laborPrice || 0})\n- TOTAL : ${total} MAD\n\nNous restons à votre disposition pour toute question. Merci de votre confiance ! 🇲🇦`;
    }
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${devisLead.phone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
    if (!isPDF) {
      setDevisLead(null);
      setMatierePrice('');
      setLaborPrice('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!devisLead) return;
    const filename = `Devis_${devisLead.name.replace(/\s/g, '_')}_${new Date().getTime()}`;
    
    // Delay to ensure template is rendered with data
    setTimeout(async () => {
      await generatePDF('devis-pdf-template', filename);
      setDevisLead(null);
      setMatierePrice('');
      setLaborPrice('');
    }, 500);
  };

  const filteredLeads = leads.filter(l => filter === 'all' || l.status === filter);

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'} relative`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Devis Calculator Modal */}
      {devisLead && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-amber-500" />
            <button 
              onClick={() => { setDevisLead(null); setDevisPrice(''); }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
              <Calculator className="w-8 h-8 text-amber-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">
              {isAr ? 'حساب التقدير' : 'Calculer le Devis'}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">{devisLead.name} - {devisLead.type}</p>

            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Quantité pieces</label>
                  <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-lg font-black text-slate-400">
                    {devisLead.quantity} <span className="text-[10px] uppercase">pcs</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 italic">Total Unit (MAD)</label>
                  <div className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-2xl py-3 px-4 text-lg font-black text-indigo-600">
                    {Number(matierePrice || 0) + Number(laborPrice || 0)} <span className="text-[10px] uppercase">MAD</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Prix Matière (MAD)</label>
                  <input 
                    type="number" 
                    value={matierePrice}
                    onChange={e => setMatierePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Prix MO (MAD)</label>
                  <input 
                    type="number" 
                    value={laborPrice}
                    onChange={e => setLaborPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-6 text-white text-center">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Général Estimé</p>
                <p className="text-3xl font-black">
                  {((Number(matierePrice || 0) + Number(laborPrice || 0)) * devisLead.quantity).toLocaleString()} <span className="text-sm">MAD</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={sendDevis}
                disabled={!matierePrice && !laborPrice}
                className="h-16 bg-slate-100 text-slate-600 rounded-[20px] font-black uppercase tracking-widest text-[9px] hover:bg-slate-200 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp (Txt)
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={!matierePrice && !laborPrice}
                className="h-16 bg-slate-100 text-slate-600 rounded-[20px] font-black uppercase tracking-widest text-[9px] hover:bg-slate-200 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <button 
              onClick={() => {
                handleDownloadPDF();
                setTimeout(() => sendDevis(true), 1500);
              }}
              disabled={!matierePrice && !laborPrice}
              className="w-full mt-4 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:scale-[1.01] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              <div className="flex items-center -space-x-2">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border-2 border-emerald-500">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              {isAr ? 'إرسال PDF عبر WhatsApp' : 'WhatsApp + PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />
            <button 
              onClick={() => setConfirmLead(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-indigo-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              {isAr ? 'تحويل لزبون رسمي؟' : 'Convertir en Client ?'}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {isAr 
                ? `هل أنت متأكد من تحويل "${confirmLead.name}" إلى قائمة الزبناء؟ سيتم إنشاء حساب له تلقائياً.`
                : `Voulez-vous transformer "${confirmLead.name}" en client officiel ? Un compte sera créé automatiquement.`}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmLead(null)}
                className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={handleConvert}
                className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                {isAr ? 'تأكيد التحويل' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Modal */}
      {successLead && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
            
            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              {isAr ? 'تمت العملية بنجاح!' : 'Félicitations !'}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {isAr 
                ? `لقد أصبح "${successLead.name}" زبوناً رسمياً للمصنع. يمكنه الآن الدخول باستعمال رمز PIN الخاص به.`
                : `"${successLead.name}" est désormais un client officiel. Il peut accéder à son espace avec son code PIN.`}
            </p>

            <div className="bg-amber-50 rounded-2xl p-4 mb-10 border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{isAr ? 'رمز PIN الخاص بالزبون' : 'Code PIN du Client'}</p>
              <p className="text-2xl font-black text-slate-900 tracking-[0.2em]">{successLead.phone.slice(-4)}</p>
            </div>

            <button 
              onClick={() => setSuccessLead(null)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              {isAr ? 'حسناً، مفهوم' : 'C\'est compris'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-500" />
            
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              {isAr ? 'حذف الطلب؟' : 'Supprimer le lead ?'}
            </h3>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
              {isAr 
                ? 'هل أنت متأكد؟ هاد العملية ما يمكنش ترجع فيها وغادي تمسح الطلب بمرة.'
                : 'Attention ! Cette action est irréversible. Voulez-vous vraiment supprimer ce prospect ?'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="py-4 bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-xl shadow-rose-100"
              >
                {isAr ? 'تأكيد الحذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-0 right-0 p-3 bg-white text-slate-900 rounded-full shadow-xl hover:scale-110 transition-transform z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewPhoto} 
              alt="Model Preview" 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border-4 border-white"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {isAr ? 'طلبات الزبائن الجدد' : 'Demandes Prospects'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isAr ? 'تواصل مع المهتمين بخدمات المصنع' : 'Gérez les prospects intéressés par vos services'}
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['all', 'new', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {isAr ? (f === 'all' ? 'الكل' : f === 'new' ? 'جديد' : 'مكتمل') : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Mail className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              {isAr ? 'لا توجد طلبات حالياً' : 'Aucune demande trouvée'}
            </p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div 
              key={lead.id} 
              className={`bg-white rounded-[2.5rem] p-6 border-2 transition-all hover:border-indigo-100 shadow-sm hover:shadow-xl group relative overflow-hidden ${
                lead.status === 'new' ? 'border-indigo-500/20 ring-1 ring-indigo-500/10' : 'border-slate-100'
              }`}
            >
              {lead.status === 'new' && (
                <div className="absolute top-0 right-0 px-6 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl">
                  New Lead
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="relative group/photo shrink-0">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform overflow-hidden">
                      {lead.photo ? (
                        <img src={lead.photo} className="w-full h-full object-cover" alt="Model" />
                      ) : (
                        <span className="text-xl font-black">{lead.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    {lead.photo && (
                      <button 
                        onClick={() => setPreviewPhoto(lead.photo!)}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-lg border border-slate-100 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{lead.name}</h3>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-indigo-500" /> {lead.phone}</span>
                      {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {lead.email}</span>}
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(lead.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                        <Package className="w-3.5 h-3.5" /> {lead.type} ({lead.quantity} pcs)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setDevisLead(lead)}
                    className="px-4 py-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4" /> Devis
                  </button>

                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <a 
                      href={`tel:${lead.phone.replace(/\s/g, '')}`} 
                      className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm"
                      title={isAr ? 'اتصال مباشر' : 'Appel Direct'}
                    >
                      <PhoneCall className="w-5 h-5" />
                    </a>

                    <a 
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="h-11 px-4 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Phone className="w-4 h-4" /> WhatsApp
                    </a>
                  </div>

                  {lead.status !== 'completed' && (
                    <button 
                      onClick={() => setConfirmLead(lead)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      <UserPlus className="w-4 h-4" /> {isAr ? 'تحويل لزبون' : 'Client'}
                    </button>
                  )}
                  
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => updateStatus(lead.id, 'completed')}
                      title="Mark as Completed"
                      className={`p-2.5 rounded-xl transition-all ${lead.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(lead.id)}
                      title="Delete"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {lead.details && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MessageSquare className="w-3.5 h-3.5" /> {isAr ? 'تفاصيل المشروع' : 'Détails du projet'}
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{lead.details}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Hidden PDF Template for Export - Optimized for single page capture */}
      <div 
        id="devis-pdf-template" 
        className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-white p-12 text-slate-900 font-sans"
        style={{ color: '#0f172a', backgroundColor: 'white' }}
      >
        <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-indigo-600 tracking-tighter uppercase mb-2">BEYA CREATIVE</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confection Textile & Création</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase mb-1">DEVIS ESTIMATIF</h2>
            <p className="text-sm font-bold text-slate-400 italic">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Émetteur</h3>
            <p className="text-sm font-black uppercase mb-1">BEYA CREATIVE FACTORY</p>
            <p className="text-xs font-bold text-slate-500">Zone Industrielle, Tanger</p>
            <p className="text-xs font-bold text-slate-500">Tel: +212 6 XX XX XX XX</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Client / Destinataire</h3>
            <p className="text-sm font-black uppercase mb-1">{devisLead?.name}</p>
            <p className="text-xs font-bold text-slate-500">{devisLead?.phone}</p>
            <p className="text-xs font-bold text-slate-500">{devisLead?.email}</p>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="py-4 px-6 text-left rounded-l-2xl">Description</th>
              <th className="py-4 px-6 text-center">Quantité</th>
              <th className="py-4 px-6 text-center">Matière / Unit</th>
              <th className="py-4 px-6 text-center">Main d'œuvre / Unit</th>
              <th className="py-4 px-6 text-right rounded-r-2xl">Total MAD</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-slate-100">
              <td className="py-6 px-6 font-black uppercase">{devisLead?.type}</td>
              <td className="py-6 px-6 text-center font-bold">{devisLead?.quantity}</td>
              <td className="py-6 px-6 text-center font-bold text-slate-500">{matierePrice || 0} MAD</td>
              <td className="py-6 px-6 text-center font-bold text-slate-500">{laborPrice || 0} MAD</td>
              <td className="py-6 px-6 text-right font-black">
                {((Number(matierePrice || 0) + Number(laborPrice || 0)) * (devisLead?.quantity || 0)).toLocaleString()} MAD
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-20">
          <div className="w-72 space-y-4">
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest px-4">
              <span>Total Matière</span>
              <span>{(Number(matierePrice || 0) * (devisLead?.quantity || 0)).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest px-4">
              <span>Total Main d'œuvre</span>
              <span>{(Number(laborPrice || 0) * (devisLead?.quantity || 0)).toLocaleString()} MAD</span>
            </div>
            <div className="bg-indigo-600 p-6 rounded-3xl text-white flex justify-between items-center shadow-xl shadow-indigo-100">
              <span className="text-xs font-black uppercase tracking-tighter">Total Général</span>
              <span className="text-2xl font-black tracking-tighter">
                {((Number(matierePrice || 0) + Number(laborPrice || 0)) * (devisLead?.quantity || 0)).toLocaleString()} MAD
              </span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-slate-100 pt-8 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Merci de votre confiance. Ce devis est valable pendant 15 jours.
          </p>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">
            BEYA CREATIVE - MADE IN MOROCCO 🇲🇦
          </p>
        </div>
      </div>
    </div>
  );
}
