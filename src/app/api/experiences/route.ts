
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const experiences = await prisma.experience.findMany()
  return NextResponse.json(experiences)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newExperience = await prisma.experience.create({ data: body })
  return NextResponse.json(newExperience)
}
