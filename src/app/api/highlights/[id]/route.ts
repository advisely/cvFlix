import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { title, titleFr, companyId, description, descriptionFr, startDate } = body;
    const { id } = await params;

    // Validate required fields
    if (!title || !titleFr || !companyId || !startDate) {
      return NextResponse.json(
        { error: 'Title (English and French), company, and start date are required' },
        { status: 400 }
      );
    }

    const highlight = await prisma.highlight.update({
      where: { id },
      data: {
        title,
        titleFr,
        companyId,
        description: description || null,
        descriptionFr: descriptionFr || null,
        startDate: new Date(startDate),
      },
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
    });

    return NextResponse.json(highlight);
  } catch (error: unknown) {
    console.error('Error updating highlight:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update highlight' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete associated media from all relationships
    await prisma.media.deleteMany({
      where: {
        OR: [
          { highlightId: id },
          { highlightHomepageId: id },
          { highlightCardId: id }
        ]
      },
    });

    // Then delete the highlight
    await prisma.highlight.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting highlight:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
  }
}
