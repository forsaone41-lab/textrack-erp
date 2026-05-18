import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, Package, Trash2, CheckCircle, MessageSquare, UserPlus, Users, X, AlertTriangle, Calculator, PhoneCall, Eye, FileText, Download, Settings, Save, RefreshCw, Scissors, MapPin, Upload, Image as ImageIcon, Copy, Edit2 } from 'lucide-react';
import { Lead, loadLeads, saveRecord, User, genId, deleteRecord, loadData, loadCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';
import { generatePDF } from '../utils/pdf';
import { compressImage } from '../utils/image';

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
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'completed'>('all');
  const [category, setCategory] = useState<'clients' | 'recrutement'>('clients');

  const [confirmLead, setConfirmLead] = useState<Lead | null>(null);
  const [confirmDetails, setConfirmDetails] = useState({
    tissu: '',
    couleurs: '',
    tailles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as Record<string, number>,
    tissuPhoto: '',
    modelePhoto: '',
    prixUnitaire: '',
    avance: '',
    dateLivraisonPrevue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [successLead, setSuccessLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [devisLead, setDevisLead] = useState<Lead | null>(null);
  const [contactingLead, setContactingLead] = useState<Lead | null>(null);
  const [matierePrice, setMatierePrice] = useState<string>('');
  const [laborPrice, setLaborPrice] = useState<string>('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [newClientCode, setNewClientCode] = useState<{ name: string, code: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('textrack_msg_templates');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
      // Deep merge with defaults to ensure all keys exist
      return {
        ar: { ...DEFAULT_TEMPLATES.ar, ...(parsed?.ar || {}) },
        fr: { ...DEFAULT_TEMPLATES.fr, ...(parsed?.fr || {}) }
      };
    } catch (e) {
      return DEFAULT_TEMPLATES;
    }
  });

  useEffect(() => {
    // Show cached data instantly (no blank screen)
    try {
      const cachedLeads = localStorage.getItem('textrack_data_leads');
      if (cachedLeads) {
        const parsed = JSON.parse(cachedLeads);
        if (Array.isArray(parsed)) setLeads(parsed.filter((l: any) => l && l.name !== '__SYSTEM_CONFIG__'));
      }
      const cachedUsers = localStorage.getItem('textrack_data_users');
      if (cachedUsers) {
        const parsed = JSON.parse(cachedUsers);
        if (Array.isArray(parsed)) setUsers(parsed);
      }
    } catch { /* ignore parse errors */ }

    // Then refresh from network in background
    async function refresh() {
      const [leadsData, usersData] = await Promise.all([
        loadLeads(),
        loadData<User>('users')
      ]);
      setLeads(leadsData);
      setUsers(usersData || []);
    }
    refresh();
  }, []);

  const [employes, setEmployes] = useState<any[]>([]);

  useEffect(() => {
    loadData<any>('employes').then(data => setEmployes(data || []));
  }, []);

  const { prospectsCount, recruitmentCount } = useMemo(() => {
    return {
      prospectsCount: leads.filter(l => !l.type.startsWith('RECRUTEMENT:')).length,
      recruitmentCount: leads.filter(l => l.type.startsWith('RECRUTEMENT:')).length
    };
  }, [leads]);

  const activeWorkersCount = useMemo(() => {
    return employes.filter(e => e.actif).length;
  }, [employes]);

  const saveTemplates = (newTemplates: any) => {
    console.log("Saving templates...", newTemplates);
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

  const toggleColor = (color: string) => {
    let currentColors = confirmDetails.couleurs.split(',').map(c => c.trim()).filter(c => c);
    if (currentColors.includes(color)) {
      currentColors = currentColors.filter(c => c !== color);
    } else {
      currentColors.push(color);
    }
    setConfirmDetails({ ...confirmDetails, couleurs: currentColors.join(', ') });
  };

  const handleConvert = async () => {
    if (!confirmLead) return;
    const lead = confirmLead;

    try {
      // 1. Check if user already exists
      const allUsers = await loadData<User>('users');
      let existingUser = allUsers?.find(u => u.email === lead.email);

      if (!existingUser) {
        // 2. Create new user if not exists
        const newClient: User = {
          id: genId(),
          nom: lead.name,
          role: 'client',
          email: lead.email || `${lead.name.toLowerCase().replace(/\s/g, '.')}@client.ma`,
          password: 'Client' + lead.phone.slice(-4),
          pinCode: lead.phone.slice(-4),
        };
        await saveRecord('users', newClient);
      }

      // 3. Create a real Commande record
      const newOrder = {
        id: genId(),
        reference: `CMD-${Date.now().toString().slice(-6)}`,
        client: lead.name,
        modele: lead.type,
        tissu: confirmDetails.tissu || 'À définir',
        tissuPhoto: confirmDetails.tissuPhoto || undefined,
        modelePhoto: confirmDetails.modelePhoto || undefined,
        couleurs: confirmDetails.couleurs.split(',').map(c => c.trim()).filter(c => c),
        tailles: confirmDetails.tailles,
        quantite: lead.quantity,
        quantiteLivre: 0,
        dateCommande: new Date().toISOString().split('T')[0],
        dateLivraisonPrevue: confirmDetails.dateLivraisonPrevue,
        phase: 'patronage',
        prix: Number(confirmDetails.prixUnitaire) || 0,
        prixUnitaire: Number(confirmDetails.prixUnitaire) || 0,
        avance: Number(confirmDetails.avance) || 0,
        rebut: 0,
        statut: 'echantillon_en_cours',
        suivi: [{ phase: 'patronage', date: new Date().toISOString(), note: 'Demande d\'échantillon envoyée au modélisme' }]
      };

      await saveRecord('commandes', newOrder);

      updateStatus(lead.id, 'completed');
      setSuccessLead(confirmLead);
      setConfirmLead(null);
      setConfirmDetails({
        tissu: '',
        couleurs: '',
        tailles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        tissuPhoto: '',
        modelePhoto: '',
        prixUnitaire: '',
        avance: '',
        dateLivraisonPrevue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (e: any) {
      alert(isAr ? 'مشكل: ' + e.message : 'Erreur: ' + e.message);
    }
  };

  const updateStatus = async (id: string, status: Lead['status']) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const updatedLead = { ...lead, status };
    const updatedList = leads.map(l => l.id === id ? updatedLead : l);
    setLeads(updatedList);
    try {
      await saveRecord('leads', updatedLead, true);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const leadToDelete = leads.find(l => l.id === deleteId);
      const updated = leads.filter(l => l.id !== deleteId);
      setLeads(updated);
      await deleteRecord('leads', deleteId, leadToDelete?.email);
    } catch (err: any) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;
    const updatedLead = { ...editingLead, ...editForm };
    const updatedList = leads.map(l => l.id === editingLead.id ? updatedLead : l);
    setLeads(updatedList);
    try {
      await saveRecord('leads', updatedLead, true);
      setEditingLead(null);
    } catch (err: any) {
      alert(isAr ? 'مشكل في الحفظ: ' + err.message : 'Erreur de sauvegarde : ' + err.message);
    }
  };

  const convertToClient = async (lead: Lead) => {
    try {
      // 1. Check if user already exists (by email) to avoid constraint error
      const allUsers = await loadData<User>('users') || [];
      const emailToUse = (lead.email || `${lead.name.replace(/\s+/g, '').toLowerCase()}@beya.ma`).toLowerCase();

      const existing = allUsers.find(u => u.email.toLowerCase() === emailToUse);
      if (existing) {
        alert(isAr ? 'هذا الزبون مسجل مسبقاً في النظام بنفس البريد الإلكتروني.' : 'Ce client est déjà enregistré avec cet email.');
        return;
      }

      const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newId = genId();
      const newClient = {
        id: newId,
        nom: lead.name,
        role: 'client' as const,
        // Make email more unique if it was auto-generated to avoid future collisions
        email: lead.email || `${lead.name.replace(/\s+/g, '').toLowerCase()}_${newId.slice(0, 4)}@beya.ma`,
        telephone: lead.phone,
        password: autoCode,
        actif: true
      };
      await saveRecord('users', newClient);
      setUsers(prev => [...prev, newClient]);
      setNewClientCode({ name: lead.name, code: autoCode });
    } catch (e: any) {
      alert(isAr ? 'مشكل: ' + e.message : 'Erreur: ' + e.message);
    }
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

  const handleContact = async (lead: Lead, typeId: string, customMsg?: string) => {
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
    await saveRecord('leads', updated.find(l => l.id === lead.id), true);

    // Slight delay before closing to show feedback
    setTimeout(() => {
      setContactingLead(null);
    }, 800);
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

  const filteredLeads = useMemo(() => leads.filter(l => {
    const isRecrutement = l.type.startsWith('RECRUTEMENT:');
    const matchCategory = category === 'recrutement' ? isRecrutement : !isRecrutement;
    const matchFilter = filter === 'all' || l.status === filter;
    return matchCategory && matchFilter;
  }), [leads, category, filter]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(10); }, [category, filter]);

  const visibleLeads = useMemo(() => filteredLeads.slice(0, visibleCount), [filteredLeads, visibleCount]);
  const hasMore = visibleCount < filteredLeads.length;

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 max-w-2xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100 relative my-4 sm:my-8">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <button
              onClick={() => setConfirmLead(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {isAr ? 'طلب عينة (Échantillon)' : 'Demande d\'Échantillon'}
                </h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                  {isAr ? 'مرحلة الموافقة قبل الإنتاج الشامل' : 'Phase de validation avant production'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الزبون' : 'Client'}</p>
                <p className="text-sm font-black text-slate-900">{confirmLead.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الكمية الأولية' : 'Qté Initiale'}</p>
                <p className="text-sm font-black text-indigo-600">{confirmLead.quantity} pcs</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{isAr ? 'نوع الثوب (Tissu)' : 'Type de Tissu'}</label>
                  <input
                    type="text"
                    list="tissus-list"
                    placeholder={isAr ? "اختر أو اكتب..." : "Choisir ou taper..."}
                    value={confirmDetails.tissu}
                    onChange={e => setConfirmDetails({ ...confirmDetails, tissu: e.target.value })}
                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                  <datalist id="tissus-list">
                    <option value="Coton 100%" />
                    <option value="Molleton / 3 Fils" />
                    <option value="Jersey" />
                    <option value="Polyester" />
                    <option value="Denim / Jean" />
                    <option value="Lin" />
                    <option value="Viscose" />
                    <option value="Gabardine" />
                    <option value="Toile" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{isAr ? 'الألوان (Couleurs)' : 'Couleurs'}</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['Noir', 'Blanc', 'Gris', 'Bleu Marine', 'Rouge', 'Beige'].map(color => {
                      const isSelected = confirmDetails.couleurs.includes(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder={isAr ? "ألوان أخرى..." : "Autres couleurs..."}
                    value={confirmDetails.couleurs}
                    onChange={e => setConfirmDetails({ ...confirmDetails, couleurs: e.target.value })}
                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{isAr ? 'صورة الثوب أو تشكيلة الألوان (اختياري)' : 'Photo Tissu / Gamme Couleurs (Optionnel)'}</label>
                  <div className="flex items-center gap-4">
                    {confirmDetails.tissuPhoto ? (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md group shrink-0">
                        <img src={confirmDetails.tissuPhoto} alt="Tissu" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setConfirmDetails({ ...confirmDetails, tissuPhoto: '' })}
                          className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all shrink-0">
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase text-center leading-tight">{isAr ? 'صورة الثوب' : 'Photo Tissu'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImage(file);
                                setConfirmDetails({ ...confirmDetails, tissuPhoto: compressed });
                              } catch (err) {
                                console.error('Failed to compress image', err);
                              }
                            }
                          }}
                        />
                      </label>
                    )}

                    {/* Modele Photo Upload */}
                    {confirmDetails.modelePhoto ? (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-fuchsia-100 shadow-md group shrink-0">
                        <img src={confirmDetails.modelePhoto} alt="Modele" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setConfirmDetails({ ...confirmDetails, modelePhoto: '' })}
                          className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-fuchsia-400 transition-all shrink-0">
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase text-center leading-tight">{isAr ? 'صورة الموديل' : 'Photo Modèle'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImage(file);
                                setConfirmDetails({ ...confirmDetails, modelePhoto: compressed });
                              } catch (err) {
                                console.error('Failed to compress image', err);
                              }
                            }
                          }}
                        />
                      </label>
                    )}

                    <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                      <div className="flex items-start gap-3">
                        <ImageIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-blue-800 leading-relaxed">
                          {isAr
                            ? 'قم بإرفاق صورة للثوب أو لتشكيلة الألوان كدليل، وصورة للموديل (Design) المطلوب لتفادي الأخطاء في الإنتاج.'
                            : 'Joignez une photo du tissu et du modèle demandé comme preuve pour la production.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4">{isAr ? 'توزيع المقاسات' : 'Répartition des Tailles'}</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(t => (
                    <div key={t} className="space-y-1 text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{t}</span>
                      <input
                        type="number"
                        min="0"
                        value={confirmDetails.tailles[t] || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setConfirmDetails({
                            ...confirmDetails,
                            tailles: { ...confirmDetails.tailles, [t]: val }
                          });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 text-center text-xs font-black focus:border-indigo-600 outline-none transition-colors shadow-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center bg-indigo-50 px-4 py-2 rounded-xl text-indigo-800">
                  <span className="text-xs font-black uppercase tracking-widest">{isAr ? 'المجموع المؤكد:' : 'Total Confirmé :'}</span>
                  <span className="text-lg font-black">
                    {Object.values(confirmDetails.tailles).reduce((a, b) => a + b, 0)} <span className="text-[10px] text-indigo-400">pcs</span>
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">
                    {isAr ? 'المالية والتخطيط' : 'Finance & Planning'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{isAr ? 'الثمن للقطعة' : 'Prix Unitaire'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={confirmDetails.prixUnitaire}
                        onChange={e => setConfirmDetails({ ...confirmDetails, prixUnitaire: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 pl-8 text-sm font-black text-emerald-900 outline-none focus:border-emerald-500 transition-colors"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-black">MAD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{isAr ? 'التسبيق (العربون)' : 'Avance payée'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={confirmDetails.avance}
                        onChange={e => setConfirmDetails({ ...confirmDetails, avance: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 pl-8 text-sm font-black text-emerald-900 outline-none focus:border-emerald-500 transition-colors"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-black">MAD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{isAr ? 'تاريخ التسليم' : 'Date de Livraison'}</label>
                    <input
                      type="date"
                      value={confirmDetails.dateLivraisonPrevue}
                      onChange={e => setConfirmDetails({ ...confirmDetails, dateLivraisonPrevue: e.target.value })}
                      className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 text-sm font-black text-emerald-900 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4">
              <button
                onClick={() => setConfirmLead(null)}
                className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all border border-slate-200"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleConvert}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                {isAr ? 'إطلاق العينة (Échantillon)' : 'Lancer l\'Échantillon'}
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
                ? `لقد تم طلب العينة لـ "${successLead.name}" بنجاح. بمجرد موافقة الزبون على العينة، يمكنك إطلاق الإنتاج الشامل واقتطاع الثوب من الستوك.`
                : `La demande d'échantillon pour "${successLead.name}" a été lancée. Une fois validée par le client, vous pourrez lancer la production globale et déduire le tissu du stock.`}
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner w-full sm:w-auto">
              <button
                onClick={() => setCategory('clients')}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative ${category === 'clients' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Package className="w-4 h-4" />
                {isAr ? 'زبناء محتملون' : 'Prospects'}
                {prospectsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in border-2 border-white">
                    {prospectsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCategory('recrutement')}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative ${category === 'recrutement' ? 'bg-white text-rose-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <UserPlus className="w-4 h-4" />
                {isAr ? 'توظيف' : 'Recrutement'}
                {recruitmentCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in border-2 border-white">
                    {recruitmentCount}
                  </span>
                )}
              </button>
            </div>

            {/* Global Workers Summary (Khdama) - hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm ml-auto">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{isAr ? 'مجموع الخدامة' : 'Total Personnel'}</p>
                <p className="text-sm font-black text-slate-900 leading-tight">{activeWorkersCount}</p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {category === 'recrutement' ? (isAr ? 'إدارة التوظيف' : 'Gestion Recrutement') : (isAr ? 'طلبات الزبائن' : 'Demandes Prospects')}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
              {category === 'recrutement' ? (isAr ? 'مراجعة المترشحين الجدد' : 'Suivi des candidatures et profils') : (isAr ? 'تواصل مع المهتمين بخدمات المصنع' : 'Gérez les prospects intéressés par vos services')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 sm:p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {(['all', 'new', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {isAr ? (f === 'all' ? 'الكل' : f === 'new' ? 'جديد' : 'مكتمل') : f}
              </button>
            ))}
          </div>
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
          visibleLeads.map(lead => (
            <div
              key={lead.id}
              className={`bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 border-2 transition-all hover:border-indigo-100 shadow-sm hover:shadow-xl group relative overflow-hidden ${lead.status === 'new' ? 'border-indigo-500/20 ring-1 ring-indigo-500/10' : 'border-slate-100'
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
                    <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform overflow-hidden">
                      {lead.photo ? (
                        <img src={lead.photo} className="w-full h-full object-cover" alt="Model" loading="lazy" />
                      ) : (
                        <ImageIcon className="w-5 h-5 opacity-50" />
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
                    <h3 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{lead.name}</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-indigo-500" /> {lead.phone}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {lead.ville || '-'}</span>
                      {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {lead.email}</span>}
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(lead.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                        {lead.type.startsWith('RECRUTEMENT:') ? (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="font-black text-[11px] uppercase tracking-tighter">
                              {lead.type.replace('RECRUTEMENT:', '')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Package className="w-3.5 h-3.5" /> {lead.type} ({lead.quantity} pcs)
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-stretch sm:items-center gap-3">

                  {/* Primary Action Removed: Sample Launch now handled in FichesTechniques */}

                  {/* Contact Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, '').startsWith('0') ? '212' + lead.phone.replace(/\D/g, '').substring(1) : lead.phone.replace(/\D/g, '')}`}
                      className="w-11 h-11 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-colors border border-slate-100 shadow-sm"
                      title={isAr ? 'اتصال مباشر' : 'Appel Direct'}
                    >
                      <PhoneCall className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => setContactingLead(lead)}
                      className={`h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border shadow-sm ${lead.contactedAt
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {isAr ? (lead.contactedAt ? 'تم التواصل' : 'واتساب') : (lead.contactedAt ? 'Contacté' : 'WhatsApp')}
                    </button>
                    {(() => {
                      const cvData = lead.details?.split('| CV_ATTACHMENT:')[1];
                      if (!cvData) return null;
                      return (
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = cvData;
                            link.download = `CV_${lead.name.replace(/\s/g, '_')}`;
                            link.click();
                          }}
                          className="w-11 h-11 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-indigo-100 shadow-sm"
                          title={isAr ? 'تحميل السيرة الذاتية' : 'Télécharger le CV'}
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      );
                    })()}
                  </div>

                  {/* Secondary Tools: Devis, Fiche, Convert Client */}
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50/50 p-1 sm:p-1.5 rounded-2xl border border-slate-100 shadow-inner flex-wrap">
                    {/* Recruitment Add Button - Navigates to Waiting List with candidate data */}
                    {category === 'recrutement' ? (
                      <button
                        onClick={() => navigate('/liste-attente', { state: { fromRecruitment: lead } })}
                        className="w-12 h-12 flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 rounded-xl transition-all shadow-lg shadow-rose-200 group/btn animate-pulse hover:animate-none"
                        title={isAr ? 'إضافة إلى لائحة الانتظار' : 'Ajouter à la liste d\'attente'}
                      >
                        <UserPlus className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    ) : (
                      /* Convert to Client Button - Disappears if already a client */
                      !users.some(u => u.nom.toLowerCase() === lead.name.toLowerCase() && u.role === 'client') ? (
                        <button
                          onClick={() => convertToClient(lead)}
                          className="w-9 h-9 flex items-center justify-center bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-100 group/btn"
                          title={isAr ? 'تسجيل كزبون جديد' : 'Enregistrer comme nouveau client'}
                        >
                          <UserPlus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100" title={isAr ? 'زبون مسجل' : 'Client déjà enregistré'}>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )
                    )}

                    {!lead.type.startsWith('RECRUTEMENT:') && (
                      <button
                        onClick={() => setDevisLead(lead)}
                        className="w-9 h-9 flex items-center justify-center bg-white text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm border border-amber-100 group/btn"
                        title={isAr ? 'حساب التكلفة' : 'Devis'}
                      >
                        <Calculator className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Fiche Technique Button - Hidden for recruitment, otherwise active only if client is registered */}
                    {!lead.type.startsWith('RECRUTEMENT:') && (() => {
                      const clientExists = users.some(u => u.nom.toLowerCase() === lead.name.toLowerCase() && u.role === 'client');
                      return (
                        <button
                          onClick={() => clientExists && navigate('/fiches-techniques', { state: { fromLead: lead } })}
                          disabled={!clientExists}
                          className={`h-9 px-3 flex items-center justify-center gap-2 rounded-xl transition-all shadow-sm border font-black text-[9px] uppercase tracking-widest ${clientExists
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:shadow-indigo-100 group/btn'
                            : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                            }`}
                          title={!clientExists ? (isAr ? 'يجب تسجيل الزبون أولاً' : 'Enregistrez le client d\'abord') : (isAr ? 'إنشاء بطاقة تقنية' : 'Créer Fiche Technique')}
                        >
                          <FileText className={`w-3.5 h-3.5 ${clientExists ? 'group-hover/btn:scale-110 transition-transform' : ''}`} />
                          {!isAr && "Fiche"}
                          {isAr && "بطاقة"}
                        </button>
                      );
                    })()}
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingLead(lead); setEditForm(lead); }}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title={isAr ? 'تعديل' : 'Modifier'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(lead.id)}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title={isAr ? 'حذف الطلب' : 'Supprimer'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {lead.details && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MessageSquare className="w-3.5 h-3.5" /> {isAr ? 'تفاصيل المشروع' : 'Détails du projet'}
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {lead.details.split('| CV_ATTACHMENT:')[0]}
                  </p>
                </div>
              )}
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-8 pb-12">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-10 py-4 bg-white border-2 border-slate-100 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-3 group"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              {isAr ? 'مشاهدة المزيد من الطلبات' : 'Afficher plus de demandes'}
            </button>
          </div>
        )}
      </div>
      {/* Hidden PDF Template for Export - Only rendered when needed */}
      {devisLead && (() => {
        const company = loadCompanyProfile();
        const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
        const totalMatiere = Number(matierePrice || 0) * (devisLead.quantity || 0);
        const totalLabor = Number(laborPrice || 0) * (devisLead.quantity || 0);
        const totalGeneral = unitPrice * (devisLead.quantity || 0);
        const devisNum = `DV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

        return (
          <div
            id="devis-pdf-template"
            className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-white font-sans"
            style={{ color: '#0f172a', backgroundColor: 'white' }}
          >
            {/* ===== HEADER ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4f46e5', padding: '20px 32px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {company.logoInvoice && company.logoInvoice !== '/logo.png' ? (
                  <img src={company.logoInvoice} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
                ) : company.logoUrl && company.logoUrl !== '/logo.png' ? (
                  <img src={company.logoUrl} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                    {company.name?.charAt(0) || 'B'}
                  </div>
                )}
                <div>
                  <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0, textTransform: 'uppercase' }}>{company.name || 'BEYA CREATIVE'}</h1>
                  <p style={{ fontSize: '8px', fontWeight: 700, color: '#6366f1', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{company.subtitle || 'Confection Textile'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1e1b4b', textTransform: 'uppercase' }}>DEVIS</h2>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', margin: '2px 0 0' }}>N° {devisNum} — {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* ===== EMETTEUR / CLIENT ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '12px 32px', fontSize: '11px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>Émetteur</h3>
                <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{company.name}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{company.address}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>Tél: {company.phone}</p>
                {company.email && <p style={{ fontWeight: 600, color: '#64748b', margin: '0', fontSize: '10px' }}>{company.email}</p>}
                {company.ice && company.ice !== '000000000000000' && <p style={{ fontWeight: 600, color: '#94a3b8', margin: '3px 0 0', fontSize: '9px' }}>ICE: {company.ice} {company.rc && company.rc !== '123456' ? `| RC: ${company.rc}` : ''}</p>}
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>Client / Destinataire</h3>
                <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{devisLead.name}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{devisLead.phone}</p>
                {devisLead.email && <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{devisLead.email}</p>}
                {devisLead.ville && <p style={{ fontWeight: 600, color: '#64748b', margin: '0', fontSize: '10px' }}>{devisLead.ville}</p>}
              </div>
            </div>

            {/* ===== OBJET ===== */}
            <div style={{ margin: '0 32px 10px', background: '#eef2ff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#4338ca' }}>
                Objet : Devis de confection — <span style={{ fontWeight: 900 }}>{devisLead.type}</span> × {devisLead.quantity} pièces
              </p>
            </div>

            {/* ===== TABLE ===== */}
            <div style={{ margin: '0 32px 10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '8px 0 0 0' }}>Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>Qté</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>PU (MAD)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', borderRadius: '0 8px 0 0' }}>Total (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Number(matierePrice) > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800 }}>Tissu & Fournitures</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{devisLead.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{Number(matierePrice).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>{totalMatiere.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800 }}>Confection & Main d'œuvre</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{devisLead.quantity}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{Number(laborPrice || 0).toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>{totalLabor.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===== TOTALS ===== */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 32px 14px' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Prix Unitaire</span>
                  <span style={{ fontWeight: 800 }}>{unitPrice.toFixed(2)} MAD</span>
                </div>
                {Number(matierePrice) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Sous-total Matière</span>
                    <span style={{ fontWeight: 800 }}>{totalMatiere.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Sous-total MO</span>
                  <span style={{ fontWeight: 800 }}>{totalLabor.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'linear-gradient(135deg, #312e81, #4f46e5)',
                  color: 'white', padding: '16px', borderRadius: '12px', marginTop: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, display: 'block' }}>Total Général</span>
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>TTC</span>
                  </div>
                  <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-1px' }}>{totalGeneral.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '13px', fontWeight: 800 }}>MAD</span></span>
                </div>
              </div>
            </div>

            {/* ===== CONDITIONS — CLEAR & READABLE ===== */}
            <div style={{ margin: '0 32px 12px', padding: '14px 18px', borderRadius: '10px', border: '2px solid #312e81', borderLeft: '6px solid #4f46e5', background: '#fafaff' }}>
              <p style={{ fontWeight: 900, color: '#1e1b4b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px', borderBottom: '1px solid #e0e7ff', paddingBottom: '6px' }}>📋 Conditions Générales</p>
              <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600, lineHeight: '2' }}>
                <p style={{ margin: '0 0 2px' }}><strong style={{ color: '#4f46e5' }}>1.</strong> Ce devis est <strong>valable 15 jours</strong> à compter de la date d'émission.</p>
                <p style={{ margin: '0 0 2px' }}><strong style={{ color: '#4f46e5' }}>2.</strong> Un <strong>acompte de 50%</strong> est requis à la confirmation de la commande.</p>
                <p style={{ margin: '0 0 2px' }}><strong style={{ color: '#4f46e5' }}>3.</strong> Le <strong>délai de production</strong> sera confirmé après validation de l'échantillon.</p>
                <p style={{ margin: 0 }}><strong style={{ color: '#4f46e5' }}>4.</strong> Toute <strong>modification du modèle</strong> après lancement peut entraîner une révision tarifaire.</p>
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div style={{ margin: '0 32px', borderTop: '2px solid #e2e8f0', paddingTop: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 2px' }}>
                Merci de votre confiance — {company.name}
              </p>
              <p style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                {company.address} | {company.phone} | {company.email}
              </p>
            </div>
          </div>
        );
      })()}
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
                        onChange={(e) => setTemplates({ ...templates, ar: { ...templates.ar, firstContact: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رسالة تقدير الثمن (نصية)</label>
                      <textarea
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.ar.devisTxt}
                        onChange={(e) => setTemplates({ ...templates, ar: { ...templates.ar, devisTxt: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رسالة تقدير الثمن (مع PDF)</label>
                      <textarea
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.ar.devisPdf}
                        onChange={(e) => setTemplates({ ...templates, ar: { ...templates.ar, devisPdf: e.target.value } })}
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
                        onChange={(e) => setTemplates({ ...templates, fr: { ...templates.fr, firstContact: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Devis Rapide (Texte)</label>
                      <textarea
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.fr.devisTxt}
                        onChange={(e) => setTemplates({ ...templates, fr: { ...templates.fr, devisTxt: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Devis Officiel (avec PDF)</label>
                      <textarea
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 focus:border-indigo-500 outline-none transition-all"
                        value={templates.fr.devisPdf}
                        onChange={(e) => setTemplates({ ...templates, fr: { ...templates.fr, devisPdf: e.target.value } })}
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
                    className={`w-full text-left p-6 border-2 rounded-3xl transition-all group flex items-start gap-4 relative overflow-hidden ${isSent
                      ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100'
                      : 'bg-slate-50 border-transparent hover:border-emerald-500 hover:bg-white'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSent ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-400 group-hover:text-emerald-500 group-hover:shadow-lg'
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

      {/* New Client Code Modal */}
      {newClientCode && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden border border-slate-100">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <button
              onClick={() => setNewClientCode(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              {isAr ? 'تم التسجيل بنجاح' : 'Client Enregistré'}
            </h3>
            <p className="text-sm font-bold text-slate-500 mb-8">
              {isAr ? 'تم إنشاء الحساب، يرجى مشاركة هذا الرقم السري مع الكليان:' : 'Le compte a été créé. Voici le mot de passe à partager :'}
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between border-2 border-slate-100 mb-8 group hover:border-emerald-200 transition-colors">
              <span className="text-4xl font-black tracking-[0.2em] text-slate-900 font-mono ml-3">{newClientCode.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newClientCode.code);
                }}
                className="w-14 h-14 flex items-center justify-center bg-white border-2 border-slate-200 text-slate-400 rounded-xl shadow-sm hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all hover:scale-105 active:scale-95"
                title={isAr ? 'نسخ الكود' : 'Copier le code'}
              >
                <Copy className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => setNewClientCode(null)}
              className="w-full h-14 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              {isAr ? 'إغلاق النافذة' : 'Fermer'}
            </button>
          </div>
        </div>
      )}
      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl relative overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {isAr ? 'تعديل بيانات الطلب' : 'Modifier le Lead'}
              </h3>
              <button
                onClick={() => setEditingLead(null)}
                className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الاسم' : 'Nom'}</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الهاتف' : 'Téléphone'}</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'المدينة' : 'Ville'}</label>
                  <input
                    type="text"
                    value={editForm.ville || ''}
                    onChange={e => setEditForm({ ...editForm, ville: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الموديل' : 'Modèle / Type'}</label>
                  <input
                    type="text"
                    value={editForm.type || ''}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                {!editForm.type?.startsWith('RECRUTEMENT:') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الكمية' : 'Quantité'}</label>
                    <input
                      type="number"
                      value={editForm.quantity || 0}
                      onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'تفاصيل إضافية' : 'Détails'}</label>
                <textarea
                  value={editForm.details || ''}
                  onChange={e => setEditForm({ ...editForm, details: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="pt-8 flex gap-3">
              <button
                onClick={() => setEditingLead(null)}
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                {isAr ? 'حفظ التعديلات' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
          </div >
        </div >
      )}
    </div >
  );
}
