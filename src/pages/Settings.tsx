import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Building2, FileText, Phone, Play, Zap, Globe, Settings as SettingsIcon, ShieldCheck, X, Star, MapPin, RefreshCw, CloudUpload, Database, AlertTriangle, HelpCircle, Plus, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { CompanyProfile, FaqItem, ServiceItem, loadCompanyProfile, saveCompanyProfile, saveRecord } from '../types';
import { genId } from '../types';
import { supabase } from '../supabase';
import { compressImage } from '../utils/image';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function Settings() {
  const { lang, isAr } = useLang();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'checking' | 'syncing' | 'success' | 'error'>('idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, { local: number, cloud: number }>>({});

  const checkSyncStatus = async () => {
    setSyncStatus('checking');
    const tables = ['leads', 'users', 'employes', 'tissus', 'fournitures', 'commandes', 'fiches'];
    const newCounts: Record<string, { local: number, cloud: number }> = {};
    
    for (const table of tables) {
      let localCount = 0;
      try {
        const localKey = `textrack_data_${table}`;
        const oldKey = table === 'leads' ? 'textrack_leads' : localKey;
        const localRaw = localStorage.getItem(localKey) || localStorage.getItem(oldKey);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed)) {
            localCount = parsed.filter(item => item && item.name !== '__SYSTEM_CONFIG__').length;
          }
        }
      } catch (e) {}

      let cloudCount = 0;
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          cloudCount = count;
          if (table === 'leads') {
            const { count: cfgCount } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('name', '__SYSTEM_CONFIG__');
            if (cfgCount) {
              cloudCount = Math.max(0, cloudCount - cfgCount);
            }
          }
        }
      } catch (e) {}

      newCounts[table] = { local: localCount, cloud: cloudCount };
    }
    setCounts(newCounts);
    setSyncStatus('idle');
  };

  const startMigration = async () => {
    if (!window.confirm(isAr 
      ? 'هل أنت متأكد من رغبتك في رفع جميع البيانات المحلية إلى السحابة؟ سيؤدي هذا إلى مزامنة بيانات هذا الجهاز مع السحابة لتتمكن من رؤيتها على الهاتف.'
      : 'Voulez-vous vraiment uploader toutes vos données locales sur le Cloud ? Cela permettra de les synchroniser pour qu\'elles soient visibles sur votre téléphone.')) {
      return;
    }
    
    setSyncStatus('syncing');
    setSyncLogs(['Début de la synchronisation...']);
    const tables = ['leads', 'users', 'employes', 'tissus', 'fournitures', 'commandes', 'fiches'];
    
    try {
      for (const table of tables) {
        const localKey = table === 'leads' ? 'textrack_leads' : `textrack_data_${table}`;
        const localRaw = localStorage.getItem(localKey);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSyncLogs(prev => [...prev, `Mise en ligne de la table ${table} (${parsed.length} éléments)...`]);
            for (const item of parsed) {
              if (item && item.name !== '__SYSTEM_CONFIG__') {
                await saveRecord(table, item, true);
              }
            }
          }
        }
      }
      setSyncLogs(prev => [...prev, '🎉 Synchronisation terminée avec succès !']);
      setSyncStatus('success');
      setTimeout(() => {
        checkSyncStatus();
      }, 2000);
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `❌ Erreur : ${err.message}`]);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    setProfile(loadCompanyProfile());
    checkSyncStatus();
  }, []);

  if (!profile) return null;

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    setDebugInfo('Syncing to Cloud...');
    try {
      await saveCompanyProfile(profile);
      setDebugInfo('Cloud Sync Success!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Reload the page to apply changes everywhere
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setDebugInfo('Sync Failed: ' + err.message);
    }
  };

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 cursor-help" onClick={() => setShowDebug(!showDebug)}>
            {t('parametres', lang)}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('parametres_desc', lang)}</p>
        </div>
        {showDebug && (
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10px] font-mono max-w-xs animate-in fade-in zoom-in">
            <p className="font-bold text-indigo-400 mb-1 tracking-widest uppercase">Debug Mode</p>
            <p className="whitespace-pre-wrap">{debugInfo || 'No logs yet...'}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Identité */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              {t('identite_visuelle', lang)}
            </h2>
            <button
              onClick={() => {
                if (window.confirm(isAr ? 'واش متأكد بغيتي ترجع اللوغوات الأصلية (logo.png)؟' : 'Voulez-vous vraiment restaurer les logos par défaut ?')) {
                  setProfile({
                    ...profile,
                    logoUrl: '/logo.png',
                    logoLanding: '/logo.png',
                    logoAdmin: '/logo.png',
                    logoClient: '/logo.png',
                    logoInvoice: '/logo.png',
                    logoLogin: '/logo.png',
                    logoMobileHeader: '/logo.png',
                    logoFooter: '/logo.png',
                    logoAppIcon: '/logo.png'
                  });
                  setSaved(false);
                }
              }}
              className="text-[10px] bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-rose-100 transition"
            >
              {isAr ? 'إرجاع اللوغو الأصلي' : 'Réinitialiser Logos'}
            </button>
          </div>
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
                        compressImage(file).then(res => handleChange('logoLanding', res)).catch(console.error);
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
                        compressImage(file).then(res => handleChange('logoAdmin', res)).catch(console.error);
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
                        compressImage(file).then(res => handleChange('logoClient', res)).catch(console.error);
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
                        compressImage(file).then(res => handleChange('logoInvoice', res)).catch(console.error);
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
                        compressImage(file).then(res => handleChange('logoLogin', res)).catch(console.error);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 180x50 px' : 'Dim. Recommandée : 180x50 px'}</p>
              </div>
            </div>

            {/* Logo Mobile Header */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                {isAr ? 'لوغو رأس الصفحة (Mobile)' : 'Logo Header (Mobile)'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {profile.logoMobileHeader ? (
                    <img src={profile.logoMobileHeader} className="h-10 object-contain" alt="Logo Mobile Header" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoMobileHeader || ''} onChange={e => handleChange('logoMobileHeader', e.target.value)} placeholder="/logo-mobile.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file).then(res => handleChange('logoMobileHeader', res)).catch(console.error);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 150x40 px' : 'Dim. Recommandée : 150x40 px'}</p>
              </div>
            </div>

            {/* Logo Footer */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                {isAr ? 'لوغو أسفل الصفحة (Footer)' : 'Logo Footer'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-slate-900/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  {profile.logoFooter ? (
                    <img src={profile.logoFooter} className="h-10 object-contain" alt="Logo Footer" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoFooter || ''} onChange={e => handleChange('logoFooter', e.target.value)} placeholder="/logo-footer.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file).then(res => handleChange('logoFooter', res)).catch(console.error);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-indigo-600 italic tracking-tight">{isAr ? 'القياس الموصى به: 200x50 px' : 'Dim. Recommandée : 200x50 px'}</p>
              </div>
            </div>

            {/* Logo App Icon / Favicon */}
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {isAr ? 'أيقونة التطبيق (PWA / Favicon)' : 'Icône de l\'App (PWA)'}
              </label>
              <div className="flex flex-col gap-4">
                <div className="h-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  {(profile.logoAppIcon && profile.logoAppIcon !== '/logo.png') ? (
                    <>
                      <img src={profile.logoAppIcon} className="w-12 h-12 object-contain" alt="App Icon" />
                      <button 
                        onClick={() => handleChange('logoAppIcon', '')}
                        className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 font-black text-[8px] uppercase tracking-widest"
                      >
                        <X className="w-3 h-3" /> {isAr ? 'حذف' : 'Supprimer'}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-6 h-6 text-slate-200" />
                      <span className="text-[8px] font-black text-slate-300 uppercase">{isAr ? 'لا توجد أيقونة' : 'Aucune Icône'}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={profile.logoAppIcon || ''} onChange={e => handleChange('logoAppIcon', e.target.value)} placeholder="/logo.png" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  <label className="cursor-pointer bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file).then(res => handleChange('logoAppIcon', res)).catch(console.error);
                      }
                    }} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-amber-600 italic tracking-tight">
                  {isAr ? 'هادي هي اللي غاتبان فالتلفون ملي تثبت التطبيق.' : 'C\'est l\'icône qui s\'affichera sur l\'écran d\'accueil du téléphone.'}
                </p>
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

        {/* Mise en Page & Contenu Landing Page */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-indigo-500" />
            {isAr ? 'محتوى صفحة "من نحن"' : 'Contenu "Qui Sommes-Nous"'}
          </h2>
          
          <div className="space-y-8">
            {/* About Photo */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                {isAr ? 'تصويرة قسم "من نحن"' : 'Photo Section "À Propos"'}
              </label>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center">
                  {profile.aboutPhotoUrl ? (
                    <img src={profile.aboutPhotoUrl} className="w-full h-full object-cover" alt="About" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input 
                    type="text" 
                    value={profile.aboutPhotoUrl || ''} 
                    onChange={e => handleChange('aboutPhotoUrl', e.target.value)} 
                    placeholder="URL de l'image ou Base64..." 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition">
                    <ImageIcon className="w-4 h-4" />
                    {isAr ? 'اختيار صورة' : 'Choisir une photo'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file).then(res => handleChange('aboutPhotoUrl', res)).catch(console.error);
                      }
                    }} />
                  </label>
                </div>
              </div>
            </div>

            {/* About Title & Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Français
                </h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Titre</label>
                  <input type="text" value={profile.aboutTitleFr || ''} onChange={e => handleChange('aboutTitleFr', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" placeholder="Ex: Une Excellence Marocaine" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows={4} value={profile.aboutTextFr || ''} onChange={e => handleChange('aboutTextFr', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none" placeholder="Texte de présentation..." />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> العربية
                </h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">العنوان</label>
                  <input type="text" value={profile.aboutTitleAr || ''} onChange={e => handleChange('aboutTitleAr', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none text-right" placeholder="مثال: قصة نجاح مغربية" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">الوصف</label>
                  <textarea rows={4} value={profile.aboutTextAr || ''} onChange={e => handleChange('aboutTextAr', e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none text-right" placeholder="نص التعريف بالشركة..." />
                </div>
              </div>
            </div>

            {/* Experience Card Stats */}
            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4" />
                {isAr ? 'بطاقة سنوات الخبرة' : 'Carte d\'Années d\'Expérience'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isAr ? 'عدد السنوات' : 'Nombre d\'années'}</label>
                  <input type="text" value={profile.experienceYears || ''} onChange={e => handleChange('experienceYears', e.target.value)} placeholder="Ex: 15+" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none font-black text-indigo-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isAr ? 'النص (FR)' : 'Texte (FR)'}</label>
                  <input type="text" value={profile.experienceTextFr || ''} onChange={e => handleChange('experienceTextFr', e.target.value)} placeholder="Ans d'Expérience" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isAr ? 'النص (AR)' : 'Texte (AR)'}</label>
                  <input type="text" value={profile.experienceTextAr || ''} onChange={e => handleChange('experienceTextAr', e.target.value)} placeholder="سنة من الخبرة" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none text-right" />
                </div>
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{isAr ? 'الرؤية والرسالة (FR)' : 'Vision & Mission (FR)'}</h4>
                </div>
                <input type="text" value={profile.visionTextFr || ''} onChange={e => handleChange('visionTextFr', e.target.value)} placeholder="Notre Vision..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
                <input type="text" value={profile.missionTextFr || ''} onChange={e => handleChange('missionTextFr', e.target.value)} placeholder="Notre Mission..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none" />
              </div>

              <div className="space-y-4 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{isAr ? 'الرؤية والرسالة (AR)' : 'Vision & Mission (AR)'}</h4>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <input type="text" value={profile.visionTextAr || ''} onChange={e => handleChange('visionTextAr', e.target.value)} placeholder="رؤيتنا..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-right" />
                <input type="text" value={profile.missionTextAr || ''} onChange={e => handleChange('missionTextAr', e.target.value)} placeholder="مهمتنا..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-right" />
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
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                {isAr ? 'رابط Google Maps' : 'Lien Google Maps'}
              </label>
              <input 
                type="text" 
                value={profile.googleMapsUrl || ''} 
                onChange={e => handleChange('googleMapsUrl', e.target.value)} 
                placeholder="https://www.google.com/maps/..." 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs text-left" 
                dir="ltr" 
              />
              <p className="text-[9px] text-slate-400 mt-1 italic">{isAr ? 'حط هنا الرابط اللي كيعطيك Google Maps ملي كدير Partager لموقع المحل.' : 'Collez ici le lien de partage fourni par Google Maps.'}</p>
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

        {/* MIGRATION ET CLOUD SYNC */}
        <div className="p-6 border-t border-slate-100 bg-indigo-50/20">
          <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            {isAr ? 'مزامنة البيانات المحلية مع السحاب (Supabase)' : 'Mise en ligne et Cloud Sync (Supabase)'}
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {isAr 
              ? 'إذا كنت قد سجلت زبناء أو فواتير أو طلبات من قبل على هذا الحاسوب، فيمكنك رفعها الآن لتظهر تلقائياً على هاتفك وعلى جميع أجهزتك المتصلة بنفس الحساب.'
              : 'Si vous avez déjà enregistré des prospects, clients, factures ou commandes sur cet ordinateur, vous pouvez les envoyer sur le Cloud pour qu\'ils soient instantanément visibles sur votre téléphone.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Table status list */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>{isAr ? 'نوع البيانات' : 'Type de Données'}</span>
                <span className="flex gap-4">
                  <span>{isAr ? 'جهازك' : 'Local'}</span>
                  <span>{isAr ? 'السحابة' : 'Cloud'}</span>
                </span>
              </div>
              {Object.keys(counts).length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">{isAr ? 'جاري التحقق...' : 'Vérification en cours...'}</div>
              ) : (
                Object.entries(counts).map(([table, val]) => (
                  <div key={table} className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="capitalize">{table === 'employes' ? (isAr ? 'العمال' : 'Employés') : table === 'fiches' ? (isAr ? 'البطاقات التقنية' : 'Fiches Tech') : table}</span>
                    <span className="flex gap-8 font-mono">
                      <span className={val.local > 0 ? 'text-indigo-600' : 'text-slate-400'}>{val.local}</span>
                      <span className={val.cloud > 0 ? 'text-emerald-600' : 'text-slate-400'}>{val.cloud}</span>
                    </span>
                  </div>
                ))
              )}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={checkSyncStatus}
                  disabled={syncStatus === 'checking'}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${syncStatus === 'checking' ? 'animate-spin' : ''}`} />
                  {isAr ? 'تحديث الحالة' : 'Rafraîchir'}
                </button>
              </div>
            </div>

            {/* Sync actions */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-stretch">
                <button
                  type="button"
                  onClick={startMigration}
                  disabled={syncStatus === 'syncing'}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <CloudUpload className="w-4 h-4" />
                  {isAr ? 'رفع ومزامنة البيانات الآن' : 'Envoyer les données locales sur le Cloud'}
                </button>

                {syncStatus === 'syncing' && (
                  <div className="mt-4 p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[9px] max-h-40 overflow-y-auto space-y-1">
                    {syncLogs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                )}
                {syncStatus === 'success' && (
                  <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold text-center">
                    🎉 {isAr ? 'تمت المزامنة بنجاح! جميع البيانات متوفرة الآن على هاتفك.' : 'Mise en ligne réussie ! Vos données sont maintenant synchronisées.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ & Services Editor */}
        <FaqEditor profile={profile} setProfile={setProfile} isAr={isAr} />

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

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  { id: '1', emoji: '💰', category: 'prix', questionFr: 'Quels sont vos tarifs ?', questionAr: 'ما هي أسعاركم؟', answerFr: 'Nos prix varient selon la quantité, le modèle et les matières. Contactez-nous pour un devis.', answerAr: 'أسعارنا تتفاوت حسب الكمية والنموذج. تواصلوا معنا للحصول على عرض سعر.' },
  { id: '2', emoji: '📦', category: 'prix', questionFr: 'Quel est le minimum de commande (MOQ) ?', questionAr: 'ما هو الحد الأدنى للطلب؟', answerFr: 'Notre minimum est généralement 50 pièces par modèle.', answerAr: 'الحد الأدنى عادةً 50 قطعة لكل نموذج.' },
  { id: '3', emoji: '⏱️', category: 'delai', questionFr: 'Quel est le délai de production ?', questionAr: 'ما هو وقت الإنتاج؟', answerFr: 'En général 15 à 30 jours selon la complexité.', answerAr: 'عادةً من 15 إلى 30 يوم حسب التعقيد.' },
];

const DEFAULT_SERVICES_ITEMS: ServiceItem[] = [
  { id: 's1', labelFr: 'Confection sur mesure', labelAr: 'تفصيل حسب الطلب', available: true },
  { id: 's2', labelFr: 'Broderie & Logo', labelAr: 'تطريز وشعار', available: true },
  { id: 's3', labelFr: 'Vente au détail', labelAr: 'بيع بالتجزئة', available: false },
];

function FaqEditor({ profile, setProfile, isAr }: { profile: CompanyProfile; setProfile: (p: CompanyProfile) => void; isAr: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'faq' | 'services'>('faq');

  const faq: FaqItem[] = profile.faq?.length ? profile.faq : DEFAULT_FAQ_ITEMS;
  const services: ServiceItem[] = profile.services?.length ? profile.services : DEFAULT_SERVICES_ITEMS;

  const updateFaq = (items: FaqItem[]) => setProfile({ ...profile, faq: items });
  const updateServices = (items: ServiceItem[]) => setProfile({ ...profile, services: items });

  const addFaq = () => updateFaq([...faq, { id: genId(), emoji: '❓', category: 'autre', questionFr: '', questionAr: '', answerFr: '', answerAr: '' }]);
  const removeFaq = (id: string) => updateFaq(faq.filter(f => f.id !== id));
  const updateFaqField = (id: string, field: keyof FaqItem, val: string) => updateFaq(faq.map(f => f.id === id ? { ...f, [field]: val } : f));

  const addService = () => updateServices([...services, { id: genId(), labelFr: '', labelAr: '', available: true }]);
  const removeService = (id: string) => updateServices(services.filter(s => s.id !== id));
  const updateService = (id: string, field: keyof ServiceItem, val: any) => updateServices(services.map(s => s.id === id ? { ...s, [field]: val } : s));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
              {isAr ? 'محتوى صفحة المعلومات' : 'Page Info Client — FAQ & Services'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {isAr ? `${faq.length} سؤال · ${services.length} خدمة` : `${faq.length} questions · ${services.length} services`}
              {' · '}
              <a href={`${window.location.origin}/#/info`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-indigo-500 hover:underline inline-flex items-center gap-0.5">
                {isAr ? 'فتح الصفحة' : 'Voir la page'} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('faq')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${tab === 'faq' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <HelpCircle className="w-3.5 h-3.5 inline mr-1" />FAQ ({faq.length})
            </button>
            <button onClick={() => setTab('services')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${tab === 'services' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Services ({services.length})
            </button>
          </div>

          {tab === 'faq' && (
            <div className="space-y-4">
              {faq.map((item, i) => (
                <div key={item.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <input value={item.emoji} onChange={e => updateFaqField(item.id, 'emoji', e.target.value)}
                      className="w-12 text-center text-xl bg-white border border-slate-200 rounded-lg py-1 outline-none" maxLength={2} />
                    <select value={item.category} onChange={e => updateFaqField(item.id, 'category', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none">
                      <option value="prix">💰 Prix / MOQ</option>
                      <option value="delai">⏱️ Délai</option>
                      <option value="services">👕 Services</option>
                      <option value="qualite">✅ Qualité</option>
                      <option value="contact">📍 Contact</option>
                      <option value="autre">❓ Autre</option>
                    </select>
                    <button onClick={() => removeFaq(item.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Question FR</p>
                      <input value={item.questionFr} onChange={e => updateFaqField(item.id, 'questionFr', e.target.value)}
                        placeholder="Question en français..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">السؤال AR</p>
                      <input value={item.questionAr} onChange={e => updateFaqField(item.id, 'questionAr', e.target.value)}
                        placeholder="السؤال بالعربية..." dir="rtl"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-400 text-right" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Réponse FR</p>
                      <textarea value={item.answerFr} onChange={e => updateFaqField(item.id, 'answerFr', e.target.value)}
                        placeholder="Réponse en français..."
                        rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-400 resize-none" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الجواب AR</p>
                      <textarea value={item.answerAr} onChange={e => updateFaqField(item.id, 'answerAr', e.target.value)}
                        placeholder="الجواب بالعربية..." dir="rtl"
                        rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-400 resize-none text-right" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addFaq} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-2xl text-xs font-black hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> {isAr ? 'إضافة سؤال' : 'Ajouter une question'}
              </button>
            </div>
          )}

          {tab === 'services' && (
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <button
                    onClick={() => updateService(s.id, 'available', !s.available)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${s.available ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-rose-100 text-rose-400 hover:bg-rose-200'}`}
                  >
                    {s.available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <input value={s.labelFr} onChange={e => updateService(s.id, 'labelFr', e.target.value)}
                    placeholder="Label FR..." className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-indigo-400" />
                  <input value={s.labelAr} onChange={e => updateService(s.id, 'labelAr', e.target.value)}
                    placeholder="التسمية AR..." dir="rtl" className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-indigo-400 text-right" />
                  <button onClick={() => removeService(s.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={addService} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-2xl text-xs font-black hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> {isAr ? 'إضافة خدمة' : 'Ajouter un service'}
              </button>
              <p className="text-[10px] text-slate-400 font-medium text-center">
                {isAr ? 'اضغط على الزر الأخضر/الأحمر لتغيير الحالة' : 'Cliquer sur ✅/❌ pour changer la disponibilité'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
