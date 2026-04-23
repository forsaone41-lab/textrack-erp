import { createContext, useContext, useState, ReactNode } from 'react';
import { Lang } from '../i18n';

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  isAr: boolean;
}

const LangContext = createContext<LangCtx>({ lang: 'fr', toggle: () => {}, isAr: false });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('textrack_lang') as Lang) || 'fr');

  function toggle() {
    const next: Lang = lang === 'fr' ? 'ar' : 'fr';
    localStorage.setItem('textrack_lang', next);
    setLang(next);
  }

  return (
    <LangContext.Provider value={{ lang, toggle, isAr: lang === 'ar' }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
