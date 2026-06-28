const fs = require('fs');

const code = fs.readFileSync('src/pages/Demandes.tsx', 'utf8');

const replacement = `          <div
            id="devis-pdf-template"
            className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-white font-sans"
            style={{ color: '#0f172a', backgroundColor: 'white', direction: isAr ? 'rtl' : 'ltr' }}
          >
            {/* ===== HEADER ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4f46e5', padding: '20px 32px 14px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                {company.logoInvoice && company.logoInvoice !== '/logo.png' ? (
                  <img src={company.logoInvoice} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
                ) : company.logoUrl && company.logoUrl !== '/logo.png' ? (
                  <img src={company.logoUrl} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                    {company.name?.charAt(0) || 'B'}
                  </div>
                )}
                <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0, textTransform: 'uppercase' }}>{company.name || 'BEYA CREATIVE'}</h1>
                  <p style={{ fontSize: '8px', fontWeight: 700, color: '#6366f1', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{company.subtitle || (isAr ? 'صناعة النسيج' : 'Confection Textile')}</p>
                </div>
              </div>
              <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1e1b4b', textTransform: 'uppercase' }}>{isAr ? 'عرض سعر رسمي' : 'DEVIS OFFICIEL'}</h2>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', margin: '2px 0 0' }}>{isAr ? 'رقم' : 'N°'} {devisNum} — {new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* ===== EMETTEUR / CLIENT ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '12px 32px', fontSize: '11px', direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
                <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'المُصْدِر (الشركة)' : 'Émetteur'}</h3>
                <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{company.name}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{company.address}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{isAr ? 'الهاتف:' : 'Tél:'} <span dir="ltr">{company.phone}</span></p>
                {company.email && <p style={{ fontWeight: 600, color: '#64748b', margin: '0', fontSize: '10px' }}>{company.email}</p>}
                {company.ice && company.ice !== '000000000000000' && <p style={{ fontWeight: 600, color: '#94a3b8', margin: '3px 0 0', fontSize: '9px' }}>ICE: {company.ice} {company.rc && company.rc !== '123456' ? \`| RC: \${company.rc}\` : ''}</p>}
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
                <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'الزبون / المستلم' : 'Client / Destinataire'}</h3>
                <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{devisLead.name}</p>
                <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }} dir="ltr">{devisLead.phone}</p>
                {devisLead.email && <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{devisLead.email}</p>}
                {devisLead.ville && <p style={{ fontWeight: 600, color: '#64748b', margin: '0', fontSize: '10px' }}>{devisLead.ville}</p>}
              </div>
            </div>

            {/* ===== OBJET ===== */}
            <div style={{ margin: '0 32px 10px', background: '#eef2ff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #c7d2fe', textAlign: isAr ? 'right' : 'left' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#4338ca' }}>
                {isAr ? 'الموضوع : عرض سعر تفصيلي — ' : 'Objet : Devis de confection — '}<span style={{ fontWeight: 900 }}>{devisLead.type}</span> × {currentQuantity} {isAr ? 'قطعة' : 'pièces'}
              </p>
            </div>

            {/* ===== TABLE ===== */}
            <div style={{ margin: '0 32px 10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', direction: isAr ? 'rtl' : 'ltr' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px', textAlign: isAr ? 'right' : 'left', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: isAr ? '0 8px 0 0' : '8px 0 0 0' }}>{isAr ? 'الوصف' : 'Description'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'الكمية' : 'Qté'}</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'ثمن الوحدة' : 'PU'} (MAD)</th>
                    <th style={{ padding: '10px 12px', textAlign: isAr ? 'left' : 'right', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', borderRadius: isAr ? '8px 0 0 0' : '0 8px 0 0' }}>{isAr ? 'المجموع' : 'Total'} (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Number(matierePrice) > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, textAlign: isAr ? 'right' : 'left' }}>{isAr ? 'الثوب والسلعة المرافقة' : 'Tissu & Fournitures'} {fabricType ? <span style={{color: '#6366f1'}}>({fabricType})</span> : ''}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{currentQuantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }} dir="ltr">{Number(matierePrice).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: isAr ? 'left' : 'right', fontWeight: 800 }} dir="ltr">{totalMatiere.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, textAlign: isAr ? 'right' : 'left' }}>{isAr ? 'الخياطة واليد العاملة' : "Confection & Main d'œuvre"}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{currentQuantity}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }} dir="ltr">{Number(laborPrice || 0).toFixed(2)}</td>
                    <td style={{ padding: '10px 12px', textAlign: isAr ? 'left' : 'right', fontWeight: 800 }} dir="ltr">{totalLabor.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===== TOTALS ===== */}
            <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', margin: '0 32px 14px' }}>
              <div style={{ width: '320px', direction: isAr ? 'rtl' : 'ltr' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                  <span>{isAr ? 'ثمن القطعة الواحدة' : 'Prix Unitaire'}</span>
                  <span style={{ fontWeight: 800 }} dir="ltr">{unitPrice.toFixed(2)} MAD</span>
                </div>
                {Number(matierePrice) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    <span>{isAr ? 'مجموع السلعة' : 'Sous-total Matière'}</span>
                    <span style={{ fontWeight: 800 }} dir="ltr">{totalMatiere.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{isAr ? 'مجموع اليد العاملة' : 'Sous-total MO'}</span>
                  <span style={{ fontWeight: 800 }} dir="ltr">{totalLabor.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '12px 16px', borderRadius: '12px 12px 0 0', marginTop: '12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-1px' }} dir="ltr">{totalGeneral.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '12px', fontWeight: 800 }}>MAD</span></span>
                  <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, display: 'block' }}>{isAr ? 'المجموع العام' : 'Total Général'}</span>
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>TTC</span>
                  </div>
                </div>
                {/* ACOMPTE 50% HIGHLIGHT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px 16px', borderRadius: '0 0 12px 12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900 }} dir="ltr">{(totalGeneral * 0.5).toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '10px' }}>MAD</span></span>
                  <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>{isAr ? 'التسبيق المطلوب' : 'Acompte à la commande'}</span>
                    <span style={{ fontSize: '8px', fontWeight: 600, opacity: 0.9 }}>{isAr ? '50% (لشراء الثوب)' : '50% requis'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== PAGE 2 : CHARTE QUALITE ET PROCESSUS ===== */}
            <div style={{ pageBreakBefore: 'always', padding: '40px 32px', direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', margin: 0 }}>{isAr ? 'ميثاق الجودة والعمل' : 'LA CHARTE QUALITÉ BEYA'}</h2>
                <p style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', margin: '6px 0 0' }}>{isAr ? 'ضمانكم للتميز والاحترافية' : "Votre Garantie d'Excellence"}</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155', lineHeight: '1.6', margin: 0, textAlign: 'justify' }}>
                  {isAr 
                    ? \`لضمان منتوج نهائي بجودة عالية وخدمة شفافة بالكامل، نعتمد على مسار إنتاج صارم يمر عبر 4 مراحل أساسية. يُعتبر هذا العرض بمثابة عقد التزام مبدئي بين \${company.name} و \${devisLead.name}.\`
                    : \`Afin de vous garantir un produit final d'une qualité irréprochable et un service totalement transparent, nous avons mis en place un processus de production strict en 4 étapes. Ce devis fait office de contrat d'engagement entre \${company.name} et \${devisLead.name}.\`}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Etape 1 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #4f46e5', borderRight: isAr ? '4px solid #4f46e5' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>1</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'الموافقة وشراء الثوب' : 'Accord & Achat Matière'}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? \`دفع التسبيق المقدر بـ 50% يُمثل الموافقة الرسمية على الطلب. هذا المبلغ مخصص بالكامل لشراء الثوب الخاص بكم فوراً والذي سيتم تخزينه بأمان في ورشتنا.\`
                        : \`Le paiement de l'acompte de 50% valide officiellement la commande. Ce montant est exclusivement dédié à l'achat immédiat de votre tissu qui restera stocké en toute sécurité dans nos ateliers.\`}
                    </p>
                  </div>
                </div>

                {/* Etape 2 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #f59e0b', borderRight: isAr ? '4px solid #f59e0b' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>2</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'صناعة العينة (Echantillon)' : "Création de l'Échantillon"}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? \`قبل البدء في الإنتاج الكلي، يقوم مكتب الدراسات الخاص بنا بتفصيل وصناعة أول نموذج (العينة) بدقة متناهية. يتم إرسال هذه العينة إليكم فعلياً أو عرضها عبر مكالمة فيديو.\`
                        : \`Avant de lancer la production globale, notre bureau d'étude confectionne le tout premier prototype (l'Échantillon) avec la plus grande précision. Cet échantillon vous est ensuite envoyé physiquement ou présenté lors d'une session vidéo.\`}
                    </p>
                  </div>
                </div>

                {/* Etape 3 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #10b981', borderRight: isAr ? '4px solid #10b981' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>3</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'مصادقة الزبون (OK)' : 'Validation Client (OK)'}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? \`تقومون بفحص الفصالة، جودة الثوب والتشطيبات الخاصة بالعينة. لا ننتقل إلى مرحلة الإنتاج إلا بعد موافقتكم الرسمية وإعطاء الضوء الأخضر (OK). رضاكم التام هو أولوية.\`
                        : \`Vous vérifiez la coupe, la qualité du tissu et les finitions de l'échantillon. Nous n'entamons la suite de la production qu'après votre validation officielle et votre feu vert ("OK") explicite. Votre satisfaction totale est primordiale.\`}
                    </p>
                  </div>
                </div>

                {/* Etape 4 */}
                <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #3b82f6', borderRight: isAr ? '4px solid #3b82f6' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>4</div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'الإنتاج الكلي' : 'Production Globale'}</h3>
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                      {isAr 
                        ? \`بمجرد المصادقة على العينة، يبدأ الإنتاج التسلسلي باحترام تام ومطابقة 100% للعينة المصادق عليها. يتم دفع باقي المبلغ (50%) عند التسليم النهائي للطلبية.\`
                        : \`Une fois l'échantillon validé, la production en série démarre en respectant à 100% la copie conforme de l'échantillon. Le reste du paiement (50%) s'effectue à la livraison finale de la commande.\`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div style={{ margin: '30px 32px 0', borderTop: '2px solid #e2e8f0', paddingTop: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 3px' }}>
                {isAr ? \`شكرا على ثقتكم — \${company.name}\` : \`Merci de votre confiance — \${company.name}\`}
              </p>
              <p style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                {company.address} | <span dir="ltr">{company.phone}</span> | {company.email}
              </p>
            </div>
          </div>`;

const startIdx = code.indexOf('<div\n            id="devis-pdf-template"');
const endIdx = code.indexOf('          </div>\n        );\n      })()}', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = code.slice(0, startIdx) + replacement + '\n' + code.slice(endIdx + 21);
  fs.writeFileSync('src/pages/Demandes.tsx', newCode);
  console.log('Successfully replaced devis template');
} else {
  console.log('Could not find template boundaries');
}
