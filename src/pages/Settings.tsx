import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Building2, FileText, Phone, Play, Zap, Globe, Settings as SettingsIcon } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('nom_societe', lang)}</label>
              <input type="text" value={profile.name} onChange={e => handleChange('name', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{t('slogan_specialite', lang)}</label>
              <input type="text" value={profile.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Landing */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                {isAr ? 'لوغو الصفحة الرئيسية' : 'Logo Landing Page'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logoLanding ? (
                    <img src={profile.logoLanding} className="h-12 object-contain" alt="Logo Landing" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoLanding || ''} onChange={e => handleChange('logoLanding', e.target.value)} placeholder="/logo.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleChange('logoLanding', reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 200x50 px (نسبة 4:1)' : 'Dim. Recommandée : 200x50 px (Ratio 4:1)'}</p>
              </div>
            </div>

            {/* Logo Admin */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-slate-900" />
                {isAr ? 'لوغو لوحة الإدارة' : 'Logo Menu Admin'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
                  {profile.logoAdmin ? (
                    <img src={profile.logoAdmin} className="h-10 object-contain brightness-0 invert" alt="Logo Admin" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-700" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoAdmin || ''} onChange={e => handleChange('logoAdmin', e.target.value)} placeholder="/logo-admin.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleChange('logoAdmin', reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 180x40 px' : 'Dim. Recommandée : 180x40 px'}</p>
              </div>
            </div>

            {/* Logo Client */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                {isAr ? 'لوغو بوابة الكليان' : 'Logo Portail Client'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logoClient ? (
                    <img src={profile.logoClient} className="h-10 object-contain" alt="Logo Client" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoClient || ''} onChange={e => handleChange('logoClient', e.target.value)} placeholder="/logo-client.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleChange('logoClient', reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 180x40 px' : 'Dim. Recommandée : 180x40 px'}</p>
              </div>
            </div>

            {/* Logo Invoice */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                {isAr ? 'لوغو الوثائق (Facture/Devis)' : 'Logo Documents (Invoice)'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logoInvoice ? (
                    <img src={profile.logoInvoice} className="h-12 object-contain" alt="Logo Invoice" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoInvoice || ''} onChange={e => handleChange('logoInvoice', e.target.value)} placeholder="/logo-invoice.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleChange('logoInvoice', reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 250x60 px' : 'Dim. Recommandée : 250x60 px'}</p>
              </div>
            </div>

            {/* Logo Login */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                {isAr ? 'لوغو صفحة الدخول' : 'Logo Page Login'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logoLogin ? (
                    <img src={profile.logoLogin} className="h-12 object-contain" alt="Logo Login" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoLogin || ''} onChange={e => handleChange('logoLogin', e.target.value)} placeholder="/logo-login.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleChange('logoLogin', reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 180x50 px' : 'Dim. Recommandée : 180x50 px'}</p>
              </div>
            </div>

            {/* Video Section (Part of the same grid) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Play className="w-4 h-4 text-slate-400" />
                {isAr ? 'فيديو الصفحة الرئيسية' : 'Vidéo de la Page d\'Accueil'}
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={profile.landingVideoUrl || ''} 
                    onChange={e => handleChange('landingVideoUrl', e.target.value)} 
                    placeholder="URL Instagram, YouTube ou Base64..." 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs text-left" 
                    dir="ltr" 
                  />
                  <label className="cursor-pointer bg-slate-900 text-white hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm">
                    <Play className="w-4 h-4" />
                    {isAr ? 'رفع فيديو' : 'Uploader'}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="video/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 15 * 1024 * 1024) {
                            alert(isAr ? 'الفيديو كبير بزاف! حاول تختار فيديو قل من 15MB.' : 'Vidéo trop lourde ! Max 15MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleChange('landingVideoUrl', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
                
                {/* Specs Box */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg text-indigo-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-indigo-900 uppercase tracking-widest mb-1">
                      {isAr ? 'المقاييس المطلوبة (Specs):' : 'Spécifications Recommandées :'}
                    </p>
                    <ul className="text-indigo-700 space-y-1 font-medium list-disc list-inside">
                      <li>{isAr ? 'الشكل: عمودي (9:16) بحال الـ Reel' : 'Format : Vertical (9:16) style Reel'}</li>
                      <li>{isAr ? 'الحجم: قل من 15MB (باش يبقى السيت سريع)' : 'Taille : Moins de 15MB (pour la rapidité)'}</li>
                      <li>{isAr ? 'المدة: 15 إلى 30 ثانية' : 'Durée : 15 à 30 secondes'}</li>
                    </ul>
                  </div>
                </div>
              </div>
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
