#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function linkImagesAfterSeed() {
  console.log('🔗 Linking images to database entities after seed...');
  
  try {
    // Get current entities
    const experiences = await prisma.experience.findMany();
    const education = await prisma.education.findMany();
    
    console.log(`📊 Found ${experiences.length} experiences and ${education.length} education records`);

    // Clear existing media
    await prisma.media.deleteMany();

    // Scan uploads directory for images
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const mediaRecords = [];

    // Process experiences
    const experiencesDir = path.join(uploadsDir, 'experiences');
    if (fs.existsSync(experiencesDir)) {
      const oldDirs = fs.readdirSync(experiencesDir);
      
      oldDirs.forEach((oldDir, index) => {
        const oldPath = path.join(experiencesDir, oldDir);
        if (fs.statSync(oldPath).isDirectory()) {
          const files = fs.readdirSync(oldPath);
          const targetExp = experiences[index % experiences.length];
          
          if (targetExp) {
            const newPath = path.join(experiencesDir, targetExp.id);
            
            // Create new directory
            if (!fs.existsSync(newPath)) {
              fs.mkdirSync(newPath, { recursive: true });
            }
            
            // Copy and link images
            files.forEach(file => {
              if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                const sourceFile = path.join(oldPath, file);
                const targetFile = path.join(newPath, file);
                
                fs.copyFileSync(sourceFile, targetFile);
                
                mediaRecords.push({
                  url: `/uploads/experiences/${targetExp.id}/${file}`,
                  type: 'image',
                  experienceId: targetExp.id,
                  educationId: null
                });
                
                console.log(`✅ Linked: ${file} -> ${targetExp.title}`);
              }
            });
          }
        }
      });
    }

    // Create media records
    for (const record of mediaRecords) {
      await prisma.media.create({ data: record });
    }

    console.log(`🎉 Created ${mediaRecords.length} media records`);
    
    // Verification
    const verifiedExperiences = await prisma.experience.findMany({
      include: { media: true }
    });
    
    verifiedExperiences.forEach(exp => {
      console.log(`  ${exp.title}: ${exp.media.length} images`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkImagesAfterSeed()
  .then(() => console.log('🎉 Images successfully linked!'))
  .catch(console.error);
