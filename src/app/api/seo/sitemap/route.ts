import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SitemapUrl, SitemapResponse } from '@/types/seo';

// Cache sitemap for 1 hour to improve performance
const SITEMAP_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let sitemapCache: { data: SitemapResponse; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'xml' or 'json'
    const useCache = searchParams.get('cache') !== 'false';

    // Check cache first
    const now = Date.now();
    if (useCache && sitemapCache && (now - sitemapCache.timestamp < SITEMAP_CACHE_DURATION)) {
      if (format === 'xml') {
        return new NextResponse(generateSitemapXML(sitemapCache.data), {
          headers: { 'Content-Type': 'application/xml' }
        });
      }
      return NextResponse.json(sitemapCache.data);
    }

    // Get SEO configuration for base URL
    const seoConfig = await prisma.sEOConfig.findFirst();
    const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

    // Generate sitemap URLs
    const urls: SitemapUrl[] = [];

    // Add static pages
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'weekly' as const },
      { path: '/experiences', priority: 0.9, changefreq: 'weekly' as const },
      { path: '/education', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/skills', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/certifications', priority: 0.7, changefreq: 'monthly' as const },
    ];

    for (const page of staticPages) {
      urls.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        changefreq: page.changefreq,
        priority: page.priority
      });
    }

    // Add dynamic pages from meta tags
    const customMetaTags = await prisma.sEOMetaTag.findMany({
      select: { page: true, updatedAt: true }
    });

    for (const metaTag of customMetaTags) {
      // Skip if already added as static page
      if (staticPages.some(p => p.path === metaTag.page)) {
        continue;
      }

      urls.push({
        loc: `${baseUrl}${metaTag.page}`,
        lastmod: metaTag.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.6
      });
    }

    // Sort URLs by priority (descending) then by path
    urls.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.loc.localeCompare(b.loc);
    });

    const sitemapData: SitemapResponse = {
      urls,
      generatedAt: new Date()
    };

    // Update cache
    sitemapCache = {
      data: sitemapData,
      timestamp: now
    };

    // Return XML or JSON format
    if (format === 'xml') {
      return new NextResponse(generateSitemapXML(sitemapData), {
        headers: { 
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    }

    return NextResponse.json(sitemapData, {
      headers: {
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}

// Helper function to generate XML sitemap
function generateSitemapXML(sitemapData: SitemapResponse): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';

  const urlElements = sitemapData.urls.map(url => {
    let urlElement = '  <url>\n';
    urlElement += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    
    if (url.lastmod) {
      urlElement += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      urlElement += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      urlElement += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }
    
    urlElement += '  </url>\n';
    return urlElement;
  }).join('');

  return xmlHeader + urlsetOpen + urlElements + urlsetClose;
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
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
}

// Clear cache endpoint
export async function DELETE() {
  try {
    sitemapCache = null;
    return NextResponse.json({ message: 'Sitemap cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing sitemap cache:', error);
    return NextResponse.json({ error: 'Failed to clear sitemap cache' }, { status: 500 });
  }
}
