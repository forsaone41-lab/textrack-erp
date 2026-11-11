import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mail, Phone, Send, MessageSquare, Clock, Search, RefreshCw, 
  User, ShieldCheck, Trash2, PhoneCall, MessageCircle, KeyRound, 
  ExternalLink, Copy, Check, Users, Sparkles, Building2, MapPin,
  Video, X
} from 'lucide-react';
import { Lead, User as UserType, loadLeads, loadData, saveRecord, deleteRecord, genId, loadClientCityResolver, extractClientCityFromLeads, CLIENT_CITY_LEAD_TYPE } from '../types';
import { useLang } from '../contexts/LangContext';

interface ClientContact {
  id: string; // phone, email, or user id
  name: string;
  phone?: string;
  email?: string;
  brandName?: string;
  ville?: string;
  role?: string;
  isRegisteredUser: boolean;
  userPassword?: string;
  userPinCode?: string;
  messages: Lead[];
  lastMessageDate?: string;
  lastMessageText?: string;
  unreadCount: number;
}

export default function Inbox() {
  const { isAr } = useLang();
  const [messages, setMessages] = useState<Lead[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cityRecords, setCityRecords] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'chat' | 'registered'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [phonePromptContact, setPhonePromptContact] = useState<ClientContact | null>(null);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Helper phone normalizer
  const normalizePhone = (p?: string) => (p || '').replace(/\s+/g, '').replace(/[^0-9+]/g, '');

  const cleanPhoneForCall = (p?: string) => {
    if (!p) return '';
    return p.replace(/\s+/g, '').trim();
  };

  const cleanPhoneForWhatsApp = (p?: string) => {
    if (!p) return '';
    let cleaned = p.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '212' + cleaned.substring(1);
    }
    return cleaned;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchData = async () => {
    try {
      const [leadsData, usersData, cityResolver] = await Promise.all([
        loadLeads().catch(() => []),
        loadData<UserType>('users').catch(() => []),
        loadClientCityResolver().catch(() => ({ cityRecords: [] as Lead[], resolveCity: () => '' }))
      ]);

      const chatMsgs = leadsData.filter(l => l.type === '__MESSAGE__' || l.type === '__MESSAGE_REPLY__');

      // Audio notification for new client messages
      if (lastMessageCountRef.current > 0 && chatMsgs.length > lastMessageCountRef.current) {
        const newOnes = chatMsgs.slice(lastMessageCountRef.current);
        const clientMsgs = newOnes.filter(m => m.type === '__MESSAGE__');
        if (clientMsgs.length > 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const latest = clientMsgs[clientMsgs.length - 1];
            new Notification(latest.name || 'Client BEYA', {
              body: latest.details,
              icon: '/vite.svg'
            });
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          }
        }
      }

      lastMessageCountRef.current = chatMsgs.length;
      setMessages(chatMsgs);
      setLeads(leadsData);
      setUsers(usersData || []);
      setCityRecords(cityResolver?.cityRecords || []);
    } catch (err) {
      console.error('Error fetching inbox data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    fetchData();
    const interval = setInterval(fetchData, 4000); // Auto refresh every 4s
    return () => clearInterval(interval);
  }, []);

  // Aggregate all contacts (Registered Users + Leads + Messages)
  const contacts = useMemo(() => {
    const map = new Map<string, ClientContact>();

    // 1. Add all registered users with client role or other clients
    users.forEach(u => {
      // Focus on clients, merchants, affiliates or anyone registered
      const isClientRole = !u.role || u.role === 'client' || u.role === 'merchant' || u.role === 'affiliate' || u.role === 'partenaire';
      if (!isClientRole) return;

      const normPhone = normalizePhone(u.telephone);
      const key = normPhone || u.email?.toLowerCase().trim() || u.id;
      if (!key) return;

      map.set(key, {
        id: key,
        name: u.nom || 'Client',
        phone: u.telephone || '',
        email: u.email || '',
        brandName: u.brandName || '',
        ville: u.ville || '',
        role: u.role || 'client',
        isRegisteredUser: true,
        userPassword: u.password || '',
        userPinCode: u.pinCode || '',
        messages: [],
        unreadCount: 0
      });
    });

    // 2. Add clients from leads / quotes (non-messages) who might not have registered accounts yet
    leads.forEach(l => {
      if (l.type === '__MESSAGE__' || l.type === '__MESSAGE_REPLY__' || l.type === CLIENT_CITY_LEAD_TYPE || l.type?.startsWith('__')) return;
      const normPhone = normalizePhone(l.phone);
      const email = l.email?.toLowerCase().trim();
      const key = normPhone || email;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: l.name || l.client || 'Client Prospect',
          phone: l.phone || '',
          email: l.email || '',
          brandName: l.type || '',
          ville: l.ville || '',
          role: 'prospect',
          isRegisteredUser: false,
          messages: [],
          unreadCount: 0
        });
      } else {
        const c = map.get(key)!;
        if (!c.phone && l.phone) c.phone = l.phone;
        if (!c.email && l.email) c.email = l.email;
        if (!c.ville && l.ville) c.ville = l.ville;
      }
    });

    // 3. Attach all messages to corresponding contacts
    messages.forEach(msg => {
      const normPhone = normalizePhone(msg.phone);
      const email = msg.email?.toLowerCase().trim();
      
      // Find matching contact by phone or email or name
      let targetKey: string | undefined;
      if (normPhone && map.has(normPhone)) {
        targetKey = normPhone;
      } else if (email && map.has(email)) {
        targetKey = email;
      } else {
        // Search through map by phone or email
        for (const [k, c] of map.entries()) {
          if (normPhone && normalizePhone(c.phone) === normPhone) {
            targetKey = k;
            break;
          }
          if (email && c.email && c.email.toLowerCase().trim() === email) {
            targetKey = k;
            break;
          }
          if (msg.name && c.name && c.name.toLowerCase().trim() === msg.name.toLowerCase().trim()) {
            targetKey = k;
            break;
          }
        }
      }

      if (!targetKey) {
        // Create new contact for unknown message sender
        targetKey = normPhone || email || msg.name || msg.id;
        map.set(targetKey, {
          id: targetKey,
          name: msg.name || (normPhone ? `Client ${normPhone}` : 'Client'),
          phone: msg.phone || '',
          email: msg.email || '',
          brandName: '',
          ville: msg.ville || '',
          role: 'client',
          isRegisteredUser: false,
          messages: [],
          unreadCount: 0
        });
      }

      const contact = map.get(targetKey)!;
      contact.messages.push(msg);
      if (msg.type === '__MESSAGE__' && !msg.contactedAt) {
        contact.unreadCount += 1;
      }
    });

    // Cross-link phone from leads for contacts whose telephone was empty
    map.forEach(c => {
      if (!c.phone) {
        const leadWithPhone = leads.find(l => 
          l.phone && (
            (c.email && l.email && l.email.toLowerCase().trim() === c.email.toLowerCase().trim()) ||
            (c.name && l.name && l.name.toLowerCase().trim() === c.name.toLowerCase().trim()) ||
            (c.name && (l.client || '').toLowerCase().trim() === c.name.toLowerCase().trim())
          )
        );
        if (leadWithPhone && leadWithPhone.phone) {
          c.phone = leadWithPhone.phone;
        }
      }
    });

    // Enrich contact cities from cloud city profiles & leads
    const allCityLookup = [...cityRecords, ...leads];
    map.forEach(c => {
      const resolvedCity = extractClientCityFromLeads(allCityLookup, {
        id: c.id,
        nom: c.name,
        email: c.email,
        telephone: c.phone,
        ville: c.ville
      });
      if (resolvedCity) {
        c.ville = resolvedCity;
      }
    });

    // Sort messages within each contact and determine lastMessage
    const contactList = Array.from(map.values()).map(contact => {
      contact.messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (contact.messages.length > 0) {
        const lastMsg = contact.messages[contact.messages.length - 1];
        contact.lastMessageDate = lastMsg.date;
        contact.lastMessageText = lastMsg.details;
      }
      return contact;
    });

    // Sort contacts: active conversations first, then registered users, then prospects
    return contactList.sort((a, b) => {
      const timeA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const timeB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      if (a.isRegisteredUser && !b.isRegisteredUser) return -1;
      if (!a.isRegisteredUser && b.isRegisteredUser) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [users, leads, messages, cityRecords]);

  // Filtered contacts according to tab & search
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // Tab filter
      if (filterTab === 'chat' && c.messages.length === 0) return false;
      if (filterTab === 'registered' && !c.isRegisteredUser) return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.brandName && c.brandName.toLowerCase().includes(q)) ||
        (c.ville && c.ville.toLowerCase().includes(q))
      );
    });
  }, [contacts, filterTab, search]);

  const selectedContact = useMemo(() => {
    if (!selectedContactId) return null;
    return contacts.find(c => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContactId, selectedContact?.messages]);

  const handleDeleteMsg = async (msgId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Voulez-vous supprimer ce message ?')) return;
    await deleteRecord('leads', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const handleDeleteConv = async () => {
    if (!selectedContact) return;
    if (!confirm(isAr ? 'هل أنت متأكد من حذف جميع رسائل هذه المحادثة؟' : 'Voulez-vous supprimer tous les messages de cette conversation ?')) return;
    for (const m of selectedContact.messages) {
      await deleteRecord('leads', m.id);
    }
    setMessages(prev => prev.filter(m => !selectedContact.messages.some(sm => sm.id === m.id)));
  };

    const handleStartVisioCall = async (contact: ClientContact) => {
    const safeName = (contact.name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
    const roomCode = `BEYA_${safeName}_${Date.now().toString().slice(-4)}`;
    const meetUrl = `https://meet.jit.si/${roomCode}#config.prejoinPageEnabled=false&config.startWithVideoMuted=false`;
    
    // 1. Open the meeting window for admin
    window.open(meetUrl, '_blank', 'width=1000,height=700');

    // 2. Automatically send an invitation link into the chat
    const inviteText = isAr 
      ? `📞 دعوة لمكالمة مباشرة (Audio/Visio Call):\nتفضل بالدخول إلى المكالمة المباشرة مع إدارة ورشة BEYA Creative عبر الرابط التالي:\n${meetUrl}`
      : `📞 Invitation pour un appel direct (Audio/Visio Call) :\nRejoignez la réunion avec l'atelier BEYA Creative ici :\n${meetUrl}`;

    try {
      const newMsg: Lead = {
        id: genId(),
        client: contact.name,
        name: 'BEYA CREATIVE',
        phone: contact.phone || '',
        email: contact.email || '',
        ville: contact.ville || '',
        type: '__MESSAGE_REPLY__',
        details: inviteText,
        date: new Date().toISOString(),
        status: 'completed',
        crmStage: 'confirme',
        createdAt: new Date().toISOString(),
        contactedAt: new Date().toISOString(),
        contactedBy: 'Admin'
      };
      await saveRecord('leads', newMsg, true);
      setMessages(prev => [...prev, newMsg]);
    } catch (e) {
      console.error('Error posting call invite:', e);
    }
  };

  const handleInitiateCall = (contact: ClientContact, type: 'gsm' | 'whatsapp') => {
    if (contact.phone) {
      if (type === 'gsm') {
        window.location.href = `tel:${cleanPhoneForCall(contact.phone)}`;
      } else {
        const waText = isAr 
          ? `السلام عليكم ${contact.name}، معكم إدارة ورشة BEYA Creative بخصوص طلبكم...` 
          : `Bonjour ${contact.name}, atelier BEYA Creative...`;
        window.open(`https://wa.me/${cleanPhoneForWhatsApp(contact.phone)}?text=${encodeURIComponent(waText)}`, '_blank');
      }
    } else {
      setPhonePromptContact(contact);
      setNewPhoneInput('');
    }
  };

  const handleSavePhoneAndCall = async (type: 'gsm' | 'whatsapp') => {
    if (!phonePromptContact || !newPhoneInput.trim()) return;
    const cleanP = newPhoneInput.trim();
    
    phonePromptContact.phone = cleanP;
    
    const matchingUser = users.find(u => 
      (phonePromptContact.email && u.email && u.email.toLowerCase().trim() === phonePromptContact.email.toLowerCase().trim()) ||
      (u.nom && u.nom.toLowerCase().trim() === phonePromptContact.name.toLowerCase().trim())
    );
    if (matchingUser) {
      const updatedUser = { ...matchingUser, telephone: cleanP };
      await saveRecord('users', updatedUser, true);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }

    setPhonePromptContact(null);

    if (type === 'gsm') {
      window.location.href = `tel:${cleanPhoneForCall(cleanP)}`;
    } else {
      const waText = isAr 
        ? `السلام عليكم ${phonePromptContact.name}، معكم إدارة ورشة BEYA Creative بخصوص طلبكم...` 
        : `Bonjour ${phonePromptContact.name}, atelier BEYA Creative...`;
      window.open(`https://wa.me/${cleanPhoneForWhatsApp(cleanP)}?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedContact) return;
    setSending(true);

    const newMsg: Lead = {
      id: genId(),
      name: 'BEYA CREATIVE',
      email: selectedContact.email || '',
      phone: selectedContact.phone || '',
      ville: selectedContact.ville || '',
      type: '__MESSAGE_REPLY__',
      status: 'completed',
      date: new Date().toISOString(),
      quantity: 0,
      details: replyText.trim()
    };

    try {
      await saveRecord('leads', newMsg, true);
      setMessages(prev => [...prev, newMsg]);
      setReplyText('');

      // Send push notification if supported
      try {
        const { sendPushToClient } = await import('../utils/pushNotifications');
        sendPushToClient(
          selectedContact.name || selectedContact.phone || 'Client',
          isAr ? 'رسالة جديدة من BEYA Creative' : 'Nouveau message de BEYA Creative',
          replyText.trim(),
          '/portail'
        );
      } catch (e) {}
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Generate WhatsApp Portal Access Message
  const generatePortalAccessMessage = (c: ClientContact) => {
    const portalUrl = `${window.location.origin}/portail`;
    if (isAr) {
      return `السلام عليكم أستاذ ${c.name} 👋
معك إدارة BEYA Creative للإنتاج والنسيج.

نود إعلامك أن حسابك مفعل في منصة تتبع الإنتاج والدوفيز. يمكنك الدخول لمتابعة دراسة الموديل، الدوفيز الرسمي، وتتبع مراحل التصنيع عبر الرابط التالي:

🌐 رابط فضاء الزبون:
${portalUrl}

🔐 بيانات الدخول الخاصة بك:
${c.email ? `📧 البريد الإلكتروني: ${c.email}\n` : ''}${c.phone ? `📱 رقم الهاتف: ${c.phone}\n` : ''}${c.userPassword ? `🔑 كلمة المرور: ${c.userPassword}\n` : ''}${c.userPinCode ? `⚡ كود الدخول السريع (PIN): ${c.userPinCode}\n` : ''}
إذا واجهت أي صعوبة، نحن هنا لمساعدتك دائماً!
شكراً لثقتكم بنا ✨`;
    } else {
      return `Bonjour ${c.name} 👋
Atelier BEYA Creative - Confection & Production.

Votre espace client VIP est disponible pour suivre vos devis, validations d'échantillons et étapes de confection en temps réel :

🌐 Lien Portail Client :
${portalUrl}

🔐 Vos identifiants de connexion :
${c.email ? `📧 Email : ${c.email}\n` : ''}${c.phone ? `📱 Téléphone : ${c.phone}\n` : ''}${c.userPassword ? `🔑 Mot de passe : ${c.userPassword}\n` : ''}${c.userPinCode ? `⚡ Code PIN rapide : ${c.userPinCode}\n` : ''}
N'hésitez pas à nous contacter si vous avez la moindre question.
BEYA Creative ✨`;
    }
  };

  const activeChatsCount = contacts.filter(c => c.messages.length > 0).length;
  const registeredCount = contacts.filter(c => c.isRegisteredUser).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 bg-slate-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar - Contacts */}
      <div className={`flex flex-col w-full md:w-[380px] lg:w-[420px] border-r border-slate-200 bg-white ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {isAr ? 'العملاء والمحادثات' : 'Clients & Discussions'}
                </h1>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? `${contacts.length} زبون متاح للتواصل` : `${contacts.length} clients disponibles`}
                </p>
              </div>
            </div>
            <button 
              onClick={fetchData}
              title={isAr ? 'تحديث' : 'Actualiser'}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-2.5">
            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، الهاتف، العلامة التجارية...' : 'Recherche par nom, tél, marque...'}
              className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-300 transition-all`}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1 text-[11px] font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${filterTab === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {isAr ? `الكل (${contacts.length})` : `Tous (${contacts.length})`}
            </button>
            <button
              onClick={() => setFilterTab('chat')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${filterTab === 'chat' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {isAr ? `محادثات (${activeChatsCount})` : `Chats (${activeChatsCount})`}
            </button>
            <button
              onClick={() => setFilterTab('registered')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${filterTab === 'registered' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {isAr ? `مسجلون (${registeredCount})` : `Inscrits (${registeredCount})`}
            </button>
          </div>
        </div>
        
        {/* Contact List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold uppercase">{isAr ? 'لا يوجد أي زبون مطابق' : 'Aucun client trouvé'}</p>
            </div>
          )}

          {filteredContacts.map(contact => {
            const isSelected = selectedContactId === contact.id;
            const hasChat = contact.messages.length > 0;
            const cleanCall = cleanPhoneForCall(contact.phone);
            const cleanWa = cleanPhoneForWhatsApp(contact.phone);

            return (
              <div 
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-3.5 cursor-pointer transition-all hover:bg-slate-50 group border-l-4 ${
                  isSelected 
                    ? 'bg-indigo-50/70 border-indigo-600' 
                    : hasChat 
                      ? 'border-emerald-400 bg-white' 
                      : 'border-transparent bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm ${
                      contact.isRegisteredUser 
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {contact.brandName ? contact.brandName.substring(0, 2) : contact.name.substring(0, 2)}
                    </div>
                    {contact.isRegisteredUser && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title={isAr ? 'حساب بورتال مفعل' : 'Compte actif'} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="text-xs font-black text-slate-900 truncate">
                          {contact.brandName ? `${contact.brandName} • ${contact.name}` : contact.name}
                        </h3>
                      </div>
                      {contact.lastMessageDate ? (
                        <span className="text-[9px] font-bold text-slate-400 shrink-0">
                          {new Date(contact.lastMessageDate).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { month: 'numeric', day: 'numeric' })}
                        </span>
                      ) : (
                        contact.isRegisteredUser && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                            {isAr ? 'بورتال' : 'Portail'}
                          </span>
                        )
                      )}
                    </div>

                    {/* Phone & City */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mb-1">
                      {contact.phone && (
                        <span className="font-mono text-slate-600 font-bold">{contact.phone}</span>
                      )}
                      {contact.ville && (
                        <span className="flex items-center gap-0.5 text-slate-400 truncate">
                          <MapPin className="w-2.5 h-2.5" />
                          {contact.ville}
                        </span>
                      )}
                    </div>

                    {/* Message snippet or status */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[10px] truncate ${hasChat ? 'text-slate-600 font-medium' : 'text-slate-400 italic'}`}>
                        {hasChat ? (
                          <>
                            {contact.messages[contact.messages.length - 1].type === '__MESSAGE_REPLY__' ? (isAr ? 'أنت: ' : 'Vous: ') : ''}
                            {contact.lastMessageText}
                          </>
                        ) : (
                          isAr ? 'لا توجد رسائل بعد - اضغط للتواصل' : 'Aucun message - Cliquez pour échanger'
                        )}
                      </p>

                      {/* Quick Action Buttons on item */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        {contact.phone && (
                          <>
                            <a
                              href={`tel:${cleanCall}`}
                              onClick={e => e.stopPropagation()}
                              className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title={isAr ? `اتصال هاتفي GSM بـ ${contact.phone}` : `Appeler ${contact.phone}`}
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                                isAr 
                                  ? `السلام عليكم ${contact.name}، معكم إدارة BEYA Creative...` 
                                  : `Bonjour ${contact.name}, de BEYA Creative...`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title={isAr ? 'محادثة واتساب' : 'WhatsApp'}
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {/* Chat Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              {/* Client Info */}
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setSelectedContactId(null)} 
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  ←
                </button>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm uppercase shrink-0 shadow-sm ${
                  selectedContact.isRegisteredUser ? 'bg-indigo-600' : 'bg-slate-700'
                }`}>
                  {selectedContact.brandName ? selectedContact.brandName.substring(0, 2) : selectedContact.name.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900 truncate">
                      {selectedContact.brandName ? `${selectedContact.brandName} (${selectedContact.name})` : selectedContact.name}
                    </h2>
                    {selectedContact.isRegisteredUser ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                        {isAr ? 'زبون البورتال' : 'Client Portail'}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold shrink-0">
                        {isAr ? 'طلب أولي' : 'Prospect'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    {selectedContact.phone && (
                      <span className="font-mono font-bold text-slate-700">{selectedContact.phone}</span>
                    )}
                    {selectedContact.email && (
                      <span className="text-slate-400 truncate hidden sm:inline">{selectedContact.email}</span>
                    )}
                    {selectedContact.ville && (
                      <span className="text-slate-400">📍 {selectedContact.ville}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Actions: Call, WhatsApp, Visio, Credentials, Trash */}
              <div className="flex items-center gap-2 shrink-0">
                {/* 1. Direct GSM Call */}
                <button
                  type="button"
                  onClick={() => handleInitiateCall(selectedContact, 'gsm')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md shadow-emerald-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title={isAr ? (selectedContact.phone ? `اتصال هاتفي مباشر (GSM) بـ ${selectedContact.phone}` : 'إجراء مكالمة هاتفية (GSM)') : 'Appel GSM'}
                >
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  <span className="hidden sm:inline">{isAr ? 'اتصال هاتفي' : 'Appel Direct'}</span>
                </button>

                {/* 2. Direct WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleInitiateCall(selectedContact, 'whatsapp')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title={isAr ? 'محادثة أو مكالمة واتساب' : 'WhatsApp'}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">{isAr ? 'واتساب' : 'WhatsApp'}</span>
                </button>

                {/* 3. Live Online Visio / Audio Call */}
                <button
                  type="button"
                  onClick={() => handleStartVisioCall(selectedContact)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title={isAr ? 'مكالمة فيديو وصوت مباشرة عبر البورتال' : 'Démarrer un appel Visio/Audio direct'}
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAr ? 'مكالمة مباشرة' : 'Visio/Audio'}</span>
                </button>

                {/* 4. Send Portal Access info via WhatsApp */}
                {selectedContact.phone && (
                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsApp(selectedContact.phone)}?text=${encodeURIComponent(
                      generatePortalAccessMessage(selectedContact)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-900 hover:bg-amber-500 hover:text-white border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                    title={isAr ? 'إرسال رابط الحساب وبيانات الدخول عبر واتساب' : 'Envoyer lien et accès portail via WhatsApp'}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span className="hidden lg:inline">{isAr ? 'إرسال رابط الدخول' : 'Envoyer Accès'}</span>
                  </a>
                )}

                {/* 4. Delete Chat */}
                {selectedContact.messages.length > 0 && (
                  <button 
                    onClick={handleDeleteConv}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
                    title={isAr ? 'حذف المحادثة بالكامل' : 'Supprimer la conversation'}
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick credentials banner if client is registered */}
            {selectedContact.isRegisteredUser && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-50/80 px-3 py-1.5 rounded-xl">
                <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                  <span className="font-bold flex items-center gap-1 text-indigo-700">
                    <KeyRound className="w-3.5 h-3.5" />
                    {isAr ? 'بيانات فضاء الزبون:' : 'Accès Portail :'}
                  </span>
                  {selectedContact.email && (
                    <span><strong>Email:</strong> {selectedContact.email}</span>
                  )}
                  {selectedContact.userPassword && (
                    <span><strong>Mot de passe:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{selectedContact.userPassword}</code></span>
                  )}
                  {selectedContact.userPinCode && (
                    <span><strong>PIN:</strong> <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black">{selectedContact.userPinCode}</code></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatePortalAccessMessage(selectedContact), 'msg')}
                    className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
                  >
                    {copiedKey === 'msg' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'msg' ? (isAr ? 'تم النسخ!' : 'Copié!') : (isAr ? 'نسخ رسالة الدخول' : 'Copier accès')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* If no messages exist yet */}
            {selectedContact.messages.length === 0 && (
              <div className="max-w-md mx-auto text-center py-10 px-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  {isAr ? `تواصل مع ${selectedContact.name}` : `Échangez avec ${selectedContact.name}`}
                </h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  {isAr 
                    ? 'هذا الزبون موجود في المنصة ولكن لم تبدأ معه محادثة كتابية بعد. يمكنك الاتصال به هاتفياً أو إرسال رسالة له ستظهر له في بورتال الزبون فور تسجيل دخوله.'
                    : 'Ce client est enregistré dans la plateforme. Vous pouvez l\'appeler par téléphone, lui envoyer un WhatsApp ou lui laisser un message dans son portail.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {selectedContact.phone && (
                    <a
                      href={`tel:${cleanPhoneForCall(selectedContact.phone)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-700 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {isAr ? 'اتصال هاتفي مباشر' : 'Appeler au GSM'}
                    </a>
                  )}
                  {selectedContact.phone && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(selectedContact.phone)}?text=${encodeURIComponent(
                        generatePortalAccessMessage(selectedContact)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-black hover:bg-green-600 hover:text-white transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {isAr ? 'إرسال رابط الدخول عبر واتساب' : 'Envoyer lien WhatsApp'}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* List of Messages */}
            {selectedContact.messages.map((msg, idx) => {
              const isAdmin = msg.type === '__MESSAGE_REPLY__';
              return (
                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteMsg(msg.id)} 
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title={isAr ? 'حذف' : 'Supprimer'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                    isAdmin 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}>
                    {!isAdmin && (
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">
                        {msg.name || selectedContact.name}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.details}</p>
                    <span className={`text-[9px] mt-1.5 block font-mono ${isAdmin ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                      {new Date(msg.date).toLocaleTimeString(isAr ? 'ar-MA' : 'fr-MA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!isAdmin && (
                    <button 
                      onClick={() => handleDeleteMsg(msg.id)} 
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title={isAr ? 'حذف' : 'Supprimer'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply templates */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">{isAr ? 'ردود سريعة:' : 'Réponses :'}</span>
            {[
              isAr ? 'السلام عليكم، تم مراجعة طلبكم وسنوافيكم بالدوفيز.' : 'Bonjour, nous étudions votre demande.',
              isAr ? 'تم تحديث الدوفيز الرسمي في حسابكم بالبورتال.' : 'Votre devis officiel est prêt sur votre portail.',
              isAr ? 'يرجى مراجعة تفاصيل العينة والتأكيد عليها.' : 'Merci de vérifier les détails du prototype.'
            ].map((tmpl, tidx) => (
              <button
                key={tidx}
                onClick={() => setReplyText(tmpl)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors"
              >
                {tmpl}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0 relative">
            <div className="flex items-end gap-2">
              {/* Quick Call Action Button & Menu (Placed right next to Send button) */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCallMenu(!showCallMenu)}
                  className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isAr ? 'إجراء مكالمة (هاتف، واتساب، أو مكالمة مباشرة)' : 'Appeler (Téléphone, WhatsApp ou Visio)'}
                >
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </button>

                {/* Call Options Popup */}
                {showCallMenu && (
                  <div className={`absolute bottom-14 ${isAr ? 'right-0 sm:left-0 sm:right-auto' : 'left-0 sm:right-0 sm:left-auto'} z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        {isAr ? `إجراء مكالمة مع ${selectedContact.name}` : `Appeler ${selectedContact.name}`}
                      </span>
                      <button onClick={() => setShowCallMenu(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="py-1 space-y-1">
                      {/* Option 1: Direct GSM Call */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowCallMenu(false);
                          handleInitiateCall(selectedContact, 'gsm');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold transition-all text-right cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="font-black text-slate-900">{isAr ? 'مكالمة هاتفية عادية (GSM)' : 'Appel Téléphonique GSM'}</div>
                          <div className="text-[10px] text-slate-400">{selectedContact.phone ? cleanPhoneForCall(selectedContact.phone) : (isAr ? 'أدخل رقم الهاتف للاتصال' : 'Ajouter un numéro')}</div>
                        </div>
                      </button>

                      {/* Option 2: WhatsApp Call / Chat */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowCallMenu(false);
                          handleInitiateCall(selectedContact, 'whatsapp');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 text-slate-700 hover:text-green-700 rounded-xl text-xs font-bold transition-all text-right cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="font-black text-slate-900">{isAr ? 'مكالمة أو محادثة فالواتساب' : 'Appel WhatsApp'}</div>
                          <div className="text-[10px] text-slate-400">{isAr ? 'فتح واتساب مباشرة' : 'Ouvrir WhatsApp direct'}</div>
                        </div>
                      </button>

                      {/* Option 3: Live Online Audio/Visio Call */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowCallMenu(false);
                          handleStartVisioCall(selectedContact);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all text-right cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="font-black text-slate-900">{isAr ? 'مكالمة مباشرة أوديو وفيديو (BEYA Meet)' : 'Appel Visio / Audio Direct'}</div>
                          <div className="text-[10px] text-slate-400">{isAr ? 'بدء مكالمة وإرسال الرابط فوراً للزبون' : 'Lancer réunion et envoyer le lien'}</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isAr ? `اكتب رسالتك لـ ${selectedContact.name} هنا (ستصل لبورتال الزبون)...` : `Écrivez votre message à ${selectedContact.name}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300 max-h-32 min-h-[44px]"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center">
              {isAr ? 'اضغط Enter للإرسال • ستظهر الرسالة مباشرة في فضاء الزبون' : 'Appuyez sur Entrée pour envoyer • Visible sur le portail client'}
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 flex-col gap-4 p-8 text-center">
          <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
            <MessageSquare className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide mb-1">
              {isAr ? 'اختر زبوناً لبدء المحادثة أو الاتصال به' : 'Sélectionnez un client'}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm">
              {isAr 
                ? 'جميع العملاء المسجلين وأصحاب الطلبات متوفرون في القائمة الجانبية مع إمكانية الاتصال المباشر ومراسلتهم عبر واتساب.'
                : 'Tous vos clients sont répertoriés dans la barre latérale avec appels directs GSM et WhatsApp.'}
            </p>
          </div>
        </div>
      )}

      {/* Missing Phone Prompt Modal */}
      {phonePromptContact && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? `رقم هاتف ${phonePromptContact.name}` : `Téléphone de ${phonePromptContact.name}`}</span>
              </div>
              <button onClick={() => setPhonePromptContact(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr 
                ? 'لم يتم تسجيل رقم هاتف لهذا الزبون بعد. أدخل رقم هاتفه لإجراء المكالمة وحفظه في حسابه مباشرة:' 
                : 'Aucun numéro enregistré pour ce client. Entrez son numéro pour l\'appeler et l\'enregistrer :'}
            </p>
            <input
              type="tel"
              value={newPhoneInput}
              onChange={e => setNewPhoneInput(e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-400"
              autoFocus
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={!newPhoneInput.trim()}
                onClick={() => handleSavePhoneAndCall('gsm')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{isAr ? 'اتصال GSM' : 'Appel GSM'}</span>
              </button>
              <button
                type="button"
                disabled={!newPhoneInput.trim()}
                onClick={() => handleSavePhoneAndCall('whatsapp')}
                className="flex-1 py-3 bg-green-50 hover:bg-green-100 disabled:opacity-40 text-green-700 border border-green-200 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
