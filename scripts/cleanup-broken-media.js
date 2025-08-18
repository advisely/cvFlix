const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanupBrokenMedia() {
  console.log('🧹 Starting broken media cleanup...');
  
  try {
    // Get all media records
    const allMedia = await prisma.media.findMany();
    console.log(`📊 Found ${allMedia.length} media records`);
    
    const brokenMedia = [];
    const validMedia = [];
    
    // Check each media file
    for (const media of allMedia) {
      const filePath = path.join(process.cwd(), 'public', media.url);
      const exists = fs.existsSync(filePath);
      
      if (!exists) {
        brokenMedia.push(media);
        console.log(`❌ Broken: ${media.url} (ID: ${media.id})`);
      } else {
        validMedia.push(media);
        console.log(`✅ Valid: ${media.url}`);
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`  Valid media: ${validMedia.length}`);
    console.log(`  Broken media: ${brokenMedia.length}`);
    
    if (brokenMedia.length > 0) {
      console.log('\n🗑️ Removing broken media records...');
      
      for (const media of brokenMedia) {
        await prisma.media.delete({
          where: { id: media.id }
        });
        console.log(`   Deleted: ${media.url}`);
      }
      
      console.log(`✨ Cleanup complete! Removed ${brokenMedia.length} broken media records.`);
    } else {
      console.log('\n✨ No cleanup needed - all media files exist!');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBrokenMedia();