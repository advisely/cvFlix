import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const updatedExperience = await prisma.experience.update({
    where: { id: params.id },
    data: body,
    include: { company: true },
  });
  return NextResponse.json(updatedExperience);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.experience.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
