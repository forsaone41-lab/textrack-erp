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

      {/* Table */}
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
            <tr>
              <td className="py-5 px-4 text-left">
                <p className="font-black text-slate-900 text-xs">Production Textile & Confection</p>
                {commande?.modele && <p className="text-[10px] font-bold text-slate-500 mt-0.5">{commande.modele}</p>}
              </td>
              <td className="py-5 px-4 text-center font-black text-slate-800 text-xs">{qte}</td>
              <td className="py-5 px-4 text-right font-black text-[#4F46E5] text-xs">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              <td className="py-5 px-4 text-right font-black text-slate-900 text-xs">{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals Box */}
        <div className="flex justify-end mt-4">
          <div className="w-1/2">
            <div className="flex justify-between py-2 px-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prix Unitaire</span>
              <span className="text-[11px] font-black text-slate-700">{pu.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
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
