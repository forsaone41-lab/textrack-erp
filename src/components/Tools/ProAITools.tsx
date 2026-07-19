import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Search, TrendingUp, DollarSign, Target, Zap, ChevronRight, Crown } from 'lucide-react';

export default function ProAITools({ onBack, storeIsAr }: any) {
   const [activeTab, setActiveTab] = useState<'niche'|'pricing'|'trends'>('niche');
   const [searchQuery, setSearchQuery] = useState('');
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [results, setResults] = useState<any>(null);

   const handleAnalyze = () => {
      if (!searchQuery) return;
      setIsAnalyzing(true);
      setResults(null);
      
      // Mock AI Analysis delay
      setTimeout(() => {
         setIsAnalyzing(false);
         if (activeTab === 'niche') {
            setResults({
               title: storeIsAr ? 'تحليل التخصص (Niche)' : 'Analyse de Niche',
               score: 85,
               competition: 'Medium',
               demand: 'High',
               suggestions: [
                  storeIsAr ? 'ملابس الشارع (Streetwear) بلمسة مغربية' : 'Streetwear avec une touche marocaine',
                  storeIsAr ? 'عبايات عصرية للاستخدام اليومي' : 'Abayas modernes pour usage quotidien',
                  storeIsAr ? 'ملابس رياضية صديقة للبيئة' : 'Vêtements de sport éco-responsables'
               ]
            });
         } else if (activeTab === 'pricing') {
            setResults({
               title: storeIsAr ? 'تحليل الأسعار' : 'Analyse de Prix',
               averagePrice: '250 MAD - 400 MAD',
               recommendedPrice: '299 MAD',
               competitors: [
                  { name: 'Concurrent A', price: '350 MAD', quality: 'Premium' },
                  { name: 'Concurrent B', price: '200 MAD', quality: 'Standard' }
               ],
               margin: '45%'
            });
         } else {
            setResults({
               title: storeIsAr ? 'التريندات الحالية في المغرب' : 'Tendances Actuelles au Maroc',
               trends: [
                  { name: storeIsAr ? 'أطقم الكتان لفصل الصيف' : 'Ensembles en lin pour l\'été', growth: '+120%' },
                  { name: storeIsAr ? 'هوديز (Oversized) بتصاميم عربية' : 'Hoodies Oversized avec calligraphie', growth: '+85%' },
                  { name: storeIsAr ? 'حقائب قماشية (Tote bags)' : 'Tote bags personnalisés', growth: '+60%' }
               ]
            });
         }
      }, 2000);
   };

   return (
      <div className={`max-w-5xl mx-auto w-full space-y-8 ${storeIsAr ? 'text-right' : 'text-left'}`}>
         {/* Header */}
         <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
               <ArrowLeft className={`w-5 h-5 text-slate-600 ${storeIsAr ? 'rotate-180' : ''}`} />
            </button>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-slate-900">{storeIsAr ? 'المساعد الذكي PRO' : 'Assistant IA PRO'}</h1>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                     <Crown className="w-3 h-3" /> PRO
                  </span>
               </div>
               <p className="text-slate-500 text-sm">{storeIsAr ? 'حلل السوق، ابحث عن المنتجات المربحة، وسعر منتجاتك بذكاء.' : 'Analysez le marché, trouvez des produits rentables et fixez vos prix intelligemment.'}</p>
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
               <button onClick={() => setActiveTab('niche')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all ${activeTab === 'niche' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'}`}>
                  <Target className="w-5 h-5" />
                  {storeIsAr ? 'مكتشف التخصص (Niche)' : 'Chercheur de Niche'}
               </button>
               <button onClick={() => setActiveTab('pricing')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all ${activeTab === 'pricing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'}`}>
                  <DollarSign className="w-5 h-5" />
                  {storeIsAr ? 'محلل الأسعار' : 'Analyseur de Prix'}
               </button>
               <button onClick={() => setActiveTab('trends')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all ${activeTab === 'trends' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'}`}>
                  <TrendingUp className="w-5 h-5" />
                  {storeIsAr ? 'رادار التريندات' : 'Radar des Tendances'}
               </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
               <div className="mb-8">
                  <h2 className="text-xl font-black text-slate-900 mb-2">
                     {activeTab === 'niche' && (storeIsAr ? 'اكتشف مجالات مربحة وجديدة' : 'Découvrez des niches rentables')}
                     {activeTab === 'pricing' && (storeIsAr ? 'حلل أسعار منافسيك' : 'Analysez les prix de vos concurrents')}
                     {activeTab === 'trends' && (storeIsAr ? 'ماذا يباع الآن في المغرب؟' : 'Que se vend-il maintenant au Maroc ?')}
                  </h2>
                  <p className="text-slate-500 text-sm">
                     {storeIsAr ? 'أدخل كلمة مفتاحية (مثال: ملابس الشارع، عبايات، هودي) وسيقوم الذكاء الاصطناعي بالباقي.' : 'Entrez un mot-clé (ex: Streetwear, Abayas, Hoodie) et l\'IA fera le reste.'}
                  </p>
               </div>

               <div className="flex gap-4 mb-8">
                  <div className="relative flex-1">
                     <Search className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${storeIsAr ? 'right-4' : 'left-4'}`} />
                     <input 
                        type="text" 
                        placeholder={storeIsAr ? 'ماذا تريد أن تبيع؟' : 'Que voulez-vous vendre ?'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${storeIsAr ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                     />
                  </div>
                  <button onClick={handleAnalyze} disabled={isAnalyzing || !searchQuery} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     {isAnalyzing ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           {storeIsAr ? 'جاري التحليل...' : 'Analyse...'}
                        </>
                     ) : (
                        <>
                           <Sparkles className="w-5 h-5 text-amber-400" />
                           {storeIsAr ? 'تحليل الذكاء الاصطناعي' : 'Analyser avec l\'IA'}
                        </>
                     )}
                  </button>
               </div>

               {/* Results Area */}
               {results && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                           <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-indigo-900">{results.title}</h3>
                     </div>

                     {activeTab === 'niche' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'فرصة النجاح' : 'Score de Réussite'}</p>
                                 <p className="text-2xl font-black text-emerald-600">{results.score}/100</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'مستوى المنافسة' : 'Concurrence'}</p>
                                 <p className="text-2xl font-black text-amber-600">{results.competition}</p>
                              </div>
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900 mb-3">{storeIsAr ? 'أفكار مقترحة' : 'Idées Suggérées'} :</h4>
                              <ul className="space-y-2">
                                 {results.suggestions.map((s: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                                       <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" /> {s}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                     )}

                     {activeTab === 'pricing' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'متوسط سعر السوق' : 'Prix Moyen'}</p>
                                 <p className="text-lg font-black text-slate-900">{results.averagePrice}</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'السعر المقترح لك' : 'Prix Recommandé'}</p>
                                 <p className="text-lg font-black text-emerald-600">{results.recommendedPrice}</p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-indigo-100">
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{storeIsAr ? 'هامش الربح المتوقع' : 'Marge Estimée'}</p>
                                 <p className="text-lg font-black text-indigo-600">{results.margin}</p>
                              </div>
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900 mb-3">{storeIsAr ? 'تحليل المنافسين' : 'Analyse des Concurrents'} :</h4>
                              <div className="space-y-2">
                                 {results.competitors.map((c: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                                       <span className="font-bold text-slate-700">{c.name}</span>
                                       <div className="flex gap-4">
                                          <span className="text-slate-500">{c.quality}</span>
                                          <span className="font-black text-slate-900">{c.price}</span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'trends' && (
                        <div className="space-y-4">
                           {results.trends.map((t: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white p-4 rounded-xl border border-indigo-100">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">#{i+1}</div>
                                    <span className="font-bold text-slate-800">{t.name}</span>
                                 </div>
                                 <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-black rounded-lg text-sm">{t.growth}</span>
                              </div>
                           ))}
                        </div>
                     )}

                  </div>
               )}

               {!results && !isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                     <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                     <p>{storeIsAr ? 'أدخل كلمة مفتاحية للبدء في التحليل السحري.' : 'Entrez un mot-clé pour démarrer l\'analyse magique.'}</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
