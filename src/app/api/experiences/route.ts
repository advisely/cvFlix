import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const experiences = await prisma.experience.findMany({
    include: {
      company: true,
      dateRanges: {
        orderBy: { startDate: 'asc' }
      },
      media: true,
      homepageMedia: true,
      cardMedia: true
    },
    orderBy: {
      startDate: 'desc'
    }
  })
  
  // Add computed fields for compatibility
  const enhancedExperiences = experiences.map(exp => ({
    ...exp,
    earliestStartDate: exp.dateRanges[0]?.startDate || exp.startDate,
    latestEndDate: exp.dateRanges.reduce((latest, range) => 
      !latest || (range.endDate && range.endDate > latest) ? range.endDate : latest, null
    ) || exp.endDate,
    isCurrentPosition: exp.dateRanges.some(range => !range.endDate) || !exp.endDate,
    formattedPeriods: exp.dateRanges.length > 0 
      ? formatDateRanges(exp.dateRanges)
      : formatSingleDate(exp.startDate, exp.endDate)
  }))
  
  return NextResponse.json(enhancedExperiences)
}

function formatDateRanges(ranges) {
  return ranges.map(range => {
    const startYear = new Date(range.startDate).getFullYear()
    if (!range.endDate) {
      return `${startYear}-Present`
    }
    const endYear = new Date(range.endDate).getFullYear()
    return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`
  }).join(', ')
}

function formatSingleDate(startDate, endDate) {
  const startYear = new Date(startDate).getFullYear()
  if (!endDate) {
    return `${startYear}-Present`
  }
  const endYear = new Date(endDate).getFullYear()
  return startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`
}

export async function POST(request: NextRequest) {
  const {
    title,
    titleFr,
    companyId,
    description,
    descriptionFr,
    startDate,
    endDate,
    dateRanges = [],
    media = [],
    homepageMedia = [],
    cardMedia = []
  } = await request.json();

  // Use dateRanges if provided, otherwise fall back to startDate/endDate
  const rangesToCreate = dateRanges.length > 0 
    ? dateRanges 
    : [{ startDate, endDate }];

  const createdExperience = await prisma.experience.create({
    data: {
      title,
      titleFr,
      company: { connect: { id: companyId } },
      description,
      descriptionFr,
      startDate, // Keep for backward compatibility
      endDate,   // Keep for backward compatibility
      dateRanges: {
        create: rangesToCreate.map(range => ({
          startDate: new Date(range.startDate),
          endDate: range.endDate ? new Date(range.endDate) : null
        }))
      },
      media: { connect: (media || []).map((m: { id: string }) => ({ id: m.id })) },
      homepageMedia: { connect: (homepageMedia || []).map((m: { id: string }) => ({ id: m.id })) },
      cardMedia: { connect: (cardMedia || []).map((m: { id: string }) => ({ id: m.id })) },
    },
    include: {
      company: true,
      dateRanges: {
        orderBy: { startDate: 'asc' }
      },
      media: true,
      homepageMedia: true,
      cardMedia: true
    },
  });

  return NextResponse.json(createdExperience);
}
