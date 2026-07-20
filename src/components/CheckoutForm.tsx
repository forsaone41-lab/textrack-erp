import React, { useState } from 'react';
import { ShieldCheck, Truck, Banknote, AlertCircle, CheckCircle } from 'lucide-react';

const moroccanCities = [
  "Casablanca", "Rabat", "Fès", "Tanger", "Marrakech", "Salé", "Meknès", "Oujda", 
  "Kénitra", "Agadir", "Tétouan", "Témara", "Safi", "Mohammédia", "Khouribga", 
  "El Jadida", "Béni Mellal", "Nador", "Taza", "Settat", "Laayoune", "Dakhla"
];

export default function CheckoutForm({ storeIsAr, onSubmit, product, quantity, disabled }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '' });
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone: string) => {
    // Basic Moroccan phone validation: starts with 05, 06, or 07 and is exactly 10 digits
    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      setPhoneError(storeIsAr ? 'رقم الهاتف غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 05، 06، أو 07' : 'Numéro invalide. Doit contenir 10 chiffres et commencer par 05, 06 ou 07.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!validatePhone(formData.phone)) return;
    if (!formData.name || !formData.city || !formData.address) return;
    
    onSubmit(product, quantity, formData);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'الاسم الكامل *' : 'Nom Complet *'}</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder={storeIsAr ? 'الاسم الكامل' : 'Ex: Mohammed Alaoui'} 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'رقم الهاتف *' : 'Numéro de Téléphone *'}</label>
          <input 
            type="tel" 
            required
            value={formData.phone}
            onChange={(e) => {
              setFormData({...formData, phone: e.target.value});
              if (phoneError) setPhoneError('');
            }}
            placeholder="06 12 34 56 78" 
            className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all ${phoneError ? 'border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`} 
          />
          {phoneError && <p className={`text-rose-500 text-xs font-bold mt-1.5 flex items-center gap-1 ${storeIsAr ? 'flex-row-reverse text-right' : ''}`}><AlertCircle className="w-3 h-3" /> {phoneError}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'المدينة *' : 'Ville *'}</label>
          <input 
            type="text" 
            required
            list="cities-list"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder={storeIsAr ? 'اختر أو اكتب مدينتك' : 'Sélectionnez ou tapez votre ville'} 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
          />
          <datalist id="cities-list">
            {moroccanCities.map((city, idx) => (
              <option key={idx} value={city} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{storeIsAr ? 'عنوان التوصيل *' : 'Adresse de Livraison *'}</label>
          <input 
            type="text" 
            required
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder={storeIsAr ? 'عنوان التوصيل بالتفصيل' : 'Adresse complète (Quartier, Rue...)'} 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" 
          />
        </div>

        <button 
          type="submit" 
          disabled={disabled || !formData.name || !formData.phone || !formData.city || !formData.address} 
          className={`w-full py-4 mt-6 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <CheckCircle className="w-4 h-4" />
          {storeIsAr ? 'تأكيد الطلب' : 'Confirmer la Commande'}
        </button>
      </form>

      {/* Trust Badges */}
      <div className={`mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 ${storeIsAr ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{storeIsAr ? 'ضمان الجودة' : 'Garantie'}</h5>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">{storeIsAr ? 'رضاكم مضمون 100%' : 'Satisfaction 100% garantie'}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{storeIsAr ? 'توصيل سريع' : 'Livraison Rapide'}</h5>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">{storeIsAr ? 'في غضون 24-48 ساعة' : 'Expédition sous 24-48h'}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{storeIsAr ? 'الدفع عند الاستلام' : 'Paiement Sécurisé'}</h5>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">{storeIsAr ? 'ادفع نقداً عند الاستلام' : 'Paiement à la livraison'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
