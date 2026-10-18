import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { 
  Plus, Search, Edit2, Trash2, CreditCard, DollarSign, Image as ImageIcon, X, Printer, Download, File, Phone, 
  RotateCw, Copy, Check, Zap, Calculator, Camera, Upload, User as UserIcon, QrCode, ShieldCheck, Scissors,
  FolderOpen, FileCheck, AlertTriangle, ShieldAlert, Award, FileUp, ExternalLink, Calendar, CheckCircle2, AlertCircle, FileText,
  Eye, ArrowLeft, ArrowRight, Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Employe, EmployeFaute, EmployeDocument, PaiementSalaire, Commande, loadData, genId, loadCompanyProfile, saveRecord, safeStorage } from '../types';
import { generatePDF, printElement, generateBadgePDF, printBadgeElement, downloadBadgeImage } from '../utils/pdf';
import { PageLoader } from '../components/PageLoader';

// Local storage helpers for RH specifically to avoid Supabase schema mismatch
function getLocalRH<T>(key: string): T[] {
  try {
    const data = safeStorage.getItem(`textrack_${key}`);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveLocalRH<T>(key: string, data: T[]) {
  safeStorage.setItem(`textrack_${key}`, JSON.stringify(data));
}

const POSTES_ATELIER = [
  '— Production —',
  'Machiniste',
  'Machiniste Polyvalent(e)',
  'Coupeur / Coupeuse',
  'Couturier / Couturière',
  'Piqueur / Piqueuse',
  'Surjeteuse',
  'Repasseur / Repasseuse',
  'Finisseur / Finisseuse',
  '— Technique —',
  'Modéliste',
  'Patronnière',
  'Mécanicien Machines',
  'Contrôle Qualité',
  '— Encadrement —',
  "Chef d'Atelier",
  'Responsable Production',
  'Responsable Qualité',
  '— Administration —',
  'Responsable RH',
  'Comptable',
  'Commercial / Commerciale',
  'Responsable Achats',
  'Directeur / Directrice',
];

const POSTES_ATELIER_AR = [
  '— الإنتاج —',
  'ماشينيست (Machiniste)',
  'ماشينيست شاملة (Polyvalente)',
  'فصالة (Coupeur)',
  'خياطة (Couturier)',
  'بيكور (Piqueur)',
  'سورجي (Surjeteuse)',
  'مصلوح (Repasseur)',
  'فينيسيون (Finisseur)',
  '— تقني —',
  'موديليست (Modéliste)',
  'باطرونيير (Patronnière)',
  'ميكانيكي آلات',
  'مراقبة الجودة',
  '— التأطير —',
  'رئيس الورشة (Chef d\'Atelier)',
  'مسؤول الإنتاج',
  'مسؤول الجودة',
  '— الإدارة —',
  'مسؤول الموارد البشرية',
  'محاسب',
  'تجاري (Commercial)',
  'مسؤول المشتريات',
  'مدير / مديرة',
];

const POSTES_SOUSTRAITANCE = [
  'Façonnier — Coupe',
  'Façonnier — Montage',
  'Façonnier — Finition',
  'Façonnier — Repassage',
  'Façonnier Général',
  'Atelier Sous-traitant',
  'Prestataire Broderie',
  'Prestataire Impression',
];

const POSTES_SOUSTRAITANCE_AR = [
  'فاصونيي — فصالة',
  'فاصونيي — خياطة',
  'فاصونيي — فينيسيون',
  'فاصونيي — مصلوح',
  'فاصونيي عام',
  'ورشة خارجية',
  'خدمات الطرز',
  'خدمات الطباعة',
];

function formatBadgePoste(poste?: string, isAr?: boolean) {
  if (!poste || !poste.trim()) return isAr ? 'عامل(ة) معمل' : 'Personnel Atelier';
  const trimmed = poste.trim();
  const lower = trimmed.toLowerCase();
  
  // When it is Surjeteuse or a single sewing machine, user requested "Machiniste"
  if (lower.includes('surjet') || lower === 'surjeteuse') {
    return isAr ? 'ماشينيست (Machiniste)' : 'Machiniste';
  }
  if (lower.includes('piqueur') || lower.includes('piqueuse')) {
    return isAr ? 'ماشينيست (Machiniste)' : 'Machiniste';
  }
  return trimmed;
}

function SmartChip() {
  return (
    <div 
      className="w-[28px] h-[20px] rounded-[4px] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-600/70 p-[2px] shadow-sm flex flex-col justify-between overflow-hidden shrink-0 select-none"
      title="Security EMV Smart Chip"
    >
      <div className="h-[1px] bg-amber-800/50 w-full" />
      <div className="flex justify-between items-center h-[8px] px-0.5">
        <div className="w-[4px] h-full border-r border-amber-800/50" />
        <div className="w-[8px] h-[6px] rounded-[2px] border border-amber-800/60 bg-amber-300/40" />
        <div className="w-[4px] h-full border-l border-amber-800/50" />
      </div>
      <div className="h-[1px] bg-amber-800/50 w-full" />
    </div>
  );
}

function BarcodeGraphic({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-start w-full">
      <svg className="h-5 w-full max-w-[200px] text-black" viewBox="0 0 200 24" fill="#000000" preserveAspectRatio="none">
        <rect x="0" y="0" width="3" height="24" />
        <rect x="5" y="0" width="1.5" height="24" />
        <rect x="8" y="0" width="4" height="24" />
        <rect x="14" y="0" width="2" height="24" />
        <rect x="18" y="0" width="1" height="24" />
        <rect x="21" y="0" width="3.5" height="24" />
        <rect x="27" y="0" width="2" height="24" />
        <rect x="31" y="0" width="1" height="24" />
        <rect x="34" y="0" width="4" height="24" />
        <rect x="40" y="0" width="1.5" height="24" />
        <rect x="44" y="0" width="3" height="24" />
        <rect x="49" y="0" width="2" height="24" />
        <rect x="53" y="0" width="4" height="24" />
        <rect x="59" y="0" width="1.5" height="24" />
        <rect x="63" y="0" width="3" height="24" />
        <rect x="68" y="0" width="1" height="24" />
        <rect x="71" y="0" width="4" height="24" />
        <rect x="77" y="0" width="2" height="24" />
        <rect x="81" y="0" width="1.5" height="24" />
        <rect x="85" y="0" width="3" height="24" />
        <rect x="90" y="0" width="1" height="24" />
        <rect x="93" y="0" width="4" height="24" />
        <rect x="99" y="0" width="2" height="24" />
        <rect x="103" y="0" width="1.5" height="24" />
        <rect x="107" y="0" width="3.5" height="24" />
        <rect x="113" y="0" width="1" height="24" />
        <rect x="116" y="0" width="4" height="24" />
        <rect x="122" y="0" width="2" height="24" />
        <rect x="126" y="0" width="1.5" height="24" />
        <rect x="130" y="0" width="3" height="24" />
        <rect x="135" y="0" width="1" height="24" />
        <rect x="138" y="0" width="4.5" height="24" />
        <rect x="145" y="0" width="1.5" height="24" />
        <rect x="149" y="0" width="3" height="24" />
        <rect x="154" y="0" width="2" height="24" />
        <rect x="158" y="0" width="1" height="24" />
        <rect x="161" y="0" width="4" height="24" />
        <rect x="167" y="0" width="2" height="24" />
        <rect x="171" y="0" width="1.5" height="24" />
        <rect x="175" y="0" width="3.5" height="24" />
        <rect x="181" y="0" width="2" height="24" />
        <rect x="185" y="0" width="2" height="24" />
        <rect x="190" y="0" width="3" height="24" />
        <rect x="195" y="0" width="2" height="24" />
      </svg>
    </div>
  );
}

export type BadgeTheme = 'platinum' | 'slate_dark' | 'blue_prestige' | 'ivory';

export const BADGE_THEMES: Record<BadgeTheme, {
  id: BadgeTheme;
  nameAr: string;
  nameFr: string;
  isDark: boolean;
  cardBorder: string;
  bodyBg: string;
  cardOuterBg: string;
  headerGradient: string;
  nameColor: string;
  rolePillClass: string;
  labelColor: string;
  valueColor: string;
  matriculeColor: string;
  subtextColor: string;
  dividerBorder: string;
  photoBorder: string;
  photoBg: string;
  signatureColor: string;
  qrBoxBg: string;
  qrBoxBorder: string;
  accentBar: string;
}> = {
  platinum: {
    id: 'platinum',
    nameAr: 'بلاتين سيلفر (رمادي مغلوق)',
    nameFr: 'Platine Argenté',
    isDark: false,
    cardBorder: 'border-slate-400/90 shadow-2xl',
    cardOuterBg: 'bg-slate-300',
    bodyBg: 'bg-gradient-to-br from-[#dfe6ef] via-[#cbd5e1] to-[#b3c1d1]',
    headerGradient: 'from-[#07162c] via-[#0d2a4d] to-[#0284c7]',
    nameColor: 'text-slate-950',
    rolePillClass: 'bg-indigo-600/15 border-indigo-400/50 text-indigo-950 shadow-2xs font-black',
    labelColor: 'text-slate-600 font-black',
    valueColor: 'text-slate-950 font-black',
    matriculeColor: 'text-indigo-900 font-mono font-black',
    subtextColor: 'text-slate-700 font-bold',
    dividerBorder: 'border-slate-300',
    photoBorder: 'border-2 border-white/90 shadow-md',
    photoBg: 'bg-slate-200',
    signatureColor: 'text-slate-900',
    qrBoxBg: 'bg-white/85 backdrop-blur-sm',
    qrBoxBorder: 'border-slate-300',
    accentBar: 'from-[#07162c] via-[#0284c7] to-[#4f46e5]',
  },
  slate_dark: {
    id: 'slate_dark',
    nameAr: 'تيتانيوم كحل مغلوق',
    nameFr: 'Titanium Dark VIP',
    isDark: true,
    cardBorder: 'border-slate-700 shadow-2xl shadow-slate-950/60',
    cardOuterBg: 'bg-slate-950',
    bodyBg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120]',
    headerGradient: 'from-[#030712] via-[#0f172a] to-[#1e293b]',
    nameColor: 'text-white drop-shadow-sm',
    rolePillClass: 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-2xs font-black',
    labelColor: 'text-amber-200/90 font-black',
    valueColor: 'text-white font-black',
    matriculeColor: 'text-amber-300 font-mono font-black',
    subtextColor: 'text-slate-200 font-bold',
    dividerBorder: 'border-white/20',
    photoBorder: 'border-2 border-amber-400/80 shadow-lg shadow-amber-500/10',
    photoBg: 'bg-slate-900',
    signatureColor: 'text-amber-300',
    qrBoxBg: 'bg-slate-900/90 backdrop-blur-sm',
    qrBoxBorder: 'border-slate-700',
    accentBar: 'from-amber-600 via-amber-400 to-yellow-500',
  },
  blue_prestige: {
    id: 'blue_prestige',
    nameAr: 'أزرق ملكي مغلوق',
    nameFr: 'Bleu Nuit Prestige',
    isDark: true,
    cardBorder: 'border-sky-900 shadow-2xl shadow-sky-950/60',
    cardOuterBg: 'bg-[#061224]',
    bodyBg: 'bg-gradient-to-br from-[#06142a] via-[#0b254a] to-[#040e1e]',
    headerGradient: 'from-[#030b18] via-[#071e3d] to-[#0284c7]',
    nameColor: 'text-white drop-shadow-sm',
    rolePillClass: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-2xs font-black',
    labelColor: 'text-cyan-200/70 font-bold',
    valueColor: 'text-white font-black',
    matriculeColor: 'text-cyan-300 font-mono font-black',
    subtextColor: 'text-cyan-100/90 font-medium',
    dividerBorder: 'border-cyan-500/20',
    photoBorder: 'border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20',
    photoBg: 'bg-[#030d1c]',
    signatureColor: 'text-cyan-300',
    qrBoxBg: 'bg-[#071a35]/90 backdrop-blur-sm',
    qrBoxBorder: 'border-cyan-500/30',
    accentBar: 'from-[#07162c] via-[#0284c7] to-[#38bdf8]',
  },
  ivory: {
    id: 'ivory',
    nameAr: 'عاجي بنكي أمني',
    nameFr: 'Ivoire Sécurisé Bank',
    isDark: false,
    cardBorder: 'border-amber-300/80 shadow-2xl',
    cardOuterBg: 'bg-[#ebd8c0]',
    bodyBg: 'bg-gradient-to-br from-[#ebd8c0] via-[#dfc8ad] to-[#cca782]',
    headerGradient: 'from-[#2b1f13] via-[#4a3520] to-[#8c5e2d]',
    nameColor: 'text-amber-950 font-black',
    rolePillClass: 'bg-amber-800/15 border-amber-800/40 text-amber-950 shadow-2xs font-black',
    labelColor: 'text-amber-900/70 font-bold',
    valueColor: 'text-amber-950 font-black',
    matriculeColor: 'text-amber-900 font-mono font-black',
    subtextColor: 'text-amber-900 font-bold',
    dividerBorder: 'border-amber-800/20',
    photoBorder: 'border-2 border-amber-900/30 shadow-md',
    photoBg: 'bg-[#e5cfb3]',
    signatureColor: 'text-amber-950',
    qrBoxBg: 'bg-amber-50/85 backdrop-blur-sm',
    qrBoxBorder: 'border-amber-300',
    accentBar: 'from-[#2b1f13] via-[#8c5e2d] to-[#d4af37]',
  }
};

function BeyaWatermark({
  company,
  themeConfig
}: {
  company?: any;
  themeConfig: typeof BADGE_THEMES[BadgeTheme];
}) {
  const logoSrc = company?.logoAppIcon || company?.logoAdmin || company?.logoUrl || '/logo.png';
  const companyName = company?.name || 'BEYA CREATIVE';
  const isDark = themeConfig.isDark;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
      {/* 1. Fine Guilloché / Security Geometric Pattern (SVG) */}
      <svg
        className={`absolute inset-0 w-full h-full ${isDark ? 'text-white' : 'text-slate-900'}`}
        style={{ opacity: isDark ? 0.06 : 0.05 }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 370 180"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="guilloche-wave" width="60" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M0 15 Q15 0 30 15 T60 15 M0 20 Q15 5 30 20 T60 20 M0 10 Q15 25 30 10 T60 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#guilloche-wave)" />
      </svg>

      {/* 2. Repeating Micro-Text Security Bands (Diagonal) */}
      <div 
        className="absolute inset-0 -rotate-12 scale-125 flex flex-col justify-around pointer-events-none"
        style={{ opacity: isDark ? 0.08 : 0.06 }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className={`whitespace-nowrap font-mono text-[7px] font-black uppercase tracking-[0.3em] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {`${companyName} • ATELIER PASS • ${companyName} • CARTE OFFICIELLE • `}
          </div>
        ))}
      </div>

      {/* 3. Central Prominent BEYA CREATIVE Watermark Seal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative flex items-center justify-center"
          style={{ opacity: isDark ? 0.16 : 0.12 }}
        >
          {/* Circular Guilloché Security Rings */}
          <div className={`w-36 h-36 rounded-full border-2 border-dashed flex items-center justify-center p-2.5 ${isDark ? 'border-cyan-300' : 'border-slate-800'}`}>
            <div className={`w-32 h-32 rounded-full border flex items-center justify-center p-2 ${isDark ? 'border-white' : 'border-slate-700'}`}>
              <div className={`w-28 h-28 rounded-full border-2 border-dotted flex items-center justify-center relative ${isDark ? 'border-cyan-200' : 'border-slate-600'}`}>
                {/* Logo Image */}
                <img
                  src={logoSrc}
                  alt={companyName}
                  className="w-20 h-20 object-contain filter grayscale contrast-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Arched text badge watermark */}
          <div className={`absolute bottom-2 font-black tracking-widest text-[8.5px] uppercase font-mono px-2 ${isDark ? 'text-cyan-200' : 'text-slate-900'}`}>
            ★ {companyName} ★
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeFront({
  emp,
  company,
  isAr,
  empName,
  showPhotoUpload = false,
  onPhotoUpload,
  theme = 'platinum',
}: {
  emp: Employe;
  company: any;
  isAr: boolean;
  empName: (e: Employe) => string;
  showPhotoUpload?: boolean;
  onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  theme?: BadgeTheme;
}) {
  const cfg = BADGE_THEMES[theme] || BADGE_THEMES.platinum;
  const matricule = emp.matricule?.trim() ? emp.matricule.trim().toUpperCase() : `#EMP-${(emp.id || '').slice(0, 6).toUpperCase()}`;
  const validite = emp.dateExpiration?.trim() ? emp.dateExpiration.trim() : 'PERMANENT';
  const roleDisplay = formatBadgePoste(emp.poste, isAr);

  return (
    <div
      dir="ltr"
      className={`wallet-card-standard relative w-[370px] h-[234px] ${cfg.cardOuterBg} rounded-2xl overflow-hidden border ${cfg.cardBorder} flex flex-col justify-between select-none print:shadow-none print:border-slate-400 break-inside-avoid text-left transition-all shrink-0`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        imageRendering: '-webkit-optimize-contrast',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Top Corporate Header Banner */}
      <div className={`relative bg-gradient-to-r ${cfg.headerGradient} px-3.5 py-2 text-white flex items-center justify-between shadow-sm overflow-hidden shrink-0 z-10`}>
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }}
        />

        {/* Company Brand (Left) */}
        <div className="flex items-center gap-2 relative z-10 min-w-0">
          <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-sm border border-white/40 bg-white flex items-center justify-center p-0.5">
            <img 
              src={company.logoAppIcon || '/logo.png'} 
              alt={company.name || 'BEYA'} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-[11px] font-black tracking-wider uppercase leading-none drop-shadow-sm text-white truncate">
              {company.name || 'BEYA CREATIVE'}
            </h2>
            <span className="text-[6px] font-black uppercase tracking-[0.25em] text-cyan-300 block mt-0.5">
              CARTE PROFESSIONNELLE
            </span>
          </div>
        </div>

        {/* Smart EMV Chip + Badge Pass (Right) */}
        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[7px] font-black uppercase tracking-wider text-cyan-200 block leading-tight">
              ATELIER PASS
            </span>
            <span className="text-[5.5px] text-blue-100 font-semibold tracking-widest block opacity-80 uppercase">
              OFFICIEL
            </span>
          </div>
          <SmartChip />
        </div>
      </div>

      {/* Card Body with BEYA CREATIVE Watermark & Tinted Darker Background */}
      <div className={`relative p-2.5 flex-1 flex gap-2.5 items-stretch ${cfg.bodyBg} min-h-0 overflow-hidden`}>
        {/* The Watermark Layer */}
        <BeyaWatermark company={company} themeConfig={cfg} />

        {/* Photo Container (Left) */}
        <div className="shrink-0 flex flex-col items-center justify-between relative z-10">
          <div className={`w-[84px] h-[106px] rounded-xl overflow-hidden ${cfg.photoBg} ${cfg.photoBorder} relative group flex items-center justify-center`}>
            {emp.photo ? (
              <img src={emp.photo} alt={empName(emp)} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                <div className="w-9 h-9 rounded-full bg-slate-300/60 flex items-center justify-center text-slate-700 font-black text-sm mb-1">
                  {emp.prenom?.[0] || emp.nom?.[0] || 'U'}
                </div>
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">
                  {isAr ? 'بدون صورة' : 'Sans photo'}
                </span>
              </div>
            )}

            {/* Photo change hover action if enabled */}
            {showPhotoUpload && onPhotoUpload && (
              <label className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-1 text-center z-20">
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[7.5px] font-bold uppercase">{isAr ? 'تغيير' : 'Modifier'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
              </label>
            )}
          </div>

          {/* Micro status below photo */}
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[6.5px] font-black uppercase tracking-wider mt-1 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={cfg.isDark ? 'text-emerald-300' : 'text-emerald-800'}>ACTIF</span>
          </div>
        </div>

        {/* Employee Info Details (Right) */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 relative z-10">
          <div>
            {/* Employee Full Name */}
            <h3 className={`text-[13px] font-black ${cfg.nameColor} uppercase tracking-tight leading-tight truncate drop-shadow-2xs`}>
              {empName(emp)}
            </h3>

            {/* Role Title Pill */}
            <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${cfg.rolePillClass}`}>
              <span className="truncate">{roleDisplay}</span>
            </div>

            {/* Info Grid (CIN, MATRICULE, VALIDITÉ, TEL) */}
            <div className={`grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5 pt-1.5 border-t ${cfg.dividerBorder}`}>
              <div>
                <span className={`block text-[7px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>CIN</span>
                <span className={`text-[10px] font-black ${cfg.valueColor} uppercase tracking-wider`}>{emp.cin || '—'}</span>
              </div>
              <div>
                <span className={`block text-[7px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>MATRICULE</span>
                <span className={`text-[10px] font-black ${cfg.matriculeColor} uppercase tracking-wider font-mono`}>{matricule}</span>
              </div>
              <div>
                <span className={`block text-[7px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>VALIDITÉ</span>
                <span className={`text-[9.5px] font-black uppercase tracking-wider ${emp.dateExpiration ? (cfg.isDark ? 'text-amber-400 font-mono' : 'text-amber-800 font-mono') : cfg.valueColor}`}>{validite}</span>
              </div>
              <div>
                <span className={`block text-[7px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>TÉLÉPHONE</span>
                <span className={`text-[9.5px] font-black ${cfg.valueColor} tracking-wider tabular-nums`}>{emp.telephone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Signature & Contract Status Row */}
          <div className={`flex items-end justify-between mt-1 pt-1 border-t ${cfg.dividerBorder}`}>
            <div className="flex flex-col">
              <span className={`text-[7px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>CONTRAT</span>
              <span className={`text-[8.5px] font-bold ${cfg.subtextColor} uppercase mt-0.5`}>
                {emp.type === 'atelier' ? 'Interne (Atelier)' : 'Sous-traitance'}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className={`text-[6px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>SIGNATURE</span>
              {emp.signature ? (
                <img src={emp.signature} alt="Signature" className="h-5 max-h-5 max-w-[75px] object-contain drop-shadow-xs mt-0.5" />
              ) : (
                <svg className={`w-16 h-4 ${cfg.signatureColor} opacity-85 mt-0.5`} viewBox="0 0 140 35" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 10 24 C 25 6, 38 30, 52 14 C 60 6, 68 28, 90 16 C 105 9, 102 24, 130 13" />
                  <path d="M 30 28 L 120 28" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${cfg.accentBar}`} />
    </div>
  );
}

function BadgeBack({
  emp,
  company,
  isAr,
  theme = 'platinum',
}: {
  emp: Employe;
  company: any;
  isAr: boolean;
  theme?: BadgeTheme;
}) {
  const cfg = BADGE_THEMES[theme] || BADGE_THEMES.platinum;
  const shortId = emp.id ? emp.id.replace(/-/g, '').slice(0, 16).toUpperCase() : 'EMP0000000000000';
  const matricule = emp.matricule?.trim() ? emp.matricule.trim().toUpperCase() : `#EMP-${(emp.id || '').slice(0, 6).toUpperCase()}`;

  return (
    <div
      dir="ltr"
      className={`wallet-card-standard relative w-[370px] h-[234px] ${cfg.cardOuterBg} rounded-2xl overflow-hidden border ${cfg.cardBorder} flex flex-col justify-between select-none print:shadow-none print:border-slate-400 break-inside-avoid text-left transition-all shrink-0`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        imageRendering: '-webkit-optimize-contrast',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Top Magnetic Stripe Graphic */}
      <div className="h-[26px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between px-3 text-slate-400 text-[6.5px] font-mono tracking-widest uppercase shrink-0 z-10">
        <span className="opacity-75">{company.name || 'BEYA CREATIVE'} • ATELIER ACCREDITATION</span>
        <span className="text-slate-500 font-bold">SEC-ID #{shortId.slice(0, 8)}</span>
      </div>

      {/* DEDICATED SCAN ZONE (ZONE DE SCAN FLBACK & ID) with Watermark */}
      <div className={`relative px-2.5 py-1.5 flex-1 flex flex-col justify-between min-h-0 ${cfg.bodyBg} overflow-hidden`}>
        {/* The Watermark Layer */}
        <BeyaWatermark company={company} themeConfig={cfg} />

        {/* Scanner Target Container Box */}
        <div className={`${cfg.qrBoxBg} border ${cfg.qrBoxBorder} rounded-xl p-2 shadow-2xs relative z-10`}>
          <div className={`flex items-center justify-between mb-1 pb-1 border-b ${cfg.dividerBorder}`}>
            <div className="flex items-center gap-1.5">
              <QrCode className={`w-3.5 h-3.5 ${cfg.isDark ? 'text-amber-400' : 'text-indigo-600'}`} />
              <span className={`text-[7px] font-black uppercase tracking-wider ${cfg.nameColor}`}>
                ZONE DE SCANNING & CONTRÔLE D'ACCÈS
              </span>
            </div>
            <span className={`text-[6px] font-mono font-bold ${cfg.isDark ? 'text-amber-300 bg-amber-500/20 border-amber-500/30' : 'text-indigo-700 bg-indigo-50 border-indigo-100'} border px-1 py-0.2 rounded uppercase`}>
              POINTAGE RH
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick-Scan QR Code */}
            <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs shrink-0 flex items-center justify-center">
              {emp.id ? (
                <QRCodeSVG value={emp.id} size={54} level="M" />
              ) : (
                <div className="w-[54px] h-[54px] bg-slate-100 rounded animate-pulse" />
              )}
            </div>

            {/* Barcode Graphic & Large Bold Legible ID */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="bg-white p-1 rounded border border-slate-200">
                <BarcodeGraphic value={emp.matricule || shortId} />
              </div>
              
              <div className={`mt-1 pt-1 border-t ${cfg.dividerBorder}`}>
                <span className={`block text-[7px] font-black ${cfg.labelColor} uppercase tracking-widest leading-none`}>
                  IDENTIFIANT SCANNER & MATRICULE
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className={`text-[11px] font-mono font-black ${cfg.nameColor} tracking-wider uppercase leading-none`}>
                    {matricule}
                  </span>
                  <span className={`text-[7.5px] font-mono font-bold ${cfg.labelColor} uppercase`}>
                    {shortId.slice(0, 10)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Legal Notice */}
        <div className={`px-1 text-[7.5px] ${cfg.subtextColor} leading-tight relative z-10`}>
          <p className="line-clamp-2">
            Cette carte est strictement personnelle et demeure la propriété de {company.name || 'BEYA CREATIVE'}. Elle doit être présentée à toute réquisition du contrôle. En cas de perte, merci de la retourner au service RH.
          </p>
        </div>

        {/* Footer Contact & Validation Stamp */}
        <div className={`flex items-center justify-between pt-1 border-t ${cfg.dividerBorder} text-[7.5px] ${cfg.subtextColor} font-bold relative z-10`}>
          <div className="flex items-center gap-1">
            <Phone className={`w-2.5 h-2.5 ${cfg.labelColor}`} />
            <span>Tél RH : {company.phone || '06 73 43 79 08'}</span>
          </div>

          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 ${cfg.isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white/80 border-slate-300 text-slate-700'} border rounded-md text-[6.5px] font-black uppercase`}>
            <Check className="w-2.5 h-2.5 text-emerald-500" />
            <span>VALIDÉ DIRECTION RH</span>
          </div>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${cfg.accentBar}`} />
    </div>
  );
}

function ProfessionalBadgeCard({
  emp,
  company,
  isAr,
  empName,
  id,
  showPhotoUpload = false,
  onPhotoUpload,
  viewMode = 'both',
  theme = 'platinum',
}: {
  emp: Employe;
  company: any;
  isAr: boolean;
  empName: (e: Employe) => string;
  id?: string;
  showPhotoUpload?: boolean;
  onPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode?: 'both' | 'front' | 'back';
  theme?: BadgeTheme;
}) {
  return (
    <div
      id={id}
      dir="ltr"
      className="wallet-card-container flex flex-col md:flex-row items-center justify-center gap-4 p-2 print:p-0 print:gap-4 select-none"
    >
      {(viewMode === 'both' || viewMode === 'front') && (
        <BadgeFront
          emp={emp}
          company={company}
          isAr={isAr}
          empName={empName}
          showPhotoUpload={showPhotoUpload}
          onPhotoUpload={onPhotoUpload}
          theme={theme}
        />
      )}

      {viewMode === 'both' && (
        <div className="hidden md:flex flex-col items-center justify-center text-slate-400 print:flex shrink-0">
          <div className="w-[1px] h-14 border-r border-dashed border-slate-400 print:border-slate-400" />
          <span className="text-[7.5px] font-mono uppercase tracking-widest rotate-90 my-2 text-slate-500 print:text-slate-500 whitespace-nowrap">
            ✂ Découpe / Pli
          </span>
          <div className="w-[1px] h-14 border-r border-dashed border-slate-400 print:border-slate-400" />
        </div>
      )}

      {(viewMode === 'both' || viewMode === 'back') && (
        <BadgeBack
          emp={emp}
          company={company}
          isAr={isAr}
          theme={theme}
        />
      )}
    </div>
  );
}

const DEFAULT_REQUIRED_DOCUMENTS: Array<{ type: EmployeDocument['type']; nomAr: string; nomFr: string; requis: boolean }> = [
  { type: 'cin', nomAr: 'نسخة من البطاقة الوطنية (CIN)', nomFr: 'Copie Carte Nationale (CIN)', requis: true },
  { type: 'contrat', nomAr: 'عقد العمل الموقع (Contrat)', nomFr: 'Contrat de Travail Signé', requis: true },
  { type: 'casier', nomAr: 'بطاقة السوابق / حسن السيرة', nomFr: 'Fiche Anthropométrique / Casier', requis: true },
  { type: 'medical', nomAr: 'شهادة طبية للأهلية للعمل', nomFr: 'Certificat Médical d\'Aptitude', requis: true },
  { type: 'rib', nomAr: 'شهادة الحساب البنكي (RIB)', nomFr: 'Attestation RIB Bancaire', requis: true },
  { type: 'photo', nomAr: 'صور شمسية فوتوغرافية', nomFr: 'Photos d\'Identité (x2)', requis: true },
  { type: 'cnss', nomAr: 'شهادة التسجيل في CNSS', nomFr: 'Déclaration / Affiliation CNSS', requis: false },
  { type: 'diplome', nomAr: 'دبلوم أو شهادة تدريب / خبرة', nomFr: 'Diplôme / Attestation d\'Expérience', requis: false },
];

function calculateSeniority(dateStr?: string, isAr?: boolean) {
  if (!dateStr) return isAr ? 'غير مسجل' : 'Non renseigné';
  const start = new Date(dateStr);
  const now = new Date();
  if (isNaN(start.getTime())) return dateStr;
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years > 0 && months > 0) {
    return isAr ? `${years} سنة و ${months} أشهر` : `${years} an(s) et ${months} mois`;
  }
  if (years > 0) {
    return isAr ? `${years} سنة` : `${years} an(s)`;
  }
  if (months > 0) {
    return isAr ? `${months} أشهر` : `${months} mois`;
  }
  return isAr ? 'أقل من شهر' : 'Moins d\'un mois';
}

function getDossierStats(emp: Employe) {
  const docs = emp.documents || [];
  const requiredTypes = DEFAULT_REQUIRED_DOCUMENTS.filter(d => d.requis).map(d => d.type);
  
  let providedCount = 0;
  requiredTypes.forEach(t => {
    const found = docs.find(d => d.type === t);
    if (found && (found.fourni || found.fileUrl)) {
      providedCount++;
    }
  });
  
  const isComplete = Boolean(emp.dossierValide || (providedCount >= requiredTypes.length));
  return {
    providedCount,
    totalRequired: requiredTypes.length,
    isComplete,
    percentage: Math.min(100, Math.round((providedCount / requiredTypes.length) * 100)),
  };
}

export default function SuiviRH() {
  const { isAr } = useLang();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [paiements, setPaiements] = useState<PaiementSalaire[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMois, setSelectedMois] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Employe>>({});
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [payerEmployeId, setPayerEmployeId] = useState<string>('');
  const [payerForm, setPayerForm] = useState<{ montant: number; methode: string; notes: string }>({
    montant: 0, methode: 'especes', notes: '',
  });
  const [showHistorique, setShowHistorique] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Employe | null>(null);
  const [badgeViewFace, setBadgeViewFace] = useState<'both' | 'front' | 'back'>('both');
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>(() => {
    return (safeStorage.getItem('beya_badge_theme') as BadgeTheme) || 'platinum';
  });

  const handleBadgeThemeChange = (newTheme: BadgeTheme) => {
    setBadgeTheme(newTheme);
    safeStorage.setItem('beya_badge_theme', newTheme);
  };
  const [selectedDossierEmp, setSelectedDossierEmp] = useState<Employe | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<'papiers' | 'fautes' | 'infos' | 'paiements'>('papiers');
  const [directCodeInput, setDirectCodeInput] = useState('');
  const [showAddFaute, setShowAddFaute] = useState(false);
  const [fauteForm, setFauteForm] = useState<{
    date: string;
    titre: string;
    degre: 'mineure' | 'avertissement' | 'grave';
    description: string;
    decision: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    titre: '',
    degre: 'avertissement',
    description: '',
    decision: ''
  });
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);
  const [newCustomDocName, setNewCustomDocName] = useState('');
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [selectedContractEmp, setSelectedContractEmp] = useState<Employe | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simNet, setSimNet] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Bon de Travail state
  const [showBonModal, setShowBonModal] = useState(false);
  const [bonForm, setBonForm] = useState({ empId: '', cmdId: '', avance: 0, methode: 'especes' });
  const [generatedBon, setGeneratedBon] = useState<{ id: string; emp: Employe; cmd?: Commande; avance: number; methode: string; date: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ nom: string; pin: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const company = loadCompanyProfile();

  const location = useLocation();

  useEffect(() => {
    setSyncStatus(isAr ? 'جاري التحميل...' : 'Chargement...');
    
    loadData<Employe>('employes').then(remoteEmps => {
      const localEmps = getLocalRH<Employe>('employes');
      const merged = (remoteEmps || []).map(rem => {
        const loc = localEmps.find(l => l.id === rem.id);
        return {
          ...rem,
          dateEmbauche: rem.dateEmbauche || loc?.dateEmbauche || rem.dateEntree || '',
          dateNaissance: rem.dateNaissance || loc?.dateNaissance || '',
          cnss: rem.cnss || loc?.cnss || '',
          dossierValide: rem.dossierValide !== undefined ? rem.dossierValide : (loc?.dossierValide || false),
          fautes: rem.fautes || loc?.fautes || [],
          documents: rem.documents || loc?.documents || [],
          notesRH: rem.notesRH || loc?.notesRH || '',
          photo: rem.photo || loc?.photo || '',
          signature: rem.signature || loc?.signature || '',
        };
      });
      // Keep any local-only employees
      localEmps.forEach(l => {
        if (!merged.find(m => m.id === l.id)) {
          merged.push(l);
        }
      });
      setEmployes(merged);
      saveLocalRH('employes', merged);
    }).catch(() => {
      setEmployes(getLocalRH<Employe>('employes'));
    });

    loadData<PaiementSalaire>('paiements_salaires').then(remotePaiements => {
      setPaiements(remotePaiements || []);
      saveLocalRH('paiements_salaires', remotePaiements || []);
    }).catch(() => {
      setPaiements(getLocalRH<PaiementSalaire>('paiements_salaires'));
    });

    loadData<Commande>('commandes').then(remoteCmds => {
      setCommandes(remoteCmds || []);
      setLoading(false);
    });

    setSyncStatus(null);

    // Handle Incoming Candidate Data from Recruitment
    if (location.state?.fromRecruitment) {
      const candidate = location.state.fromRecruitment;
      const [firstName, ...lastNameParts] = candidate.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Clean the position name
      let suggestedPoste = '';
      const rawType = candidate.type.replace('RECRUTEMENT: ', '');
      const posteMatch = POSTES_ATELIER.find(p => p.toLowerCase().includes(rawType.toLowerCase())) || 
                         POSTES_SOUSTRAITANCE.find(p => p.toLowerCase().includes(rawType.toLowerCase()));
      
      if (posteMatch) {
        suggestedPoste = posteMatch;
      } else {
        // Try matching Arabic labels if needed, or just use the raw type
        suggestedPoste = rawType;
      }

      setForm({
        nom: lastName || firstName,
        prenom: lastName ? firstName : '',
        telephone: candidate.phone,
        email: candidate.email === 'recrutement@beya.ma' ? '' : candidate.email,
        poste: suggestedPoste,
        type: 'atelier',
        actif: true,
        salaireMensuel: 0,
        remunerationType: 'mensuel'
      });
      setShowModal(true);
      
      // Clear location state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [isAr, location.state]);

  // Handle direct lookup via URL parameter (?code=... or ?emp=...)
  useEffect(() => {
    const hashParams = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const searchStr = location.search || (hashParams ? `?${hashParams}` : '');
    const params = new URLSearchParams(searchStr);
    const codeParam = params.get('code') || params.get('emp') || params.get('id') || params.get('matricule') || params.get('cin') || params.get('pin');
    if (codeParam && employes.length > 0) {
      const q = codeParam.trim().toLowerCase();
      const found = employes.find(e => 
        (e.id && e.id.toLowerCase() === q) ||
        (e.id && e.id.replace(/-/g, '').toLowerCase().includes(q)) ||
        (e.matricule && e.matricule.toLowerCase() === q) ||
        (e.matricule && e.matricule.toLowerCase().replace('#emp-', '') === q.replace('#emp-', '')) ||
        (e.cin && e.cin.toLowerCase() === q) ||
        (e.pin_code && e.pin_code.toLowerCase() === q) ||
        (e.telephone && e.telephone.replace(/\s+/g, '') === q.replace(/\s+/g, '')) ||
        (`${e.prenom || ''} ${e.nom || ''}`.toLowerCase().includes(q))
      );
      if (found) {
        setSelectedDossierEmp(found);
      }
    }
  }, [location.search, location.hash, employes]);

  const openDossierPage = (emp: Employe) => {
    setSelectedDossierEmp(emp);
    window.location.hash = `#/rh?emp=${encodeURIComponent(emp.id)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeDossierPage = () => {
    setSelectedDossierEmp(null);
    window.location.hash = '#/rh';
  };

  const handleDirectCodeLookup = (code: string) => {
    if (!code || !code.trim()) return;
    const q = code.trim().toLowerCase();
    const found = employes.find(e => 
      (e.id && e.id.toLowerCase() === q) ||
      (e.id && e.id.replace(/-/g, '').toLowerCase().includes(q)) ||
      (e.matricule && e.matricule.toLowerCase() === q) ||
      (e.matricule && e.matricule.toLowerCase().replace('#emp-', '') === q.replace('#emp-', '')) ||
      (e.cin && e.cin.toLowerCase() === q) ||
      (e.pin_code && e.pin_code.toLowerCase() === q) ||
      (e.telephone && e.telephone.replace(/\s+/g, '') === q.replace(/\s+/g, '')) ||
      (`${e.prenom || ''} ${e.nom || ''}`.toLowerCase().includes(q))
    );
    if (found) {
      openDossierPage(found);
      setDirectCodeInput('');
    } else {
      alert(isAr ? `لم يتم العثور على أي موظف بهذا الرمز: "${code}"` : `Aucun employé trouvé avec le code: "${code}"`);
    }
  };

  const updateEmpDossier = (updated: Employe) => {
    setEmployes(prev => {
      const next = prev.map(e => e.id === updated.id ? updated : e);
      saveLocalRH('employes', next);
      return next;
    });
    setSelectedDossierEmp(updated);
    saveRecord('employes', updated, true).catch(() => {});
  };

  const handleToggleDoc = (docType: string, customDocId?: string) => {
    if (!selectedDossierEmp) return;
    const currentDocs = [...(selectedDossierEmp.documents || [])];
    const idx = currentDocs.findIndex(d => customDocId ? d.id === customDocId : d.type === docType);
    
    if (idx !== -1) {
      currentDocs[idx] = { ...currentDocs[idx], fourni: !currentDocs[idx].fourni, dateMaj: new Date().toISOString().slice(0, 10) };
    } else {
      const def = DEFAULT_REQUIRED_DOCUMENTS.find(d => d.type === docType);
      currentDocs.push({
        id: genId(),
        type: docType as any,
        nom: def ? (isAr ? def.nomAr : def.nomFr) : docType,
        fourni: true,
        dateMaj: new Date().toISOString().slice(0, 10),
      });
    }

    const updated = { ...selectedDossierEmp, documents: currentDocs };
    updateEmpDossier(updated);
  };

  const handleDocFileUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>, customDocId?: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDossierEmp) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const currentDocs = [...(selectedDossierEmp.documents || [])];
      const idx = currentDocs.findIndex(d => customDocId ? d.id === customDocId : d.type === docType);
      const def = DEFAULT_REQUIRED_DOCUMENTS.find(d => d.type === docType);
      
      if (idx !== -1) {
        currentDocs[idx] = { 
          ...currentDocs[idx], 
          fourni: true, 
          fileUrl: base64, 
          dateMaj: new Date().toISOString().slice(0, 10) 
        };
      } else {
        currentDocs.push({
          id: genId(),
          type: docType as any,
          nom: def ? (isAr ? def.nomAr : def.nomFr) : docType,
          fourni: true,
          fileUrl: base64,
          dateMaj: new Date().toISOString().slice(0, 10),
        });
      }

      const updated = { ...selectedDossierEmp, documents: currentDocs };
      updateEmpDossier(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocFile = (docType: string, customDocId?: string) => {
    if (!selectedDossierEmp) return;
    const currentDocs = [...(selectedDossierEmp.documents || [])];
    const idx = currentDocs.findIndex(d => customDocId ? d.id === customDocId : d.type === docType);
    if (idx !== -1) {
      currentDocs[idx] = { ...currentDocs[idx], fileUrl: undefined, fourni: false };
      const updated = { ...selectedDossierEmp, documents: currentDocs };
      updateEmpDossier(updated);
    }
  };

  const handleAddCustomDoc = () => {
    if (!newCustomDocName.trim() || !selectedDossierEmp) return;
    const currentDocs = [...(selectedDossierEmp.documents || [])];
    currentDocs.push({
      id: genId(),
      type: 'autre',
      nom: newCustomDocName.trim(),
      fourni: true,
      dateMaj: new Date().toISOString().slice(0, 10),
    });
    const updated = { ...selectedDossierEmp, documents: currentDocs };
    updateEmpDossier(updated);
    setNewCustomDocName('');
    setShowAddDocForm(false);
  };

  const handleToggleDossierValide = () => {
    if (!selectedDossierEmp) return;
    const newVal = !selectedDossierEmp.dossierValide;
    const updated = { ...selectedDossierEmp, dossierValide: newVal };
    updateEmpDossier(updated);
  };

  const handleSaveFaute = () => {
    if (!fauteForm.titre.trim() || !selectedDossierEmp) return;
    const currentFautes = [...(selectedDossierEmp.fautes || [])];
    currentFautes.unshift({
      id: genId(),
      date: fauteForm.date || new Date().toISOString().slice(0, 10),
      titre: fauteForm.titre.trim(),
      degre: fauteForm.degre,
      description: fauteForm.description.trim(),
      decision: fauteForm.decision.trim(),
      auteur: company.name || 'Direction RH',
    });
    const updated = { ...selectedDossierEmp, fautes: currentFautes };
    updateEmpDossier(updated);
    setFauteForm({
      date: new Date().toISOString().slice(0, 10),
      titre: '',
      degre: 'avertissement',
      description: '',
      decision: ''
    });
    setShowAddFaute(false);
  };

  const handleDeleteFaute = (fauteId: string) => {
    if (!selectedDossierEmp) return;
    const currentFautes = (selectedDossierEmp.fautes || []).filter(f => f.id !== fauteId);
    const updated = { ...selectedDossierEmp, fautes: currentFautes };
    updateEmpDossier(updated);
  };

  const handleUpdateDateEmbauche = (newDate: string) => {
    if (!selectedDossierEmp) return;
    const updated = { ...selectedDossierEmp, dateEmbauche: newDate };
    updateEmpDossier(updated);
  };

  const availableMois = useMemo(() => {
    try {
      const months = new Set<string>();
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      const [currentYear, currentMonth] = currentMonthStr.split('-').map(Number);
      for (let y = 2025; y <= currentYear; y++) {
        const maxMonth = (y === currentYear) ? currentMonth : 12;
        for (let m = 1; m <= maxMonth; m++) {
          months.add(`${y}-${String(m).padStart(2, '0')}`);
        }
      }
      if (Array.isArray(paiements)) {
        paiements.forEach(p => {
          if (p && p.mois && p.mois <= currentMonthStr) {
            months.add(p.mois);
          }
        });
      }
      if (selectedMois && selectedMois <= currentMonthStr) {
        months.add(selectedMois);
      }
      return [...months].sort().reverse();
    } catch (e) {
      console.error("Error computing available months:", e);
      return [selectedMois];
    }
  }, [paiements, selectedMois]);

  const filtered = employes.filter(e => {
    const fullName = `${e.prenom || ''} ${e.nom || ''}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) || (e.poste || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;
    return matchSearch && matchType;
  });

  function getPaye(empId: string) {
    if (!empId || !Array.isArray(paiements)) return 0;
    return paiements
      .filter(p => p && p.employeId === empId && p.mois === selectedMois)
      .reduce((a, p) => a + (p.montant || 0), 0);
  }

  function getReste(emp: Employe) {
    if (!emp) return 0;
    return Math.max(0, (emp.salaireMensuel || 0) - getPaye(emp.id));
  }


  const totalPayeMois = useMemo(() => {
    try {
      return (employes || []).reduce((a, e) => a + getPaye(e.id), 0);
    } catch (err) { return 0; }
  }, [employes, paiements, selectedMois]);

  const totalResteMois = useMemo(() => {
    try {
      return (employes || [])
        .filter(e => e && e.actif)
        .reduce((a, e) => a + getReste(e), 0);
    } catch (err) { return 0; }
  }, [employes, paiements, selectedMois]);

  const atelierCount = useMemo(() => (employes || []).filter(e => e && e.type === 'atelier' && e.actif).length, [employes]);
  const stCount = useMemo(() => (employes || []).filter(e => e && e.type === 'sous_traitance' && e.actif).length, [employes]);
  const masseSalariale = useMemo(() => (employes || []).filter(e => e && e.type === 'atelier' && e.actif).reduce((a, e) => a + (e.salaireMensuel || 0), 0), [employes]);

  const compressImageFile = (file: File, maxW = 400, maxH = 480): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxW) {
              height = Math.round((height * maxW) / width);
              width = maxW;
            }
          } else {
            if (height > maxH) {
              width = Math.round((width * maxH) / height);
              height = maxH;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(event.target.result as string);
          }
        };
        img.onerror = () => resolve('');
        img.src = event.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleEmployeePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setForm(prev => ({ ...prev, photo: compressed }));
    }
  };

  const handleDirectBadgePhotoUpload = async (empId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setSelectedBadge(prev => prev ? { ...prev, photo: compressed } : null);
      setEmployes(prev => {
        const next = prev.map(emp => emp.id === empId ? { ...emp, photo: compressed } : emp);
        saveLocalRH('employes', next);
        return next;
      });
      const targetEmp = employes.find(emp => emp.id === empId);
      if (targetEmp) {
        saveRecord('employes', { ...targetEmp, photo: compressed }, true).catch(() => {});
      }
    }
  };

  const handleDeleteBadgePhoto = async (empId: string) => {
    setSelectedBadge(prev => prev ? { ...prev, photo: '' } : null);
    setEmployes(prev => {
      const next = prev.map(emp => emp.id === empId ? { ...emp, photo: '' } : emp);
      saveLocalRH('employes', next);
      return next;
    });
    const targetEmp = employes.find(emp => emp.id === empId);
    if (targetEmp) {
      saveRecord('employes', { ...targetEmp, photo: '' }, true).catch(() => {});
    }
  };

  const handleEmployeeSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 300, 120);
    if (compressed) {
      setForm(prev => ({ ...prev, signature: compressed }));
    }
  };

  const handleDirectBadgeSignatureUpload = async (empId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 300, 120);
    if (compressed) {
      setSelectedBadge(prev => prev ? { ...prev, signature: compressed } : null);
      setEmployes(prev => {
        const next = prev.map(emp => emp.id === empId ? { ...emp, signature: compressed } : emp);
        saveLocalRH('employes', next);
        return next;
      });
      const targetEmp = employes.find(emp => emp.id === empId);
      if (targetEmp) {
        saveRecord('employes', { ...targetEmp, signature: compressed }, true).catch(() => {});
      }
    }
  };

  const handleDeleteBadgeSignature = async (empId: string) => {
    setSelectedBadge(prev => prev ? { ...prev, signature: '' } : null);
    setEmployes(prev => {
      const next = prev.map(emp => emp.id === empId ? { ...emp, signature: '' } : emp);
      saveLocalRH('employes', next);
      return next;
    });
    const targetEmp = employes.find(emp => emp.id === empId);
    if (targetEmp) {
      saveRecord('employes', { ...targetEmp, signature: '' }, true).catch(() => {});
    }
  };

  function openCreate() {
    setEditId(null);
    setForm({
      nom: '', prenom: '', poste: '', type: 'atelier',
      telephone: '', email: '', adresse: '', cin: '',
      banque: '', rib: '', actif: true, salaireMensuel: 0,
      remunerationType: 'mensuel', photo: '',
      matricule: '', dateExpiration: '', signature: '',
      dateEmbauche: new Date().toISOString().slice(0, 10),
      cnss: '',
      dossierValide: false,
      fautes: [],
      documents: []
    });
    setShowModal(true);
  }

  function openEdit(e: Employe) {
    setEditId(e.id);
    setForm({ ...e });
    setShowModal(true);
  }

  async function save() {
    if (!form.nom) return;
    const isNew = !editId;
    const eId = editId || genId();
    const empData = { id: eId, ...form } as Employe;

    const updated = isNew
      ? [...employes, empData]
      : employes.map(e => e.id === editId ? empData : e);

    setEmployes(updated);
    saveLocalRH('employes', updated);

    // Sync with Supabase so other modules (like Commandes) can see them
    await saveRecord('employes', empData, true);

    // ✅ AUTO-CREATE USER ACCOUNT for new employees
    if (isNew) {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const finalPin = empData.pin_code || generatedPin;
      
      const newUser = {
        id: genId(),
        nom: `${empData.prenom || ''} ${empData.nom}`.trim(),
        role: 'worker' as const,
        email: empData.email || `${empData.nom.toLowerCase().replace(/\s/g, '')}.${genId().split('-')[0]}@beya.local`,
        telephone: empData.telephone || '',
        password: finalPin, // Use PIN as password for workers
        pinCode: finalPin,
        employeId: eId,
        photo: empData.photo || '',
        lastActive: new Date().toISOString(),
      };
      
      // Save to Supabase (users table)
      await saveRecord('users', newUser, true);
      
      // Update local users list in storage for immediate UI sync
      try {
        const localUsersRaw = localStorage.getItem('textrack_users');
        const localUsers = localUsersRaw ? JSON.parse(localUsersRaw) : [];
        localStorage.setItem('textrack_users', JSON.stringify([...localUsers, newUser]));
      } catch { /* ignore */ }

      setToast({ nom: newUser.nom, pin: finalPin });
      setTimeout(() => setToast(null), 6000);
    } else {
      // Sync photo to existing user if exists
      try {
        const localUsersRaw = localStorage.getItem('textrack_users');
        if (localUsersRaw) {
          const localUsers = JSON.parse(localUsersRaw);
          const idx = localUsers.findIndex((u: any) => u.employeId === eId);
          if (idx !== -1) {
            localUsers[idx].photo = empData.photo || localUsers[idx].photo || '';
            localUsers[idx].nom = `${empData.prenom || ''} ${empData.nom}`.trim();
            localStorage.setItem('textrack_users', JSON.stringify(localUsers));
            saveRecord('users', localUsers[idx], true).catch(() => {});
          }
        }
      } catch {}
    }

    setShowModal(false);
  }

  async function syncAll() {
    setSyncing(true);
    setSyncStatus(isAr ? 'جاري المزامنة...' : 'Synchronisation...');

    let count = 0;
    for (const emp of employes) {
      try {
        await saveRecord('employes', emp, true);
        count++;
      } catch (e) {
        console.error("Failed to sync", emp.nom, e);
      }
    }

    setSyncing(false);
    setSyncStatus(isAr ? `تمت مزامنة ${count} موظف` : `${count} employés synchronisés`);
    setTimeout(() => setSyncStatus(null), 3000);
  }

  function openPayer(empId: string) {
    const emp = employes.find(e => e.id === empId);
    const reste = emp ? getReste(emp) : 0;
    setPayerEmployeId(empId);
    setPayerForm({ montant: reste, methode: 'especes', notes: '' });
    setShowPayerModal(true);
  }

  async function savePaiement() {
    const { montant, methode, notes } = payerForm;
    if (!montant || montant <= 0) return;

    const newPaiement: PaiementSalaire = {
      id: genId(),
      employeId: payerEmployeId,
      montant,
      date: new Date().toISOString().split('T')[0],
      mois: selectedMois,
      methode: methode as PaiementSalaire['methode'],
      notes: notes || undefined,
    };

    const updatedPaiements = [...paiements, newPaiement];
    setPaiements(updatedPaiements);
    saveLocalRH('paiements_salaires', updatedPaiements);

    // Sync with server
    await saveRecord('paiements_salaires', newPaiement);

    setShowPayerModal(false);

    const emp = employes.find(e => e.id === payerEmployeId);
    if (emp) {
      const moisLabelStr = new Date(selectedMois + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });
      const empNameStr = emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom;

      // Determine category: 'salaires' for atelier, 'sous_traitance' for façonnier
      const chargeCat: any = emp.type === 'sous_traitance' ? 'sous_traitance' : 'salaires';

      const newCharge = {
        id: genId(),
        designation: `Paiement ${empNameStr} — ${moisLabelStr}`,
        categorie: chargeCat,
        montant,
        date: newPaiement.date,
        statut: 'payé',
        recurrence: 'mensuel',
        fournisseur: empNameStr,
        notes: notes || undefined,
      };
      saveRecord('charges', newCharge).catch(() => console.log("Silent error saving charge"));
    }
  }

  function handleGenerateBon() {
    const emp = employes.find(e => e.id === bonForm.empId);
    const cmd = commandes.find(c => c.id === bonForm.cmdId);
    if (!emp) return;

    const bon = {
      id: genId().slice(-6).toUpperCase(),
      emp,
      cmd,
      avance: bonForm.avance,
      methode: bonForm.methode,
      date: new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')
    };

    setGeneratedBon(bon);
    setShowBonModal(false);

    if (bon.avance > 0) {
      const newP: PaiementSalaire = {
        id: genId(),
        employeId: emp.id,
        montant: bon.avance,
        date: new Date().toISOString().split('T')[0],
        mois: selectedMois,
        methode: bon.methode as any,
        notes: `Avance sur Bon Travail ${bon.id}`
      };
      const updatedP = [...paiements, newP];
      setPaiements(updatedP);
      saveLocalRH('paiements_salaires', updatedP);

      // AUTOMATIC CHARGE SYNC for Advance
      const empNameStr = emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom;
      const chargeCat: any = emp.type === 'sous_traitance' ? 'sous_traitance' : 'salaires';

      const newCharge = {
        id: genId(),
        designation: `Avance ${empNameStr} — Bon Travail #${bon.id}`,
        categorie: chargeCat,
        montant: bon.avance,
        date: newP.date,
        statut: 'payé',
        recurrence: 'ponctuel',
        fournisseur: empNameStr,
        notes: `Commande: ${cmd?.reference || '—'}`,
      };
      saveRecord('charges', newCharge).catch(() => console.log("Silent error saving advance charge"));
    }
  }

  const handleDownloadPDF = async (elementId: string, filename: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setTimeout(async () => {
      try {
        await generatePDF(elementId, filename);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const moisLabel = (m: string) =>
    new Date(m + '-01').toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' });

  const empName = (e: Employe) => {
    if (!e) return '...';
    const p = e.prenom || '';
    const n = e.nom || '';
    return p ? `${p} ${n}` : n || (isAr ? 'بدون اسم' : 'Sans nom');
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 relative">

      {/* ✅ Toast Notification - Auto User Created */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-black/40 px-6 py-4 flex items-center gap-4 min-w-[320px] border border-white/10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-0.5">
                {isAr ? 'حساب جديد تلقائي ✅' : 'Compte créé automatiquement ✅'}
              </p>
              <p className="text-sm font-bold text-white">{toast.nom}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isAr ? 'كلمة السر / PIN:' : 'Mot de passe / PIN:'} <span className="text-indigo-400 font-black tracking-[0.3em]">{toast.pin}</span>
              </p>
            </div>
            <button onClick={() => setToast(null)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
      {selectedDossierEmp ? (
        /* ========================================================================= */
        /* 📄 PAGE COMPLÈTE DU DOSSIER PERSONNEL RH (PAGE DÉDIÉE - MACHI BOX)       */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Navigation & Breadcrumbs Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[28px] border-2 border-slate-50 shadow-sm ${isAr ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <button
                onClick={closeDossierPage}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-slate-900/10 transition active:scale-95"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'العودة لقائمة الموظفين' : 'Retour aux employés'}</span>
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
              <div className={`flex items-center gap-2 text-xs font-bold text-slate-400 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="cursor-pointer hover:text-indigo-600 transition" onClick={closeDossierPage}>{isAr ? 'الموارد البشرية' : 'Suivi RH'}</span>
                <span>/</span>
                <span className="text-slate-900 font-black uppercase tracking-tight">{empName(selectedDossierEmp)}</span>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className={`flex items-center gap-2 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setSelectedBadge(selectedDossierEmp)}
                className="px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition border border-indigo-100 active:scale-95 shadow-xs"
                title={isAr ? 'عرض وطباعة بطاقة العمل' : 'Badge'}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? 'الشارة المهنية' : 'Badge'}</span>
              </button>

              <button
                onClick={() => { setSelectedContractEmp(selectedDossierEmp); setShowContract(true); }}
                className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition border border-emerald-100 active:scale-95 shadow-xs"
                title={isAr ? 'عقد العمل' : 'Contrat'}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'عقد العمل' : 'Contrat'}</span>
              </button>

              <button
                onClick={() => openPayer(selectedDossierEmp.id)}
                className="px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition border border-amber-100 active:scale-95 shadow-xs"
                title={isAr ? 'أداء الراتب أو تسبيق' : 'Payer'}
              >
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'أداء الراتب' : 'Payer'}</span>
              </button>

              <button
                onClick={() => openEdit(selectedDossierEmp)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
                title={isAr ? 'تعديل البيانات' : 'Modifier'}
              >
                <Edit2 className="w-4 h-4 text-slate-600" />
                <span>{isAr ? 'تعديل' : 'Modifier'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
                title={isAr ? 'طباعة الملف' : 'Imprimer'}
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة' : 'Imprimer'}</span>
              </button>
            </div>
          </div>

          {/* Hero Profile Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[36px] p-8 shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 ${isAr ? 'md:flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-6 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-[30px] bg-white/10 p-1.5 border-2 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
                    {selectedDossierEmp.photo ? (
                      <img src={selectedDossierEmp.photo} alt={selectedDossierEmp.nom} className="w-full h-full object-cover rounded-[24px]" />
                    ) : (
                      <span className="text-3xl font-black text-white uppercase">
                        {selectedDossierEmp.prenom && selectedDossierEmp.nom 
                          ? (selectedDossierEmp.prenom[0] || '') + (selectedDossierEmp.nom[0] || '')
                          : (selectedDossierEmp.nom?.substring(0, 2).toUpperCase() || '??')}
                      </span>
                    )}
                  </div>
                  <div 
                    className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-black ${
                      selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}
                    title={selectedDossierEmp.dossierValide ? (isAr ? 'ملف مصادق عليه' : 'Dossier validé') : (isAr ? 'أوراق ناقصة' : 'Dossier incomplet')}
                  >
                    {selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete ? '✓' : '!'}
                  </div>
                </div>

                <div>
                  <div className={`flex items-center gap-2 flex-wrap mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">{empName(selectedDossierEmp)}</h2>
                    {selectedDossierEmp.matricule && (
                      <span className="font-mono text-xs font-black bg-white/10 px-3 py-1 rounded-xl text-indigo-300 border border-white/10 uppercase">
                        {selectedDossierEmp.matricule}
                      </span>
                    )}
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl ${selectedDossierEmp.type === 'atelier' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-emerald-500/30 text-emerald-200'}`}>
                      {selectedDossierEmp.type === 'atelier' ? (isAr ? 'المعمل (داخلي)' : 'Atelier') : (isAr ? 'خارجي' : 'Sous-traitance')}
                    </span>
                  </div>

                  <div className={`flex items-center gap-3 text-xs text-slate-300 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold text-indigo-300 text-sm">
                      {isAr ? (POSTES_ATELIER_AR[POSTES_ATELIER.indexOf(selectedDossierEmp.poste)] || selectedDossierEmp.poste) : selectedDossierEmp.poste}
                    </span>
                    {selectedDossierEmp.cin && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="font-mono text-slate-300 font-bold">CIN: {selectedDossierEmp.cin}</span>
                      </>
                    )}
                    {selectedDossierEmp.telephone && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="tabular-nums font-bold">{selectedDossierEmp.telephone}</span>
                      </>
                    )}
                  </div>

                  {/* FOQACH BDA (Seniority pill) & Status Badges */}
                  <div className={`flex items-center gap-3 mt-3.5 flex-wrap ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-amber-300 border border-white/10 shadow-xs">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isAr ? 'بداية العمل:' : 'Embauché le:'}{' '}
                        <span className="font-black text-white">{selectedDossierEmp.dateEmbauche || (isAr ? 'غير مسجل' : 'Non renseigné')}</span>
                      </span>
                      <span className="text-[11px] font-bold text-amber-200">
                        ({calculateSeniority(selectedDossierEmp.dateEmbauche, isAr)})
                      </span>
                    </div>

                    {selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete ? (
                      <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'الملف الإداري كامل ومصادق عليه ✓' : 'Dossier complet & validé ✓'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? `أوراق معلقة (${getDossierStats(selectedDossierEmp).providedCount}/${getDossierStats(selectedDossierEmp).totalRequired})` : `Incomplet (${getDossierStats(selectedDossierEmp).providedCount}/${getDossierStats(selectedDossierEmp).totalRequired})`}</span>
                      </span>
                    )}

                    {(selectedDossierEmp.fautes || []).length === 0 ? (
                      <span className="flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-white/10 px-3 py-1.5 rounded-2xl text-xs font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'سجل نظيف (0 مخالفات)' : 'Sceau propre (0 faute)'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? `${(selectedDossierEmp.fautes || []).length} مخالفة مسجلة` : `${(selectedDossierEmp.fautes || []).length} faute(s)`}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Nav */}
            <div className={`flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto scrollbar-hide ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setDossierActiveTab('papiers')}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition shrink-0 ${
                  dossierActiveTab === 'papiers'
                    ? 'bg-white text-slate-900 shadow-xl shadow-black/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <FileCheck className="w-4 h-4 text-indigo-500" />
                <span>{isAr ? 'الوثائق والأوراق الإدارية' : 'Papiers & Documents'}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  getDossierStats(selectedDossierEmp).isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {getDossierStats(selectedDossierEmp).providedCount}/{getDossierStats(selectedDossierEmp).totalRequired}
                </span>
              </button>

              <button
                onClick={() => setDossierActiveTab('fautes')}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition shrink-0 ${
                  dossierActiveTab === 'fautes'
                    ? 'bg-white text-slate-900 shadow-xl shadow-black/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{isAr ? 'سجل المخالفات والإنذارات' : 'Historique des Fautes'}</span>
                {(selectedDossierEmp.fautes || []).length > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md">
                    {(selectedDossierEmp.fautes || []).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setDossierActiveTab('infos')}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition shrink-0 ${
                  dossierActiveTab === 'infos'
                    ? 'bg-white text-slate-900 shadow-xl shadow-black/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <UserIcon className="w-4 h-4 text-sky-500" />
                <span>{isAr ? 'بيانات البداية والعمل' : 'Embauche & Détails'}</span>
              </button>

              <button
                onClick={() => setDossierActiveTab('paiements')}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition shrink-0 ${
                  dossierActiveTab === 'paiements'
                    ? 'bg-white text-slate-900 shadow-xl shadow-black/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'سجل الأداءات والرواتب' : 'Paiements & Salaires'}</span>
              </button>
            </div>
          </div>

          {/* Full Page Body Content (Tabs) */}
          <div className="space-y-6">
            
            {/* TAB 1: PAPIERS & DOCUMENTS */}
            {dossierActiveTab === 'papiers' && (
              <div className="space-y-6">
                {/* Status Banner & Validation CTA */}
                <div className={`p-6 sm:p-8 rounded-[32px] border-2 flex flex-col sm:flex-row items-center justify-between gap-6 ${
                  selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                } ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 ${
                      selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-amber-500 text-white shadow-xl shadow-amber-500/20'
                    }`}>
                      {selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <AlertCircle className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight">
                        {selectedDossierEmp.dossierValide || getDossierStats(selectedDossierEmp).isComplete
                          ? (isAr ? 'الملف الإداري مكتمل ومصادق عليه' : 'Dossier administratif complet et validé')
                          : (isAr ? 'الملف الإداري قيد الاستكمال (وثائق ناقصة)' : 'Dossier administratif incomplet')}
                      </h4>
                      <p className="text-xs font-bold opacity-80 mt-1">
                        {isAr 
                          ? `تم استلام ${getDossierStats(selectedDossierEmp).providedCount} من أصل ${getDossierStats(selectedDossierEmp).totalRequired} وثائق مطلوبة (${getDossierStats(selectedDossierEmp).percentage}%)`
                          : `${getDossierStats(selectedDossierEmp).providedCount} sur ${getDossierStats(selectedDossierEmp).totalRequired} documents fournis (${getDossierStats(selectedDossierEmp).percentage}%)`}
                      </p>
                      {/* Progress Bar */}
                      <div className="w-full sm:w-80 h-2.5 bg-black/10 rounded-full mt-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            getDossierStats(selectedDossierEmp).percentage === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${getDossierStats(selectedDossierEmp).percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={handleToggleDossierValide}
                      className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition active:scale-95 ${
                        selectedDossierEmp.dossierValide
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{selectedDossierEmp.dossierValide ? (isAr ? '✓ الملف مصادق عليه' : '✓ Dossier Validé') : (isAr ? 'المصادقة على اكتمال الملف' : 'Valider le Dossier')}</span>
                    </button>

                    <button
                      onClick={() => setShowAddDocForm(!showAddDocForm)}
                      className="px-5 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>{isAr ? 'إضافة وثيقة' : '+ Document'}</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Document Form */}
                {showAddDocForm && (
                  <div className={`bg-white p-6 sm:p-8 rounded-[32px] border-2 border-indigo-100 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200 ${isAr ? 'text-right' : ''}`}>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <FileUp className="w-5 h-5 text-indigo-600" />
                      <span>{isAr ? 'إضافة وثيقة إدارية مخصصة' : 'Ajouter un document personnalisé'}</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newCustomDocName}
                        onChange={e => setNewCustomDocName(e.target.value)}
                        placeholder={isAr ? 'مثال: رخصة السياقة، التزام بالشرف، شهادة سكنى إضافية...' : 'Ex: Permis de conduire, Déclaration sur l\'honneur...'}
                        className={`flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                      />
                      <button
                        onClick={handleAddCustomDoc}
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/20 active:scale-95 transition"
                      >
                        {isAr ? 'إضافة الوثيقة' : 'Ajouter'}
                      </button>
                      <button
                        onClick={() => { setShowAddDocForm(false); setNewCustomDocName(''); }}
                        className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-wider transition"
                      >
                        {isAr ? 'إلغاء' : 'Annuler'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Documents Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_REQUIRED_DOCUMENTS.map(reqDoc => {
                    const empDoc = (selectedDossierEmp.documents || []).find(d => d.type === reqDoc.type);
                    const isProvided = !!empDoc?.fourni;
                    const hasFile = !!empDoc?.fileUrl;

                    return (
                      <div 
                        key={reqDoc.type} 
                        className={`bg-white rounded-[30px] p-6 border-2 transition-all duration-200 shadow-sm flex flex-col justify-between gap-5 ${
                          isProvided ? 'border-emerald-100 hover:border-emerald-200' : 'border-slate-100 hover:border-amber-200'
                        }`}
                      >
                        <div className={`flex items-start justify-between gap-3 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isProvided ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isProvided ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6" />}
                            </div>
                            <div>
                              <h5 className="text-base font-black text-slate-900 leading-tight">
                                {isAr ? reqDoc.nomAr : reqDoc.nomFr}
                              </h5>
                              <p className="text-xs font-bold text-slate-400 mt-1">
                                {isAr ? reqDoc.nomFr : reqDoc.nomAr}
                              </p>
                              {empDoc?.dateMaj && (
                                <p className="text-[10px] font-bold text-slate-400 mt-1.5">
                                  {isAr ? 'تاريخ التحديث:' : 'Mis à jour le:'} {empDoc.dateMaj}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleDoc(reqDoc.type)}
                            className={`text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border transition active:scale-95 shrink-0 ${
                              isProvided
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isAr ? 'انقر لتغيير حالة الوثيقة' : 'Cliquer pour basculer le statut'}
                          >
                            {isProvided ? (isAr ? '✓ مُسلّم (Fourni)' : '✓ Fourni') : (isAr ? '❌ ناقص (Manquant)' : '❌ Manquant')}
                          </button>
                        </div>

                        {/* File Preview or Upload Actions */}
                        <div className={`pt-4 border-t border-slate-100 flex items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                          {hasFile ? (
                            <div className={`flex items-center gap-3 flex-1 min-w-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                              {empDoc.fileUrl?.startsWith('data:image') || empDoc.fileUrl?.includes('.jpg') || empDoc.fileUrl?.includes('.png') ? (
                                <div 
                                  onClick={() => { setPreviewDocUrl(empDoc.fileUrl!); setPreviewDocName(isAr ? reqDoc.nomAr : reqDoc.nomFr); }}
                                  className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer border border-slate-200 hover:opacity-80 transition shrink-0"
                                >
                                  <img src={empDoc.fileUrl} alt={reqDoc.nomFr} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                  <FileText className="w-6 h-6" />
                                </div>
                              )}
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-800 truncate">{empDoc.fileName || (isAr ? 'ملف مرفق' : 'Fichier joint')}</p>
                                <p className="text-[10px] font-bold text-emerald-600">{isAr ? 'نسخة محفوظة في الملف' : 'Archivé'}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-slate-400 italic">
                              {isAr ? 'لا توجد نسخة إلكترونية مرفقة' : 'Aucun fichier attaché'}
                            </p>
                          )}

                          <div className={`flex items-center gap-2 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                            {hasFile && (
                              <>
                                <button
                                  onClick={() => { setPreviewDocUrl(empDoc.fileUrl!); setPreviewDocName(isAr ? reqDoc.nomAr : reqDoc.nomFr); }}
                                  className="p-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition"
                                  title={isAr ? 'معاينة الوثيقة' : 'Visualiser'}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={empDoc.fileUrl}
                                  download={`${reqDoc.nomFr}_${selectedDossierEmp.nom}`}
                                  className="p-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition"
                                  title={isAr ? 'تحميل الوثيقة' : 'Télécharger'}
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteDocFile(reqDoc.type)}
                                  className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                                  title={isAr ? 'حذف الملف المرفق' : 'Supprimer le fichier'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 shadow-xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{hasFile ? (isAr ? 'تحديث' : 'Remplacer') : (isAr ? 'رفع نسخة' : 'Joindre')}</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={e => handleDocFileUpload(reqDoc.type, e)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Added Documents */}
                  {(selectedDossierEmp.documents || []).filter(d => d.type === 'autre').map(customDoc => (
                    <div 
                      key={customDoc.id} 
                      className="bg-white rounded-[30px] p-6 border-2 border-indigo-100 shadow-sm flex flex-col justify-between gap-5"
                    >
                      <div className={`flex items-start justify-between gap-3 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="text-base font-black text-slate-900 leading-tight">
                              {customDoc.nom}
                            </h5>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                              {isAr ? 'وثيقة مخصصة' : 'Document Personnalisé'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDoc('autre', customDoc.id)}
                            className={`text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border transition active:scale-95 shrink-0 ${
                              customDoc.fourni
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {customDoc.fourni ? '✓ Fourni' : '❌ Manquant'}
                          </button>
                          <button
                            onClick={() => {
                              const currentDocs = (selectedDossierEmp.documents || []).filter(d => d.id !== customDoc.id);
                              updateEmpDossier({ ...selectedDossierEmp, documents: currentDocs });
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                            title={isAr ? 'حذف الوثيقة' : 'Supprimer'}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className={`pt-4 border-t border-slate-100 flex items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        {customDoc.fileUrl ? (
                          <div className="flex items-center gap-3 flex-1 truncate">
                            <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 truncate">{customDoc.fileName || customDoc.nom}</p>
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-400 italic">{isAr ? 'لا يوجد ملف مرفق' : 'Aucun fichier'}</p>
                        )}

                        <div className="flex items-center gap-2 shrink-0">
                          {customDoc.fileUrl && (
                            <button
                              onClick={() => { setPreviewDocUrl(customDoc.fileUrl!); setPreviewDocName(customDoc.nom); }}
                              className="p-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{customDoc.fileUrl ? (isAr ? 'تحديث' : 'Remplacer') : (isAr ? 'رفع' : 'Joindre')}</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={e => handleDocFileUpload('autre', e, customDoc.id)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: HISTORIQUE DES FAUTES */}
            {dossierActiveTab === 'fautes' && (
              <div className="space-y-6">
                <div className={`p-6 sm:p-8 rounded-[32px] border-2 flex flex-col sm:flex-row items-center justify-between gap-6 ${
                  (selectedDossierEmp.fautes || []).length === 0
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                } ${isAr ? 'sm:flex-row-reverse text-right' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 ${
                      (selectedDossierEmp.fautes || []).length === 0 ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/20'
                    }`}>
                      {(selectedDossierEmp.fautes || []).length === 0 ? (
                        <ShieldCheck className="w-7 h-7" />
                      ) : (
                        <ShieldAlert className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight">
                        {(selectedDossierEmp.fautes || []).length === 0
                          ? (isAr ? 'سجل انضباطي سليم ونظيف 100%' : 'Casier disciplinaire vierge (0 faute)')
                          : (isAr ? `تنبيه: تم تسجيل ${(selectedDossierEmp.fautes || []).length} مخالفة في الملف` : `Attention: ${(selectedDossierEmp.fautes || []).length} faute(s) enregistrée(s)`)}
                      </h4>
                      <p className="text-xs font-bold opacity-80 mt-1">
                        {(selectedDossierEmp.fautes || []).length === 0
                          ? (isAr ? 'الموظف ملتزم بالقانون الداخلي وضوابط المعمل ولم تسجل بحقه أي عقوبة.' : 'L\'employé respecte le règlement intérieur et n\'a fait l\'objet d\'aucune sanction.')
                          : (isAr ? 'يرجى مراجعة تفاصيل الإنذارات والعقوبات المتخذة أدناه.' : 'Veuillez consulter les sanctions et détails des incidents ci-dessous.')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddFaute(!showAddFaute)}
                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'تسجيل خطأ / إنذار جديد' : '+ Enregistrer une faute'}</span>
                  </button>
                </div>

                {/* Add Faute Form */}
                {showAddFaute && (
                  <div className={`bg-white p-6 sm:p-8 rounded-[32px] border-2 border-rose-200 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200 ${isAr ? 'text-right' : ''}`}>
                    <div className={`flex items-center justify-between border-b border-slate-100 pb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        <span>{isAr ? 'تسجيل مخالفة أو تنبيه جديد للأجير' : 'Nouvelle infraction disciplinaire'}</span>
                      </h4>
                      <button onClick={() => setShowAddFaute(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={isAr ? 'text-right' : ''}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'تاريخ الواقعة *' : 'Date de l\'incident *'}</label>
                        <input
                          type="date"
                          value={fauteForm.date}
                          onChange={e => setFauteForm({ ...fauteForm, date: e.target.value })}
                          className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 ${isAr ? 'text-right' : ''}`}
                        />
                      </div>

                      <div className={isAr ? 'text-right' : ''}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'درجة الخطورة *' : 'Degré de gravité *'}</label>
                        <select
                          value={fauteForm.degre}
                          onChange={e => setFauteForm({ ...fauteForm, degre: e.target.value as any })}
                          className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 ${isAr ? 'text-right' : ''}`}
                        >
                          <option value="mineure">{isAr ? '🟡 مخالفة بسيطة / تنبيه شفوي (Mineure)' : '🟡 Faute mineure (Rappel à l\'ordre)'}</option>
                          <option value="avertissement">{isAr ? '🟠 إنذار كتابي رسمي (Avertissement écrit)' : '🟠 Avertissement écrit (Officiel)'}</option>
                          <option value="grave">{isAr ? '🔴 خطأ جسيم / استدعاء تأديبي (Faute grave)' : '🔴 Faute grave (Mise à pied / Conseil)'}</option>
                        </select>
                      </div>

                      <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'عنوان الخطأ / المخالفة *' : 'Motif / Titre de la faute *'}</label>
                        <input
                          type="text"
                          value={fauteForm.titre}
                          onChange={e => setFauteForm({ ...fauteForm, titre: e.target.value })}
                          placeholder={isAr ? 'مثال: تأخر متكرر عن العمل، إتلاف قماش/ماكينة، مغادرة الورشة دون إذن...' : 'Ex: Retard injustifié répété, Non-respect des consignes de coupe...'}
                          className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 ${isAr ? 'text-right' : ''}`}
                        />
                      </div>

                      <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'تفاصيل الواقعة والملابسات' : 'Description détaillée des faits'}</label>
                        <textarea
                          rows={3}
                          value={fauteForm.description}
                          onChange={e => setFauteForm({ ...fauteForm, description: e.target.value })}
                          placeholder={isAr ? 'اشرح ما وقع بدقة، الوقت، وموقف الأجير...' : 'Détaillez les circonstances de l\'incident...'}
                          className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 ${isAr ? 'text-right' : ''}`}
                        />
                      </div>

                      <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'القرار / الإجراء المتخذ' : 'Décision / Sanction prise'}</label>
                        <input
                          type="text"
                          value={fauteForm.decision}
                          onChange={e => setFauteForm({ ...fauteForm, decision: e.target.value })}
                          placeholder={isAr ? 'مثال: إنذار كتابي أول يودع في الملف، خصم، التزام بعدم التكرار...' : 'Ex: 1er avertissement versé au dossier, Engagement écrit signé...'}
                          className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 ${isAr ? 'text-right' : ''}`}
                        />
                      </div>
                    </div>

                    <div className={`flex justify-end gap-3 pt-3 border-t border-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => setShowAddFaute(false)}
                        className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition"
                      >
                        {isAr ? 'إلغاء' : 'Annuler'}
                      </button>
                      <button
                        onClick={handleSaveFaute}
                        className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/20 active:scale-95 transition"
                      >
                        {isAr ? 'حفظ المخالفة بالملف' : 'Enregistrer la faute'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Fautes Timeline / List */}
                {(selectedDossierEmp.fautes || []).length === 0 ? (
                  <div className="bg-white rounded-[32px] p-12 text-center border-2 border-slate-100">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{isAr ? 'لا توجد أي أخطاء أو إنذارات' : 'Aucune faute enregistrée'}</h4>
                    <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto">
                      {isAr ? 'هذا الموظف يتمتع بسجل مهني نظيف دون أي مخالفات مسجلة.' : 'Cet employé n\'a fait l\'objet d\'aucun avertissement ni sanction disciplinaire.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedDossierEmp.fautes || []).map((faute, fIdx) => {
                      const isGrave = faute.degre === 'grave';
                      const isAvert = faute.degre === 'avertissement';
                      return (
                        <div 
                          key={faute.id || fIdx} 
                          className={`bg-white rounded-[30px] p-6 border-2 transition-all shadow-sm ${
                            isGrave ? 'border-rose-200 bg-rose-50/20' : isAvert ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
                          }`}
                        >
                          <div className={`flex items-start justify-between gap-4 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isGrave ? 'bg-rose-100 text-rose-600' : isAvert ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <AlertTriangle className="w-6 h-6" />
                              </div>
                              <div>
                                <div className={`flex items-center gap-2 flex-wrap mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                                  <h5 className="text-base font-black text-slate-900">{faute.titre}</h5>
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
                                    isGrave 
                                      ? 'bg-rose-100 text-rose-800 border-rose-200' 
                                      : isAvert 
                                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {isGrave ? (isAr ? '🔴 خطأ جسيم' : 'Faute Grave') : isAvert ? (isAr ? '🟠 إنذار رسمي' : 'Avertissement') : (isAr ? '🟡 مخالفة بسيطة' : 'Faute Mineure')}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-slate-400">
                                  🗓️ {isAr ? 'تاريخ المخالفة:' : 'Date:'} <span className="text-slate-700">{faute.date}</span>
                                  {faute.auteur && <> • {isAr ? 'المسجل:' : 'Par:'} <span className="text-slate-700">{faute.auteur}</span></>}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (confirm(isAr ? 'هل أنت متأكد من حذف هذه المخالفة من السجل؟' : 'Supprimer cette faute du dossier ?')) {
                                  handleDeleteFaute(faute.id);
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title={isAr ? 'حذف المخالفة' : 'Supprimer'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {faute.description && (
                            <div className={`mt-3 p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 ${isAr ? 'text-right' : ''}`}>
                              <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">{isAr ? 'تفاصيل الواقعة:' : 'Détails des faits:'}</span>
                              {faute.description}
                            </div>
                          )}

                          {faute.decision && (
                            <div className={`mt-2 p-4 bg-white border border-slate-100 rounded-2xl text-xs font-black text-rose-800 ${isAr ? 'text-right' : ''}`}>
                              <span className="text-[10px] uppercase tracking-widest text-rose-500 block mb-0.5">{isAr ? 'الإجراء المتخذ / القرار:' : 'Sanction / Décision prise:'}</span>
                              {faute.decision}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INFOS & DATE EMBAUCHE */}
            {dossierActiveTab === 'infos' && (
              <div className="space-y-6">
                <div className={`bg-white p-6 sm:p-8 rounded-[32px] border-2 border-indigo-100 shadow-sm space-y-4 ${isAr ? 'text-right' : ''}`}>
                  <div className={`flex items-center justify-between border-b border-slate-100 pb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span>{isAr ? 'تاريخ بداية العمل والأقدمية (Foqach Bda)' : 'Date d\'embauche & Ancienneté'}</span>
                    </h4>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-xl">
                      {calculateSeniority(selectedDossierEmp.dateEmbauche, isAr)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        {isAr ? 'تاريخ بداية العمل في المعمل' : 'Date d\'embauche officielle'}
                      </label>
                      <input
                        type="date"
                        defaultValue={selectedDossierEmp.dateEmbauche || ''}
                        onBlur={e => handleUpdateDateEmbauche(e.target.value)}
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                      />
                      <p className="text-[10px] font-bold text-slate-400 mt-1.5">
                        {isAr ? 'يتم حفظ التاريخ تلقائياً وحساب الأقدمية فور تغييره.' : 'L\'ancienneté est recalculée automatiquement.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        {isAr ? 'رقم الضمان الاجتماعي (CNSS)' : 'N° CNSS'}
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedDossierEmp.cnss || ''}
                        onBlur={e => updateEmpDossier({ ...selectedDossierEmp, cnss: e.target.value })}
                        placeholder={isAr ? 'مثال: 123456789' : 'Ex: 123456789'}
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`bg-white p-6 sm:p-8 rounded-[30px] border-2 border-slate-100 shadow-sm space-y-3 ${isAr ? 'text-right' : ''}`}>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الهوية والاتصال' : 'Identité & Contact'}</h5>
                    <div className="space-y-3 text-xs font-bold">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'الاسم الكامل:' : 'Nom complet:'}</span>
                        <span className="text-slate-900">{empName(selectedDossierEmp)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">CIN:</span>
                        <span className="text-slate-900 font-mono">{selectedDossierEmp.cin || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'الهاتف:' : 'Téléphone:'}</span>
                        <span className="text-slate-900">{selectedDossierEmp.telephone || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'العنوان:' : 'Adresse:'}</span>
                        <span className="text-slate-900">{selectedDossierEmp.adresse || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white p-6 sm:p-8 rounded-[30px] border-2 border-slate-100 shadow-sm space-y-3 ${isAr ? 'text-right' : ''}`}>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الراتب والبنك' : 'Salaire & Banque'}</h5>
                    <div className="space-y-3 text-xs font-bold">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'المنصب:' : 'Poste:'}</span>
                        <span className="text-indigo-600">{selectedDossierEmp.poste}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'نوع الراتب:' : 'Base:'}</span>
                        <span className="text-slate-900 capitalize">{selectedDossierEmp.remunerationType || 'Mensuel'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'الراتب الأساسي:' : 'Salaire:'}</span>
                        <span className="text-emerald-600 font-black">{(selectedDossierEmp.salaireMensuel || 0).toLocaleString()} MAD</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400">{isAr ? 'البنك و RIB:' : 'Banque & RIB:'}</span>
                        <span className="text-slate-900 font-mono text-[11px]">{selectedDossierEmp.banque ? `${selectedDossierEmp.banque} - ${selectedDossierEmp.rib || ''}` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isAr ? 'رمز الولوج (PIN):' : 'Code PIN:'}</span>
                        <span className="text-indigo-600 font-mono font-black">{selectedDossierEmp.pin_code || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`bg-white p-6 sm:p-8 rounded-[30px] border-2 border-slate-100 shadow-sm space-y-2 ${isAr ? 'text-right' : ''}`}>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'ملاحظات إدارية خاصة بالملف (Notes RH)' : 'Observations & Notes RH Internes'}
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={selectedDossierEmp.notesRH || ''}
                    onBlur={e => updateEmpDossier({ ...selectedDossierEmp, notesRH: e.target.value })}
                    placeholder={isAr ? 'سجل هنا أي ملاحظة خاصة بسلوك الأجير، مهاراته، تدريباته أو وعود الترقية...' : 'Notes internes pour la direction et les RH...'}
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: PAIEMENTS */}
            {dossierActiveTab === 'paiements' && (
              <div className="space-y-4">
                <div className={`grid grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[30px]">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'المؤدى هذا الشهر' : 'Payé ce mois'}</p>
                    <p className="text-3xl font-black text-emerald-700 tabular-nums mt-1">{getPaye(selectedDossierEmp.id).toLocaleString()} MAD</p>
                  </div>
                  <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[30px]">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{isAr ? 'الباقي لهذا الشهر' : 'Reste ce mois'}</p>
                    <p className="text-3xl font-black text-rose-700 tabular-nums mt-1">{getReste(selectedDossierEmp).toLocaleString()} MAD</p>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-slate-100 shadow-sm">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{isAr ? 'سجل التحويلات والدفعات' : 'Historique des versements'}</h5>
                  {paiements.filter(p => p.employeId === selectedDossierEmp.id).length === 0 ? (
                    <p className="text-xs font-bold text-slate-400 text-center py-8">{isAr ? 'لم يتم تسجيل أي أداءات بعد لهذا الموظف.' : 'Aucun versement enregistré.'}</p>
                  ) : (
                    <div className="space-y-2">
                      {paiements.filter(p => p.employeId === selectedDossierEmp.id).map(p => (
                        <div key={p.id} className={`flex items-center justify-between p-4 bg-slate-50 rounded-2xl ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <p className="text-xs font-black text-slate-900">{p.date} • <span className="uppercase text-indigo-600">{p.methode}</span></p>
                            {p.notes && <p className="text-[10px] text-slate-400 font-bold">{p.notes}</p>}
                          </div>
                          <span className="text-base font-black text-emerald-600 tabular-nums">+{p.montant.toLocaleString()} MAD</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 📋 ACCUEIL RH: VUE LISTE / GRILLE DES EMPLOYÉS                            */
        /* ========================================================================= */
        <>
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : ''}>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'تتبع الموارد البشرية والعمال' : 'Suivi RH & Façonniers'}</h1>
              <p className="text-slate-500 text-sm font-medium">{isAr ? 'إدارة موظفي المعمل والعمال الخارجيين' : 'Gestion du personnel atelier et sous-traitance'}</p>
            </div>
            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => window.open('#/fast-scanner', '_blank')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
              >
                <Zap className="w-4 h-4 fill-white" /> {isAr ? '(PRO) فتح الماسح الضوئي' : '(PRO) Ouvrir Scanner'}
              </button>
              <button
                onClick={() => setShowAllBadges(true)}
                className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <ImageIcon className="w-4 h-4" /> {isAr ? 'بطاقات التعريف' : 'Badges PDF'}
              </button>
              <select
                value={selectedMois}
                onChange={e => setSelectedMois(e.target.value)}
                className="px-4 py-2.5 bg-white border-2 border-slate-50 rounded-2xl text-sm focus:border-indigo-500 outline-none font-black text-slate-700 shadow-sm transition-all"
              >
                {availableMois.map(m => (
                  <option key={m} value={m}>{moisLabel(m)}</option>
                ))}
              </select>
              <button
                onClick={syncAll}
                disabled={syncing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${syncing ? 'bg-slate-100 text-slate-400 border-slate-100' : 'bg-white text-indigo-600 border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
              >
                <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncStatus || (isAr ? 'مزامنة' : 'Sync')}
              </button>
              <button 
                onClick={() => setShowSimulator(true)}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl hover:bg-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest border border-emerald-200"
              >
                <Calculator className="w-4 h-4" /> {isAr ? 'حاسبة التكاليف' : 'Simulateur Salaire'}
              </button>
              <button onClick={openCreate} className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> {isAr ? 'إضافة' : 'Ajouter'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'عمال قارين' : 'Permanents'}</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">{atelierCount}</p>
              <p className="text-sm text-indigo-600 font-black mt-1">{isAr ? 'الكتلة' : 'Masse'} : {masseSalariale.toLocaleString()} MAD</p>
            </div>
            <div className={`bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isAr ? 'عمال خارجيين' : 'Façonniers'}</p>
              <p className="text-3xl font-black text-indigo-600 tabular-nums">{stCount}</p>
            </div>
            <div className={`bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-1">{isAr ? 'مؤدى' : 'Payé'} — {moisLabel(selectedMois)}</p>
              <p className="text-3xl font-black text-emerald-700 tabular-nums">{totalPayeMois.toLocaleString()} <span className="text-sm">MAD</span></p>
            </div>
            <div className={`bg-rose-50 p-6 rounded-[32px] border-2 border-rose-100 shadow-sm ${isAr ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em] mb-1">{isAr ? 'الباقي للأداء' : 'Reste à payer'}</p>
              <p className="text-3xl font-black text-rose-700 tabular-nums">{totalResteMois.toLocaleString()} <span className="text-sm">MAD</span></p>
            </div>
          </div>

          {/* Search, Filter & Quick Code Lookup */}
          <div className="space-y-3">
            <div className={`flex flex-col lg:flex-row gap-3 ${isAr ? 'lg:flex-row-reverse' : ''}`}>
              {/* General Name/Poste Search */}
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isAr ? 'right-4' : 'left-4'}`} />
                <input
                  type="text" placeholder={isAr ? 'بحث بالاسم أو المنصب أو الهاتف...' : "Recherche par nom, poste, tél..."}
                  value={search} onChange={e => setSearch(e.target.value)}
                  className={`w-full bg-white border-2 border-slate-50 rounded-[20px] py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm ${isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'}`}
                  dir={isAr ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Quick Direct Code Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleDirectCodeLookup(directCodeInput); }}
                className={`flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 p-1.5 rounded-[22px] border-2 border-indigo-100 shadow-sm ${isAr ? 'flex-row-reverse' : ''}`}
              >
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder={isAr ? '⚡ كود الموظف (ID / PIN / CIN)...' : '⚡ Code ID / PIN / CIN / Matricule...'}
                    value={directCodeInput}
                    onChange={e => setDirectCodeInput(e.target.value)}
                    className={`w-full bg-white border border-indigo-100 rounded-[16px] py-3 text-xs font-mono font-black text-indigo-950 placeholder-indigo-300 outline-none focus:border-indigo-500 ${isAr ? 'pr-4 pl-2 text-right' : 'pl-4 pr-2'}`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[16px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition shrink-0"
                  title={isAr ? 'فتح صفحة الملف فوراً' : 'Ouvrir la page du dossier'}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{isAr ? 'فتح الملف' : 'Dossier'}</span>
                </button>
              </form>

              {/* Type Filter */}
              <select
                value={filterType} onChange={e => setFilterType(e.target.value)}
                className="bg-white border-2 border-slate-50 rounded-[20px] px-6 py-4 text-sm font-black text-slate-600 outline-none focus:border-indigo-500 shadow-sm appearance-none"
              >
                <option value="all">{isAr ? 'كل الأنواع' : 'Tous types'}</option>
                <option value="atelier">{isAr ? 'المعمل (قاري)' : 'Atelier (Permanent)'}</option>
                <option value="sous_traitance">{isAr ? 'خارجي (فاصونيي)' : 'Façonnier (Externe)'}</option>
              </select>
            </div>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(e => {
              const paye = getPaye(e.id);
              const reste = getReste(e);
              const dossierStats = getDossierStats(e);
              const fautesCount = (e.fautes || []).length;

              return (
                <div key={e.id} className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative flex flex-col justify-between">
                  {/* Header Profile Section - CLICKABLE TO OPEN DOSSIER PAGE */}
                  <div className="p-8 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      {/* Clickable Profile Card Header */}
                      <div 
                        onClick={() => openDossierPage(e)}
                        className="flex items-center gap-4 cursor-pointer group/cardHeader transition"
                        title={isAr ? 'انقر لفتح صفحة الملف الشخصي والوثائق' : 'Cliquez pour ouvrir la page du dossier RH'}
                      >
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white font-black text-xl shadow-lg relative overflow-hidden shrink-0 group-hover/cardHeader:scale-105 transition-transform ${e.type === 'atelier' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                          {e.photo ? (
                            <img src={e.photo} alt={e.nom} className="w-full h-full object-cover" />
                          ) : (
                            <span>{e.prenom && e.nom ? (e.prenom?.[0] || '') + (e.nom?.[0] || '') : (e.nom ? e.nom.substring(0, 2).toUpperCase() : '??')}</span>
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover/cardHeader:bg-transparent transition-colors" />
                        </div>
                        <div className={isAr ? 'text-right' : ''}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-lg font-black text-slate-900 group-hover/cardHeader:text-indigo-600 transition-colors uppercase tracking-tighter leading-none">{empName(e)}</h3>
                          </div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                            {e.poste || (isAr ? 'منصب غير محدد' : 'Poste non défini')}
                          </p>
                        </div>
                      </div>

                      {/* Top Actions */}
                      <div className={`flex gap-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <button onClick={() => openDossierPage(e)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title={isAr ? 'صفحة الملف الشخصي' : 'Page Dossier Personnel'}><FolderOpen className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedContractEmp(e); setShowContract(true); }} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title={isAr ? 'عقد عمل' : 'Contrat de Travail'}><File className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(e)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title={isAr ? 'تعديل' : 'Modifier'}><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteId(e.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title={isAr ? 'حذف' : 'Supprimer'}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {/* Dossier Status Badges (Seniority, Papiers, Fautes) */}
                    <div className={`flex flex-wrap gap-1.5 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{e.dateEmbauche ? calculateSeniority(e.dateEmbauche, isAr) : (isAr ? 'تاريخ البداية غير محدد' : 'Date d\'embauche')}</span>
                      </div>

                      <button
                        onClick={(ev) => { ev.stopPropagation(); openDossierPage(e); setDossierActiveTab('papiers'); }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border transition active:scale-95 ${
                          e.dossierValide || dossierStats.isComplete
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title={isAr ? 'الوثائق الإدارية للأجير' : 'Documents administratifs'}
                      >
                        {e.dossierValide || dossierStats.isComplete ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isAr ? 'أوراق كاملة ✓' : 'Papiers complets ✓'}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>{isAr ? `أوراق معلقة (${dossierStats.providedCount}/${dossierStats.totalRequired})` : `Papiers incomplets (${dossierStats.providedCount}/${dossierStats.totalRequired})`}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={(ev) => { ev.stopPropagation(); openDossierPage(e); setDossierActiveTab('fautes'); }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border transition active:scale-95 ${
                          fautesCount === 0
                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={isAr ? 'سجل المخالفات والإنذارات' : 'Historique disciplinaire'}
                      >
                        {fautesCount === 0 ? (
                          <>
                            <ShieldAlert className="w-3 h-3 text-emerald-500" />
                            <span>{isAr ? 'سجل نظيف' : '0 avertissement'}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{isAr ? `${fautesCount} إنذارات / أخطاء` : `${fautesCount} faute(s)`}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Info Pills */}
                    <div className={`flex flex-wrap gap-2 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{e.telephone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-600">{e.cin || '—'}</span>
                      </div>
                      {e.pin_code && (
                        <button 
                          onClick={() => { 
                            navigator.clipboard.writeText(e.pin_code!);
                            alert(isAr ? 'تم نسخ الرمز!' : 'Code PIN copié !');
                          }}
                          className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors group/pin active:scale-95"
                          title={isAr ? 'نسخ رمز PIN' : 'Copier le code PIN'}
                        >
                          <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 group-hover/pin:scale-110 transition-transform" />
                          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">PIN: {e.pin_code}</span>
                          <Copy className="w-3 h-3 text-indigo-300 group-hover/pin:text-indigo-600 transition-colors" />
                        </button>
                      )}
                    </div>

                    {/* Salary Stats Dashboard */}
                    <div className={`grid grid-cols-2 gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-4 rounded-[24px] border-2 border-slate-50 transition-colors hover:border-emerald-100 bg-white ${isAr ? 'text-right' : ''}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'مؤدى' : 'Payé'}</p>
                        <p className="text-lg font-black text-emerald-600 tabular-nums">{(paye || 0).toLocaleString()} <span className="text-[10px]">MAD</span></p>
                      </div>
                      <div className={`p-4 rounded-[24px] border-2 border-slate-50 transition-colors hover:border-rose-100 bg-white ${isAr ? 'text-right' : ''}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'الباقي' : 'Reste'}</p>
                        <p className="text-lg font-black text-rose-600 tabular-nums">{(reste || 0).toLocaleString()} <span className="text-[10px]">MAD</span></p>
                      </div>
                    </div>

                    {/* Main Action Bar */}
                    <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => openPayer(e.id)}
                        className="flex-1 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg hover:bg-slate-800"
                      >
                        <DollarSign className="w-4 h-4" /> {isAr ? 'أداء الراتب' : 'Payer'}
                      </button>
                      <button
                        onClick={() => openDossierPage(e)}
                        className="w-12 h-12 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/dossier"
                        title={isAr ? 'فتح صفحة الملف الشخصي الشامل' : 'Ouvrir la page du dossier'}
                      >
                        <FolderOpen className="w-5 h-5 group-hover/dossier:scale-110 transition-transform" />
                      </button>
                      {e.type === 'atelier' && (
                        <>
                          <button
                            onClick={() => { setBonForm({ ...bonForm, empId: e.id }); setShowBonModal(true); }}
                            className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all"
                            title={isAr ? 'وصل العمل' : 'Bon de Travail'}
                          >
                            <File className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedBadge(e)}
                            className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all"
                            title={isAr ? 'بطاقة التعريف' : 'Badge'}
                          >
                            <ImageIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal: View All Badges for Export */}
      {showAllBadges && (
        <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex flex-col ${isAr ? 'text-right' : ''}`}>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'طباعة بطاقات التعريف' : 'Impression des Badges'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? `المجموع: ${employes.filter(e => e.type === 'atelier' && e.actif).length} بطاقة` : `Total: ${employes.filter(e => e.type === 'atelier' && e.actif).length} badges`}</p>
              </div>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                {/* PDF Download Button */}
                <button
                  onClick={() => handleDownloadPDF('all-badges-capture', 'Tous_les_Badges')}
                  disabled={isGenerating}
                  className={`${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900'} text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all`}
                >
                  {isGenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <><Download className="w-5 h-5" /> {isAr ? 'تحميل PDF' : 'Télécharger PDF'}</>}
                </button>
                {/* Guaranteed Print Button */}
                <button
                  onClick={() => printElement('all-badges-capture')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Printer className="w-5 h-5" /> {isAr ? 'طباعة مباشرة' : 'Imprimer / PDF Direct'}
                </button>
                <button onClick={() => setShowAllBadges(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>
            </div>

            {/* Theme Customization Bar for Batch Badges */}
            <div className="px-8 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                  <span>🎨</span>
                  <span>{isAr ? 'لون وخلفية البطاقات:' : 'Couleur & Thème :'}</span>
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-300 shadow-2xs">
                  {(Object.keys(BADGE_THEMES) as BadgeTheme[]).map((tKey) => {
                    const themeObj = BADGE_THEMES[tKey];
                    const isSelected = badgeTheme === tKey;
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => handleBadgeThemeChange(tKey)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-950'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span 
                          className={`w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 ${
                            tKey === 'platinum' ? 'bg-[#cbd5e1]' :
                            tKey === 'slate_dark' ? 'bg-[#1e293b]' :
                            tKey === 'blue_prestige' ? 'bg-[#0b254a]' : 'bg-[#dfc8ad]'
                          }`} 
                        />
                        <span>{isAr ? themeObj.nameAr : themeObj.nameFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-800 text-[10.5px] font-black">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isAr ? '🛡️ علامة مائية BEYA CREATIVE مدمجة تلقائياً' : '🛡️ Filigrane BEYA CREATIVE actif'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/70 scrollbar-hide">
              <div className="grid grid-cols-1 gap-8 justify-items-center" id="all-badges-capture">
                {employes.filter(e => e.type === 'atelier' && e.actif).map(e => (
                  <div key={e.id} className="p-3 bg-white rounded-3xl shadow-sm border border-slate-200/80">
                    <ProfessionalBadgeCard
                      emp={e}
                      company={company}
                      isAr={isAr}
                      empName={empName}
                      theme={badgeTheme}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Personnel */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                {editId ? (isAr ? 'تعديل حساب موظف' : 'Modifier Profil Personnel') : (isAr ? 'موظف جديد' : 'Nouveau Personnel')}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              {/* Photo d'identité / صورة الموظف */}
              <div className={`p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center gap-5 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                {/* Photo Preview */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center">
                    {form.photo ? (
                      <img src={form.photo} alt="Employé" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-tight">{isAr ? 'بدون صورة' : 'Sans photo'}</span>
                      </div>
                    )}
                  </div>
                  {form.photo && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photo: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow hover:bg-rose-600 transition"
                      title={isAr ? 'حذف الصورة' : 'Supprimer'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload Buttons & Label */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {isAr ? 'صورة الموظف (للبطاقة المهنية)' : 'Photo d\'identité (pour le badge)'}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 leading-snug">
                    {isAr 
                      ? 'ارفع صورة شخصية واضحة للموظف، تظهر تلقائياً في شارة العمل وبطاقة QR الاحترافية.' 
                      : 'Téléversez une photo claire pour le badge professionnel et l\'identification rapide.'}
                  </p>
                  <div className={`mt-3 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.photo ? (isAr ? 'تغيير الصورة' : 'Changer photo') : (isAr ? 'إضافة صورة' : 'Choisir une photo')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleEmployeePhotoUpload}
                      />
                    </label>
                    {form.photo && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, photo: '' })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حذف الصورة' : 'Supprimer'}</span>
                      </button>
                    )}
                    {form.photo && (
                      <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {isAr ? 'محفوظة' : 'Attachée'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الهوية والمنصب' : 'Identité & Poste'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الاسم الشخصي' : 'Prénom'}</label>
                    <input value={form.prenom || ''} onChange={e => setForm({ ...form, prenom: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الاسم العائلي *' : 'Nom *'}</label>
                    <input value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المنصب / الوظيفة' : 'Poste / Fonction'}</label>
                    <select value={form.poste || ''} onChange={e => setForm({ ...form, poste: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                      <option value="">{isAr ? 'اختر المنصب...' : 'Sélectionner...'}</option>
                      {POSTES_ATELIER.map((p, i) => {
                        const currentUserRaw = localStorage.getItem('textrack_auth');
                        const isAdmin = currentUserRaw ? JSON.parse(currentUserRaw).role === 'admin' : false;
                        const adminStartIndex = POSTES_ATELIER.indexOf('— Administration —');
                        const isAdminRole = adminStartIndex !== -1 && i >= adminStartIndex;
                        if (isAdminRole && !isAdmin) return null;
                        return <option key={p} value={p} disabled={p.startsWith('—')}>{isAr ? POSTES_ATELIER_AR[i] : p}</option>;
                      })}
                      {POSTES_SOUSTRAITANCE.map((p, i) => <option key={p} value={p} disabled={p.startsWith('—')}>{isAr ? POSTES_SOUSTRAITANCE_AR[i] : p}</option>)}
                    </select>
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'نوع العقد' : 'Type de contrat'}</label>
                    <select value={form.type || 'atelier'} onChange={e => setForm({ ...form, type: e.target.value as any })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                      <option value="atelier">{isAr ? 'داخلي (المعمل)' : 'Interne (Atelier)'}</option>
                      <option value="sous_traitance">{isAr ? 'خارجي (فاصونيي)' : 'Externe (Façonnier)'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الاتصال والإدارة' : 'Contact & Administratif'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم الهاتف' : 'N° Téléphone'}</label>
                    <input value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم البطاقة الوطنية (CIN)' : 'CIN (N° Carte Nationale)'}</label>
                    <input value={form.cin || ''} onChange={e => setForm({ ...form, cin: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 uppercase outline-none ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                  <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'عنوان السكن' : 'Adresse Résidence'}</label>
                    <input value={form.adresse || ''} onChange={e => setForm({ ...form, adresse: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'تاريخ بداية العمل (Date d\'embauche)' : 'Date d\'embauche'}</label>
                    <input type="date" value={form.dateEmbauche || ''} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم الضمان الاجتماعي (N° CNSS)' : 'N° CNSS'}</label>
                    <input value={form.cnss || ''} onChange={e => setForm({ ...form, cnss: e.target.value })} placeholder={isAr ? 'اختياري: 123456789' : 'Optionnel'} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} />
                  </div>
                </div>
              </div>

              {/* بيانات الشارة المهنية (Matricule, Expiration, Signature) */}
              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">
                  {isAr ? 'بيانات الشارة المهنية (Badge & Carte)' : 'Données du Badge Professionnel'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Matricule (Manual + Auto) */}
                  <div className={isAr ? 'text-right' : ''}>
                    <div className={`flex items-center justify-between mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isAr ? 'رقم الماتريكول (Matricule)' : 'N° Matricule'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoMat = 'EMP-' + Math.floor(100 + Math.random() * 900);
                          setForm({ ...form, matricule: autoMat });
                        }}
                        className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1 active:scale-95 transition"
                        title={isAr ? 'توليد تلقائي للماتريكول' : 'Générer automatiquement'}
                      >
                        <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                        {isAr ? 'توليد تلقائي' : 'Générer'}
                      </button>
                    </div>
                    <input 
                      value={form.matricule || ''} 
                      onChange={e => setForm({ ...form, matricule: e.target.value })} 
                      placeholder={isAr ? 'مثال: EMP-001 (أو اتركه فارغاً)' : 'Ex: EMP-001 (ou vide)'} 
                      className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none uppercase font-mono ${isAr ? 'text-right' : ''}`} 
                    />
                  </div>

                  {/* Date d'expiration */}
                  <div className={isAr ? 'text-right' : ''}>
                    <div className={`flex items-center justify-between mb-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isAr ? 'نهاية الصلاحية (Expiration)' : 'Date d\'expiration'}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, dateExpiration: '' })}
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg transition ${!form.dateExpiration ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {isAr ? 'دائم' : 'Permanent'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextYear = new Date();
                            nextYear.setFullYear(nextYear.getFullYear() + 1);
                            setForm({ ...form, dateExpiration: nextYear.toISOString().slice(0, 10) });
                          }}
                          className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase"
                        >
                          +1 {isAr ? 'سنة' : 'an'}
                        </button>
                      </div>
                    </div>
                    <input 
                      type="date"
                      value={form.dateExpiration || ''} 
                      onChange={e => setForm({ ...form, dateExpiration: e.target.value })} 
                      className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`} 
                    />
                  </div>

                  {/* Custom Signature */}
                  <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {isAr ? 'توقيع الشارة (Signature)' : 'Signature sur le Badge'}
                    </label>
                    <div className={`p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-between gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center min-w-[120px] shadow-sm">
                        {form.signature ? (
                          <img src={form.signature} alt="Signature" className="h-7 max-w-[100px] object-contain" />
                        ) : (
                          <svg className="w-20 h-5 text-slate-600 opacity-70" viewBox="0 0 140 35" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M 10 24 C 25 6, 38 30, 52 14 C 60 6, 68 28, 90 16 C 105 9, 102 24, 130 13" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{form.signature ? (isAr ? 'تغيير التوقيع' : 'Modifier') : (isAr ? 'رفع توقيع مخصص' : 'Uploader signature')}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleEmployeeSignatureUpload} />
                        </label>
                        {form.signature && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, signature: '' })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                            title={isAr ? 'إلغاء التوقيع المخصص' : 'Réinitialiser signature'}
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الأجر والبنك' : 'Rémunération & Banque'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'قاعدة الأجر' : 'Base Rémunération'}</label>
                    <select value={form.remunerationType || 'mensuel'} onChange={e => setForm({ ...form, remunerationType: e.target.value as any })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 ${isAr ? 'text-right' : ''}`}>
                      <option value="mensuel">{isAr ? 'بالشهر (Mensuel)' : 'Par Mois (Mensuel)'}</option>
                      <option value="hebdomadaire">{isAr ? 'بالأسبوع (Hebdo)' : 'Par Semaine (Hebdo)'}</option>
                      <option value="tache">{isAr ? 'بالمهمة / الطلبية' : 'À la Tâche / Commande'}</option>
                    </select>
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المبلغ (درهم)' : 'Montant Base (MAD)'}</label>
                    <input type="number" value={form.salaireMensuel || ''} onChange={e => setForm({ ...form, salaireMensuel: parseFloat(e.target.value) || 0 })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 focus:border-indigo-500 transition-all outline-none ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                  <div className={isAr ? 'text-right' : ''}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'البنك' : 'Banque'}</label>
                    <select value={form.banque || ''} onChange={e => setForm({ ...form, banque: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 ${isAr ? 'text-right' : ''}`}>
                      <option value="">{isAr ? 'اختر البنك...' : 'Sélectionner banque...'}</option>
                      {['CIH', 'Attijari', 'BP', 'BMCE', 'Al Barid', 'SG', 'BMCI', 'Crédit Agricole'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className={`sm:col-span-2 ${isAr ? 'text-right' : ''}`}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رقم الحساب (RIB)' : 'RIB (24 Chiffres)'}</label>
                    <input value={form.rib || ''} onChange={e => setForm({ ...form, rib: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-mono font-bold text-slate-700 ${isAr ? 'text-right tabular-nums' : ''}`} />
                  </div>
                </div>
              </div>

              <div className={isAr ? 'text-right' : ''}>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2">{isAr ? 'الولوج للبوابة (رمز PIN)' : 'Accès Portail (PIN Code)'}</p>
                <div className={`flex items-end gap-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'رمز PIN (4 أرقام)' : 'Code PIN (4 chiffres)'}</label>
                    <input 
                      value={form.pin_code || ''} 
                      onChange={e => setForm({ ...form, pin_code: e.target.value.substring(0, 4) })} 
                      maxLength={4}
                      placeholder="Ex: 1234"
                      className="w-full bg-white border-2 border-indigo-100 rounded-2xl py-4 px-6 text-2xl font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all text-center tracking-[0.5em] tabular-nums" 
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const pin = Math.floor(1000 + Math.random() * 9000).toString();
                      setForm({ ...form, pin_code: pin });
                    }}
                    className="h-14 px-6 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    {isAr ? 'توليد الرمز' : 'Générer PIN'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 sticky bottom-0">
              <button onClick={save} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">
                {isAr ? 'حفظ الحساب' : 'Enregistrer le Profil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bon de Travail Modal */}
      {showBonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'توليد وصل العمل' : 'Générer Bon de Travail'}</h2>
              <button onClick={() => setShowBonModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'ربط بطلبية' : 'Associer une Commande'}</label>
                <select value={bonForm.cmdId} onChange={e => setBonForm({ ...bonForm, cmdId: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                  <option value="">{isAr ? '— اختر طلبية —' : '— Sélectionner une commande —'}</option>
                  {commandes.map(c => <option key={c.id} value={c.id}>{c.reference} - {c.client}</option>)}
                </select>
              </div>
              <div className={`grid grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'تسبيق (درهم)' : 'Avance (MAD)'}</label>
                  <input type="number" value={bonForm.avance} onChange={e => setBonForm({ ...bonForm, avance: parseFloat(e.target.value) || 0 })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-left tabular-nums' : ''}`} />
                </div>
                <div className={isAr ? 'text-right' : ''}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'طريقة الأداء' : 'Méthode'}</label>
                  <select value={bonForm.methode} onChange={e => setBonForm({ ...bonForm, methode: e.target.value })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 outline-none ${isAr ? 'text-right' : ''}`}>
                    <option value="especes">{isAr ? 'نقداً' : 'Espèces'}</option>
                    <option value="virement">{isAr ? 'تحويل بنكي' : 'Virement'}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={`p-8 bg-slate-50 flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowBonModal(false)} className="flex-1 h-14 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleGenerateBon} className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all">
                {isAr ? 'توليد' : 'Générer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Bon Preview */}
      {generatedBon && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'معاينة الوصل' : 'Aperçu du Bon'}</h2>
              <div className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => printElement('bon-travail-capture')}
                  className="bg-indigo-600 text-white p-2.5 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setGeneratedBon(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-6 h-6 text-slate-900" /></button>
              </div>
            </div>
            <div className={`p-12 bg-white ${isAr ? 'text-right' : ''}`} id="bon-travail-capture">
              <div className={`flex justify-between items-start mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">{company.name}</h1>
                  <p className="text-[10px] font-bold text-indigo-600 tracking-[0.3em] uppercase">{isAr ? 'وصل إنتاج' : 'Bon de Production'}</p>
                </div>
                <div className={isAr ? 'text-left' : 'text-right'}>
                  <p className="text-xs font-black text-slate-900 tabular-nums">#BT-{generatedBon.id}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tabular-nums">{generatedBon.date}</p>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-12 mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`bg-slate-50 p-6 rounded-3xl ${isAr ? 'text-right' : ''}`}>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'الموظفين' : 'Personnel'}</h3>
                  <p className="text-xl font-black text-slate-900 uppercase">{empName(generatedBon.emp)}</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1 uppercase">
                    {isAr ? (POSTES_ATELIER_AR[POSTES_ATELIER.indexOf(generatedBon.emp.poste)] || generatedBon.emp.poste) : generatedBon.emp.poste}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-slate-100 rounded-3xl p-6 text-center">
                  <QRCodeSVG value={`BON:${generatedBon.id}`} size={100} />
                  <p className="text-[8px] font-black text-slate-300 mt-3 uppercase tracking-[0.3em]">{isAr ? 'مسح للتتبع' : 'Scan Suivi'}</p>
                </div>
              </div>
              <div className={`bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-8 ${isAr ? 'text-right' : ''}`}>
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{isAr ? 'تسبيق / دفعة' : 'Avance / Versement'}</h3>
                <p className="text-3xl font-black text-slate-900 tabular-nums">{generatedBon.avance.toLocaleString()} MAD</p>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button
                onClick={() => handleDownloadPDF('bon-travail-capture', `Bon_Travail_${generatedBon.id}`)}
                disabled={isGenerating}
                className={`flex-1 h-14 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl transition-all ${isGenerating ? 'bg-slate-400' : 'bg-slate-900'}`}
              >
                {isGenerating ? <RotateCw className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Télécharger PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* 🖼️ DOCUMENT LIGHTBOX / PREVIEW MODAL                                      */}
      {/* ========================================================================= */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className={`p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h4 className="font-black text-sm uppercase tracking-tight">{previewDocName || (isAr ? 'معاينة الوثيقة' : 'Aperçu du Document')}</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocUrl}
                  download={previewDocName || 'document'}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل' : 'Télécharger'}</span>
                </a>
                <button
                  onClick={() => { setPreviewDocUrl(null); setPreviewDocName(null); }}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[400px]">
              {previewDocUrl.startsWith('data:image') || previewDocUrl.includes('.jpg') || previewDocUrl.includes('.png') || previewDocUrl.includes('.jpeg') ? (
                <img src={previewDocUrl} alt={previewDocName || 'Document'} className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-lg" />
              ) : (
                <iframe src={previewDocUrl} title="Document Preview" className="w-full h-[75vh] rounded-2xl border-0 bg-white" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badge QR Modal (CR80 Standard Wallet Size - Recto / Verso) */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className={`p-4 sm:p-6 flex items-center justify-between border-b border-slate-100 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm sm:text-base leading-none">
                    {isAr ? 'بطاقة العمل المهنية (مقاس المحفظة / بزطام)' : 'Badge Professionnel (Format Portefeuille CR80)'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {empName(selectedBadge)} • {formatBadgePoste(selectedBadge.poste, isAr)}
                  </p>
                </div>
              </div>

              {/* View Switcher & Action buttons */}
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                {/* Face Switcher tabs */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setBadgeViewFace('both')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${badgeViewFace === 'both' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {isAr ? 'الوجهين معاً' : 'Recto + Verso'}
                  </button>
                  <button
                    onClick={() => setBadgeViewFace('front')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${badgeViewFace === 'front' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {isAr ? 'الوجه الأمامي' : 'Recto'}
                  </button>
                  <button
                    onClick={() => setBadgeViewFace('back')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${badgeViewFace === 'back' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {isAr ? 'الخلفي (السكان)' : 'Verso (Scan)'}
                  </button>
                </div>

                {/* Print button */}
                <button
                  onClick={() => printBadgeElement('badge-capture')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95"
                  title={isAr ? 'طباعة مباشرة عالية الدقة' : 'Imprimer HD'}
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAr ? 'طباعة مباشرة' : 'Imprimer'}</span>
                </button>

                <button 
                  onClick={() => setSelectedBadge(null)} 
                  className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Customization Bar: Theme Selector + Watermark Indicator */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                  <span>🎨</span>
                  <span>{isAr ? 'لون وخلفية البطاقة:' : 'Couleur & Thème :'}</span>
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-300 shadow-2xs">
                  {(Object.keys(BADGE_THEMES) as BadgeTheme[]).map((tKey) => {
                    const themeObj = BADGE_THEMES[tKey];
                    const isSelected = badgeTheme === tKey;
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => handleBadgeThemeChange(tKey)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-950'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span 
                          className={`w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 ${
                            tKey === 'platinum' ? 'bg-[#cbd5e1]' :
                            tKey === 'slate_dark' ? 'bg-[#1e293b]' :
                            tKey === 'blue_prestige' ? 'bg-[#0b254a]' : 'bg-[#dfc8ad]'
                          }`} 
                        />
                        <span>{isAr ? themeObj.nameAr : themeObj.nameFr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-[10.5px] font-black">
                  <span>⚡</span>
                  <span>{isAr ? 'طباعة فائقة الدقة 350+ DPI (واضحة 100% بدون ضبابية)' : 'Ultra-HD 350+ DPI Net & Précis'}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-800 text-[10.5px] font-black">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isAr ? '🛡️ علامة مائية BEYA CREATIVE مدمجة' : '🛡️ Filigrane BEYA CREATIVE actif'}</span>
                </div>
              </div>
            </div>

            {/* Mobile View Switcher if screen small */}
            <div className="sm:hidden px-4 py-2 flex items-center justify-center bg-slate-100/70 border-b border-slate-200">
              <div className="flex items-center bg-slate-200 p-1 rounded-xl gap-1 w-full max-w-xs justify-around">
                <button
                  onClick={() => setBadgeViewFace('both')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase text-center transition ${badgeViewFace === 'both' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
                >
                  {isAr ? 'الوجهين' : 'Les 2'}
                </button>
                <button
                  onClick={() => setBadgeViewFace('front')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase text-center transition ${badgeViewFace === 'front' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
                >
                  {isAr ? 'الأمامي' : 'Recto'}
                </button>
                <button
                  onClick={() => setBadgeViewFace('back')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase text-center transition ${badgeViewFace === 'back' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
                >
                  {isAr ? 'الخلفي' : 'Verso'}
                </button>
              </div>
            </div>

            {/* Badge Card Preview Area */}
            <div className="p-4 sm:p-8 flex items-center justify-center bg-slate-100/70 overflow-y-auto flex-1">
              <ProfessionalBadgeCard
                id="badge-capture"
                emp={selectedBadge}
                company={company}
                isAr={isAr}
                empName={empName}
                showPhotoUpload={true}
                onPhotoUpload={(e) => handleDirectBadgePhotoUpload(selectedBadge.id, e)}
                viewMode={badgeViewFace}
                theme={badgeTheme}
              />
            </div>

            {/* Injected Print Styles for exact 85.6mm x 54mm wallet-size print */}
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 12mm;
                }
                .wallet-card-container {
                  display: flex !important;
                  flex-direction: row !important;
                  gap: 6mm !important;
                  justify-content: center !important;
                  align-items: center !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .wallet-card-standard {
                  width: 85.6mm !important;
                  height: 53.98mm !important;
                  min-width: 85.6mm !important;
                  min-height: 53.98mm !important;
                  max-width: 85.6mm !important;
                  max-height: 53.98mm !important;
                  border-radius: 3.18mm !important;
                  overflow: hidden !important;
                  box-shadow: none !important;
                  border: 1px solid #cbd5e1 !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}</style>

            {/* Footer with Actions */}
            <div className={`p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex flex-wrap items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                {/* Direct photo upload button */}
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>{selectedBadge.photo ? (isAr ? 'تغيير الصورة' : 'Changer photo') : (isAr ? 'إضافة صورة' : 'Ajouter photo')}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleDirectBadgePhotoUpload(selectedBadge.id, e)} 
                  />
                </label>

                {/* Direct photo delete button */}
                {selectedBadge.photo && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBadgePhoto(selectedBadge.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95"
                    title={isAr ? 'حذف صورة الموظف' : 'Supprimer la photo'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حذف الصورة' : 'Supprimer'}</span>
                  </button>
                )}

                {/* Signature upload / edit button */}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedBadge.signature ? (isAr ? 'تغيير التوقيع' : 'Modifier Signature') : (isAr ? 'تخصيص التوقيع' : 'Ajouter Signature')}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleDirectBadgeSignatureUpload(selectedBadge.id, e)} 
                  />
                </label>

                {/* Signature reset button */}
                {selectedBadge.signature && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBadgeSignature(selectedBadge.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title={isAr ? 'إعادة تعيين التوقيع للشكل القياسي' : 'Réinitialiser la signature'}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Export Buttons: High-Res PNG + Ultra-HD CR-80 PDF */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadBadgeImage('badge-capture', `Badge_${selectedBadge.nom || 'Employe'}`)}
                  className="h-11 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wider transition active:scale-95 border border-slate-300"
                  title={isAr ? 'تحميل كصورة فائقة الدقة 400 DPI للطباعة على بطاقات PVC' : 'Télécharger Image HD 400 DPI'}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">{isAr ? 'صورة HD (400 DPI)' : 'Image HD'}</span>
                </button>

                <button
                  onClick={async () => {
                    if (isGenerating) return;
                    setIsGenerating(true);
                    try {
                      await generateBadgePDF('badge-capture', `Badge_${selectedBadge.nom || 'Employe'}_CR80`, {
                        viewMode: badgeViewFace,
                        companyName: company.name,
                        empName: empName(selectedBadge),
                      });
                    } catch (e) {
                      console.error(e);
                      await handleDownloadPDF('badge-capture', `Badge_${selectedBadge.nom}_Wallet`);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className={`h-11 px-6 text-white rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                    isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600 shadow-slate-900/20'
                  }`}
                  title={isAr ? 'تحميل ملف PDF فائق الدقة 350 DPI ومقاس المحفظة القياسي' : 'Télécharger PDF HD 350 DPI'}
                >
                  {isGenerating ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isAr ? 'تحميل PDF عالي الدقة (350 DPI)' : 'Télécharger PDF HD'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isAr ? 'أداء الراتب' : 'Paiement'}</h2>
              <button onClick={() => setShowPayerModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'المبلغ (درهم)' : 'Montant (MAD)'}</label>
                <input type="number" value={payerForm.montant} onChange={e => setPayerForm({ ...payerForm, montant: parseFloat(e.target.value) || 0 })} className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-2xl font-black text-slate-900 outline-none ${isAr ? 'text-left tabular-nums' : ''}`} />
              </div>
              <div className={isAr ? 'text-right' : ''}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAr ? 'طريقة الأداء' : 'Méthode'}</label>
                <div className={`grid grid-cols-3 gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  {['especes', 'virement', 'cheque'].map(m => (
                    <button key={m} onClick={() => setPayerForm({ ...payerForm, methode: m })} className={`h-12 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${payerForm.methode === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {m === 'especes' ? (isAr ? 'نقداً' : 'Espèces') : m === 'virement' ? (isAr ? 'تحويل' : 'Virement') : (isAr ? 'شيك' : 'Chèque')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button onClick={savePaiement} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                {isAr ? 'تأكيد الأداء' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Deletion Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-rose-500 animate-pulse">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">{isAr ? 'تنبيه !' : 'Attention !'}</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed px-4">
                {isAr ? 'هل أنت متأكد من حذف هذا الموظف؟ هذه العملية لا يمكن التراجع عنها.' : 'Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible.'}
              </p>
            </div>
            <div className="p-8 bg-slate-50/50 flex flex-col gap-3">
              <button
                onClick={() => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  import('../types').then(({ deleteRecord }) => {
                    const updated = employes.filter(e => e.id !== id);
                    setEmployes(updated);
                    saveLocalRH('employes', updated);
                    deleteRecord('employes', id);
                  });
                }}
                className="h-14 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-all"
              >
                {isAr ? 'نعم، حذف نهائياً' : 'Oui, Supprimer définitivement'}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-14 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 📜 Historique Modal */}
      {showHistorique && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl border border-white/20 relative max-h-[80vh] overflow-hidden flex flex-col">
             <button onClick={() => setShowHistorique(null)} className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all">
               <X className="w-5 h-5" />
             </button>
             
             <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
               <RotateCw className="w-6 h-6 text-indigo-600" />
               {isAr ? 'سجل الأداءات' : 'Historique des Paiements'}
             </h3>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {paiements.filter(p => p.employeId === showHistorique).length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold">{isAr ? 'لا يوجد سجل أداء حالياً' : 'Aucun historique de paiement'}</p>
                 </div>
               ) : (
                 paiements
                   .filter(p => p.employeId === showHistorique)
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                   .map(p => (
                     <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                           <DollarSign className="w-5 h-5" />
                         </div>
                         <div className={isAr ? 'text-right' : ''}>
                           <p className="text-sm font-black text-slate-900">{p.montant.toLocaleString()} MAD</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">{p.methode}</span>
                          <button onClick={() => setPaiements(prev => prev.filter(x => x.id !== p.id))} className="p-2 text-slate-300 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                       </div>
                     </div>
                   ))
               )}
             </div>
          </div>
        </div>
      )}

      {/* ✅ Contract Print Modal */}
      {showContract && selectedContractEmp && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-white/20 relative">
             <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6">
                <File className="w-10 h-10 text-emerald-600" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
               {isAr ? 'عقد العمل' : 'Contrat de Travail'}
             </h3>
             <p className="text-slate-500 font-bold text-sm mb-8">
               {isAr ? `هل تريد تحميل عقد العمل الخاص بـ ${empName(selectedContractEmp)}؟` : `Voulez-vous générer le contrat pour ${empName(selectedContractEmp)} ?`}
             </p>

             <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setShowContract(false)}
                className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
               >
                 {isAr ? 'إلغاء' : 'Annuler'}
               </button>
               <button 
                onClick={() => {
                  handleDownloadPDF('contract-template', `Contrat_${selectedContractEmp.nom}`);
                  setTimeout(() => setShowContract(false), 2000);
                }}
                className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200"
               >
                 <Printer className="w-4 h-4" />
                 {isAr ? 'تحميل PDF' : 'Télécharger PDF'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* 📄 Hidden Contract Template */}
        <div id="contract-template" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[500] w-[800px] bg-white p-12 text-slate-900 font-serif leading-relaxed" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="text-center mb-8 border-b-4 border-slate-900 pb-4">
          <h1 className="text-3xl font-black mb-1 tracking-tighter uppercase">BEYA CREATIVE</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 italic">Atelier de Confection Textile de Haute Qualité</p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-black underline decoration-slate-900 underline-offset-8 uppercase">
            {isAr ? 'عقد عمل محدد المدة (CDD)' : 'CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE (CDD)'}
          </h2>
        </div>

        <div className="space-y-4 text-[11px]">
          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">1. {isAr ? 'الأطراف المتعاقدة' : 'LES PARTIES'}:</p>
            <div className={`space-y-0.5 ${isAr ? 'pr-4' : 'pl-4'}`}>
              <p>• <b>{isAr ? 'المشغل' : 'Employeur'}:</b> BEYA CREATIVE — Représenté par la Direction.</p>
              <p>• <b>{isAr ? 'الأجير' : 'Employé(e)'}:</b> {empName(selectedContractEmp!)}</p>
              <p>• <b>{isAr ? 'رقم البطاقة الوطنية' : 'CIN'}:</b> {selectedContractEmp?.cin || '...................'}</p>
              <p>• <b>{isAr ? 'العنوان' : 'Adresse'}:</b> {selectedContractEmp?.adresse || '......................................'}</p>
              <p>• <b>{isAr ? 'رقم الهاتف' : 'N° Téléphone'}:</b> {selectedContractEmp?.telephone || '...................'}</p>
              <p>• <b>{isAr ? 'تاريخ الازدياد' : 'Date de naissance'}:</b> {(selectedContractEmp as any)?.dateNaissance || '...................'}</p>
            </div>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">2. {isAr ? 'فترة التجربة' : "PÉRIODE D'ESSAI"}:</p>
            <p className="italic leading-normal">
              {isAr 
                ? "هذا العقد هو عقد محدد المدة (CDD). يخضع العقد لفترة تجربة مدتها 15 يوماً (خاضعة للتجديد مرة واحدة) وهي فترة غير مؤدى عنها، طبقاً لمقتضيات المادة 14 من مدونة الشغل. خلال هذه الفترة، يمكن لأي طرف إنهاء أو فسخ العقد في حال وقوع أي خطأ دون إشعار مسبق أو تعويض." 
                : "Le présent contrat est un Contrat à Durée Déterminée (CDD). Il est soumis à une période d'essai de 15 jours (renouvelable une fois) non rémunérée, conformément à l'article 14 du Code du Travail. Durant cette période, chacune des parties peut rompre ou résilier le contrat en cas d'erreur sans préavis ni indemnité."}
            </p>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">3. {isAr ? 'طبيعة العمل وساعات العمل' : 'POSTE ET DURÉE DU TRAVAIL'}:</p>
            <p>
              {isAr 
                ? `يشتغل الأجير كـ "${selectedContractEmp?.poste || 'عامل'}" لمدة 44 ساعة في الأسبوع. وتحدد أوقات العمل من الساعة 09:00 صباحاً إلى الساعة 18:00 مساءً، مع احترام القوانين الداخلية للورشة.` 
                : `L'employé(e) occupera le poste de "${selectedContractEmp?.poste || 'Ouvrier'}" pour une durée hebdomadaire de 44 heures. Les horaires de travail sont fixés de 09h00 à 18h00, conformément à la législation en vigueur et au règlement intérieur.`}
            </p>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">4. {isAr ? 'الأجر والضمان الاجتماعي' : 'RÉMUNÉRATION ET CNSS'}:</p>
            <p>
              {isAr 
                ? `تم تحديد الأجر في ${(selectedContractEmp?.salaireMensuel || 0).toLocaleString()} درهم. سيتم تحويل الأجر حصرياً إلى الحساب البنكي للأجير (عبر الـ RIB الخاص به). تلتزم الشركة بالتصريح بالأجير لدى الصندوق الوطني للضمان الاجتماعي (CNSS) فور استيفاء الشروط القانونية.` 
                : `Le salaire est fixé à ${(selectedContractEmp?.salaireMensuel || 0).toLocaleString()} MAD. Le salaire sera versé exclusivement par virement sur le compte bancaire de l'employé(e) selon son RIB. L'employeur s'engage à déclarer l'employé(e) à la CNSS conformément aux dispositions légales.`}
            </p>
          </section>

          <section>
            <p className="font-black border-b border-slate-900 pb-0.5 mb-2">5. {isAr ? 'الالتزامات المهنية' : 'OBLIGATIONS'}:</p>
            <p className="leading-relaxed">
              {isAr 
                ? "يلتزم الأجير بالحفاظ على أسرار الشركة، وبسلامة المعدات والآلات المسلمة له، وباحترام معايير الجودة والسلامة الصحية داخل مقر العمل. أي خطأ جسيم قد يؤدي إلى الفصل دون تعويض طبقاً للمادة 61 من مدونة الشغل." 
                : "L'employé(e) s'engage à respecter le secret professionnel, à prendre soin du matériel et à respecter les normes d'hygiène et de sécurité. Toute faute grave pourra entraîner un licenciement sans indemnité (Art. 61 du Code du Travail)."}
            </p>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-20 mt-12 text-center items-end">
          <div className="border-t-2 border-slate-300 pt-2">
            <p className="font-black uppercase text-[10px] tracking-widest">{isAr ? 'توقيع الأجير' : 'Signature Employé(e)'}</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">{isAr ? '(تصحيح الإمضاء ضروري)' : '(Légalisation obligatoire)'}</p>
          </div>
          <div className="border-t-2 border-slate-300 pt-2">
            <p className="font-black uppercase text-[10px] tracking-widest">{isAr ? 'توقيع الإدارة' : 'Signature Direction'}</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">BEYA CREATIVE — {isAr ? 'خاتم الشركة' : 'Cachet'}</p>
          </div>
        </div>

        <div className="mt-12 text-[8px] text-center text-slate-400 uppercase tracking-widest border-t pt-2">
          {isAr ? 'تم الاستخراج عبر نظام BEYA — نظام التسيير المندمج' : 'Généré via BEYA — Systéme de Gestion Intégré Textile'}
        </div>
      </div>
      {/* 📊 Salary & CNSS Simulator */}
      {showSimulator && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-white/20 relative">
             <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500 rounded-t-[3rem]" />
             <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
               {isAr ? 'حاسبة تكاليف الأجير' : 'Simulateur Salaire & CNSS'}
             </h3>

             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                    {isAr ? 'الراتب الصافي المطلوب (Net)' : 'Salaire NET souhaité (MAD)'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={simNet}
                      onChange={e => setSimNet(e.target.value)}
                      placeholder="3000"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-lg font-black text-slate-900 outline-none focus:border-emerald-500 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">MAD</span>
                  </div>
                </div>

                {simNet && Number(simNet) > 0 && (() => {
                  const net = Number(simNet);
                  const brutApprox = net / 0.9326; // Approx for small salaries
                  const cnssPatronale = brutApprox * 0.248; // Approx 24.8%
                  const totalCost = brutApprox + cnssPatronale;
                  return (
                    <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200/50 pb-2">
                        <span>{isAr ? 'الراتب الخام' : 'Salaire Brut'}</span>
                        <span className="font-black">{Math.round(brutApprox).toLocaleString()} MAD</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200/50 pb-2">
                        <span>{isAr ? 'مساهمة CNSS (المشغل)' : 'Charges Patronales'}</span>
                        <span className="font-black">+{Math.round(cnssPatronale).toLocaleString()} MAD</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{isAr ? 'التكلفة الإجمالية عليك' : 'Coût Total pour vous'}</p>
                        <p className="text-3xl font-black text-emerald-900 tabular-nums">
                          {Math.round(totalCost).toLocaleString()} <span className="text-sm">MAD</span>
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  onClick={() => setShowSimulator(false)}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                >
                  {isAr ? 'إغلاق' : 'Fermer'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
