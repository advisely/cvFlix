// SEO Management System Types
// Following established patterns from highlights/types.ts

export interface SEOConfig {
  id: string;
  siteName: string;
  siteNameFr: string;
  defaultTitle: string;
  defaultTitleFr: string;
  defaultDescription: string;
  defaultDescriptionFr: string;
  defaultKeywords: string;
  defaultKeywordsFr: string;
  canonicalUrl: string;
  robotsContent: string;
  faviconUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SEOMetaTag {
  id: string;
  page: string; // '/boss', '/experiences', '/', etc.
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  keywords?: string | null;
  keywordsFr?: string | null;
  ogTitle?: string | null;
  ogTitleFr?: string | null;
  ogDescription?: string | null;
  ogDescriptionFr?: string | null;
  ogImage?: string | null;
  ogType?: string | null; // 'website', 'article', 'profile', etc.
  ogUrl?: string | null;
  ogSiteName?: string | null;
  ogLocale?: string | null;
  ogImageAlt?: string | null;
  ogImageWidth?: string | null;
  ogImageHeight?: string | null;
  ogUpdatedTime?: string | null;
  // Article-specific OpenGraph
  articleAuthor?: string | null;
  articlePublishedTime?: string | null;
  articleModifiedTime?: string | null;
  articleSection?: string | null;
  articleTag?: string | null; // JSON array as string
  // Profile-specific OpenGraph
  profileFirstName?: string | null;
  profileLastName?: string | null;
  profileUsername?: string | null;
  profileGender?: string | null;
  // Twitter Card properties
  twitterCard?: string | null; // 'summary', 'summary_large_image', 'app', 'player'
  twitterSite?: string | null; // @username
  twitterCreator?: string | null; // @username
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterImageAlt?: string | null;
  // App Card properties
  twitterAppNameIphone?: string | null;
  twitterAppIdIphone?: string | null;
  twitterAppUrlIphone?: string | null;
  twitterAppNameGoogleplay?: string | null;
  twitterAppIdGoogleplay?: string | null;
  twitterAppUrlGoogleplay?: string | null;
  // Player Card properties
  twitterPlayer?: string | null;
  twitterPlayerWidth?: string | null;
  twitterPlayerHeight?: string | null;
  twitterPlayerStream?: string | null;
  twitterPlayerStreamContentType?: string | null;
  canonicalUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StructuredData {
  id: string;
  type: 'Person' | 'Organization' | 'WebSite' | 'BreadcrumbList' | string;
  page: string; // Which page this applies to
  jsonData: string; // JSON-LD structured data as string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface SEOConfigCreateRequest {
  siteName: string;
  siteNameFr: string;
  defaultTitle: string;
  defaultTitleFr: string;
  defaultDescription: string;
  defaultDescriptionFr: string;
  defaultKeywords: string;
  defaultKeywordsFr: string;
  canonicalUrl: string;
  robotsContent?: string;
  faviconUrl?: string;
}

export type SEOConfigUpdateRequest = Partial<SEOConfigCreateRequest>;

export interface SEOMetaTagCreateRequest {
  page: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  keywords?: string;
  keywordsFr?: string;
  ogTitle?: string;
  ogTitleFr?: string;
  ogDescription?: string;
  ogDescriptionFr?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;
  ogImageAlt?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogUpdatedTime?: string;
  // Article-specific OpenGraph
  articleAuthor?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTag?: string;
  // Profile-specific OpenGraph
  profileFirstName?: string;
  profileLastName?: string;
  profileUsername?: string;
  profileGender?: string;
  // Twitter Card properties
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  // App Card properties
  twitterAppNameIphone?: string;
  twitterAppIdIphone?: string;
  twitterAppUrlIphone?: string;
  twitterAppNameGoogleplay?: string;
  twitterAppIdGoogleplay?: string;
  twitterAppUrlGoogleplay?: string;
  // Player Card properties
  twitterPlayer?: string;
  twitterPlayerWidth?: string;
  twitterPlayerHeight?: string;
  twitterPlayerStream?: string;
  twitterPlayerStreamContentType?: string;
  canonicalUrl?: string;
}

export type SEOMetaTagUpdateRequest = Partial<SEOMetaTagCreateRequest>;

export interface StructuredDataCreateRequest {
  type: string;
  page: string;
  jsonData: string;
  isActive?: boolean;
}

export type StructuredDataUpdateRequest = Partial<StructuredDataCreateRequest>;

// Validation Types
export interface SEOValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MetaTagLimits {
  titleMaxLength: number;
  descriptionMaxLength: number;
  keywordsMaxLength: number;
}

// Common SEO Pages enum
export enum CommonSEOPages {
  HOME = '/',
  EXPERIENCES = '/experiences',
  EDUCATION = '/education',
  SKILLS = '/skills',
  CERTIFICATIONS = '/certifications',
  BOSS = '/boss',
  BOSS_LOGIN = '/boss/login'
}

// Structured Data Schema Types
export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  url?: string;
  sameAs?: string[];
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

// Sitemap Types
export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapResponse {
  urls: SitemapUrl[];
  generatedAt: Date;
}

// Extended Sitemap Types for Advanced Generator
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

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: SitemapImage[];
  videos?: SitemapVideo[];
  alternates?: SitemapAlternate[];
}

export interface SitemapGenerationSettings {
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

export interface SitemapValidationError {
  message: string;
  type: 'syntax' | 'url' | 'size' | 'structure';
  line?: number;
}

export interface SitemapValidationWarning {
  message: string;
  type: 'performance' | 'best-practice' | 'accessibility';
  line?: number;
}

export interface SitemapValidationResult {
  errors: SitemapValidationError[];
  warnings: SitemapValidationWarning[];
  isValid: boolean;
  urlCount?: number;
  fileSize?: number;
}

// Analytics Types
export interface SEOAnalytics {
  totalPages: number;
  pagesWithCustomMeta: number;
  pagesWithStructuredData: number;
  lastSitemapGeneration?: Date;
  robotsTxtLastUpdate?: Date;
}
