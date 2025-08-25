import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 DEBUG API: Fetching companies...');
    
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
    });

    console.log('🔍 DEBUG API: Raw companies:', companies.map(c => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoUrl,
      experienceCount: c.experiences?.length || 0
    })));

    const portfolioExperiences = companies
      .filter(company => company.experiences && company.experiences.length > 0)
      .sort((a, b) => {
        const aStartDate = new Date(a.experiences[0]!.startDate);
        const bStartDate = new Date(b.experiences[0]!.startDate);
        return bStartDate.getTime() - aStartDate.getTime();
      });

    console.log('🔍 DEBUG API: Filtered experiences:', portfolioExperiences.map(c => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoUrl
    })));

    // Test basic response
    const response = {
      portfolioExperiences,
      debug: 'This is a debug response',
      timestamp: new Date().toISOString()
    };

    console.log('🔍 DEBUG API: About to return response...');
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ DEBUG API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
}