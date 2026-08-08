import React, { useEffect, useState } from 'react';
import { Apple, Download, Smartphone, Share, PlusSquare, ArrowUp, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function DownloadApp() {
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect Device
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setDevice('ios');
    } else if (/android/i.test(ua)) {
      setDevice('android');
    } else {
      setDevice('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capture the install prompt for Android/Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      }
      setDeferredPrompt(null);
    } else {
      alert("L'installation directe n'est pas supportée sur ce navigateur. Veuillez utiliser les options du menu.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-arabic" dir="rtl">
      
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      
      <div className="max-w-2xl w-full bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative z-10 animate-in zoom-in duration-500">
        
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center transform rotate-12 mx-auto mb-10 shadow-xl shadow-indigo-600/30">
          <span className="text-white font-black text-5xl -rotate-12">B</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black mb-4">تطبيق BEYA</h1>
        <p className="text-lg text-slate-400 mb-12">حمل التطبيق الآن لتسيير أعمالك والتحكم في متجرك بكل سهولة من هاتفك.</p>

        {isInstalled ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">التطبيق مثبت بالفعل! 🎉</h3>
            <p className="text-emerald-200/70">يمكنك الآن فتح BEYA مباشرة من شاشة هاتفك الرئيسية.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* ANDROID VIEW */}
            {device === 'android' && (
              <div className="animate-in slide-in-from-bottom-4">
                <button 
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl shadow-emerald-500/20"
                >
                  <Download className="w-6 h-6" />
                  تحميل للأندرويد
                </button>
                <p className="text-xs text-slate-500 mt-4">انقر للتحميل مباشرة. إذا لم يظهر لك شيء، استخدم متصفح Google Chrome.</p>
              </div>
            )}

            {/* IOS VIEW */}
            {device === 'ios' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-in slide-in-from-bottom-4 relative">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Apple className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-black">تحميل للآيفون</h3>
                </div>
                
                <div className="space-y-6 text-right">
                  <p className="text-slate-300 font-bold mb-4">بسبب حماية Apple، التثبيت كيتم فهاد 3 خطوات ساهلة:</p>
                  
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0 font-black">1</div>
                    <p className="text-sm text-slate-300">في أسفل الشاشة ديال متصفح Safari، كليكي على زر المشاركة <Share className="inline w-4 h-4 mx-1 text-blue-400" /></p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0 font-black">2</div>
                    <p className="text-sm text-slate-300">هبط لتحت واختار <strong>"Sur l'écran d'accueil"</strong> <PlusSquare className="inline w-4 h-4 mx-1 text-slate-400" /></p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0 font-black">3</div>
                    <p className="text-sm text-slate-300">فوق على اليمين، كليكي على <strong>"Ajouter"</strong> وغادي تلقى التطبيق فالتليفون!</p>
                  </div>
                </div>

                {/* Animated Arrow pointing down */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400">كليكي هنا لتحت</span>
                  <ArrowUp className="w-8 h-8 text-indigo-500 rotate-180" />
                </div>
              </div>
            )}

            {/* DESKTOP VIEW */}
            {device === 'desktop' && (
              <div className="animate-in zoom-in-95">
                <div className="bg-white p-6 rounded-3xl inline-block mx-auto mb-6 shadow-2xl">
                  <QRCodeSVG 
                    value="https://beyacreative.com/#/app" 
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"}
                    level={"H"}
                    imageSettings={{
                      src: "/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <h3 className="text-xl font-black text-white mb-2">سكانر بالكاميرا ديال تليفونك</h3>
                <p className="text-sm text-slate-400">وجه كاميرا الهاتف (آيفون أو أندرويد) على هاد الكود باش تحمل التطبيق.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
