import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const highlights = await prisma.highlight.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            nameFr: true,
            logoUrl: true,
          }
        },
        media: true,
        homepageMedia: true,
        cardMedia: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    return NextResponse.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request as never });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, titleFr, companyId, description, descriptionFr, startDate } = body;

    // Validate required fields
    if (!title || !titleFr || !companyId || !startDate) {
      return NextResponse.json(
        { error: 'Title (English and French), company, and start date are required' },
        { status: 400 }
      );
    }

    const highlight = await prisma.highlight.create({
      data: {
        title,
        titleFr,
        companyId,
        description: description || null,
        descriptionFr: descriptionFr || null,
        startDate: new Date(startDate),
      },
      include: {
        company: true,
        media: true,
        homepageMedia: true,
        cardMedia: true,
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}
