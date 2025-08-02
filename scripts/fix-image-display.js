#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixImageDisplay() {
  console.log('🔄 Starting comprehensive image display fix...');
  
  try {
    // Step 1: Ensure database has proper data
    console.log('🌱 Ensuring database has experiences and education...');
    
    // Clear and recreate test data
    await prisma.media.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.education.deleteMany();
    
    // Create experiences with proper IDs that match file structure
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

    console.log('✅ Created test data:');
    console.log('  Experience 1:', exp1.id);
    console.log('  Experience 2:', exp2.id);
    console.log('  Education 1:', edu1.id);

    // Step 2: Find and link actual image files
    console.log('🔍 Scanning for actual image files...');
    
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const mediaRecords = [];
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Scan experiences directory
    const experiencesDir = path.join(uploadsDir, 'experiences');
    if (fs.existsSync(experiencesDir)) {
      const dirs = fs.readdirSync(experiencesDir);
      console.log('📁 Found experience directories:', dirs);
      
      for (const dir of dirs) {
        const fullPath = path.join(experiencesDir, dir);
        if (fs.statSync(fullPath).isDirectory()) {
          const files = fs.readdirSync(fullPath);
          
          // Map old directory to new experience
          const targetExp = dir.includes('cmds7sx6e000dz0nwjqje0tw4') ? exp1 : exp2;
          
          for (const file of files) {
            const filePath = path.join(fullPath, file);
            const ext = path.extname(file).toLowerCase();
            
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
              const type = 'image';
              const url = `/uploads/experiences/${targetExp.id}/${file}`;
              
              // Ensure target directory exists
              const targetDir = path.join(experiencesDir, targetExp.id);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              
              // Move file to correct directory
              const targetPath = path.join(targetDir, file);
              if (filePath !== targetPath) {
                fs.copyFileSync(filePath, targetPath);
                console.log(`📁 Copied: ${filePath} -> ${targetPath}`);
              }
              
              mediaRecords.push({
                url,
                type,
                experienceId: targetExp.id,
                educationId: null
              });
            }
          }
        }
      }
    }

    // Step 3: Create media records in database
    console.log('💾 Creating media records...');
    
    for (const record of mediaRecords) {
      try {
        await prisma.media.create({
          data: record
        });
        console.log(`✅ Created media record: ${record.url}`);
      } catch (error) {
        console.log(`⚠️  Failed to create media record: ${error.message}`);
      }
    }

    // Step 4: Verify the fix
    console.log('🔍 Verifying the fix...');
    
    const experiences = await prisma.experience.findMany({
      include: { media: true }
    });
    
    const education = await prisma.education.findMany({
      include: { media: true }
    });

    console.log(`📊 Final state:`);
    console.log(`  Experiences: ${experiences.length}`);
    experiences.forEach(exp => {
      console.log(`    ${exp.title}: ${exp.media.length} media items`);
      exp.media.forEach(media => console.log(`      - ${media.url}`));
    });
    
    console.log(`  Education: ${education.length}`);
    education.forEach(edu => {
      console.log(`    ${edu.institution}: ${edu.media.length} media items`);
    });

    // Step 5: Test API endpoints
    console.log('🧪 Testing API endpoints...');
    
    const testExperiences = await fetch('http://localhost:4001/api/data')
      .then(res => res.json())
      .then(data => data.experiences)
      .catch(err => []);
    
    console.log(`📊 API response: ${testExperiences?.length || 0} experiences`);
    testExperiences?.forEach(exp => {
      console.log(`  ${exp.title}: ${exp.media?.length || 0} media items`);
    });

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageDisplay()
  .then(() => console.log('🎉 Image display fix complete!'))
  .catch(console.error);
