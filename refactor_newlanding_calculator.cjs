const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/NewLanding.tsx', 'utf8');

  // 1. Add necessary imports if missing (like X, ChevronDown from lucide-react)
  if (!content.includes('ChevronDown')) {
    content = content.replace('X, Phone,', 'X, Phone, ChevronDown,');
  }

  // 2. Add TarifService to types import
  if (!content.includes('TarifService')) {
    content = content.replace('saveRecord } from \'../types\';', 'saveRecord, TarifService, loadData } from \'../types\';');
  }

  // 3. Inject state variables and calculator logic right after the existing state definitions
  const calculatorState = `
  const [tarifsDb, setTarifsDb] = useState<TarifService[]>([]);
  
  interface ModelEntry {
    id: string;
    type: string;
    customType: string;
    quantity: string;
    tailles: Record<string, string>;
    details: string;
    photo: string | null;
    photos: string[];
    provideFabric: boolean;
  }

  const emptyModel = (): ModelEntry => ({
    id: Math.random().toString(36).slice(2),
    type: 'T-Shirt', customType: '', quantity: '',
    tailles: { XS: '', S: '', M: '', L: '', XL: '', XXL: '' },
    details: '', photo: null, photos: [], provideFabric: false
  });

  const [models, setModels] = useState<ModelEntry[]>([emptyModel()]);

  const updateModel = (id: string, field: Partial<ModelEntry>) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...field } : m));
  };

  const calculateEstimate = (type: string, qtyStr: string, provideFabric: boolean = false) => {
    const quantity = parseInt(qtyStr) || 0;
    if (quantity === 0) return null;
    
    let baseMin = 0;
    let baseMax = 0;
    
    const dbTarif = tarifsDb.find(t => t.titre.toLowerCase() === type.toLowerCase());
    if (dbTarif) {
      baseMin = dbTarif.prixMin;
      baseMax = dbTarif.prixMax || dbTarif.prixMin;
    } else {
      switch(type) {
        case 'T-Shirt': baseMin = 35; baseMax = 45; break;
        case 'Polo': baseMin = 60; baseMax = 75; break;
        case 'T-Shirt Oversize': baseMin = 45; baseMax = 60; break;
        case 'Sweat / Hoodie': baseMin = 120; baseMax = 150; break;
        case 'Djellaba / Gandoura': baseMin = 150; baseMax = 250; break;
        case 'Ensemble / Survêtement': baseMin = 180; baseMax = 260; break;
        case 'Pyjama': baseMin = 80; baseMax = 120; break;
        case 'Uniforme / Travail': baseMin = 100; baseMax = 180; break;
        case 'Pantalon': baseMin = 80; baseMax = 130; break;
        default: return null;
      }
    }

    if (quantity < 100) { baseMin *= 1.15; baseMax *= 1.15; }
    else if (quantity >= 500) { baseMin *= 0.9; baseMax *= 0.9; }

    return { min: Math.round(baseMin), max: Math.round(baseMax), totalMin: Math.round(baseMin * quantity), totalMax: Math.round(baseMax * quantity) };
  };

  const updateModelTaille = (id: string, size: string, val: string) => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const newTailles = { ...m.tailles, [size]: val };
      const total = Object.values(newTailles).reduce((a, v) => a + (Number(v) || 0), 0);
      return { ...m, tailles: newTailles, quantity: total > 0 ? total.toString() : m.quantity };
    }));
  };

  const handleModelPhoto = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert(isAr ? 'الصورة كبيرة جداً (Max 10MB)' : 'Photo trop grande (Max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = h * MAX / w; w = MAX; }
        else if (h > MAX) { w = w * MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        let newPhoto = '';
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); newPhoto = canvas.toDataURL('image/jpeg', 0.6); }
        else { newPhoto = ev.target?.result as string; }
        
        setModels(prev => prev.map(m => {
          if (m.id !== id) return m;
          const currentPhotos = m.photos || (m.photo ? [m.photo] : []);
          const newPhotos = [...currentPhotos, newPhoto];
          return { ...m, photo: newPhotos[0], photos: newPhotos };
        }));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeModelPhoto = (id: string, index: number) => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const currentPhotos = m.photos || (m.photo ? [m.photo] : []);
      const newPhotos = currentPhotos.filter((_, i) => i !== index);
      return { ...m, photo: newPhotos.length > 0 ? newPhotos[0] : null, photos: newPhotos };
    }));
  };

  useEffect(() => {
    const fetchTarifs = async () => {
      try {
        const tarifsList = await loadData<TarifService>('tarifs');
        const activeConfections = (tarifsList || []).filter(t => t.categorie === 'Confection' && t.actif);
        setTarifsDb(activeConfections);
        if (activeConfections.length > 0) {
          setModels(prev => prev.map(m => m.type === 'T-Shirt' ? { ...m, type: activeConfections[0].titre } : m));
        }
      } catch (err) {}
    };
    fetchTarifs();
  }, []);
`;

  // Inject right before handleNext
  if (!content.includes('const emptyModel')) {
    content = content.replace('const handleNext =', calculatorState + '\\n  const handleNext =');
  }

  // 4. Update the handleSubmit to save models if intent === 'production'
  const newHandleSubmit = `
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let totMin = 0;
      let totMax = 0;
      let estimateText = '';

      if (formData.intent === 'production') {
        for (const m of models) {
          const finalType = ((m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type) + (m.provideFabric ? ' (CMT - Client Tissu)' : '');
          const est = calculateEstimate(m.type, m.quantity, m.provideFabric);
          if (est) {
            totMin += est.totalMin;
            totMax += est.totalMax;
          }
          
          const payload: any = {
            id: \`lead-\${Date.now()}-\${Math.random().toString(36).substr(2, 5)}\`,
            name: formData.name || 'Nouveau Lead',
            phone: formData.phone,
            email: formData.email,
            type: 'Demande via New Landing (Production)',
            details: \`Type Client: \${formData.clientType} | Nom: \${formData.companyName || 'N/A'} \${formData.companySector ? \`(\${formData.companySector})\` : ''} | Budget: \${formData.budget} | Délai: \${formData.deadline}\\n\\nModèle: \${finalType} | Qté: \${m.quantity}\\nTailles: \${JSON.stringify(Object.fromEntries(Object.entries(m.tailles).filter(([_, v]) => v !== '')))}\\nDétails: \${m.details}\\nNotes: \${formData.details}\`,
            status: 'new',
            date: new Date().toISOString()
          };
          if (m.photos && m.photos.length > 0) {
            payload.photo = m.photos[0];
            payload.photos = m.photos;
          } else if (m.photo) {
            payload.photo = m.photo;
            payload.photos = [m.photo];
          }
          await saveRecord('leads', payload);
        }
        if (totMin > 0) {
          estimateText = \`(التكلفة التقديرية التي ظهرت لي: \${totMin} - \${totMax} درهم)\`;
        }
      } else {
        const payload: any = {
          id: \`lead-\${Date.now()}\`,
          name: formData.name || 'Nouveau Lead',
          phone: formData.phone,
          email: formData.email,
          type: 'Demande via New Landing (Discussion)',
          details: \`Type Client: \${formData.clientType} | Nom: \${formData.companyName || 'N/A'} \${formData.companySector ? \`(\${formData.companySector})\` : ''} | Budget: \${formData.budget} | Délai: \${formData.deadline}\\nNotes: \${formData.details}\`,
          status: 'new',
          date: new Date().toISOString()
        };
        await saveRecord('leads', payload);
      }
      
      const newId = \`user-\${Date.now()}\`;
      const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
      const userPayload = {
        id: newId,
        nom: formData.name || 'Client',
        role: 'client',
        email: formData.email.trim().toLowerCase(),
        password: autoCode,
        pinCode: autoCode,
        telephone: formData.phone
      };
      await saveRecord('users', userPayload);
      setNewClientCode({ name: formData.name || 'Client', email: formData.email.trim().toLowerCase(), code: autoCode });

      setIsSuccess(true);
    } catch (error: any) {
      console.error(error);
      alert(isAr ? 'حدث خطأ: ' + (error.message || String(error)) : 'Une erreur est survenue: ' + (error.message || String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };
  `;

  content = content.replace(/const handleSubmit = async \(\) => \{[\s\S]*?setIsSubmitting\(false\);\n    \}\n  \};/, newHandleSubmit);

  // 5. Replace the simple photo upload with the calculator UI
  const calculatorUI = `
                      {formData.intent === 'production' && (
                        <div className="mb-6 animate-in fade-in duration-300">
                          <label className={\`block text-lg font-black mb-4 text-center p-2 rounded-xl \${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}\`}>
                            {isAr ? 'حاسبة التكلفة - أدخل موديلاتك' : 'Simulateur - Entrez vos modèles'}
                          </label>
                          <div className="space-y-4">
                            {models.map((m, idx) => (
                              <div key={m.id} className={\`border-2 rounded-2xl p-3 md:p-4 space-y-3 relative \${isDark ? 'border-white/10 bg-slate-800' : 'border-indigo-100 bg-indigo-50/30'}\`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-sm">{idx + 1}</div>
                                    <h3 className={\`font-black text-lg \${isDark ? 'text-white' : 'text-slate-800'}\`}>{isAr ? 'الموديل' : 'Modèle'} {idx + 1}</h3>
                                  </div>
                                  {models.length > 1 && (
                                    <button type="button" onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))}
                                      className="w-6 h-6 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all text-xs font-black shadow-sm">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className={\`block text-[10px] font-extrabold uppercase tracking-widest mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>نوع اللباس</label>
                                    <div className="relative">
                                      <select value={m.type} onChange={e => updateModel(m.id, { type: e.target.value })}
                                        className={\`w-full border-2 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 transition-colors appearance-none \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}\`}>
                                        {tarifsDb.map(t => <option key={t.id} value={t.titre}>{t.titre}</option>)}
                                        {tarifsDb.length === 0 && <option value="T-Shirt">T-Shirt</option>}
                                        <option value="Autre">نوع آخر (Autre...)</option>
                                      </select>
                                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    {m.type === 'Autre' && (
                                      <input type="text" value={m.customType} onChange={e => updateModel(m.id, { customType: e.target.value })}
                                        placeholder={isAr ? 'حدد النوع' : 'Spécifiez le type'}
                                        className={\`mt-2 w-full border-2 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}\`} required />
                                    )}
                                  </div>
                                  <div>
                                    <label className={\`block text-[10px] font-extrabold uppercase tracking-widest mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>{isAr ? 'الكمية الإجمالية للموديل' : 'Quantité Totale'}</label>
                                    <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })}
                                      className={\`w-full border-2 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 h-[40px] \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}\`} required />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className={\`block text-[10px] font-extrabold uppercase tracking-widest mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>{isAr ? 'الثوب (Tissu)' : 'Tissu'}</label>
                                    <select value={m.provideFabric ? 'yes' : 'no'} onChange={e => updateModel(m.id, { provideFabric: e.target.value === 'yes' })}
                                      className={\`w-full border-2 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 h-[40px] \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}\`}>
                                      <option value="no">{isAr ? 'نتكلفو بالثوب (Full Package)' : 'Fourni par nous (Full Package)'}</option>
                                      <option value="yes">{isAr ? 'غنجيب الثوب ديالي (CMT)' : 'Je fournis le tissu (CMT)'}</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className={\`block text-[10px] font-extrabold uppercase tracking-widest mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>{isAr ? 'المقاسات (اختياري - وزع الكمية)' : 'Tailles (Optionnel)'}</label>
                                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {['XS','S','M','L','XL','XXL'].map(size => (
                                      <div key={size} className="relative group mt-2">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 bg-indigo-100 text-[9px] font-black text-indigo-700 rounded-full border border-indigo-200 z-10 shadow-sm">{size}</div>
                                        <input type="number" value={m.tailles[size]} onChange={e => updateModelTaille(m.id, size, e.target.value)} placeholder="0"
                                          className={\`w-full border-2 rounded-xl pt-3 pb-1 px-1 text-center text-xs font-black outline-none focus:border-indigo-600 h-[40px] \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}\`} />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className={\`block text-[10px] font-extrabold uppercase tracking-widest mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>{isAr ? 'تفاصيل الطلب (ألوان، نوع الثوب...)' : 'Détails de la commande'}</label>
                                    <textarea rows={3} value={m.details} onChange={e => updateModel(m.id, { details: e.target.value })}
                                      placeholder={isAr ? 'اشرح شنو باغي...' : 'Expliquez ce que vous voulez...'}
                                      className={\`w-full border-2 rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-indigo-600 resize-none \${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}\`} />
                                  </div>
                                  <div>
                                    <label className={\`block text-[10px] font-extrabold uppercase tracking-widest mb-2 \${isDark ? 'text-slate-400' : 'text-slate-700'}\`}>
                                      {isAr ? 'صورة الموديل' : 'Photo du modèle'} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {(m.photos || (m.photo ? [m.photo] : [])).map((p, pIdx) => (
                                        <div key={pIdx} className="relative w-[70px] h-[70px] rounded-xl overflow-hidden border-2 border-indigo-500 shadow-sm">
                                          <img src={p} className="w-full h-full object-cover" alt="" />
                                          <button type="button" onClick={() => removeModelPhoto(m.id, pIdx)}
                                            className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm">
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                      {(m.photos || (m.photo ? [m.photo] : [])).length < 5 && (
                                        <label className={\`flex flex-col items-center justify-center w-[70px] h-[70px] border-2 border-dashed rounded-xl cursor-pointer hover:border-indigo-500 transition-all shrink-0 \${isDark ? 'bg-slate-900 border-white/20' : 'bg-white border-slate-300'}\`}>
                                          <ImageIcon className={\`w-4 h-4 mb-1 \${isDark ? 'text-slate-500' : 'text-slate-300'}\`} />
                                          <span className={\`text-[9px] font-black uppercase tracking-widest text-center px-1 leading-tight \${isDark ? 'text-slate-400' : 'text-slate-400'}\`}>{isAr ? 'إضافة صورة' : 'Ajouter'}</span>
                                          <input type="file" accept="image/*" onChange={e => handleModelPhoto(m.id, e)} className="hidden" />
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {(() => {
                                  const est = calculateEstimate(m.type, m.quantity, m.provideFabric);
                                  if (!est) return null;
                                  return (
                                    <div className={\`mt-4 p-4 border-2 rounded-xl flex items-center justify-between \${isDark ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-white border-emerald-100'}\`}>
                                      <div>
                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{isAr ? 'التكلفة التقديرية' : 'Coût Estimé'}</p>
                                      </div>
                                      <div className={\`text-\${isAr ? 'right' : 'left'}\`}>
                                        <p className={\`text-sm font-black \${isDark ? 'text-white' : 'text-slate-800'}\`}>{est.min} - {est.max} MAD <span className="text-xs text-slate-500">{isAr ? '/ قطعة' : '/ Pièce'}</span></p>
                                        <p className="text-xs font-bold text-emerald-500">{isAr ? 'الإجمالي:' : 'Total :'} {est.totalMin.toLocaleString()} - {est.totalMax.toLocaleString()} MAD</p>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ))}

                            <button type="button" onClick={() => setModels(prev => [...prev, emptyModel()])}
                              className={\`w-full py-4 border-2 border-dashed rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 \${isDark ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'border-indigo-300 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100'}\`}>
                              + {isAr ? 'إضافة موديل آخر' : 'Ajouter un autre modèle'}
                            </button>

                            {(() => {
                              const liveTotals = models.reduce((acc, m) => {
                                const est = calculateEstimate(m.type, m.quantity, m.provideFabric);
                                if (est) {
                                  acc.min += est.totalMin;
                                  acc.max += est.totalMax;
                                }
                                return acc;
                              }, { min: 0, max: 0 });

                              return liveTotals.max > 0 && (
                                <div className={\`border-2 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-300 \${isDark ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-500'}\`}>
                                  <p className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-2">{isAr ? 'إجمالي تكلفة مشروعك التقديرية' : 'Estimation Totale du Projet'}</p>
                                  <p className={\`text-3xl font-black \${isDark ? 'text-emerald-400' : 'text-emerald-700'}\`}>
                                    {liveTotals.min.toLocaleString()} - {liveTotals.max.toLocaleString()} {isAr ? 'درهم' : 'DH'}
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}`;

  const oldSimplePhotoUpload = /\{formData.intent === 'production' && \([\s\S]*?\n                      \}\)/;
  
  if (oldSimplePhotoUpload.test(content)) {
    content = content.replace(oldSimplePhotoUpload, calculatorUI);
  } else {
    console.log("Could not find the old photo upload block via regex.");
  }

  // 6. Fix handleNext validation
  const oldValidation = `disabled={!formData.budget || !formData.deadline || !formData.intent || (formData.clientType !== 'debutant' && !formData.companyName) || (formData.clientType === 'entreprise' && !formData.companySector) || (formData.intent === 'production' && !formData.photo)}`;
  const newValidation = `disabled={!formData.budget || !formData.deadline || !formData.intent || (formData.clientType !== 'debutant' && !formData.companyName) || (formData.clientType === 'entreprise' && !formData.companySector) || (formData.intent === 'production' && models.some(m => !m.photo && (!m.photos || m.photos.length === 0)))}`;
  content = content.replace(oldValidation, newValidation);

  fs.writeFileSync('src/pages/NewLanding.tsx', content, 'utf8');
  console.log("Successfully injected calculator into NewLanding");
} catch(err) {
  console.error("Failed:", err);
}
