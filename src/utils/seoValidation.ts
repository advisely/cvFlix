import { SEOValidationResult, MetaTagLimits } from '@/types/seo';

// SEO best practices limits
export const META_TAG_LIMITS: MetaTagLimits = {
  titleMaxLength: 60,
  descriptionMaxLength: 160,
  keywordsMaxLength: 255
};

/**
 * Validate SEO meta tag data
 */
export function validateSEOMetaTag(data: {
  title?: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  keywords?: string;
  keywordsFr?: string;
  page?: string;
  canonicalUrl?: string;
}): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Page validation
  if (data.page) {
    if (!data.page.startsWith('/')) {
      errors.push('Page path must start with "/"');
    }
    if (data.page.includes(' ')) {
      errors.push('Page path cannot contain spaces');
    }
  }

  // Title validation
  if (data.title) {
    if (data.title.length > META_TAG_LIMITS.titleMaxLength) {
      errors.push(`English title exceeds ${META_TAG_LIMITS.titleMaxLength} characters (${data.title.length})`);
    } else if (data.title.length < 30) {
      warnings.push('English title is shorter than 30 characters (recommended: 30-60)');
    }
  }

  if (data.titleFr) {
    if (data.titleFr.length > META_TAG_LIMITS.titleMaxLength) {
      errors.push(`French title exceeds ${META_TAG_LIMITS.titleMaxLength} characters (${data.titleFr.length})`);
    } else if (data.titleFr.length < 30) {
      warnings.push('French title is shorter than 30 characters (recommended: 30-60)');
    }
  }

  // Description validation
  if (data.description) {
    if (data.description.length > META_TAG_LIMITS.descriptionMaxLength) {
      errors.push(`English description exceeds ${META_TAG_LIMITS.descriptionMaxLength} characters (${data.description.length})`);
    } else if (data.description.length < 120) {
      warnings.push('English description is shorter than 120 characters (recommended: 120-160)');
    }
  }

  if (data.descriptionFr) {
    if (data.descriptionFr.length > META_TAG_LIMITS.descriptionMaxLength) {
      errors.push(`French description exceeds ${META_TAG_LIMITS.descriptionMaxLength} characters (${data.descriptionFr.length})`);
    } else if (data.descriptionFr.length < 120) {
      warnings.push('French description is shorter than 120 characters (recommended: 120-160)');
    }
  }

  // Keywords validation
  if (data.keywords && data.keywords.length > META_TAG_LIMITS.keywordsMaxLength) {
    warnings.push(`English keywords are quite long (${data.keywords.length} characters). Consider focusing on most important terms.`);
  }

  if (data.keywordsFr && data.keywordsFr.length > META_TAG_LIMITS.keywordsMaxLength) {
    warnings.push(`French keywords are quite long (${data.keywordsFr.length} characters). Consider focusing on most important terms.`);
  }

  // Canonical URL validation
  if (data.canonicalUrl) {
    try {
      const url = new URL(data.canonicalUrl);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        errors.push('Canonical URL must use http or https protocol');
      }
    } catch {
      errors.push('Invalid canonical URL format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate structured data JSON-LD
 */
export function validateStructuredData(jsonData: string): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonData);

    // Check required Schema.org fields
    if (!parsed['@context']) {
      errors.push('Missing required @context field');
    } else if (!parsed['@context'].includes('schema.org')) {
      errors.push('@context must reference schema.org');
    }

    if (!parsed['@type']) {
      errors.push('Missing required @type field');
    }

    // Validate common schema types
    if (parsed['@type'] === 'Person') {
      if (!parsed.name) {
        warnings.push('Person schema should include a name field');
      }
    } else if (parsed['@type'] === 'Organization') {
      if (!parsed.name) {
        warnings.push('Organization schema should include a name field');
      }
    } else if (parsed['@type'] === 'WebSite') {
      if (!parsed.name || !parsed.url) {
        warnings.push('WebSite schema should include name and url fields');
      }
    }

    // Check for common issues
    if (JSON.stringify(parsed).includes('<script')) {
      errors.push('Structured data contains potentially malicious content');
    }

  } catch (parseError) {
    errors.push('Invalid JSON format in structured data');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate robots.txt content
 */
export function validateRobotsContent(content: string): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lines = content.split('\n').map(line => line.trim());
  let hasUserAgent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines and comments
    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const lowerLine = line.toLowerCase();

    // Check for User-agent
    if (lowerLine.startsWith('user-agent:')) {
      hasUserAgent = true;
      const userAgent = line.substring(11).trim();
      if (userAgent.length === 0) {
        errors.push(`Line ${i + 1}: User-agent directive is empty`);
      }
      continue;
    }

    // Check for valid directives
    const validDirectives = [
      'disallow:', 'allow:', 'sitemap:', 'crawl-delay:', 
      'request-rate:', 'visit-time:', 'host:'
    ];

    const isValidDirective = validDirectives.some(directive => 
      lowerLine.startsWith(directive)
    );

    if (!isValidDirective) {
      errors.push(`Line ${i + 1}: Invalid directive "${line}"`);
    }

    // Check for common mistakes
    if (lowerLine.startsWith('sitemap:')) {
      const sitemapUrl = line.substring(8).trim();
      if (!sitemapUrl.startsWith('http')) {
        warnings.push(`Line ${i + 1}: Sitemap URL should be absolute (include https://)`);
      }
    }
  }

  if (!hasUserAgent) {
    errors.push('robots.txt must contain at least one User-agent directive');
  }

  // Check for potentially dangerous patterns
  if (content.toLowerCase().includes('disallow: /')) {
    warnings.push('Consider if "Disallow: /" blocks too much content from search engines');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate SEO recommendations based on current state
 */
export function generateSEORecommendations(data: {
  hasMetaTags: boolean;
  hasStructuredData: boolean;
  hasCustomRobots: boolean;
  metaTagCompleteness: number;
}): string[] {
  const recommendations: string[] = [];

  if (!data.hasMetaTags) {
    recommendations.push('Add custom meta tags for better search engine visibility');
  }

  if (!data.hasStructuredData) {
    recommendations.push('Implement structured data (JSON-LD) to enhance search results');
  }

  if (!data.hasCustomRobots) {
    recommendations.push('Configure robots.txt to control search engine crawling');
  }

  if (data.metaTagCompleteness < 80) {
    recommendations.push('Improve meta tag completeness (add missing descriptions, optimize lengths)');
  }

  return recommendations;
}

/**
 * Calculate overall SEO score
 */
export function calculateSEOScore(analytics: {
  totalPages: number;
  pagesWithCustomMeta: number;
  pagesWithStructuredData: number;
}): number {
  let score = 0;
  const maxScore = 100;

  // Meta tag coverage (40 points)
  if (analytics.totalPages > 0) {
    const metaCoverage = analytics.pagesWithCustomMeta / analytics.totalPages;
    score += Math.round(metaCoverage * 40);
  }

  // Structured data coverage (30 points)
  if (analytics.totalPages > 0) {
    const structuredDataCoverage = analytics.pagesWithStructuredData / analytics.totalPages;
    score += Math.round(structuredDataCoverage * 30);
  }

  // Basic setup (30 points)
  score += 30; // Assuming robots.txt and sitemap are configured

  return Math.min(score, maxScore);
}
