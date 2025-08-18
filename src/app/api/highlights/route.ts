import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const highlights = await prisma.highlight.findMany({
      include: {
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
  try {
    const body = await request.json();
    const { title, company, description, startDate } = body;

    // Validate required fields
    if (!title || !company || !startDate) {
      return NextResponse.json(
        { error: 'Title, company, and start date are required' }, 
        { status: 400 }
      );
    }

    const highlight = await prisma.highlight.create({
      data: {
        title,
        company,
        description: description || null,
        startDate: new Date(startDate),
      },
      include: {
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
