const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUrls() {
  try {
    console.log('🔍 Checking media URLs...');
    
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('\n📋 Recent media URLs:');
    media.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}`);
      console.log(`   URL: ${item.url}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   Experience ID: ${item.experienceId}`);
      console.log(`   Created: ${item.createdAt}`);
      console.log('');
    });

    // Check if URLs are accessible
    console.log('🔍 Checking URL accessibility...');
    for (const item of media) {
      if (!item.url.startsWith('blob:')) {
        const fullUrl = item.url.startsWith('/') 
          ? `http://localhost:4001${item.url}` 
          : item.url;
        
        console.log(`   Testing: ${fullUrl}`);
        
        // Check if file exists
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'public', item.url);
        
        if (fs.existsSync(filePath)) {
          console.log(`   ✅ File exists: ${filePath}`);
          console.log(`   📊 File size: ${fs.statSync(filePath).size} bytes`);
        } else {
          console.log(`   ❌ File NOT found: ${filePath}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUrls();
