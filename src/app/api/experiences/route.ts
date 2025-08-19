import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const experiences = await prisma.experience.findMany({
    include: {
      company: true,
      media: true,
      homepageMedia: true,
      cardMedia: true
    },
    orderBy: {
      startDate: 'desc'
    }
  })
  return NextResponse.json(experiences)
}

export async function POST(request: NextRequest) {
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

  const createdExperience = await prisma.experience.create({
    data: {
      title,
      company: { connect: { id: companyId } },
      description,
      startDate,
      endDate,
      media: { connect: media.map((m: { id: string }) => ({ id: m.id })) },
      homepageMedia: { connect: homepageMedia.map((m: { id: string }) => ({ id: m.id })) },
      cardMedia: { connect: cardMedia.map((m: { id: string }) => ({ id: m.id })) },
    },
    include: {
      company: true,
      media: true,
      homepageMedia: true,
      cardMedia: true
    },
  });

  return NextResponse.json(createdExperience);
}
