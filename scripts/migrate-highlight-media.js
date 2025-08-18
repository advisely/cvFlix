const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateHighlightMedia() {
  console.log('Starting highlight media migration...');
  
  try {
    // Find all media items that are currently associated with highlights via the legacy highlightId field
    const existingHighlightMedia = await prisma.media.findMany({
      where: {
        highlightId: {
          not: null
        }
      },
      include: {
        highlight: true
      }
    });

    console.log(`Found ${existingHighlightMedia.length} existing highlight media items to migrate`);

    for (const media of existingHighlightMedia) {
      const highlightTitle = media.highlight ? media.highlight.title : 'Unknown';
      console.log(`Migrating media ${media.id} for highlight ${highlightTitle}`);
      
      // Update the media to use both homepageMedia and cardMedia relationships
      // This ensures backward compatibility - existing media will be used for both purposes
      await prisma.media.update({
        where: { id: media.id },
        data: {
          highlightHomepageId: media.highlightId,
          highlightCardId: media.highlightId,
          // Keep the original highlightId for now to maintain compatibility
        }
      });
    }

    console.log('✅ Migration completed successfully!');
    console.log(`✅ Migrated ${existingHighlightMedia.length} media items`);
    console.log('📝 Note: Legacy highlightId field is kept for backward compatibility');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateHighlightMedia();
