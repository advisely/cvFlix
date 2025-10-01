import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        experiences: {
          include: {
            media: true,
            homepageMedia: true,
            cardMedia: true,
            dateRanges: {
              orderBy: {
                startDate: 'asc',
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    })

    const knowledgeEntries = await prisma.knowledge.findMany({
      include: {
        media: true,
      },
      orderBy: [
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    const educations = knowledgeEntries.filter((entry) => entry.kind === 'EDUCATION')
    const certifications = knowledgeEntries.filter((entry) => entry.kind === 'CERTIFICATION')
    const skills = knowledgeEntries.filter((entry) => entry.kind === 'SKILL')

    const contributions = await prisma.contribution.findMany({
      include: {
        media: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    const recommendedBooks = await prisma.recommendedBook.findMany({
      include: {
        media: true,
      },
      orderBy: [
        { priority: 'asc' },
        { title: 'asc' },
      ],
    })

    const highlights = await prisma.highlight.findMany({
      include: {
        company: true,
        homepageMedia: true,
        cardMedia: true,
        media: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    // Get navbar configuration
    let navbarConfig = await prisma.navbarConfig.findFirst()
    if (!navbarConfig) {
      navbarConfig = await prisma.navbarConfig.create({
        data: {
          logoText: "resumeflex",
          logoImageUrl: null,
          useImageLogo: false,
          workExperienceLabel: "Portfolio",
          careerSeriesLabel: "Career Series",
          knowledgeLabel: "Knowledge",
          knowledgeLabelFr: "Connaissances",
          backgroundColor: "#141414",
          backgroundType: "color",
          backgroundImageUrl: null,
          gradientFrom: "#141414",
          gradientTo: "#1a1a1a",
          fontFamily: "Inter",
          logoFontFamily: "Inter"
        }
      })
    }

    // Company data processing for portfolio experiences

    // Combine all companies and sort by their most recent experience start date
    const portfolioExperiences = companies
      .filter(company => company.experiences && company.experiences.length > 0)
      .sort((a, b) => {
        const aStartDate = new Date(a.experiences[0]!.startDate);
        const bStartDate = new Date(b.experiences[0]!.startDate);
        return bStartDate.getTime() - aStartDate.getTime(); // DESC order (most recent first)
      });

    // Portfolio experiences sorted by most recent experience

    return NextResponse.json({
      portfolioExperiences,
      educations,
      certifications,
      skills,
      highlights,
      navbarConfig,
      contributions,
      recommendedBooks,
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
