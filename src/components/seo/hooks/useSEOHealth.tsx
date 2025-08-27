'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { SEOConfig, SEOMetaTag, StructuredData } from '@/types/seo';

interface SEOHealthScore {
  overall: number;
  breakdown: {
    metaTags: number;
    structuredData: number;
    technicalSEO: number;
    content: number;
  };
}

interface SEOHealthRecommendations {
  critical: string[];
  important: string[];
  suggested: string[];
}

interface UseSEOHealthReturn {
  score: SEOHealthScore;
  recommendations: SEOHealthRecommendations;
  loading: boolean;
  error: string | null;
  refreshHealth: () => Promise<void>;
}

export const useSEOHealth = (): UseSEOHealthReturn => {
  const [config, setConfig] = useState<SEOConfig | null>(null);
  const [metaTags, setMetaTags] = useState<SEOMetaTag[]>([]);
  const [structuredData, setStructuredData] = useState<StructuredData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSEOData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configResponse, metaTagsResponse, structuredDataResponse] = await Promise.allSettled([
        fetch('/api/seo/config'),
        fetch('/api/seo/meta-tags'),
        fetch('/api/seo/structured-data')
      ]);

      // Handle config
      if (configResponse.status === 'fulfilled' && configResponse.value.ok) {
        const configData = await configResponse.value.json();
        setConfig(configData);
      }

      // Handle meta tags
      if (metaTagsResponse.status === 'fulfilled' && metaTagsResponse.value.ok) {
        const metaTagsData = await metaTagsResponse.value.json();
        setMetaTags(Array.isArray(metaTagsData) ? metaTagsData : []);
      }

      // Handle structured data
      if (structuredDataResponse.status === 'fulfilled' && structuredDataResponse.value.ok) {
        const structuredDataData = await structuredDataResponse.value.json();
        setStructuredData(Array.isArray(structuredDataData) ? structuredDataData : []);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load SEO health data';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const score = useMemo((): SEOHealthScore => {
    if (!config) {
      return {
        overall: 0,
        breakdown: { metaTags: 0, structuredData: 0, technicalSEO: 0, content: 0 }
      };
    }

    // Calculate Meta Tags score (0-35 points)
    let metaTagsScore = 0;
    
    // Basic config completeness (15 points)
    if (config.defaultTitle && config.defaultTitleFr) metaTagsScore += 5;
    if (config.defaultDescription && config.defaultDescriptionFr) metaTagsScore += 5;
    if (config.defaultKeywords && config.defaultKeywordsFr) metaTagsScore += 3;
    if (config.canonicalUrl) metaTagsScore += 2;

    // Page-specific meta tags (20 points)
    const commonPages = ['/', '/experiences', '/education', '/skills', '/certifications'];
    const coveredPages = metaTags.filter(tag => 
      commonPages.includes(tag.page) && tag.title && tag.titleFr && tag.description && tag.descriptionFr
    ).length;
    metaTagsScore += Math.min(20, (coveredPages / commonPages.length) * 20);

    // Calculate Structured Data score (0-25 points)
    const activeStructuredData = structuredData.filter(sd => sd.isActive);
    let structuredDataScore = 0;
    
    if (activeStructuredData.length > 0) structuredDataScore += 10;
    if (activeStructuredData.some(sd => sd.type === 'Person')) structuredDataScore += 5;
    if (activeStructuredData.some(sd => sd.type === 'WebSite')) structuredDataScore += 5;
    if (activeStructuredData.some(sd => sd.type === 'Organization')) structuredDataScore += 3;
    if (activeStructuredData.length >= 3) structuredDataScore += 2;

    // Calculate Technical SEO score (0-25 points)
    let technicalSEOScore = 0;
    
    if (config.robotsContent && config.robotsContent.includes('Sitemap:')) technicalSEOScore += 8;
    if (config.faviconUrl) technicalSEOScore += 5;
    if (config.canonicalUrl && config.canonicalUrl.startsWith('https://')) technicalSEOScore += 7;
    if (config.robotsContent && !config.robotsContent.includes('Disallow: /')) technicalSEOScore += 3;
    technicalSEOScore += 2; // Assume SSL is configured

    // Calculate Content score (0-15 points)
    let contentScore = 0;
    
    // Title optimization
    if (config.defaultTitle.length >= 30 && config.defaultTitle.length <= 60) contentScore += 4;
    if (config.defaultTitleFr.length >= 30 && config.defaultTitleFr.length <= 60) contentScore += 3;
    
    // Description optimization
    if (config.defaultDescription.length >= 120 && config.defaultDescription.length <= 160) contentScore += 4;
    if (config.defaultDescriptionFr.length >= 120 && config.defaultDescriptionFr.length <= 160) contentScore += 3;
    
    // Keywords presence
    if (config.defaultKeywords && config.defaultKeywords.split(',').length >= 3) contentScore += 1;

    const overall = metaTagsScore + structuredDataScore + technicalSEOScore + contentScore;

    return {
      overall: Math.min(100, overall),
      breakdown: {
        metaTags: Math.round((metaTagsScore / 35) * 100),
        structuredData: Math.round((structuredDataScore / 25) * 100),
        technicalSEO: Math.round((technicalSEOScore / 25) * 100),
        content: Math.round((contentScore / 15) * 100)
      }
    };
  }, [config, metaTags, structuredData]);

  const recommendations = useMemo((): SEOHealthRecommendations => {
    const critical: string[] = [];
    const important: string[] = [];
    const suggested: string[] = [];

    if (!config) {
      critical.push('SEO configuration is missing - set up basic site information');
      return { critical, important, suggested };
    }

    // Critical recommendations
    if (!config.defaultTitle || !config.defaultTitleFr) {
      critical.push('Add default page titles for both English and French');
    }
    if (!config.defaultDescription || !config.defaultDescriptionFr) {
      critical.push('Add default meta descriptions for both languages');
    }
    if (!config.canonicalUrl) {
      critical.push('Set up canonical URL for your site');
    }

    // Important recommendations
    if (metaTags.length === 0) {
      important.push('Create page-specific meta tags for key pages');
    }
    if (structuredData.filter(sd => sd.isActive).length === 0) {
      important.push('Add structured data markup for better search results');
    }
    if (!config.faviconUrl) {
      important.push('Upload a favicon for better brand recognition');
    }
    if (config.defaultTitle.length > 60 || config.defaultTitleFr.length > 60) {
      important.push('Shorten page titles to under 60 characters for optimal display');
    }
    if (config.defaultDescription.length > 160 || config.defaultDescriptionFr.length > 160) {
      important.push('Optimize meta descriptions to under 160 characters');
    }

    // Suggested improvements
    if (!config.defaultKeywords || !config.defaultKeywordsFr) {
      suggested.push('Add relevant keywords to improve content categorization');
    }
    if (metaTags.length < 5) {
      suggested.push('Add meta tags for more pages to improve overall SEO coverage');
    }
    if (!structuredData.some(sd => sd.type === 'Person' && sd.isActive)) {
      suggested.push('Add Person schema markup for professional profiles');
    }
    if (!config.canonicalUrl.startsWith('https://')) {
      suggested.push('Ensure canonical URL uses HTTPS for security');
    }

    return { critical, important, suggested };
  }, [config, metaTags, structuredData]);

  const refreshHealth = useCallback(async () => {
    await fetchSEOData();
  }, [fetchSEOData]);

  // Auto-fetch data on mount
  useEffect(() => {
    fetchSEOData();
  }, [fetchSEOData]);

  return {
    score,
    recommendations,
    loading,
    error,
    refreshHealth
  };
};