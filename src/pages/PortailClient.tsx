import { useState, useEffect } from 'react';
import { Search, Package, CircleCheck, Clock, Truck, Globe, Bell, Receipt } from 'lucide-react';
import {
  Commande, Facture, loadData, PHASE_LABELS, PHASE_ORDER, PHASE_COLORS, User, CompanyProfile, loadCompanyProfile
} from '../types';
import { useLang } from '../contexts/LangContext';
import { printElement } from '../utils/pdf';
import { InvoicePRO } from '../components/InvoicePRO';
import { Download } from 'lucide-react';

interface PortailClientProps {
  currentUser?: User | null;
  onLogout?: () => void;
}

export default function PortailClient({ currentUser, onLogout }: PortailClientProps) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [reference, setReference] = useState('');
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<Commande[]>([]);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [company] = useState<CompanyProfile>(loadCompanyProfile());
  const { isAr, toggle } = useLang();

  // Helper for translating phase names
  const phaseAr: Record<string, string> = { coupe: 'الفصالة', montage: 'الخياطة', finition: 'الفينيسيون', repassage: 'المصلوح', livré: 'تسلّمات' };

  useEffect(() => {
    Promise.all([
      loadData<Commande>('commandes'),
      loadData<Facture>('factures')
    ]).then(([allCommandes, allFactures]) => {
      setCommandes(allCommandes);
      setFactures(allFactures);

      // If a client is logged in, show their orders automatically
      if (currentUser?.role === 'client') {
        const myCommandes = allCommandes.filter(c =>
          c.client.toLowerCase() === currentUser.nom.toLowerCase()
        );
        setFound(myCommandes);
        setSearched(true);
      }
    });
  }, [currentUser]);

  function handleSearch() {
    setSearched(true);
    const results = commandes.filter(c =>
      c.reference.toLowerCase() === reference.toLowerCase() ||
      c.client.toLowerCase().includes(reference.toLowerCase())
    );
    setFound(results);
  }

  function getPhaseIndex(phase: string): number {
    return PHASE_ORDER.indexOf(phase as any);
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">{isAr ? 'بوابة بيا كرياتيف' : 'Beya Creative Portal'}</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{isAr ? 'فضاء الزبون' : 'Espace Client Premium'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition text-xs font-bold">
              <Globe className="w-4 h-4" />
              {isAr ? 'FR' : 'عربية'}
            </button>
            {currentUser && (
              <div className="hidden sm:flex items-center gap-3 bg-white shadow-sm rounded-full px-4 py-1.5 border border-slate-200">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700">{currentUser.nom[0]}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">{currentUser.nom}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">{isAr ? 'الزبون' : 'Client'}</span>
                {onLogout && (
                  <button onClick={onLogout} className="text-xs text-red-500 hover:text-red-700 font-bold ml-1 transition">
                    {isAr ? 'خروج' : 'Déconnexion'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 mb-12 shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-24 -mb-24 blur-2xl" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-3">
                  {currentUser ? (isAr ? `مرحباً، ${currentUser.nom} !` : `Bienvenue, ${currentUser.nom} !`) : (isAr ? 'تتبع الطلبية' : 'Suivi de Production')}
                </h2>
                <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">
                  {isAr
                    ? 'فرحانين حيت خدامين معاك. تبع سلعتك فين وصلات بكل التفاصيل و فاي وقت.'
                    : "Nous sommes ravis de vous accompagner. Suivez l'avancement de vos commandes en temps réel et restez informé de chaque étape de fabrication."}
                </p>
              </div>

              {/* Notification Toggle */}
              {currentUser?.role === 'client' && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notifsEnabled ? 'bg-indigo-500 text-white' : 'bg-white/20 text-indigo-200'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{isAr ? 'إشعارات الإيميل' : 'Notifications Email'}</p>
                    <p className="text-indigo-200 text-xs">{isAr ? 'توصل بالجديد فكل مرحلة' : 'Recevoir des alertes'}</p>
                  </div>
                  <button
                    onClick={() => setNotifsEnabled(!notifsEnabled)}
                    className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifsEnabled ? 'bg-emerald-400' : 'bg-white/30'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifsEnabled ? (isAr ? '-translate-x-6' : 'translate-x-6') : (isAr ? '-translate-x-1' : 'translate-x-1')}`} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">{isAr ? 'الحالة' : 'Status'}</p>
                <p className="text-white text-sm font-semibold">{isAr ? 'الإنتاج خدام' : 'Production Active'}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">{isAr ? 'آخر تحديث' : 'Dernière Mise à Jour'}</p>
                <p className="text-white text-sm font-semibold">{isAr ? 'اليوم' : "Aujourd'hui"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        {currentUser?.role !== 'client' && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{isAr ? 'تتبع الطلبية' : 'Suivi de Commande'}</h2>
            <p className="text-slate-500 mb-8">{isAr ? 'دخل رقم الطلبية ديالك باش تشوف فين وصلات' : 'Entrez votre référence de commande pour voir où en est votre production'}</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  placeholder="Ex: CMD-2024-001"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm`}
                />
              </div>
              <button onClick={handleSearch}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm shadow-sm">
                {isAr ? 'قلّب' : 'Rechercher'}
              </button>
            </div>
          </div>
        )}

        {currentUser?.role === 'client' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{isAr ? 'الطلبيات ديالي' : 'Mes Commandes'}</h2>
            <p className="text-slate-500 text-sm">{isAr ? `عندك ${found.length} طلبية` : `Vous avez ${found.length} commande(s) en cours ou livrée(s)`}</p>
          </div>
        )}

        {/* Results */}
        {searched && found.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-500">{isAr ? 'مالقينا حتى طلبية' : 'Aucune commande trouvée'}</p>
            <p className="text-sm text-slate-400 mt-1">{isAr ? 'تأكد من الرقم و عاود' : 'Vérifiez la référence et réessayez'}</p>
          </div>
        )}

        {found.map(cmd => {
          const currentPhaseIdx = getPhaseIndex(cmd.phase);
          const isDelivered = cmd.statut === 'livré';
          const isLate = !isDelivered && new Date(cmd.dateLivraisonPrevue) < new Date();
          const daysRemaining = Math.ceil((new Date(cmd.dateLivraisonPrevue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const cmdFacture = factures.find(f => f.commandeId === cmd.id);

          return (
            <div key={cmd.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg mb-6 overflow-hidden">
              {/* Command Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-xs uppercase tracking-wider">{isAr ? 'طلبية' : 'Commande'}</p>
                    <h3 className="text-2xl font-bold mt-1">{cmd.reference}</h3>
                  </div>
                  <div className={`text-${isAr ? 'left' : 'right'}`}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isDelivered ? 'bg-green-500/20 text-green-200' : isLate ? 'bg-red-500/20 text-red-200' : 'bg-white/20 text-white'
                      }`}>
                      {isDelivered ? <CircleCheck className="w-4 h-4" /> : isLate ? <Clock className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      {isDelivered ? (isAr ? 'تسلّمات' : 'Livré') : isLate ? (isAr ? 'معطلة' : 'En retard') : (isAr ? 'فالإنتاج' : 'En production')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-indigo-200 text-xs">{isAr ? 'الزبون' : 'Client'}</p>
                    <p className="font-medium">{cmd.client}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-xs">{isAr ? 'الموديل' : 'Modèle'}</p>
                    <p className="font-medium">{cmd.modele}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-xs">{isAr ? 'الكمية' : 'Quantité'}</p>
                    <p className="font-medium">{cmd.quantite} {isAr ? 'قطعة' : 'pièces'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-6">{isAr ? 'فين وصلات السلعة' : 'Progression de Production'}</h4>
                <div className="relative">
                  {/* Progress Bar Background */}
                  <div className={`absolute top-5 left-5 right-5 h-1 bg-slate-200 rounded-full ${isAr ? 'transform scale-x-[-1]' : ''}`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(currentPhaseIdx / (PHASE_ORDER.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Phase Steps */}
                  <div className="flex justify-between relative">
                    {PHASE_ORDER.map((phase, idx) => {
                      const isComplete = idx < currentPhaseIdx || isDelivered;
                      const isCurrent = idx === currentPhaseIdx && !isDelivered;
                      return (
                        <div key={phase} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10 ${isComplete
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                            : isCurrent
                              ? `${PHASE_COLORS[phase]} text-white shadow-lg ring-4 ring-indigo-100`
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}>
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <p className={`text-xs mt-2 font-medium text-center ${isComplete ? 'text-green-600' : isCurrent ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                            {isAr ? phaseAr[phase] : PHASE_LABELS[phase]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline details */}
                {cmd.suivi.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">{isAr ? 'التفاصيل' : 'Historique détaillé'}</h4>
                    <div className="space-y-3">
                      {cmd.suivi.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${PHASE_COLORS[s.phase]}`} />
                          <div>
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">{isAr ? phaseAr[s.phase] : PHASE_LABELS[s.phase]}</span>
                              <span className="text-slate-400 mx-2">·</span>
                              <span className="text-slate-500" dir="ltr">{s.date}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery info */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">{isAr ? 'تاريخ الطلب' : 'Date de commande'}</p>
                      <p className="text-sm font-medium text-slate-700" dir="ltr">{cmd.dateCommande}</p>
                    </div>
                    <div className={`text-${isAr ? 'left' : 'right'}`}>
                      <p className="text-xs text-slate-400">{isAr ? 'التسليم المتوقع' : 'Livraison prévue'}</p>
                      <div className={`flex items-center gap-2 mt-0.5 ${isAr ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                        <p className={`text-sm font-medium ${isLate ? 'text-red-600' : 'text-slate-700'}`} dir="ltr">
                          {cmd.dateLivraisonPrevue}
                        </p>
                        {!isDelivered && (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isLate ? 'bg-red-100 text-red-600' :
                              daysRemaining <= 3 ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                            {isLate ? (isAr ? 'تعطلات' : 'Retard') : `J-${daysRemaining}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice info */}
                {cmdFacture && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      {isAr ? 'الفاتورة الخاصة بالطلبية' : 'Facture associée'}
                    </h4>
                    <div className="bg-emerald-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-100">
                      <div className="flex-1">
                        <p className="text-xs text-emerald-600/70 uppercase font-bold tracking-wider mb-1">{isAr ? 'رقم الفاتورة' : 'N° Facture'}</p>
                        <p className="font-bold text-emerald-900">{cmdFacture.numero}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-emerald-600/70 uppercase font-bold tracking-wider mb-1">{isAr ? 'المبلغ الإجمالي' : 'Montant Total'}</p>
                        <p className="font-black text-emerald-700 text-lg">{cmdFacture.montant?.toLocaleString()} MAD</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center sm:items-end">
                        <p className="text-xs text-emerald-600/70 uppercase font-bold tracking-wider mb-1">{isAr ? 'حالة الأداء' : 'Statut Paiement'}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cmdFacture.statut === 'payée' ? 'bg-emerald-200 text-emerald-800' :
                            cmdFacture.statut === 'impayée' ? 'bg-red-200 text-red-800' :
                              'bg-amber-200 text-amber-800'
                          }`}>
                          {cmdFacture.statut === 'payée' ? (isAr ? 'مخلصة' : 'Payée') :
                            cmdFacture.statut === 'impayée' ? (isAr ? 'مامخلصاش' : 'Impayée') :
                              (isAr ? 'فالانتظار' : 'En attente')}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                         <button 
                           onClick={() => { setSelectedFacture(cmdFacture); setShowInvoiceView(true); }}
                           className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition shadow-md shadow-emerald-100"
                         >
                           <Download className="w-3.5 h-3.5" />
                           {isAr ? 'تحميل' : 'Télécharger'}
                         </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}


      </div>

      {/* Floating Help Button */}
      {currentUser?.role === 'client' && (
        <a
          href="https://wa.me/212600000000"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-105 group flex items-center gap-2 z-50"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
          <span className="hidden group-hover:inline-block font-semibold text-sm whitespace-nowrap">{isAr ? 'محتاج مساعدة ؟' : "Besoin d'aide ?"}</span>
        </a>
      )}

      {/* Invoice Preview Modal for Client */}
      {showInvoiceView && selectedFacture && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{isAr ? 'معاينة الفاتورة' : 'Aperçu de la Facture'}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowInvoiceView(false)} className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">{isAr ? 'إغلاق' : 'Fermer'}</button>
                <button 
                  onClick={() => printElement(`client-invoice-view-${selectedFacture.id}`)}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest"
                >
                  <Download className="w-4 h-4" /> {isAr ? 'حفظ / طباعة' : 'Enregistrer / Imprimer'}
                </button>
              </div>
            </div>

            <div className="p-12 bg-slate-50/50">
               <InvoicePRO 
                 id={`client-invoice-view-${selectedFacture.id}`}
                 facture={selectedFacture}
                 commande={commandes.find(c => c.id === selectedFacture.commandeId)}
                 company={company}
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
