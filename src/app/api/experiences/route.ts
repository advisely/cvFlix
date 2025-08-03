import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const experiences = await prisma.experience.findMany({
    include: {
      company: true,
      media: true
    },
    orderBy: {
      startDate: 'desc'
    }
  })
  return NextResponse.json(experiences)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const createdExperience = await prisma.experience.create({ data: body })
  const newExperienceWithCompany = await prisma.experience.findUnique({
    where: { id: createdExperience.id },
    include: {
      company: true,
      media: true
    },
  });
  return NextResponse.json(newExperienceWithCompany)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const updatedExperience = await prisma.experience.update({
    where: { id: params.id },
    data: body,
  })
  const updatedExperienceWithCompany = await prisma.experience.findUnique({
    where: { id: updatedExperience.id },
    include: {
      company: true,
      media: true
    },
  });
  return NextResponse.json(updatedExperienceWithCompany)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.experience.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Experience deleted successfully' })
}
