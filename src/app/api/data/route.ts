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

    const educations = await prisma.education.findMany({
      include: {
        media: true,
      },
    })
    const certifications = await prisma.certification.findMany({
      include: {
        media: true,
      },
    })
    const skills = await prisma.skill.findMany({
      include: {
        media: true,
      },
    })

    const highlights = await prisma.highlight.findMany({
      include: {
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
          educationLabel: "Education",
          certificationsLabel: "Certifications",
          skillsLabel: "Skills",
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

    // Combine all companies and sort by their most recent experience start date
    const portfolioExperiences = companies
      .filter(company => company.experiences && company.experiences.length > 0)
      .sort((a, b) => {
        const aStartDate = new Date(a.experiences[0]!.startDate);
        const bStartDate = new Date(b.experiences[0]!.startDate);
        return bStartDate.getTime() - aStartDate.getTime(); // DESC order (most recent first)
      });

    return NextResponse.json({
      portfolioExperiences,
      educations,
      certifications,
      skills,
      highlights,
      navbarConfig,
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
