import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOMetaTagCreateRequest, SEOMetaTagUpdateRequest } from '@/types/seo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (page) {
      // Get meta tags for specific page
      const metaTag = await prisma.sEOMetaTag.findUnique({
        where: { page }
      });
      
      if (!metaTag) {
        return NextResponse.json({ error: 'Meta tags not found for this page' }, { status: 404 });
      }
      
      return NextResponse.json(metaTag);
    } else {
      // Get all meta tags
      const metaTags = await prisma.sEOMetaTag.findMany({
        orderBy: {
          page: 'asc'
        }
      });
      return NextResponse.json(metaTags);
    }
  } catch (error) {
    console.error('Error fetching SEO meta tags:', error);
    return NextResponse.json({ error: 'Failed to fetch SEO meta tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SEOMetaTagCreateRequest = await request.json();
    
    // Destructure all possible fields from the extended schema
    const {
      page,
      title,
      titleFr,
      description,
      descriptionFr,
      keywords,
      keywordsFr,
      // OpenGraph Basic Properties
      ogTitle,
      ogTitleFr,
      ogDescription,
      ogDescriptionFr,
      ogImage,
      ogType,
      ogUrl,
      ogSiteName,
      ogLocale,
      ogImageAlt,
      ogImageWidth,
      ogImageHeight,
      ogUpdatedTime,
      // Article-specific OpenGraph
      articleAuthor,
      articlePublishedTime,
      articleModifiedTime,
      articleSection,
      articleTag,
      // Profile-specific OpenGraph
      profileFirstName,
      profileLastName,
      profileUsername,
      profileGender,
      // Twitter Card Properties
      twitterCard,
      twitterSite,
      twitterCreator,
      twitterTitle,
      twitterDescription,
      twitterImage,
      twitterImageAlt,
      // Twitter App Card Properties
      twitterAppNameIphone,
      twitterAppIdIphone,
      twitterAppUrlIphone,
      twitterAppNameGoogleplay,
      twitterAppIdGoogleplay,
      twitterAppUrlGoogleplay,
      // Twitter Player Card Properties
      twitterPlayer,
      twitterPlayerWidth,
      twitterPlayerHeight,
      twitterPlayerStream,
      twitterPlayerStreamContentType,
      canonicalUrl
    } = body;

    // Validate required fields
    if (!page || !title || !titleFr || !description || !descriptionFr) {
      return NextResponse.json(
        { error: 'Required fields: page, title (EN/FR), description (EN/FR)' },
        { status: 400 }
      );
    }

    // Validate title length (SEO best practice: under 60 characters)
    if (title.length > 60 || titleFr.length > 60) {
      return NextResponse.json(
        { error: 'Title should be under 60 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate description length (SEO best practice: under 160 characters)
    if (description.length > 160 || descriptionFr.length > 160) {
      return NextResponse.json(
        { error: 'Description should be under 160 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate page format (should start with /)
    if (!page.startsWith('/')) {
      return NextResponse.json(
        { error: 'Page path should start with /' },
        { status: 400 }
      );
    }

    // Validate canonical URL format if provided
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

    // Validate Twitter Card type if provided
    if (twitterCard && !['summary', 'summary_large_image', 'app', 'player'].includes(twitterCard)) {
      return NextResponse.json(
        { error: 'Invalid Twitter card type. Must be: summary, summary_large_image, app, or player' },
        { status: 400 }
      );
    }

    // Check if meta tags for this page already exist
    const existingMetaTag = await prisma.sEOMetaTag.findUnique({
      where: { page }
    });

    if (existingMetaTag) {
      return NextResponse.json(
        { error: 'Meta tags for this page already exist. Use PUT to update.' },
        { status: 409 }
      );
    }

    const metaTag = await prisma.sEOMetaTag.create({
      data: {
        page,
        title,
        titleFr,
        description,
        descriptionFr,
        keywords: keywords || null,
        keywordsFr: keywordsFr || null,
        // OpenGraph Basic Properties
        ogTitle: ogTitle || null,
        ogTitleFr: ogTitleFr || null,
        ogDescription: ogDescription || null,
        ogDescriptionFr: ogDescriptionFr || null,
        ogImage: ogImage || null,
        ogType: ogType || null,
        ogUrl: ogUrl || null,
        ogSiteName: ogSiteName || null,
        ogLocale: ogLocale || null,
        ogImageAlt: ogImageAlt || null,
        ogImageWidth: ogImageWidth || null,
        ogImageHeight: ogImageHeight || null,
        ogUpdatedTime: ogUpdatedTime || null,
        // Article-specific OpenGraph
        articleAuthor: articleAuthor || null,
        articlePublishedTime: articlePublishedTime || null,
        articleModifiedTime: articleModifiedTime || null,
        articleSection: articleSection || null,
        articleTag: articleTag || null,
        // Profile-specific OpenGraph
        profileFirstName: profileFirstName || null,
        profileLastName: profileLastName || null,
        profileUsername: profileUsername || null,
        profileGender: profileGender || null,
        // Twitter Card Properties
        twitterCard: twitterCard || null,
        twitterSite: twitterSite || null,
        twitterCreator: twitterCreator || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        twitterImageAlt: twitterImageAlt || null,
        // Twitter App Card Properties
        twitterAppNameIphone: twitterAppNameIphone || null,
        twitterAppIdIphone: twitterAppIdIphone || null,
        twitterAppUrlIphone: twitterAppUrlIphone || null,
        twitterAppNameGoogleplay: twitterAppNameGoogleplay || null,
        twitterAppIdGoogleplay: twitterAppIdGoogleplay || null,
        twitterAppUrlGoogleplay: twitterAppUrlGoogleplay || null,
        // Twitter Player Card Properties
        twitterPlayer: twitterPlayer || null,
        twitterPlayerWidth: twitterPlayerWidth || null,
        twitterPlayerHeight: twitterPlayerHeight || null,
        twitterPlayerStream: twitterPlayerStream || null,
        twitterPlayerStreamContentType: twitterPlayerStreamContentType || null,
        canonicalUrl: canonicalUrl || null
      }
    });

    return NextResponse.json(metaTag);
  } catch (error) {
    console.error('Error creating SEO meta tag:', error);
    return NextResponse.json({ error: 'Failed to create SEO meta tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
    }

    const body: SEOMetaTagUpdateRequest = await request.json();
    
    // Destructure all possible fields for update
    const {
      title,
      titleFr,
      description,
      descriptionFr,
      keywords,
      keywordsFr,
      // OpenGraph Basic Properties
      ogTitle,
      ogTitleFr,
      ogDescription,
      ogDescriptionFr,
      ogImage,
      ogType,
      ogUrl,
      ogSiteName,
      ogLocale,
      ogImageAlt,
      ogImageWidth,
      ogImageHeight,
      ogUpdatedTime,
      // Article-specific OpenGraph
      articleAuthor,
      articlePublishedTime,
      articleModifiedTime,
      articleSection,
      articleTag,
      // Profile-specific OpenGraph
      profileFirstName,
      profileLastName,
      profileUsername,
      profileGender,
      // Twitter Card Properties
      twitterCard,
      twitterSite,
      twitterCreator,
      twitterTitle,
      twitterDescription,
      twitterImage,
      twitterImageAlt,
      // Twitter App Card Properties
      twitterAppNameIphone,
      twitterAppIdIphone,
      twitterAppUrlIphone,
      twitterAppNameGoogleplay,
      twitterAppIdGoogleplay,
      twitterAppUrlGoogleplay,
      // Twitter Player Card Properties
      twitterPlayer,
      twitterPlayerWidth,
      twitterPlayerHeight,
      twitterPlayerStream,
      twitterPlayerStreamContentType,
      canonicalUrl
    } = body;

    // Validate title length if provided
    if ((title && title.length > 60) || (titleFr && titleFr.length > 60)) {
      return NextResponse.json(
        { error: 'Title should be under 60 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if ((description && description.length > 160) || (descriptionFr && descriptionFr.length > 160)) {
      return NextResponse.json(
        { error: 'Description should be under 160 characters for optimal SEO' },
        { status: 400 }
      );
    }

    // Validate canonical URL format if provided
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

    // Validate Twitter Card type if provided
    if (twitterCard && !['summary', 'summary_large_image', 'app', 'player'].includes(twitterCard)) {
      return NextResponse.json(
        { error: 'Invalid Twitter card type. Must be: summary, summary_large_image, app, or player' },
        { status: 400 }
      );
    }

    // Check if meta tag exists
    const existingMetaTag = await prisma.sEOMetaTag.findUnique({
      where: { page }
    });

    if (!existingMetaTag) {
      return NextResponse.json(
        { error: 'Meta tags not found for this page' },
        { status: 404 }
      );
    }

    const updateData = {
      ...(title !== undefined && { title }),
      ...(titleFr !== undefined && { titleFr }),
      ...(description !== undefined && { description }),
      ...(descriptionFr !== undefined && { descriptionFr }),
      ...(keywords !== undefined && { keywords }),
      ...(keywordsFr !== undefined && { keywordsFr }),
      // OpenGraph Basic Properties
      ...(ogTitle !== undefined && { ogTitle }),
      ...(ogTitleFr !== undefined && { ogTitleFr }),
      ...(ogDescription !== undefined && { ogDescription }),
      ...(ogDescriptionFr !== undefined && { ogDescriptionFr }),
      ...(ogImage !== undefined && { ogImage }),
      ...(ogType !== undefined && { ogType }),
      ...(ogUrl !== undefined && { ogUrl }),
      ...(ogSiteName !== undefined && { ogSiteName }),
      ...(ogLocale !== undefined && { ogLocale }),
      ...(ogImageAlt !== undefined && { ogImageAlt }),
      ...(ogImageWidth !== undefined && { ogImageWidth }),
      ...(ogImageHeight !== undefined && { ogImageHeight }),
      ...(ogUpdatedTime !== undefined && { ogUpdatedTime }),
      // Article-specific OpenGraph
      ...(articleAuthor !== undefined && { articleAuthor }),
      ...(articlePublishedTime !== undefined && { articlePublishedTime }),
      ...(articleModifiedTime !== undefined && { articleModifiedTime }),
      ...(articleSection !== undefined && { articleSection }),
      ...(articleTag !== undefined && { articleTag }),
      // Profile-specific OpenGraph
      ...(profileFirstName !== undefined && { profileFirstName }),
      ...(profileLastName !== undefined && { profileLastName }),
      ...(profileUsername !== undefined && { profileUsername }),
      ...(profileGender !== undefined && { profileGender }),
      // Twitter Card Properties
      ...(twitterCard !== undefined && { twitterCard }),
      ...(twitterSite !== undefined && { twitterSite }),
      ...(twitterCreator !== undefined && { twitterCreator }),
      ...(twitterTitle !== undefined && { twitterTitle }),
      ...(twitterDescription !== undefined && { twitterDescription }),
      ...(twitterImage !== undefined && { twitterImage }),
      ...(twitterImageAlt !== undefined && { twitterImageAlt }),
      // Twitter App Card Properties
      ...(twitterAppNameIphone !== undefined && { twitterAppNameIphone }),
      ...(twitterAppIdIphone !== undefined && { twitterAppIdIphone }),
      ...(twitterAppUrlIphone !== undefined && { twitterAppUrlIphone }),
      ...(twitterAppNameGoogleplay !== undefined && { twitterAppNameGoogleplay }),
      ...(twitterAppIdGoogleplay !== undefined && { twitterAppIdGoogleplay }),
      ...(twitterAppUrlGoogleplay !== undefined && { twitterAppUrlGoogleplay }),
      // Twitter Player Card Properties
      ...(twitterPlayer !== undefined && { twitterPlayer }),
      ...(twitterPlayerWidth !== undefined && { twitterPlayerWidth }),
      ...(twitterPlayerHeight !== undefined && { twitterPlayerHeight }),
      ...(twitterPlayerStream !== undefined && { twitterPlayerStream }),
      ...(twitterPlayerStreamContentType !== undefined && { twitterPlayerStreamContentType }),
      ...(canonicalUrl !== undefined && { canonicalUrl })
    };

    const metaTag = await prisma.sEOMetaTag.update({
      where: { page },
      data: updateData
    });

    return NextResponse.json(metaTag);
  } catch (error) {
    console.error('Error updating SEO meta tag:', error);
    return NextResponse.json({ error: 'Failed to update SEO meta tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
    }

    // Check if meta tag exists
    const existingMetaTag = await prisma.sEOMetaTag.findUnique({
      where: { page }
    });

    if (!existingMetaTag) {
      return NextResponse.json(
        { error: 'Meta tags not found for this page' },
        { status: 404 }
      );
    }

    await prisma.sEOMetaTag.delete({
      where: { page }
    });

    return NextResponse.json({ message: 'Meta tags deleted successfully' });
  } catch (error) {
    console.error('Error deleting SEO meta tag:', error);
    return NextResponse.json({ error: 'Failed to delete SEO meta tag' }, { status: 500 });
  }
}
