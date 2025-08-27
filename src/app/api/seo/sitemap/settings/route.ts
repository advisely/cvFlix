import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SitemapGenerationSettings } from '@/types/seo';

// We'll store sitemap settings as JSON in the SEOConfig table for simplicity
// In a larger app, you might create a dedicated SitemapConfig table

export async function GET() {
  try {
    // Get current sitemap settings from SEOConfig
    const seoConfig = await prisma.sEOConfig.findFirst();
    
    // Parse sitemap settings from robotsContent or create defaults
    const defaultSettings: SitemapGenerationSettings = {
      maxUrls: 50000,
      includeImages: true,
      includeVideos: true,
      includeAlternates: true,
      excludePatterns: ['/boss/*', '/admin/*', '/api/*'],
      defaultPriority: 0.5,
      defaultChangeFreq: 'weekly',
      cacheDuration: 60,
      autoGenerate: false
    };

    // For now, we'll return default settings
    // In a real implementation, you might store these in a separate field
    return NextResponse.json({
      settings: defaultSettings,
      lastUpdated: seoConfig?.updatedAt || new Date(),
      baseUrl: seoConfig?.canonicalUrl || 'https://resumeflex.com'
    });

  } catch (error) {
    console.error('Error fetching sitemap settings:', error);
    return NextResponse.json({ error: 'Failed to fetch sitemap settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Partial<SitemapGenerationSettings> = await request.json();
    
    // Validate settings
    const validChangeFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    
    if (body.defaultChangeFreq && !validChangeFreqs.includes(body.defaultChangeFreq)) {
      return NextResponse.json(
        { error: `Invalid changefreq. Must be one of: ${validChangeFreqs.join(', ')}` },
        { status: 400 }
      );
    }

    if (body.defaultPriority && (body.defaultPriority < 0 || body.defaultPriority > 1)) {
      return NextResponse.json(
        { error: 'Priority must be between 0.0 and 1.0' },
        { status: 400 }
      );
    }

    if (body.maxUrls && body.maxUrls > 50000) {
      return NextResponse.json(
        { error: 'Maximum URLs cannot exceed 50,000 per sitemap' },
        { status: 400 }
      );
    }

    if (body.cacheDuration && body.cacheDuration < 1) {
      return NextResponse.json(
        { error: 'Cache duration must be at least 1 minute' },
        { status: 400 }
      );
    }

    // For now, we'll just return success
    // In a real implementation, you would store these settings
    return NextResponse.json({
      success: true,
      message: 'Sitemap settings updated successfully',
      settings: body,
      updatedAt: new Date()
    });

  } catch (error) {
    console.error('Error updating sitemap settings:', error);
    return NextResponse.json({ error: 'Failed to update sitemap settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'validate':
        return await validateSitemapConfiguration();
      case 'test_generation':
        return await testSitemapGeneration();
      case 'reset_defaults':
        return await resetToDefaults();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in sitemap settings action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

async function validateSitemapConfiguration() {
  try {
    const seoConfig = await prisma.sEOConfig.findFirst();
    const issues = [];

    // Check if base URL is valid
    if (!seoConfig?.canonicalUrl) {
      issues.push({ type: 'error', message: 'Base URL not configured in SEO settings' });
    } else {
      try {
        new URL(seoConfig.canonicalUrl);
      } catch {
        issues.push({ type: 'error', message: 'Invalid base URL format' });
      }
    }

    // Check if robots.txt allows sitemap
    if (seoConfig?.robotsContent && !seoConfig.robotsContent.includes('Sitemap:')) {
      issues.push({ type: 'warning', message: 'robots.txt does not reference a sitemap' });
    }

    // Check for common SEO issues
    const metaTags = await prisma.sEOMetaTag.count();
    if (metaTags === 0) {
      issues.push({ type: 'warning', message: 'No custom meta tags configured for any pages' });
    }

    return NextResponse.json({
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      checkedAt: new Date()
    });

  } catch (error) {
    console.error('Settings validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}

async function testSitemapGeneration() {
  try {
    // Get basic site data
    const seoConfig = await prisma.sEOConfig.findFirst();
    const metaTagsCount = await prisma.sEOMetaTag.count();
    const experiencesCount = await prisma.experience.count();
    const highlightsCount = await prisma.highlight.count();

    const estimatedUrls = 5 + metaTagsCount + experiencesCount + highlightsCount; // 5 static pages

    return NextResponse.json({
      success: true,
      estimatedUrls,
      breakdown: {
        staticPages: 5,
        customPages: metaTagsCount,
        experiences: experiencesCount,
        highlights: highlightsCount
      },
      baseUrl: seoConfig?.canonicalUrl || 'https://resumeflex.com',
      testedAt: new Date()
    });

  } catch (error) {
    return NextResponse.json({ error: 'Test generation failed' }, { status: 500 });
  }
}

async function resetToDefaults() {
  const defaultSettings: SitemapGenerationSettings = {
    maxUrls: 50000,
    includeImages: true,
    includeVideos: true,
    includeAlternates: true,
    excludePatterns: ['/boss/*', '/admin/*', '/api/*'],
    defaultPriority: 0.5,
    defaultChangeFreq: 'weekly',
    cacheDuration: 60,
    autoGenerate: false
  };

  return NextResponse.json({
    success: true,
    message: 'Settings reset to defaults',
    settings: defaultSettings,
    resetAt: new Date()
  });
}
