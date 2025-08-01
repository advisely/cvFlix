import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Certification } from '@prisma/client'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json()
  const updatedCertification: Certification = await prisma.certification.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(updatedCertification)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.certification.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
