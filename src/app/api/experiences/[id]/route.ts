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
      companyId,
      description,
      startDate,
      endDate,
      media = [],          // FIXED: Default empty array to prevent undefined
      homepageMedia = [],  // FIXED: Default empty array to prevent undefined  
      cardMedia = []       // FIXED: Default empty array to prevent undefined
    } = await request.json();

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        title,
        company: { connect: { id: companyId } },
        description,
        startDate,
        endDate,
        // FIXED: Safe array handling with fallback to empty arrays
        media: { set: (media || []).map((m: { id: string }) => ({ id: m.id })) },
        homepageMedia: { set: (homepageMedia || []).map((m: { id: string }) => ({ id: m.id })) },
        cardMedia: { set: (cardMedia || []).map((m: { id: string }) => ({ id: m.id })) },
      },
      include: {
        company: true,
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
