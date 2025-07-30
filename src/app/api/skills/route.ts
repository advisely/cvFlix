
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const skills = await prisma.skill.findMany()
  return NextResponse.json(skills)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newSkill = await prisma.skill.create({ data: body })
  return NextResponse.json(newSkill)
}
