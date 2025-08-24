'use client'

import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'footer';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'navbar',
  className = ''
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const baseClasses = "flex items-center gap-2";
  const variantClasses = {
    navbar: "text-white",
    footer: "text-white/80"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 ${
          language === 'en'
            ? 'bg-[#e50914] text-white'
            : 'hover:bg-white/10 text-white/70 hover:text-white'
        }`}
        aria-label={t('language.english')}
      >
        EN
      </button>
      <span className="text-white/40">|</span>
      <button
        onClick={() => handleLanguageChange('fr')}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 ${
          language === 'fr'
            ? 'bg-[#e50914] text-white'
            : 'hover:bg-white/10 text-white/70 hover:text-white'
        }`}
        aria-label={t('language.french')}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
