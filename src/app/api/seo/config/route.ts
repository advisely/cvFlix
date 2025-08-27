import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOConfigCreateRequest, SEOConfigUpdateRequest } from '@/types/seo';

export async function GET() {
  try {
    let seoConfig = await prisma.sEOConfig.findFirst();

    // If no config exists, create a default one (following NavbarConfig pattern)
    if (!seoConfig) {
      seoConfig = await prisma.sEOConfig.create({
        data: {
          siteName: "resumeflex",
          siteNameFr: "resumeflex",
          defaultTitle: "Professional Portfolio - resumeflex",
          defaultTitleFr: "Portfolio Professionnel - resumeflex",
          defaultDescription: "Professional portfolio showcasing experience, skills, and achievements.",
          defaultDescriptionFr: "Portfolio professionnel présentant l'expérience, les compétences et les réalisations.",
          defaultKeywords: "portfolio, professional, experience, skills, career",
          defaultKeywordsFr: "portfolio, professionnel, expérience, compétences, carrière",
          canonicalUrl: "https://resumeflex.com",
          robotsContent: "User-agent: *\nAllow: /\nDisallow: /boss/\nSitemap: https://resumeflex.com/sitemap.xml"
        }
      });
    }

    return NextResponse.json(seoConfig);
  } catch (error) {
    console.error('Error fetching SEO config:', error);
    return NextResponse.json({ error: 'Failed to fetch SEO config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SEOConfigCreateRequest = await request.json();
    const {
      siteName,
      siteNameFr,
      defaultTitle,
      defaultTitleFr,
      defaultDescription,
      defaultDescriptionFr,
      defaultKeywords,
      defaultKeywordsFr,
      canonicalUrl,
      robotsContent,
      faviconUrl
    } = body;

    // Validate required fields
    if (!siteName || !siteNameFr || !defaultTitle || !defaultTitleFr || 
        !defaultDescription || !defaultDescriptionFr || !canonicalUrl) {
      return NextResponse.json(
        { error: 'Required fields: siteName (EN/FR), defaultTitle (EN/FR), defaultDescription (EN/FR), canonicalUrl' },
        { status: 400 }
      );
    }

    // Validate title length (SEO best practice: under 60 characters)
    if (defaultTitle.length > 60 || defaultTitleFr.length > 60) {
      return NextResponse.json(
        { error: 'Title should be under 60 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate description length (SEO best practice: under 160 characters)
    if (defaultDescription.length > 160 || defaultDescriptionFr.length > 160) {
      return NextResponse.json(
        { error: 'Description should be under 160 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(canonicalUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid canonical URL format' },
        { status: 400 }
      );
    }

    const seoConfig = await prisma.sEOConfig.create({
      data: {
        siteName,
        siteNameFr,
        defaultTitle,
        defaultTitleFr,
        defaultDescription,
        defaultDescriptionFr,
        defaultKeywords: defaultKeywords || '',
        defaultKeywordsFr: defaultKeywordsFr || '',
        canonicalUrl,
        robotsContent: robotsContent || "User-agent: *\nAllow: /\nDisallow: /boss/\nSitemap: " + canonicalUrl + "/sitemap.xml",
        faviconUrl: faviconUrl || null
      }
    });

    return NextResponse.json(seoConfig);
  } catch (error) {
    console.error('Error creating SEO config:', error);
    return NextResponse.json({ error: 'Failed to create SEO config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: SEOConfigUpdateRequest = await request.json();
    const {
      siteName,
      siteNameFr,
      defaultTitle,
      defaultTitleFr,
      defaultDescription,
      defaultDescriptionFr,
      defaultKeywords,
      defaultKeywordsFr,
      canonicalUrl,
      robotsContent,
      faviconUrl
    } = body;

    // Get existing config or create new one
    let seoConfig = await prisma.sEOConfig.findFirst();

    // Validate title length if provided
    if ((defaultTitle && defaultTitle.length > 60) || (defaultTitleFr && defaultTitleFr.length > 60)) {
      return NextResponse.json(
        { error: 'Title should be under 60 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if ((defaultDescription && defaultDescription.length > 160) || (defaultDescriptionFr && defaultDescriptionFr.length > 160)) {
      return NextResponse.json(
        { error: 'Description should be under 160 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (canonicalUrl) {
      try {
        new URL(canonicalUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid canonical URL format' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...(siteName !== undefined && { siteName }),
      ...(siteNameFr !== undefined && { siteNameFr }),
      ...(defaultTitle !== undefined && { defaultTitle }),
      ...(defaultTitleFr !== undefined && { defaultTitleFr }),
      ...(defaultDescription !== undefined && { defaultDescription }),
      ...(defaultDescriptionFr !== undefined && { defaultDescriptionFr }),
      ...(defaultKeywords !== undefined && { defaultKeywords }),
      ...(defaultKeywordsFr !== undefined && { defaultKeywordsFr }),
      ...(canonicalUrl !== undefined && { canonicalUrl }),
      ...(robotsContent !== undefined && { robotsContent }),
      ...(faviconUrl !== undefined && { faviconUrl })
    };

    if (seoConfig) {
      // Update existing config
      seoConfig = await prisma.sEOConfig.update({
        where: { id: seoConfig.id },
        data: updateData
      });
    } else {
      // Create new config with defaults
      seoConfig = await prisma.sEOConfig.create({
        data: {
          siteName: siteName || "resumeflex",
          siteNameFr: siteNameFr || "resumeflex",
          defaultTitle: defaultTitle || "Professional Portfolio - resumeflex",
          defaultTitleFr: defaultTitleFr || "Portfolio Professionnel - resumeflex",
          defaultDescription: defaultDescription || "Professional portfolio showcasing experience, skills, and achievements.",
          defaultDescriptionFr: defaultDescriptionFr || "Portfolio professionnel présentant l'expérience, les compétences et les réalisations.",
          defaultKeywords: defaultKeywords || "portfolio, professional, experience, skills, career",
          defaultKeywordsFr: defaultKeywordsFr || "portfolio, professionnel, expérience, compétences, carrière",
          canonicalUrl: canonicalUrl || "https://resumeflex.com",
          robotsContent: robotsContent || "User-agent: *\nAllow: /\nDisallow: /boss/\nSitemap: https://resumeflex.com/sitemap.xml",
          faviconUrl: faviconUrl || null
        }
      });
    }

    return NextResponse.json(seoConfig);
  } catch (error) {
    console.error('Error updating SEO config:', error);
    return NextResponse.json({ error: 'Failed to update SEO config' }, { status: 500 });
  }
}
