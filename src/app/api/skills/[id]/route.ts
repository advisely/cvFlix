import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const updatedSkill = await prisma.skill.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(updatedSkill)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.skill.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
