import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jsonData, type } = await request.json();

    if (!jsonData) {
      return NextResponse.json({ error: 'JSON data is required' }, { status: 400 });
    }

    // Parse JSON
    let parsedJson;
    try {
      parsedJson = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (error) {
      return NextResponse.json({
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: [],
        details: { parseError: error instanceof Error ? error.message : 'Unknown parse error' }
      });
    }

    // Validate the structured data
    const validationResult = validateStructuredData(parsedJson, type);

    return NextResponse.json(validationResult);

  } catch (error) {
    console.error('Error validating structured data:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}

function validateStructuredData(data: Record<string, any>, expectedType?: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, unknown>;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, unknown> = {};

  // Check required JSON-LD fields
  if (!data['@context']) {
    errors.push('Missing required @context property');
  } else if (!data['@context'].includes('schema.org')) {
    errors.push('@context should reference schema.org');
  }

  if (!data['@type']) {
    errors.push('Missing required @type property');
  } else {
    details.detectedType = data['@type'];
    
    // Check if type matches expected type
    if (expectedType && data['@type'] !== expectedType) {
      warnings.push(`Type mismatch: expected ${expectedType}, got ${data['@type']}`);
    }
  }

  // Type-specific validation
  if (data['@type']) {
    switch (data['@type']) {
      case 'Person':
        validatePerson(data, errors, warnings, details);
        break;
      case 'Organization':
        validateOrganization(data, errors, warnings, details);
        break;
      case 'WebSite':
        validateWebSite(data, errors, warnings, details);
        break;
      case 'BreadcrumbList':
        validateBreadcrumbList(data, errors, warnings, details);
        break;
      case 'JobPosting':
        validateJobPosting(data, errors, warnings, details);
        break;
      case 'Article':
        validateArticle(data, errors, warnings, details);
        break;
      case 'VideoObject':
        validateVideoObject(data, errors, warnings, details);
        break;
      case 'ImageObject':
        validateImageObject(data, errors, warnings, details);
        break;
      default:
        warnings.push(`Unknown or unsupported @type: ${data['@type']}`);
    }
  }

  // Security validation
  validateSecurity(data, errors, warnings);

  // General structure validation
  validateGeneralStructure(data, warnings, details);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details
  };
}

function validatePerson(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.name) {
    errors.push('Person schema requires a name property');
  }

  if (data.url && !isValidUrl(data.url)) {
    errors.push('Invalid URL format for person URL');
  }

  if (data.sameAs) {
    if (!Array.isArray(data.sameAs)) {
      warnings.push('sameAs property should be an array');
    } else {
      const invalidUrls = data.sameAs.filter((url: string) => !isValidUrl(url));
      if (invalidUrls.length > 0) {
        warnings.push(`Invalid URLs in sameAs: ${invalidUrls.join(', ')}`);
      }
    }
  }

  details.hasJobTitle = !!data.jobTitle;
  details.hasWorksFor = !!data.worksFor;
}

function validateOrganization(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.name) {
    errors.push('Organization schema requires a name property');
  }

  if (data.url && !isValidUrl(data.url)) {
    errors.push('Invalid URL format for organization URL');
  }

  if (data.logo && !isValidUrl(data.logo)) {
    warnings.push('Invalid URL format for organization logo');
  }

  details.hasLogo = !!data.logo;
}

function validateWebSite(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.name) {
    errors.push('WebSite schema requires a name property');
  }

  if (!data.url) {
    errors.push('WebSite schema requires a url property');
  } else if (!isValidUrl(data.url)) {
    errors.push('Invalid URL format for website URL');
  }

  details.hasSearchAction = !!(data.potentialAction && data.potentialAction['@type'] === 'SearchAction');
}

function validateBreadcrumbList(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.itemListElement) {
    errors.push('BreadcrumbList requires itemListElement property');
  } else if (!Array.isArray(data.itemListElement)) {
    errors.push('itemListElement must be an array');
  } else {
    data.itemListElement.forEach((item: any, index: number) => {
      if (!item['@type'] || item['@type'] !== 'ListItem') {
        errors.push(`Breadcrumb item ${index + 1} must have @type: ListItem`);
      }
      if (!item.position) {
        errors.push(`Breadcrumb item ${index + 1} must have a position`);
      }
      if (!item.name) {
        errors.push(`Breadcrumb item ${index + 1} must have a name`);
      }
    });
  }

  details.breadcrumbCount = Array.isArray(data.itemListElement) ? data.itemListElement.length : 0;
}

function validateJobPosting(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.title) {
    errors.push('JobPosting requires a title property');
  }

  if (!data.hiringOrganization) {
    errors.push('JobPosting requires hiringOrganization property');
  }

  if (!data.jobLocation) {
    warnings.push('JobPosting should include jobLocation for better SEO');
  }

  if (!data.datePosted) {
    warnings.push('JobPosting should include datePosted');
  }

  details.hasBaseSalary = !!data.baseSalary;
  details.employmentType = data.employmentType || 'Not specified';
}

function validateArticle(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.headline) {
    errors.push('Article requires a headline property');
  }

  if (!data.author) {
    warnings.push('Article should include author information');
  }

  if (!data.datePublished) {
    warnings.push('Article should include datePublished');
  }

  if (!data.publisher) {
    warnings.push('Article should include publisher information for rich snippets');
  }

  details.hasMainEntity = !!data.mainEntityOfPage;
}

function validateVideoObject(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.name) {
    errors.push('VideoObject requires a name property');
  }

  if (!data.contentUrl && !data.embedUrl) {
    errors.push('VideoObject requires either contentUrl or embedUrl');
  }

  if (!data.thumbnailUrl) {
    warnings.push('VideoObject should include thumbnailUrl for better display');
  }

  if (data.duration && !isValidDuration(data.duration)) {
    warnings.push('Duration should be in ISO 8601 format (e.g., PT5M30S)');
  }

  details.hasThumbnail = !!data.thumbnailUrl;
  details.hasDuration = !!data.duration;
}

function validateImageObject(data: Record<string, any>, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (!data.contentUrl) {
    errors.push('ImageObject requires a contentUrl property');
  } else if (!isValidUrl(data.contentUrl)) {
    errors.push('Invalid URL format for image contentUrl');
  }

  if (!data.license) {
    warnings.push('ImageObject should include license information');
  }

  details.hasLicense = !!data.license;
  details.hasCreator = !!data.creator;
}

function validateSecurity(data: Record<string, any>, errors: string[], warnings: string[]) {
  const jsonString = JSON.stringify(data);
  
  // Check for potential XSS
  if (jsonString.toLowerCase().includes('<script') || 
      jsonString.toLowerCase().includes('javascript:') ||
      jsonString.toLowerCase().includes('onclick') ||
      jsonString.toLowerCase().includes('onerror')) {
    errors.push('Potentially malicious content detected');
  }

  // Check for suspicious URLs
  const urls = extractUrls(jsonString);
  const suspiciousUrls = urls.filter(url => 
    url.includes('javascript:') || 
    url.includes('data:') ||
    url.includes('vbscript:')
  );

  if (suspiciousUrls.length > 0) {
    errors.push(`Suspicious URLs detected: ${suspiciousUrls.join(', ')}`);
  }
}

function validateGeneralStructure(data: Record<string, any>, warnings: string[], details: Record<string, unknown>) {
  // Check nesting depth (prevent overly complex structures)
  const depth = getObjectDepth(data);
  if (depth > 10) {
    warnings.push(`Very deep nesting detected (${depth} levels). Consider simplifying.`);
  }

  // Check for empty required fields
  const emptyFields = findEmptyFields(data);
  if (emptyFields.length > 0) {
    warnings.push(`Empty fields detected: ${emptyFields.join(', ')}`);
  }

  details.objectDepth = depth;
  details.totalProperties = countProperties(data);
}

// Helper functions
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function isValidDuration(duration: string): boolean {
  // Basic ISO 8601 duration validation (PT5M30S format)
  return /^PT(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?$/.test(duration);
}

function extractUrls(text: string): string[] {
  const urlRegex = /"(https?:\/\/[^"]+)"/g;
  const matches = [];
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function getObjectDepth(obj: any, depth = 0): number {
  if (typeof obj !== 'object' || obj === null) {
    return depth;
  }

  let maxDepth = depth;
  for (const value of Object.values(obj)) {
    const currentDepth = getObjectDepth(value, depth + 1);
    maxDepth = Math.max(maxDepth, currentDepth);
  }

  return maxDepth;
}

function findEmptyFields(obj: any, path = ''): string[] {
  const emptyFields: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === '' || value === null || value === undefined) {
      emptyFields.push(currentPath);
    } else if (typeof value === 'object' && value !== null) {
      emptyFields.push(...findEmptyFields(value, currentPath));
    }
  }

  return emptyFields;
}

function countProperties(obj: any): number {
  if (typeof obj !== 'object' || obj === null) {
    return 0;
  }

  let count = Object.keys(obj).length;
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      count += countProperties(value);
    }
  }

  return count;
}
