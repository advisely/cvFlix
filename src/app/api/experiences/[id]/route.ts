import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Experience } from '@prisma/client'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json()
  const updatedExperience: Experience = await prisma.experience.update({
    where: { id },
    data: body,
    include: { company: true },
  });
  return NextResponse.json(updatedExperience);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.experience.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
