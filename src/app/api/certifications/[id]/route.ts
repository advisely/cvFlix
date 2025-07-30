import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const updatedCertification = await prisma.certification.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(updatedCertification)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.certification.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
