const fs = require('fs');
let content = fs.readFileSync('C:/Users/hp/Downloads/BEYA/src/pages/LandingPage.tsx', 'utf8');

// 1. Add loadData, TarifService to imports
content = content.replace(
  "import { loadCompanyProfile, saveLead, syncCompanyProfile, CompanyProfile } from '../types';",
  "import { loadCompanyProfile, saveLead, syncCompanyProfile, CompanyProfile, loadData, TarifService } from '../types';"
);

// 2. Add states for simulator
const stateInjection = `
  const [simulatorStep, setSimulatorStep] = useState(1);
  const [tarifsDb, setTarifsDb] = useState<TarifService[]>([]);

  useEffect(() => {
    const fetchTarifs = async () => {
      const tarifsList = await loadData<TarifService>('tarifs');
      const activeConfections = (tarifsList || []).filter(t => t.categorie === 'Confection' && t.actif);
      setTarifsDb(activeConfections);
    };
    fetchTarifs();
  }, []);

  const calculateEstimate = (type: string, qtyStr: string) => {
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
    return {
      min: Math.round(baseMin),
      max: Math.round(baseMax),
      totalMin: Math.round(baseMin * quantity),
      totalMax: Math.round(baseMax * quantity)
    };
  };
`;

content = content.replace(
  'const [isLoggedIn, setIsLoggedIn] = useState(false);',
  stateInjection + '\n  const [isLoggedIn, setIsLoggedIn] = useState(false);'
);

// 3. Replace form content
const formContentNew = `                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formElement = e.currentTarget;
                    
                    if (simulatorStep === 1) {
                      const missingPhoto = models.find(m => !m.photo && (!m.photos || m.photos.length === 0));
                      if (missingPhoto) {
                        setErrorMsg(isAr ? 'كل موديل خاصو عندو صورة (إجباري)' : 'Chaque modèle doit avoir au moins une photo (Obligatoire)');
                        return;
                      }
                      setSimulatorStep(2);
                      return;
                    }

                    const formData = new FormData(formElement);
                    const countryCode = (formElement.querySelector('select[name="countryCode"]') as HTMLSelectElement)?.value || '+212';
                    const rawPhone = formData.get('phone') as string;
                    const fullPhone = countryCode + (rawPhone.startsWith('0') ? rawPhone.substring(1) : rawPhone);
                    const clientName = formData.get('name') as string;
                    const clientEmail = formData.get('email') as string || 'Non spécifié';
                    const clientVille = formData.get('ville') as string || 'Non spécifié';

                    if (!clientName.trim().includes(' ')) {
                      setErrorMsg(isAr ? 'المرجو إدخال الإسم الكامل (الشخصي والعائلي)' : 'Veuillez entrer votre nom complet (Prénom et Nom)');
                      return;
                    }

                    setIsSending(true);
                    try {
                      for (const m of models) {
                        const finalType = (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type;
                        await saveLead({
                          name: clientName,
                          email: clientEmail,
                          phone: fullPhone,
                          ville: clientVille,
                          type: finalType,
                          quantity: Number(m.quantity) || 1,
                          tailles: Object.fromEntries(Object.entries(m.tailles).filter(([_, v]) => v !== '').map(([k, v]) => [k, Number(v)])),
                          details: m.details,
                          photo: m.photos?.[0] || m.photo!,
                          photos: m.photos || (m.photo ? [m.photo] : []),
                        });
                      }
                      
                      trackPixelEvent('Lead', {
                        content_name: models.map(m => m.type).join(', '),
                        content_category: 'Confection Lead',
                        value: models.reduce((acc, m) => acc + (Number(m.quantity) || 1), 0),
                        currency: 'MAD'
                      });

                      setIsSending(false);
                      setShowSuccess(true);
                      setModels([emptyModel()]);
                      setSimulatorStep(1);
                      sendEmailNotification(
                        clientName, fullPhone, clientEmail, clientVille,
                        models.map(m => ({ type: (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type, quantity: Number(m.quantity) || 1 }))
                      );
                      sendPushToAll(
                        '🧵 Nouvelle Demande!',
                        \`\${clientName} — \${models.map(m => m.type).join(', ')}\`,
                        '/demandes'
                      ).catch(() => {});
                      formElement.reset();
                    } catch (err: any) {
                      setIsSending(false);
                      console.error("Error in LandingPage:", err);
                      setErrorMsg(isAr ? 'وقع خطأ أثناء الإرسال. المرجو التأكد من أن جميع الخانات صحيحة.' : 'Une erreur est survenue lors de l\\'envoi. Veuillez réessayer.');
                    }
                  }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                      {simulatorStep === 1 
                        ? (isAr ? 'حاسبة التكلفة' : 'Simulateur de Prix') 
                        : (isAr ? 'إكمال المعلومات' : 'Compléter vos informations')}
                    </h3>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className={\`h-1.5 rounded-full transition-all \${simulatorStep >= 1 ? 'w-16 bg-indigo-600' : 'w-4 bg-slate-200'}\`}></div>
                      <div className={\`h-1.5 rounded-full transition-all \${simulatorStep >= 2 ? 'w-16 bg-indigo-600' : 'w-4 bg-slate-200'}\`}></div>
                    </div>
                  </div>

                  {simulatorStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      {models.map((m, idx) => (
                        <div key={m.id} className="border-2 border-indigo-100 rounded-2xl p-4 md:p-6 space-y-4 bg-indigo-50/30 relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">{idx + 1}</div>
                              <h3 className="font-black text-slate-800 text-lg">{isAr ? 'الموديل' : 'Modèle'} {idx + 1}</h3>
                            </div>
                            {models.length > 1 && (
                              <button type="button" onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))}
                                className="w-8 h-8 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-all text-xs font-black shadow-sm">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس' : 'Type de vêtement'}</label>
                              <div className="relative">
                                <select value={m.type} onChange={e => updateModel(m.id, { type: e.target.value })}
                                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors appearance-none">
                                  {tarifsDb.map(t => <option key={t.id} value={t.titre}>{t.titre}</option>)}
                                  {tarifsDb.length === 0 && (
                                    <>
                                      {['T-Shirt','Polo','T-Shirt Oversize','Sweat / Hoodie','Djellaba / Gandoura','Ensemble / Survêtement','Pyjama','Uniforme / Travail','Pantalon'].map(t => <option key={t}>{t}</option>)}
                                    </>
                                  )}
                                  <option value="Autre">{isAr ? 'نوع آخر (Autre...)' : 'Autre...'}</option>
                                </select>
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {m.type === 'Autre' && (
                                <input type="text" value={m.customType} onChange={e => updateModel(m.id, { customType: e.target.value })}
                                  placeholder={isAr ? 'حدد النوع' : 'Spécifiez le type'}
                                  className="mt-2 w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600" required />
                              )}
                            </div>
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'الكمية الإجمالية للموديل' : 'Quantité Totale'}</label>
                              <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 h-[50px]" required />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'المقاسات (اختياري - وزع الكمية)' : 'Tailles (Optionnel)'}</label>
                            <div className="grid grid-cols-6 gap-2">
                              {['XS','S','M','L','XL','XXL'].map(size => (
                                <div key={size} className="relative group">
                                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 bg-indigo-50 text-[8px] font-black text-indigo-600 rounded-full border border-indigo-100 z-10">{size}</div>
                                  <input type="number" value={m.tailles[size]} onChange={e => updateModelTaille(m.id, size, e.target.value)} placeholder="0"
                                    className="w-full bg-white border-2 border-slate-200 rounded-xl pt-3 pb-1 px-1 text-center text-xs font-black outline-none focus:border-indigo-600 h-[50px]" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">{isAr ? 'تفاصيل الطلب (ألوان، نوع الثوب...)' : 'Détails de la commande (Couleurs, Tissu...)'}</label>
                              <textarea rows={3} value={m.details} onChange={e => updateModel(m.id, { details: e.target.value })}
                                placeholder={isAr ? 'اشرح شنو باغي...' : 'Expliquez ce que vous voulez...'}
                                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-indigo-600 resize-none" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">
                                {isAr ? 'صورة الموديل' : 'Photo du modèle'} <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {(m.photos || (m.photo ? [m.photo] : [])).map((p, pIdx) => (
                                  <div key={pIdx} className="relative w-[100px] h-[100px] rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                                    <img src={p} className="w-full h-full object-cover" alt="" />
                                    <button type="button" onClick={() => removeModelPhoto(m.id, pIdx)}
                                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-sm">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {(m.photos || (m.photo ? [m.photo] : [])).length < 5 && (
                                  <label className="flex flex-col items-center justify-center w-[100px] h-[100px] bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all shrink-0">
                                    <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1 leading-tight">{isAr ? 'إضافة صورة' : 'Ajouter'}</span>
                                    <input type="file" accept="image/*" onChange={e => handleModelPhoto(m.id, e)} className="hidden" />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Line Simulator Display */}
                          {(() => {
                            const est = calculateEstimate(m.type, m.quantity);
                            if (!est) return null;
                            return (
                              <div className="mt-4 p-4 bg-white border-2 border-emerald-100 rounded-xl flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'التكلفة التقديرية' : 'Coût Estimé'}</p>
                                </div>
                                <div className={\`text-\${isAr ? 'left' : 'right'}\`}>
                                  <p className="text-sm font-black text-slate-800">{est.min} - {est.max} MAD <span className="text-xs text-slate-500">{isAr ? '/ قطعة' : '/ Pièce'}</span></p>
                                  <p className="text-xs font-bold text-emerald-500">{isAr ? 'الإجمالي:' : 'Total :'} {est.totalMin.toLocaleString()} - {est.totalMax.toLocaleString()} MAD</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ))}

                      <button type="button" onClick={() => setModels(prev => [...prev, emptyModel()])}
                        className="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 bg-indigo-50/50 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                        + {isAr ? 'إضافة موديل آخر' : 'Ajouter un autre modèle'}
                      </button>

                      {(() => {
                        const liveTotals = models.reduce((acc, m) => {
                          const est = calculateEstimate(m.type, m.quantity);
                          if (est) {
                            acc.min += est.totalMin;
                            acc.max += est.totalMax;
                          }
                          return acc;
                        }, { min: 0, max: 0 });

                        return liveTotals.max > 0 && (
                          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-300">
                            <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">{isAr ? 'إجمالي تكلفة مشروعك التقديرية' : 'Estimation Totale du Projet'}</p>
                            <p className="text-3xl font-black text-emerald-700">
                              {liveTotals.min.toLocaleString()} - {liveTotals.max.toLocaleString()} {isAr ? 'درهم' : 'DH'}
                            </p>
                            <p className="text-xs font-medium text-emerald-600/70 mt-2">{isAr ? 'السعر قابل للتفاوض البسيط حسب التفاصيل الدقيقة.' : 'Prix légèrement négociable selon les détails exacts.'}</p>
                          </div>
                        );
                      })()}

                      <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                        {isAr ? 'أنا موافق، أكمل معلوماتي للعمل فوراً' : "Je suis d'accord, compléter mes informations"} <ArrowRight className={\`w-5 h-5 \${isAr ? '-scale-x-100' : ''}\`} />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: CONTACT INFO */}
                  {simulatorStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 font-medium">{isAr ? 'خطوة أخيرة! أدخل معلوماتك لكي يتواصل معك فريقنا في أقرب وقت لتأكيد الطلب وبدء العمل على العينة.' : "Dernière étape ! Entrez vos informations pour que notre équipe vous contacte rapidement et commence le travail sur l'échantillon."}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">{isAr ? 'الإسم الكامل' : 'Nom Complet'}</label>
                          <input type="text" name="name" placeholder={isAr ? "مثال: أحمد العلمي" : "Ex: Ahmed Alami"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                        </div>
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">Email</label>
                          <input type="email" name="email" placeholder="email@example.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">{isAr ? 'رقم الهاتف / الواتساب' : 'Téléphone / WhatsApp'}</label>
                          <div className="flex gap-3">
                            <div className="relative w-[100px] flex-shrink-0">
                              <select name="countryCode" className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-4 pr-8 text-xs font-black outline-none focus:border-indigo-600 transition-colors h-[58px]">
                                <option value="+212">🇲🇦 212</option>
                                <option value="+33">🇫🇷 33</option>
                                <option value="+34">🇪🇸 34</option>
                                <option value="+1">🇺🇸 1</option>
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                            <input type="tel" name="phone" placeholder="6XXXXXXXX" className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-indigo-600 transition-colors h-[58px]" dir="ltr" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13px] font-extrabold text-slate-700 uppercase tracking-widest mb-3">{isAr ? 'المدينة' : 'Ville'}</label>
                          <input type="text" name="ville" placeholder={isAr ? "مثال: الدار البيضاء" : "Ex: Casablanca"} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold outline-none focus:border-indigo-600 transition-colors" required />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setSimulatorStep(1)} className="px-6 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                          {isAr ? 'رجوع' : 'Retour'}
                        </button>
                        <button type="submit" disabled={isSending} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
                          {isSending ? (isAr ? 'جاري الإرسال...' : 'Envoi en cours...') : (isAr ? 'تأكيد الطلب الآن' : 'Confirmer la commande')}
                          {!isSending && <CheckCircle2 className="w-5 h-5 ml-2" />}
                        </button>
                      </div>
                      <p className="text-center text-[10px] font-bold text-slate-400 mt-4">{isAr ? 'معلوماتك آمنة ولن يتم مشاركتها مع أي طرف ثالث.' : 'Vos informations sont en sécurité et ne seront pas partagées.'}</p>
                    </div>
                  )}
                </form>`;

content = content.replace(/<form\s+className="space-y-6"[\s\S]*?<\/form>/, formContentNew);

fs.writeFileSync('C:/Users/hp/Downloads/BEYA/src/pages/LandingPage.tsx', content);
console.log('Done!');
