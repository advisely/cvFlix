import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const educationId = formData.get('educationId') as string;

    if (!file || !educationId) {
      return NextResponse.json({ error: 'File and educationId are required' }, { status: 400 });
    }

    // Validate file type - support both images and videos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size - larger limit for videos (50MB for videos, 10MB for images)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for images

    console.log('Education file upload validation:', {
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'education', educationId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    // Write file to disk
    await writeFile(filepath, buffer);

    // Return relative URL for Next.js static serving
    const url = `/uploads/education/${educationId}/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
