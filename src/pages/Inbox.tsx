import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, CheckCircle, Clock, Search, Inbox as InboxIcon, RefreshCw } from 'lucide-react';
import { Lead, loadLeads, saveRecord } from '../types';
import { useLang } from '../contexts/LangContext';

export default function Inbox() {
  const { isAr } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads().then(data => {
      // Only client leads (not recrutement)
      setLeads(data.filter(l => !l.type.startsWith('RECRUTEMENT:')));
      setLoading(false);
    });
  }, []);

  const grouped = leads.reduce((acc, lead) => {
    const key = lead.phone + '_' + lead.name.toLowerCase().trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const groups = Object.values(grouped).sort((a, b) =>
    new Date(b[0].date).getTime() - new Date(a[0].date).getTime()
  );

  const filtered = groups.filter(group => {
    const client = group[0];
    const matchSearch = !search ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search) ||
      group.some(r => r.type.toLowerCase().includes(search.toLowerCase()));
    const isReplied = group.some(r => r.contactedAt);
    const matchFilter = filter === 'all' || (filter === 'new' && !isReplied) || (filter === 'replied' && isReplied);
    return matchSearch && matchFilter;
  });

  const newCount = groups.filter(g => !g.some(r => r.contactedAt)).length;

  const markAsRead = async (group: Lead[]) => {
    const now = new Date().toISOString();
    for (const lead of group) {
      if (!lead.contactedAt) {
        const updated = { ...lead, contactedAt: now, contactedType: 'inbox' };
        await saveRecord('leads', updated);
      }
    }
    setLeads(prev => prev.map(l =>
      group.find(g => g.id === l.id) ? { ...l, contactedAt: l.contactedAt || now } : l
    ));
  };

  const openWhatsApp = (phone: string, name: string, types: string) => {
    const raw = phone.replace(/\D/g, '');
    const formatted = raw.startsWith('0') ? '212' + raw.slice(1) : raw;
    const msg = isAr
      ? `السلام عليكم *${name}*، معكم *BEYA CREATIVE*. 😊 شكراً على طلبكم الخاص بـ *${types}*. واش ممكن تعطينا تفاصيل أكثر؟`
      : `Bonjour *${name}*, ici *BEYA CREATIVE*. 😊 Merci pour votre demande concernant *${types}*. Pourriez-vous nous en dire plus ?`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  return (
    <div className="space-y-5 p-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <InboxIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">{isAr ? 'صندوق الرسائل' : 'Boîte de Réception'}</h1>
            <p className="text-[11px] text-slate-400 font-bold">{newCount} {isAr ? 'رسالة جديدة' : 'nouveau(x)'}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث...' : 'Rechercher...'}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'replied'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase transition-all border ${filter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}>
              {f === 'all' ? (isAr ? 'الكل' : 'Tous') : f === 'new' ? (isAr ? 'جديد' : 'Nouveau') : (isAr ? 'تم التواصل' : 'Répondu')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">{isAr ? 'لا توجد رسائل' : 'Aucun message'}</p>
          </div>
        )}
        {filtered.map(group => {
          const client = group[0];
          const isReplied = group.some(r => r.contactedAt);
          const types = group.map(r => r.type).join(', ');
          const totalQty = group.reduce((s, r) => s + (r.quantity || 0), 0);
          const latestDate = new Date(group.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date);

          return (
            <div key={client.phone + client.name}
              className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${isReplied ? 'border-slate-100 opacity-80' : 'border-indigo-200 ring-1 ring-indigo-100'}`}>
              <div className="flex items-start justify-between gap-3">
                {/* Avatar + Info */}
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${isReplied ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm uppercase">{client.name}</h3>
                      {!isReplied && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full">
                          {isAr ? 'جديد' : 'Nouveau'}
                        </span>
                      )}
                      {isReplied && (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-black">
                          <CheckCircle className="w-3 h-3" /> {isAr ? 'تم التواصل' : 'Répondu'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-bold mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>
                      {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>}
                      {client.ville && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.ville}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {latestDate.toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA')}</span>
                    </div>
                    {/* Models */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {group.map(r => (
                        <span key={r.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black">
                          {r.type} — {r.quantity} pcs
                        </span>
                      ))}
                    </div>
                    {/* Details */}
                    {client.details && (
                      <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 rounded-lg px-2 py-1 max-w-md">
                        "{client.details}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => openWhatsApp(client.phone, client.name, types)}
                    className="h-9 px-3 bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-200">
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  {!isReplied && (
                    <button onClick={() => markAsRead(group)}
                      className="h-9 px-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-slate-200 transition-all">
                      <CheckCircle className="w-3.5 h-3.5" /> {isAr ? 'تم' : 'Lu'}
                    </button>
                  )}
                </div>
              </div>
              {/* Total */}
              <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-black">
                <span>{group.length} {isAr ? 'موديل' : 'modèle(s)'}</span>
                <span className="text-indigo-600">{totalQty} PCS {isAr ? 'مجموع' : 'total'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
