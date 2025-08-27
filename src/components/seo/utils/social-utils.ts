// Social Media Utilities for SEO Management
// Validation, optimization, and preview utilities for social media meta tags

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
  severity: 'low' | 'medium' | 'high';
}

export interface SocialMediaValidation {
  openGraph: Record<string, ValidationResult>;
  twitter: Record<string, ValidationResult>;
  overall: ValidationResult;
}

// Platform specifications
export interface PlatformImageSpec {
  name: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  maxSize: number; // in MB
  formats: string[];
  description: string;
}

export const SOCIAL_PLATFORM_SPECS: Record<string, PlatformImageSpec> = {
  facebook: {
    name: 'Facebook',
    dimensions: { width: 1200, height: 630 },
    aspectRatio: '1.91:1',
    maxSize: 8,
    formats: ['JPEG', 'PNG'],
    description: 'Recommended for Facebook posts and Link sharing'
  },
  twitter_large: {
    name: 'Twitter Large Image',
    dimensions: { width: 1200, height: 600 },
    aspectRatio: '2:1',
    maxSize: 5,
    formats: ['JPEG', 'PNG', 'WEBP'],
    description: 'For summary_large_image Twitter cards'
  },
  twitter_summary: {
    name: 'Twitter Summary',
    dimensions: { width: 144, height: 144 },
    aspectRatio: '1:1',
    maxSize: 1,
    formats: ['JPEG', 'PNG'],
    description: 'For summary Twitter cards'
  },
  linkedin: {
    name: 'LinkedIn',
    dimensions: { width: 1200, height: 627 },
    aspectRatio: '1.91:1',
    maxSize: 5,
    formats: ['JPEG', 'PNG'],
    description: 'Professional posts and articles'
  },
  instagram: {
    name: 'Instagram',
    dimensions: { width: 1080, height: 1080 },
    aspectRatio: '1:1',
    maxSize: 8,
    formats: ['JPEG', 'PNG'],
    description: 'Square format for Instagram posts'
  }
};

// OpenGraph validation rules
export const validateOpenGraphTitle = (title: string): ValidationResult => {
  if (!title) {
    return {
      isValid: false,
      message: 'OpenGraph title is required',
      type: 'error',
      severity: 'high'
    };
  }
  
  if (title.length > 95) {
    return {
      isValid: false,
      message: `Title too long (${title.length}/95 characters)`,
      type: 'error',
      severity: 'medium'
    };
  }
  
  if (title.length < 30) {
    return {
      isValid: true,
      message: 'Consider a longer, more descriptive title',
      type: 'warning',
      severity: 'low'
    };
  }
  
  if (title.length >= 50 && title.length <= 95) {
    return {
      isValid: true,
      message: 'Title length is optimal for social sharing',
      type: 'success',
      severity: 'low'
    };
  }
  
  return {
    isValid: true,
    message: `Good title length (${title.length}/95 characters)`,
    type: 'success',
    severity: 'low'
  };
};

export const validateOpenGraphDescription = (description: string): ValidationResult => {
  if (!description) {
    return {
      isValid: false,
      message: 'OpenGraph description is required',
      type: 'error',
      severity: 'high'
    };
  }
  
  if (description.length > 300) {
    return {
      isValid: false,
      message: `Description too long (${description.length}/300 characters)`,
      type: 'error',
      severity: 'medium'
    };
  }
  
  if (description.length < 120) {
    return {
      isValid: true,
      message: 'Consider a longer description for better engagement',
      type: 'warning',
      severity: 'low'
    };
  }
  
  if (description.length >= 150 && description.length <= 300) {
    return {
      isValid: true,
      message: 'Description length is optimal for social sharing',
      type: 'success',
      severity: 'low'
    };
  }
  
  return {
    isValid: true,
    message: `Good description length (${description.length}/300 characters)`,
    type: 'success',
    severity: 'low'
  };
};

export const validateOpenGraphImage = (imageUrl: string): ValidationResult => {
  if (!imageUrl) {
    return {
      isValid: false,
      message: 'OpenGraph image is highly recommended for social sharing',
      type: 'warning',
      severity: 'medium'
    };
  }
  
  try {
    const url = new URL(imageUrl);
    
    // Check if it's HTTPS
    if (url.protocol !== 'https:') {
      return {
        isValid: true,
        message: 'Consider using HTTPS for better security',
        type: 'warning',
        severity: 'low'
      };
    }
    
    // Check file extension
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const hasValidExtension = supportedExtensions.some(ext => 
      url.pathname.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return {
        isValid: true,
        message: 'Image format may not be supported by all platforms',
        type: 'warning',
        severity: 'low'
      };
    }
    
    return {
      isValid: true,
      message: 'Valid image URL provided',
      type: 'success',
      severity: 'low'
    };
  } catch {
    return {
      isValid: false,
      message: 'Invalid image URL format',
      type: 'error',
      severity: 'medium'
    };
  }
};

export const validateOpenGraphUrl = (url: string): ValidationResult => {
  if (!url) {
    return {
      isValid: false,
      message: 'OpenGraph URL is required',
      type: 'error',
      severity: 'high'
    };
  }
  
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return {
        isValid: false,
        message: 'URL must use HTTP or HTTPS protocol',
        type: 'error',
        severity: 'medium'
      };
    }
    
    if (parsedUrl.protocol === 'http:') {
      return {
        isValid: true,
        message: 'Consider using HTTPS for better security',
        type: 'warning',
        severity: 'low'
      };
    }
    
    return {
      isValid: true,
      message: 'Valid URL format',
      type: 'success',
      severity: 'low'
    };
  } catch {
    return {
      isValid: false,
      message: 'Invalid URL format',
      type: 'error',
      severity: 'high'
    };
  }
};

// Twitter Card validation rules
export const validateTwitterTitle = (title: string): ValidationResult => {
  if (!title) {
    return {
      isValid: false,
      message: 'Twitter title is required',
      type: 'error',
      severity: 'high'
    };
  }
  
  if (title.length > 70) {
    return {
      isValid: false,
      message: `Title too long (${title.length}/70 characters)`,
      type: 'error',
      severity: 'medium'
    };
  }
  
  if (title.length < 30) {
    return {
      isValid: true,
      message: 'Consider a longer, more descriptive title',
      type: 'warning',
      severity: 'low'
    };
  }
  
  return {
    isValid: true,
    message: `Good title length (${title.length}/70 characters)`,
    type: 'success',
    severity: 'low'
  };
};

export const validateTwitterDescription = (description: string): ValidationResult => {
  if (!description) {
    return {
      isValid: false,
      message: 'Twitter description is required',
      type: 'error',
      severity: 'high'
    };
  }
  
  if (description.length > 200) {
    return {
      isValid: false,
      message: `Description too long (${description.length}/200 characters)`,
      type: 'error',
      severity: 'medium'
    };
  }
  
  if (description.length < 80) {
    return {
      isValid: true,
      message: 'Consider a longer description for better engagement',
      type: 'warning',
      severity: 'low'
    };
  }
  
  return {
    isValid: true,
    message: `Good description length (${description.length}/200 characters)`,
    type: 'success',
    severity: 'low'
  };
};

export const validateTwitterHandle = (handle: string): ValidationResult => {
  if (!handle) {
    return {
      isValid: false,
      message: 'Twitter handle is recommended for proper attribution',
      type: 'warning',
      severity: 'medium'
    };
  }
  
  if (!handle.startsWith('@')) {
    return {
      isValid: false,
      message: 'Twitter handle must start with @',
      type: 'error',
      severity: 'medium'
    };
  }
  
  const username = handle.substring(1);
  if (username.length < 1 || username.length > 15) {
    return {
      isValid: false,
      message: 'Twitter username must be 1-15 characters (excluding @)',
      type: 'error',
      severity: 'medium'
    };
  }
  
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: 'Twitter handle can only contain letters, numbers, and underscores',
      type: 'error',
      severity: 'medium'
    };
  }
  
  return {
    isValid: true,
    message: 'Valid Twitter handle format',
    type: 'success',
    severity: 'low'
  };
};

export const validateTwitterCardImage = (imageUrl: string, cardType: string): ValidationResult => {
  if (!imageUrl) {
    return {
      isValid: false,
      message: 'Image is required for Twitter Cards',
      type: 'error',
      severity: 'high'
    };
  }
  
  try {
    new URL(imageUrl);
    
    const spec = cardType === 'summary' ? 
      SOCIAL_PLATFORM_SPECS.twitter_summary : 
      SOCIAL_PLATFORM_SPECS.twitter_large;
    
    return {
      isValid: true,
      message: `Image should be ${spec.dimensions.width}x${spec.dimensions.height} (${spec.aspectRatio})`,
      type: 'success',
      severity: 'low'
    };
  } catch {
    return {
      isValid: false,
      message: 'Invalid image URL format',
      type: 'error',
      severity: 'medium'
    };
  }
};

// Comprehensive validation function
export const validateSocialMediaTags = (
  openGraphTags: Record<string, unknown>,
  twitterTags: Record<string, unknown>
): SocialMediaValidation => {
  const ogValidation = {
    title: validateOpenGraphTitle(String(openGraphTags['og:title'] || '')),
    description: validateOpenGraphDescription(String(openGraphTags['og:description'] || '')),
    image: validateOpenGraphImage(String(openGraphTags['og:image'] || '')),
    url: validateOpenGraphUrl(String(openGraphTags['og:url'] || ''))
  };
  
  const twitterValidation = {
    title: validateTwitterTitle(String(twitterTags['twitter:title'] || '')),
    description: validateTwitterDescription(String(twitterTags['twitter:description'] || '')),
    site: validateTwitterHandle(String(twitterTags['twitter:site'] || '')),
    creator: validateTwitterHandle(String(twitterTags['twitter:creator'] || '')),
    image: validateTwitterCardImage(
      String(twitterTags['twitter:image'] || ''), 
      String(twitterTags['twitter:card'] || 'summary_large_image')
    )
  };
  
  // Calculate overall validation
  const allValidations = [...Object.values(ogValidation), ...Object.values(twitterValidation)];
  const criticalErrors = allValidations.filter(v => v.type === 'error' && v.severity === 'high').length;
  const errors = allValidations.filter(v => v.type === 'error').length;
  const warnings = allValidations.filter(v => v.type === 'warning').length;
  
  let overall: ValidationResult;
  
  if (criticalErrors > 0) {
    overall = {
      isValid: false,
      message: `${criticalErrors} critical error(s) need to be fixed`,
      type: 'error',
      severity: 'high'
    };
  } else if (errors > 0) {
    overall = {
      isValid: false,
      message: `${errors} error(s) and ${warnings} warning(s) found`,
      type: 'error',
      severity: 'medium'
    };
  } else if (warnings > 0) {
    overall = {
      isValid: true,
      message: `${warnings} warning(s) - configuration is functional but could be improved`,
      type: 'warning',
      severity: 'low'
    };
  } else {
    overall = {
      isValid: true,
      message: 'All social media tags are properly configured',
      type: 'success',
      severity: 'low'
    };
  }
  
  return {
    openGraph: ogValidation,
    twitter: twitterValidation,
    overall
  };
};

// HTML generation utilities
export const generateOpenGraphHTML = (tags: Record<string, unknown>): string => {
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return Object.entries(tags)
    .filter(([key, value]) => value !== undefined && value !== '' && value !== null)
    .map(([property, content]) => {
      if (Array.isArray(content)) {
        return content
          .filter(c => c !== undefined && c !== '' && c !== null)
          .map(c => `<meta property="${property}" content="${escapeHtml(String(c))}" />`)
          .join('\n');
      }
      return `<meta property="${property}" content="${escapeHtml(String(content))}" />`;
    })
    .join('\n');
};

export const generateTwitterCardHTML = (tags: Record<string, unknown>): string => {
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return Object.entries(tags)
    .filter(([key, value]) => value !== undefined && value !== '' && value !== null)
    .map(([name, content]) => {
      if (Array.isArray(content)) {
        return content
          .filter(c => c !== undefined && c !== '' && c !== null)
          .map(c => `<meta name="${name}" content="${escapeHtml(String(c))}" />`)
          .join('\n');
      }
      return `<meta name="${name}" content="${escapeHtml(String(content))}" />`;
    })
    .join('\n');
};

// Image optimization utilities
export const getOptimalImageDimensions = (platform: string): { width: number; height: number } => {
  const spec = SOCIAL_PLATFORM_SPECS[platform];
  return spec ? spec.dimensions : SOCIAL_PLATFORM_SPECS.facebook.dimensions;
};

export const validateImageDimensions = (
  width: number, 
  height: number, 
  platform: string
): ValidationResult => {
  const spec = SOCIAL_PLATFORM_SPECS[platform];
  if (!spec) {
    return {
      isValid: false,
      message: 'Unknown platform specification',
      type: 'error',
      severity: 'medium'
    };
  }
  
  const aspectRatio = width / height;
  const expectedRatio = spec.dimensions.width / spec.dimensions.height;
  const tolerance = 0.1; // 10% tolerance
  
  if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
    return {
      isValid: false,
      message: `Image aspect ratio (${aspectRatio.toFixed(2)}) doesn't match recommended ${spec.aspectRatio}`,
      type: 'warning',
      severity: 'medium'
    };
  }
  
  if (width < spec.dimensions.width * 0.5 || height < spec.dimensions.height * 0.5) {
    return {
      isValid: false,
      message: `Image too small. Minimum recommended: ${Math.round(spec.dimensions.width * 0.5)}x${Math.round(spec.dimensions.height * 0.5)}`,
      type: 'error',
      severity: 'medium'
    };
  }
  
  return {
    isValid: true,
    message: `Image dimensions are suitable for ${spec.name}`,
    type: 'success',
    severity: 'low'
  };
};

// URL utilities
export const extractDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'example.com';
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Character count utilities
export const getCharacterCountInfo = (
  text: string, 
  limit: number, 
  optimal?: number
) => {
  const count = text.length;
  const remaining = limit - count;
  const isOver = remaining < 0;
  const isNearLimit = remaining <= 10 && remaining > 0;
  const isOptimal = optimal ? (count >= optimal && count <= limit) : false;
  
  return {
    count,
    limit,
    remaining,
    isOver,
    isNearLimit,
    isOptimal,
    percentage: Math.min((count / limit) * 100, 100)
  };
};

// Export validation constants
export const SOCIAL_VALIDATION_RULES = {
  OPENGRAPH_TITLE_MAX: 95,
  OPENGRAPH_TITLE_OPTIMAL: 60,
  OPENGRAPH_DESCRIPTION_MAX: 300,
  OPENGRAPH_DESCRIPTION_OPTIMAL: 155,
  TWITTER_TITLE_MAX: 70,
  TWITTER_TITLE_OPTIMAL: 50,
  TWITTER_DESCRIPTION_MAX: 200,
  TWITTER_DESCRIPTION_OPTIMAL: 125,
  TWITTER_HANDLE_MAX: 15
} as const;