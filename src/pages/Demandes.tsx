import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Package, Trash2, CheckCircle, MessageSquare, Clock, UserPlus, X, AlertTriangle, Calculator, PhoneCall, Eye, FileText, Download, Settings, Save, RefreshCw } from 'lucide-react';
import { Lead, loadLeads, saveRecord, User, genId } from '../types';
import { useLang } from '../contexts/LangContext';
import { generatePDF } from '../utils/pdf';

const DEFAULT_TEMPLATES = {
  ar: {
    firstContact: "السلام عليكم *{name}*، معكم *BEYA CREATIVE*. 😊\n\nشكراً على طلبكم الخاص بـ *{type}*. باش نقدروا نعاونوكم أحسن، واش ممكن تجاوبونا على هاد الأسئلة:\n1. فوقاش محتاجين الطلبية (أقصى أجل)؟\n2. واش نتوما علامة تجارية واجدة (Brand) ولا كتبيعوا في الأنترنيت (E-com) وباغين تصاوبوا الماركة ديالكم؟\n3. واش عندكم التصميم (Logo/Design) واجد؟\n4. واش محتاجين الثوب من عندنا ولا عندكم الثوب ديالكم؟\n\nحنا في الخدمة! 🇲🇦",
    devisTxt: "السلام عليكم *{name}*، معكم *BEYA CREATIVE*. 😊\n\nإليكم عرض السعر لطلبكم الخاص بـ *{type}*:\n- الكمية: *{quantity} قطعة*\n- الثمن للقطعة: *{unitPrice} درهم*\n- المجموع الإجمالي: *{total} درهم* {note}\n\n*(ملاحظة: كلما زادت الكمية، ينخفض ثمن القطعة)*\n\nباش نضمنوا الجودة، كنقترحوا نصاوبوا **عينة (Échantillon)** هي الأولى باش نصاوبوا الورقة التقنية. واش نبداو العينة؟ 🧵🇲🇦",
    devisPdf: "السلام عليكم *{name}*، معكم *BEYA CREATIVE*. 😊\n\nيسعدنا أن نقدم لكم تقدير الثمن الخاص بطلبكم. لقد حرصنا على دراسة طلبكم بعناية لنضمن لكم أفضل جودة لمنتجات *{type}*.\n\nنحن في انتظار تأكيدكم للبدء في العمل. شكراً لثقتكم!"
  },
  fr: {
    firstContact: "Bonjour *{name}*, ici *BEYA CREATIVE*. 😊\n\nMerci pour votre demande de *{type}*. Pour mieux vous accompagner, pourriez-vous nous préciser :\n1. Quel est votre délai souhaité ?\n2. Êtes-vous une marque établie ou vendez-vous en ligne (E-com) et souhaitez-vous créer votre propre branding ?\n3. Avez-vous déjà le design ou logo prêt ?\n4. Souhaitez-vous que nous fournissions le tissu ou avez-vous déjà le vôtre ?\n\nNous sommes à votre disposition ! 🇲🇦",
    devisTxt: "Bonjour *{name}*, ici *BEYA CREATIVE*. 😊\n\nVoici notre proposition pour votre commande de *{type}* :\n- Quantité : *{quantity} pcs*\n- Prix Unitaire : *{unitPrice} MAD*\n- TOTAL : *{total} MAD* {note}\n\n*(Note : Tarif dégressif selon la quantité)*\n\nPour garantir la qualité, nous suggérons de commencer par un **Échantillon** pour créer la Fiche Technique. On lance l'échantillon ? 🧵🇲🇦",
    devisPdf: "Bonjour *{name}*, ici *BEYA CREATIVE*. 😊\n\nNous avons le plaisir de vous transmettre votre devis. Nous avons étudié votre demande avec soin pour vous garantir la meilleure qualité pour vos *{type}*.\n\nNous attendons votre confirmation pour lancer la production. Merci de votre confiance !"
  }
};

export default function Demandes() {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'completed'>('all');

  const [confirmLead, setConfirmLead] = useState<Lead | null>(null);
  const [successLead, setSuccessLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [devisLead, setDevisLead] = useState<Lead | null>(null);
  const [contactingLead, setContactingLead] = useState<Lead | null>(null);
  const [matierePrice, setMatierePrice] = useState<string>('');
  const [laborPrice, setLaborPrice] = useState<string>('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('textrack_msg_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  const saveTemplates = (newTemplates: any) => {
    setTemplates(newTemplates);
    localStorage.setItem('textrack_msg_templates', JSON.stringify(newTemplates));
    setShowSettings(false);
  };

  const resetTemplates = () => {
    if (window.confirm(isAr ? 'هل تريد استعادة القوالب الأصلية؟' : 'Voulez-vous restaurer les templates originaux ?')) {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('textrack_msg_templates', JSON.stringify(DEFAULT_TEMPLATES));
    }
  };

  const handleConvert = async () => {
    if (!confirmLead) return;
    const lead = confirmLead;
    
    try {
      const newClient: User = {
        id: genId(),
        nom: lead.name,
        role: 'client',
        email: lead.email || `${lead.name.toLowerCase().replace(/\s/g, '.')}@client.ma`,
        password: 'Client' + lead.phone.slice(-4),
        pinCode: lead.phone.slice(-4),
      };

      await saveRecord('users', newClient);
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
    
    const hasMatiere = Number(matierePrice) > 0;
    let message = '';
    
    const lang = isAr ? 'ar' : 'fr';
    const t = templates[lang];

    if (isPDF) {
      message = t.devisPdf
        .replace(/{name}/g, devisLead.name)
        .replace(/{type}/g, devisLead.type);
    } else {
      const matiereNote = isAr 
        ? (hasMatiere ? ' (يشمل السلعة واليد العاملة)' : ' (يشمل اليد العاملة والتركيب)')
        : (hasMatiere ? ' (Inclut matière et confection)' : ' (Inclut confection et main d’œuvre)');

      message = t.devisTxt
        .replace(/{name}/g, devisLead.name)
        .replace(/{type}/g, devisLead.type)
        .replace(/{quantity}/g, devisLead.quantity.toString())
        .replace(/{unitPrice}/g, unitPrice.toLocaleString())
        .replace(/{total}/g, total.toLocaleString())
        .replace(/{note}/g, matiereNote);
    }
    
    const rawPhone = devisLead.phone.replace(/\D/g, '');
    let formattedPhone = rawPhone;
    if (rawPhone.startsWith('2120')) {
      formattedPhone = '212' + rawPhone.substring(4);
    } else if (rawPhone.startsWith('0')) {
      formattedPhone = '212' + rawPhone.substring(1);
    } else if (!rawPhone.startsWith('212')) {
      formattedPhone = '212' + rawPhone;
    }
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');
    if (!isPDF) {
      setDevisLead(null);
      setMatierePrice('');
      setLaborPrice('');
    }
  };

  const handleContact = (lead: Lead, typeId: string, customMsg?: string) => {
    const rawPhone = lead.phone.replace(/\D/g, '');
    let formattedPhone = rawPhone;
    if (rawPhone.startsWith('2120')) {
      formattedPhone = '212' + rawPhone.substring(4);
    } else if (rawPhone.startsWith('0')) {
      formattedPhone = '212' + rawPhone.substring(1);
    } else if (!rawPhone.startsWith('212')) {
      formattedPhone = '212' + rawPhone;
    }
    
    const lang = isAr ? 'ar' : 'fr';
    const message = customMsg || templates[lang].firstContact
      .replace(/{name}/g, lead.name)
      .replace(/{type}/g, lead.type);

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');
    
    // Mark as contacted with specific type
    const updated = leads.map(l => l.id === lead.id ? { 
      ...l, 
      contactedAt: new Date().toISOString(),
      contactedType: typeId 
    } : l);
    
    setLeads(updated);
    localStorage.setItem('textrack_leads', JSON.stringify(updated));
    
    // Slight delay before closing to show feedback
    setTimeout(() => {
      setContactingLead(null);
    }, 800);
  };

  const getFirstContactMessage = (lead: Lead) => {
    const lang = isAr ? 'ar' : 'fr';
    return templates[lang].firstContact
      .replace(/{name}/g, lead.name)
      .replace(/{type}/g, lead.type);
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
              onClick={() => { setDevisLead(null); setMatierePrice(''); setLaborPrice(''); }}
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
                onClick={() => sendDevis(false)}
                disabled={!matierePrice && !laborPrice}
                className="h-16 bg-slate-100 text-slate-600 rounded-[20px] font-black uppercase tracking-widest text-[9px] hover:bg-slate-200 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                {isAr ? '2. إرسال الثمن' : '2. WhatsApp (Txt)'}
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={!matierePrice && !laborPrice}
                className="h-16 bg-slate-100 text-slate-600 rounded-[20px] font-black uppercase tracking-widest text-[9px] hover:bg-slate-200 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isAr ? 'تحميل PDF' : 'Download PDF'}
              </button>
            </div>

            <button 
              onClick={() => sendDevis(true)}
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
              {isAr ? '2. إرسال الثمن + PDF' : '2. WhatsApp + PDF'}
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
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {isAr ? 'طلبات الزبائن الجدد' : 'Demandes Prospects'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {isAr ? 'تواصل مع المهتمين بخدمات المصنع' : 'Gérez les prospects intéressés par vos services'}
            </p>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
            title={isAr ? 'إعدادات الرسائل' : 'Paramètres des Messages'}
          >
            <Settings className="w-5 h-5" />
          </button>
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
                      href={`tel:${lead.phone.replace(/\D/g, '').startsWith('0') ? '212' + lead.phone.replace(/\D/g, '').substring(1) : lead.phone.replace(/\D/g, '')}`} 
                      className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm"
                      title={isAr ? 'اتصال مباشر' : 'Appel Direct'}
                    >
                      <PhoneCall className="w-5 h-5" />
                    </a>

                    <button 
                      onClick={() => setContactingLead(lead)} 
                      className={`h-11 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 ${
                        lead.contactedAt 
                          ? 'bg-slate-100 text-emerald-600 border border-emerald-100 shadow-none' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {lead.contactedAt ? <CheckCircle className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      {isAr ? (lead.contactedAt ? 'تم التواصل' : '1. تواصل') : (lead.contactedAt ? 'Contacté' : '1. Contact')}
                    </button>
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
            {Number(matierePrice) > 0 && (
              <tr className="border-b border-slate-100">
                <td className="py-6 px-6 font-black uppercase">{isAr ? 'القماش / المواد' : 'Tissu / Fournitures'}</td>
                <td className="py-6 px-6 text-center font-bold">{devisLead?.quantity}</td>
                <td className="py-6 px-6 text-center font-bold text-slate-500">{matierePrice} MAD</td>
                <td className="py-6 px-6 text-right font-black">
                  {(Number(matierePrice || 0) * (devisLead?.quantity || 0)).toLocaleString()} MAD
                </td>
              </tr>
            )}
            <tr className="border-b border-slate-100">
              <td className="py-6 px-6 font-black uppercase">{isAr ? 'الفصالة والخياطة' : 'Coupe & Confection'}</td>
              <td className="py-6 px-6 text-center font-bold">{devisLead?.quantity}</td>
              <td className="py-6 px-6 text-center font-bold text-slate-500">{laborPrice} MAD</td>
              <td className="py-6 px-6 text-right font-black">
                {(Number(laborPrice || 0) * (devisLead?.quantity || 0)).toLocaleString()} MAD
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-20">
          <div className="w-72 space-y-4">
            {Number(matierePrice) > 0 && (
              <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest px-4">
                <span>Total Matière</span>
                <span>{(Number(matierePrice || 0) * (devisLead?.quantity || 0)).toLocaleString()} MAD</span>
              </div>
            )}
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
      {/* Message Templates Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {isAr ? 'إعدادات قوالب الرسائل' : 'Paramètres des Templates'}
                  </h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {isAr ? 'تخصيص الهوية البصرية للنصوص' : 'Personnalisez vos messages clients'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Arabic Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🇲🇦</span>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">العربية (AR)</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رسالة الاتصال الأول</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.ar.firstContact}
                        onChange={(e) => setTemplates({...templates, ar: {...templates.ar, firstContact: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رسالة تقدير الثمن (نصية)</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.ar.devisTxt}
                        onChange={(e) => setTemplates({...templates, ar: {...templates.ar, devisTxt: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رسالة تقدير الثمن (مع PDF)</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.ar.devisPdf}
                        onChange={(e) => setTemplates({...templates, ar: {...templates.ar, devisPdf: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                {/* French Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🇫🇷</span>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Français (FR)</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Premier Contact</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.fr.firstContact}
                        onChange={(e) => setTemplates({...templates, fr: {...templates.fr, firstContact: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Devis Rapide (Texte)</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.fr.devisTxt}
                        onChange={(e) => setTemplates({...templates, fr: {...templates.fr, devisTxt: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Devis Officiel (avec PDF)</label>
                      <textarea 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.fr.devisPdf}
                        onChange={(e) => setTemplates({...templates, fr: {...templates.fr, devisPdf: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-amber-800 space-y-1">
                    <p className="uppercase tracking-widest mb-1">Guide des variables :</p>
                    <p>استعمل <code className="bg-amber-200/50 px-1.5 py-0.5 rounded">{"{name}"}</code> للإسم، <code className="bg-amber-200/50 px-1.5 py-0.5 rounded">{"{type}"}</code> للنوع، و <code className="bg-amber-200/50 px-1.5 py-0.5 rounded">{"{total}"}</code> للمجموع.</p>
                    <p>Utilisez <code className="bg-amber-200/50 px-1.5 py-0.5 rounded">{"{name}"}</code> pour le nom, <code className="bg-amber-200/50 px-1.5 py-0.5 rounded">{"{type}"}</code> pour le type, etc.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-4">
              <button 
                onClick={resetTemplates}
                className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {isAr ? 'استعادة القوالب الأصلية' : 'Restaurer par défaut'}
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-4 text-sm font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button 
                  onClick={() => saveTemplates(templates)}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100"
                >
                  <Save className="w-5 h-5" />
                  {isAr ? 'حفظ التغييرات' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Contact Options Modal */}
      {contactingLead && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {isAr ? 'اختيار نوع الرسالة' : 'Type de Message'}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">{contactingLead.name}</p>
                </div>
              </div>
              <button onClick={() => setContactingLead(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              {[
                { 
                  id: 'standard', 
                  title: isAr ? 'رسالة تواصل قياسية' : 'Contact Standard',
                  icon: <FileText className="w-5 h-5" />,
                  desc: isAr ? 'الرسالة التي قمت بإعدادها في الإعدادات (تحية + أسئلة)' : 'Le message par défaut configuré dans les paramètres.',
                  msg: templates[isAr ? 'ar' : 'fr'].firstContact.replace(/{name}/g, contactingLead.name).replace(/{type}/g, contactingLead.type)
                },
                { 
                  id: 'strategic', 
                  title: isAr ? 'تركيز على العلامة التجارية (Brand)' : 'Focus Branding/E-com',
                  icon: <Settings className="w-5 h-5" />,
                  desc: isAr ? 'سؤال مباشر عن نوع العمل (Brand أو E-com)' : 'Question directe sur le profil (Marque ou E-commerce).',
                  msg: isAr 
                    ? `السلام عليكم *${contactingLead.name}*، معكم *BEYA CREATIVE*. 😊\n\nشكراً على اهتمامكم بـ *${contactingLead.type}*. واش نتوما علامة تجارية واجدة (Brand) ولا كتبيعوا في الأنترنيت (E-com) وبغيتو تصاوبوا الماركة الخاصة ديالكم؟`
                    : `Bonjour *${contactingLead.name}*, ici *BEYA CREATIVE*. 😊\n\nMerci pour votre intérêt pour les *${contactingLead.type}*. Êtes-vous une marque établie ou vendez-vous en ligne (E-com) et souhaitez-vous créer votre propre branding ?`
                },
                { 
                  id: 'short', 
                  title: isAr ? 'تحية سريعة' : 'Salut Rapide',
                  icon: <MessageSquare className="w-5 h-5" />,
                  desc: isAr ? 'تحية بسيطة لفتح باب النقاش' : 'Un message court pour engager la discussion.',
                  msg: isAr 
                    ? `السلام عليكم *${contactingLead.name}*، معكم *BEYA CREATIVE*. 😊 شكراً على طلبكم الخاص بـ *${contactingLead.type}*. واش ممكن تعطينا تفاصيل أكثر؟`
                    : `Bonjour *${contactingLead.name}*, ici *BEYA CREATIVE*. 😊 Merci pour votre demande de *${contactingLead.type}*. Pourriez-vous nous donner plus de détails ?`
                }
              ].map(opt => {
                const isSent = contactingLead.contactedType === opt.id;
                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleContact(contactingLead, opt.id, opt.msg)}
                    className={`w-full text-left p-6 border-2 rounded-3xl transition-all group flex items-start gap-4 relative overflow-hidden ${
                      isSent 
                        ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100' 
                        : 'bg-slate-50 border-transparent hover:border-emerald-500 hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isSent ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-400 group-hover:text-emerald-500 group-hover:shadow-lg'
                    }`}>
                      {isSent ? <CheckCircle className="w-5 h-5" /> : opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${isSent ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {opt.title}
                        </h4>
                        {isSent && (
                          <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                            {isAr ? 'تم الإرسال' : 'Envoyé'}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium leading-relaxed ${isSent ? 'text-emerald-700/70' : 'text-slate-500'}`}>
                        {opt.desc}
                      </p>
                    </div>
                    
                    {isSent && (
                      <div className="absolute -right-2 -top-2 opacity-10">
                        <CheckCircle className="w-16 h-16 text-emerald-500 rotate-12" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3 text-emerald-600">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">سيتم فتح WhatsApp تلقائياً وتحديث حالة الطلب</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
