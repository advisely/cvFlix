// Schema.org Structured Data Utilities
// Advanced JSON-LD validation, templates, and processing

// Schema.org Types Registry
export const VALID_SCHEMA_TYPES = [
  'Person', 'Organization', 'WebSite', 'WebPage', 'Article', 'BlogPosting',
  'BreadcrumbList', 'FAQPage', 'JobPosting', 'Event', 'Course', 'Product',
  'Service', 'Recipe', 'Review', 'LocalBusiness', 'Restaurant', 'Book',
  'Movie', 'VideoObject', 'ImageObject', 'CreativeWork', 'Place',
  'PostalAddress', 'ContactPoint', 'SearchAction', 'ReadAction',
  'WatchAction', 'ListenAction', 'ViewAction', 'DownloadAction'
];

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  line?: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
  line?: number;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  isValid: boolean;
  score: number; // 0-100
}

// Template Processing Types
export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'url' | 'email' | 'array' | 'object' | 'date' | 'number' | 'tel';
  required: boolean;
  description: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: RegExp;
}

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  content: string;
  variables: TemplateVariable[];
  popularity: number;
}

// JSON-LD Data interface
interface JsonLDData {
  '@context'?: string;
  '@type'?: string;
  [key: string]: unknown;
}

// Required Properties for Different Schema Types
const REQUIRED_PROPERTIES: Record<string, string[]> = {
  Person: ['name'],
  Organization: ['name'],
  WebSite: ['name', 'url'],
  Article: ['headline', 'author'],
  BlogPosting: ['headline', 'author'],
  Event: ['name', 'startDate'],
  Product: ['name'],
  Recipe: ['name', 'recipeIngredient', 'recipeInstructions'],
  Review: ['itemReviewed', 'reviewRating', 'author'],
  LocalBusiness: ['name', 'address'],
  Job: ['title', 'hiringOrganization']
};

// URL validation patterns
const URL_PATTERNS = ['url', 'Url', 'sameAs', 'image', 'logo', 'photo'];

// Validation Functions
export const validateJsonLD = (jsonStr: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  try {
    const jsonData = JSON.parse(jsonStr) as JsonLDData;
    
    // Check required @context
    if (!jsonData['@context']) {
      errors.push({ 
        field: '@context', 
        message: '@context is required for JSON-LD',
        severity: 'error'
      });
    } else if (jsonData['@context'] !== 'https://schema.org') {
      warnings.push({
        field: '@context',
        message: 'Consider using https://schema.org as @context for better compatibility',
        severity: 'warning'
      });
    }
    
    // Check @type validity
    if (!jsonData['@type']) {
      errors.push({ 
        field: '@type', 
        message: '@type is required for structured data',
        severity: 'error'
      });
    } else if (typeof jsonData['@type'] === 'string' && !VALID_SCHEMA_TYPES.includes(jsonData['@type'])) {
      warnings.push({
        field: '@type',
        message: `${jsonData['@type']} may not be a recognized Schema.org type`,
        severity: 'warning'
      });
    }
    
    // Validate required properties for specific types
    const typeString = jsonData['@type'] as string;
    const requiredProps = REQUIRED_PROPERTIES[typeString] || [];
    requiredProps.forEach(prop => {
      const value = jsonData[prop];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors.push({
          field: prop,
          message: `${prop} is required for ${typeString} schema`,
          severity: 'error'
        });
      }
    });
    
    // Validate URL formats
    Object.entries(jsonData).forEach(([key, value]) => {
      if (typeof value === 'string' && URL_PATTERNS.some(pattern => key.includes(pattern))) {
        if (value && !isValidUrl(value)) {
          errors.push({
            field: key,
            message: `${key} must be a valid URL format`,
            severity: 'error'
          });
        }
      }
      
      // Check for arrays that should contain URLs (like sameAs)
      if (Array.isArray(value) && key === 'sameAs') {
        value.forEach((url, index) => {
          if (typeof url === 'string' && !isValidUrl(url)) {
            errors.push({
              field: `${key}[${index}]`,
              message: `Invalid URL in ${key} array`,
              severity: 'error'
            });
          }
        });
      }
    });
    
    // Check for common performance issues
    if (JSON.stringify(jsonData).length > 10000) {
      warnings.push({
        field: 'size',
        message: 'Large structured data may impact page load times',
        severity: 'warning'
      });
    }
    
    // Check for missing recommended properties
    checkRecommendedProperties(jsonData, warnings);
    
  } catch {
    errors.push({ 
      field: 'json', 
      message: 'Invalid JSON format - please check syntax',
      severity: 'error'
    });
  }
  
  const score = calculateStructuredDataScore(jsonStr, errors, warnings);
  
  return { 
    errors, 
    warnings, 
    isValid: errors.length === 0,
    score
  };
};

const checkRecommendedProperties = (jsonData: JsonLDData, warnings: ValidationWarning[]) => {
  const type = jsonData['@type'];
  
  switch (type) {
    case 'Person':
      if (!jsonData.image) warnings.push({ field: 'image', message: 'Adding an image improves rich snippet appearance', severity: 'warning' });
      if (!jsonData.url) warnings.push({ field: 'url', message: 'URL helps establish entity identity', severity: 'warning' });
      if (!jsonData.jobTitle) warnings.push({ field: 'jobTitle', message: 'Job title adds professional context', severity: 'warning' });
      break;
      
    case 'Organization':
      if (!jsonData.logo) warnings.push({ field: 'logo', message: 'Logo improves brand recognition in search results', severity: 'warning' });
      if (!jsonData.url) warnings.push({ field: 'url', message: 'Official website URL is recommended', severity: 'warning' });
      if (!jsonData.contactPoint) warnings.push({ field: 'contactPoint', message: 'Contact information helps users find you', severity: 'warning' });
      break;
      
    case 'WebSite':
      if (!jsonData.potentialAction) warnings.push({ field: 'potentialAction', message: 'Search action enables sitelinks searchbox', severity: 'warning' });
      if (!jsonData.description) warnings.push({ field: 'description', message: 'Description helps search engines understand your site', severity: 'warning' });
      break;
  }
};

const calculateStructuredDataScore = (jsonStr: string, errors: ValidationError[], warnings: ValidationWarning[]): number => {
  let score = 100;
  
  // Deduct for errors (major issues)
  score -= errors.length * 20;
  
  // Deduct for warnings (minor issues)
  score -= warnings.length * 5;
  
  // Bonus for good practices
  try {
    const jsonData = JSON.parse(jsonStr) as JsonLDData;
    
    // Bonus for having image
    if (jsonData.image) score += 5;
    
    // Bonus for structured contact info
    if (jsonData.contactPoint || jsonData.address) score += 5;
    
    // Bonus for social media links
    if (jsonData.sameAs && Array.isArray(jsonData.sameAs) && jsonData.sameAs.length > 0) {
      score += 5;
    }
    
    // Bonus for rich descriptions
    if (typeof jsonData.description === 'string' && jsonData.description.length > 50) score += 5;
    
  } catch {
    // Already handled in validation
  }
  
  return Math.max(0, Math.min(100, score));
};

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Template Processing Functions
export const processTemplate = (template: string, variables: Record<string, unknown>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    
    if (value === undefined || value === '' || value === null) {
      return match; // Keep placeholder if no value
    }
    
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Escape quotes in string values
    if (typeof value === 'string') {
      return value.replace(/"/g, '\\"');
    }
    
    return String(value);
  });
};

export const extractTemplateVariables = (template: string): TemplateVariable[] => {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  const uniqueKeys = [...new Set(matches.map(match => match.replace(/\{\{|\}\}/g, '')))];
  
  return uniqueKeys.map(key => ({
    key,
    label: formatVariableLabel(key),
    type: inferVariableType(key),
    required: isRequiredVariable(key),
    description: generateDescription(key),
    placeholder: generatePlaceholder(key)
  }));
};

const formatVariableLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Url/g, 'URL')
    .replace(/Id/g, 'ID');
};

const inferVariableType = (key: string): TemplateVariable['type'] => {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('url') || lowerKey.includes('website')) return 'url';
  if (lowerKey.includes('email')) return 'email';
  if (lowerKey.includes('phone') || lowerKey.includes('tel')) return 'tel';
  if (lowerKey.includes('date')) return 'date';
  if (lowerKey.includes('array') || lowerKey.includes('skills') || lowerKey.includes('social')) return 'array';
  if (lowerKey.includes('address') || lowerKey.includes('contact')) return 'object';
  if (lowerKey.includes('price') || lowerKey.includes('duration') || lowerKey.includes('rating')) return 'number';
  
  return 'text';
};

const isRequiredVariable = (key: string): boolean => {
  const requiredFields = ['name', 'title', 'headline', 'sitename'];
  return requiredFields.some(field => key.toLowerCase().includes(field));
};

const generateDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    fullName: 'Your complete name as it should appear in search results',
    jobTitle: 'Your current job title or professional role',
    companyName: 'Name of the company or organization you work for',
    websiteUrl: 'Your personal or professional website URL',
    profileImageUrl: 'URL to your professional profile photo',
    linkedInUrl: 'Your LinkedIn profile URL',
    twitterUrl: 'Your Twitter profile URL',
    githubUrl: 'Your GitHub profile URL',
    emailAddress: 'Your professional email address',
    phoneNumber: 'Your contact phone number',
    skillsArray: 'Array of your professional skills (e.g., ["JavaScript", "React", "Node.js"])',
    professionalSummary: 'Brief description of your professional background',
    organizationName: 'Official name of your organization',
    organizationDescription: 'Description of what your organization does',
    streetAddress: 'Street address of your organization',
    city: 'City where your organization is located',
    state: 'State or region of your organization',
    postalCode: 'Postal/ZIP code of your organization',
    country: 'Country where your organization is located',
    siteName: 'Name of your website or platform',
    siteUrl: 'Main URL of your website',
    siteDescription: 'Description of your website or platform',
    searchUrl: 'URL template for site search functionality',
    authorName: 'Name of the content author'
  };
  
  return descriptions[key] || `Enter the ${formatVariableLabel(key).toLowerCase()}`;
};

const generatePlaceholder = (key: string): string => {
  const placeholders: Record<string, string> = {
    fullName: 'John Doe',
    jobTitle: 'Senior Software Developer',
    companyName: 'Tech Innovations Inc.',
    websiteUrl: 'https://johndoe.com',
    profileImageUrl: 'https://johndoe.com/profile.jpg',
    linkedInUrl: 'https://linkedin.com/in/johndoe',
    twitterUrl: 'https://twitter.com/johndoe',
    githubUrl: 'https://github.com/johndoe',
    emailAddress: 'john.doe@example.com',
    phoneNumber: '+1-555-123-4567',
    skillsArray: '["JavaScript", "React", "Node.js"]',
    professionalSummary: 'Experienced software developer with expertise in web technologies',
    organizationName: 'Your Company Name',
    organizationDescription: 'Description of your company\'s services and mission',
    streetAddress: '123 Business Ave',
    city: 'San Francisco',
    state: 'California',
    postalCode: '94102',
    country: 'United States',
    siteName: 'My Portfolio',
    siteUrl: 'https://myportfolio.com',
    siteDescription: 'Professional portfolio showcasing my work and experience',
    searchUrl: 'https://myportfolio.com/search',
    authorName: 'John Doe'
  };
  
  return placeholders[key] || `Enter ${key}`;
};

// Pre-built Schema Templates
export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    id: 'person-professional',
    name: 'Professional Person',
    description: 'Complete professional profile with job details, education, and social links',
    type: 'Person',
    category: 'Professional',
    popularity: 95,
    content: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "{{fullName}}",
      "jobTitle": "{{jobTitle}}",
      "worksFor": {
        "@type": "Organization",
        "name": "{{companyName}}"
      },
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "{{university}}"
      },
      "url": "{{websiteUrl}}",
      "image": "{{profileImageUrl}}",
      "email": "{{emailAddress}}",
      "telephone": "{{phoneNumber}}",
      "sameAs": [
        "{{linkedInUrl}}",
        "{{twitterUrl}}",
        "{{githubUrl}}"
      ],
      "knowsAbout": "{{skillsArray}}",
      "description": "{{professionalSummary}}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "{{city}}",
        "addressRegion": "{{state}}",
        "addressCountry": "{{country}}"
      }
    }, null, 2),
    variables: []
  },
  {
    id: 'organization-company',
    name: 'Organization/Company',
    description: 'Complete company profile with contact information and social presence',
    type: 'Organization',
    category: 'Business',
    popularity: 85,
    content: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "{{organizationName}}",
      "url": "{{websiteUrl}}",
      "logo": "{{logoUrl}}",
      "description": "{{organizationDescription}}",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "{{phoneNumber}}",
        "contactType": "customer service",
        "email": "{{emailAddress}}"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "{{streetAddress}}",
        "addressLocality": "{{city}}",
        "addressRegion": "{{state}}",
        "postalCode": "{{postalCode}}",
        "addressCountry": "{{country}}"
      },
      "sameAs": "{{socialMediaUrls}}"
    }, null, 2),
    variables: []
  },
  {
    id: 'website-portfolio',
    name: 'Website with Search',
    description: 'Website schema with search functionality and author information',
    type: 'WebSite',
    category: 'Website',
    popularity: 80,
    content: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "{{siteName}}",
      "url": "{{siteUrl}}",
      "description": "{{siteDescription}}",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "{{searchUrl}}?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "author": {
        "@type": "Person",
        "name": "{{authorName}}"
      }
    }, null, 2),
    variables: []
  }
];

// Initialize template variables for each template
SCHEMA_TEMPLATES.forEach(template => {
  template.variables = extractTemplateVariables(template.content);
});

export const getSchemaTemplatesByCategory = (category?: string): SchemaTemplate[] => {
  if (!category) return SCHEMA_TEMPLATES;
  return SCHEMA_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (id: string): SchemaTemplate | undefined => {
  return SCHEMA_TEMPLATES.find(template => template.id === id);
};

export const getPopularTemplates = (limit: number = 5): SchemaTemplate[] => {
  return SCHEMA_TEMPLATES
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
};

// Rich Results Preview Data
interface PreviewData {
  type: string;
  name?: string;
  [key: string]: unknown;
}

export const generateRichResultsPreview = (jsonData: JsonLDData): PreviewData => {
  const type = jsonData['@type'] as string;
  
  switch (type) {
    case 'Person':
      return generatePersonPreview(jsonData);
    case 'Organization':
      return generateOrganizationPreview(jsonData);
    case 'WebSite':
      return generateWebsitePreview(jsonData);
    default:
      return generateGenericPreview(jsonData);
  }
};

const generatePersonPreview = (data: JsonLDData): PreviewData => ({
  type: 'Person',
  name: data.name as string,
  jobTitle: data.jobTitle as string,
  company: (data.worksFor as { name?: string })?.name,
  image: data.image as string,
  description: data.description as string,
  url: data.url as string,
  social: data.sameAs as string[] || []
});

const generateOrganizationPreview = (data: JsonLDData): PreviewData => ({
  type: 'Organization',
  name: data.name as string,
  description: data.description as string,
  logo: data.logo as string,
  url: data.url as string,
  contact: (data.contactPoint as { telephone?: string })?.telephone,
  address: data.address
});

const generateWebsitePreview = (data: JsonLDData): PreviewData => ({
  type: 'WebSite',
  name: data.name as string,
  url: data.url as string,
  description: data.description as string,
  hasSearch: !!data.potentialAction,
  author: (data.author as { name?: string })?.name
});

const generateGenericPreview = (data: JsonLDData): PreviewData => ({
  type: data['@type'] as string,
  name: (data.name || data.headline || data.title || 'Untitled') as string,
  description: data.description as string,
  url: data.url as string,
  image: (data.image || data.logo) as string
});
