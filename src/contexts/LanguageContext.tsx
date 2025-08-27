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
    
    // Upload error messages
    'upload.error.size.image': 'File too large. Maximum size for images is 10MB.',
    'upload.error.size.video': 'File too large. Maximum size for videos is 50MB.',
    'upload.error.size.generic': 'File too large. Please choose a smaller file.',
    'upload.error.format.invalid': 'Invalid file format. Only images and videos are supported.',
    'upload.error.format.unsupported': 'Unsupported file type. Please choose a different file.',
    'upload.error.network.timeout': 'Upload timed out. Please check your connection and try again.',
    'upload.error.network.offline': 'No internet connection. Please check your network and try again.',
    'upload.error.network.generic': 'Network error occurred. Please try again.',
    'upload.error.server.unavailable': 'Server is currently unavailable. Please try again later.',
    'upload.error.server.space': 'Not enough storage space. Please contact administrator.',
    'upload.error.server.permission': 'Permission denied. Please check your access rights.',
    'upload.error.server.generic': 'Server error occurred. Please try again.',
    'upload.error.generic.unknown': 'An unexpected error occurred. Please try again.',
    'upload.error.generic.retry': 'Upload failed. Click to retry.',
    'upload.action.retry': 'Retry Upload',
    'upload.action.cancel': 'Cancel',
    'upload.action.dismiss': 'Dismiss',
    'upload.success': 'File uploaded successfully!',
    'upload.maxFiles': 'Maximum number of files reached. Please remove some files first.',
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
    
    // Upload error messages in French
    'upload.error.size.image': 'Fichier trop volumineux. La taille maximale pour les images est de 10 Mo.',
    'upload.error.size.video': 'Fichier trop volumineux. La taille maximale pour les vidéos est de 50 Mo.',
    'upload.error.size.generic': 'Fichier trop volumineux. Veuillez choisir un fichier plus petit.',
    'upload.error.format.invalid': 'Format de fichier invalide. Seules les images et vidéos sont supportées.',
    'upload.error.format.unsupported': 'Type de fichier non supporté. Veuillez choisir un autre fichier.',
    'upload.error.network.timeout': 'Téléchargement expiré. Vérifiez votre connexion et réessayez.',
    'upload.error.network.offline': 'Pas de connexion internet. Vérifiez votre réseau et réessayez.',
    'upload.error.network.generic': 'Erreur réseau survenue. Veuillez réessayer.',
    'upload.error.server.unavailable': 'Le serveur est actuellement indisponible. Réessayez plus tard.',
    'upload.error.server.space': 'Espace de stockage insuffisant. Contactez l\'administrateur.',
    'upload.error.server.permission': 'Permission refusée. Vérifiez vos droits d\'accès.',
    'upload.error.server.generic': 'Erreur serveur survenue. Veuillez réessayer.',
    'upload.error.generic.unknown': 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    'upload.error.generic.retry': 'Échec du téléchargement. Cliquez pour réessayer.',
    'upload.action.retry': 'Réessayer',
    'upload.action.cancel': 'Annuler',
    'upload.action.dismiss': 'Ignorer',
    'upload.success': 'Fichier téléchargé avec succès!',
    'upload.maxFiles': 'Nombre maximum de fichiers atteint. Veuillez supprimer quelques fichiers d\'abord.',
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
