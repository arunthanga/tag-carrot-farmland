import { createContext, useEffect, useState, ReactNode } from 'react';
import { translations, type Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Auto-detect language from browser
    const detectLanguage = (): Language => {
      const browserLang = navigator.language || (navigator as any).userLanguage;
      const langCode = browserLang.substring(0, 2);
      
      // Check for supported languages
      if (langCode === 'ml') return 'ml'; // Malayalam
      if (langCode === 'ta') return 'ta'; // Tamil
      return 'en'; // Default to English
    };

    const detectedLang = detectLanguage();
    setLanguage(detectedLang);

    // Apply language-specific font classes to body
    document.body.classList.remove('font-malayalam', 'font-tamil');
    if (detectedLang === 'ml') {
      document.body.classList.add('font-malayalam');
    } else if (detectedLang === 'ta') {
      document.body.classList.add('font-tamil');
    }
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
