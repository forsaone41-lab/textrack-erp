const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

  // Find where LandingPage starts
  const lpStart = content.indexOf('export default function LandingPage() {');
  if (lpStart === -1) throw new Error("Could not find LandingPage");

  // Find the exact 'return (' that returns the min-h-screen div
  // The original text has: 
  // return (
  //   <div className={`min-h-screen bg-white relative overflow-hidden
  const returnRegex = /return \([\s\S]{1,50}<div className=\{`min-h-screen/;
  const match = returnRegex.exec(content.substring(lpStart));
  
  if (!match) {
      console.log("Snippet:", content.substring(lpStart, lpStart + 5000));
      throw new Error("Could not find the main return ( inside LandingPage");
  }

  const returnIndex = lpStart + match.index;

  const stateLogic = content.substring(0, returnIndex);

  const newRender = `return (
    <div className={\`min-h-screen bg-slate-900 text-white relative overflow-hidden \${isAr ? 'font-sans' : ''}\`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Messages/Modals (Error & Success) */}
      {errorMsg && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setErrorMsg(null)}>
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-rose-500/30" onClick={e => e.stopPropagation()}>
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-center text-white font-medium mb-6">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="w-full py-4 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest">OK</button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl overflow-y-auto">
          <div className="bg-slate-800 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-[0_0_100px_rgba(124,58,237,0.2)] border border-purple-500/30 my-8">
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-white uppercase tracking-tighter mb-4">
              {isAr ? 'تم إرسال طلبكم بنجاح!' : 'Demande Envoyée avec Succès!'}
            </h3>
            <p className="text-center text-slate-400 font-medium mb-8">
              {isAr ? 'شكراً لاختياركم BEYA CREATIVE. سنتواصل معكم في أقرب وقت.' : 'Merci d\\'avoir choisi BEYA CREATIVE. Nous vous contacterons très bientôt.'}
            </p>

            {newClientCode && (
              <div className="bg-slate-900 p-6 rounded-2xl mb-8 border border-white/10">
                <h4 className="text-lg font-black text-white mb-4">{isAr ? 'معلومات حسابك الخاص' : 'Vos informations de connexion'}</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold text-white font-mono">{newClientCode.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400 uppercase tracking-widest mb-1">{isAr ? 'الرمز السري (Code)' : 'Code secret'}</p>
                    <p className="text-3xl font-black text-emerald-400 tracking-widest font-mono">{newClientCode.code}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <a href={\`https://wa.me/\${company.phone ? company.phone.replace(/\\D/g, '') : '212624465962'}?text=\${encodeURIComponent('مرحباً BEYA CREATIVE...')}\`} target="_blank" rel="noreferrer" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-center tracking-widest hover:bg-emerald-600 transition-colors">
                {isAr ? 'تأكيد الطلب عبر الواتساب' : 'Confirmer via WhatsApp'}
              </a>
              <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-white/5 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                {isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSending && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
          <div className="text-center text-white">
            <RotateCw className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-xl font-black tracking-widest uppercase">{isAr ? 'جاري الإرسال...' : 'Envoi en cours...'}</p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/50 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <LogoWithFallback src={company.logoLanding || company.logoUrl} alt={company.name} />
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              {isAr ? 'FR' : 'عربي'}
            </button>
            <Link to={isLoggedIn ? "/dashboard" : "/login"} className="px-6 md:px-8 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {isLoggedIn ? (isAr ? 'حسابي' : 'Mon Espace') : (isAr ? 'تسجيل الدخول' : 'Connexion')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Silent Background Video */}
        <div className="absolute inset-0 w-full h-full bg-slate-900">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 scale-105">
            <source src="https://player.vimeo.com/external/498334460.sd.mp4?s=d00e0b3c66f6587c60315ce91dfa3a9366e60b14&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        </div>
        {/* Gradient Overlay (Purple & Blue) */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] mb-8 border border-white/20">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            {isAr ? 'الشريك الأول لنجاحك الرقمي في المغرب' : 'Le 1er Partenaire de votre réussite digitale au Maroc'}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.1] uppercase text-white">
            {isAr ? 'نصنع منتجاتك،' : 'Nous fabriquons vos produits,'}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {isAr ? 'ونبني لك متجرك الإلكتروني.' : 'Et nous créons votre boutique.'}
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
            {isAr 
              ? 'سواء كنت تملك متجراً وتحتاج إلى تصنيع ملابس عالية الجودة، أو كنت تبدأ من الصفر وتحتاج لمتجر احترافي قوي كـ Shopify، نحن هنا لنحقق ذلك بأعلى معدل تحويل.' 
              : 'Que vous ayez déjà un site et cherchiez une confection de qualité, ou que vous partiez de zéro pour créer une boutique pro puissante, nous sommes là pour maximiser votre taux de conversion.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => document.getElementById('services')?.scrollIntoView({behavior:'smooth'})} className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2">
              {isAr ? 'ابدأ الآن - اختر مسارك' : 'Commencer - Choisissez votre voie'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services Split Section */}
      <section id="services" className="py-32 px-6 relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">
              {isAr ? 'كيف يمكننا مساعدتك؟' : 'Comment pouvons-nous vous aider ?'}
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              {isAr ? 'اختر الخدمة التي تناسب احتياجات علامتك التجارية اليوم' : 'Choisissez le service qui correspond aux besoins de votre marque aujourd\\'hui'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Store Builder Service */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-blue-500/30 rounded-[3rem] p-10 lg:p-14 hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div>
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                  <Globe className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
                  {isAr ? '1. بناء متجر إلكتروني احترافي' : '1. Création de Boutique Pro'}
                </h3>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                  {isAr 
                    ? 'ليس لديك موقع؟ نحن نبني لك متجراً مستقلاً (لا عمولات، لا قيود) بتصميم عصري وأدوات تسويقية مدمجة لرفع نسبة التحويل (Conversion Rate) ومنافسة كبار السوق.' 
                    : 'Vous n\\'avez pas de site ? Nous construisons une boutique indépendante (sans commissions) avec un design moderne et des outils marketing intégrés pour maximiser vos ventes.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  alert(isAr ? 'سيتم توجيهك قريباً لصفحة بناء المتجر. مؤقتاً تواصل معنا.' : 'Vous serez bientôt redirigé vers le Store Builder. Contactez-nous en attendant.');
                  window.open(\`https://wa.me/\${company.phone.replace(/\\D/g, '')}?text=\${encodeURIComponent('مرحباً BEYA CREATIVE، أريد الاستفسار عن خدمة بناء متجر إلكتروني احترافي.')}\`, '_blank');
                }}
                className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-900/50 relative z-10"
              >
                {isAr ? 'اطلب تصميم متجرك' : 'Commander ma boutique'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Manufacturing Service */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 rounded-[3rem] p-10 lg:p-14 hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div>
                <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20">
                  <Factory className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
                  {isAr ? '2. تصنيع الملابس الجاهزة (Confection)' : '2. Confection & Production'}
                </h3>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                  {isAr 
                    ? 'لديك موقع مسبقاً وتحتاج فقط إلى سلع ذات جودة عالية؟ نحن نقدم لك تصنيعاً مخصصاً بدقة متناهية، مع التغليف والخدمات اللوجستية المتكاملة.' 
                    : 'Vous avez déjà votre site et cherchez des produits premium ? Nous fabriquons vos vêtements sur-mesure avec une précision extrême et un packaging soigné.'}
                </p>
              </div>
              <button onClick={() => document.getElementById('contact-form')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest transition-colors shadow-lg shadow-purple-900/50 relative z-10">
                {isAr ? 'اطلب تصنيع منتجاتك' : 'Commander mes produits'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Production Form (The original calculator) */}
      <section id="contact-form" className="py-32 px-6 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              {isAr ? 'حاسبة التصنيع وطلب الإنتاج' : 'Simulateur de Production'}
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
              {isAr ? 'أدخل تفاصيل القطع التي ترغب في تصنيعها لتعرف التكلفة التقديرية فوراً.' : 'Entrez les détails de vos modèles pour obtenir une estimation immédiate.'}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <form onSubmit={async (e) => {
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
                setErrorMsg(isAr ? 'المرجو إدخال الإسم الكامل' : 'Veuillez entrer votre nom complet');
                return;
              }

              setIsSending(true);
              try {
                for (const m of models) {
                  const finalType = ((m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type) + (m.provideFabric ? ' (CMT - Client Tissu)' : '');
                  await saveLead({
                    name: clientName, email: clientEmail, phone: fullPhone, ville: clientVille,
                    type: finalType, quantity: Number(m.quantity) || 1,
                    tailles: Object.fromEntries(Object.entries(m.tailles).filter(([_, v]) => v !== '').map(([k, v]) => [k, Number(v)])),
                    details: m.details, photo: m.photos?.[0] || m.photo!, photos: m.photos || (m.photo ? [m.photo] : []),
                  });
                }
                
                trackPixelEvent('Lead', {
                  content_name: models.map(m => m.type).join(', '),
                  content_category: 'Confection Lead',
                  value: models.reduce((acc, m) => acc + (Number(m.quantity) || 1), 0),
                  currency: 'MAD'
                });

                setIsSending(false);
                setSubmittedName(clientName);
                
                const newId = \`user-\${Date.now()}\`;
                const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
                const newClient = {
                  id: newId, nom: clientName, role: 'client' as const,
                  email: (clientEmail && clientEmail !== 'Non spécifié' ? clientEmail : \`\${clientName.replace(/\\s+/g, '').toLowerCase()}_\${newId.slice(0, 4)}@beya.ma\`).toLowerCase().trim(),
                  telephone: fullPhone, password: autoCode, pinCode: autoCode,
                  actif: true, ville: clientVille || '', adresse: ''
                };
                await saveRecord('users', newClient);
                setNewClientCode({ name: clientName, code: autoCode, email: newClient.email, phone: fullPhone, id: newId });
                
                setShowSuccess(true);
                setModels([emptyModel()]);
                setSimulatorStep(1);
                sendEmailNotification(
                  clientName, fullPhone, clientEmail, clientVille,
                  models.map(m => ({ type: (m.type === 'Autre' || m.type === 'آخر') ? m.customType : m.type, quantity: Number(m.quantity) || 1 }))
                );
                sendPushToAll('🧵 Nouvelle Demande!', \`\${clientName} — \${models.map(m => m.type).join(', ')}\`, '/demandes').catch(() => {});
                formElement.reset();
              } catch (err: any) {
                setIsSending(false);
                setErrorMsg(isAr ? 'وقع خطأ أثناء الإرسال.' : 'Une erreur est survenue.');
              }
            }}>
              
              <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-center gap-4 mb-10 relative z-10">
                  <div className={\`h-2 rounded-full transition-all \${simulatorStep >= 1 ? 'w-20 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'w-6 bg-slate-700'}\`}></div>
                  <div className={\`h-2 rounded-full transition-all \${simulatorStep >= 2 ? 'w-20 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'w-6 bg-slate-700'}\`}></div>
                </div>

                {simulatorStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                    {models.map((m, idx) => (
                      <div key={m.id} className="border border-white/10 bg-slate-900 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                          <h3 className="font-black text-white text-lg uppercase tracking-widest">{isAr ? 'الموديل' : 'Modèle'} {idx + 1}</h3>
                          {models.length > 1 && (
                            <button type="button" onClick={() => setModels(prev => prev.filter(x => x.id !== m.id))} className="text-rose-400 hover:bg-rose-500/20 p-2 rounded-lg transition-colors">
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'نوع اللباس' : 'Type de vêtement'}</label>
                            <div className="relative">
                              <select value={m.type} onChange={e => updateModel(m.id, { type: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-purple-500 transition-colors appearance-none text-white">
                                {tarifsDb.length > 0 ? tarifsDb.map(t => <option key={t.id} value={t.titre}>{t.titre}</option>) : ['T-Shirt','Polo','T-Shirt Oversize','Sweat / Hoodie','Djellaba / Gandoura','Ensemble / Survêtement','Pyjama','Uniforme / Travail','Pantalon'].map(t => <option key={t}>{t}</option>)}
                                <option value="Autre">{isAr ? 'نوع آخر (Autre...)' : 'Autre...'}</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                            </div>
                            {m.type === 'Autre' && (
                              <input type="text" value={m.customType} onChange={e => updateModel(m.id, { customType: e.target.value })} placeholder={isAr ? 'حدد النوع' : 'Spécifiez'} className="mt-3 w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-purple-500 text-white" required />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الكمية الإجمالية' : 'Quantité Totale'}</label>
                            <input type="number" min="1" placeholder="100" value={m.quantity} onChange={e => updateModel(m.id, { quantity: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-purple-500 text-white" required />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{isAr ? 'تفاصيل (ألوان، طباعة...)' : 'Détails (Couleurs, Impression...)'}</label>
                          <textarea rows={3} value={m.details} onChange={e => updateModel(m.id, { details: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-purple-500 resize-none text-white" placeholder={isAr ? "اشرح بالتفصيل..." : "Détails..."} />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{isAr ? 'صورة الموديل (إجباري)' : 'Photo du modèle (Obligatoire)'}</label>
                          <div className="flex flex-wrap gap-3">
                            {(m.photos || (m.photo ? [m.photo] : [])).map((p, pIdx) => (
                              <div key={pIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                                <img src={p} className="w-full h-full object-cover" alt="" />
                                <button type="button" onClick={() => removeModelPhoto(m.id, pIdx)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <label className="w-20 h-20 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition-colors">
                              <ImageIcon className="w-5 h-5 text-slate-500 mb-1" />
                              <span className="text-[9px] font-black uppercase text-slate-400">Ajouter</span>
                              <input type="file" accept="image/*" onChange={e => handleModelPhoto(m.id, e)} className="hidden" />
                            </label>
                          </div>
                        </div>
                        
                        {/* Estimate */}
                        {(() => {
                          const est = calculateEstimate(m.type, m.quantity, m.provideFabric);
                          if (!est) return null;
                          return (
                            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-center justify-between mt-4">
                              <span className="text-xs font-black text-purple-400 uppercase">{isAr ? 'التكلفة التقديرية:' : 'Coût Estimé:'}</span>
                              <span className="text-sm font-black text-white">{est.totalMin.toLocaleString()} - {est.totalMax.toLocaleString()} MAD</span>
                            </div>
                          );
                        })()}
                      </div>
                    ))}

                    <button type="button" onClick={() => setModels(prev => [...prev, emptyModel()])} className="w-full py-4 border border-dashed border-slate-600 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 hover:border-slate-500 transition-colors">
                      + {isAr ? 'إضافة موديل' : 'Ajouter un modèle'}
                    </button>

                    <button type="submit" className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-purple-900/50 hover:bg-purple-500 transition-colors flex justify-center items-center gap-2 mt-8">
                      {isAr ? 'التالي' : 'Suivant'} <ArrowRight className={\`w-5 h-5 \${isAr ? '-scale-x-100' : ''}\`} />
                    </button>
                  </div>
                )}

                {simulatorStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-left-4 duration-300 relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6">{isAr ? 'معلومات التواصل' : 'Vos coordonnées'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الإسم الكامل' : 'Nom Complet'}</label>
                        <input type="text" name="name" className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 font-bold text-white outline-none focus:border-purple-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                        <input type="email" name="email" className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 font-bold text-white outline-none focus:border-purple-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الهاتف / الواتساب' : 'Téléphone'}</label>
                        <div className="flex gap-2">
                          <select name="countryCode" className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-2 font-bold outline-none focus:border-purple-500 appearance-none text-center text-white">
                            <option value="+212">+212</option>
                            <option value="+33">+33</option>
                          </select>
                          <input type="tel" name="phone" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 font-bold text-white outline-none focus:border-purple-500" required dir="ltr"/>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المدينة' : 'Ville'}</label>
                        <input type="text" name="ville" className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 font-bold text-white outline-none focus:border-purple-500" required />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                      <button type="button" onClick={() => setSimulatorStep(1)} className="px-6 py-5 bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all">{isAr ? 'رجوع' : 'Retour'}</button>
                      <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-blue-900/50 hover:bg-blue-500 transition-all">
                        {isAr ? 'تأكيد الطلب' : 'Confirmer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-slate-500 text-center text-xs font-black uppercase tracking-widest border-t border-white/5 relative z-20">
        &copy; {new Date().getFullYear()} BEYA CREATIVE. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );`;

  content = stateLogic + newRender + "\n}\n";
  fs.writeFileSync('src/pages/LandingPage.tsx', content, 'utf8');
  console.log("Successfully rebuilt LandingPage.tsx");
} catch(err) {
  console.error("Failed:", err);
}
