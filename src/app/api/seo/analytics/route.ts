import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOAnalytics } from '@/types/seo';

export async function GET() {
  try {
    // Get total pages count (static pages + custom meta tags)
    const staticPagesCount = 5; // /, /experiences, /education, /skills, /certifications
    const customMetaTagsCount = await prisma.sEOMetaTag.count();
    const totalPages = staticPagesCount + customMetaTagsCount;

    // Get pages with custom meta tags
    const pagesWithCustomMeta = await prisma.sEOMetaTag.count();

    // Get pages with structured data
    const pagesWithStructuredData = await prisma.structuredData.count({
      where: { isActive: true },
      distinct: ['page']
    });

    // Get SEO config information
    const seoConfig = await prisma.sEOConfig.findFirst({
      select: {
        updatedAt: true,
        robotsContent: true
      }
    });

    // Calculate robots.txt last update
    const robotsTxtLastUpdate = seoConfig?.updatedAt || null;

    // Get structured data breakdown by type
    const structuredDataByType = await prisma.structuredData.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { type: true }
    });

    // Get meta tags by page
    const metaTagsByPage = await prisma.sEOMetaTag.findMany({
      select: {
        page: true,
        title: true,
        titleFr: true,
        description: true,
        descriptionFr: true,
        ogImage: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate SEO completeness scores
    const seoScores = metaTagsByPage.map(tag => ({
      page: tag.page,
      completeness: calculateCompletenessScore(tag),
      lastUpdated: tag.updatedAt
    }));

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMetaTagUpdates = await prisma.sEOMetaTag.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const recentStructuredDataUpdates = await prisma.structuredData.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const analytics: SEOAnalytics & {
      structuredDataByType: { type: string; count: number }[];
      seoScores: { page: string; completeness: number; lastUpdated: Date }[];
      recentActivity: {
        metaTagUpdates: number;
        structuredDataUpdates: number;
        period: string;
      };
    } = {
      totalPages,
      pagesWithCustomMeta,
      pagesWithStructuredData,
      robotsTxtLastUpdate,
      structuredDataByType: structuredDataByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      seoScores,
      recentActivity: {
        metaTagUpdates: recentMetaTagUpdates,
        structuredDataUpdates: recentStructuredDataUpdates,
        period: '30 days'
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching SEO analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch SEO analytics' }, { status: 500 });
  }
}

// Helper function to calculate SEO completeness score for a page
function calculateCompletenessScore(metaTag: {
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  ogImage?: string | null;
}): number {
  let score = 0;
  const maxScore = 10;

  // Title completeness (2 points)
  if (metaTag.title && metaTag.title.length > 0 && metaTag.title.length <= 60) score += 1;
  if (metaTag.titleFr && metaTag.titleFr.length > 0 && metaTag.titleFr.length <= 60) score += 1;

  // Description completeness (2 points)
  if (metaTag.description && metaTag.description.length > 0 && metaTag.description.length <= 160) score += 1;
  if (metaTag.descriptionFr && metaTag.descriptionFr.length > 0 && metaTag.descriptionFr.length <= 160) score += 1;

  // Title length optimization (2 points)
  if (metaTag.title && metaTag.title.length >= 30 && metaTag.title.length <= 60) score += 1;
  if (metaTag.titleFr && metaTag.titleFr.length >= 30 && metaTag.titleFr.length <= 60) score += 1;

  // Description length optimization (2 points)
  if (metaTag.description && metaTag.description.length >= 120 && metaTag.description.length <= 160) score += 1;
  if (metaTag.descriptionFr && metaTag.descriptionFr.length >= 120 && metaTag.descriptionFr.length <= 160) score += 1;

  // OpenGraph image (2 points)
  if (metaTag.ogImage) score += 2;

  return Math.round((score / maxScore) * 100);
}
