// Debug script to test API data fetching
const { PrismaClient } = require('@prisma/client');

async function testApiData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Prisma query for companies...\n');
    
    // Test the exact same query as the API
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

    console.log(`📊 Found ${companies.length} companies total\n`);

    companies.forEach((company, index) => {
      console.log(`Company ${index + 1}:`);
      console.log(`  ID: ${company.id}`);
      console.log(`  Name: ${company.name}`);
      console.log(`  LogoUrl: ${company.logoUrl}`);
      console.log(`  Experiences: ${company.experiences?.length || 0}`);
      
      if (company.experiences?.length > 0) {
        company.experiences.forEach((exp, expIndex) => {
          console.log(`    Experience ${expIndex + 1}: ${exp.title}`);
        });
      }
      console.log('');
    });

    // Test the filtered companies like in the API
    const portfolioExperiences = companies
      .filter(company => company.experiences && company.experiences.length > 0)
      .sort((a, b) => {
        const aStartDate = new Date(a.experiences[0].startDate);
        const bStartDate = new Date(b.experiences[0].startDate);
        return bStartDate.getTime() - aStartDate.getTime();
      });

    console.log(`🎯 Filtered companies with experiences: ${portfolioExperiences.length}\n`);
    
    portfolioExperiences.forEach((company, index) => {
      console.log(`Portfolio Company ${index + 1}:`);
      console.log(`  Name: ${company.name}`);
      console.log(`  LogoUrl: ${company.logoUrl}`);
      console.log(`  Has logoUrl: ${!!company.logoUrl}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiData();