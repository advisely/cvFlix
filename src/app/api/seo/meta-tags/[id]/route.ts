import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOMetaTagUpdateRequest } from '@/types/seo';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metaTag = await prisma.sEOMetaTag.findUnique({
      where: { id: params.id }
    });
    
    if (!metaTag) {
      return NextResponse.json({ error: 'Meta tag not found' }, { status: 404 });
    }
    
    return NextResponse.json(metaTag);
  } catch (error) {
    console.error('Error fetching SEO meta tag:', error);
    return NextResponse.json({ error: 'Failed to fetch SEO meta tag' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: SEOMetaTagUpdateRequest = await request.json();
    const {
      page,
      title,
      titleFr,
      description,
      descriptionFr,
      keywords,
      keywordsFr,
      ogTitle,
      ogTitleFr,
      ogDescription,
      ogDescriptionFr,
      ogImage,
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

    // Validate page format if provided
    if (page && !page.startsWith('/')) {
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

    // Check if meta tag exists
    const existingMetaTag = await prisma.sEOMetaTag.findUnique({
      where: { id: params.id }
    });

    if (!existingMetaTag) {
      return NextResponse.json(
        { error: 'Meta tag not found' },
        { status: 404 }
      );
    }

    // If page is being changed, check if another meta tag with the same page exists
    if (page && page !== existingMetaTag.page) {
      const duplicateMetaTag = await prisma.sEOMetaTag.findUnique({
        where: { page }
      });
      
      if (duplicateMetaTag) {
        return NextResponse.json(
          { error: 'Meta tags for this page already exist' },
          { status: 409 }
        );
      }
    }

    const updateData = {
      ...(page !== undefined && { page }),
      ...(title !== undefined && { title }),
      ...(titleFr !== undefined && { titleFr }),
      ...(description !== undefined && { description }),
      ...(descriptionFr !== undefined && { descriptionFr }),
      ...(keywords !== undefined && { keywords: keywords || null }),
      ...(keywordsFr !== undefined && { keywordsFr: keywordsFr || null }),
      ...(ogTitle !== undefined && { ogTitle: ogTitle || null }),
      ...(ogTitleFr !== undefined && { ogTitleFr: ogTitleFr || null }),
      ...(ogDescription !== undefined && { ogDescription: ogDescription || null }),
      ...(ogDescriptionFr !== undefined && { ogDescriptionFr: ogDescriptionFr || null }),
      ...(ogImage !== undefined && { ogImage: ogImage || null }),
      ...(canonicalUrl !== undefined && { canonicalUrl: canonicalUrl || null })
    };

    const metaTag = await prisma.sEOMetaTag.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(metaTag);
  } catch (error) {
    console.error('Error updating SEO meta tag:', error);
    return NextResponse.json({ error: 'Failed to update SEO meta tag' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if meta tag exists
    const existingMetaTag = await prisma.sEOMetaTag.findUnique({
      where: { id: params.id }
    });

    if (!existingMetaTag) {
      return NextResponse.json(
        { error: 'Meta tag not found' },
        { status: 404 }
      );
    }

    await prisma.sEOMetaTag.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Meta tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting SEO meta tag:', error);
    return NextResponse.json({ error: 'Failed to delete SEO meta tag' }, { status: 500 });
  }
}