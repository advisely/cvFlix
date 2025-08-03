import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { title, company, startDate } = body;
    const { id } = await params;

    const highlight = await prisma.highlight.update({
      where: { id },
      data: {
        title,
        company,
        startDate: new Date(startDate),
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error updating highlight:', error);
    return NextResponse.json({ error: 'Failed to update highlight' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // First delete associated media
    await prisma.media.deleteMany({
      where: { highlightId: id },
    });

    // Then delete the highlight
    await prisma.highlight.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
  }
}
