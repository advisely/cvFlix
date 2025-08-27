import { SEOConfig, SEOMetaTag } from '@/types/seo';

export interface CharacterLimits {
  title: number;
  description: number;
  keywords: number;
}

export const SEO_CHARACTER_LIMITS: CharacterLimits = {
  title: 60,
  description: 160,
  keywords: 200,
};

export const getCharacterCount = (text: string | null | undefined): number => {
  return text?.length || 0;
};

export const isOverLimit = (text: string | null | undefined, limit: number): boolean => {
  return getCharacterCount(text) > limit;
};

export const getRemainingCharacters = (text: string | null | undefined, limit: number): number => {
  return limit - getCharacterCount(text);
};

export const getCharacterStatus = (text: string | null | undefined, limit: number) => {
  const count = getCharacterCount(text);
  const remaining = limit - count;
  
  return {
    count,
    remaining,
    isOver: remaining < 0,
    isNearLimit: remaining <= 10 && remaining > 0,
    isOptimal: count >= Math.floor(limit * 0.7) && remaining >= 0
  };
};

export const validateSEOText = (text: string | null | undefined, limit: number) => {
  const status = getCharacterStatus(text, limit);
  
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'This field is required', type: 'error' as const };
  }
  
  if (status.isOver) {
    return { 
      isValid: false, 
      message: `${Math.abs(status.remaining)} characters over limit`, 
      type: 'error' as const 
    };
  }
  
  if (status.isNearLimit) {
    return { 
      isValid: true, 
      message: `${status.remaining} characters remaining`, 
      type: 'warning' as const 
    };
  }
  
  if (status.isOptimal) {
    return { isValid: true, message: 'Optimal length', type: 'success' as const };
  }
  
  return { 
    isValid: true, 
    message: `${status.remaining} characters remaining`, 
    type: 'info' as const 
  };
};

export const generatePreviewData = (
  config: SEOConfig | null,
  metaTag: SEOMetaTag | null,
  language: 'en' | 'fr' = 'en'
) => {
  if (!config) return null;

  const title = metaTag 
    ? (language === 'fr' ? metaTag.titleFr : metaTag.title)
    : (language === 'fr' ? config.defaultTitleFr : config.defaultTitle);
    
  const description = metaTag
    ? (language === 'fr' ? metaTag.descriptionFr : metaTag.description)
    : (language === 'fr' ? config.defaultDescriptionFr : config.defaultDescription);
    
  const siteName = language === 'fr' ? config.siteNameFr : config.siteName;
  const canonicalUrl = metaTag?.canonicalUrl || config.canonicalUrl;
  
  const ogTitle = metaTag?.ogTitle || metaTag?.ogTitleFr || title;
  const ogDescription = metaTag?.ogDescription || metaTag?.ogDescriptionFr || description;
  const ogImage = metaTag?.ogImage || config.faviconUrl;

  return {
    title: title || '',
    description: description || '',
    siteName,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    displayUrl: canonicalUrl ? new URL(canonicalUrl).hostname : ''
  };
};

export const commonSitePages = [
  { value: '/', label: 'Home Page', icon: '🏠' },
  { value: '/experiences', label: 'Experiences', icon: '💼' },
  { value: '/education', label: 'Education', icon: '🎓' },
  { value: '/skills', label: 'Skills', icon: '⚡' },
  { value: '/certifications', label: 'Certifications', icon: '📜' },
  { value: '/highlights', label: 'Highlights', icon: '⭐' },
  { value: '/contact', label: 'Contact', icon: '📧' },
];

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeKeywords = (keywords: string): string => {
  return keywords
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
    .join(', ');
};

export const extractKeywords = (text: string, maxWords: number = 10): string[] => {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were'].includes(word));
    
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxWords)
    .map(([word]) => word);
};