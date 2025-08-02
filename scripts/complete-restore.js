#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function completeRestore() {
  console.log('🔄 Starting complete database restore and media linking...');
  
  try {
    // Step 1: Ensure database is properly seeded
    console.log('🌱 Ensuring database is seeded...');
    
    // Check if we have any experiences
    const experienceCount = await prisma.experience.count();
    const educationCount = await prisma.education.count();
    
    if (experienceCount === 0 || educationCount === 0) {
      console.log('⚠️  Database appears empty, running seed...');
      
      // Create test experiences
      const exp1 = await prisma.experience.create({
        data: {
          title: 'Senior Developer',
          company: 'Tech Corp',
          description: 'Full-stack development',
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

      console.log('✅ Test data created');
      console.log('Experience IDs:', exp1.id, exp2.id);
      console.log('Education ID:', edu1.id);
    }

    // Step 2: Scan for existing media files and create proper links
    console.log('🔍 Scanning for existing media files...');
    
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const mediaRecords = [];
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Uploads directory not found');
      return;
    }

    // Get actual experience and education IDs
    const experiences = await prisma.experience.findMany();
    const education = await prisma.education.findMany();
    
    console.log(`📊 Found ${experiences.length} experiences and ${education.length} education records`);

    // Clear existing media to avoid duplicates
    await prisma.media.deleteMany();
    console.log('🗑️  Cleared existing media records');

    // Scan experiences directory
    const experiencesDir = path.join(uploadsDir, 'experiences');
    if (fs.existsSync(experiencesDir)) {
      const experienceDirs = fs.readdirSync(experiencesDir);
      
      for (const expId of experienceDirs) {
        const expPath = path.join(experiencesDir, expId);
        
        // Find matching experience
        const matchingExp = experiences.find(exp => exp.id === expId);
        if (!matchingExp) continue;
        
        if (fs.statSync(expPath).isDirectory()) {
          const files = fs.readdirSync(expPath);
          
          for (const file of files) {
            const filePath = path.join(expPath, file);
            const ext = path.extname(file).toLowerCase();
            
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi'].includes(ext)) {
              const type = ['.mp4', '.mov', '.avi'].includes(ext) ? 'video' : 'image';
              const url = `/uploads/experiences/${expId}/${file}`;
              
              mediaRecords.push({
                url,
                type,
                experienceId: expId,
                educationId: null
              });
            }
          }
        }
      }
    }

    // Scan education directory
    const educationDir = path.join(uploadsDir, 'education');
    if (fs.existsSync(educationDir)) {
      const educationDirs = fs.readdirSync(educationDir);
      
      for (const eduId of educationDirs) {
        const eduPath = path.join(educationDir, eduId);
        
        // Find matching education
        const matchingEdu = education.find(edu => edu.id === eduId);
        if (!matchingEdu) continue;
        
        if (fs.statSync(eduPath).isDirectory()) {
          const files = fs.readdirSync(eduPath);
          
          for (const file of files) {
            const filePath = path.join(eduPath, file);
            const ext = path.extname(file).toLowerCase();
            
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi'].includes(ext)) {
              const type = ['.mp4', '.mov', '.avi'].includes(ext) ? 'video' : 'image';
              const url = `/uploads/education/${eduId}/${file}`;
              
              mediaRecords.push({
                url,
                type,
                experienceId: null,
                educationId: eduId
              });
            }
          }
        }
      }
    }

    console.log(`📸 Found ${mediaRecords.length} media files to restore`);
    
    // Step 3: Create media records with proper linking
    if (mediaRecords.length > 0) {
      console.log('💾 Creating media records with proper linking...');
      
      for (const record of mediaRecords) {
        try {
          await prisma.media.create({
            data: record
          });
          console.log(`✅ Created: ${record.url} -> ${record.experienceId ? 'Experience' : 'Education'} ${record.experienceId || record.educationId}`);
        } catch (error) {
          console.log(`⚠️  Failed: ${record.url} - ${error.message}`);
        }
      }
      
      console.log('🎉 Media restoration complete!');
    } else {
      console.log('ℹ️  No media files found to restore');
    }

    // Step 4: Verify the restoration
    const finalMediaCount = await prisma.media.count();
    const finalExperiences = await prisma.experience.findMany({
      include: { media: true }
    });
    
    console.log(`📊 Final state: ${finalMediaCount} media records`);
    console.log(`📊 Experiences with media: ${finalExperiences.filter(exp => exp.media.length > 0).length}`);
    
    // Log some examples
    finalExperiences.forEach(exp => {
      if (exp.media.length > 0) {
        console.log(`🖼️  Experience "${exp.title}" has ${exp.media.length} media items`);
        exp.media.forEach(media => console.log(`   - ${media.url}`));
      }
    });

  } catch (error) {
    console.error('❌ Error during restore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeRestore()
  .then(() => console.log('✅ Complete restore finished'))
  .catch(console.error);
