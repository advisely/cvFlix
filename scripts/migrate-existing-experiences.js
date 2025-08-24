const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration of existing experiences to multi-period format...');

  // Get all existing experiences
  const experiences = await prisma.experience.findMany();

  console.log(`Found ${experiences.length} experiences to migrate`);

  for (const experience of experiences) {
    // Create a date range for each existing experience
    await prisma.experienceDateRange.create({
      data: {
        startDate: experience.startDate,
        endDate: experience.endDate,
        experienceId: experience.id
      }
    });

    console.log(`Migrated experience: ${experience.title} at ${experience.id}`);
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });