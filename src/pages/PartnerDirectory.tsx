import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, PackageSearch, MessageCircle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Affiliate } from '../types';
import { useLang } from '../contexts/LangContext';

const CATEGORY_LABELS: Record<string, { ar: string; fr: string }> = {
  tissu: { ar: 'أقمشة', fr: 'Tissus' },
  confection: { ar: 'تفصيل / خياطة', fr: 'Confection' },
  broderie: { ar: 'تطريز', fr: 'Broderie' },
  impression: { ar: 'طباعة', fr: 'Impression' },
  autre: { ar: 'أخرى', fr: 'Autre' },
};

export default function PartnerDirectory() {
  const { isAr, toggle } = useLang();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Affiliate[]>([]);
  const [ateliers, setAteliers] = useState<Affiliate[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('affiliates')
        .select('id, business_name, category, description, city, whatsapp, phone, tracks, status')
        .eq('status', 'approved')
        .overlaps('tracks', ['supplier', 'atelier']);
      const rows = (data as Affiliate[]) || [];
      setSuppliers(rows.filter(r => r.tracks?.includes('supplier')));
      setAteliers(rows.filter(r => r.tracks?.includes('atelier')));
      setLoading(false);
    })();
  }, []);

  const Card = ({ a }: { a: Affiliate }) => {
    const contact = (a.whatsapp || a.phone || '').replace(/\D/g, '');
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <h3 className="font-black text-slate-900 text-lg mb-1">{a.business_name}</h3>
        {a.category && (
          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-full mb-3">
            {CATEGORY_LABELS[a.category]?.[isAr ? 'ar' : 'fr'] || a.category}
          </span>
        )}
        {a.description && <p className="text-sm text-slate-600 mb-4">{a.description}</p>}
        <div className="flex items-center justify-between mt-4">
          {a.city && (
            <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" /> {a.city}
            </span>
          )}
          {contact && (
            <a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> {isAr ? 'تواصل عبر واتساب' : 'Contacter'}
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/partners" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform rotate-12">
              <span className="text-white font-black text-xl -rotate-12">B</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">BEYACREATIVE</span>
          </Link>
          <button onClick={toggle} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase">
            {isAr ? 'FR' : 'AR'}
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            {isAr ? 'دليل الشركاء' : 'Annuaire des partenaires'}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            {isAr ? 'موردون وورشات موثوقون داخل شبكة BEYA. تواصل معهم مباشرة عبر واتساب.' : 'Fournisseurs et ateliers de confiance du réseau BEYA. Contactez-les directement via WhatsApp.'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-5">
                <PackageSearch className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-black text-slate-900">{isAr ? 'الموردون والجملة' : 'Fournisseurs & Grossistes'}</h2>
              </div>
              {suppliers.length === 0 ? (
                <p className="text-sm text-slate-400 font-semibold">{isAr ? 'لا يوجد موردون بعد.' : 'Aucun fournisseur pour le moment.'}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {suppliers.map(a => <Card key={a.id} a={a} />)}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-5">
                <Factory className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-black text-slate-900">{isAr ? 'المعامل والورشات' : 'Ateliers & Usines'}</h2>
              </div>
              {ateliers.length === 0 ? (
                <p className="text-sm text-slate-400 font-semibold">{isAr ? 'لا توجد ورشات بعد.' : 'Aucun atelier pour le moment.'}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {ateliers.map(a => <Card key={a.id} a={a} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm mt-16 border-t border-slate-100">
        <p>© 2026 BEYACREATIVE Ecosystem. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
      </footer>
    </div>
  );
}
