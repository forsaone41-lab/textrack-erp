import React from 'react';
import { Facture, Commande, CompanyProfile } from '../types';
import { Package } from 'lucide-react';

interface InvoicePROProps {
  facture: Facture;
  commande?: Commande;
  company: CompanyProfile;
  id?: string;
}

export const InvoicePRO: React.FC<InvoicePROProps> = ({ facture, commande, company, id }) => {
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div id={id} className="bg-white p-12 border border-slate-100 shadow-sm rounded-xl max-w-[800px] mx-auto text-slate-800">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
        <div className="flex flex-col gap-4">
          <img src={company.logoInvoice || company.logoUrl} className="h-16 object-contain self-start" alt={company.name} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{company.subtitle}</p>
          <div className="mt-6 space-y-1 text-sm font-medium text-slate-500">
            <p>{company.address}</p>
            <p>ICE: {company.ice} · RC: {company.rc}</p>
            <p>IF: {company.if_tax} · Patente: {company.patente}</p>
            <p>Tél: {company.phone}</p>
          </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1">
              {facture.typeDoc === 'devis' ? 'Devis N°' : facture.typeDoc === 'recu' ? 'Reçu N°' : 'Facture N°'}
            </h2>
            <p className="text-2xl font-black">{facture.numero}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-400 font-bold uppercase text-[10px]">Date:</span> <span className="font-black">{fmtDate(facture.date)}</span></p>
            <p><span className="text-slate-400 font-bold uppercase text-[10px]">Échéance:</span> <span className="font-black">{fmtDate(facture.echeance)}</span></p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-slate-50 rounded-3xl p-8 mb-12 border border-slate-100 text-left">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Facturé à :</h3>
        <p className="text-2xl font-black text-slate-800 mb-2">{facture.client}</p>
        <p className="text-sm font-bold text-slate-500">Client Partenaire TexTrack</p>
      </div>

      {/* Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest">Désignation</th>
            <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest">Qté</th>
            <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest">Prix Unit.</th>
            <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="py-6 text-left">
              <p className="font-black text-slate-800 text-lg">Production Textile</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Réf: {commande?.reference || 'N/A'}</p>
            </td>
            <td className="py-6 text-center font-black text-slate-800">{commande?.quantite || 0}</td>
            <td className="py-6 text-right font-black text-slate-800">{(facture.montant / (commande?.quantite || 1)).toLocaleString()} DH</td>
            <td className="py-6 text-right font-black text-slate-800">{facture.montant.toLocaleString()} DH</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} />
            <td className="py-6 text-right text-sm font-bold text-slate-400 uppercase">Total HT</td>
            <td className="py-6 text-right text-xl font-black text-slate-800">{(facture.montant * 0.8).toLocaleString()} DH</td>
          </tr>
          <tr>
            <td colSpan={2} />
            <td className="py-6 text-right text-sm font-bold text-slate-400 uppercase">TVA (20%)</td>
            <td className="py-6 text-right text-xl font-black text-slate-800">{(facture.montant * 0.2).toLocaleString()} DH</td>
          </tr>
          <tr className="border-t-4 border-slate-900">
            <td colSpan={2} />
            <td className="py-8 text-right text-sm font-black uppercase text-emerald-600 px-4">Total TTC (Net à payer)</td>
            <td className="py-8 text-right text-3xl font-black text-slate-900">{facture.montant.toLocaleString()} DH</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-12 pt-12 border-t border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merci de votre confiance</p>
        <div className="mt-4 flex items-center justify-center gap-2 opacity-30 grayscale">
           <Package className="w-4 h-4" />
           <span className="text-[8px] font-black uppercase tracking-tighter">Powered by TexTrack ERP</span>
        </div>
      </div>
    </div>
  );
};
