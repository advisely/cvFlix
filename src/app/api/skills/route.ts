
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'



export async function GET() {
  const skills = await prisma.skill.findMany()
  return NextResponse.json(skills)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newSkill = await prisma.skill.create({ data: body })
  return NextResponse.json(newSkill)
}
