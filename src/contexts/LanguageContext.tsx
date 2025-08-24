'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Static translations for UI elements
const translations = {
  en: {
    'language.english': 'English',
    'language.french': 'French',
    'nav.portfolio': 'Portfolio',
    'nav.education': 'Education',
    'nav.certifications': 'Certifications',
    'nav.skills': 'Skills',
    'common.present': 'Present',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.noData': 'No data available',
    'footer.allRightsReserved': 'All rights reserved',
  },
  fr: {
    'language.english': 'Anglais',
    'language.french': 'Français',
    'nav.portfolio': 'Portfolio',
    'nav.education': 'Éducation',
    'nav.certifications': 'Certifications',
    'nav.skills': 'Compétences',
    'common.present': 'Présent',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.noData': 'Aucune donnée disponible',
    'footer.allRightsReserved': 'Tous droits réservés',
  }
};

// Browser language detection
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  return 'en'; // Default to English
};

// Get text in current language with fallback
export const getLocalizedText = (
  englishText: string | null | undefined,
  frenchText: string | null | undefined,
  language: Language
): string => {
  if (language === 'fr' && frenchText) {
    return frenchText;
  }
  return englishText || frenchText || '';
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage or browser detection
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguageState(savedLanguage);
    } else {
      const detectedLanguage = detectBrowserLanguage();
      setLanguageState(detectedLanguage);
      localStorage.setItem('language', detectedLanguage);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function for static UI text
  const t = (key: string, fallback?: string): string => {
    const translation = translations[language]?.[key as keyof typeof translations['en']];
    return translation || fallback || key;
  };

  // Don't render until language is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
