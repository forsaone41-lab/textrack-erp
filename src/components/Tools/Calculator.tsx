import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Delete, Percent, Divide, Minus, Plus, Equal } from 'lucide-react';

export default function Calculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // Sanitize input to only allow numbers and basic operators to mitigate eval/Function risks
      const sanitized = (equation + display).replace(/[^-()\\d/*+.]/g, '');
      const result = new Function('return ' + sanitized)();
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
      >
        <CalcIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-72 bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 z-[200]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculatrice Pro</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mb-4 text-right overflow-hidden">
            <div className="text-[10px] font-bold text-slate-500 h-4 mb-1">{equation}</div>
            <div className="text-3xl font-black text-white truncate">{display}</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button onClick={clear} className="p-4 rounded-xl bg-slate-800 text-rose-400 font-bold text-xs hover:bg-slate-700 transition-colors">C</button>
            <button onClick={() => handleOperator('/')} className="p-4 rounded-xl bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 transition-colors"><Divide className="w-4 h-4 mx-auto" /></button>
            <button onClick={() => handleOperator('*')} className="p-4 rounded-xl bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 transition-colors"><X className="w-4 h-4 mx-auto" /></button>
            <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className="p-4 rounded-xl bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 transition-colors"><Delete className="w-4 h-4 mx-auto" /></button>

            {[7, 8, 9].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="p-4 rounded-xl bg-slate-800/50 text-white font-black hover:bg-slate-700 transition-colors">{n}</button>)}
            <button onClick={() => handleOperator('-')} className="p-4 rounded-xl bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 transition-colors"><Minus className="w-4 h-4 mx-auto" /></button>

            {[4, 5, 6].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="p-4 rounded-xl bg-slate-800/50 text-white font-black hover:bg-slate-700 transition-colors">{n}</button>)}
            <button onClick={() => handleOperator('+')} className="p-4 rounded-xl bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 transition-colors"><Plus className="w-4 h-4 mx-auto" /></button>

            {[1, 2, 3].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="p-4 rounded-xl bg-slate-800/50 text-white font-black hover:bg-slate-700 transition-colors">{n}</button>)}
            <button onClick={calculate} className="row-span-2 p-4 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-500 transition-colors flex items-center justify-center"><Equal className="w-5 h-5" /></button>

            <button onClick={() => handleNumber('0')} className="col-span-2 p-4 rounded-xl bg-slate-800/50 text-white font-black hover:bg-slate-700 transition-colors text-center">0</button>
            <button onClick={() => handleNumber('.')} className="p-4 rounded-xl bg-slate-800/50 text-white font-black hover:bg-slate-700 transition-colors">.</button>
          </div>
        </div>
      )}
    </div>
  );
}
