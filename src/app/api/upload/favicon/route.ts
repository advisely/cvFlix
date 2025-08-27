import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - support common image formats for favicons
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload PNG, JPG, GIF, SVG, WebP, or ICO files.' }, { status: 400 });
    }

    // Validate file size - max 5MB for favicons
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: 5MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 });
    }

    // Create favicon upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'favicons');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename with proper extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    
    let finalExtension = fileExtension;
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      // Default to png for unknown extensions
      finalExtension = 'png';
    }

    const filename = `favicon-${uuidv4()}.${finalExtension}`;
    const filePath = join(uploadDir, filename);

    console.log('Favicon upload details:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      finalExtension,
      filename
    });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the relative URL - Next.js will serve from public directory
    const publicUrl = `/uploads/favicons/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
      message: 'Favicon uploaded successfully'
    });
  } catch (error) {
    console.error('Favicon upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
