import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeKind, KnowledgeLevel } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const includeMedia = {
  media: true,
}
const knowledgeOrderBy = [{ startDate: 'desc' as const }, { createdAt: 'desc' as const }]

type KnowledgeGroups = Record<KnowledgeKind, unknown[]>

const createEmptyGroups = (): KnowledgeGroups => ({
  EDUCATION: [],
  CERTIFICATION: [],
  SKILL: [],
  COURSE: [],
  AWARD: [],
})

type KnowledgePayload = {
  kind: KnowledgeKind
  title: string
  titleFr?: string | null
  issuer?: string | null
  issuerFr?: string | null
  category?: string | null
  categoryFr?: string | null
  description?: string | null
  descriptionFr?: string | null
  competencyLevel?: KnowledgeLevel | null
  startDate?: string | null
  endDate?: string | null
  validUntil?: string | null
  isCurrent?: boolean
  url?: string | null
  location?: string | null
  media?: { id: string }[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kind = searchParams.get('kind') as KnowledgeKind | null

  try {
    const knowledge = await prisma.knowledge.findMany({
      where: kind ? { kind } : undefined,
      include: includeMedia,
      orderBy: knowledgeOrderBy,
    })

    if (kind) {
      return NextResponse.json(knowledge)
    }

    const grouped = knowledge.reduce((acc, entry) => {
      acc[entry.kind].push(entry)
      return acc
    }, createEmptyGroups())

    return NextResponse.json(grouped)
  } catch (error) {
    console.error('Knowledge GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as KnowledgePayload

    if (!data.kind || !Object.values(KnowledgeKind).includes(data.kind)) {
      return NextResponse.json({ error: 'Invalid knowledge kind' }, { status: 400 })
    }

    const { media, startDate, endDate, validUntil, ...baseData } = data

    const knowledge = await prisma.knowledge.create({
      data: {
        ...baseData,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        ...(media?.length
          ? {
              media: {
                connect: media.map(({ id }) => ({ id })),
              },
            }
          : {}),
      },
      include: includeMedia,
    })

    return NextResponse.json(knowledge, { status: 201 })
  } catch (error) {
    console.error('Knowledge POST error:', error)
    return NextResponse.json({ error: 'Failed to create knowledge entry' }, { status: 500 })
  }
}
