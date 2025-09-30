import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        experience: true,
        experienceHomepage: true,
        experienceCard: true,
        knowledge: true,
        highlight: true,
        highlightHomepage: true,
        highlightCard: true,
      },
    })
    return NextResponse.json(media)
  } catch (error) {
    console.error('Failed to fetch media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request as never });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json()
    const media = await prisma.media.delete({
      where: { id: body.id }
    })
    return NextResponse.json(media)
  } catch (error) {
    console.error('Failed to delete media:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request as never });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
