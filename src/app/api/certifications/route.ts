
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const certifications = await prisma.certification.findMany()
  return NextResponse.json(certifications)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newCertification = await prisma.certification.create({ data: body })
  return NextResponse.json(newCertification)
}
