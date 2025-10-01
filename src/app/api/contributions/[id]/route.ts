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

type ContributionUpdatePayload = {
  id?: string
  title?: string | null
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
  isCurrent?: boolean | null
  url?: string | null
  downloadUrl?: string | null
  thumbnailUrl?: string | null
  displayOrder?: number | string | null
  media?: { id: string }[] | null
}

interface RouteParams {
  params: { id: string }
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
    return undefined
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const mapMediaSet = (media?: { id: string }[] | null) => {
  if (media === undefined) {
    return undefined
  }

  const ids = (media ?? [])
    .map(({ id }) => id)
    .filter((id): id is string => Boolean(id))

  return {
    set: ids.map((id) => ({ id })),
  }
}

const getContributionClient = () => (prisma as any).contribution as any

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const contribution = await getContributionClient().findUnique({
      where: { id: params.id },
      include: includeConfig,
    })

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    return NextResponse.json(contribution)
  } catch (error) {
    console.error('Contribution detail GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch contribution' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req: request as never })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = (await request.json()) as ContributionUpdatePayload

    if (data.type && !isValidContributionType(data.type)) {
      return NextResponse.json({ error: 'Invalid contribution type' }, { status: 400 })
    }

    const contribution = await getContributionClient().update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title ?? null } : {}),
        ...(data.titleFr !== undefined ? { titleFr: data.titleFr ?? null } : {}),
        ...(data.organization !== undefined ? { organization: data.organization ?? null } : {}),
        ...(data.organizationFr !== undefined ? { organizationFr: data.organizationFr ?? null } : {}),
        ...(data.role !== undefined ? { role: data.role ?? null } : {}),
        ...(data.roleFr !== undefined ? { roleFr: data.roleFr ?? null } : {}),
        ...(data.description !== undefined ? { description: data.description ?? null } : {}),
        ...(data.descriptionFr !== undefined ? { descriptionFr: data.descriptionFr ?? null } : {}),
        ...(data.type !== undefined ? { type: data.type ?? 'OPEN_SOURCE' } : {}),
        ...(data.impact !== undefined ? { impact: data.impact ?? null } : {}),
        ...(data.impactFr !== undefined ? { impactFr: data.impactFr ?? null } : {}),
        ...(data.startDate !== undefined ? { startDate: parseOptionalDate(data.startDate) } : {}),
        ...(data.endDate !== undefined ? { endDate: parseOptionalDate(data.endDate) } : {}),
        ...(data.isCurrent !== undefined ? { isCurrent: data.isCurrent ?? false } : {}),
        ...(data.url !== undefined ? { url: data.url ?? null } : {}),
        ...(data.downloadUrl !== undefined ? { downloadUrl: data.downloadUrl ?? null } : {}),
        ...(data.thumbnailUrl !== undefined ? { thumbnailUrl: data.thumbnailUrl ?? null } : {}),
        ...(data.displayOrder !== undefined
          ? { displayOrder: normalizeDisplayOrder(data.displayOrder) ?? 0 }
          : {}),
        media: mapMediaSet(data.media),
      },
      include: includeConfig,
    })

    return NextResponse.json(contribution)
  } catch (error) {
    console.error('Contribution PUT error:', error)
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req: request as never })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contributionClient = getContributionClient()
    await prisma.$transaction([
      prisma.media.deleteMany({ where: { contributionId: params.id } as any }),
      contributionClient.delete({ where: { id: params.id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contribution DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 })
  }
}
