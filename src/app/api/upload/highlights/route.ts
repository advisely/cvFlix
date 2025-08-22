import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const highlightId = formData.get('highlightId') as string;
    const mediaType = formData.get('mediaType') as string || 'legacy'; // 'homepage', 'card', or 'legacy'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!highlightId) {
      return NextResponse.json({ error: 'Highlight ID is required' }, { status: 400 });
    }

    // Validate mediaType
    if (!['legacy', 'homepage', 'card'].includes(mediaType)) {
      return NextResponse.json({
        error: 'MediaType must be one of: legacy, homepage, card'
      }, { status: 400 });
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

    console.log('Highlights file upload validation:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      isVideo,
      maxSize,
      maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2),
      mediaType
    });

    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: ${isVideo ? '50MB' : '10MB'}. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 });
    }

    // Create directory for this highlight with media type subdirectory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'highlights', highlightId, mediaType);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Determine file type (reuse the isVideo variable from validation)
    const fileType = isVideo ? 'video' : 'image';

    // Create public URL
    const publicUrl = `/uploads/highlights/${highlightId}/${mediaType}/${fileName}`;

    // Save media record to database with appropriate relationship
    const mediaData: {
      url: string;
      type: string;
      highlightId?: string;
      highlightHomepageId?: string;
      highlightCardId?: string;
    } = {
      url: publicUrl,
      type: fileType,
    };

    switch (mediaType) {
      case 'homepage':
        mediaData.highlightHomepageId = highlightId;
        break;
      case 'card':
        mediaData.highlightCardId = highlightId;
        break;
      default:
        mediaData.highlightId = highlightId;
    }

    const media = await prisma.media.create({
      data: mediaData,
    });

    return NextResponse.json({
      url: publicUrl,
      media: media,
      type: fileType,
      mediaType: mediaType
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
