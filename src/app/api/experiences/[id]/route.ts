import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const {
    title,
    companyId,
    description,
    startDate,
    endDate,
    media,
    homepageMedia,
    cardMedia
  } = await request.json();

  const updatedExperience = await prisma.experience.update({
    where: { id },
    data: {
      title,
      company: { connect: { id: companyId } },
      description,
      startDate,
      endDate,
      media: { set: media.map((m: { id: string }) => ({ id: m.id })) },
      homepageMedia: { set: homepageMedia.map((m: { id: string }) => ({ id: m.id })) },
      cardMedia: { set: cardMedia.map((m: { id: string }) => ({ id: m.id })) },
    },
    include: {
      company: true,
      media: true,
      homepageMedia: true,
      cardMedia: true
    },
  });

  return NextResponse.json(updatedExperience);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.experience.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
