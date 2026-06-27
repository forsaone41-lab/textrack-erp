import { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, Clock, MessageSquare, Inbox as InboxIcon, Eye, EyeOff, Plus, X, Send } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../contexts/LangContext';
import { loadCompanyProfile } from '../types';

interface EmailMessage {
  id: string;
  gmail_id: string;
  from_name: string;
  from_email: string;
  subject: string;
  body: string;
  received_at: string;
  is_read: boolean;
  is_hidden?: boolean;
  replied_at?: string;
}

export default function GmailInbox() {
  const { isAr } = useLang();
  const company = loadCompanyProfile();
  const isAdmin = (() => { try { return JSON.parse(localStorage.getItem('textrack_auth') || '{}')?.role === 'admin'; } catch { return false; } })();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${composeData.to}?subject=${encodeURIComponent(composeData.subject)}&body=${encodeURIComponent(composeData.body)}`;
    window.location.href = mailtoUrl;
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
  };

  const fetchEmails = async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from('inbox_emails')
      .select('*')
      .order('received_at', { ascending: false });
    if (data) setEmails(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchEmails(); }, []);

  const markAsRead = async (email: EmailMessage) => {
    if (email.is_read) return;
    await supabase.from('inbox_emails').update({ is_read: true }).eq('id', email.id);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
  };

  const openEmail = (email: EmailMessage) => {
    setSelected(email);
    markAsRead(email);
  };

  const hideEmail = async (email: EmailMessage) => {
    await supabase.from('inbox_emails').update({ is_hidden: true }).eq('id', email.id);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_hidden: true } : e));
    if (selected?.id === email.id) setSelected(null);
  };

  const unhideEmail = async (email: EmailMessage) => {
    await supabase.from('inbox_emails').update({ is_hidden: false }).eq('id', email.id);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_hidden: false } : e));
  };

  const replyWhatsApp = (email: EmailMessage) => {
    const msg = isAr
      ? `السلام عليكم، معكم *BEYA CREATIVE*. بخصوص رسالتكم "${email.subject}" — `
      : `Bonjour, ici *BEYA CREATIVE*. Concernant votre message "${email.subject}" — `;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = emails.filter(e => {
    if (e.is_hidden && !isAdmin) return false;
    if (!showHidden && e.is_hidden) return false;
    if (showHidden && !e.is_hidden) return false;
    const matchSearch = !search ||
      e.from_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.from_email?.toLowerCase().includes(search.toLowerCase()) ||
      e.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'unread' && !e.is_read) || (filter === 'read' && e.is_read);
    return matchSearch && matchFilter;
  });

  const unreadCount = emails.filter(e => !e.is_read).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Left panel - email list */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-2/5 border-r border-slate-100 bg-white`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <InboxIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-slate-900">{isAr ? 'البريد الوارد' : 'Boîte Gmail'}</h1>
                  {company.email && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200" dir="ltr">
                      {company.email}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && <p className="text-[10px] text-indigo-600 font-black">{unreadCount} {isAr ? 'غير مقروء' : 'non lu(s)'}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowCompose(true)}
                className="h-8 px-3 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all mr-2">
                <Plus className="w-4 h-4 mr-1" /> <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'رسالة جديدة' : 'Nouveau'}</span>
              </button>
              {isAdmin && (
                <button onClick={() => setShowHidden(!showHidden)}
                  title={showHidden ? 'Voir les emails normaux' : 'Voir les emails masqués'}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${showHidden ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
              <button onClick={fetchEmails} disabled={refreshing}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all">
                <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث...' : 'Rechercher...'}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          {/* Filter */}
          <div className="flex gap-1">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {f === 'all' ? (isAr ? 'الكل' : 'Tous') : f === 'unread' ? (isAr ? 'جديد' : 'Non lu') : (isAr ? 'مقروء' : 'Lu')}
              </button>
            ))}
          </div>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">{isAr ? 'لا توجد رسائل' : 'Aucun email'}</p>
            </div>
          )}
          {filtered.map(email => (
            <div key={email.id} className={`relative group ${selected?.id === email.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''} ${!email.is_read ? 'bg-blue-50/30' : ''}`}>
            <button onClick={() => openEmail(email)}
              className="w-full text-left p-3 hover:bg-slate-50 transition-all pr-8">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${!email.is_read ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {(email.from_name || email.from_email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs truncate ${!email.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                      {email.from_name || email.from_email}
                    </p>
                    <p className={`text-[10px] truncate ${!email.is_read ? 'font-bold text-slate-700' : 'text-slate-400'}`}>
                      {email.subject || '(sans objet)'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{email.body?.substring(0, 60)}...</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[9px] text-slate-400">
                    {new Date(email.received_at).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                  </span>
                  {!email.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                </div>
              </div>
            </button>
            {isAdmin && (
              <button onClick={() => showHidden ? unhideEmail(email) : hideEmail(email)}
                className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-all w-6 h-6 flex items-center justify-center rounded-lg bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-400"
                title={showHidden ? 'Afficher' : 'Masquer'}>
                {showHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            )}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - email detail */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Email header */}
          <div className="p-5 border-b border-slate-100">
            <button onClick={() => setSelected(null)} className="md:hidden mb-3 text-[10px] font-black text-indigo-600">← {isAr ? 'رجوع' : 'Retour'}</button>
            <h2 className="text-base font-black text-slate-900 mb-2">{selected.subject || '(sans objet)'}</h2>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-black text-slate-700">{selected.from_name}</p>
                <p className="text-[10px] text-slate-400">{selected.from_email}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {new Date(selected.received_at).toLocaleString(isAr ? 'ar-MA' : 'fr-MA')}
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <button onClick={() => hideEmail(selected)}
                    className="h-9 px-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-red-50 hover:text-red-500 transition-all">
                    <EyeOff className="w-3.5 h-3.5" /> {isAr ? 'إخفاء' : 'Masquer'}
                  </button>
                )}
                <button onClick={() => replyWhatsApp(selected)}
                  className="h-9 px-3 bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-emerald-600 transition-all">
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <a href={`mailto:${selected.from_email}?subject=Re: ${selected.subject}`}
                  className="h-9 px-3 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-indigo-700 transition-all">
                  <Mail className="w-3.5 h-3.5" /> {isAr ? 'رد بالإيميل' : 'Répondre'}
                </a>
              </div>
            </div>
          </div>
          {/* Email body */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
              {selected.body || '(message vide)'}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-300 flex-col gap-3">
          <Eye className="w-12 h-12 opacity-20" />
          <p className="text-sm font-bold">{isAr ? 'اختر رسالة' : 'Sélectionner un email'}</p>
        </div>
      )}

      {/* Modal Compose */}
      {showCompose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-black text-slate-900">{isAr ? 'رسالة جديدة' : 'Nouveau Message'}</h2>
              <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{isAr ? 'إلى (البريد الإلكتروني)' : 'À (Email)'}</label>
                <input type="email" required value={composeData.to} onChange={e => setComposeData({...composeData, to: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="exemple@email.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{isAr ? 'الموضوع' : 'Objet'}</label>
                <input type="text" required value={composeData.subject} onChange={e => setComposeData({...composeData, subject: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder={isAr ? 'موضوع الرسالة' : 'Objet du message'} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{isAr ? 'الرسالة' : 'Message'}</label>
                <textarea required rows={6} value={composeData.body} onChange={e => setComposeData({...composeData, body: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Tapez votre message ici...'} />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">
                  {isAr ? 'إرسال' : 'Envoyer'} <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
