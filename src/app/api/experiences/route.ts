
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'



export async function GET() {
  const experiences = await prisma.experience.findMany({ include: { company: true } })
  return NextResponse.json(experiences)
}

export async function POST(request: Request) {
  const body = await request.json()
  const createdExperience = await prisma.experience.create({ data: body })
  const newExperienceWithCompany = await prisma.experience.findUnique({
    where: { id: createdExperience.id },
    include: { company: true },
  });
  return NextResponse.json(newExperienceWithCompany)
}
