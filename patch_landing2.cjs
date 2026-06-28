const fs = require('fs');

let c = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

c = c.replace(/<div className="space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)}/m, `<div className="space-y-4">
              {newClientCode && (
                <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 md:p-8 mb-8 text-right shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center justify-between">
                    <span>{isAr ? 'معلومات حسابك الخاص' : 'Vos informations de connexion'}</span>
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'البريد الإلكتروني (Email)' : 'Email de connexion'}</p>
                        <p className="text-sm font-bold text-slate-700 font-sans" dir="ltr">{newClientCode.email}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl flex items-center justify-between border border-emerald-100">
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{isAr ? 'الرمز السري (Code)' : 'Code secret'}</p>
                        <p className="text-2xl font-black text-slate-900 tracking-[0.3em] font-mono">{newClientCode.code}</p>
                      </div>
                    </div>
                  </div>
  
                  <div className="mt-6 flex flex-col gap-3 relative z-10">
                    <button
                      onClick={async () => {
                        const el = document.getElementById('welcome-pdf-' + newClientCode.code);
                        if (el) el.style.display = 'block';
                        await generatePDF('welcome-pdf-' + newClientCode.code, \`BeyaCreative_Bienvenue_\${newClientCode.name.replace(/\\s+/g, '_')}\`);
                        if (el) el.style.display = 'none';
                      }}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {isAr ? 'تحميل ملف الترحيب (PDF)' : 'Télécharger Welcome PDF'}
                    </button>
                    <a href="/#/login" className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2">
                      {isAr ? 'تسجيل الدخول لحسابك' : 'Se connecter à votre espace'}
                    </a>
                  </div>
                </div>
              )}
  
              <a 
                href={\`https://wa.me/\${company.phone ? company.phone.replace(/\\D/g, '') : '212624465962'}?text=\${encodeURIComponent(isAr ? \`مرحباً BEYA CREATIVE، لقد سجلت طلبي للتو باسم \${submittedName}. \${newClientCode ? \`الرمز السري الخاص بي هو: \${newClientCode.code}.\` : ''} أريد تأكيد الطلب والبدء في العينة.\` : \`Bonjour BEYA CREATIVE, je viens de passer ma commande sous le nom \${submittedName}. \${newClientCode ? \`Mon code secret est : \${newClientCode.code}.\` : ''} Je souhaite confirmer ma commande.\`)}\`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3"
              >
                {isAr ? 'تأكيد الطلب عبر الواتساب' : 'Confirmer via WhatsApp'}
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z/></svg>
              </a>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                {isAr ? 'إغلاق والعودة' : 'Fermer et retourner'}
              </button>
            </div>
            
          {/* Hidden PDF Template for Client Welcome */}
          {newClientCode && (
            <div id={\`welcome-pdf-\${newClientCode.code}\`} style={{ display: 'none' }}>
              <div dir={isAr ? 'rtl' : 'ltr'} style={{ width: '210mm', minHeight: '297mm', fontFamily: isAr ? 'Arial, sans-serif' : 'Georgia, serif', padding: '20mm', color: '#1e293b', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '3px solid #4f46e5', paddingBottom: '20px' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e1b4b', letterSpacing: '-1px', margin: 0 }}>BEYA<span style={{ color: '#4f46e5' }}>CREATIVE</span></h1>
                    <p style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700, letterSpacing: '3px', margin: '4px 0 0', textTransform: 'uppercase' }}>Manufacturing Excellence</p>
                  </div>
                  <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>beyacreative.com</p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{company?.phone || '+212624465962'}</p>
                  </div>
                </div>
  
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px' }}>{isAr ? 'مرحباً بك في فضائك الخاص' : 'Bienvenue dans votre espace client'}</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: '0 0 12px' }}>{isAr ? \`مرحباً، \${newClientCode.name} 👋\` : \`Bonjour, \${newClientCode.name} 👋\`}</p>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>{isAr ? 'تم تفعيل حسابك في BEYA CREATIVE. يمكنك الآن متابعة طلباتك وتحميل وثائقك والتواصل مع فريقنا مباشرة من بوابتك.' : 'Votre compte BEYA CREATIVE est activé. Vous pouvez désormais suivre vos commandes, télécharger vos documents et communiquer avec notre équipe directement depuis votre portail.'}</p>
                </div>
  
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'البريد الإلكتروني' : 'Email de connexion'}</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{newClientCode.email}</p>
                  </div>
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'الرمز السري' : 'Code secret'}</p>
                    <p style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', letterSpacing: '6px', margin: 0, fontFamily: 'monospace' }}>{newClientCode.code}</p>
                  </div>
                </div>
  
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px', borderRight: isAr ? '4px solid #4f46e5' : 'none', borderLeft: isAr ? 'none' : '4px solid #4f46e5', paddingRight: isAr ? '12px' : 0, paddingLeft: isAr ? 0 : '12px', margin: '0 0 14px' }}>{isAr ? 'من نحن؟' : 'Qui sommes-nous ?'}</h2>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{isAr ? 'BEYA CREATIVE مصنع نسيج مغربي متخصص في الخياطة المخصصة. فريقنا من الخياطات الخبيرات يعملن بأنماط دقيقة وعينات مصادق عليها لضمان أن كل قطعة تتوافق تمامًا مع رؤيتك.' : 'BEYA CREATIVE est une manufacture textile marocaine spécialisée dans la confection sur-mesure. Notre équipe de couturières expertes travaille avec des patrons de précision et des échantillons validés pour garantir que chaque pièce correspond exactement à votre vision.'}</p>
                </div>
  
                <div style={{ background: '#1e1b4b', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 12px', opacity: 0.9 }}>{isAr ? 'التزاماتنا للجودة' : 'Nos engagements qualité'}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, margin: 0, opacity: 0.9 }}>{isAr ? '✓ خياطات خبيرات ومعتمدات' : '✓ Couturières expertes et certifiées'}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, margin: 0, opacity: 0.9 }}>{isAr ? '✓ أقمشة مختارة من موردين موثوقين' : '✓ Matières sélectionnées chez des fournisseurs fiables'}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, margin: 0, opacity: 0.9 }}>{isAr ? '✓ كل قطعة تُفحص قبل التسليم' : '✓ Chaque pièce inspectée avant livraison'}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, margin: 0, opacity: 0.9 }}>{isAr ? '✓ احترام صارم للمواعيد المتفق عليها' : '✓ Respect strict des délais convenus'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}`);

fs.writeFileSync('src/pages/LandingPage.tsx', c);
