import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Clock, Search, Inbox as InboxIcon, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { Lead, loadLeads, saveRecord, genId } from '../types';
import { useLang } from '../contexts/LangContext';

export default function Inbox() {
  const { isAr } = useLang();
  const [messages, setMessages] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastMessageCountRef = useRef(0);

  const fetchMessages = () => {
    loadLeads().then(data => {
      const newMsgs = data.filter(l => l.type === '__MESSAGE__' || l.type === '__MESSAGE_REPLY__');
      
      if (lastMessageCountRef.current > 0 && newMsgs.length > lastMessageCountRef.current) {
        // Find the new messages
        const newOnes = newMsgs.slice(lastMessageCountRef.current);
        // Only notify if there's a message from a client
        const clientMsgs = newOnes.filter(m => m.type === '__MESSAGE__');
        if (clientMsgs.length > 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            const latest = clientMsgs[clientMsgs.length - 1];
            new Notification(latest.name || 'Client', {
              body: latest.details,
              icon: '/vite.svg'
            });
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          }
        }
      }
      
      lastMessageCountRef.current = newMsgs.length;
      setMessages(newMsgs);
      setLoading(false);
    });
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Auto refresh every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPhone, messages]);

  // Group by phone
  const conversations = messages.reduce((acc, msg) => {
    const key = msg.phone || msg.email || 'Inconnu';
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {} as Record<string, Lead[]>);

  // Sort conversations by latest message
  const sortedPhones = Object.keys(conversations).sort((a, b) => {
    const lastA = new Date(conversations[a].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0].date).getTime();
    const lastB = new Date(conversations[b].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0].date).getTime();
    return lastB - lastA;
  });

  const filteredPhones = sortedPhones.filter(phone => {
    const msgs = conversations[phone];
    const clientName = msgs.find(m => m.type === '__MESSAGE__')?.name || 'Client';
    return !search || 
           clientName.toLowerCase().includes(search.toLowerCase()) || 
           phone.includes(search);
  });

  const handleSend = async () => {
    if (!replyText.trim() || !selectedPhone) return;
    setSending(true);
    
    // Find client info from previous messages
    const clientMsg = conversations[selectedPhone].find(m => m.type === '__MESSAGE__');
    
    const newMsg: Lead = {
      id: genId(),
      name: 'BEYA CREATIVE',
      email: clientMsg?.email || '',
      phone: selectedPhone,
      ville: '',
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
      
      // Try to send push notification to client
      try {
        const { sendPushToClient } = await import('../utils/pushNotifications');
        sendPushToClient(
          clientMsg?.name || selectedPhone,
          isAr ? 'رسالة جديدة من BEYA' : 'Nouveau message de BEYA',
          replyText.trim(),
          '/portail'
        );
      } catch (e) {}

    } catch (e) {
      console.error(e);
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar - Contacts */}
      <div className={`flex flex-col w-full md:w-1/3 border-r border-slate-100 bg-white ${selectedPhone ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase">{isAr ? 'رسائل العملاء' : 'Messages Clients'}</h1>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {isAr ? 'محادثات آمنة' : 'Chat Sécurisé'}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث برقم الهاتف...' : 'Rechercher par numéro...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredPhones.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-[10px] font-bold uppercase">{isAr ? 'لا توجد محادثات' : 'Aucune conversation'}</p>
            </div>
          )}
          {filteredPhones.map(phone => {
            const msgs = conversations[phone].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const lastMsg = msgs[msgs.length - 1];
            const clientName = msgs.find(m => m.type === '__MESSAGE__')?.name || phone;
            const isUnread = lastMsg.type === '__MESSAGE__' && !lastMsg.contactedAt; // Example logic
            
            return (
              <button 
                key={phone} 
                onClick={() => setSelectedPhone(phone)}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-all ${selectedPhone === phone ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-black text-slate-900 truncate uppercase">{clientName}</h3>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {new Date(lastMsg.date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate ${lastMsg.type === '__MESSAGE_REPLY__' ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                      {lastMsg.type === '__MESSAGE_REPLY__' ? (isAr ? 'أنت: ' : 'Vous: ') : ''}{lastMsg.details}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedPhone ? (
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Chat Header */}
          <div className="h-16 bg-white border-b border-slate-100 flex items-center px-4 shrink-0">
            <button onClick={() => setSelectedPhone(null)} className="md:hidden p-2 -ml-2 mr-2 text-slate-400">
              ←
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 shrink-0">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase">
                {conversations[selectedPhone].find(m => m.type === '__MESSAGE__')?.name || selectedPhone}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">{selectedPhone}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversations[selectedPhone].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((msg, idx) => {
              const isAdmin = msg.type === '__MESSAGE_REPLY__';
              return (
                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    isAdmin 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.details}</p>
                    <span className={`text-[9px] mt-1 block ${isAdmin ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                      {new Date(msg.date).toLocaleTimeString(isAr ? 'ar-MA' : 'fr-MA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Écrivez votre message...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300 max-h-32 min-h-[44px]"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center">
              {isAr ? 'اضغط Enter للإرسال' : 'Appuyez sur Entrée pour envoyer'}
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 flex-col gap-4">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-indigo-300" />
          </div>
          <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest">
            {isAr ? 'اختر محادثة للبدء' : 'Sélectionnez une conversation'}
          </h2>
        </div>
      )}
    </div>
  );
}
