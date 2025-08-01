import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Skill } from '@prisma/client'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json()
  const updatedSkill: Skill = await prisma.skill.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(updatedSkill)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.skill.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
