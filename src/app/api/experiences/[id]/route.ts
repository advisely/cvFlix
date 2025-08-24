import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  
  try {
    const {
      title,
      titleFr,
      companyId,
      description,
      descriptionFr,
      startDate,
      endDate,
      dateRanges = [],
      media = [],
      homepageMedia = [],  
      cardMedia = []
    } = await request.json();

    // Use dateRanges if provided, otherwise fall back to startDate/endDate
    const rangesToUpdate = dateRanges.length > 0 
      ? dateRanges 
      : [{ startDate, endDate }];

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        title,
        titleFr,
        company: { connect: { id: companyId } },
        description,
        descriptionFr,
        startDate, // Keep for backward compatibility
        endDate,   // Keep for backward compatibility
        dateRanges: {
          deleteMany: {}, // Remove existing date ranges
          create: rangesToUpdate.map(range => ({
            startDate: new Date(range.startDate),
            endDate: range.endDate ? new Date(range.endDate) : null
          }))
        },
        media: { set: (media || []).map((m: { id: string }) => ({ id: m.id })) },
        homepageMedia: { set: (homepageMedia || []).map((m: { id: string }) => ({ id: m.id })) },
        cardMedia: { set: (cardMedia || []).map((m: { id: string }) => ({ id: m.id })) },
      },
      include: {
        company: true,
        dateRanges: {
          orderBy: { startDate: 'asc' }
        },
        media: true,
        homepageMedia: true,
        cardMedia: true
      },
    });

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  
  try {
    await prisma.experience.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}
