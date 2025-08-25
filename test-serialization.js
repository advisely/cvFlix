// Test JSON serialization issues
const { PrismaClient } = require('@prisma/client');

async function testSerialization() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing JSON serialization...\n');
    
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

    console.log('🔍 Raw Prisma Data:');
    companies.forEach((company, index) => {
      console.log(`Company ${index + 1}:`);
      console.log(`  ID: ${company.id}`);
      console.log(`  Name: ${company.name}`);
      console.log(`  LogoUrl: ${company.logoUrl}`);
      console.log(`  Type of name: ${typeof company.name}`);
      console.log(`  Type of logoUrl: ${typeof company.logoUrl}`);
    });

    console.log('\n📦 Testing JSON.stringify...');
    
    try {
      const jsonString = JSON.stringify(companies, null, 2);
      console.log('✅ JSON.stringify successful');
      
      const parsed = JSON.parse(jsonString);
      console.log('\n🔍 After JSON parse:');
      parsed.forEach((company, index) => {
        console.log(`Company ${index + 1}:`);
        console.log(`  Name: ${company.name}`);
        console.log(`  LogoUrl: ${company.logoUrl}`);
      });
      
    } catch (error) {
      console.error('❌ JSON serialization failed:', error.message);
    }

    // Test the filtering logic
    const portfolioExperiences = companies
      .filter(company => company.experiences && company.experiences.length > 0)
      .sort((a, b) => {
        const aStartDate = new Date(a.experiences[0].startDate);
        const bStartDate = new Date(b.experiences[0].startDate);
        return bStartDate.getTime() - aStartDate.getTime();
      });

    console.log('\n🎯 After filtering and sorting:');
    portfolioExperiences.forEach((company, index) => {
      console.log(`Portfolio Company ${index + 1}:`);
      console.log(`  Name: ${company.name}`);
      console.log(`  LogoUrl: ${company.logoUrl}`);
      console.log(`  Experience count: ${company.experiences.length}`);
    });

    console.log('\n📦 Testing final JSON serialization...');
    const finalJson = JSON.stringify({
      portfolioExperiences,
      test: 'data'
    }, null, 2);
    
    const finalParsed = JSON.parse(finalJson);
    console.log('✅ Final JSON serialization successful');
    console.log('\nFinal parsed portfolio companies:');
    finalParsed.portfolioExperiences.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} -> ${company.logoUrl}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSerialization();