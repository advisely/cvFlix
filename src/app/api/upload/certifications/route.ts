import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const certificationId = formData.get('certificationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - support both images and videos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size - larger limit for videos (50MB for videos, 10MB for images)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for images

    console.log('Certifications file upload validation:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      isVideo,
      maxSize,
      maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2)
    });

    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: ${isVideo ? '50MB' : '10MB'}. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 });
    }

    // Validate certificationId to prevent path traversal
    if (!certificationId || certificationId.includes('..') || certificationId.includes('/') || certificationId.includes('\\')) {
      return NextResponse.json({ error: 'Invalid certification ID' }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'certifications', certificationId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename with proper extension validation
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 });
    }

    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the relative URL - Next.js will serve from public directory
    const publicUrl = `/uploads/certifications/${certificationId}/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
