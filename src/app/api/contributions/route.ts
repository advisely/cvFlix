import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const includeConfig = {
  media: true,
}

const CONTRIBUTION_TYPES = [
  'OPEN_SOURCE',
  'CORPORATE',
  'COMMUNITY',
  'RESEARCH',
  'THOUGHT_LEADERSHIP',
] as const

type ContributionType = (typeof CONTRIBUTION_TYPES)[number]

const prismaClient = prisma as any
const contributionClient = prismaClient.contribution as any

type MediaRef = {
  id: string
}

type ContributionPayload = {
  title: string
  titleFr?: string | null
  organization?: string | null
  organizationFr?: string | null
  role?: string | null
  roleFr?: string | null
  description?: string | null
  descriptionFr?: string | null
  type?: ContributionType | null
  impact?: string | null
  impactFr?: string | null
  startDate?: string | null
  endDate?: string | null
  isCurrent?: boolean
  url?: string | null
  downloadUrl?: string | null
  thumbnailUrl?: string | null
  displayOrder?: number | string | null
  media?: MediaRef[] | null
}

const isValidContributionType = (value: string | null): value is ContributionType =>
  !!value && (CONTRIBUTION_TYPES as readonly string[]).includes(value)

const parseOptionalDate = (value?: string | null) => {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const normalizeDisplayOrder = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') {
    return 0
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const typeParam = searchParams.get('type')
  const limitParam = searchParams.get('limit')

  const where = isValidContributionType(typeParam) ? { type: typeParam } : undefined
  const take = limitParam ? Number.parseInt(limitParam, 10) : undefined

  try {
    const contributions = await contributionClient.findMany({
      where,
      include: includeConfig,
      orderBy: [
        { displayOrder: 'asc' },
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
      ...(take && Number.isFinite(take) && take > 0 ? { take } : {}),
    })

    return NextResponse.json(contributions)
  } catch (error) {
    console.error('Contributions GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request as never })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = (await request.json()) as ContributionPayload

    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (data.type && !isValidContributionType(data.type)) {
      return NextResponse.json({ error: 'Invalid contribution type' }, { status: 400 })
    }

    const contribution = await contributionClient.create({
      data: {
        title: data.title,
        titleFr: data.titleFr ?? null,
        organization: data.organization ?? null,
        organizationFr: data.organizationFr ?? null,
        role: data.role ?? null,
        roleFr: data.roleFr ?? null,
        description: data.description ?? null,
        descriptionFr: data.descriptionFr ?? null,
        type: data.type ?? 'OPEN_SOURCE',
        impact: data.impact ?? null,
        impactFr: data.impactFr ?? null,
        startDate: parseOptionalDate(data.startDate),
        endDate: parseOptionalDate(data.endDate),
        isCurrent: data.isCurrent ?? false,
        url: data.url ?? null,
        downloadUrl: data.downloadUrl ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        displayOrder: normalizeDisplayOrder(data.displayOrder),
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

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error('Contributions POST error:', error)
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 })
  }
}
