import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, Package, Trash2, CheckCircle, MessageSquare, UserPlus, Users, X, AlertTriangle, Calculator, PhoneCall, Eye, FileText, Download, Settings, Save, RefreshCw, Scissors, MapPin, Upload, Image as ImageIcon, Copy, Edit2, Search, Globe, Briefcase, CheckCircle2, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { Lead, loadLeads, loadLeadPhoto, loadLeadPhotos, saveRecord, User, genId, deleteRecord, loadData, loadCompanyProfile, Facture, StockTissu } from '../types';
import { useLang } from '../contexts/LangContext';
import { generatePDF, generatePDFBlob, printElement } from '../utils/pdf';
import { sendPushToClient, sendPushToAll } from '../utils/pushNotifications';
import { compressImage } from '../utils/image';
import { PageLoader } from '../components/PageLoader';
import AISpace from './AISpace';

const DEFAULT_TEMPLATES = {
  ar: {
    firstContact: "السلام عليكم *{name}*، معكم *BEYA CREATIVE*. 😊\n\nشكراً على طلبكم الخاص بـ *{type}*. باش نقدروا نعاونوكم أحسن، واش ممكن تجاوبونا على هاد الأسئلة:\n1. فوقاش محتاجين الطلبية (أقصى أجل)؟\n2. واش نتوما علامة تجارية واجدة (Brand) ولا كتبيعوا في الأنترنيت (E-com) وباغين تصاوبوا الماركة ديالكم؟\n3. واش عندكم التصميم (Logo/Design) واجد؟\n4. واش محتاجين الثوب من عندنا ولا عندكم الثوب ديالكم؟\n\nحنا في الخدمة! 🇲🇦",
    firstContactRecrutement: "السلام عليكم *{name}*، معاكم مصنع *BEYA CREATIVE* بمكناس. 😊\n\nشفنا الطلب ديالك بخصوص خدمة *{type}*. بغينا غير نتأكدو من بعض المعلومات:\n1. شحال من عام ديال الخبرة عندك فهاد التخصص؟\n2. واش فايت ليك خدمتي فشي معمل ديال الخياطة من قبل؟\n3. واش ساكن(ة) في مكناس أو النواحي؟\n4. فوقاش تقدر تبدا الخدمة معنا يلا تفاهمنا؟\n\nحنا كنتسناو الجواب ديالك باش نحددو معاك موعد ديال لانتريتيان. 🇲🇦",
    devisTxt: "السلام عليكم *{name}*، معكم *BEYA CREATIVE*. 😊\n\nإليكم عرض السعر لطلبكم الخاص بـ *{type}*:\n- الكمية: *{quantity} قطعة*\n- الثمن للقطعة: *{unitPrice} درهم*\n- المجموع الإجمالي: *{total} درهم* {note}\n\n*(ملاحظة: كلما زادت الكمية، ينخفض ثمن القطعة)*\n\nباش نضمنوا الجودة، كنقترحوا نصاوبوا **عينة (Échantillon)** هي الأولى باش نصاوبوا الورقة التقنية. واش نبداو العينة؟ 🧵🇲🇦",
    devisPdf: "السلام عليكم *{name}*، معكم *BEYA CREATIVE*. 😊\n\nيسعدنا أن نقدم لكم تقدير الثمن الخاص بطلبكم. لقد حرصنا على دراسة طلبكم بعناية لنضمن لكم أفضل جودة لمنتجات *{type}*.\n\nنحن في انتظار تأكيدكم للبدء في العمل. شكراً لثقتكم!"
  },
  fr: {
    firstContact: "Bonjour *{name}*, ici *BEYA CREATIVE*. 😊\n\nMerci pour votre demande de *{type}*. Pour mieux vous accompagner, pourriez-vous nous préciser :\n1. Quel est votre délai souhaité ?\n2. Êtes-vous une marque établie ou vendez-vous en ligne (E-com) et souhaitez-vous créer votre propre branding ?\n3. Avez-vous déjà le design ou logo prêt ?\n4. Souhaitez-vous que nous fournissions le tissu ou avez-vous déjà le vôtre ?\n\nNous sommes à disposition ! 🇲🇦",
    firstContactRecrutement: "Bonjour *{name}*, ici l'usine *BEYA CREATIVE* à Meknès. 😊\n\nNous avons bien reçu votre candidature pour le poste de *{type}*. Pour compléter votre dossier, pourriez-vous répondre à ces questions :\n1. Combien d'années d'expérience avez-vous dans ce domaine ?\n2. Avez-vous déjà travaillé dans une usine de confection ?\n3. Habitez-vous à Meknès ou aux alentours ?\n4. Quelle est votre disponibilité pour commencer ?\n\nNous attendons votre retour pour programmer un entretien. 🇲🇦",
    devisTxt: "Bonjour *{name}*, ici *BEYA CREATIVE*. 😊\n\nVoici notre proposition pour votre commande de *{type}* :\n- Quantité : *{quantity} pcs*\n- Prix Unitaire : *{unitPrice} MAD*\n- TOTAL : *{total} MAD* {note}\n\n*(Note : Tarif dégressif selon la quantité)*\n\nPour garantir la qualité, nous suggérons de commencer par un **Échantillon** pour créer la Fiche Technique. On lance l'échantillon ? 🧵🇲🇦",
    devisPdf: "Bonjour *{name}*, ici *BEYA CREATIVE*. 😊\n\nNous avons le plaisir de vous transmettre votre devis. Nous avons étudié votre demande avec soin pour vous garantir la meilleure qualité pour vos *{type}*.\n\nNous attendons votre confirmation pour lancer la production. Merci de votre confiance !"
  }
};

export default function Demandes() {
  const { isAr } = useLang();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'completed'>('all');
  const [category, setCategory] = useState<'clients' | 'recrutement'>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'qty_desc' | 'qty_asc'>('date_desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterExperience, setFilterExperience] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [confirmLead, setConfirmLead] = useState<Lead | null>(null);
  const [confirmMode, setConfirmMode] = useState<'echantillon' | 'commande'>('echantillon');
  const [confirmDetails, setConfirmDetails] = useState({
    tissu: '',
    couleurs: '',
    tailles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as Record<string, number>,
    tissuPhoto: '',
    modelePhoto: '',
    prixEchantillon: '',
    prixUnitaire: '',
    avance: '',
    dateLivraisonPrevue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [successLead, setSuccessLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [devisLead, setDevisLead] = useState<Lead | null>(null);
  const [devisMode, setDevisMode] = useState<'echantillon' | 'commande'>('commande');
  const [devisLeadRequests, setDevisLeadRequests] = useState<Lead[]>([]);
  const [modelPrices, setModelPrices] = useState<Record<string, { matiere: string; labor: string }>>({});
  const [contactingLead, setContactingLead] = useState<Lead | null>(null);
  const [contactingLeadRequests, setContactingLeadRequests] = useState<Lead[]>([]);
  const [matierePrice, setMatierePrice] = useState<string>('');
  const [laborPrice, setLaborPrice] = useState<string>('');
  const [fabricType, setFabricType] = useState<string>('');
  const [factureCreated, setFactureCreated] = useState<{numero: string; client: string; montant: number} | null>(null);
  const [pdfProgress, setPdfProgress] = useState<'idle' | 'generating' | 'sharing' | 'done' | 'error'>('idle');
  const [detailsLead, setDetailsLead] = useState<Lead | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [aiAnalysisLead, setAiAnalysisLead] = useState<Lead | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lensEnabled, setLensEnabled] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [newClientCode, setNewClientCode] = useState<{ name: string, code: string, email: string, phone: string } | null>(null);
  const company = loadCompanyProfile();
  const [showSettings, setShowSettings] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [expandedDetails, setExpandedDetails] = useState<string[]>([]);
  const [filterStarred, setFilterStarred] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
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
    // 1. Show cached data INSTANTLY — no blank screen
    let hasCached = false;
    try {
      const cachedLeads = localStorage.getItem('textrack_data_leads');
      if (cachedLeads) {
        const parsed = JSON.parse(cachedLeads);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed.filter((l: any) => l && !l.type?.startsWith('__') && !l.name?.startsWith('__')));
          hasCached = true;
        }
      }
      const cachedUsers = localStorage.getItem('textrack_data_users');
      if (cachedUsers) {
        const parsed = JSON.parse(cachedUsers);
        if (Array.isArray(parsed)) setUsers(parsed);
      }
    } catch { /* ignore */ }

    // If we have cache, hide loader immediately
    if (hasCached) setLoading(false);

    // 2. Refresh from network
    async function refresh() {
      try {
        const [leadsData, usersData, tissusData] = await Promise.all([
          loadLeads(),
          loadData<User>('users'),
          loadData<StockTissu>('tissus')
        ]);
        if (tissusData) setTissus(tissusData);
        if (leadsData) {
          let validLeads = (leadsData as Lead[]).filter(l => l && !l.type?.startsWith('__') && !l.name?.startsWith('__'));
          
          // Auto-delete logic: remove if crmStage === 'annule' and rejectedAt is > 48 hours ago
          const now = Date.now();
          const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
          const toDelete = validLeads.filter(l => l.crmStage === 'annule' && l.rejectedAt && (now - new Date(l.rejectedAt).getTime() > FORTY_EIGHT_HOURS));
          
          if (toDelete.length > 0) {
            toDelete.forEach(async l => {
              await deleteRecord('leads', l.id, l.email);
            });
            validLeads = validLeads.filter(l => !toDelete.includes(l));
          }

          setLeads(validLeads);
          // 3. Load photos in background (batch of 10)
          loadPhotosInBackground(validLeads);
        }
        if (usersData) setUsers((usersData as User[]) || []);
      } catch (e) { console.warn('Refresh failed, using cache'); }
      finally { setLoading(false); }
    }

    async function loadPhotosInBackground(leadsArr: Lead[]) {
      // Load all missing photos progressively
      const withoutPhoto = leadsArr.filter(l => !l.photo);
      if (!withoutPhoto.length) return;
      // Load in batches of 5 to not block the thread
      for (let i = 0; i < withoutPhoto.length; i += 5) {
        const batch = withoutPhoto.slice(i, i + 5);
        const results = await Promise.allSettled(
          batch.map(l => loadLeadPhoto(l.id).then(photo => ({ id: l.id, photo })))
        );
        const updates: Record<string, string> = {};
        results.forEach(r => { if (r.status === 'fulfilled' && r.value.photo) updates[r.value.id] = r.value.photo; });
        if (Object.keys(updates).length > 0) {
          setLeads(prev => prev.map(l => updates[l.id] ? { ...l, photo: updates[l.id] } : l));
        }
      }
    }

    refresh();
  }, []);

  const [employes, setEmployes] = useState<any[]>([]);

  const openPhotoPreview = async (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPreviewPhotos([]);
    setPreviewIndex(0);
    setPreviewPhoto(null);
    setZoomLevel(1);
    setLensEnabled(false);

    if (lead.photoCount && lead.photoCount > 1) {
      const data = await loadLeadPhotos(lead.id);
      if (data.photos && data.photos.length > 0) {
        setPreviewPhotos(data.photos);
        setPreviewPhoto(data.photos[0]);
      } else if (data.photo) {
        setPreviewPhotos([data.photo]);
        setPreviewPhoto(data.photo);
      }
      return;
    }

    if (lead.photo || (lead.photos && lead.photos.length > 0)) {
      const photos = lead.photos && lead.photos.length > 0 ? lead.photos : [lead.photo!];
      setPreviewPhotos(photos);
      setPreviewPhoto(photos[0]);
      return;
    }
    
    const photo = await loadLeadPhoto(lead.id);
    if (photo) {
      setPreviewPhotos([photo]);
      setPreviewPhoto(photo);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, photo } : l));
    }
  };

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

  const handleAddAchat = async (tissuName: string) => {
    if (!confirmLead) return;
    try {
      const newAchat = {
        id: genId(),
        client: confirmLead.name,
        article: tissuName,
        quantiteRequise: confirmLead.quantity || 0,
        unite: 'm',
        statut: 'a_acheter',
        dateDemande: new Date().toISOString().split('T')[0],
        categorie: 'tissus'
      };
      await saveRecord('achats', newAchat);
      alert(isAr ? 'تمت إضافة الثوب للمشتريات (Achats) بنجاح.' : 'Tissu ajouté aux achats avec succès.');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
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
          email: (lead.email || `${lead.name.toLowerCase().replace(/\s/g, '.')}@client.ma`).toLowerCase().trim(),
          telephone: lead.phone,
          password: 'Client' + lead.phone.slice(-4),
          pinCode: lead.phone.slice(-4),
          ville: lead.ville || '',
          adresse: '',
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
        modelePhoto: confirmDetails.modelePhoto || lead.photo || undefined,
        couleurs: confirmDetails.couleurs.split(',').map(c => c.trim()).filter(c => c),
        tailles: confirmDetails.tailles,
        quantite: lead.quantity,
        quantiteLivre: 0,
        dateCommande: new Date().toISOString().split('T')[0],
        dateLivraisonPrevue: confirmDetails.dateLivraisonPrevue,
        phase: 'patronage',
        prix: Number(confirmDetails.prixUnitaire) || 0,
        prixUnitaire: Number(confirmDetails.prixUnitaire) || 0,
        prixEchantillon: Number(confirmDetails.prixEchantillon) || 0,
        avance: Number(confirmDetails.avance) || 0,
        rebut: 0,
        statut: confirmMode === 'commande' ? 'en_cours' : 'echantillon_en_cours',
        suivi: [{ phase: 'patronage', date: new Date().toISOString(), note: confirmMode === 'commande' ? 'Commande directe lancée (sans échantillon)' : 'Prix/délai validés et échantillon lancé (Avance payée)' }]
      };

      await saveRecord('commandes', newOrder);

      // 4. Auto-generate Devis in the finance section
      const unitPrice = Number(confirmDetails.prixUnitaire) || 0;
      if (unitPrice > 0) {
        const total = unitPrice * lead.quantity;
        const existingFactures = await loadData<Facture>('factures');
        const year = new Date().getFullYear();
        const prefix = `DEV-${year}-`;
        const existingNums = existingFactures
          .filter(f => f.numero?.startsWith(prefix))
          .map(f => parseInt(f.numero.replace(prefix, '')))
          .filter(n => !isNaN(n));
        const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
        const due = new Date();
        due.setDate(due.getDate() + 15);
        
        const autoDevis: Facture = {
          id: genId(),
          numero: `${prefix}${String(nextNum).padStart(3, '0')}`,
          commandeId: newOrder.id,
          client: lead.name,
          montant: total,
          avance: Number(confirmDetails.avance) || 0,
          date: new Date().toISOString().split('T')[0],
          echeance: due.toISOString().split('T')[0],
          statut: 'en_attente',
          typeDoc: 'devis',
        };
        await saveRecord('factures', autoDevis);
      }

      const updatedLead = { ...lead, status: 'completed' as const, crmStage: 'confirme' as const };
      setLeads(prev => prev.map(l => l.id === lead.id ? updatedLead : l));
      await saveRecord('leads', updatedLead, true);

      setSuccessLead(confirmLead);
      setConfirmLead(null);
      setConfirmDetails({
        tissu: '',
        couleurs: '',
        tailles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        tissuPhoto: '',
        modelePhoto: '',
        prixEchantillon: '',
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
    let updatedList = leads.map(l => l.id === editingLead.id ? updatedLead : l);
    
    if (editForm.phone || editForm.phone2) {
      const sameClientLeads = updatedList.filter(l => 
        l.id !== updatedLead.id && 
        l.name.toLowerCase() === updatedLead.name.toLowerCase()
      );
      
      for (const l of sameClientLeads) {
        let changed = false;
        if (editForm.phone && (!l.phone || l.phone.trim() === '')) {
          l.phone = editForm.phone;
          changed = true;
        }
        if (editForm.phone2 && (!l.phone2 || l.phone2.trim() === '')) {
          l.phone2 = editForm.phone2;
          changed = true;
        }
        if (changed) {
          await saveRecord('leads', l, true);
        }
      }
    }

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
        email: (lead.email || `${lead.name.replace(/\s+/g, '').toLowerCase()}_${newId.slice(0, 4)}@beya.ma`).toLowerCase().trim(),
        telephone: lead.phone,
        password: autoCode,
        pinCode: autoCode,
        actif: true,
        ville: lead.ville || '',
        adresse: ''
      };
      await saveRecord('users', newClient);
      setUsers(prev => [...prev, newClient]);
      setNewClientCode({ name: lead.name, code: autoCode, email: newClient.email, phone: lead.phone });
    } catch (e: any) {
      alert(isAr ? 'مشكل: ' + e.message : 'Erreur: ' + e.message);
    }
  };

  const sendDevis = (isPDF: boolean = false) => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
    const currentQuantity = devisMode === 'echantillon' ? 1 : devisLead.quantity;
    const total = unitPrice * currentQuantity;

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
        .replace(/{quantity}/g, currentQuantity.toString())
        .replace(/{unitPrice}/g, unitPrice.toLocaleString())
        .replace(/{total}/g, total.toLocaleString())
        .replace(/{note}/g, matiereNote);
    }

    const rawPhone = String(devisLead.phone || '').replace(/\D/g, '');
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

    // Save price to lead automatically
    const updatedLead = { ...devisLead, crmPrice: total, crmDevisMode: devisMode, crmStage: devisLead.crmStage || 'contact_en_cours' };
    saveRecord('leads', updatedLead);

    if (!isPDF) {
      // Intentionally keeping modal open
    }
  };

  const togglePriority = async (lead: Lead) => {
    const updated = { ...lead, crmPriority: !lead.crmPriority };
    setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
    await saveRecord('leads', updated);
  };

  const handleContact = async (lead: Lead, typeId: string, customMsg?: string) => {
    const rawPhone = String(lead.phone || '').replace(/\D/g, '');
    let formattedPhone = rawPhone;
    if (rawPhone.startsWith('2120')) {
      formattedPhone = '212' + rawPhone.substring(4);
    } else if (rawPhone.startsWith('0')) {
      formattedPhone = '212' + rawPhone.substring(1);
    } else if (!rawPhone.startsWith('212')) {
      formattedPhone = '212' + rawPhone;
    }

    const lang = isAr ? 'ar' : 'fr';
    const isRecrutement = lead.type.startsWith('RECRUTEMENT:');
    const templateName = isRecrutement ? 'firstContactRecrutement' : 'firstContact';
    
    // Use stored template if available, fallback to default (in case of old cache)
    const tplStr = templates[lang]?.[templateName] || DEFAULT_TEMPLATES[lang][templateName];

    const message = customMsg || tplStr
      .replace(/{name}/g, lead.name)
      .replace(/{type}/g, isRecrutement ? lead.type.replace('RECRUTEMENT:', '').trim() : lead.type);

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');

    // Mark as contacted with specific type and who contacted
    const currentUser = JSON.parse(localStorage.getItem('textrack_auth') || '{}');
    const userName = currentUser.nom || 'Admin';
    const updated = leads.map(l => l.id === lead.id ? {
      ...l,
      contactedAt: new Date().toISOString(),
      contactedType: `${typeId}|||${userName}`,
      contactedBy: userName
    } : l);

    setLeads(updated);
    await saveRecord('leads', updated.find(l => l.id === lead.id), true);

    // Slight delay before closing to show feedback
    setTimeout(() => {
      setContactingLead(null);
      setContactingLeadRequests([]);
    }, 800);
  };


  const handleSendToPortail = async () => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
    const currentQuantity = devisMode === 'echantillon' ? 1 : devisLead.quantity;
    const total = unitPrice * currentQuantity;
    const existingFactures = await loadData<Facture>('factures');
    const year = new Date().getFullYear();
    const prefix = `DEV-${year}-`;
    const existingNums = existingFactures
      .filter(f => f.numero?.startsWith(prefix))
      .map(f => parseInt(f.numero.replace(prefix, '')))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const due = new Date();
    due.setDate(due.getDate() + 15);
    const devis: Facture = {
      id: genId(),
      numero: `${prefix}${String(nextNum).padStart(3, '0')}`,
      client: devisLead.name,
      montant: total,
      avance: 0,
      date: new Date().toISOString().split('T')[0],
      echeance: due.toISOString().split('T')[0],
      statut: 'en_attente',
      typeDoc: 'devis',
    };
    await saveRecord('factures', devis);
    setFactureCreated({ numero: devis.numero, client: devisLead.name, montant: total });
    // Push notification to client
    sendPushToClient(
      devisLead.name,
      isAr ? '📄 لديك عرض سعر جديد' : '📄 Nouveau Devis BEYA CREATIVE',
      isAr ? `عرض سعر ${devis.numero} - ${total.toLocaleString()} درهم` : `Devis ${devis.numero} — ${total.toLocaleString()} MAD`,
      '/portail'
    ).catch(() => {});
  };

  const handleCreateFacture = async () => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
    const currentQuantity = devisMode === 'echantillon' ? 1 : devisLead.quantity;
    const total = unitPrice * currentQuantity;
    const existingFactures = await loadData<Facture>('factures');
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    const existingNums = existingFactures
      .filter(f => f.numero?.startsWith(prefix))
      .map(f => parseInt(f.numero.replace(prefix, '')))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const due = new Date();
    due.setDate(due.getDate() + 30);
    const facture: Facture = {
      id: genId(),
      numero: `${prefix}${String(nextNum).padStart(3, '0')}`,
      client: devisLead.name,
      montant: total,
      avance: 0,
      date: new Date().toISOString().split('T')[0],
      echeance: due.toISOString().split('T')[0],
      statut: 'en_attente',
      typeDoc: 'facture',
    };
    await saveRecord('factures', facture);
    setFactureCreated({ numero: facture.numero, client: devisLead.name, montant: total });
  };

  const handleDownloadPDF = async () => {
    if (!devisLead) return;
    const filename = `Devis_${devisLead.name.replace(/\s/g, '_')}_${new Date().getTime()}`;
    setTimeout(async () => {
      await generatePDF('devis-pdf-template', filename);
    }, 500);
  };

  const handleSharePDF = async () => {
    if (!devisLead || (!matierePrice && !laborPrice)) return;
    const filename = `Devis_${devisLead.name.replace(/\s/g, '_')}`;
    setPdfProgress('generating');
    try {
      await new Promise(r => setTimeout(r, 400));
      await new Promise(r => requestAnimationFrame(r));
      const blob = await generatePDFBlob('devis-pdf-template');
      if (blob) {
        const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });
        setPdfProgress('sharing');
        let shared = false;
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: `Devis BEYA CREATIVE — ${devisLead.name}` });
            shared = true;
          }
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') { setPdfProgress('idle'); return; }
        }
        if (!shared) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `${filename}.pdf`; a.click();
          URL.revokeObjectURL(url);
        }
        setPdfProgress('done');
        setTimeout(() => setPdfProgress('idle'), 2000);
      } else {
        // Fallback: send WhatsApp text + download via print
        setPdfProgress('idle');
        sendDevis(false);
        setTimeout(() => handleDownloadPDF(), 500);
      }
    } catch {
      // Fallback silently
      setPdfProgress('idle');
      sendDevis(false);
    }
  };

  const filteredLeads = useMemo(() => leads.filter(l => {
    const isRecrutement = l.type.startsWith('RECRUTEMENT:');
    const matchCategory = category === 'recrutement' ? isRecrutement : !isRecrutement;
    const matchFilter = filter === 'all' || l.status === filter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.type.toLowerCase().includes(q) || (l.ville || '').toLowerCase().includes(q);
    
    let matchType = true;
    let matchExperience = true;

    if (category === 'recrutement') {
      const typeStr = l.type.replace('RECRUTEMENT:', '').trim();
      matchType = filterType === 'all' || typeStr === filterType;
      
      const m = l.details?.match(/Expérience:\s*(\d+)/);
      const expStr = m ? m[1] : '0';
      matchExperience = filterExperience === 'all' || expStr === filterExperience;
    } else {
      matchType = filterType === 'all' || l.type === filterType;
    }

    const matchStarred = filterStarred ? !!l.crmPriority : true;

    return matchCategory && matchFilter && matchSearch && matchType && matchExperience && matchStarred;
  }).sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'qty_desc') return b.quantity - a.quantity;
    if (sortBy === 'qty_asc') return a.quantity - b.quantity;
    return 0;
  }), [leads, category, filter, searchQuery, sortBy, filterType, filterExperience, filterStarred]);

  // Reset visible count + filterType when category changes
  useEffect(() => { setVisibleCount(10); setFilterType('all'); setFilterExperience('all'); setSearchQuery(''); }, [category]);
  useEffect(() => { setVisibleCount(10); }, [filter]);

  const visibleLeads = useMemo(() => filteredLeads.slice(0, visibleCount), [filteredLeads, visibleCount]);
  const hasMore = visibleCount < filteredLeads.length;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'} relative`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Custom Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 to-indigo-500" />
            <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl flex items-center justify-center mb-5">
              <UserCheck className="w-7 h-7 text-fuchsia-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-7">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={async () => {
                  setConfirmModal(null);
                  await confirmModal.onConfirm();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg shadow-fuchsia-200"
              >
                {isAr ? 'تأكيد' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devis Calculator Modal */}
      {devisLead && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">

            {/* Header compact */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{isAr ? 'حساب الديفيز' : 'Calculer le Devis'}</p>
                  <p className="text-[10px] text-slate-500 font-bold max-w-[180px] line-clamp-2">{devisLead.name} — {devisLead.type}</p>
                </div>
              </div>
              <button
                onClick={() => { setDevisLead(null); setDevisLeadRequests([]); setModelPrices({}); setMatierePrice(''); setLaborPrice(''); setFabricType(''); }}
                className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {devisLeadRequests.length > 0 ? (() => {
                // Multi-model mode: per-model price inputs
                const multiTotal = devisLeadRequests.reduce((sum, r) => {
                  const p = modelPrices[r.id] || { matiere: '', labor: '' };
                  return sum + (Number(p.matiere || 0) + Number(p.labor || 0)) * (r.quantity || 0);
                }, 0);
                const hasAnyPrice = devisLeadRequests.some(r => {
                  const p = modelPrices[r.id] || { matiere: '', labor: '' };
                  return Number(p.matiere || 0) > 0 || Number(p.labor || 0) > 0;
                });
                return (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {devisLeadRequests.map((r, idx) => {
                        const p = modelPrices[r.id] || { matiere: '', labor: '' };
                        const unitPrice = Number(p.matiere || 0) + Number(p.labor || 0);
                        const subtotal = unitPrice * (r.quantity || 0);
                        return (
                          <div key={r.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">{r.type}</span>
                              <span className="text-[10px] font-black text-slate-400">{r.quantity} pcs × {unitPrice} = <span className="text-slate-700">{subtotal.toLocaleString()} MAD</span></span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الثوب/القطعة' : 'Matière/pcs'}</label>
                                <input type="number" value={p.matiere} placeholder="0"
                                  onChange={e => setModelPrices(prev => ({ ...prev, [r.id]: { ...prev[r.id], matiere: e.target.value } }))}
                                  className="w-full bg-white border-2 border-slate-200 rounded-lg py-2 px-2.5 text-sm font-black text-slate-900 outline-none focus:border-indigo-400" />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'يد عاملة/قطعة' : "MO/pcs"}</label>
                                <input type="number" value={p.labor} placeholder="0"
                                  onChange={e => setModelPrices(prev => ({ ...prev, [r.id]: { ...prev[r.id], labor: e.target.value } }))}
                                  className="w-full bg-white border-2 border-slate-200 rounded-lg py-2 px-2.5 text-sm font-black text-slate-900 outline-none focus:border-indigo-400" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-slate-900 rounded-xl px-4 py-3 text-white flex items-center justify-between">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{isAr ? 'المجموع الكلي' : 'Total général'}</p>
                      <p className="text-xl font-black">{multiTotal.toLocaleString()} <span className="text-xs">MAD</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => {
                        const lines = devisLeadRequests.map(r => {
                          const p = modelPrices[r.id] || { matiere: '', labor: '' };
                          const u = Number(p.matiere || 0) + Number(p.labor || 0);
                          return `• ${r.type}: ${r.quantity} pcs × ${u} MAD = *${(u * r.quantity).toLocaleString()} MAD*`;
                        }).join('\n');
                        const multiTotal2 = devisLeadRequests.reduce((s, r) => { const p = modelPrices[r.id] || { matiere: '', labor: '' }; return s + (Number(p.matiere || 0) + Number(p.labor || 0)) * r.quantity; }, 0);
                        const rawPhone = String(devisLead!.phone || '').replace(/\D/g, '');
                        const phone = rawPhone.startsWith('2120') ? '212' + rawPhone.slice(3) : rawPhone.startsWith('0') ? '212' + rawPhone.slice(1) : rawPhone;
                        const msg = isAr
                          ? `السلام عليكم *${devisLead!.name}*، معكم *BEYA CREATIVE*. 😊\n\nتفضلوا الديفيز الخاص بطلبيتكم:\n${lines}\n\n*المجموع الكلي: ${multiTotal2.toLocaleString()} MAD*\n\nحنا في الخدمة! 🇲🇦`
                          : `Bonjour *${devisLead!.name}*, ici *BEYA CREATIVE*. 😊\n\nVoici le devis de votre commande:\n${lines}\n\n*Total général: ${multiTotal2.toLocaleString()} MAD*\n\nÀ votre service! 🇲🇦`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }} disabled={!hasAnyPrice}
                        className="h-10 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40">
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button disabled className="h-10 bg-slate-50 text-slate-300 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </>
                );
              })() : (
                <>
                  {/* Toggle Mode */}
                  <div className="flex bg-slate-100/85 p-1 rounded-xl gap-1 border border-slate-200/50">
                    <button
                      onClick={() => setDevisMode('commande')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        devisMode === 'commande'
                          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      {isAr ? 'طلبية كاملة' : 'Commande'} ({devisLead.quantity} pcs)
                    </button>
                    <button
                      onClick={() => setDevisMode('echantillon')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        devisMode === 'echantillon'
                          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isAr ? 'عينة' : 'Échantillon'} (1 pc)
                    </button>
                  </div>

                  {/* Qty + Unit price row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{isAr ? 'الكمية' : 'Quantité'}</p>
                      <p className="text-base font-black text-slate-700">
                        {devisMode === 'echantillon' ? 1 : devisLead.quantity} <span className="text-[10px] text-slate-400">pcs</span>
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl px-3 py-2.5 border border-indigo-100">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{isAr ? 'ثمن القطعة' : 'Prix/unité'}</p>
                      <p className="text-base font-black text-indigo-600">{Number(matierePrice || 0) + Number(laborPrice || 0)} <span className="text-[10px]">MAD</span></p>
                    </div>
                  </div>

                  {/* Fabric Type / Details Input */}
                  <div className="mb-2">
                    <label className={`block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ${isAr ? 'text-right' : ''}`}>
                      {isAr ? 'تفاصيل السلعة' : 'Détails Matière'} <span className="text-slate-300 normal-case font-medium">{isAr ? '(اختياري)' : '(Optionnel)'}</span>
                    </label>
                    <input type="text" value={fabricType} onChange={e => setFabricType(e.target.value)} placeholder={isAr ? 'اكتب التفاصيل هنا...' : 'Écrivez les détails ici...'}
                      dir={isAr ? 'rtl' : 'ltr'}
                      className={`w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-xs font-medium text-slate-900 outline-none focus:border-indigo-400 ${isAr ? 'text-right' : ''}`} />
                    <div className={`flex flex-wrap gap-1 mt-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                      {(isAr 
                        ? ['الثوب', 'الخيط', 'الطباعة', 'الطرز', 'اللوازم', 'التغليف']
                        : ['Tissu', 'Fil', 'Impression', 'Broderie', 'Fournitures', 'Packaging']
                      ).map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!fabricType.includes(tag)) {
                              setFabricType(prev => prev ? `${prev} + ${tag}` : tag);
                            }
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-500 rounded text-[9px] font-black transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                      <button 
                        onClick={() => setFabricType('')}
                        className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[9px] font-black transition-colors"
                      >
                        {isAr ? 'مسح' : 'Vider'}
                      </button>
                    </div>
                  </div>

                  {/* Inputs row */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الثوب والسلعة' : 'Matière (MAD)'}</label>
                      <input type="number" value={matierePrice} onChange={e => setMatierePrice(e.target.value)} placeholder="0"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm font-black text-slate-900 outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'اليد العاملة' : "Main d'œuvre"}</label>
                      <input type="number" value={laborPrice} onChange={e => setLaborPrice(e.target.value)} placeholder="0"
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm font-black text-slate-900 outline-none focus:border-indigo-400" />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-slate-900 rounded-xl px-4 py-2.5 text-white flex items-center justify-between mb-3 shadow-sm">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">{isAr ? 'المجموع التقديري' : 'Total estimé'}</p>
                    <p className="text-lg font-black">{((Number(matierePrice || 0) + Number(laborPrice || 0)) * (devisMode === 'echantillon' ? 1 : devisLead.quantity)).toLocaleString()} <span className="text-[10px]">MAD</span></p>
                  </div>

                  {/* Action buttons Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={handleDownloadPDF} disabled={!matierePrice && !laborPrice}
                      className="h-9 bg-slate-100 text-slate-700 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40">
                      <Download className="w-3.5 h-3.5" /> {isAr ? 'تحميل PDF' : 'Download PDF'}
                    </button>
                    <button onClick={handleSharePDF} disabled={!matierePrice && !laborPrice}
                      className="h-9 bg-emerald-50 text-emerald-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40">
                      <FileText className="w-3.5 h-3.5" /> {isAr ? 'مشاركة PDF' : 'Partager PDF'}
                    </button>
                    <button onClick={() => sendDevis(false)} disabled={!matierePrice && !laborPrice}
                      className="h-9 bg-slate-100 text-slate-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40">
                      <MessageSquare className="w-3.5 h-3.5" /> {isAr ? 'واتساب (نص)' : 'Texte WhatsApp'}
                    </button>
                    <button onClick={handleSendToPortail} disabled={!matierePrice && !laborPrice}
                      className="h-9 bg-slate-800 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm">
                      <Globe className="w-3.5 h-3.5" /> {isAr ? 'للبورتال' : 'Au Portail'}
                    </button>
                  </div>

                  <button onClick={handleCreateFacture} disabled={!matierePrice && !laborPrice}
                    className="w-full h-10 mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-md shadow-indigo-200">
                    <CheckCircle className="w-4 h-4" />
                    {isAr ? '✓ قبول ← إنشاء فاتورة' : '✓ Accepté → Créer Facture'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details & Tailles Modal */}
      {detailsLead && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{detailsLead.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{detailsLead.type} — {detailsLead.quantity} pcs</p>
                </div>
              </div>
              <button onClick={() => setDetailsLead(null)} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {detailsLead.details && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> {isAr ? 'تفاصيل المشروع' : 'Détails du projet'}
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {detailsLead.details.split('| CV_ATTACHMENT:')[0]}
                    </p>
                  </div>
                </div>
              )}

              {detailsLead.tailles && Object.values(detailsLead.tailles).some(v => v > 0) && (
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Tailles
                  </p>
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex flex-wrap gap-2">
                      {detailsLead.tailles && Object.entries(detailsLead.tailles).filter(([,v]) => v > 0).map(([size, qty]) => (
                        <div key={size} className="bg-white rounded-lg px-3 py-2 border border-indigo-100 text-center shadow-sm">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">{size}</p>
                          <p className="text-base font-black text-indigo-700">{qty}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detailsLead.aiNotes && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> {isAr ? 'تقرير الذكاء الاصطناعي' : 'Rapport IA'}</span>
                  </p>
                  <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl p-4 border border-indigo-100/50 shadow-sm">
                    <p dir={isAr ? 'rtl' : 'ltr'} className={`text-xs text-slate-700 font-bold leading-relaxed whitespace-pre-wrap ${isAr ? 'text-right' : 'text-left'}`}>
                      {detailsLead.aiNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Progress Modal */}
      {pdfProgress !== 'idle' && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl text-center">
            {pdfProgress === 'generating' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
                  <FileText className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
                </div>
                <p className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1">
                  {isAr ? 'جاري إنشاء PDF...' : 'Génération PDF...'}
                </p>
                <p className="text-xs text-slate-400">{isAr ? 'ثانية من فضلك' : 'Patientez quelques secondes'}</p>
                <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
                </div>
              </>
            )}
            {pdfProgress === 'sharing' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Download className="w-7 h-7 text-emerald-500 animate-bounce" />
                </div>
                <p className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1">
                  {isAr ? 'جاري المشاركة...' : 'Partage en cours...'}
                </p>
                <p className="text-xs text-slate-400">{isAr ? 'اختر التطبيق' : 'Choisissez l\'application'}</p>
              </>
            )}
            {pdfProgress === 'done' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="font-black text-emerald-700 text-sm uppercase tracking-widest">
                  {isAr ? 'تم بنجاح ✓' : 'PDF Envoyé ✓'}
                </p>
              </>
            )}
            {pdfProgress === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <p className="font-black text-red-600 text-sm uppercase tracking-widest mb-1">
                  {isAr ? 'حدث خطأ' : 'Erreur'}
                </p>
                <p className="text-xs text-slate-400">{isAr ? 'حاول مجدداً' : 'Réessayez'}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Facture Created Success Modal */}
      {factureCreated && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">
              {isAr ? 'تم إنشاء الفاتورة!' : 'Facture Créée !'}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
              {isAr ? 'تمت العملية بنجاح' : 'Ajoutée dans Factures & Docs'}
            </p>
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Facture</span>
                <span className="text-sm font-black text-indigo-600">{factureCreated.numero}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</span>
                <span className="text-sm font-black text-slate-800">{factureCreated.client}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant Total</span>
                <span className="text-xl font-black text-emerald-600">{factureCreated.montant.toLocaleString()} MAD</span>
              </div>
            </div>
            <button
              onClick={() => { setFactureCreated(null); setDevisLead(null); setMatierePrice(''); setLaborPrice(''); setFabricType(''); }}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
            >
              {isAr ? 'حسناً' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 max-w-2xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100 relative my-4 sm:my-8">
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
                  {isAr ? 'تأكيد السعر والوقت' : 'Validation Prix & Délai'}
                </h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                  {isAr ? 'مرحلة تأكيد التكلفة والوقت لإطلاق العينة' : 'Validation du coût et délai pour lancer l\'échantillon'}
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
                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-2.5 px-3 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                  <datalist id="tissus-list">
                    {Array.from(new Set([
                      'Coton 100%', 'Molleton / 3 Fils', 'Jersey', 'Polyester', 'Denim / Jean', 'Lin', 'Viscose', 'Gabardine', 'Toile', 'Satin', 'Soie', 'Velours', 'Crepe', 'Popeline', 'Lycra',
                      ...tissus.map(t => t.type + (t.couleur && t.couleur !== 'Non spécifié' ? ` - ${t.couleur}` : ''))
                    ])).map(val => (
                      <option key={val} value={val} />
                    ))}
                  </datalist>
                  
                  {confirmDetails.tissu && (() => {
                    const typeColorMatch = (t: StockTissu) => (t.type + (t.couleur && t.couleur !== 'Non spécifié' ? ` - ${t.couleur}` : '')).toLowerCase() === confirmDetails.tissu.toLowerCase() || t.type.toLowerCase() === confirmDetails.tissu.toLowerCase();
                    const clientNameLower = confirmLead.name.toLowerCase();

                    // Find if there is stock strictly for THIS client
                    const clientStock = tissus.find(t => typeColorMatch(t) && t.client && t.client.toLowerCase() === clientNameLower);
                    
                    // Find if there is generic stock (no client assigned)
                    const genericStock = tissus.find(t => typeColorMatch(t) && (!t.client || t.client.trim() === ''));

                    // Find if there is stock assigned to ANOTHER client
                    const otherClientStock = tissus.find(t => typeColorMatch(t) && t.client && t.client.toLowerCase() !== clientNameLower);

                    if (clientStock) {
                      return (
                        <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <p className="text-[10px] font-black text-emerald-700">{isAr ? `متوفر في الستوك (ديال هاد الكليان) - الكمية: ${clientStock.metrage}m` : `En stock (Pour ce client) - ${clientStock.metrage}m`}</p>
                        </div>
                      );
                    } else if (genericStock) {
                      return (
                        <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <p className="text-[10px] font-black text-emerald-700">{isAr ? `متوفر في الستوك العام (شايط عندنا) - الكمية: ${genericStock.metrage}m` : `En stock général (Non réservé) - ${genericStock.metrage}m`}</p>
                        </div>
                      );
                    } else if (otherClientStock) {
                      return (
                        <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <p className="text-[10px] font-black text-red-700">{isAr ? `هاد الثوب كاين فالستوك ولكن محجوز لكليان آخر (${otherClientStock.client})` : `Ce tissu est en stock mais réservé pour un autre client (${otherClientStock.client})`}</p>
                          </div>
                          <button onClick={() => handleAddAchat(confirmDetails.tissu)} className="self-start px-4 py-2 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm">
                            {isAr ? 'إضافة إلى المشتريات (Achats)' : 'Ajouter aux achats'}
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <p className="text-[10px] font-black text-amber-700">{isAr ? 'غير متوفر في الستوك (خاصك تشريه)' : 'Non disponible en stock (À acheter)'}</p>
                          </div>
                          <button onClick={() => handleAddAchat(confirmDetails.tissu)} className="self-start px-4 py-2 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm">
                            {isAr ? 'إضافة إلى المشتريات (Achats)' : 'Ajouter aux achats'}
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Toggle: Échantillon ou Commande directe */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                <button
                  onClick={() => setConfirmMode('echantillon')}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${confirmMode === 'echantillon' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                  {isAr ? '🧪 عينة فقط' : '🧪 Échantillon'}
                </button>
                <button
                  onClick={() => setConfirmMode('commande')}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${confirmMode === 'commande' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                  {isAr ? '📦 طلبية مباشرة' : '📦 Commande Directe'}
                </button>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{isAr ? 'ثمن العينة' : 'Prix Échantillon'}</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={confirmDetails.prixEchantillon}
                        onChange={e => setConfirmDetails({ ...confirmDetails, prixEchantillon: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl py-2 px-3 pl-8 text-sm font-black text-emerald-900 outline-none focus:border-emerald-500 transition-colors"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-black">MAD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">{isAr ? 'ثمن قطعة الطلبية' : 'Prix Unitaire'}</label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-100/50">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                      {isAr ? 'المدة بالأيام (Délai en jours)' : 'Délai en jours'}
                    </label>
                    <select
                      value={(() => {
                        if (!confirmDetails.dateLivraisonPrevue) return "";
                        const diffTime = new Date(confirmDetails.dateLivraisonPrevue).getTime() - new Date().setHours(0,0,0,0);
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays >= 1 && diffDays <= 30 ? String(diffDays) : "";
                      })()}
                      onChange={e => {
                        if (e.target.value) {
                          const days = Number(e.target.value);
                          const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setConfirmDetails({ ...confirmDetails, dateLivraisonPrevue: targetDate });
                        }
                      }}
                      className="w-full bg-white border border-emerald-200 rounded-xl py-2.5 px-3 text-sm font-black text-emerald-900 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                      <option value="">{isAr ? '-- اختر عدد الأيام --' : '-- Choisir le nombre de jours --'}</option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>
                          {day} {isAr ? (day === 1 ? 'يوم' : day === 2 ? 'يومين' : day <= 10 ? 'أيام' : 'يوم') : 'jours'}
                        </option>
                      ))}
                    </select>
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
                <CheckCircle className="w-4 h-4" />
                {isAr ? 'تأكيد وإطلاق العينة' : 'Valider & Lancer l\'Échantillon'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                ? `تم تأكيد السعر والوقت لـ "${successLead.name}" بنجاح. سيتم إطلاق العينة بما أنه تم دفع التسبيق (ثمن العينة أو 50% من الطلبية).`
                : `Prix et délai validés pour "${successLead.name}". L'échantillon est lancé suite au paiement de l'avance (prix échantillon ou 50%).` }
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
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300"
          onClick={() => { setPreviewPhoto(null); setZoomLevel(1); setLensEnabled(false); }}>
          <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex items-center justify-between z-[1000] bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <span className="text-white/50 text-[10px] font-black uppercase tracking-widest hidden md:block">BEYA CREATIVE GALLERY</span>
            </div>
            <button onClick={() => { setPreviewPhoto(null); setZoomLevel(1); setLensEnabled(false); }}
              className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/25 border border-white/20 shadow-2xl rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95">
              <X className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>
{/* Zoom controls */}
          <div className="absolute bottom-6 md:top-8 md:bottom-auto left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 z-[160]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
              className="w-9 h-9 bg-white/10 hover:bg-white/30 rounded-xl text-white font-black text-xl flex items-center justify-center transition-all">−</button>
            <span className="text-white text-xs font-black w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(z => Math.min(4, z + 0.25))}
              className="w-9 h-9 bg-white/10 hover:bg-white/30 rounded-xl text-white font-black text-xl flex items-center justify-center transition-all">+</button>
            <div className="w-px h-5 bg-white/20 mx-1 hidden md:block" />
            <button onClick={() => { setZoomLevel(1); setLensEnabled(false); }}
              className="hidden md:block px-3 h-9 bg-white/10 hover:bg-white/30 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all">Reset</button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <button onClick={() => setLensEnabled(!lensEnabled)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${lensEnabled ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-white/10 hover:bg-white/30 text-white'}`}
              title="Loupe magique">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Image Container with Nav Buttons */}
          <div className="relative w-full h-full flex items-center justify-center mt-8 md:mt-0 px-4 md:px-16" onClick={e => e.stopPropagation()}>
            {previewPhotos.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); const nextIdx = previewIndex === 0 ? previewPhotos.length - 1 : previewIndex - 1; setPreviewIndex(nextIdx); setPreviewPhoto(previewPhotos[nextIdx]); setZoomLevel(1); setLensEnabled(false); }}
                className="absolute left-2 md:left-8 z-[170] w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/30 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}

            <div className="overflow-auto w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img
                src={previewPhoto}
                alt="Model Preview"
                onMouseMove={(e) => {
                  if (!lensEnabled) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setLensPos({ x, y });
                }}
                style={{ 
                  transform: lensEnabled ? 'scale(3)' : `scale(${zoomLevel})`, 
                  transformOrigin: lensEnabled ? `${lensPos.x}% ${lensPos.y}%` : 'center', 
                  transition: lensEnabled ? 'transform 0.1s ease-out' : 'transform 0.2s ease',
                  cursor: lensEnabled ? 'crosshair' : 'zoom-in'
                }}
                className="max-w-[95vw] md:max-w-4xl max-h-[70vh] md:max-h-[85vh] object-contain rounded-2xl md:rounded-3xl shadow-2xl ring-1 ring-white/10"
                onClick={() => !lensEnabled && setZoomLevel(z => z >= 3 ? 1 : z + 0.5)}
              />
            </div>

            {previewPhotos.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); const nextIdx = previewIndex === previewPhotos.length - 1 ? 0 : previewIndex + 1; setPreviewIndex(nextIdx); setPreviewPhoto(previewPhotos[nextIdx]); setZoomLevel(1); setLensEnabled(false); }}
                className="absolute right-2 md:right-8 z-[170] w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/30 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}

            {previewPhotos.length > 1 && (
              <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-[170]">
                {previewPhotos.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setPreviewIndex(idx); setPreviewPhoto(previewPhotos[idx]); setZoomLevel(1); setLensEnabled(false); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === previewIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="hidden md:block absolute bottom-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
            Cliquer sur l'image pour zoomer — cliquer ailleurs pour fermer
          </p>
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
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in border-2 border-white">
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
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in border-2 border-white">
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

      {/* Stats Dashboard + Search */}
      {category === 'clients' && (() => {
        const clientLeads = leads.filter(l => !l.type.startsWith('RECRUTEMENT:'));
        const stats = [
          { label: isAr ? 'المجموع' : 'Total', value: clientLeads.length, color: 'bg-slate-800 text-white', onClick: () => setFilter('all') },
          { label: isAr ? 'جدد' : 'Nouveaux', value: clientLeads.filter(l => !l.contactedAt).length, color: 'bg-indigo-500 text-white', onClick: () => setFilter('new') },
          { label: isAr ? 'تم التواصل' : 'Contactés', value: clientLeads.filter(l => !!l.contactedAt).length, color: 'bg-emerald-500 text-white', onClick: () => setFilter('all') },
          { label: isAr ? 'ديفيز أُرسل' : 'Devis envoyé', value: clientLeads.filter(l => (l.crmPrice || 0) > 0).length, color: 'bg-amber-500 text-white', onClick: () => setFilter('all') },
          { label: isAr ? 'مؤكدون' : 'Confirmés', value: clientLeads.filter(l => l.crmStage === 'confirme').length, color: 'bg-teal-500 text-white', onClick: () => setFilter('completed') },
          { label: isAr ? 'قيد الانتظار' : 'En attente', value: clientLeads.filter(l => l.crmStage === 'attente_confirmation').length, color: 'bg-orange-400 text-white', onClick: () => setFilter('all') },
        ];
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {stats.map(s => (
                <button key={s.label} onClick={s.onClick} className={`${s.color} rounded-2xl p-3 text-center hover:opacity-90 transition-all hover:scale-105 shadow-sm`}>
                  <p className="text-2xl font-black leading-none">{s.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-1">{s.label}</p>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، الهاتف، النوع، المدينة...' : 'Rechercher par nom, téléphone, type, ville...'}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort + Type filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Sort */}
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trier:</span>
              {[
                { id: 'date_desc', label: '🕐 Nouveaux' },
                { id: 'date_asc', label: '🕐 Anciens' },
                { id: 'qty_desc', label: '📦 Qté ↓' },
                { id: 'qty_asc', label: '📦 Qté ↑' },
              ].map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${sortBy === s.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {s.label}
                </button>
              ))}

              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Type:</span>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400"
              >
                <option value="all">Tous les types</option>
                {Array.from(new Set(clientLeads.map(l => l.type).filter(t => !t.startsWith('RECRUTEMENT:')))).sort().map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              
              <button
                onClick={() => setFilterStarred(!filterStarred)}
                className={`ml-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 border transition-all ${filterStarred ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}
                title={isAr ? 'إظهار المفضلين فقط' : 'Afficher les favoris'}
              >
                ⭐ {isAr ? 'المفضلين' : 'Favoris'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Recrutement Search + Filters */}
      {category === 'recrutement' && (() => {
        const recrutementLeads = leads.filter(l => l.type.startsWith('RECRUTEMENT:'));
        return (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، الهاتف، المدينة...' : 'Rechercher par nom, téléphone, ville...'}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{isAr ? 'التخصص:' : 'Poste:'}</span>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400"
              >
                <option value="all">{isAr ? 'جميع التخصصات' : 'Tous les postes'}</option>
                {Array.from(new Set(recrutementLeads.map(l => l.type.replace('RECRUTEMENT:', '').trim()))).sort().map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{isAr ? 'الخبرة:' : 'Expérience:'}</span>
              <select
                value={filterExperience}
                onChange={e => setFilterExperience(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400"
              >
                <option value="all">{isAr ? 'الكل' : 'Toutes'}</option>
                {Array.from(new Set(recrutementLeads.map(l => {
                  const m = l.details?.match(/Expérience:\s*(\d+)/);
                  return m ? m[1] : '0';
                }))).sort((a, b) => parseInt(a) - parseInt(b)).map(exp => (
                  <option key={exp} value={exp}>{exp === '0' ? (isAr ? 'بدون خبرة' : 'Sans expérience') : `${exp} ${isAr ? 'سنوات' : 'ans'}`}</option>
                ))}
              </select>
              
              <button
                onClick={() => setFilterStarred(!filterStarred)}
                className={`ml-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 border transition-all ${filterStarred ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}
                title={isAr ? 'إظهار المفضلين فقط' : 'Afficher les favoris'}
              >
                ⭐ {isAr ? 'المفضلين' : 'Favoris'}
              </button>
            </div>
          </div>
        );
      })()}

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
          (() => {
            // Group visibleLeads by name/phone
            const groupedLeads = visibleLeads.reduce((acc, lead) => {
              const key = lead.name.toLowerCase().trim();
              if (!acc[key]) {
                acc[key] = { client: { ...lead }, requests: [] };
              } else {
                // Merge info (if one is missing phone/email, take from the other)
                if (!acc[key].client.phone && lead.phone) acc[key].client.phone = lead.phone;
                if (!(acc[key].client as any).phone2 && (lead as any).phone2) (acc[key].client as any).phone2 = (lead as any).phone2;
                if (!acc[key].client.email && lead.email) acc[key].client.email = lead.email;
                if (!acc[key].client.ville && lead.ville) acc[key].client.ville = lead.ville;
              }
              acc[key].requests.push(lead);
              return acc;
            }, {} as Record<string, { client: Lead, requests: Lead[] }>);

            return Object.values(groupedLeads).map(group => {
              const { client, requests } = group;
              const hasPriority = requests.some(r => r.crmPriority);
              const hasNew = requests.some(r => r.status === 'new' && r.crmStage !== 'confirme');

              return (
                <div
                  key={client.phone + client.name}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm hover:shadow-md relative ${
                    hasPriority ? 'border-amber-300 ring-1 ring-amber-200' : hasNew ? 'border-indigo-200' : 'border-slate-100'
                  }`}
                >
                  {/* CLIENT HEADER */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4 border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xl shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          {client.name}
                          {hasPriority && <span className="text-xs">⭐</span>}
                          {hasNew && (
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                              {isAr ? 'جديد' : 'New'}
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-indigo-400" /> {client.phone}</span>
                          {(client as any).phone2 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-emerald-400" /> {(client as any).phone2}</span>}
                          {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-indigo-400" /> {client.email}</span>}
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-400" /> {client.ville || '-'}</span>
                          {client.contactedAt && <span className="flex items-center gap-1 text-emerald-600"><MessageSquare className="w-3 h-3" /> {new Date(client.contactedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                      </div>
                    </div>
                    {/* CLIENT ACTIONS */}
                    <div className="flex items-center gap-2">
                      <a href={`tel:${client.phone.replace(/\D/g, '').startsWith('0') ? '212' + client.phone.replace(/\D/g, '').substring(1) : client.phone.replace(/\D/g, '')}`}
                        className="h-9 px-3 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center gap-2 text-xs font-black transition-all border border-slate-200 shadow-sm">
                        <PhoneCall className="w-4 h-4" /> {isAr ? 'اتصال' : 'Appel'}
                      </a>
                      <button onClick={() => { setContactingLead(client); setContactingLeadRequests(requests); }}
                        className={`h-9 px-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 border transition-all shadow-sm ${client.contactedAt ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'}`}>
                        <MessageSquare className="w-4 h-4" />
                        {client.contactedAt ? (
                          <span className="flex items-center gap-1">
                            {isAr ? 'تواصل ✓' : 'Contacté ✓'}
                            {(client.contactedBy || (client.contactedType?.includes('|||') ? client.contactedType.split('|||')[1] : null)) && (
                              <span className="text-[8px] opacity-80 lowercase">
                                ({client.contactedBy || client.contactedType?.split('|||')[1]})
                              </span>
                            )}
                          </span>
                        ) : 'WhatsApp'}
                      </button>
                      
                      <button
                        onClick={() => {
                          const isUnlocked = !!(client as any).commercialUnlocked;
                          setConfirmModal({
                            title: isAr ? (isUnlocked ? 'إلغاء الصلاحية' : 'منح الصلاحية') : (isUnlocked ? 'Retirer l\'accès' : 'Donner l\'accès'),
                            message: isAr 
                              ? (isUnlocked 
                                ? `هل تريد إلغاء صلاحية التواصل مع "${client.name}"?` 
                                : `هل تريد منح التجاري (Commercial) صلاحية التواصل مع "${client.name}"?`)
                              : (isUnlocked 
                                ? `Voulez-vous retirer l'accès commercial pour "${client.name}" ?` 
                                : `Voulez-vous donner au commercial l'accès pour contacter "${client.name}" ?`),
                            onConfirm: async () => {
                              const newLeads = [...leads];
                              for (const l of requests) {
                                const updated = { ...l, commercialUnlocked: !isUnlocked };
                                const idx = newLeads.findIndex(x => x.id === updated.id);
                                if (idx >= 0) newLeads[idx] = updated;
                                await saveRecord('leads', updated, true);
                              }
                              setLeads(newLeads);
                            }
                          });
                        }}
                        className={`h-9 px-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 border transition-all shadow-sm ${(client as any).commercialUnlocked ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-100' : 'bg-white text-slate-400 border-slate-200 hover:text-fuchsia-500'}`}
                      >
                        <UserCheck className="w-4 h-4" />
                        {(client as any).commercialUnlocked ? (isAr ? 'صلاحية ممنوحة' : 'Accès Donné') : (isAr ? 'منح الصلاحية' : 'Donner Accès')}
                      </button>
                      {category !== 'recrutement' && (() => {
                        const totalQty = requests.reduce((s, r) => s + (r.quantity || 0), 0);
                        const combinedType = requests.map(r => `${r.type} (${r.quantity} pcs)`).join(' + ');
                        const combinedLead: typeof client = { ...client, type: combinedType, quantity: totalQty };
                        return (
                          <button
                            onClick={() => {
                              setDevisLead(combinedLead);
                              setDevisLeadRequests(requests);
                              const initPrices: Record<string, { matiere: string; labor: string }> = {};
                              requests.forEach(r => { initPrices[r.id] = { matiere: '', labor: '' }; });
                              setModelPrices(initPrices);
                              setMatierePrice(''); setLaborPrice(''); setFabricType(''); setDevisMode('commande');
                            }}
                            className="h-9 w-9 rounded-xl flex items-center justify-center border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                            title={isAr ? 'إنشاء ديفيز لكل الموديلات' : 'Devis tous modèles'}
                          >
                            <Calculator className="w-4 h-4" />
                          </button>
                        );
                      })()}

                      {category !== 'recrutement' && (
                        !users.some(u => u.nom.toLowerCase() === client.name.toLowerCase() && u.role === 'client') ? (
                          <button onClick={() => convertToClient(client)} title={isAr ? 'تسجيل كزبون' : 'Créer client'}
                            className="h-9 px-3 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-black transition-all shadow-sm">
                            <UserPlus className="w-4 h-4" /> {isAr ? 'إضافة زبون' : 'Créer Client'}
                          </button>
                        ) : (
                          <button onClick={() => {
                            const existingUser = users.find(u => u.nom.toLowerCase() === client.name.toLowerCase() && u.role === 'client');
                            if (existingUser) {
                              setNewClientCode({ 
                                name: existingUser.nom, 
                                code: existingUser.password || existingUser.pinCode || '', 
                                email: existingUser.email, 
                                phone: existingUser.telephone || client.phone 
                              });
                            }
                          }} title={isAr ? "إعادة عرض معلومات الزبون" : "Afficher les accès"}
                            className="h-9 px-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl border border-emerald-200 text-[10px] font-black flex items-center gap-1 transition-all shadow-sm">
                            <CheckCircle className="w-4 h-4" /> {isAr ? 'تمت الإضافة كزبون' : 'Client Ajouté'}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* REQUESTS LIST */}
                  <div className="space-y-2">
                    {requests.map(lead => (
                      <div key={lead.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-xl border gap-4 transition-colors ${lead.crmStage === 'confirme' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Photo */}
                          {category !== 'recrutement' && (
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div className="relative cursor-pointer group" onClick={(e) => openPhotoPreview(lead, e)}>
                              <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center text-slate-300 shadow-sm relative transition-all group-hover:border-indigo-300 group-hover:shadow-md">
                                {(lead.photo || (lead.photos && lead.photos.length > 0))
                                  ? <>
                                      <img src={lead.photo || lead.photos![0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" loading="lazy" />
                                      {(lead.photoCount || 0) > 1 && (
                                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-black px-1.5 py-0.5 rounded-tl-lg backdrop-blur-sm shadow-sm border-t border-l border-white/10">
                                          +{(lead.photoCount || 0) - 1}
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-white" />
                                      </div>
                                    </>
                                  : <ImageIcon className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:text-indigo-400 transition-all" />
                                }
                              </div>
                            </div>
                            <button 
                              onClick={(e) => openPhotoPreview(lead, e)}
                              className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {isAr ? 'عرض' : 'Voir'}
                            </button>
                          </div>
                          )}
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {lead.type.startsWith('RECRUTEMENT:') ? (
                                <div className="flex flex-col w-full">
                                  <span className="flex items-center gap-1 text-indigo-600 font-black text-sm uppercase tracking-tight">
                                    <Package className="w-3.5 h-3.5" /> {lead.type.replace('RECRUTEMENT:', '').trim()}
                                  </span>
                                  {lead.details && (
                                    <>
                                      <span className={`text-slate-600 text-[11px] font-medium normal-case tracking-normal mt-1 leading-relaxed whitespace-pre-wrap break-words break-all max-w-full overflow-hidden ${expandedDetails.includes(lead.id) ? '' : 'line-clamp-3'}`}>
                                        {lead.details}
                                      </span>
                                      {lead.details.length > 150 && (
                                        <button
                                          onClick={() => setExpandedDetails(prev => prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id])}
                                          className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 text-left mt-1 w-fit"
                                        >
                                          {expandedDetails.includes(lead.id) ? (isAr ? 'عرض أقل' : 'Voir moins') : (isAr ? 'قراءة المزيد' : 'Lire la suite')}
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="flex items-center gap-1 text-emerald-600 font-black text-sm uppercase tracking-tight">
                                    <Package className="w-3.5 h-3.5" /> 
                                    {lead.type.replace(' (CMT - Client Tissu)', '')} 
                                    <span className="text-slate-400 text-xs font-bold">({lead.quantity} pcs)</span>
                                  </span>
                                  {lead.type.includes('CMT - Client Tissu') && (
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                      ✂️ CMT (Tissu Client)
                                    </span>
                                  )}
                                  {(() => {
                                    let ext = {} as any;
                                    try { ext = JSON.parse(lead.details || '{}'); } catch(e){}
                                    if (ext.patronageStatus === 'requested') return (
                                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 border border-indigo-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                        ⏳ Patronage...
                                      </span>
                                    );
                                    if (ext.patronageStatus === 'priced') return (
                                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                                        ✂️ Patronage: {ext.patronagePrice} MAD
                                      </span>
                                    );
                                    return null;
                                  })()}
                                </div>
                              )}
                              {lead.crmStage === 'confirme' && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> {isAr ? 'مؤكد' : 'Validé'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <Calendar className="w-3 h-3" /> {new Date(lead.date).toLocaleDateString()} {new Date(lead.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                              </span>
                              {(lead.crmPrice || 0) > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-full shadow-sm">
                                  {(lead as any).crmDevisMode === 'echantillon' ? 'Éch' : 'Cmd'}: {(lead.crmPrice || 0).toLocaleString()} MAD
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* REQUEST ACTIONS */}
                        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end shrink-0">
                          <button onClick={() => togglePriority(lead)} title={lead.crmPriority ? 'Retirer priorité' : 'Marquer important'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all border ${lead.crmPriority ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-slate-200 opacity-50 hover:opacity-100'}`}>
                            ⭐
                          </button>
                          
                          <div className="w-px h-5 bg-slate-200 mx-1" />

                          {/* Recrutement actions */}
                          {category === 'recrutement' && (
                            <>
                              <label className="cursor-pointer">
                                <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={async e => {
                                  const file = e.target.files?.[0]; if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = async ev => {
                                    const cv = ev.target?.result as string;
                                    const updated = { ...lead, cv } as any;
                                    setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
                                    await saveRecord('leads', updated, true);
                                  };
                                  reader.readAsDataURL(file);
                                  e.target.value = '';
                                }} />
                                <span className={`h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border flex items-center gap-1 transition-all ${(lead as any).cv ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                  <FileText className="w-3.5 h-3.5" />
                                  {(lead as any).cv ? 'CV ✓' : 'CV +'}
                                </span>
                              </label>
                              {(lead as any).cv && (
                                <button onClick={() => {
                                  const cv = (lead as any).cv;
                                  if (cv.startsWith('data:image/')) setPreviewPhoto(cv);
                                  else {
                                    try {
                                      const arr = cv.split(',');
                                      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
                                      const bstr = atob(arr[1]);
                                      let n = bstr.length;
                                      const u8arr = new Uint8Array(n);
                                      while(n--){ u8arr[n] = bstr.charCodeAt(n); }
                                      const blob = new Blob([u8arr], {type: mime});
                                      window.open(URL.createObjectURL(blob), '_blank');
                                    } catch (e) {
                                      const a = document.createElement('a');
                                      a.href = cv; a.download = `CV_${lead.name.replace(/\s+/g, '_')}`; a.click();
                                    }
                                  }
                                }}
                                  className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-blue-500 text-white border-blue-500 flex items-center gap-1 hover:bg-blue-600 shadow-sm">
                                  <Eye className="w-3.5 h-3.5" /> Voir
                                </button>
                              )}
                              <button onClick={() => navigate('/liste-attente', { state: { fromRecruitment: lead } })}
                                className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 shadow-sm">
                                <UserPlus className="w-3.5 h-3.5" /> {isAr ? 'لائحة الانتظار' : 'Attente'}
                              </button>
                              <button onClick={async () => {
                                const updated = { ...lead, status: 'completed' as Lead['status'], crmStage: 'rejeté' };
                                setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
                                await saveRecord('leads', updated, true);
                              }}
                                className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white transition-all shadow-sm">✕ Rejeter</button>
                            </>
                          )}

                          {category !== 'recrutement' && (
                            <>
                              {lead.crmStage !== 'annule' && lead.crmStage !== 'confirme' && (
                                <button onClick={async () => {
                                  if (window.confirm(isAr ? 'هل أنت متأكد من رفض هذا الطلب؟' : 'Voulez-vous vraiment refuser cette demande ?')) {
                                    const updated = { ...lead, crmStage: 'annule' as const, rejectedAt: new Date().toISOString() };
                                    setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
                                    await saveRecord('leads', updated, true);
                                  }
                                }}
                                  className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white transition-all shadow-sm">✕ {isAr ? 'رفض' : 'Refuser'}</button>
                              )}
                              {lead.crmStage !== 'confirme' && lead.crmStage !== 'annule' && (
                                <button onClick={() => setConfirmLead(lead)}
                                  className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">✓ {isAr ? 'تأكيد' : 'Valider'}</button>
                              )}
                              {(lead.photo || (lead.photos && lead.photos.length > 0)) && !lead.type.startsWith('RECRUTEMENT:') && (
                                <button onClick={() => setAiAnalysisLead(lead)}
                                  className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-500 hover:text-white transition-all shadow-sm flex items-center gap-1"
                                  title={isAr ? 'تحليل الموديل واستخراج القياسات' : 'Analyser le modèle et extraire les mesures'}>
                                  <Scissors className="w-3.5 h-3.5" /> {isAr ? 'تحليل الموديل' : 'Analyser Modèle'}
                                </button>
                              )}
                              {!lead.type.startsWith('RECRUTEMENT:') && (
                                <button onClick={async () => {
                                    if (window.confirm(isAr ? 'إرسال طلب تسعير الباترون للمودليست؟' : 'Demander le prix de patronage au modéliste?')) {
                                      let extras: any = {};
                                      try { extras = JSON.parse(lead.details || '{}'); } catch(e){ extras = { clientNotes: lead.details }; }
                                      const updated = { ...lead, details: JSON.stringify({...extras, patronageStatus: 'requested'}) };
                                      setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
                                      await saveRecord('leads', updated, true);
                                    }
                                  }} title={isAr ? 'طلب تسعير الباترون' : 'Demander Prix Patronage'}
                                  className="h-8 px-2.5 rounded-lg text-[9px] font-black uppercase border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-500 hover:text-white transition-all shadow-sm flex items-center gap-1">
                                  <Scissors className="w-3.5 h-3.5" /> {isAr ? 'باترون' : 'Prix Patronage'}
                                </button>
                              )}
                            </>
                          )}
                          
                          {(lead.details || (lead.tailles && Object.values(lead.tailles).some(v => v > 0))) && !lead.type.startsWith('RECRUTEMENT:') && (
                            <button onClick={() => setDetailsLead(lead)} title="Détails"
                              className="w-8 h-8 bg-white text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {!lead.type.startsWith('RECRUTEMENT:') && (
                            <button onClick={() => { setDevisLead(lead); setDevisMode('commande'); }} title="Devis"
                              className="w-8 h-8 bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg border border-amber-200 flex items-center justify-center transition-all shadow-sm">
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button onClick={() => { setEditingLead(lead); setEditForm(lead); }}
                            className="w-8 h-8 bg-white text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(lead.id)}
                            className="w-8 h-8 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()
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
        const currentQuantity = devisMode === 'echantillon' ? 1 : devisLead.quantity;
        const unitPrice = Number(matierePrice || 0) + Number(laborPrice || 0);
        const totalMatiere = Number(matierePrice || 0) * (currentQuantity || 0);
        const totalLabor = Number(laborPrice || 0) * (currentQuantity || 0);
        const totalGeneral = unitPrice * (currentQuantity || 0);
        const devisNum = `DV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

        return (
          <div
            id="devis-pdf-template"
            className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-white font-sans"
            style={{ color: '#0f172a', backgroundColor: 'white', direction: isAr ? 'rtl' : 'ltr' }}
          >
            {/* ===== HEADER ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4f46e5', padding: '20px 32px 14px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                {company.logoInvoice && company.logoInvoice !== '/logo.png' ? (
                  <img src={company.logoInvoice} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
                ) : company.logoUrl && company.logoUrl !== '/logo.png' ? (
                  <img src={company.logoUrl} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                    {company.name?.charAt(0) || 'B'}
                  </div>
                )}
                <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0, textTransform: 'uppercase' }}>{company.name || 'BEYA CREATIVE'}</h1>
                  <p style={{ fontSize: '8px', fontWeight: 700, color: '#6366f1', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{company.subtitle || (isAr ? 'صناعة النسيج' : 'Confection Textile')}</p>
                </div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1e1b4b', textTransform: 'uppercase' }}>{isAr ? 'عرض سعر رسمي' : 'DEVIS OFFICIEL'}</h2>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', margin: '2px 0 0' }}>{isAr ? 'رقم' : 'N°'} {devisNum} — {new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* ===== EMETTEUR / CLIENT ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '12px 32px', fontSize: '11px', direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
                <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'المُصْدِر (الشركة)' : 'Émetteur'}</h3>
                <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{company.name}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{company.address}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{isAr ? 'الهاتف:' : 'Tél:'} <span dir="ltr">{company.phone}</span></p>
                {company.email && <p style={{ fontWeight: 600, color: '#64748b', margin: '0', fontSize: '10px' }}>{company.email}</p>}
                {company.ice && company.ice !== '000000000000000' && <p style={{ fontWeight: 600, color: '#94a3b8', margin: '3px 0 0', fontSize: '9px' }}>ICE: {company.ice} {company.rc && company.rc !== '123456' ? `| RC: ${company.rc}` : ''}</p>}
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
                <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'الزبون / المستلم' : 'Client / Destinataire'}</h3>
                <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{devisLead.name}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }} dir="ltr">{devisLead.phone}</p>
                {devisLead.email && <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{devisLead.email}</p>}
                {devisLead.ville && <p style={{ fontWeight: 600, color: '#64748b', margin: '0', fontSize: '10px' }}>{devisLead.ville}</p>}
              </div>
            </div>

            {/* ===== OBJET ===== */}
            <div style={{ margin: '0 32px 10px', background: '#eef2ff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #c7d2fe', textAlign: isAr ? 'right' : 'left' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#4338ca' }}>
                {isAr ? 'الموضوع : عرض سعر تفصيلي — ' : 'Objet : Devis de confection — '}<span style={{ fontWeight: 900 }}>{devisLead.type}</span> × {currentQuantity} {isAr ? 'قطعة' : 'pièces'}
              </p>
            </div>

            {/* ===== TABLE ===== */}
            <div style={{ margin: '0 32px 10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', direction: isAr ? 'rtl' : 'ltr' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px', textAlign: isAr ? 'right' : 'left', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: isAr ? '0 8px 0 0' : '8px 0 0 0' }}>{isAr ? 'الوصف' : 'Description'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'الكمية' : 'Qté'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'ثمن الوحدة' : 'PU'} (MAD)</th>
                    <th style={{ padding: '10px 12px', textAlign: isAr ? 'left' : 'right', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', borderRadius: isAr ? '8px 0 0 0' : '0 8px 0 0' }}>{isAr ? 'المجموع' : 'Total'} (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Number(matierePrice) > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, textAlign: isAr ? 'right' : 'left' }}>{isAr ? 'الثوب والسلعة المرافقة' : 'Tissu & Fournitures'} {fabricType ? <span style={{color: '#6366f1'}}>({fabricType})</span> : ''}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{currentQuantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }} dir="ltr">{Number(matierePrice).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: isAr ? 'left' : 'right', fontWeight: 800 }} dir="ltr">{totalMatiere.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, textAlign: isAr ? 'right' : 'left' }}>{isAr ? 'الخياطة واليد العاملة' : "Confection & Main d'œuvre"}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{currentQuantity}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }} dir="ltr">{Number(laborPrice || 0).toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: isAr ? 'left' : 'right', fontWeight: 800 }} dir="ltr">{totalLabor.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===== TOTALS ===== */}
            <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', margin: '0 32px 14px' }}>
              <div style={{ width: '320px', direction: isAr ? 'rtl' : 'ltr' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                  <span>{isAr ? 'ثمن القطعة الواحدة' : 'Prix Unitaire'}</span>
                  <span style={{ fontWeight: 800 }} dir="ltr">{unitPrice.toFixed(2)} MAD</span>
                </div>
                {Number(matierePrice) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    <span>{isAr ? 'مجموع السلعة' : 'Sous-total Matière'}</span>
                    <span style={{ fontWeight: 800 }} dir="ltr">{totalMatiere.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{isAr ? 'مجموع اليد العاملة' : 'Sous-total MO'}</span>
                  <span style={{ fontWeight: 800 }} dir="ltr">{totalLabor.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '12px 16px', borderRadius: '12px 12px 0 0', marginTop: '12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-1px' }} dir="ltr">{totalGeneral.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '12px', fontWeight: 800 }}>MAD</span></span>
                  <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, display: 'block' }}>{isAr ? 'المجموع العام' : 'Total Général'}</span>
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>TTC</span>
                  </div>
                </div>
                {/* ACOMPTE 50% HIGHLIGHT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px 16px', borderRadius: '0 0 12px 12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900 }} dir="ltr">{(totalGeneral * 0.5).toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '10px' }}>MAD</span></span>
                  <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>{isAr ? 'التسبيق المطلوب' : 'Acompte à la commande'}</span>
                    <span style={{ fontSize: '8px', fontWeight: 600, opacity: 0.9 }}>{isAr ? '50% (لشراء الثوب)' : '50% requis'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== PAGE 2 : CHARTE QUALITE ET PROCESSUS ===== */}
            <div style={{ pageBreakBefore: 'always', padding: '40px 32px', direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', margin: 0 }}>{isAr ? 'ميثاق الجودة والعمل' : 'LA CHARTE QUALITÉ BEYA'}</h2>
                <p style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', margin: '6px 0 0' }}>{isAr ? 'ضمانكم للتميز والاحترافية' : "Votre Garantie d'Excellence"}</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155', lineHeight: '1.6', margin: 0, textAlign: 'justify' }}>
                  {isAr 
                    ? `لضمان منتوج نهائي بجودة عالية وخدمة شفافة بالكامل، نعتمد على مسار إنتاج صارم يمر عبر 4 مراحل أساسية. يُعتبر هذا العرض بمثابة عقد التزام مبدئي بين ${company.name} و ${devisLead.name}.`
                    : `Afin de vous garantir un produit final d'une qualité irréprochable et un service totalement transparent, nous avons mis en place un processus de production strict en 4 étapes. Ce devis fait office de contrat d'engagement entre ${company.name} et ${devisLead.name}.`}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Etape 1 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #4f46e5', borderRight: isAr ? '4px solid #4f46e5' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>1</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'الموافقة وشراء الثوب' : 'Accord & Achat Matière'}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? `دفع التسبيق المقدر بـ 50% يُمثل الموافقة الرسمية على الطلب. هذا المبلغ مخصص بالكامل لشراء الثوب الخاص بكم فوراً والذي سيتم تخزينه بأمان في ورشتنا.`
                        : `Le paiement de l'acompte de 50% valide officiellement la commande. Ce montant est exclusivement dédié à l'achat immédiat de votre tissu qui restera stocké en toute sécurité dans nos ateliers.`}
                    </p>
                  </div>
                </div>

                {/* Etape 2 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #f59e0b', borderRight: isAr ? '4px solid #f59e0b' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>2</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'صناعة العينة (Echantillon)' : "Création de l'Échantillon"}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? `قبل البدء في الإنتاج الكلي، يقوم مكتب الدراسات الخاص بنا بتفصيل وصناعة أول نموذج (العينة) بدقة متناهية. يتم إرسال هذه العينة إليكم فعلياً أو عرضها عبر مكالمة فيديو.`
                        : `Avant de lancer la production globale, notre bureau d'étude confectionne le tout premier prototype (l'Échantillon) avec la plus grande précision. Cet échantillon vous est ensuite envoyé physiquement ou présenté lors d'une session vidéo.`}
                    </p>
                  </div>
                </div>

                {/* Etape 3 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #10b981', borderRight: isAr ? '4px solid #10b981' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>3</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'مصادقة الزبون (OK)' : 'Validation Client (OK)'}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? `تقومون بفحص الفصالة، جودة الثوب، والخياطة الخاصة بالعينة. لا ننتقل إلى مرحلة الإنتاج إلا بعد موافقتكم الرسمية وإعطاء الضوء الأخضر (OK). رضاكم التام هو أولوية.`
                        : `Vous vérifiez la coupe, la qualité du tissu et les finitions de l'échantillon. Nous n'entamons la suite de la production qu'après votre validation officielle et votre feu vert ("OK") explicite. Votre satisfaction totale est primordiale.`}
                    </p>
                  </div>
                </div>

                {/* Etape 4 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #3b82f6', borderRight: isAr ? '4px solid #3b82f6' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>4</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'الإنتاج الكلي' : 'Production Globale'}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? `بمجرد المصادقة على العينة، يبدأ الإنتاج التسلسلي باحترام تام ومطابقة 100% للعينة المصادق عليها. يتم دفع باقي المبلغ (50%) عند التسليم النهائي للطلبية.`
                        : `Une fois l'échantillon validé, la production en série démarre en respectant à 100% la copie conforme de l'échantillon. Le reste du paiement (50%) s'effectue à la livraison finale de la commande.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div style={{ margin: '30px 32px 0', borderTop: '2px solid #e2e8f0', paddingTop: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 3px' }}>
                {isAr ? `شكرا على ثقتكم — ${company.name}` : `Merci de votre confiance — ${company.name}`}
              </p>
              <p style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                {company.address} | <span dir="ltr">{company.phone}</span> | {company.email}
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
              <button onClick={() => { setContactingLead(null); setContactingLeadRequests([]); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              {(() => {
                const lang = isAr ? 'ar' : 'fr';
                const isRecrutement = contactingLead.type.startsWith('RECRUTEMENT:');
                const allModelsTypes = contactingLeadRequests.length > 0
                  ? contactingLeadRequests.map(r => isRecrutement ? r.type.replace('RECRUTEMENT:', '').trim() : r.type).join(' / ')
                  : contactingLead.type;
                const cleanType = isRecrutement ? contactingLead.type.replace('RECRUTEMENT:', '').trim() : allModelsTypes;

                const clientOptions = [
                  {
                    id: 'standard',
                    title: isAr ? 'رسالة تواصل قياسية' : 'Contact Standard',
                    icon: <FileText className="w-5 h-5" />,
                    desc: isAr ? 'الرسالة التي قمت بإعدادها في الإعدادات (تحية + أسئلة)' : 'Le message par défaut configuré dans les paramètres.',
                    msg: (templates[lang]?.firstContact || DEFAULT_TEMPLATES[lang].firstContact).replace(/{name}/g, contactingLead.name).replace(/{type}/g, cleanType)
                  },
                  {
                    id: 'strategic',
                    title: isAr ? 'تركيز على العلامة التجارية (Brand)' : 'Focus Branding/E-com',
                    icon: <Settings className="w-5 h-5" />,
                    desc: isAr ? 'سؤال مباشر عن نوع العمل (Brand أو E-com)' : 'Question directe sur le profil (Marque ou E-commerce).',
                    msg: isAr
                      ? `السلام عليكم *${contactingLead.name}*، معكم *BEYA CREATIVE*. 😊\n\nشكراً على اهتمامكم بـ *${cleanType}*. واش نتوما علامة تجارية واجدة (Brand) ولا كتبيعوا في الأنترنيت (E-com) وبغيتو تصاوبوا الماركة الخاصة ديالكم؟`
                      : `Bonjour *${contactingLead.name}*, ici *BEYA CREATIVE*. 😊\n\nMerci pour votre intérêt pour les *${cleanType}*. Êtes-vous une marque établie ou vendez-vous en ligne (E-com) et souhaitez-vous créer votre propre branding ?`
                  },
                  {
                    id: 'short',
                    title: isAr ? 'تحية سريعة' : 'Salut Rapide',
                    icon: <MessageSquare className="w-5 h-5" />,
                    desc: isAr ? 'تحية بسيطة لفتح باب النقاش' : 'Un message court pour engager la discussion.',
                    msg: isAr
                      ? `السلام عليكم *${contactingLead.name}*، معكم *BEYA CREATIVE*. 😊 شكراً على طلبكم الخاص بـ *${cleanType}*. واش ممكن تعطينا تفاصيل أكثر؟`
                      : `Bonjour *${contactingLead.name}*, ici *BEYA CREATIVE*. 😊 Merci pour votre demande de *${cleanType}*. Pourriez-vous nous donner plus de détails ?`
                  }
                ];

                const recruitmentOptions = [
                  {
                    id: 'recrutement_standard',
                    title: isAr ? 'رسالة مقابلة العمل (قياسية)' : 'Message Entretien (Standard)',
                    icon: <FileText className="w-5 h-5" />,
                    desc: isAr ? 'أسئلة حول الخبرة والسكن لبدء التوظيف' : 'Questions sur l\'expérience et logement.',
                    msg: (templates[lang]?.firstContactRecrutement || DEFAULT_TEMPLATES[lang].firstContactRecrutement).replace(/{name}/g, contactingLead.name).replace(/{type}/g, cleanType)
                  },
                  {
                    id: 'recrutement_test',
                    title: isAr ? 'استدعاء لاختبار عملي (Test)' : 'Convocation Test Pratique',
                    icon: <Scissors className="w-5 h-5" />,
                    desc: isAr ? 'دعوة المترشح لإجراء اختبار مباشرة في المصنع' : 'Inviter le candidat pour un test à l\'usine.',
                    msg: isAr
                      ? `السلام عليكم *${contactingLead.name}*، معاكم مصنع *BEYA CREATIVE* بمكناس. 😊\n\nبخصوص طلب العمل ديالك (${cleanType})، بغينا نعرضوك دوز اختبار عملي عندنا فالمصنع باش نشوفو الخدمة ديالك. فوقاش تقدر تجي؟`
                      : `Bonjour *${contactingLead.name}*, ici l'usine *BEYA CREATIVE*. 😊\n\nSuite à votre candidature (${cleanType}), nous vous invitons à passer un test pratique à notre usine. Quand seriez-vous disponible ?`
                  },
                  {
                    id: 'recrutement_waitlist',
                    title: isAr ? 'وضع في لائحة الانتظار' : 'Mise en Liste d\'attente',
                    icon: <Calendar className="w-5 h-5" />,
                    desc: isAr ? 'إخبار المترشح بالاحتفاظ بملفه للمستقبل' : 'Informer le candidat que son CV est conservé.',
                    msg: isAr
                      ? `السلام عليكم *${contactingLead.name}*. 😊\n\nشكراً على اهتمامك بالعمل معنا كـ (${cleanType}). حالياً الفريق مكتمل، ولكن احتفظنا بالملف ديالك في لائحة الانتظار وغادي نتواصلو معاك ملي تكون بلاصة خاوية. بالتوفيق! 🇲🇦`
                      : `Bonjour *${contactingLead.name}*. 😊\n\nMerci pour votre candidature (${cleanType}). Notre équipe est complète actuellement, mais nous conservons votre profil en liste d'attente. Nous vous contacterons dès qu'une place se libère ! 🇲🇦`
                  }
                ];

                return (isRecrutement ? recruitmentOptions : clientOptions).map(opt => {
                const isSent = contactingLead.contactedType?.split('|||')[0] === opt.id;
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
              });
              })()}
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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{isAr ? 'تم إنشاء الحساب' : 'Client Enregistré ✓'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{newClientCode.name}</p>
                  </div>
                </div>
                <button onClick={() => setNewClientCode(null)} className="w-8 h-8 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email + Code */}
              <div className="space-y-2 mb-5">
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-xs font-bold text-slate-700">{newClientCode.email}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(newClientCode.email)}
                    className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-lg flex items-center justify-center transition-all">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center justify-between border border-emerald-100">
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Code secret</p>
                    <p className="text-2xl font-black tracking-[0.2em] text-slate-900 font-mono">{newClientCode.code}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(newClientCode.code)}
                    className="w-8 h-8 bg-white border border-emerald-200 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg flex items-center justify-center transition-all">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {(() => {
                  const storageKey = `beya_welcome_${newClientCode.email}`;
                  const sentData = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; } })();
                  return (
                    <>
                      {sentData && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          {isAr ? `أُرسل في ${new Date(sentData.date).toLocaleDateString('ar-MA')}` : `Envoyé le ${new Date(sentData.date).toLocaleDateString('fr-FR')}`}
                          {sentData.method === 'whatsapp' ? ' • WhatsApp' : ' • PDF'}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const rawPhone = String(newClientCode.phone || '').replace(/\D/g, '');
                          const phone = rawPhone ? (rawPhone.startsWith('0') ? '212' + rawPhone.substring(1) : rawPhone.startsWith('212') ? rawPhone : '212' + rawPhone) : '';
                          const msg = isAr
                            ? `🎉 مرحباً بك في *BEYA CREATIVE* !\n\nأهلاً *${newClientCode.name}*، حسابك جاهز :\n\n🌐 *https://beyacreative.com*\n📧 البريد : *${newClientCode.email}*\n🔑 الرمز : *${newClientCode.code}*\n\nسجل دخولك لمتابعة طلباتك. 🇲🇦`
                            : `🎉 Bienvenue chez *BEYA CREATIVE* !\n\nBonjour *${newClientCode.name}*, votre espace client est prêt :\n\n🌐 *https://beyacreative.com*\n📧 Email : *${newClientCode.email}*\n🔑 Code : *${newClientCode.code}*\n\nConnectez-vous pour suivre vos commandes. À bientôt ! 🇲🇦`;
                          const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                          localStorage.setItem(storageKey, JSON.stringify({ date: new Date().toISOString(), method: 'whatsapp' }));
                        }}
                        className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100">
                        <MessageSquare className="w-4 h-4" />
                        {sentData ? (isAr ? 'إعادة الإرسال — WhatsApp' : 'Renvoyer — WhatsApp') : (isAr ? 'إرسال عبر WhatsApp' : 'Envoyer via WhatsApp')}
                      </button>
                      <button
                        onClick={async () => {
                          const clientName = newClientCode.name.replace(/\s+/g, '_');
                          const filename = `BeyaCreative_Bienvenue_${clientName}`;
                          const el = document.getElementById('welcome-pdf-' + newClientCode.code);
                          if (el) el.style.display = 'block';
                          await generatePDF('welcome-pdf-' + newClientCode.code, filename);
                          if (el) el.style.display = 'none';
                          localStorage.setItem(storageKey, JSON.stringify({ date: new Date().toISOString(), method: 'pdf' }));
                        }}
                        className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                        <Download className="w-4 h-4" />
                        {sentData ? (isAr ? 'إعادة التحميل — PDF' : 'Re-télécharger PDF') : (isAr ? 'تحميل Welcome PDF' : 'Télécharger Welcome PDF')}
                      </button>
                    </>
                  );
                })()}
                <button onClick={() => setNewClientCode(null)}
                  className="w-full h-9 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all">
                  Fermer
                </button>
              </div>
            </div>
          </div>

          {/* Hidden Welcome PDF Template — bilingual */}
          {(() => {
            const t = isAr ? {
              welcomeLabel: 'مرحباً بك في فضائك الخاص',
              hi: `مرحباً، ${newClientCode.name} 👋`,
              welcomeDesc: 'تم تفعيل حسابك في BEYA CREATIVE. يمكنك الآن متابعة طلباتك وتحميل وثائقك والتواصل مع فريقنا مباشرة من بوابتك.',
              emailLabel: 'البريد الإلكتروني',
              codeLabel: 'الرمز السري',
              whoTitle: 'من نحن؟',
              whoDesc: 'BEYA CREATIVE مصنع نسيج مغربي متخصص في الخياطة المخصصة. فريقنا من الخياطات الخبيرات يعملن بأنماط دقيقة وعينات مصادق عليها لضمان أن كل قطعة تتوافق تمامًا مع رؤيتك.',
              processTitle: 'طريقة عملنا',
              steps: [
                ['01', 'الطلب والتسعير', 'تقدم مشروعك بصورة النموذج والكميات. نقوم بإعداد عرض سعر مخصص.'],
                ['02', 'الباترون والعينة', 'خبيراتنا يصنعن الباترون التقني ويخطن عينة للتحقق.'],
                ['03', 'مراقبة الجودة', 'تصادق على العينة. فرقنا تتحقق من كل تفصيل قبل الإطلاق.'],
                ['04', 'الإنتاج والتسليم', 'إطلاق الإنتاج التسلسلي مع مراقبة الجودة في كل مرحلة.'],
              ],
              guaranteesTitle: 'التزاماتنا للجودة',
              guarantees: ['✓ خياطات خبيرات ومعتمدات', '✓ أقمشة مختارة من موردين موثوقين', '✓ كل قطعة تُفحص قبل التسليم', '✓ احترام صارم للمواعيد المتفق عليها'],
              thanks: 'شكراً لثقتكم 🇲🇦',
            } : {
              welcomeLabel: 'Bienvenue dans votre espace client',
              hi: `Bonjour, ${newClientCode.name} 👋`,
              welcomeDesc: 'Votre compte BEYA CREATIVE est activé. Vous pouvez désormais suivre vos commandes, télécharger vos documents et communiquer avec notre équipe directement depuis votre portail.',
              emailLabel: 'Email de connexion',
              codeLabel: 'Code secret',
              whoTitle: 'Qui sommes-nous ?',
              whoDesc: 'BEYA CREATIVE est une manufacture textile marocaine spécialisée dans la confection sur-mesure. Notre équipe de couturières expertes travaille avec des patrons de précision et des échantillons validés pour garantir que chaque pièce correspond exactement à votre vision.',
              processTitle: 'Notre processus de travail',
              steps: [
                ['01', 'Demande & Devis', 'Vous soumettez votre projet avec photo du modèle. Nous établissons un devis personnalisé.'],
                ['02', 'Patron & Échantillon', 'Nos expertes créent le patron technique et confectionnent un échantillon pour validation.'],
                ['03', 'Validation qualité', 'Vous validez l\'échantillon. Nos équipes vérifient chaque détail avant le lancement.'],
                ['04', 'Production & Livraison', 'Lancement de la production en série avec contrôle qualité à chaque étape.'],
              ],
              guaranteesTitle: 'Nos engagements qualité',
              guarantees: ['✓ Couturières expertes et certifiées', '✓ Matières sélectionnées chez des fournisseurs fiables', '✓ Chaque pièce inspectée avant livraison', '✓ Respect strict des délais convenus'],
              thanks: 'Merci de votre confiance 🇲🇦',
            };
            return (
              <div id={`welcome-pdf-${newClientCode.code}`} style={{ display: 'none' }}>
                <div dir={isAr ? 'rtl' : 'ltr'} style={{ width: '210mm', minHeight: '297mm', fontFamily: isAr ? 'Arial, sans-serif' : 'Georgia, serif', padding: '20mm', color: '#1e293b', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '3px solid #4f46e5', paddingBottom: '20px' }}>
                    <div>
                      <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e1b4b', letterSpacing: '-1px', margin: 0 }}>BEYA<span style={{ color: '#4f46e5' }}>CREATIVE</span></h1>
                      <p style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700, letterSpacing: '3px', margin: '4px 0 0', textTransform: 'uppercase' }}>Manufacturing Excellence</p>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>beyacreative.com</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{company.phone}</p>
                    </div>
                  </div>

                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px' }}>{t.welcomeLabel}</p>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: '0 0 12px' }}>{t.hi}</p>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>{t.welcomeDesc}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{t.emailLabel}</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{newClientCode.email}</p>
                    </div>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px' }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{t.codeLabel}</p>
                      <p style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', letterSpacing: '6px', margin: 0, fontFamily: 'monospace' }}>{newClientCode.code}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', borderRight: isAr ? '4px solid #4f46e5' : 'none', borderLeft: isAr ? 'none' : '4px solid #4f46e5', paddingRight: isAr ? '12px' : 0, paddingLeft: isAr ? 0 : '12px', margin: '0 0 14px' }}>{t.whoTitle}</h2>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{t.whoDesc}</p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', borderRight: isAr ? '4px solid #4f46e5' : 'none', borderLeft: isAr ? 'none' : '4px solid #4f46e5', paddingRight: isAr ? '12px' : 0, paddingLeft: isAr ? 0 : '12px', margin: '0 0 14px' }}>{t.processTitle}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {t.steps.map(([num, title, desc]) => (
                        <div key={num} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                          <p style={{ fontSize: '22px', fontWeight: 900, color: '#e2e8f0', margin: '0 0 6px', fontFamily: 'monospace' }}>{num}</p>
                          <p style={{ fontSize: '11px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px', textTransform: 'uppercase' }}>{title}</p>
                          <p style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#1e1b4b', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 12px', opacity: 0.9 }}>{t.guaranteesTitle}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {t.guarantees.map(item => <p key={item} style={{ fontSize: '11px', fontWeight: 600, margin: 0, opacity: 0.9 }}>{item}</p>)}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>BEYA CREATIVE — {company.address || 'Zone Industrielle, Meknès'}</p>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{t.thanks}</p>
                  </div>
                </div>
              </div>
            );
          })()}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الهاتف 1' : 'Téléphone 1'}</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'واتساب / هاتف 2' : 'WhatsApp / Tél 2'}</label>
                  <input
                    type="text"
                    value={editForm.phone2 || ''}
                    onChange={e => setEditForm({ ...editForm, phone2: e.target.value })}
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
      {/* AI Analysis Modal */}
      {aiAnalysisLead && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl relative ring-4 ring-white/20 flex flex-col">
            <div className="p-6 md:p-8">
              <AISpace initialLead={aiAnalysisLead} onClose={() => setAiAnalysisLead(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
