import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  SitemapEntry, 
  SitemapGenerationSettings, 
  SitemapImage, 
  SitemapVideo,
} from '@/types/seo';

export async function POST(request: NextRequest) {
  try {
    const body: Partial<SitemapGenerationSettings> = await request.json();
    
    // Default settings
    const settings: SitemapGenerationSettings = {
      maxUrls: body.maxUrls || 50000,
      includeImages: body.includeImages ?? true,
      includeVideos: body.includeVideos ?? true,
      includeAlternates: body.includeAlternates ?? true,
      excludePatterns: body.excludePatterns || ['/boss/*', '/admin/*', '/api/*'],
      defaultPriority: body.defaultPriority || 0.5,
      defaultChangeFreq: body.defaultChangeFreq || 'weekly',
      cacheDuration: body.cacheDuration || 60,
      autoGenerate: body.autoGenerate ?? false
    };

    // Get SEO configuration for base URL
    const seoConfig = await prisma.sEOConfig.findFirst();
    const baseUrl = seoConfig?.canonicalUrl || 'https://resumeflex.com';

    // Generate sitemap entries
    const entries: SitemapEntry[] = [];

    // Add static pages with enhanced data
    const staticPages = await getStaticPagesWithMedia(baseUrl, settings);
    entries.push(...staticPages);

    // Add dynamic content pages
    const dynamicPages = await getDynamicPagesWithMedia(baseUrl, settings);
    entries.push(...dynamicPages);

    // Filter out excluded patterns
    const filteredEntries = entries.filter(entry => {
      const path = entry.loc.replace(baseUrl, '');
      return !settings.excludePatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(path);
      });
    });

    // Limit URLs if specified
    const finalEntries = settings.maxUrls < filteredEntries.length 
      ? filteredEntries.slice(0, settings.maxUrls)
      : filteredEntries;

    // Sort by priority and lastmod
    finalEntries.sort((a, b) => {
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime();
    });

    // Generate XML sitemap
    const xmlSitemap = generateAdvancedSitemapXML(finalEntries, settings);
    
    // Save to database if needed (optional sitemap storage)
    // await saveSitemapToDatabase(xmlSitemap, settings);

    return NextResponse.json({
      success: true,
      sitemap: xmlSitemap,
      stats: {
        totalUrls: finalEntries.length,
        withImages: finalEntries.filter(e => e.images && e.images.length > 0).length,
        withVideos: finalEntries.filter(e => e.videos && e.videos.length > 0).length,
        withAlternates: finalEntries.filter(e => e.alternates && e.alternates.length > 0).length,
        generatedAt: new Date().toISOString()
      },
      settings
    });

  } catch (error) {
    console.error('Error generating advanced sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}

async function getStaticPagesWithMedia(baseUrl: string, settings: SitemapGenerationSettings): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'weekly' as const },
    { path: '/experiences', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/education', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/skills', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/certifications', priority: 0.7, changefreq: 'monthly' as const },
  ];

  for (const page of staticPages) {
    const entry: SitemapEntry = {
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority
    };

    // Add language alternates if enabled
    if (settings.includeAlternates) {
      entry.alternates = [
        { hreflang: 'en', href: `${baseUrl}${page.path}` },
        { hreflang: 'fr', href: `${baseUrl}/fr${page.path}` }
      ];
    }

    // Add images and videos based on page content
    if (settings.includeImages || settings.includeVideos) {
      const media = await getPageMedia(page.path, settings);
      entry.images = media.images;
      entry.videos = media.videos;
    }

    entries.push(entry);
  }

  return entries;
}

async function getDynamicPagesWithMedia(baseUrl: string, settings: SitemapGenerationSettings): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  try {
    // Add experience detail pages
    const experiences = await prisma.experience.findMany({
      include: {
        media: true,
        company: true
      }
    });

    for (const experience of experiences) {
      const entry: SitemapEntry = {
        loc: `${baseUrl}/experiences/${experience.id}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.6
      };

      if (settings.includeAlternates) {
        entry.alternates = [
          { hreflang: 'en', href: `${baseUrl}/experiences/${experience.id}` },
          { hreflang: 'fr', href: `${baseUrl}/fr/experiences/${experience.id}` }
        ];
      }

      if (settings.includeImages && experience.media) {
        entry.images = experience.media
          .filter(m => m.type.startsWith('image/'))
          .map(m => ({
            loc: `${baseUrl}${m.url}`,
            caption: `${experience.title} at ${experience.company.name}`,
            title: experience.title
          }));
      }

      if (settings.includeVideos && experience.media) {
        entry.videos = experience.media
          .filter(m => m.type.startsWith('video/'))
          .map(m => ({
            loc: `${baseUrl}${m.url}`,
            thumbnail_loc: `${baseUrl}${m.url.replace(/\.[^.]+$/, '_thumb.jpg')}`,
            title: experience.title,
            description: experience.description.substring(0, 200)
          }));
      }

      entries.push(entry);
    }

    // Add highlight detail pages
    const highlights = await prisma.highlight.findMany({
      include: {
        media: true,
        company: true
      }
    });

    for (const highlight of highlights) {
      const entry: SitemapEntry = {
        loc: `${baseUrl}/highlights/${highlight.id}`,
        lastmod: highlight.createdAt.toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.5
      };

      if (settings.includeAlternates) {
        entry.alternates = [
          { hreflang: 'en', href: `${baseUrl}/highlights/${highlight.id}` },
          { hreflang: 'fr', href: `${baseUrl}/fr/highlights/${highlight.id}` }
        ];
      }

      if (settings.includeImages && highlight.media) {
        entry.images = highlight.media
          .filter(m => m.type.startsWith('image/'))
          .map(m => ({
            loc: `${baseUrl}${m.url}`,
            caption: `${highlight.title} at ${highlight.company.name}`,
            title: highlight.title
          }));
      }

      entries.push(entry);
    }

  } catch (error) {
    console.error('Error fetching dynamic pages:', error);
  }

  return entries;
}

async function getPageMedia(path: string, settings: SitemapGenerationSettings): Promise<{ images: SitemapImage[]; videos: SitemapVideo[] }> {
  const images: SitemapImage[] = [];
  const videos: SitemapVideo[] = [];

  try {
    // This would be expanded based on your specific media organization
    // For now, return empty arrays as placeholder
    if (path === '/') {
      // Add homepage media if any
      const homepageMedia = await prisma.media.findMany({
        where: {
          OR: [
            { experienceHomepageId: { not: null } },
            { highlightHomepageId: { not: null } }
          ]
        }
      });

      if (settings.includeImages) {
        images.push(...homepageMedia
          .filter(m => m.type.startsWith('image/'))
          .map(m => ({
            loc: `https://resumeflex.com${m.url}`,
            title: 'Portfolio Image',
            caption: 'Professional portfolio content'
          })));
      }

      if (settings.includeVideos) {
        videos.push(...homepageMedia
          .filter(m => m.type.startsWith('video/'))
          .map(m => ({
            loc: `https://resumeflex.com${m.url}`,
            thumbnail_loc: `https://resumeflex.com${m.url.replace(/\.[^.]+$/, '_thumb.jpg')}`,
            title: 'Portfolio Video',
            description: 'Professional portfolio video content'
          })));
      }
    }
  } catch (error) {
    console.error('Error fetching page media:', error);
  }

  return { images, videos };
}

function generateAdvancedSitemapXML(entries: SitemapEntry[], settings: SitemapGenerationSettings): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  let urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  
  // Add additional namespaces if needed
  if (settings.includeImages) {
    urlsetOpen += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
  }
  
  if (settings.includeVideos) {
    urlsetOpen += ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
  }
  
  if (settings.includeAlternates) {
    urlsetOpen += ' xmlns:xhtml="http://www.w3.org/1999/xhtml"';
  }
  
  urlsetOpen += '>\n';
  const urlsetClose = '</urlset>';

  const urlElements = entries.map(entry => {
    let urlElement = '  <url>\n';
    urlElement += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    urlElement += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    urlElement += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    urlElement += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    
    // Add alternate language links
    if (entry.alternates && entry.alternates.length > 0) {
      entry.alternates.forEach(alternate => {
        urlElement += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}" />\n`;
      });
    }
    
    // Add images
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(image => {
        urlElement += '    <image:image>\n';
        urlElement += `      <image:loc>${escapeXml(image.loc)}</image:loc>\n`;
        if (image.title) {
          urlElement += `      <image:title>${escapeXml(image.title)}</image:title>\n`;
        }
        if (image.caption) {
          urlElement += `      <image:caption>${escapeXml(image.caption)}</image:caption>\n`;
        }
        urlElement += '    </image:image>\n';
      });
    }
    
    // Add videos
    if (entry.videos && entry.videos.length > 0) {
      entry.videos.forEach(video => {
        urlElement += '    <video:video>\n';
        urlElement += `      <video:thumbnail_loc>${escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>\n`;
        urlElement += `      <video:title>${escapeXml(video.title)}</video:title>\n`;
        if (video.description) {
          urlElement += `      <video:description>${escapeXml(video.description)}</video:description>\n`;
        }
        urlElement += `      <video:content_loc>${escapeXml(video.loc)}</video:content_loc>\n`;
        if (video.duration) {
          urlElement += `      <video:duration>${video.duration}</video:duration>\n`;
        }
        urlElement += '    </video:video>\n';
      });
    }
    
    urlElement += '  </url>\n';
    return urlElement;
  }).join('');

  return xmlHeader + urlsetOpen + urlElements + urlsetClose;
}

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

export async function GET() {
  // Return default generation settings
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
    message: 'Advanced sitemap generation endpoint',
    defaultSettings,
    usage: {
      POST: 'Generate sitemap with custom settings',
      GET: 'Get default settings'
    }
  });
}
