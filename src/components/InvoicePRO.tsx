import React from 'react';
import { Facture, Commande, CompanyProfile } from '../types';
import { ClipboardList } from 'lucide-react';

interface InvoicePROProps {
  facture: Facture;
  commande?: Commande;
  company: CompanyProfile;
  id?: string;
}

export const InvoicePRO: React.FC<InvoicePROProps> = ({ facture, commande, company, id }) => {
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const isDevis = facture.typeDoc === 'devis';
  const isRecu = facture.typeDoc === 'recu';
  const docTitle = isDevis ? 'DEVIS' : isRecu ? 'REÇU' : 'FACTURE';
  
  const total = facture.montant;
  const qte = commande?.quantite || 1;
  const pu = total / qte;

  const avance = facture.avance || 0;
  const reste = facture.montant - avance;

  if (isRecu) {
    return (
      <div id={id} className="bg-white mx-auto text-slate-800" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Georgia, serif', padding: '14mm 16mm' }}>

        {/* Top: company left, title right */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {(company.logoInvoice || company.logoUrl) && (
              <img src={company.logoInvoice || company.logoUrl} className="h-10 object-contain mb-3" alt={company.name} />
            )}
            <p className="text-sm font-bold text-slate-900">{company.name}</p>
            <p className="text-xs text-slate-600 mt-0.5">{company.address || 'Zone Industrielle, Meknès'}</p>
            <p className="text-xs text-slate-600">Tél : {company.phone}</p>
            <p className="text-xs text-slate-600">{company.email || 'contact@beyacreative.com'}</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-slate-900 underline underline-offset-4 mb-6">Reçu de Paiement</h1>
            <p className="text-xs text-slate-600">{facture.client}</p>
            <p className="text-xs text-slate-600">Client Partenaire</p>
            <p className="text-xs text-slate-600">Maroc</p>
          </div>
        </div>

        {/* Section: Reçu de Paiement */}
        <div className="mb-8">
          <p className="text-sm font-bold text-slate-900 mb-4">Reçu de Paiement</p>
          <div className="space-y-2 text-sm text-slate-800">
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Date :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">{fmtDate(facture.date)}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">N° du reçu :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">{facture.numero}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Reçu de la part de :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">{facture.client}</span>
            </div>
            {commande && (
              <div className="flex gap-2">
                <span className="w-40 shrink-0">Commande référencée :</span>
                <span className="flex-1 border-b border-slate-400 pb-0.5">{commande.reference} — {commande.modele || ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Détails du Paiement */}
        <div className="mb-10">
          <p className="text-sm font-bold text-slate-900 mb-4">Détails du Paiement</p>
          <div className="space-y-2 text-sm text-slate-800">
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Total commande :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5 font-semibold">{facture.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Montant payé (avance) :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5 font-bold text-slate-900">{avance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Reste à payer :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">{reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Mode de paiement :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">{facture.banque || 'Espèces / Virement'}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Motif du paiement :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">Avance sur commande de confection textile</span>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="mb-16 text-sm text-slate-800">
          <p className="mb-4">Le montant mentionné ci-dessus a été dûment payé et reçu par :</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Nom du destinataire :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5">{company.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-40 shrink-0">Signature :</span>
              <span className="flex-1 border-b border-slate-400 pb-0.5 h-8" />
            </div>
          </div>
        </div>

        {/* Barcode + Footer */}
        <div className="border-t border-slate-300 pt-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Merci pour votre paiement !</p>
            <p className="text-xs text-slate-500">{company.name} — {company.address || 'Zone Industrielle, Meknès'} — {company.phone}</p>
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
    <div id={id} className="bg-white p-10 mx-auto text-slate-800" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-4">
          {company.logoInvoice || company.logoUrl ? (
            <img src={company.logoInvoice || company.logoUrl} className="h-14 object-contain" alt={company.name} />
          ) : (
            <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white text-2xl font-black">
              {company.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-[22px] font-black text-[#1E1B4B] uppercase leading-none tracking-tight">{company.name}</h1>
            <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.2em] mt-1">{company.subtitle || 'Confection de vêtement'}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-[#1E1B4B] uppercase tracking-tighter leading-none mb-2">{docTitle}</h2>
          <p className="text-[10px] font-bold text-slate-500">N° {facture.numero} — {fmtDate(facture.date)}</p>
        </div>
      </div>

      <div className="h-1 w-full bg-[#4F46E5] mb-8" />

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
          <p className="text-[9px] font-black text-[#4F46E5] uppercase tracking-[0.2em] mb-3">Émetteur</p>
          <p className="text-sm font-black text-slate-900 uppercase mb-1">{company.name}</p>
          <div className="text-[11px] font-medium text-slate-600 leading-relaxed">
            <p>{company.address || 'Zone Industrielle, Meknès'}</p>
            <p>Tél: {company.phone}</p>
            <p>{company.email || 'contact@beyacreative.com'}</p>
          </div>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
          <p className="text-[9px] font-black text-[#4F46E5] uppercase tracking-[0.2em] mb-3">Client / Destinataire</p>
          <p className="text-sm font-black text-slate-900 uppercase mb-1">{facture.client}</p>
          <div className="text-[11px] font-medium text-slate-600 leading-relaxed">
            <p>Client Partenaire</p>
            <p>Maroc</p>
          </div>
        </div>
      </div>

      {/* Objet */}
      <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg p-3 mb-8">
        <p className="text-[11px] font-black text-[#4F46E5]">
          Objet : {docTitle} de confection — {commande?.modele || 'Production Textile'} {commande?.quantite ? `× ${commande.quantite} pièces` : ''}
        </p>
      </div>

      {/* FACTURE / DEVIS: invoice table layout */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B0F19] text-white">
              <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-tl-xl">Description</th>
              <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest">Qté</th>
              <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest">PU (MAD)</th>
              <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-tr-xl">Total (MAD)</th>
            </tr>
          </thead>
          <tbody className="border-b border-slate-200">
            {facture.articles && facture.articles.length > 0 ? (
              facture.articles.map((art, idx) => (
                <tr key={art.id || idx}>
                  <td className="py-5 px-4 text-left">
                    <p className="font-black text-slate-900 text-xs">{art.designation || 'Article / Service'}</p>
                  </td>
                  <td className="py-5 px-4 text-center font-black text-slate-800 text-xs">{art.quantite}</td>
                  <td className="py-5 px-4 text-right font-black text-[#4F46E5] text-xs">{art.prixUnitaire.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-5 px-4 text-right font-black text-slate-900 text-xs">{art.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-5 px-4 text-left">
                  <p className="font-black text-slate-900 text-xs">Production Textile & Confection</p>
                  {commande?.modele && <p className="text-[10px] font-bold text-slate-500 mt-0.5">{commande.modele}</p>}
                </td>
                <td className="py-5 px-4 text-center font-black text-slate-800 text-xs">{qte}</td>
                <td className="py-5 px-4 text-right font-black text-[#4F46E5] text-xs">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                <td className="py-5 px-4 text-right font-black text-slate-900 text-xs">{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Box */}
        <div className="flex justify-end mt-4">
          <div className="w-1/2">
            {(!facture.articles || facture.articles.length === 0) && (
              <div className="flex justify-between py-2 px-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prix Unitaire</span>
                <span className="text-[11px] font-black text-slate-700">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
              </div>
            )}
            <div className="flex justify-between py-2 px-4 border-b border-slate-100 mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Brut</span>
              <span className="text-[11px] font-black text-slate-700">{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div className="bg-[#4F46E5] rounded-xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-500/30">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">Total Général</p>
                <p className="text-[11px] font-black mt-0.5">{isDevis ? 'Net à payer' : 'TTC'}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black tracking-tight">{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs font-black ml-2 opacity-90">MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="border-2 border-[#4F46E5] rounded-xl p-6 mb-12">
        <h3 className="flex items-center gap-2 text-sm font-black text-[#1E1B4B] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-3">
          <ClipboardList className="w-5 h-5 text-[#4F46E5]" /> Conditions Générales
        </h3>
        <ul className="space-y-3 text-[11px] font-semibold text-slate-600">
          <li><span className="text-[#4F46E5] font-black">1.</span> Ce {docTitle.toLowerCase()} est <strong className="text-slate-900">valable 15 jours</strong> à compter de la date d'émission.</li>
          <li><span className="text-[#4F46E5] font-black">2.</span> Un <strong className="text-slate-900">acompte de 50%</strong> est requis à la confirmation de la commande.</li>
          <li><span className="text-[#4F46E5] font-black">3.</span> Le <strong className="text-slate-900">délai de production</strong> sera confirmé après validation de l'échantillon.</li>
          <li><span className="text-[#4F46E5] font-black">4.</span> Toute <strong className="text-slate-900">modification du modèle</strong> après lancement peut entraîner une révision tarifaire.</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-slate-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          Merci de votre confiance — {company.name}
        </p>
        <p className="text-[9px] font-bold text-slate-400">
          {company.address || 'Zone Industrielle, Meknès'} | {company.phone} | {company.email || 'contact@beyacreative.com'}
        </p>
      </div>
    </div>
  );
};
