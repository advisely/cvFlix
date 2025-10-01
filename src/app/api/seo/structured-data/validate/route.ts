import { NextRequest, NextResponse } from 'next/server'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
type JsonObject = { [key: string]: JsonValue }

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isJsonArray = (value: JsonValue | undefined): value is JsonValue[] => Array.isArray(value)

export async function POST(request: NextRequest) {
  try {
    const { jsonData, type } = await request.json()

    if (!jsonData) {
      return NextResponse.json({ error: 'JSON data is required' }, { status: 400 })
    }

    // Parse JSON
    let parsedJson: unknown
    try {
      parsedJson = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    } catch (error) {
      return NextResponse.json({
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: [],
        details: { parseError: error instanceof Error ? error.message : 'Unknown parse error' },
      })
    }

    if (!isJsonObject(parsedJson)) {
      return NextResponse.json({
        isValid: false,
        errors: ['Structured data must be a JSON object'],
        warnings: [],
        details: {},
      })
    }

    // Validate the structured data
    const validationResult = validateStructuredData(parsedJson, typeof type === 'string' ? type : undefined)

    return NextResponse.json(validationResult)
  } catch (error) {
    console.error('Error validating structured data:', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}

function validateStructuredData(data: JsonObject, expectedType?: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, unknown>;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, unknown> = {};

  // Check required JSON-LD fields
  const context = data['@context'];
  if (typeof context !== 'string') {
    errors.push('Missing required @context property');
  } else if (!context.includes('schema.org')) {
    errors.push('@context should reference schema.org');
  }

  const typeValue = data['@type'];
  if (typeof typeValue !== 'string' || typeValue.length === 0) {
    errors.push('Missing required @type property');
  } else {
    details.detectedType = typeValue;
    
    // Check if type matches expected type
    if (expectedType && typeValue !== expectedType) {
      warnings.push(`Type mismatch: expected ${expectedType}, got ${typeValue}`);
    }
  }

  // Type-specific validation
  if (typeof typeValue === 'string') {
    switch (typeValue) {
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
        warnings.push(`Unknown or unsupported @type: ${typeValue}`);
    }
  }

  // Security validation
  validateSecurity(data, errors);

  // General structure validation
  validateGeneralStructure(data, warnings, details);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details
  };
}

function validatePerson(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('Person schema requires a name property');
  }

  if (typeof data.url === 'string' && !isValidUrl(data.url)) {
    errors.push('Invalid URL format for person URL');
  }

  if (data.sameAs !== undefined) {
    if (!isJsonArray(data.sameAs)) {
      warnings.push('sameAs property should be an array');
    } else {
      const invalidUrls = data.sameAs.reduce<string[]>((accumulator, entry) => {
        if (typeof entry === 'string' && !isValidUrl(entry)) {
          accumulator.push(entry);
        } else if (typeof entry !== 'string') {
          warnings.push('sameAs entries should be strings');
        }
        return accumulator;
      }, []);
      if (invalidUrls.length > 0) {
        warnings.push(`Invalid URLs in sameAs: ${invalidUrls.join(', ')}`);
      }
    }
  }

  details.hasJobTitle = typeof data.jobTitle === 'string';
  details.hasWorksFor = data.worksFor !== undefined;
}

function validateOrganization(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('Organization schema requires a name property');
  }

  if (typeof data.url === 'string' && !isValidUrl(data.url)) {
    errors.push('Invalid URL format for organization URL');
  }

  if (typeof data.logo === 'string' && !isValidUrl(data.logo)) {
    warnings.push('Invalid URL format for organization logo');
  }

  details.hasLogo = typeof data.logo === 'string';
}

function validateWebSite(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('WebSite schema requires a name property');
  }

  if (typeof data.url !== 'string') {
    errors.push('WebSite schema requires a url property');
  } else if (!isValidUrl(data.url)) {
    errors.push('Invalid URL format for website URL');
  }

  const potentialAction = data.potentialAction;
  details.hasSearchAction = isJsonObject(potentialAction) && potentialAction['@type'] === 'SearchAction';
}

function validateBreadcrumbList(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  const itemListElement = data.itemListElement;
  if (itemListElement === undefined) {
    errors.push('BreadcrumbList requires itemListElement property');
  } else if (!isJsonArray(itemListElement)) {
    errors.push('itemListElement must be an array');
  } else {
    itemListElement.forEach((item, index) => {
      if (!isJsonObject(item)) {
        errors.push(`Breadcrumb item ${index + 1} must be an object`);
        return;
      }
      if (item['@type'] !== 'ListItem') {
        errors.push(`Breadcrumb item ${index + 1} must have @type: ListItem`);
      }
      if (item.position === undefined) {
        errors.push(`Breadcrumb item ${index + 1} must have a position`);
      }
      if (typeof item.name !== 'string' || item.name.length === 0) {
        errors.push(`Breadcrumb item ${index + 1} must have a name`);
      }
    });
  }

  details.breadcrumbCount = Array.isArray(itemListElement) ? itemListElement.length : 0;
}

function validateJobPosting(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.title !== 'string' || data.title.length === 0) {
    errors.push('JobPosting requires a title property');
  }

  if (!isJsonObject(data.hiringOrganization)) {
    errors.push('JobPosting requires hiringOrganization property');
  }

  if (data.jobLocation === undefined) {
    warnings.push('JobPosting should include jobLocation for better SEO');
  }

  if (data.datePosted === undefined) {
    warnings.push('JobPosting should include datePosted');
  }

  details.hasBaseSalary = data.baseSalary !== undefined;
  details.employmentType = typeof data.employmentType === 'string' ? data.employmentType : 'Not specified';
}

function validateArticle(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.headline !== 'string' || data.headline.length === 0) {
    errors.push('Article requires a headline property');
  }

  if (data.author === undefined) {
    warnings.push('Article should include author information');
  }

  if (data.datePublished === undefined) {
    warnings.push('Article should include datePublished');
  }

  if (data.publisher === undefined) {
    warnings.push('Article should include publisher information for rich snippets');
  }

  details.hasMainEntity = data.mainEntityOfPage !== undefined;
}

function validateVideoObject(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('VideoObject requires a name property');
  }

  if (data.contentUrl === undefined && data.embedUrl === undefined) {
    errors.push('VideoObject requires either contentUrl or embedUrl');
  }

  if (data.thumbnailUrl === undefined) {
    warnings.push('VideoObject should include thumbnailUrl for better display');
  }

  if (data.duration !== undefined) {
    if (typeof data.duration !== 'string') {
      warnings.push('Duration should be provided as a string in ISO 8601 format (e.g., PT5M30S)');
    } else if (!isValidDuration(data.duration)) {
      warnings.push('Duration should be in ISO 8601 format (e.g., PT5M30S)');
    }
  }

  details.hasThumbnail = data.thumbnailUrl !== undefined;
  details.hasDuration = data.duration !== undefined;
}

function validateImageObject(data: JsonObject, errors: string[], warnings: string[], details: Record<string, unknown>) {
  if (typeof data.contentUrl !== 'string' || data.contentUrl.length === 0) {
    errors.push('ImageObject requires a contentUrl property');
  } else if (!isValidUrl(data.contentUrl)) {
    errors.push('Invalid URL format for image contentUrl');
  }

  if (data.license === undefined) {
    warnings.push('ImageObject should include license information');
  }

  details.hasLicense = data.license !== undefined;
  details.hasCreator = data.creator !== undefined;
}

function validateSecurity(data: JsonObject, errors: string[]) {
  const jsonString = JSON.stringify(data);

  // Check for potential XSS
  const lowerJson = jsonString.toLowerCase();
  if (
    lowerJson.includes('<script') ||
    lowerJson.includes('javascript:') ||
    lowerJson.includes('onclick') ||
    lowerJson.includes('onerror')
  ) {
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

function validateGeneralStructure(data: JsonObject, warnings: string[], details: Record<string, unknown>) {
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
  const urlRegex = /"(https?:\/\/[^\"]+)"/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function getObjectDepth(value: JsonValue, depth = 0): number {
  if (isJsonArray(value)) {
    return value.reduce<number>((maxDepth, item) => {
      const nextDepth = getObjectDepth(item, depth + 1)
      return Math.max(maxDepth, nextDepth)
    }, depth);
  }

  if (!isJsonObject(value)) {
    return depth;
  }

  let maxDepth = depth;
  for (const nested of Object.values(value)) {
    const currentDepth = getObjectDepth(nested, depth + 1);
    maxDepth = Math.max(maxDepth, currentDepth);
  }

  return maxDepth;
}

function findEmptyFields(value: JsonValue, path = ''): string[] {
  const emptyFields: string[] = [];

  if (isJsonArray(value)) {
    value.forEach((item, index) => {
      const currentPath = `${path}[${index}]`;
      emptyFields.push(...findEmptyFields(item, currentPath));
    });
    return emptyFields;
  }

  if (!isJsonObject(value)) {
    if (value === '' || value === null) {
      emptyFields.push(path);
    }
    return emptyFields;
  }

  for (const [key, nested] of Object.entries(value)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (nested === '' || nested === null) {
      emptyFields.push(currentPath);
    } else {
      emptyFields.push(...findEmptyFields(nested, currentPath));
    }
  }

  return emptyFields;
}

function countProperties(value: JsonValue): number {
  if (isJsonArray(value)) {
    let total = 0
    for (const item of value) {
      total += countProperties(item)
    }
    return total
  }

  if (!isJsonObject(value)) {
    return 0;
  }

  let total = Object.keys(value).length
  for (const nested of Object.values(value) as JsonValue[]) {
    total += countProperties(nested)
  }
  return total
}
