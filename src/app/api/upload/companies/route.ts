import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check if file is actually a file object
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid file object' }, { status: 400 });
    }

    // Validate file name
    if (!file.name || file.name.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    // Validate file type - images only for company logos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images are allowed for company logos (JPEG, PNG, GIF, WebP, SVG).' 
      }, { status: 400 });
    }

    // Validate file size - 10MB max for images
    const maxSize = 10 * 1024 * 1024; // 10MB

    console.log('Company logo upload validation:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2)
    });

    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: 10MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({
        error: 'File is empty. Please select a valid image file.'
      }, { status: 400 });
    }

    // Create companies upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'companies');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename with proper extension validation
    const fileExtension = extname(file.name).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (!fileExtension) {
      return NextResponse.json({ 
        error: 'File must have an extension (jpg, jpeg, png, gif, webp, svg)' 
      }, { status: 400 });
    }

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Invalid file extension. Allowed: jpg, jpeg, png, gif, webp, svg' 
      }, { status: 400 });
    }

    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength === 0) {
      return NextResponse.json({
        error: 'File content is empty. Please select a valid image file.'
      }, { status: 400 });
    }

    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create public URL that can be used in company logoUrl field
    const publicUrl = `/uploads/companies/${fileName}`;

    console.log('Company logo uploaded successfully:', {
      fileName,
      publicUrl,
      fileSize: file.size
    });

    return NextResponse.json({
      url: publicUrl,
      type: 'image',
      fileName,
      size: file.size
    });
  } catch (error) {
    console.error('Company logo upload error:', error);
    
    // Handle specific filesystem errors
    if (error instanceof Error) {
      if (error.message.includes('ENOSPC')) {
        return NextResponse.json({ 
          error: 'Not enough disk space to upload file' 
        }, { status: 507 });
      }
      if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
        return NextResponse.json({ 
          error: 'Permission denied when saving file' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to upload company logo. Please try again.' 
    }, { status: 500 });
  }
}
