#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreMediaRecords() {
  console.log('🔍 Scanning for existing media files...');
  
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Uploads directory not found');
    return;
  }

  const mediaRecords = [];
  
  // Scan experiences directory
  const experiencesDir = path.join(uploadsDir, 'experiences');
  if (fs.existsSync(experiencesDir)) {
    const experienceDirs = fs.readdirSync(experiencesDir);
    
    for (const expId of experienceDirs) {
      const expPath = path.join(experiencesDir, expId);
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

  console.log(`📸 Found ${mediaRecords.length} media files`);
  
  if (mediaRecords.length > 0) {
    console.log('💾 Restoring media records to database...');
    
    for (const record of mediaRecords) {
      try {
        await prisma.media.create({
          data: record
        });
        console.log(`✅ Restored: ${record.url}`);
      } catch (error) {
        console.log(`⚠️  Skipped (may exist): ${record.url}`);
      }
    }
    
    console.log('🎉 Media restoration complete!');
  } else {
    console.log('ℹ️  No media files found to restore');
  }
}

restoreMediaRecords()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
