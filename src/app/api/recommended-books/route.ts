import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const includeConfig = {
  media: true,
}

const getRecommendedBookClient = () => (prisma as any).recommendedBook as any

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
  media?: { id: string }[] | null
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

export async function GET() {
  try {
    const books = await getRecommendedBookClient().findMany({
      include: includeConfig,
      orderBy: [
        { priority: 'asc' },
        { title: 'asc' },
      ],
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Recommended books GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommended books' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request as never })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = (await request.json()) as RecommendedBookPayload

    if (!data.title || !data.author) {
      return NextResponse.json({ error: 'Title and author are required' }, { status: 400 })
    }

    const book = await getRecommendedBookClient().create({
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
        media:
          data.media !== undefined
            ? {
                connect: (data.media ?? [])
                  .map(({ id }) => id)
                  .filter((id): id is string => Boolean(id))
                  .map((id) => ({ id })),
              }
            : undefined,
      },
      include: includeConfig,
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Recommended books POST error:', error)
    return NextResponse.json({ error: 'Failed to create recommended book' }, { status: 500 })
  }
}
