import React from 'react';
import { useLang } from '../contexts/LangContext';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Reglement() {
  const { isAr } = useLang();
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0 flex flex-col items-center">
      {/* Controls */}
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl font-bold shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5" />
          {isAr ? 'رجوع' : 'Retour'}
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Printer className="w-5 h-5" />
          {isAr ? 'طباعة الوثيقة' : 'Imprimer le document'}
        </button>
      </div>

      {/* A4 Paper Document */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none p-12 md:p-20 relative overflow-hidden text-right" dir="rtl" style={{
        fontFamily: "'Amiri', 'Tajawal', sans-serif"
      }}>
        
        {/* Header */}
        <div className="text-center mb-16 border-b-2 border-slate-900 pb-8 relative">
          <h1 className="text-4xl font-black text-slate-900 tracking-wider">BEYA CREATIVE</h1>
          <p className="text-xl font-bold text-slate-500 mt-2">النظام الداخلي - أوقات العمل الرسمية</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-xl leading-relaxed text-slate-800 font-medium">
          <p className="text-2xl font-bold text-center mb-12">
            نخبركم أن أوقات العمل الرسمية المعمول بها داخل الشركة هي كالتالي:
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
            <h2 className="text-2xl font-black text-slate-900 mb-4 underline decoration-indigo-200 underline-offset-8">أيام العمل:</h2>
            <p className="text-xl mr-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
              من <strong>الإثنين</strong> إلى <strong>السبت</strong>
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
            <h2 className="text-2xl font-black text-slate-900 mb-4 underline decoration-indigo-200 underline-offset-8">التوقيت اليومي:</h2>
            <ul className="space-y-3 mr-4">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
                الدخول: <strong>09:00 صباحاً</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
                الخروج: <strong>18:00 مساءً</strong>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
            <h2 className="text-2xl font-black text-slate-900 mb-4 underline decoration-indigo-200 underline-offset-8">فترات الاستراحة:</h2>
            <ul className="space-y-3 mr-4">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
                استراحة الفطور: من <strong>11:00</strong> إلى <strong>11:15</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
                استراحة الغذاء: من <strong>14:00</strong> إلى <strong>14:45</strong>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 print:bg-transparent print:border-none print:p-0">
            <h2 className="text-2xl font-black text-amber-900 mb-4 underline decoration-amber-200 underline-offset-8">استثناءات:</h2>
            <ul className="space-y-3 mr-4 text-amber-950">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full inline-block"></span>
                <strong>يوم الجمعة:</strong> استراحة الغداء من 13:30 إلى 14:45
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full inline-block"></span>
                <strong>يوم السبت:</strong> نهاية العمل على الساعة 13:00 زوالاً
              </li>
            </ul>
          </div>

          <div className="mt-16 text-center border-t-2 border-slate-100 pt-12 print:border-slate-900 print:pt-8">
            <h3 className="text-2xl font-black text-slate-900 mb-4">المرجو من الجميع احترام هذه الأوقات</h3>
            <p className="text-lg text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
              أي تأخر أو تغيب غير مبرر يعرض صاحبه للإجراءات المنصوص عليها في النظام الداخلي ومدونة الشغل.
            </p>
          </div>
        </div>

        {/* Footer / Stamp area */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-end">
            <div></div>
            <div className="text-left w-64 relative">
              <h3 className="font-bold text-xl mb-12 text-slate-900 border-b-2 border-slate-900 inline-block pb-1">الإدارة:</h3>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { margin: 0; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
            * { text-shadow: none !important; box-shadow: none !important; }
          }
        `}} />
      </div>
    </div>
  );
}
