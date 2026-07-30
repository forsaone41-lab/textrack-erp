import React, { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { 
  Calculator, Printer, ArrowRight, TrendingUp, AlertTriangle, 
  CheckCircle2, DollarSign, Users, Clock, Scissors, Package, 
  ArrowLeft, ShoppingCart, ShieldAlert
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

interface AtelierCalculatorProps {
  isModal?: boolean;
  onClose?: () => void;
  onProceedToOrder?: (data: { modele: string; quantite: number; prix: number }) => void;
}

export default function AtelierCalculator({
  isModal = false,
  onClose,
  onProceedToOrder
}: AtelierCalculatorProps) {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();

  // Admin security check
  const [isAdmin, setIsAdmin] = useState(true);
  useEffect(() => {
    try {
      const s = localStorage.getItem('textrack_auth');
      const u = s ? JSON.parse(s) : null;
      const allowed = u?.role === 'admin' || u?.email === 'admin@beyacreative.com';
      setIsAdmin(allowed);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Form State (default values from original Atelier calculator)
  const [itemName, setItemName] = useState('SAK');
  const [quantity, setQuantity] = useState(1000);
  const [pricePerPiece, setPricePerPiece] = useState(1.50);
  
  const [workers, setWorkers] = useState(10);
  const [days, setDays] = useState(2);
  const [extraHours, setExtraHours] = useState(0);
  const [rate, setRate] = useState(17.10); // SMIG rate per hour
  
  const [materials, setMaterials] = useState(300);
  const [totalMachines, setTotalMachines] = useState(7);
  const [monthlyOther, setMonthlyOther] = useState(3000);

  if (!isAdmin) {
    if (isModal) {
      return (
        <div className="p-8 text-center text-rose-600 font-black">
          {isAr ? 'عذراً، هذه الحاسبة خاصة بمدير النظام (Admin) فقط.' : 'Accès réservé exclusivement aux administrateurs.'}
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  // Calculations
  const qty = Math.max(1, quantity || 1);
  const priceSale = pricePerPiece || 0;
  const totalPriceClient = qty * priceSale;

  const totalHoursPerWorker = (days * 8) + extraHours;
  const totalHoursInMonth = 26 * 8; // 208 hours
  const hourlyAtelierCost = monthlyOther / totalHoursInMonth;
  const costPerMachinePerHour = hourlyAtelierCost / Math.max(1, totalMachines || 1);
  const allocatedExpenses = costPerMachinePerHour * totalHoursPerWorker * workers;

  const totalLaborCost = (totalHoursPerWorker * rate) * workers;
  const realCost = totalLaborCost + materials + allocatedExpenses;
  const difference = totalPriceClient - realCost;
  const costPerPiece = realCost / qty;

  // Max Time Alert
  const revenueAvailableForTime = totalPriceClient - materials;
  const totalCostPerHourOfWork = (rate * workers) + (costPerMachinePerHour * workers);

  let alertMessage = '';
  let alertType: 'danger' | 'warning' = 'warning';
  let maxDaysAllowed = 0;
  let maxHoursAllowed = 0;

  if (revenueAvailableForTime <= 0) {
    alertMessage = isAr 
      ? "⚠️ راك خاسر غير فالسلعة! (ثمن السلعة كبر من أو كيسوى ثمن البيع)"
      : "⚠️ Perte directe sur matière première ! (Coût matière >= Prix de vente)";
    alertType = 'danger';
  } else if (totalCostPerHourOfWork > 0) {
    const maxTotalHoursPerWorker = revenueAvailableForTime / totalCostPerHourOfWork;
    maxDaysAllowed = Math.floor(maxTotalHoursPerWorker / 8);
    maxHoursAllowed = Math.floor(maxTotalHoursPerWorker % 8);
    alertMessage = isAr
      ? `⏱️ رد البال للروطار: أقصى وقت مسموح باش ماتخسرش هو ${maxDaysAllowed} أيام و ${maxHoursAllowed} ساعات (لكل عامل).`
      : `⏱️ Seuil limite avant perte : maximum ${maxDaysAllowed} jours et ${maxHoursAllowed}h (par ouvrier).`;
    alertType = 'warning';
  }

  const resultStatus = difference > 0 ? 'profit' : difference < 0 ? 'loss' : 'neutral';

  const handleCreateCommand = () => {
    if (onProceedToOrder) {
      onProceedToOrder({
        modele: itemName,
        quantite: qty,
        prix: priceSale
      });
    } else {
      navigate(`/commandes/manage?modele=${encodeURIComponent(itemName)}&quantite=${qty}&prix=${priceSale}`);
    }
  };

  const todayStr = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`w-full ${isModal ? 'max-h-[85vh] overflow-y-auto no-scrollbar p-2' : 'min-h-screen bg-slate-50/50 p-4 md:p-8'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Print styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #fff !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 2px solid #222 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm print-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isAr ? 'تقرير تكلفة الإنتاج والأرباح' : 'Calculateur de Rentabilité Atelier'}
                </h1>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Admin VIP
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1">{todayStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              {isAr ? 'طباعة / PDF' : 'Imprimer / PDF'}
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Result Card */}
        <div
          className={`p-6 md:p-8 rounded-3xl border-2 transition-all print-border ${
            resultStatus === 'profit'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : resultStatus === 'loss'
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 font-black text-xl md:text-2xl">
              {resultStatus === 'profit' ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="text-emerald-700">{isAr ? 'النتيجة: ربح ✔' : 'Résultat : Profit ✔'}</span>
                </>
              ) : resultStatus === 'loss' ? (
                <>
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                  <span className="text-rose-700">{isAr ? 'النتيجة: خسارة ✘' : 'Résultat : Perte ✘'}</span>
                </>
              ) : (
                <span>{isAr ? 'تعادل (لا ربح لا خسارة)' : 'Résultat Neutre'}</span>
              )}
            </div>

            <div
              className={`text-4xl md:text-6xl font-black ${
                resultStatus === 'profit' ? 'text-emerald-600' : resultStatus === 'loss' ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              {Math.abs(difference).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xl md:text-2xl font-bold">{isAr ? 'درهم' : 'DH'}</span>
            </div>

            <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl font-bold text-sm text-slate-800 shadow-sm">
              {isAr ? 'التكلفة الإجمالية للإنتاج:' : 'Coût total de production :'}{' '}
              <span className="font-black text-indigo-600">{realCost.toFixed(2)} {isAr ? 'درهم' : 'DH'}</span>
            </div>
          </div>

          {/* Cost breakdown 3 columns */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 pt-6 border-t border-black/10 text-center">
            <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5">
              <span className="text-xs font-bold text-slate-500 block mb-1">{isAr ? 'اليد العاملة:' : 'Main-d\'œuvre :'}</span>
              <strong className="text-base md:text-lg font-black text-slate-900">{totalLaborCost.toFixed(2)} {isAr ? 'درهم' : 'DH'}</strong>
            </div>
            <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5">
              <span className="text-xs font-bold text-slate-500 block mb-1">{isAr ? 'السلعة:' : 'Matière première :'}</span>
              <strong className="text-base md:text-lg font-black text-slate-900">{materials.toFixed(2)} {isAr ? 'درهم' : 'DH'}</strong>
            </div>
            <div className="bg-white/60 p-3.5 rounded-2xl border border-black/5">
              <span className="text-xs font-bold text-slate-500 block mb-1">{isAr ? 'نصيب الأتوليي:' : 'Frais d\'atelier :'}</span>
              <strong className="text-base md:text-lg font-black text-slate-900">{allocatedExpenses.toFixed(2)} {isAr ? 'درهم' : 'DH'}</strong>
            </div>
          </div>

          {/* Cost per piece badge */}
          <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-indigo-100 text-center text-indigo-700 font-bold text-sm">
            {isAr ? 'تكلفة البياسة الواحدة مقومة بـ:' : 'Coût unitaire par pièce :'}{' '}
            <span className="font-black text-indigo-900 text-lg">{costPerPiece.toFixed(2)} {isAr ? 'درهم' : 'DH'}</span>
          </div>
        </div>

        {/* Max Time Alert (Retard / Rotar) */}
        <div
          className={`p-4 rounded-2xl border font-bold text-sm flex items-center gap-3 print-border ${
            alertType === 'danger'
              ? 'bg-rose-100 border-rose-300 text-rose-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Clock className="w-6 h-6 shrink-0 text-amber-600" />
          <div>{alertMessage}</div>
        </div>

        {/* Forms Section */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 print-border">
          {/* Group 1: Order info */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Package className="w-4 h-4 text-indigo-600" />
              {isAr ? '📦 معلومات الطلبية والبيع' : '📦 Infos Commande et Vente'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'نوع البياسة / الموديل' : 'Article / Modèle'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(نص)' : '(texte)'}</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'الكمية' : 'Quantité'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(شحال من بياسة)' : '(pièces)'}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'ثمن البيع للبياسة الواحدة' : 'Prix de vente unitaire'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(درهم)' : '(DH)'}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePerPiece}
                  onChange={(e) => setPricePerPiece(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'الثمن الإجمالي للطلبية' : 'Prix total client'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(درهم)' : '(DH)'}</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={totalPriceClient.toFixed(2)}
                  className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-black text-sm text-center cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isAr ? 'كيتحسب بوحدو (الكمية × ثمن البياسة).' : 'Calculé automatiquement (Qté × Prix)'}
                </span>
              </div>
            </div>
          </div>

          {/* Group 2: Labor & Time */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Users className="w-4 h-4 text-indigo-600" />
              {isAr ? '👷 اليد العاملة والوقت' : '👷 Main-d\'œuvre & Temps'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'عدد العمال فهاد الطلبية' : 'Nombre d\'ouvriers'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(عامل)' : ''}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={workers}
                  onChange={(e) => setWorkers(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'شحال من نهار خدمو؟' : 'Jours travaillés'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(أيام)' : ''}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'ساعات إضافية' : 'Heures sup.'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(ساعات)' : ''}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={extraHours}
                  onChange={(e) => setExtraHours(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  {isAr ? 'ثمن الساعة للخدام' : 'Taux horaire'}
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black">SMIG</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Materials & Atelier */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Scissors className="w-4 h-4 text-indigo-600" />
              {isAr ? '🧵 السلعة ومصاريف الأتوليي' : '🧵 Matière & Frais d\'Atelier'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'ثمن القماش واللوازم (الإجمالي)' : 'Coût tissu & fournitures'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(درهم)' : '(DH)'}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={materials}
                  onChange={(e) => setMaterials(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'العدد الإجمالي لآلات الأتوليي' : 'Total machines atelier'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(ماكينة)' : ''}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalMachines}
                  onChange={(e) => setTotalMachines(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'مصاريف الشهر (الكرا، الضو...)' : 'Frais fixes mensuels'}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? '(درهم / شهر)' : '(DH/mois)'}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyOther}
                  onChange={(e) => setMonthlyOther(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-indigo-600 text-sm text-center focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 no-print">
          <button
            onClick={handleCreateCommand}
            className="flex-1 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-slate-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAr ? '✓ اعتماد الحساب وإطلاق الطلبية الآن' : '✓ Valider le calcul et créer la commande'}
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-6 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            {isAr ? 'طباعة تقرير PDF' : 'Imprimer PDF'}
          </button>

          {!isModal && (
            <button
              onClick={() => navigate('/commandes')}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase transition-all"
            >
              {isAr ? '← الرجوع للطلبيات' : '← Retour aux commandes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
