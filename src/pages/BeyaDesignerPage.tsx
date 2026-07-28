import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BeyaDesignerPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = params.get('plan') || 'NORMAL';
  const lang = params.get('lang') || 'fr';
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[500] bg-[#0b0d14] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0f1220] shrink-0">
        <button
          onClick={() => navigate('/store-builder')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          {isAr ? 'الرجوع لإدارة المتجر' : 'Retour à la gestion boutique'}
        </button>
        <span className="text-slate-400 text-xs font-bold">／ Beya Designer</span>
      </div>
      <iframe
        title="Beya Designer"
        src={`/beya-designer.html?plan=${encodeURIComponent(plan)}&lang=${lang}`}
        className="w-full flex-1 border-none"
      />
    </div>
  );
}
