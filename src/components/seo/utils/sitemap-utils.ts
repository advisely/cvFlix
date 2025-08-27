
export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
  alternates?: SitemapAlternate[]; // For hreflang
}

export interface SitemapImage {
  loc: string;
  caption?: string;
  title?: string;
}

export interface SitemapVideo {
  loc: string;
  thumbnail_loc: string;
  title: string;
  description?: string;
  duration?: number;
}

export interface SitemapAlternate {
  hreflang: string;
  href: string;
}

export interface SitemapSettings {
  maxUrls: number;
  includeImages: boolean;
  includeVideos: boolean;
  includeAlternates: boolean;
  excludePatterns: string[];
  defaultPriority: number;
  defaultChangeFreq: SitemapEntry['changefreq'];
  cacheDuration: number; // in minutes
  autoGenerate: boolean;
}

export interface ValidationError {
  message: string;
  type: 'syntax' | 'url' | 'size' | 'structure';
  line?: number;
}

export interface ValidationWarning {
  message: string;
  type: 'performance' | 'best-practice' | 'accessibility';
  line?: number;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  isValid: boolean;
  urlCount?: number;
  fileSize?: number;
}

export interface PageDiscoveryResult {
  staticPages: SitemapEntry[];
  dynamicPages: SitemapEntry[];
  mediaPages: SitemapEntry[];
  totalCount: number;
}

/**
 * Generate XML sitemap from entries
 */
export const generateSitemapXML = (entries: SitemapEntry[]): string => {
  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const urlElements = entries.map(entry => {
    let urlElement = '  <url>\n';
    urlElement += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    
    if (entry.lastmod) {
      urlElement += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    
    if (entry.changefreq) {
      urlElement += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    
    if (entry.priority !== undefined) {
      urlElement += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }

    // Add image entries
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(img => {
        urlElement += `    <image:image>\n`;
        urlElement += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
        if (img.caption) {
          urlElement += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        }
        if (img.title) {
          urlElement += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        }
        urlElement += `    </image:image>\n`;
      });
    }

    // Add video entries
    if (entry.videos && entry.videos.length > 0) {
      entry.videos.forEach(video => {
        urlElement += `    <video:video>\n`;
        urlElement += `      <video:thumbnail_loc>${escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>\n`;
        urlElement += `      <video:title>${escapeXml(video.title)}</video:title>\n`;
        if (video.description) {
          urlElement += `      <video:description>${escapeXml(video.description)}</video:description>\n`;
        }
        urlElement += `      <video:content_loc>${escapeXml(video.loc)}</video:content_loc>\n`;
        if (video.duration) {
          urlElement += `      <video:duration>${video.duration}</video:duration>\n`;
        }
        urlElement += `    </video:video>\n`;
      });
    }

    // Add alternate language entries
    if (entry.alternates && entry.alternates.length > 0) {
      entry.alternates.forEach(alt => {
        urlElement += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />\n`;
      });
    }
    
    urlElement += '  </url>\n';
    return urlElement;
  }).join('');

  const namespaces = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"',
    'xmlns:xhtml="http://www.w3.org/1999/xhtml"'
  ].join('\n        ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${namespaces}>
${urlElements}</urlset>`;
};

/**
 * Discover all pages from the site
 */
export const discoverSitePages = async (baseUrl: string = ''): Promise<PageDiscoveryResult> => {
  try {
    // Static pages with their priorities and change frequencies
    const staticPages: SitemapEntry[] = [
      {
        loc: `${baseUrl}/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        loc: `${baseUrl}/experiences`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: `${baseUrl}/education`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${baseUrl}/skills`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${baseUrl}/certifications`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.7
      }
    ];

    // Fetch dynamic pages from database
    const dynamicPages: SitemapEntry[] = [];
    
    try {
      // Get experiences data
      const experiencesResponse = await fetch('/api/experiences');
      if (experiencesResponse.ok) {
        const experiences = await experiencesResponse.json();
        experiences.forEach((exp: { id: string; updatedAt?: string; createdAt: string }) => {
          dynamicPages.push({
            loc: `${baseUrl}/experiences/${exp.id}`,
            lastmod: new Date(exp.updatedAt || exp.createdAt).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6
          });
        });
      }

      // Get education data
      const educationResponse = await fetch('/api/education');
      if (educationResponse.ok) {
        const education = await educationResponse.json();
        education.forEach((edu: { id: string; updatedAt?: string; createdAt: string }) => {
          dynamicPages.push({
            loc: `${baseUrl}/education/${edu.id}`,
            lastmod: new Date(edu.updatedAt || edu.createdAt).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.5
          });
        });
      }

      // Get companies data
      const companiesResponse = await fetch('/api/companies');
      if (companiesResponse.ok) {
        const companies = await companiesResponse.json();
        companies.forEach((company: { id: string; updatedAt?: string; createdAt: string }) => {
          dynamicPages.push({
            loc: `${baseUrl}/companies/${company.id}`,
            lastmod: new Date(company.updatedAt || company.createdAt).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.5
          });
        });
      }

      // Get highlights data  
      const highlightsResponse = await fetch('/api/highlights');
      if (highlightsResponse.ok) {
        const highlights = await highlightsResponse.json();
        highlights.forEach((highlight: { id: string; updatedAt?: string; createdAt: string }) => {
          dynamicPages.push({
            loc: `${baseUrl}/highlights/${highlight.id}`,
            lastmod: new Date(highlight.updatedAt || highlight.createdAt).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.6
          });
        });
      }
    } catch (error) {
      console.warn('Could not fetch dynamic pages for sitemap:', error);
    }

    const mediaPages: SitemapEntry[] = [];
    // Note: Media pages are typically not directly accessible
    // but we could add gallery pages if they exist

    return {
      staticPages,
      dynamicPages,
      mediaPages,
      totalCount: staticPages.length + dynamicPages.length + mediaPages.length
    };
  } catch (error) {
    console.error('Error discovering site pages:', error);
    return {
      staticPages: [],
      dynamicPages: [],
      mediaPages: [],
      totalCount: 0
    };
  }
};

/**
 * Validate sitemap XML content
 */
export const validateSitemap = (xml: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    // Basic XML validation
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    if (doc.querySelector('parsererror')) {
      errors.push({ 
        message: 'Invalid XML structure - please check syntax', 
        type: 'syntax' 
      });
      return { errors, warnings, isValid: false };
    }

    // Check for required elements
    const urlset = doc.querySelector('urlset');
    if (!urlset) {
      errors.push({ 
        message: 'Missing required <urlset> root element', 
        type: 'structure' 
      });
      return { errors, warnings, isValid: false };
    }

    // Validate namespace
    if (!urlset.getAttribute('xmlns')?.includes('sitemaps.org')) {
      warnings.push({ 
        message: 'Missing or incorrect sitemap namespace', 
        type: 'best-practice' 
      });
    }

    // Validate URLs
    const urls = doc.querySelectorAll('url');
    let urlCount = 0;
    
    urls.forEach((urlElement, index) => {
      urlCount++;
      const locElement = urlElement.querySelector('loc');
      
      if (!locElement || !locElement.textContent) {
        errors.push({ 
          message: `URL entry ${index + 1} is missing <loc> element`, 
          type: 'structure',
          line: index + 1
        });
        return;
      }

      const url = locElement.textContent.trim();
      
      // Validate URL format
      try {
        new URL(url);
      } catch {
        errors.push({ 
          message: `Invalid URL format at entry ${index + 1}: ${url}`, 
          type: 'url',
          line: index + 1
        });
      }

      // Check URL length
      if (url.length > 2048) {
        warnings.push({ 
          message: `URL at entry ${index + 1} is very long (${url.length} characters)`, 
          type: 'best-practice',
          line: index + 1
        });
      }

      // Validate priority
      const priorityElement = urlElement.querySelector('priority');
      if (priorityElement) {
        const priority = parseFloat(priorityElement.textContent || '');
        if (isNaN(priority) || priority < 0 || priority > 1) {
          errors.push({ 
            message: `Invalid priority value at entry ${index + 1}: ${priorityElement.textContent}`, 
            type: 'structure',
            line: index + 1
          });
        }
      }

      // Validate changefreq
      const changefreqElement = urlElement.querySelector('changefreq');
      if (changefreqElement) {
        const validFreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        if (!validFreq.includes(changefreqElement.textContent || '')) {
          errors.push({ 
            message: `Invalid changefreq value at entry ${index + 1}: ${changefreqElement.textContent}`, 
            type: 'structure',
            line: index + 1
          });
        }
      }
    });

    // Check sitemap size limits
    if (urlCount > 50000) {
      errors.push({ 
        message: `Sitemap exceeds 50,000 URL limit (${urlCount} URLs)`, 
        type: 'size' 
      });
    }

    if (urlCount > 40000) {
      warnings.push({ 
        message: `Sitemap is getting large (${urlCount} URLs) - consider splitting into multiple sitemaps`, 
        type: 'performance' 
      });
    }

    // Check file size (approximate)
    const fileSize = new Blob([xml]).size;
    if (fileSize > 50 * 1024 * 1024) { // 50MB
      errors.push({ 
        message: `Sitemap exceeds 50MB size limit (${(fileSize / 1024 / 1024).toFixed(1)}MB)`, 
        type: 'size' 
      });
    }

    if (fileSize > 40 * 1024 * 1024) { // 40MB warning
      warnings.push({ 
        message: `Sitemap is getting large (${(fileSize / 1024 / 1024).toFixed(1)}MB)`, 
        type: 'performance' 
      });
    }

    return { 
      errors, 
      warnings, 
      isValid: errors.length === 0,
      urlCount,
      fileSize 
    };

  } catch (error) {
    errors.push({ 
      message: `Failed to parse XML: ${error}`, 
      type: 'syntax' 
    });
    return { errors, warnings, isValid: false };
  }
};

/**
 * Check URL status (for URL validation)
 */
export const checkUrlStatus = async (url: string): Promise<{
  status: number;
  statusText: string;
  accessible: boolean;
  responseTime: number;
}> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      accessible: response.ok,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error instanceof Error ? error.message : 'Unknown error',
      accessible: false,
      responseTime: Date.now() - startTime
    };
  }
};

/**
 * Filter URLs based on patterns
 */
export const filterUrlsByPattern = (
  entries: SitemapEntry[], 
  excludePatterns: string[]
): SitemapEntry[] => {
  if (!excludePatterns.length) return entries;
  
  return entries.filter(entry => {
    return !excludePatterns.some(pattern => {
      try {
        const regex = new RegExp(pattern);
        return regex.test(entry.loc);
      } catch {
        // If regex is invalid, treat as literal string
        return entry.loc.includes(pattern);
      }
    });
  });
};

/**
 * Sort sitemap entries
 */
export const sortSitemapEntries = (
  entries: SitemapEntry[], 
  sortBy: 'priority' | 'lastmod' | 'url' | 'changefreq' = 'priority',
  direction: 'asc' | 'desc' = 'desc'
): SitemapEntry[] => {
  return [...entries].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'priority':
        comparison = (a.priority || 0) - (b.priority || 0);
        break;
      case 'lastmod':
        comparison = new Date(a.lastmod).getTime() - new Date(b.lastmod).getTime();
        break;
      case 'url':
        comparison = a.loc.localeCompare(b.loc);
        break;
      case 'changefreq':
        const freqOrder = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        comparison = freqOrder.indexOf(a.changefreq) - freqOrder.indexOf(b.changefreq);
        break;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Generate sitemap index for multiple sitemaps
 */
export const generateSitemapIndex = (sitemaps: { loc: string; lastmod: string }[]): string => {
  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const sitemapElements = sitemaps.map(sitemap => `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
};

/**
 * Default sitemap settings
 */
export const getDefaultSitemapSettings = (): SitemapSettings => ({
  maxUrls: 50000,
  includeImages: false,
  includeVideos: false,
  includeAlternates: false,
  excludePatterns: ['/boss/', '/api/', '/admin/'],
  defaultPriority: 0.5,
  defaultChangeFreq: 'weekly',
  cacheDuration: 60, // 1 hour
  autoGenerate: false
});