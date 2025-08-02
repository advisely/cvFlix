import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        experience: true,
        education: true,
        skill: true,
        certification: true
      }
    })
    return NextResponse.json(media)
  } catch (error) {
    console.error('Failed to fetch media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const media = await prisma.media.create({
      data: body
    })
    return NextResponse.json(media)
  } catch (error) {
    console.error('Failed to create media:', error)
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 })
  }
}
