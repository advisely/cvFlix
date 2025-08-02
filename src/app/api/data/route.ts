import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        experiences: {
          include: {
            media: true,
          },
        },
      },
    })

    const educations = await prisma.education.findMany()
    const certifications = await prisma.certification.findMany()
    const skills = await prisma.skill.findMany()

    const singleExperiences = companies.filter((company) => company.experiences.length === 1)
    const seriesExperiences = companies.filter((company) => company.experiences.length > 1)

    return NextResponse.json({
      singleExperiences,
      seriesExperiences,
      educations,
      certifications,
      skills,
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
