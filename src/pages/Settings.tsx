import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Building2, FileText, Phone } from 'lucide-react';
import { CompanyProfile, loadCompanyProfile, saveCompanyProfile } from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function Settings() {
  const { lang, isAr } = useLang();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadCompanyProfile());
  }, []);

  if (!profile) return null;

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    saveCompanyProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Reload the page to apply changes everywhere
    window.location.reload();
  };

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('parametres', lang)}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('parametres_desc', lang)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Identité */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            {t('identite_visuelle', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('nom_societe', lang)}</label>
              <input type="text" value={profile.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('slogan_specialite', lang)}</label>
              <input type="text" value={profile.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                {t('lien_logo', lang)}
              </label>
              <input type="text" value={profile.logoUrl} onChange={e => handleChange('logoUrl', e.target.value)} placeholder="ex: /logo.png ou https://..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs text-left" dir="ltr" />
              <p className="text-xs text-slate-500 mt-1">{t('laissez_logo_desc', lang)}</p>
            </div>
          </div>
        </div>

        {/* Informations Légales */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            {t('info_legales', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ICE</label>
              <input type="text" value={profile.ice} onChange={e => handleChange('ice', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-left" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">RC</label>
              <input type="text" value={profile.rc} onChange={e => handleChange('rc', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-left" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">IF</label>
              <input type="text" value={profile.if_tax} onChange={e => handleChange('if_tax', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-left" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Patente</label>
              <input type="text" value={profile.patente} onChange={e => handleChange('patente', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-left" dir="ltr" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            {t('contact_adresse', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('adresse_complete', lang)}</label>
              <input type="text" value={profile.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('telephone', lang)}</label>
              <input type="text" value={profile.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-left" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('email_contact', lang)}</label>
              <input type="email" value={profile.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-left" dir="ltr" />
            </div>
          </div>
        </div>
        
        {/* Footer actions */}
        <div className={`bg-slate-50 px-6 py-4 border-t border-slate-200 flex ${isAr ? 'justify-start' : 'justify-end'} items-center gap-4`}>
          {saved && <span className="text-green-600 text-sm font-medium">{t('modifs_enreg', lang)}</span>}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-bold shadow-sm shadow-indigo-500/30 ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <Save className="w-4 h-4" /> {t('enregistrer_appliq', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
