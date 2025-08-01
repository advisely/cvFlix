import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Education } from '@prisma/client'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json()
  const updatedEducation: Education = await prisma.education.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(updatedEducation)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.education.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
