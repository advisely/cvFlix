import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMedia = searchParams.get('includeMedia') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Get SEO configuration for base URL
    const seoConfig = await prisma.sEOConfig.findFirst();
    const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

    // Discover all pages in the application
    const pages = [];

    // Static pages
    const staticPages = [
      { path: '/', type: 'static', title: 'Homepage', priority: 1.0 },
      { path: '/experiences', type: 'static', title: 'Work Experience', priority: 0.9 },
      { path: '/education', type: 'static', title: 'Education', priority: 0.8 },
      { path: '/skills', type: 'static', title: 'Skills', priority: 0.8 },
      { path: '/certifications', type: 'static', title: 'Certifications', priority: 0.7 }
    ];

    for (const page of staticPages) {
      const pageData: Record<string, unknown> = {
        path: page.path,
        url: `${baseUrl}${page.path}`,
        type: page.type,
        title: page.title,
        priority: page.priority,
        lastModified: new Date(),
        hasCustomMeta: await hasCustomMetaTags(page.path),
        hasStructuredData: await hasStructuredData(page.path)
      };

      if (includeMedia) {
        pageData.mediaCount = await getPageMediaCount(page.path);
      }

      pages.push(pageData);
    }

    // Dynamic experience pages
    const experiences = await prisma.experience.findMany({
      include: includeMedia ? { media: true, company: true } : { company: true },
      orderBy: { startDate: 'desc' }
    });

    for (const experience of experiences) {
      const path = `/experiences/${experience.id}`;
      const pageData: Record<string, unknown> = {
        path,
        url: `${baseUrl}${path}`,
        type: 'dynamic',
        entityType: 'experience',
        entityId: experience.id,
        title: `${experience.title} at ${experience.company.name}`,
        priority: 0.6,
        lastModified: new Date(),
        hasCustomMeta: await hasCustomMetaTags(path),
        hasStructuredData: await hasStructuredData(path)
      };

      if (includeMedia) {
        pageData.mediaCount = experience.media ? experience.media.length : 0;
      }

      pages.push(pageData);
    }

    // Dynamic highlight pages
    const highlights = await prisma.highlight.findMany({
      include: includeMedia ? { media: true, company: true } : { company: true },
      orderBy: { createdAt: 'desc' }
    });

    for (const highlight of highlights) {
      const path = `/highlights/${highlight.id}`;
      const pageData: Record<string, unknown> = {
        path,
        url: `${baseUrl}${path}`,
        type: 'dynamic',
        entityType: 'highlight',
        entityId: highlight.id,
        title: `${highlight.title} at ${highlight.company.name}`,
        priority: 0.5,
        lastModified: highlight.createdAt,
        hasCustomMeta: await hasCustomMetaTags(path),
        hasStructuredData: await hasStructuredData(path)
      };

      if (includeMedia) {
        pageData.mediaCount = highlight.media ? highlight.media.length : 0;
      }

      pages.push(pageData);
    }

    // Pages with custom meta tags (not already included)
    const customMetaPages = await prisma.sEOMetaTag.findMany({
      select: { page: true, updatedAt: true, title: true }
    });

    for (const metaPage of customMetaPages) {
      // Skip if already included
      if (pages.some(p => p.path === metaPage.page)) {
        continue;
      }

      pages.push({
        path: metaPage.page,
        url: `${baseUrl}${metaPage.page}`,
        type: 'custom',
        title: metaPage.title,
        priority: 0.4,
        lastModified: metaPage.updatedAt,
        hasCustomMeta: true,
        hasStructuredData: await hasStructuredData(metaPage.page),
        mediaCount: includeMedia ? await getPageMediaCount(metaPage.page) : undefined
      });
    }

    // Sort by priority and lastModified
    pages.sort((a, b) => {
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

    const response: Record<string, unknown> = {
      pages,
      totalPages: pages.length,
      baseUrl
    };

    if (includeStats) {
      response.statistics = {
        byType: {
          static: pages.filter(p => p.type === 'static').length,
          dynamic: pages.filter(p => p.type === 'dynamic').length,
          custom: pages.filter(p => p.type === 'custom').length
        },
        byEntityType: {
          experience: pages.filter(p => p.entityType === 'experience').length,
          highlight: pages.filter(p => p.entityType === 'highlight').length
        },
        seoOptimization: {
          withCustomMeta: pages.filter(p => p.hasCustomMeta).length,
          withStructuredData: pages.filter(p => p.hasStructuredData).length,
          withMedia: includeMedia ? pages.filter(p => p.mediaCount && p.mediaCount > 0).length : 0
        }
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error discovering pages:', error);
    return NextResponse.json({ error: 'Failed to discover pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, paths } = await request.json();

    switch (action) {
      case 'analyze':
        return await analyzePages(paths);
      case 'optimize':
        return await optimizePages(paths);
      case 'validate':
        return await validatePages(paths);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in pages action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

async function hasCustomMetaTags(path: string): Promise<boolean> {
  const count = await prisma.sEOMetaTag.count({
    where: { page: path }
  });
  return count > 0;
}

async function hasStructuredData(path: string): Promise<boolean> {
  const count = await prisma.structuredData.count({
    where: { page: path, isActive: true }
  });
  return count > 0;
}

async function getPageMediaCount(path: string): Promise<number> {
  // This is a simplified implementation
  // In a real app, you'd map paths to their media more precisely
  if (path === '/') {
    return await prisma.media.count({
      where: {
        OR: [
          { experienceHomepageId: { not: null } },
          { highlightHomepageId: { not: null } }
        ]
      }
    });
  }
  
  return 0;
}

async function analyzePages(paths: string[]) {
  const analysis = [];

  for (const path of paths) {
    const pageAnalysis: Record<string, unknown> = {
      path,
      seoScore: 0,
      issues: [],
      recommendations: []
    };

    // Check meta tags
    const metaTags = await prisma.sEOMetaTag.findUnique({ where: { page: path } });
    if (!metaTags) {
      pageAnalysis.issues.push('No custom meta tags configured');
      pageAnalysis.recommendations.push('Add custom title and description');
    } else {
      pageAnalysis.seoScore += 30;
      
      // Check title length
      if (metaTags.title.length > 60) {
        pageAnalysis.issues.push('Title too long for optimal SEO');
      } else if (metaTags.title.length < 30) {
        pageAnalysis.issues.push('Title might be too short');
      } else {
        pageAnalysis.seoScore += 20;
      }

      // Check description length
      if (metaTags.description.length > 160) {
        pageAnalysis.issues.push('Description too long for optimal SEO');
      } else if (metaTags.description.length < 120) {
        pageAnalysis.issues.push('Description could be more detailed');
      } else {
        pageAnalysis.seoScore += 20;
      }
    }

    // Check structured data
    const structuredDataCount = await prisma.structuredData.count({
      where: { page: path, isActive: true }
    });

    if (structuredDataCount === 0) {
      pageAnalysis.issues.push('No structured data configured');
      pageAnalysis.recommendations.push('Add JSON-LD structured data');
    } else {
      pageAnalysis.seoScore += 30;
    }

    analysis.push(pageAnalysis);
  }

  return NextResponse.json({
    analysis,
    averageScore: analysis.reduce((sum, page) => sum + page.seoScore, 0) / analysis.length,
    totalIssues: analysis.reduce((sum, page) => sum + page.issues.length, 0)
  });
}

async function optimizePages(paths: string[]) {
  const results = [];

  for (const path of paths) {
    const result: Record<string, unknown> = {
      path,
      optimizationsApplied: [],
      errors: []
    };

    try {
      // Auto-generate meta tags if missing
      const existingMeta = await prisma.sEOMetaTag.findUnique({ where: { page: path } });
      if (!existingMeta) {
        // Generate basic meta tags based on path
        const generatedMeta = generateMetaTagsForPath(path);
        if (generatedMeta) {
          await prisma.sEOMetaTag.create({
            data: {
              page: path,
              ...generatedMeta
            }
          });
          result.optimizationsApplied.push('Generated basic meta tags');
        }
      }

      // Auto-generate basic structured data if missing
      const existingStructuredData = await prisma.structuredData.findFirst({
        where: { page: path, isActive: true }
      });

      if (!existingStructuredData) {
        const generatedStructuredData = generateStructuredDataForPath(path);
        if (generatedStructuredData) {
          await prisma.structuredData.create({
            data: {
              type: generatedStructuredData.type,
              page: path,
              jsonData: JSON.stringify(generatedStructuredData.data, null, 2),
              isActive: true
            }
          });
          result.optimizationsApplied.push('Generated basic structured data');
        }
      }

    } catch (error) {
      result.errors.push(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    results.push(result);
  }

  return NextResponse.json({
    results,
    totalOptimizations: results.reduce((sum, result) => sum + result.optimizationsApplied.length, 0),
    totalErrors: results.reduce((sum, result) => sum + result.errors.length, 0)
  });
}

async function validatePages(paths: string[]) {
  const validations = [];

  for (const path of paths) {
    const validation: Record<string, unknown> = {
      path,
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate path format
    if (!path.startsWith('/')) {
      validation.isValid = false;
      validation.errors.push('Path should start with /');
    }

    // Check if meta tags exist and are valid
    const metaTags = await prisma.sEOMetaTag.findUnique({ where: { page: path } });
    if (metaTags) {
      if (metaTags.title.length > 60) {
        validation.warnings.push('Title exceeds recommended length');
      }
      if (metaTags.description.length > 160) {
        validation.warnings.push('Description exceeds recommended length');
      }
    }

    validations.push(validation);
  }

  return NextResponse.json({
    validations,
    allValid: validations.every(v => v.isValid),
    totalErrors: validations.reduce((sum, v) => sum + v.errors.length, 0),
    totalWarnings: validations.reduce((sum, v) => sum + v.warnings.length, 0)
  });
}

function generateMetaTagsForPath(path: string): Record<string, string> | null {
  const pathSegments = path.split('/').filter(Boolean);
  
  switch (pathSegments[0]) {
    case 'experiences':
      return {
        title: 'Professional Experience',
        titleFr: 'Expérience Professionnelle',
        description: 'Detailed professional work experience and career achievements.',
        descriptionFr: 'Expérience de travail professionnelle détaillée et réalisations de carrière.'
      };
    case 'highlights':
      return {
        title: 'Career Highlights',
        titleFr: 'Points Saillants de Carrière',
        description: 'Key professional achievements and career milestones.',
        descriptionFr: 'Principales réalisations professionnelles et jalons de carrière.'
      };
    default:
      return null;
  }
}

function generateStructuredDataForPath(path: string): { type: string; data: Record<string, unknown> } | null {
  // Future: Could use path analysis for more specific structured data
  const _pathSegments = path.split('/').filter(Boolean);
  
  if (path === '/') {
    return {
      type: 'WebSite',
      data: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Professional Portfolio',
        url: 'https://resumeflex.com',
        description: 'Professional portfolio showcasing experience, skills, and achievements.'
      }
    };
  }
  
  return null;
}
