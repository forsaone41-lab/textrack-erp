import React from 'react';
import { Facture, Commande, CompanyProfile } from '../types';
import { ClipboardList } from 'lucide-react';

interface InvoicePROProps {
  facture: Facture;
  commande?: Commande;
  company: CompanyProfile;
  id?: string;
  modelPhoto?: string;
  lang?: 'fr' | 'ar';
}

export const InvoicePRO: React.FC<InvoicePROProps> = ({ facture, commande, company, id, modelPhoto, lang = 'fr' }) => {
  const isAr = lang === 'ar';
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(isAr ? 'ar-MA' : 'fr-MA', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const isDevis = facture.typeDoc === 'devis';
  const isRecu = facture.typeDoc === 'recu';
  const docTitle = isAr
    ? (isDevis ? 'عرض سعر' : isRecu ? 'وصل أداء' : 'فاتورة')
    : (isDevis ? 'DEVIS' : isRecu ? 'REÇU' : 'FACTURE');
  const displayLogo = company.logoInvoice || company.logoUrl || '/logo.png';
  const resolvedModelPhoto = modelPhoto || (commande as any)?.modelePhoto || (commande as any)?.photo;
  
  const total = facture.montant;
  const qte = commande?.quantite || 1;
  const pu = total / qte;

  const avance = facture.avance || 0;
  const reste = facture.montant - avance;

  if (isRecu) {
    return (
      <div id={id} className="bg-white mx-auto" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Georgia, serif', padding: '14mm 16mm', color: '#1e293b', fontSize: '13px', lineHeight: '1.6' }}>

        {/* Top: company left, title right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            {(company.logoInvoice || company.logoUrl) && (
              <img src={company.logoInvoice || company.logoUrl} style={{ height: '40px', objectFit: 'contain', marginBottom: '12px' }} alt={company.name} />
            )}
            <p style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{company.name}</p>
            <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 2px' }}>{company.address || 'Zone Industrielle, Meknès'}</p>
            <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 2px' }}>Tél : {company.phone}</p>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{company.email || 'contact@beyacreative.com'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', textDecoration: 'underline', marginBottom: '24px' }}>Reçu de Paiement</h1>
            <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 2px' }}>{facture.client}</p>
            <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 2px' }}>Client Partenaire</p>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>Maroc</p>
          </div>
        </div>

        {/* Section: Reçu de Paiement */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Reçu de Paiement</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#1e293b' }}>
            {[
              ['Date :', fmtDate(facture.date)],
              ['N° du reçu :', facture.numero],
              ['Reçu de la part de :', facture.client],
              ...(commande ? [['Commande référencée :', `${commande.reference}${commande.modele ? ' — ' + commande.modele : ''}`]] : [])
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '160px', flexShrink: 0, color: '#1e293b' }}>{label}</span>
                <span style={{ flex: 1, borderBottom: '1px solid #94a3b8', paddingBottom: '2px', color: '#1e293b' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Détails du Paiement */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Détails du Paiement</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#1e293b' }}>
            {[
              ['Total commande :', `${facture.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`, false],
              ['Montant payé (avance) :', `${avance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`, true],
              ['Reste à payer :', `${reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`, false],
              ['Mode de paiement :', facture.banque || 'Espèces / Virement', false],
              ['Motif du paiement :', 'Avance sur commande de confection textile', false],
            ].map(([label, value, bold]) => (
              <div key={label as string} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '160px', flexShrink: 0, color: '#1e293b' }}>{label}</span>
                <span style={{ flex: 1, borderBottom: '1px solid #94a3b8', paddingBottom: '2px', fontWeight: bold ? 700 : 400, color: '#1e293b' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation */}
        <div style={{ marginBottom: '4rem', color: '#1e293b' }}>
          <p style={{ marginBottom: '1rem' }}>Le montant mentionné ci-dessus a été dûment payé et reçu par :</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Nom du destinataire :', company.name],
              ['Signature / Cachet :', ''],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ width: '160px', flexShrink: 0 }}>{label}</span>
                <span style={{ flex: 1, borderBottom: '1px solid #94a3b8', paddingBottom: '2px', minHeight: '24px', position: 'relative' }}>
                  {value}
                  {label === 'Signature / Cachet :' && company.cachetUrl && (
                    <img src={company.cachetUrl} style={{ position: 'absolute', right: '10px', bottom: '-10px', height: '80px', objectFit: 'contain', opacity: 0.9, zIndex: 10 }} alt="Cachet" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barcode + Footer */}
        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Merci pour votre paiement !</p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{company.name} — {company.address || 'Zone Industrielle, Meknès'} — {company.phone}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
              {facture.numero.split('').map((ch, i) => {
                const code = ch.charCodeAt(0);
                const bars = [
                  (code >> 6) & 1, (code >> 5) & 1, (code >> 4) & 1,
                  (code >> 3) & 1, (code >> 2) & 1, (code >> 1) & 1, code & 1, 1
                ];
                return bars.map((b, j) => (
                  <rect
                    key={`${i}-${j}`}
                    x={i * 9 + j * 1.1}
                    y={0}
                    width={b ? 1.1 : 0.5}
                    height={b ? 40 : 28}
                    fill="#1e1b4b"
                  />
                ));
              })}
            </svg>
            <p style={{ fontFamily: 'monospace', fontSize: '8px', color: '#64748b', letterSpacing: '0.1em' }}>{facture.numero}</p>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div id={id} dir={isAr ? 'rtl' : 'ltr'} className="bg-white p-10 mx-auto text-slate-800" style={{ width: '210mm', minHeight: '297mm', fontFamily: isAr ? "'Cairo', system-ui, sans-serif" : "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <img src={displayLogo} className="h-14 max-w-[140px] object-contain" alt={company.name} />
          <div>
            <h1 className="text-[20px] font-black text-slate-900 uppercase leading-none tracking-tight">{company.name}</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.18em] mt-1">{company.subtitle || (isAr ? 'ورشة الخياطة وتصنيع الملابس' : 'Confection de vêtement')}</p>
          </div>
        </div>
        <div className={isAr ? 'text-left' : 'text-right'}>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{docTitle}</h2>
          <p className="text-[11px] font-bold text-slate-500">{isAr ? `رقم ${facture.numero}` : `N° ${facture.numero}`} — {fmtDate(facture.date)}</p>
        </div>
      </div>

      <div className="h-0.5 w-full bg-slate-200 mb-7" />

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.18em] mb-2">{isAr ? 'المرسل / الورشة' : 'Émetteur / Prestataire'}</p>
          <p className="text-sm font-black text-slate-900 uppercase mb-1">{company.dirigeant ? `${company.dirigeant} (${company.name})` : company.name}</p>
          <div className="text-[11px] font-medium text-slate-600 leading-relaxed space-y-0.5">
            {company.regimeFiscal && <p className="font-bold text-indigo-700">{company.regimeFiscal}</p>}
            {company.address && <p>{company.address}</p>}
            {company.phone && <p>{isAr ? 'الهاتف:' : 'Tél:'} {company.phone}</p>}
            {company.email && <p>{company.email}</p>}
          </div>
          {(company.ice && company.ice !== '000000000000000') && (
            <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-slate-200 font-mono text-[10px]">
              <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">ICE: <strong className="text-indigo-600">{company.ice}</strong></span>
              {company.if_tax && company.if_tax !== '0000000' && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">IF: {company.if_tax}</span>}
              {company.patente && company.patente !== '00000000' && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">TP: {company.patente}</span>}
              {company.cnie && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">CNIE: {company.cnie}</span>}
            </div>
          )}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.18em] mb-2">{isAr ? 'الزبون / المستفيد' : 'Client / Destinataire'}</p>
            <p className="text-sm font-black text-slate-900 uppercase mb-1">{facture.client}</p>
            <div className="text-[11px] font-medium text-slate-600 leading-relaxed space-y-0.5">
              {facture.clientGerant && <p><strong>Gérant :</strong> {facture.clientGerant}</p>}
              {facture.clientAdresse ? <p>{facture.clientAdresse}</p> : <p>{isAr ? 'زبون شريك' : 'Client Partenaire'}</p>}
              {commande?.reference && <p className="font-mono text-indigo-600 font-bold">{commande.reference}</p>}
            </div>
            {(facture.clientIce || facture.clientRc) && (
              <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-slate-200 font-mono text-[10px]">
                {facture.clientIce && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">ICE: <strong className="text-indigo-600">{facture.clientIce}</strong></span>}
                {facture.clientRc && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">RC: {facture.clientRc}</span>}
              </div>
            )}
          </div>
          {resolvedModelPhoto && (
            <img
              src={resolvedModelPhoto}
              alt={commande?.modele || 'Modèle'}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          )}
        </div>
      </div>

      {/* Objet */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-7 flex items-center justify-between gap-4">
        <p className="text-[11px] font-bold text-slate-700">
          {isAr
            ? `الموضوع: ${docTitle} للتفصيل والخياطة — ${commande?.modele || 'إنتاج نسيجي'} ${commande?.quantite ? `× ${commande.quantite} قطعة` : ''}`
            : `Objet : ${docTitle} de confection — ${commande?.modele || 'Production Textile'} ${commande?.quantite ? `× ${commande.quantite} pièces` : ''}`}
        </p>
      </div>

      {/* FACTURE / DEVIS: clean minimalist table layout */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-y border-slate-200">
              <th className={`${isAr ? 'text-right' : 'text-left'} py-3 px-4 text-[10px] font-black uppercase tracking-widest`}>{isAr ? 'البيان' : 'Description'}</th>
              <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest">{isAr ? 'الكمية' : 'Qté'}</th>
              <th className={`${isAr ? 'text-left' : 'text-right'} py-3 px-4 text-[10px] font-black uppercase tracking-widest`}>{isAr ? 'سعر القطعة (د.م)' : 'PU (MAD)'}</th>
              <th className={`${isAr ? 'text-left' : 'text-right'} py-3 px-4 text-[10px] font-black uppercase tracking-widest`}>{isAr ? 'المجموع (د.م)' : 'Total (MAD)'}</th>
            </tr>
          </thead>
          <tbody className="border-b border-slate-200">
            {facture.articles && facture.articles.length > 0 ? (
              facture.articles.map((art, idx) => (
                <tr key={art.id || idx} className="border-b border-slate-100">
                  <td className={`py-4 px-4 ${isAr ? 'text-right' : 'text-left'}`}>
                    <p className="font-bold text-slate-900 text-xs">{art.designation || (isAr ? 'منتج / خدمة' : 'Article / Service')}</p>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800 text-xs">{art.quantite}</td>
                  <td className={`py-4 px-4 ${isAr ? 'text-left' : 'text-right'} font-bold text-indigo-600 text-xs`}>{art.prixUnitaire.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-4 px-4 ${isAr ? 'text-left' : 'text-right'} font-black text-slate-900 text-xs`}>{art.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={`py-4 px-4 ${isAr ? 'text-right' : 'text-left'}`}>
                  <p className="font-bold text-slate-900 text-xs">{isAr ? 'الإنتاج النسيجي والخياطة' : 'Production Textile & Confection'}</p>
                  {commande?.modele && <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{commande.modele}</p>}
                </td>
                <td className="py-4 px-4 text-center font-bold text-slate-800 text-xs">{qte}</td>
                <td className={`py-4 px-4 ${isAr ? 'text-left' : 'text-right'} font-bold text-indigo-600 text-xs`}>{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                <td className={`py-4 px-4 ${isAr ? 'text-left' : 'text-right'} font-black text-slate-900 text-xs`}>{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals & Bank Info Row */}
        <div className="flex justify-between items-start gap-6 mt-6">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 text-[11px] text-slate-600 flex items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">
                {isAr ? 'بيانات التحويل البنكي' : 'Coordonnées Bancaires'}
              </p>
              <p><strong className="text-slate-800">{isAr ? 'البنك:' : 'Banque :'}</strong> {company.bankName || '—'}</p>
              <p><strong className="text-slate-800">{isAr ? 'المستفيد:' : 'Titulaire :'}</strong> {company.bankBeneficiary || company.name || '—'}</p>
              {company.rib && (
                <p className="font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 inline-block mt-1" dir="ltr">
                  RIB : {company.rib}
                </p>
              )}
            </div>
            {company.bankQrCode && (
              <div className="shrink-0 flex flex-col items-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs">
                <img
                  src={company.bankQrCode}
                  alt="QR Paiement"
                  className="w-24 h-24 object-contain rounded-lg"
                />
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-600 mt-1 text-center">
                  {isAr ? 'امسح للدفع السريع' : 'Scanner pour payer'}
                </span>
              </div>
            )}
          </div>

          <div className="w-72">
            {(!facture.articles || facture.articles.length === 0) && (
              <div className="flex justify-between py-1.5 px-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'سعر القطعة' : 'Prix Unitaire'}</span>
                <span className="text-[11px] font-bold text-slate-700">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 px-4 border-b border-slate-100 mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'المجموع الخام' : 'Total Brut'}</span>
              <span className="text-[11px] font-bold text-slate-700">{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            {avance > 0 && (
              <div className="flex justify-between py-1.5 px-3 bg-emerald-50 border border-emerald-200/60 rounded-lg text-emerald-800 text-[10.5px] font-bold my-1.5">
                <span>{isAr ? '✓ تسبيق مؤدى (نقداً / كاش):' : '✓ Acompte 50% réglé (Espèces):'}</span>
                <span className="font-mono font-black">- {avance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
              </div>
            )}
            <div className="bg-slate-900 rounded-xl p-4 text-white flex items-center justify-between mt-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-75">
                  {avance > 0 ? (isAr ? 'الرصيد المتبقي (الباقي)' : 'Reste à Payer (Solde)') : (isAr ? 'المجموع العام' : 'Total Général')}
                </p>
                <p className="text-[10px] font-black mt-0.5">{avance > 0 ? (isAr ? 'عند التسليم' : 'À la livraison') : (isDevis ? (isAr ? 'صافي للأداء' : 'Net à payer') : 'TTC / Exonéré TVA')}</p>
              </div>
              <div className={isAr ? 'text-left' : 'text-right'}>
                <span className="text-2xl font-black tracking-tight">{((avance > 0 ? reste : total)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs font-black ml-1.5 opacity-90">MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area: Conditions + Signature */}
      <div className="flex gap-6 mb-8">
        {/* Conditions */}
        <div className="flex-1 border border-slate-200 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2.5">
            <ClipboardList className="w-4 h-4 text-indigo-600" /> {isAr ? 'الشروط العامة' : 'Conditions Générales'}
          </h3>
          {isAr ? (
            <ul className="space-y-2 text-[11px] font-medium text-slate-600">
              <li><span className="text-indigo-600 font-black">1.</span> هذا العرض صالح لمدة <strong className="text-slate-900">15 يوماً</strong> من تاريخ الإصدار.</li>
              <li><span className="text-indigo-600 font-black">2.</span> يتم تأكيد الطلبية بأداء <strong className="text-slate-900">تسبيق 50%</strong> من المبلغ الإجمالي.</li>
              <li><span className="text-indigo-600 font-black">3.</span> يتم تثبيت <strong className="text-slate-900">مدة الإنتاج</strong> بعد المصادقة على العينة الأولية.</li>
              <li><span className="text-indigo-600 font-black">4.</span> أي <strong className="text-slate-900">تعديل على الموديل</strong> بعد الإطلاق قد يستلزم مراجعة التسعيرة.</li>
            </ul>
          ) : (
            <ul className="space-y-2 text-[11px] font-medium text-slate-600">
              <li><span className="text-indigo-600 font-black">1.</span> Ce {docTitle.toLowerCase()} est <strong className="text-slate-900">valable 15 jours</strong> à compter de la date d'émission.</li>
              <li><span className="text-indigo-600 font-black">2.</span> Un <strong className="text-slate-900">acompte de 50%</strong> est requis à la confirmation de la commande.</li>
              <li><span className="text-indigo-600 font-black">3.</span> Le <strong className="text-slate-900">délai de production</strong> sera confirmé après validation de l'échantillon.</li>
              <li><span className="text-indigo-600 font-black">4.</span> Toute <strong className="text-slate-900">modification du modèle</strong> après lancement peut entraîner une révision tarifaire.</li>
            </ul>
          )}
        </div>
        
        {/* Signature / Cachet */}
        <div className="w-1/3 flex flex-col items-center justify-center border border-slate-200 bg-slate-50/50 rounded-xl p-4 relative overflow-visible">
          <span className={`absolute top-2.5 ${isAr ? 'right-3' : 'left-3'} text-[9px] font-black text-slate-400 uppercase tracking-widest`}>
            {isAr ? 'الختم والتوقيع' : 'Cachet / Signature'}
          </span>
          {company.cachetUrl ? (
            <img src={company.cachetUrl} className="max-h-24 w-auto object-contain opacity-95 mix-blend-multiply mt-4" alt="Cachet" />
          ) : (
            <div className="border-2 border-dashed border-indigo-300 rounded-xl p-2.5 text-center mt-3 bg-white w-full shadow-2xs">
              <p className="text-[10px] font-black text-indigo-900 uppercase">ROYAUME DU MAROC</p>
              <p className="text-[11px] font-black text-indigo-700 leading-tight">{company.dirigeant || company.name}</p>
              <p className="text-[8.5px] font-bold text-slate-500 uppercase mt-0.5">{company.name} · Auto-Entrepreneur</p>
              <div className="font-mono text-[7.5px] text-slate-600 leading-tight mt-1 border-t border-slate-100 pt-1">
                ICE: {company.ice && company.ice !== '000000000000000' ? company.ice : '003457558000092'}<br />
                IF: {company.if_tax && company.if_tax !== '0000000' ? company.if_tax : '26008252'} · TP: {company.patente && company.patente !== '00000000' ? company.patente : '18604042'}
              </div>
              <span className="inline-block bg-indigo-600 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded mt-1">
                {avance > 0 ? (isAr ? 'تم استلام التسبيق 50%' : 'ACOMPTE 50% REÇU') : (isAr ? 'توقيع مصادق عليه' : 'SIGNATURE VALIDÉE')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          {isAr ? `شكراً لثقتكم — ${company.name}` : `Merci de votre confiance — ${company.name}`}
        </p>
        <p className="text-[9px] font-bold text-slate-500 mb-1">
          {[
            company.address,
            company.phone,
            company.email,
            company.ice && company.ice !== '000000000000000' ? `ICE: ${company.ice}` : null,
            company.if_tax && company.if_tax !== '0000000' ? `IF: ${company.if_tax}` : null,
          ].filter(Boolean).join(' | ')}
        </p>
        <p className="text-[8.5px] font-medium text-slate-400">
          {isAr
            ? 'الإعفاء من الضريبة على القيمة المضافة (TVA) بموجب المادة 91 من المدونة العامة للضرائب (نظام المقاول الذاتي)'
            : 'TVA non applicable — Article 91 du Code Général des Impôts (Régime de l\'Auto-Entrepreneur)'}
        </p>
      </div>
        </p>
      </div>
    </div>
  );
};
