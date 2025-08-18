import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { url, type, mediaType = 'legacy' } = body;
    const { id: highlightId } = await params;

    // Validate required fields
    if (!url || !type) {
      return NextResponse.json(
        { error: 'URL and type are required' },
        { status: 400 }
      );
    }

    // Validate mediaType
    if (!['legacy', 'homepage', 'card'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'MediaType must be one of: legacy, homepage, card' },
        { status: 400 }
      );
    }

    // Create media with appropriate relationship
    const mediaData: {
      url: string;
      type: string;
      highlightId?: string;
      highlightHomepageId?: string;
      highlightCardId?: string;
    } = {
      url,
      type,
    };

    switch (mediaType) {
      case 'homepage':
        mediaData.highlightHomepageId = highlightId;
        break;
      case 'card':
        mediaData.highlightCardId = highlightId;
        break;
      default:
        mediaData.highlightId = highlightId;
    }

    const media = await prisma.media.create({
      data: mediaData,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error creating highlight media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: highlightId } = await params;
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('type');

    let whereCondition: {
      highlightId?: string;
      highlightHomepageId?: string;
      highlightCardId?: string;
      OR?: Array<{
        highlightId?: string;
        highlightHomepageId?: string;
        highlightCardId?: string;
      }>;
    };

    switch (mediaType) {
      case 'homepage':
        whereCondition = { highlightHomepageId: highlightId };
        break;
      case 'card':
        whereCondition = { highlightCardId: highlightId };
        break;
      case 'legacy':
        whereCondition = { highlightId: highlightId };
        break;
      default:
        // Return all media for this highlight
        whereCondition = {
          OR: [
            { highlightId: highlightId },
            { highlightHomepageId: highlightId },
            { highlightCardId: highlightId }
          ]
        };
    }

    const media = await prisma.media.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching highlight media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
