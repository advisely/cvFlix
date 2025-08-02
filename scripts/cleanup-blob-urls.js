const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupBlobUrls() {
  try {
    console.log('🔍 Finding blob URLs in database...');
    
    // Find all media records with blob URLs
    const blobMedia = await prisma.media.findMany({
      where: {
        url: {
          startsWith: 'blob:'
        }
      }
    });

    console.log(`📊 Found ${blobMedia.length} blob URLs that need cleanup`);
    
    if (blobMedia.length > 0) {
      console.log('\n📋 Broken URLs found:');
      blobMedia.forEach((item, index) => {
        console.log(`${index + 1}. Experience ID: ${item.experienceId}`);
        console.log(`   URL: ${item.url}`);
        console.log(`   Type: ${item.type}`);
        console.log(`   ID: ${item.id}`);
        console.log('');
      });

      console.log('🗑️  Cleaning up broken blob URLs...');
      
      // Delete all blob URLs
      const deleted = await prisma.media.deleteMany({
        where: {
          url: {
            startsWith: 'blob:'
          }
        }
      });

      console.log(`✅ Successfully deleted ${deleted.count} broken blob URLs`);
      console.log('💡 You can now re-upload actual images for these experiences');
    } else {
      console.log('✅ No broken blob URLs found - database is clean!');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupBlobUrls();
}

module.exports = { cleanupBlobUrls };
