import React, { useState, useEffect } from 'react';
import { Bell, X, UserPlus, Package, AlertCircle, CreditCard, Clock, CheckCircle2, RotateCw, Globe } from 'lucide-react';
import { useLang } from '../../contexts/LangContext';
import { loadData, Lead, Commande, Facture } from '../../types';

interface Notification {
  id: string;
  type: 'client' | 'production' | 'problem' | 'payment' | 'recrutement';
  title: { fr: string; ar: string };
  message: { fr: string; ar: string };
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationCenter() {
  const { isAr, lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const [leads, cmds, facts] = await Promise.all([
          loadData<Lead>('leads'),
          loadData<Commande>('commandes'),
          loadData<Facture>('factures')
        ]);

        const newNotifications: Notification[] = [];

        // 1. New Leads / Recruitment
        (leads || []).filter(l => l.status === 'new').forEach(l => {
          const isRecrutement = l.type.includes('RECRUTEMENT');
          newNotifications.push({
            id: `lead-${l.id}`,
            type: isRecrutement ? 'recrutement' : 'client',
            title: isRecrutement 
              ? { fr: 'Nouvelle Candidature', ar: 'طلب عمل جديد' }
              : { fr: 'Nouveau Prospect', ar: 'طلب زبون جديد' },
            message: { 
              fr: `${l.name} (${l.ville}) - ${l.type}`, 
              ar: `${l.name} (${l.ville}) - ${l.type}` 
            },
            time: new Date(l.date).toLocaleDateString(),
            read: false,
            priority: 'high'
          });
        });

        // 2. Orders needing attention (e.g. late)
        const today = new Date();
        (cmds || []).filter(c => c.statut !== 'livré' && c.statut !== 'terminé').forEach(c => {
          const echeance = new Date(c.dateLivraisonPrevue);
          if (echeance < today) {
            newNotifications.push({
              id: `cmd-${c.id}`,
              type: 'problem',
              title: { fr: 'Retard Production', ar: 'تأخر في الإنتاج' },
              message: { 
                fr: `La commande ${c.reference} (${c.client}) a dépassé la date de livraison.`, 
                ar: `الطلبية ${c.reference} (${c.client}) تجاوزت موعد التسليم.` 
              },
              time: 'Urgent',
              read: false,
              priority: 'high'
            });
          }
        });

        // 3. Unpaid Invoices
        (facts || []).filter(f => f.statut === 'impayée').forEach(f => {
          newNotifications.push({
            id: `fact-${f.id}`,
            type: 'payment',
            title: { fr: 'Facture Impayée', ar: 'فاتورة غير مؤداة' },
            message: { 
              fr: `La facture ${f.numero} de ${f.client} (${f.montant} DH) est en attente.`, 
              ar: `الفاتورة ${f.numero} لـ ${f.client} (${f.montant} درهم) لم تُؤدى بعد.` 
            },
            time: 'Aujourd\'hui',
            read: false,
            priority: 'medium'
          });
        });

        setNotifications(newNotifications.sort((a, b) => a.priority === 'high' ? -1 : 1));
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95 relative"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-200 z-[200]">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    {isAr ? 'الإشعارات' : 'Notifications'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {unreadCount} {isAr ? 'غير مقروءة' : 'non lues'}
                  </p>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                  title="Rafraîchir"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
             </div>
             <button onClick={markAllRead} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">
               {isAr ? 'تحديد الكل كمقروء' : 'Tout marquer lu'}
             </button>
          </div>

          {/* Push Notification Toggle - Only show if not already granted */}
          {('Notification' in window && Notification.permission !== 'granted') && (
            <div className="px-6 py-3 bg-indigo-600/5 border-b border-indigo-100/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                  {isAr ? 'إشعارات الهاتف' : 'Notifications Phone'}
                </span>
              </div>
              <button 
                onClick={async () => {
                  const permission = await Notification.requestPermission();
                  if (permission === 'granted') {
                    alert(isAr ? 'تم تفعيل الإشعارات بنجاح! ✅' : 'Notifications activées avec succès ! ✅');
                    // Force a re-render to hide the button
                    window.location.reload();
                  } else {
                    alert(isAr ? 'يجب السماح بالإشعارات من إعدادات المتصفح.' : 'Veuillez autoriser les notifications dans les paramètres.');
                  }
                }}
                className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-[9px] font-black text-indigo-600 uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                {isAr ? 'تفعيل الآن' : 'Activer Maintenant'}
              </button>
            </div>
          )}

          <div className="max-h-[450px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <RotateCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'جاري التحميل...' : 'Chargement...'}</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-6 flex gap-4 hover:bg-slate-50 transition-colors relative group cursor-pointer ${!n.read ? 'bg-indigo-50/20' : ''}`}
                  >
                    {!n.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      n.type === 'client' || n.type === 'recrutement' ? 'bg-emerald-50 text-emerald-600' :
                      n.type === 'payment' ? 'bg-rose-50 text-rose-600' :
                      n.type === 'production' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {(n.type === 'client' || n.type === 'recrutement') && <UserPlus className="w-5 h-5" />}
                      {n.type === 'payment' && <CreditCard className="w-5 h-5" />}
                      {n.type === 'production' && <Package className="w-5 h-5" />}
                      {n.type === 'problem' && <AlertCircle className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{n.title[lang === 'ar' ? 'ar' : 'fr']}</span>
                         <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {n.message[lang === 'ar' ? 'ar' : 'fr']}
                      </p>
                    </div>

                    <button 
                      onClick={() => removeNotification(n.id)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-200" />
                 </div>
                 <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                   {isAr ? 'لا توجد إشعارات جديدة' : 'Aucune notification'}
                 </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <button className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors">
               {isAr ? 'عرض كل السجل' : 'Voir tout l\'historique'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
