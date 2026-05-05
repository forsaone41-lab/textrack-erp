import { useState, useEffect } from 'react';
import { 
  Bell, UserPlus, Package, AlertCircle, CreditCard, Clock, 
  Search, Trash2, Filter, CheckCircle2, ChevronRight, Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { loadData, saveRecord, Lead, Commande, Facture } from '../types';

interface Notification {
  id: string;
  type: 'client' | 'production' | 'problem' | 'payment' | 'recrutement';
  title: { fr: string; ar: string };
  message: { fr: string; ar: string };
  time: string;
  date: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  targetUrl?: string;
}

export default function Notifications() {
  const { isAr, lang } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [leads, cmds, facts] = await Promise.all([
          loadData<Lead>('leads'),
          loadData<Commande>('commandes'),
          loadData<Facture>('factures')
        ]);

        const all: Notification[] = [];

        // 1. Leads
        (leads || []).forEach(l => {
          const isRecrutement = l.type.includes('RECRUTEMENT');
          all.push({
            id: `lead-${l.id}`,
            type: isRecrutement ? 'recrutement' : 'client',
            title: isRecrutement 
              ? { fr: 'Nouvelle Candidature', ar: 'طلب عمل جديد' }
              : { fr: 'Nouveau Prospect', ar: 'طلب زبون جديد' },
            message: { 
              fr: `${l.name} (${l.ville}) - ${l.type}`, 
              ar: `${l.name} (${l.ville}) - ${l.type}` 
            },
            time: new Date(l.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(l.date),
            read: l.status !== 'new',
            priority: 'high',
            targetUrl: '/demandes'
          });
        });

        // 2. Orders (Delayed)
        const today = new Date();
        (cmds || []).forEach(c => {
          const echeance = new Date(c.dateLivraisonPrevue);
          const isLate = echeance < today && c.statut !== 'livré' && c.statut !== 'terminé';
          
          if (isLate) {
            all.push({
              id: `cmd-${c.id}`,
              type: 'problem',
              title: { fr: 'Retard Production', ar: 'تأخر في الإنتاج' },
              message: { 
                fr: `La commande ${c.reference} (${c.client}) est en retard.`, 
                ar: `الطلبية ${c.reference} (${c.client}) متأخرة.` 
              },
              time: 'Urgent',
              date: echeance,
              read: false,
              priority: 'high',
              targetUrl: '/commandes'
            });
          }
        });

        // 3. Payments
        (facts || []).forEach(f => {
          if (f.statut === 'impayée') {
            all.push({
              id: `fact-${f.id}`,
              type: 'payment',
              title: { fr: 'Facture en attente', ar: 'فاتورة في الانتظار' },
              message: { 
                fr: `Facture ${f.numero} - ${f.client} (${f.montant} DH)`, 
                ar: `فاتورة ${f.numero} - ${f.client} (${f.montant} درهم)` 
              },
              time: 'Paym.',
              date: new Date(f.date),
              read: false,
              priority: 'medium',
              targetUrl: '/factures'
            });
          }
        });

        setNotifications(all.sort((a, b) => b.date.getTime() - a.date.getTime()));
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filtered = notifications.filter(n => {
    const matchesFilter = filter === 'all' || n.type === filter;
    const matchesSearch = n.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.message[lang].toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAllRead = async () => {
    const unreadLeads = notifications.filter(n => !n.read && n.id.startsWith('lead-'));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    for (const n of unreadLeads) {
      const leadId = n.id.replace('lead-', '');
      try {
        await saveRecord('leads', { id: leadId, status: 'processed' }, true);
      } catch (e) {
        console.error("Failed to persist markAllRead for lead:", leadId, e);
      }
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (id.startsWith('lead-')) {
      const leadId = id.replace('lead-', '');
      try {
        await saveRecord('leads', { id: leadId, status: 'processed' }, true);
      } catch (e) {
        console.error("Failed to persist markAsRead for lead:", leadId, e);
      }
    }
  };

  const removeNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (id.startsWith('lead-')) {
      const leadId = id.replace('lead-', '');
      try {
        await saveRecord('leads', { id: leadId, status: 'processed' }, true);
      } catch (e) {
        console.error("Failed to persist removal for lead:", leadId, e);
      }
    }
  };

  return (
    <div className={`space-y-8 pb-10 ${isAr ? 'text-right' : ''}`}>
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 p-8 shadow-2xl shadow-indigo-100/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {isAr ? 'سجل الإشعارات' : 'Historique des Notifications'}
              </h1>
              <p className="text-sm font-bold text-slate-500 mt-1">
                {isAr ? 'مراجعة جميع التنبيهات والطلبات الواردة' : 'Consultez toutes les alertes et demandes reçues'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={markAllRead}
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
             >
               {isAr ? 'تحديد الكل كمقروء' : 'Tout marquer lu'}
             </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder={isAr ? 'بحث فـ الإشعارات...' : 'Rechercher dans les notifications...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-white rounded-2xl border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold outline-none shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'client', 'recrutement', 'problem', 'payment'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
              }`}
            >
              {f === 'all' ? (isAr ? 'الكل' : 'Tous') : 
               f === 'client' ? (isAr ? 'زبائن' : 'Clients') :
               f === 'recrutement' ? (isAr ? 'توظيف' : 'Recrutement') :
               f === 'problem' ? (isAr ? 'مشاكل' : 'Problèmes') :
               (isAr ? 'أداءات' : 'Paiements')}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-indigo-100/20">
        {loading ? (
          <div className="py-20 text-center">
             <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'جاري التحميل...' : 'Chargement...'}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filtered.map((n) => (
              <div 
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.targetUrl) navigate(n.targetUrl);
                }}
                className={`group py-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50/50 transition-all px-4 rounded-3xl cursor-pointer ${!n.read ? 'bg-indigo-50/20' : ''}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  n.type === 'client' || n.type === 'recrutement' ? 'bg-emerald-50 text-emerald-600' :
                  n.type === 'payment' ? 'bg-rose-50 text-rose-600' :
                  n.type === 'production' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {(n.type === 'client' || n.type === 'recrutement') && <UserPlus className="w-7 h-7" />}
                  {n.type === 'payment' && <CreditCard className="w-7 h-7" />}
                  {n.type === 'problem' && <AlertCircle className="w-7 h-7" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{n.title[lang]}</h3>
                    {!n.read && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{n.message[lang]}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                      <Clock className="w-3 h-3" /> {n.date.toLocaleDateString()} {n.time}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      n.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {n.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {n.targetUrl && (
                    <button 
                      onClick={() => navigate(n.targetUrl!)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeNotification(n.id)}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">
              {isAr ? 'لا توجد إشعارات' : 'Aucune notification'}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              {isAr ? 'سجلك نظيف تماماً!' : 'Votre historique est vide.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
