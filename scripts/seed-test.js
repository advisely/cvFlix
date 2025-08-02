const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  // Clear existing data
  await prisma.media.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  
  // Create test experiences
  const exp1 = await prisma.experience.create({
    data: {
      title: 'Senior Developer',
      company: 'Tech Corp',
      description: 'Full-stack development with modern technologies',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2024-12-31')
    }
  });
  
  const exp2 = await prisma.experience.create({
    data: {
      title: 'Frontend Developer',
      company: 'Startup Inc',
      description: 'React and Next.js development',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2021-12-31')
    }
  });

  // Create test education
  const edu1 = await prisma.education.create({
    data: {
      institution: 'Stanford University',
      degree: 'Master',
      field: 'Computer Science',
      startDate: new Date('2018-09-01'),
      endDate: new Date('2020-05-31')
    }
  });

  console.log('✅ Test data seeded');
  console.log('Experiences:', exp1.id, exp2.id);
  console.log('Education:', edu1.id);
  
  return { exp1, exp2, edu1 };
}

seedTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
