import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeKind, KnowledgeLevel } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const includeMedia = {
  media: true,
}

interface RouteParams {
  params: { id: string }
}

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
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params

  try {
    const knowledge = await prisma.knowledge.findUnique({
      where: { id },
      include: includeMedia,
    })

    if (!knowledge) {
      return NextResponse.json({ error: 'Knowledge entry not found' }, { status: 404 })
    }

    return NextResponse.json(knowledge)
  } catch (error) {
    console.error('Knowledge detail GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch knowledge entry' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = params

  try {
    const data = (await request.json()) as KnowledgePayload

    const knowledge = await prisma.knowledge.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
      include: includeMedia,
    })

    return NextResponse.json(knowledge)
  } catch (error) {
    console.error('Knowledge PUT error:', error)
    return NextResponse.json({ error: 'Failed to update knowledge entry' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = params

  try {
    await prisma.$transaction([
      prisma.media.deleteMany({ where: { knowledgeId: id } }),
      prisma.knowledge.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete knowledge entry' }, { status: 500 })
  }
}
