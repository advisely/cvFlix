
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'



export async function GET() {
  const education = await prisma.education.findMany()
  return NextResponse.json(education)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newEducation = await prisma.education.create({ data: body })
  return NextResponse.json(newEducation)
}
