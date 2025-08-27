import { SEOValidationResult } from '@/types/seo';

// Validation error and warning types
export interface RobotsValidationError {
  line: number;
  message: string;
  type: 'syntax' | 'security' | 'seo' | 'format';
  severity: 'error' | 'warning';
}

export interface RobotsTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
}

// Pre-built robots.txt templates
export const ROBOTS_TEMPLATES: Record<string, RobotsTemplate> = {
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Optimized for personal/professional portfolios',
    category: 'Personal',
    tags: ['portfolio', 'personal', 'professional'],
    content: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /boss/
Disallow: /api/
Disallow: /private/
Crawl-delay: 5

# Allow social media crawlers full access
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml`
  },
  
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce Site',
    description: 'Standard e-commerce robots.txt with cart and checkout protection',
    category: 'Business',
    tags: ['ecommerce', 'shopping', 'business'],
    content: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /account/
Disallow: /search?
Disallow: /filter?
Crawl-delay: 3

# Block aggressive crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Allow important crawlers
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml
Sitemap: https://yoursite.com/products-sitemap.xml`
  },
  
  blog: {
    id: 'blog',
    name: 'Blog/Content Site',
    description: 'Optimized for blogs and content-focused websites',
    category: 'Content',
    tags: ['blog', 'content', 'articles'],
    content: `User-agent: *
Allow: /
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /cgi-bin/
Disallow: /search
Disallow: /feed/
Disallow: /admin/
Crawl-delay: 2

# Allow specific paths
Allow: /wp-admin/admin-ajax.php
Allow: /wp-content/uploads/

# Block spam bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml
Sitemap: https://yoursite.com/post-sitemap.xml`
  },
  
  corporate: {
    id: 'corporate',
    name: 'Corporate Website',
    description: 'Professional corporate website configuration',
    category: 'Business',
    tags: ['corporate', 'business', 'professional'],
    content: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /internal/
Disallow: /staff/
Disallow: /login/
Crawl-delay: 5

# Allow press and media resources
Allow: /press/
Allow: /media/
Allow: /news/

# Block unnecessary crawlers
User-agent: CCBot
Disallow: /

User-agent: GPTBot
Disallow: /

# Allow major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 2

User-agent: Bingbot
Allow: /
Crawl-delay: 3

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml`
  },
  
  restrictive: {
    id: 'restrictive',
    name: 'Restrictive (Private)',
    description: 'Block all crawlers - use for private or development sites',
    category: 'Security',
    tags: ['private', 'restricted', 'development'],
    content: `User-agent: *
Disallow: /

# Block all crawlers from entire site
# Use this for:
# - Development environments
# - Private internal sites
# - Sites under construction`
  },
  
  permissive: {
    id: 'permissive',
    name: 'Fully Open',
    description: 'Allow all crawlers complete access',
    category: 'Open',
    tags: ['open', 'public', 'unrestricted'],
    content: `User-agent: *
Allow: /

# Allow all crawlers full access
# No restrictions or delays
# Suitable for:
# - Public information sites
# - Open data repositories
# - Educational resources

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml`
  }
};

// Comprehensive robots.txt validation
export function validateRobotsContent(content: string): SEOValidationResult & {
  detailedErrors: RobotsValidationError[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const detailedErrors: RobotsValidationError[] = [];
  
  const lines = content.split('\n');
  let hasUserAgent = false;
  let currentUserAgent = '';
  let hasDisallowOrAllow = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const lineNumber = i + 1;

    // Skip empty lines and comments
    if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
      continue;
    }

    const lowerLine = trimmedLine.toLowerCase();

    // Security checks for malicious content
    if (containsMaliciousPatterns(trimmedLine)) {
      const error: RobotsValidationError = {
        line: lineNumber,
        message: 'Potentially malicious content detected',
        type: 'security',
        severity: 'error'
      };
      errors.push(`Line ${lineNumber}: ${error.message}`);
      detailedErrors.push(error);
      continue;
    }

    // Check for User-agent directive
    if (lowerLine.startsWith('user-agent:')) {
      hasUserAgent = true;
      currentUserAgent = trimmedLine.substring(11).trim();
      
      if (currentUserAgent.length === 0) {
        const error: RobotsValidationError = {
          line: lineNumber,
          message: 'User-agent directive cannot be empty',
          type: 'syntax',
          severity: 'error'
        };
        errors.push(`Line ${lineNumber}: ${error.message}`);
        detailedErrors.push(error);
      }
      continue;
    }

    // Check for valid directives
    const validDirectives = [
      'disallow:', 'allow:', 'sitemap:', 'crawl-delay:', 
      'request-rate:', 'visit-time:', 'host:', 'clean-param:'
    ];

    const isValidDirective = validDirectives.some(directive => 
      lowerLine.startsWith(directive)
    );

    if (!isValidDirective) {
      const error: RobotsValidationError = {
        line: lineNumber,
        message: `Invalid directive "${trimmedLine}"`,
        type: 'syntax',
        severity: 'error'
      };
      errors.push(`Line ${lineNumber}: ${error.message}`);
      detailedErrors.push(error);
      continue;
    }

    // Track if we have allow/disallow rules
    if (lowerLine.startsWith('disallow:') || lowerLine.startsWith('allow:')) {
      hasDisallowOrAllow = true;
      
      if (!hasUserAgent) {
        const error: RobotsValidationError = {
          line: lineNumber,
          message: 'Disallow/Allow directive must follow a User-agent directive',
          type: 'format',
          severity: 'error'
        };
        errors.push(`Line ${lineNumber}: ${error.message}`);
        detailedErrors.push(error);
      }
    }

    // Validate specific directives
    if (lowerLine.startsWith('sitemap:')) {
      const sitemapUrl = trimmedLine.substring(8).trim();
      if (!sitemapUrl) {
        const error: RobotsValidationError = {
          line: lineNumber,
          message: 'Sitemap directive cannot be empty',
          type: 'syntax',
          severity: 'error'
        };
        errors.push(`Line ${lineNumber}: ${error.message}`);
        detailedErrors.push(error);
      } else if (!sitemapUrl.startsWith('http')) {
        const warning: RobotsValidationError = {
          line: lineNumber,
          message: 'Sitemap URL should be absolute (include https://)',
          type: 'seo',
          severity: 'warning'
        };
        warnings.push(`Line ${lineNumber}: ${warning.message}`);
        detailedErrors.push(warning);
      }
    }

    if (lowerLine.startsWith('crawl-delay:')) {
      const delay = trimmedLine.substring(12).trim();
      const delayNum = parseInt(delay);
      if (isNaN(delayNum) || delayNum < 0) {
        const error: RobotsValidationError = {
          line: lineNumber,
          message: 'Crawl-delay must be a non-negative number',
          type: 'syntax',
          severity: 'error'
        };
        errors.push(`Line ${lineNumber}: ${error.message}`);
        detailedErrors.push(error);
      } else if (delayNum > 86400) { // 24 hours
        const warning: RobotsValidationError = {
          line: lineNumber,
          message: 'Crawl-delay is very high (over 24 hours), consider if this is intended',
          type: 'seo',
          severity: 'warning'
        };
        warnings.push(`Line ${lineNumber}: ${warning.message}`);
        detailedErrors.push(warning);
      }
    }

    // Check for path format in Allow/Disallow
    if (lowerLine.startsWith('disallow:') || lowerLine.startsWith('allow:')) {
      const path = trimmedLine.substring(lowerLine.startsWith('disallow:') ? 9 : 6).trim();
      if (path && !path.startsWith('/') && path !== '*') {
        const warning: RobotsValidationError = {
          line: lineNumber,
          message: 'Paths should typically start with "/" or be "*"',
          type: 'format',
          severity: 'warning'
        };
        warnings.push(`Line ${lineNumber}: ${warning.message}`);
        detailedErrors.push(warning);
      }
    }
  }

  // Global validation checks
  if (!hasUserAgent) {
    const error: RobotsValidationError = {
      line: 0,
      message: 'robots.txt must contain at least one User-agent directive',
      type: 'format',
      severity: 'error'
    };
    errors.push(error.message);
    detailedErrors.push(error);
  }

  if (hasUserAgent && !hasDisallowOrAllow && !content.toLowerCase().includes('sitemap:')) {
    const warning: RobotsValidationError = {
      line: 0,
      message: 'Consider adding Allow/Disallow directives or Sitemap location',
      type: 'seo',
      severity: 'warning'
    };
    warnings.push(warning.message);
    detailedErrors.push(warning);
  }

  // SEO best practice checks
  if (content.toLowerCase().includes('disallow: /') && !content.toLowerCase().includes('allow:')) {
    const warning: RobotsValidationError = {
      line: 0,
      message: 'Consider if "Disallow: /" blocks too much content from search engines',
      type: 'seo',
      severity: 'warning'
    };
    warnings.push(warning.message);
    detailedErrors.push(warning);
  }

  if (!content.toLowerCase().includes('sitemap:')) {
    const warning: RobotsValidationError = {
      line: 0,
      message: 'Consider adding a Sitemap directive to help search engines find your content',
      type: 'seo',
      severity: 'warning'
    };
    warnings.push(warning.message);
    detailedErrors.push(warning);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    detailedErrors
  };
}

// Check for malicious patterns
function containsMaliciousPatterns(content: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /\.\.\/\.\.\/\.\.\//,  // Directory traversal
    /\/etc\/passwd/i,
    /\/bin\//i
  ];

  return maliciousPatterns.some(pattern => pattern.test(content));
}

// Generate robots.txt from template with customization
export function generateRobotsFromTemplate(
  template: RobotsTemplate, 
  customizations: {
    siteUrl?: string;
    additionalDisallows?: string[];
    crawlDelay?: number;
    blockAggressive?: boolean;
  } = {}
): string {
  let content = template.content;

  // Replace placeholder URL
  if (customizations.siteUrl) {
    content = content.replace(/https:\/\/yoursite\.com/g, customizations.siteUrl);
  }

  // Add additional disallow rules
  if (customizations.additionalDisallows && customizations.additionalDisallows.length > 0) {
    const userAgentMatch = content.match(/User-agent: \*/);
    if (userAgentMatch) {
      const insertIndex = content.indexOf('\n', content.indexOf('User-agent: *'));
      const additionalRules = customizations.additionalDisallows
        .map(path => `Disallow: ${path}`)
        .join('\n');
      content = content.slice(0, insertIndex + 1) + additionalRules + '\n' + content.slice(insertIndex + 1);
    }
  }

  // Adjust crawl delay
  if (customizations.crawlDelay !== undefined) {
    if (content.includes('Crawl-delay:')) {
      content = content.replace(/Crawl-delay: \d+/g, `Crawl-delay: ${customizations.crawlDelay}`);
    } else {
      // Add crawl delay after User-agent: *
      const userAgentMatch = content.match(/User-agent: \*/);
      if (userAgentMatch) {
        const insertIndex = content.indexOf('\n', content.indexOf('User-agent: *'));
        content = content.slice(0, insertIndex + 1) + `Crawl-delay: ${customizations.crawlDelay}\n` + content.slice(insertIndex + 1);
      }
    }
  }

  // Add aggressive crawler blocking
  if (customizations.blockAggressive && !content.includes('AhrefsBot')) {
    content += `\n# Block aggressive crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /`;
  }

  return content;
}

// Get template categories
export function getTemplateCategories(): string[] {
  const categories = new Set<string>();
  Object.values(ROBOTS_TEMPLATES).forEach(template => {
    categories.add(template.category);
  });
  return Array.from(categories).sort();
}

// Get templates by category
export function getTemplatesByCategory(category: string): RobotsTemplate[] {
  return Object.values(ROBOTS_TEMPLATES).filter(template => template.category === category);
}

// Search templates
export function searchTemplates(query: string): RobotsTemplate[] {
  const searchTerm = query.toLowerCase();
  return Object.values(ROBOTS_TEMPLATES).filter(template =>
    template.name.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

// Format robots.txt content for display
export function formatRobotsContent(content: string): string {
  return content
    .split('\n')
    .map(line => line.trimRight()) // Remove trailing spaces
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with double newlines
}

// Common robots.txt recommendations
export const ROBOTS_RECOMMENDATIONS = {
  BASIC: [
    'Include at least one User-agent directive',
    'Add Allow: / to permit crawling of your main content',
    'Use Disallow: /admin/ to protect admin areas',
    'Include Sitemap: directive with your sitemap URL',
  ],
  SECURITY: [
    'Block sensitive directories like /admin/, /private/, /internal/',
    'Prevent access to configuration files and scripts',
    'Consider blocking API endpoints if not needed for SEO',
    'Use specific User-agent blocks for aggressive crawlers',
  ],
  PERFORMANCE: [
    'Set appropriate Crawl-delay values (1-10 seconds typically)',
    'Consider blocking search and filter URLs to reduce server load',
    'Use specific rules for different crawler types',
    'Block unnecessary file types and temporary directories',
  ],
  SEO: [
    'Allow social media crawlers (Facebook, Twitter, LinkedIn)',
    'Include all relevant sitemap URLs',
    'Avoid blocking CSS and JavaScript files',
    'Use Allow: directives for important content within blocked sections',
  ]
};
