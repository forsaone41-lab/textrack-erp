const fs = require('fs');
let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf8');

// We need to find the block handling `linkedFiche` and replace it with a new tabbed UI.

const oldBlock = `                        {linkedFiche ? (
                           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent pointer-events-none" />
                              <div className="flex items-center justify-between mb-6 relative">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                       <Ruler className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-slate-800 text-sm">{isAr ? 'دليل المقاسات' : 'Guide des Tailles'}</h4>
                                       <p className="text-xs text-slate-500">{isAr ? 'تم استيراده من الفيش تقنيك' : 'Importé depuis la Fiche Technique'}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <button onClick={() => setProductForm({...productForm, ficheId: undefined})} className="text-[10px] font-bold text-slate-400 hover:text-rose-500">{isAr ? 'إلغاء الربط' : 'Détacher'}</button>
                                 </div>
                              </div>
                              
                              {linkedFiche.tailles?.length > 0 && linkedFiche.mesures?.length > 0 ? (
                                 <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white relative">
                                    <table className="w-full text-xs">
                                       <thead className="bg-slate-50 border-b border-slate-200">
                                          <tr className="text-slate-400">
                                             <th className="text-left font-bold px-2 py-1">{isAr ? 'القياس' : 'Mesure'}</th>
                                             {linkedFiche.tailles.map(t => (
                                                <th key={t} className="font-bold px-2 py-1 text-center">{t}</th>
                                             ))}
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {linkedFiche.mesures.map((m, idx) => (
                                             <tr key={idx} className="border-t border-slate-100">
                                                <td className="px-2 py-1.5 font-semibold text-slate-600">{m.nom}</td>
                                                {linkedFiche.tailles.map(t => (
                                                   <td key={t} className="px-2 py-1.5 text-center text-slate-700">{m.valeurs[t] ?? '-'}</td>
                                                ))}
                                             </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 </div>
                              ) : (
                                 <p className="text-xs text-slate-400 italic">{isAr ? 'لا توجد قياسات مسجلة بعد لهذا الموديل' : "Aucune mesure enregistrée pour ce modèle pour l'instant"}</p>
                              )}
                           </div>
                        ) : (
                           <button onClick={() => setIsFichePickerOpen(true)} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center gap-2">
                              <Ruler className="w-5 h-5" />
                              <span className="text-xs font-bold">{isAr ? 'ربط بفيش تقنيك (لعرض القياسات هنا تلقائيًا)' : 'Lier à une Fiche Technique (mesures affichées ici automatiquement)'}</span>
                           </button>
                        )}`;

const newBlock = `
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden flex flex-col gap-4">
                           <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-xl">
                              <button onClick={() => setProductForm({...productForm, sizeGuideMode: 'auto'})} className={\`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all \${productForm?.sizeGuideMode !== 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}\`}>
                                 {isAr ? 'تلقائي (Auto)' : 'Automatique (Auto)'}
                              </button>
                              <button onClick={() => setProductForm({...productForm, sizeGuideMode: 'manual', customSizeGuide: productForm?.customSizeGuide || { tailles: ['S', 'M', 'L', 'XL'], mesures: [{ nom: 'Longueur', valeurs: {} }] }})} className={\`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all \${productForm?.sizeGuideMode === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}\`}>
                                 {isAr ? 'يدوي (Manuel)' : 'Manuel'}
                              </button>
                           </div>

                           {productForm?.sizeGuideMode === 'manual' ? (
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800 text-sm">{isAr ? 'جدول المقاسات اليدوي' : 'Tableau des mesures manuel'}</h4>
                                    <button onClick={() => setProductForm({...productForm, customSizeGuide: { ...productForm.customSizeGuide, mesures: [...productForm.customSizeGuide.mesures, { nom: 'Nouvelle mesure', valeurs: {} }] }})} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100">{isAr ? '+ إضافة صف' : '+ Ajouter ligne'}</button>
                                 </div>
                                 <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                    <table className="w-full text-xs">
                                       <thead className="bg-slate-50 border-b border-slate-200">
                                          <tr className="text-slate-400">
                                             <th className="text-left font-bold px-2 py-2 w-1/3">{isAr ? 'القياس' : 'Mesure'}</th>
                                             {productForm.customSizeGuide?.tailles?.map((t: string, tIdx: number) => (
                                                <th key={tIdx} className="font-bold px-1 py-2 text-center relative group">
                                                   <input type="text" value={t} onChange={e => { const newTailles = [...productForm.customSizeGuide.tailles]; newTailles[tIdx] = e.target.value; setProductForm({...productForm, customSizeGuide: {...productForm.customSizeGuide, tailles: newTailles}}); }} className="w-full bg-transparent text-center focus:outline-none focus:bg-white focus:ring-1 ring-indigo-500 rounded" />
                                                </th>
                                             ))}
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {productForm.customSizeGuide?.mesures?.map((m: any, idx: number) => (
                                             <tr key={idx} className="border-t border-slate-100">
                                                <td className="px-2 py-1">
                                                   <input type="text" value={m.nom} onChange={e => { const newMesures = [...productForm.customSizeGuide.mesures]; newMesures[idx].nom = e.target.value; setProductForm({...productForm, customSizeGuide: {...productForm.customSizeGuide, mesures: newMesures}}); }} className="w-full bg-transparent font-semibold text-slate-600 focus:outline-none focus:bg-slate-50 rounded px-1" />
                                                </td>
                                                {productForm.customSizeGuide?.tailles?.map((t: string) => (
                                                   <td key={t} className="px-1 py-1">
                                                      <input type="text" value={m.valeurs?.[t] || ''} onChange={e => { const newMesures = [...productForm.customSizeGuide.mesures]; if (!newMesures[idx].valeurs) newMesures[idx].valeurs = {}; newMesures[idx].valeurs[t] = e.target.value; setProductForm({...productForm, customSizeGuide: {...productForm.customSizeGuide, mesures: newMesures}}); }} className="w-full bg-transparent text-center text-slate-700 focus:outline-none focus:bg-slate-50 rounded" placeholder="-" />
                                                   </td>
                                                ))}
                                             </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           ) : (
                              <div>
                                 {linkedFiche ? (
                                    <div className="relative group">
                                       <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                                <CheckCircle className="w-4 h-4" />
                                             </div>
                                             <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{isAr ? 'تم الاستيراد بنجاح' : 'Importé avec succès'}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{linkedFiche.modele}</p>
                                             </div>
                                          </div>
                                          <button onClick={() => setProductForm({...productForm, ficheId: undefined})} className="text-[10px] font-bold text-slate-400 hover:text-rose-500">{isAr ? 'إلغاء' : 'Détacher'}</button>
                                       </div>
                                       
                                       {linkedFiche.tailles?.length > 0 && linkedFiche.mesures?.length > 0 ? (
                                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white opacity-70 pointer-events-none">
                                             <table className="w-full text-xs">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                   <tr className="text-slate-400">
                                                      <th className="text-left font-bold px-2 py-1">{isAr ? 'القياس' : 'Mesure'}</th>
                                                      {linkedFiche.tailles.map(t => (
                                                         <th key={t} className="font-bold px-2 py-1 text-center">{t}</th>
                                                      ))}
                                                   </tr>
                                                </thead>
                                                <tbody>
                                                   {linkedFiche.mesures.map((m, idx) => (
                                                      <tr key={idx} className="border-t border-slate-100">
                                                         <td className="px-2 py-1.5 font-semibold text-slate-600">{m.nom}</td>
                                                         {linkedFiche.tailles.map(t => (
                                                            <td key={t} className="px-2 py-1.5 text-center text-slate-700">{m.valeurs[t] ?? '-'}</td>
                                                         ))}
                                                      </tr>
                                                   ))}
                                                </tbody>
                                             </table>
                                          </div>
                                       ) : (
                                          <p className="text-xs text-slate-400 italic text-center py-4">{isAr ? 'لا توجد قياسات في الفيش تقنيك' : 'Aucune mesure dans la Fiche'}</p>
                                       )}
                                    </div>
                                 ) : (
                                    <div className="py-8 flex flex-col items-center justify-center text-center opacity-60">
                                       <Ruler className="w-8 h-8 text-slate-300 mb-2" />
                                       <p className="text-xs font-bold text-slate-500">{isAr ? 'الوضع التلقائي مفعل' : 'Mode Automatique Actif'}</p>
                                       <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">{isAr ? 'استخدم زر (استيراد من BEYA) في الأعلى لاختيار الموديل وسيظهر الجدول هنا.' : 'Utilisez le bouton (IMPORT BEYA) en haut pour lier un modèle.'}</p>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
`;

// It looks like `oldBlock` might not match exactly due to formatting changes, so let's use a regex replace.
// We'll search for the `linkedFiche ? (` block down to the `)}` before `{/* Right Column (Variants) */}`

const regex = /\{linkedFiche \? \([\s\S]*?<\/button>\s*\n\s*\)\}/;

content = content.replace(regex, newBlock);

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf8');
console.log('Size guide patch created');
