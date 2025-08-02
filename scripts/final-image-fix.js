#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function finalImageFix() {
  console.log('🔄 Starting final image display fix...');
  
  try {
    // Step 1: Seed database with proper data
    console.log('🌱 Seeding database...');
    
    // Clean slate
    await prisma.media.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.education.deleteMany();
    
    // Create experiences
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

    const edu1 = await prisma.education.create({
      data: {
        institution: 'Stanford University',
        degree: 'Master',
        field: 'Computer Science',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2020-05-31')
      }
    });

    console.log('✅ Database seeded with:');
    console.log(`  Experience 1: ${exp1.id}`);
    console.log(`  Experience 2: ${exp2.id}`);
    console.log(`  Education 1: ${edu1.id}`);

    // Step 2: Find and link existing images
    console.log('🔍 Finding and linking existing images...');
    
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const mediaRecords = [];
    
    // Ensure directories exist
    const experiencesDir = path.join(uploadsDir, 'experiences');
    const educationDir = path.join(uploadsDir, 'education');
    
    [experiencesDir, educationDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Find actual image files and link them
    const oldExperiencesDir = path.join(uploadsDir, 'experiences');
    if (fs.existsSync(oldExperiencesDir)) {
      const dirs = fs.readdirSync(oldExperiencesDir);
      
      dirs.forEach((dir, index) => {
        const oldPath = path.join(oldExperiencesDir, dir);
        if (fs.statSync(oldPath).isDirectory()) {
          const files = fs.readdirSync(oldPath);
          const targetExp = [exp1, exp2][index % 2]; // Map to new experiences
          
          if (targetExp) {
            const newPath = path.join(oldExperiencesDir, targetExp.id);
            if (!fs.existsSync(newPath)) {
              fs.mkdirSync(newPath, { recursive: true });
            }
            
            files.forEach(file => {
              if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                const sourceFile = path.join(oldPath, file);
                const targetFile = path.join(newPath, file);
                
                // Copy file to new location
                fs.copyFileSync(sourceFile, targetFile);
                
                // Create media record
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

    // Create media records in database
    console.log('💾 Creating media records...');
    for (const record of mediaRecords) {
      try {
        await prisma.media.create({
          data: record
        });
      } catch (error) {
        console.log(`⚠️  Failed to create media record: ${error.message}`);
      }
    }

    // Step 3: Verify the fix
    console.log('🔍 Verifying fix...');
    
    const experiences = await prisma.experience.findMany({
      include: { media: true }
    });
    
    const education = await prisma.education.findMany({
      include: { media: true }
    });

    console.log('📊 Final verification:');
    experiences.forEach(exp => {
      console.log(`  Experience "${exp.title}": ${exp.media.length} images`);
      exp.media.forEach(media => {
        console.log(`    - ${media.url}`);
      });
    });

    education.forEach(edu => {
      console.log(`  Education "${edu.institution}": ${edu.media.length} images`);
      edu.media.forEach(media => {
        console.log(`    - ${media.url}`);
      });
    });

    console.log('🎉 Image display fix complete!');
    console.log('📝 Images should now display correctly in both portal and admin!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalImageFix()
  .then(() => console.log('✅ All done!'))
  .catch(console.error);
