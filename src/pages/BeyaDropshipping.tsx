import React, { useState } from 'react';
import { Package, TrendingUp, Filter, Search, Plus, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useLang } from '../hooks/useLang';

const DROPSHIPPING_PRODUCTS = [
  {
    id: 'd1',
    name: 'Veste de Chef Pro - Signature',
    nameAr: 'سترة طاهي احترافية - سيغناتشر',
    price: 150,
    suggestedPrice: 290,
    profit: 140,
    category: 'Vêtements de Travail',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80',
    sales: 1240,
    stock: 500,
    delivery: '24-48h'
  },
  {
    id: 'd2',
    name: 'Tablier Barista Premium en Cuir',
    nameAr: 'مئزر باريستا بريميوم جلد',
    price: 90,
    suggestedPrice: 199,
    profit: 109,
    category: 'Restauration',
    image: 'https://images.unsplash.com/photo-1599813083617-578b86d99723?auto=format&fit=crop&q=80',
    sales: 856,
    stock: 320,
    delivery: '24-48h'
  },
  {
    id: 'd3',
    name: 'T-shirt Oversize Streetwear',
    nameAr: 'تيشيرت أوفرسايز شبابي',
    price: 65,
    suggestedPrice: 149,
    profit: 84,
    category: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80',
    sales: 3400,
    stock: 1200,
    delivery: '24h'
  }
];

export default function BeyaDropshipping() {
  const { isAr } = useLang();
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState<string | null>(null);

  const handleImport = (id: string) => {
    setImporting(id);
    setTimeout(() => {
      setImporting(null);
      // In a real app, this would add the product to the user's StoreBuilder products list
      alert(isAr ? 'تمت إضافة المنتج إلى متجرك بنجاح!' : 'Produit ajouté à votre boutique avec succès !');
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen font-sans" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              BEYA <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Dropship Network</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            {isAr 
              ? 'كتالوج المنتجات الجاهزة للبيع بنظام الدروبشيبينغ. اختر، أضف لمتجرك، ونحن نتكفل بالباقي.' 
              : 'Catalogue de produits en dropshipping. Choisissez, importez dans votre boutique, nous gérons le reste.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {isAr ? 'ضمان التوصيل من BEYA' : 'Expédition garantie BEYA'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{isAr ? 'المنتجات المتاحة' : 'Produits Disponibles'}</div>
          <div className="text-2xl font-black text-slate-800">4,520</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{isAr ? 'متوسط هامش الربح' : 'Marge Moyenne'}</div>
          <div className="text-2xl font-black text-emerald-600">+120%</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{isAr ? 'وقت التوصيل' : 'Délai d\'expédition'}</div>
          <div className="text-2xl font-black text-slate-800">24-48h</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 rounded-2xl text-white shadow-lg flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-transform">
          <Zap className="w-6 h-6 mb-1" />
          <div className="font-bold text-center">{isAr ? 'ارتقِ إلى Pro' : 'Passer à PRO'}</div>
          <div className="text-xs text-white/70 text-center">{isAr ? 'منتجات حصرية' : 'Produits exclusifs'}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 left-4 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={isAr ? 'ابحث عن منتج (تيشيرت، سترة...)' : 'Rechercher un produit...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            {isAr ? 'فلتر' : 'Filtrer'}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DROPSHIPPING_PRODUCTS.map((prod) => (
          <div key={prod.id} className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-700 z-10">
                {prod.category}
              </div>
              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {prod.sales} {isAr ? 'مبيع' : 'ventes'}
              </div>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-4">{isAr ? prod.nameAr : prod.name}</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isAr ? 'تكلفة المنتج' : 'Coût BEYA'}</div>
                <div className="text-lg font-black text-slate-700">{prod.price} <span className="text-xs">MAD</span></div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">{isAr ? 'الربح المتوقع' : 'Marge Estimée'}</div>
                <div className="text-lg font-black text-emerald-700">+{prod.profit} <span className="text-xs">MAD</span></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleImport(prod.id)}
                disabled={importing === prod.id}
                className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20 disabled:opacity-50"
              >
                {importing === prod.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {isAr ? 'إضافة إلى متجري' : 'Importer au Store'}
                  </>
                )}
              </button>
              <button className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl flex items-center justify-center transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
