import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const includeConfig = {
  media: true,
}

type MediaInput = { id?: string | null } | null

interface RecommendedBookPayload {
  title: string
  titleFr?: string | null
  author: string
  authorFr?: string | null
  recommendedReason?: string | null
  recommendedReasonFr?: string | null
  summary?: string | null
  summaryFr?: string | null
  purchaseUrl?: string | null
  priority?: number | string | null
  coverImageUrl?: string | null
  media?: MediaInput[] | null
}

const normalizePriority = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') {
    return 0
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapMediaSet = (media?: MediaInput[] | null) =>
  (media ?? [])
    .map((item) => item?.id)
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ id }))

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const book = await prisma.recommendedBook.findUnique({
      where: { id: params.id },
      include: includeConfig,
    })

    if (!book) {
      return NextResponse.json({ error: 'Recommended book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Recommended books GET by id error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommended book' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request as never })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = (await request.json()) as RecommendedBookPayload

    if (!data.title || !data.author) {
      return NextResponse.json({ error: 'Title and author are required' }, { status: 400 })
    }

    const book = await prisma.recommendedBook.update({
      where: { id: params.id },
      data: {
        title: data.title,
        titleFr: data.titleFr ?? null,
        author: data.author,
        authorFr: data.authorFr ?? null,
        recommendedReason: data.recommendedReason ?? null,
        recommendedReasonFr: data.recommendedReasonFr ?? null,
        summary: data.summary ?? null,
        summaryFr: data.summaryFr ?? null,
        purchaseUrl: data.purchaseUrl ?? null,
        priority: normalizePriority(data.priority),
        coverImageUrl: data.coverImageUrl ?? null,
        media: {
          set: mapMediaSet(data.media),
        },
      },
      include: includeConfig,
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Recommended books PUT error:', error)
    return NextResponse.json({ error: 'Failed to update recommended book' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request as never })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.recommendedBook.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recommended books DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete recommended book' }, { status: 500 })
  }
}
