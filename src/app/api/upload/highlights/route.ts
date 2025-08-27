import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import {
  validateFile,
  validateRequiredParams,
  validatePathParameter,
  handleFileSystemError,
  handleDatabaseError,
  createErrorNextResponse,
  getFileConfig,
  logUploadError,
  UploadErrorCode
} from '@/utils/uploadErrorHandler';

export async function POST(request: NextRequest) {
  const endpoint = '/api/upload/highlights';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const highlightId = formData.get('highlightId') as string;
    const mediaType = formData.get('mediaType') as string || 'legacy'; // 'homepage', 'card', or 'legacy'

    // Validate required parameters
    const paramValidation = validateRequiredParams({ file, highlightId });
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error, { highlightId, mediaType });
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message
      );
    }

    // Validate mediaType
    const validMediaTypes = ['legacy', 'homepage', 'card'];
    if (!validMediaTypes.includes(mediaType)) {
      logUploadError(endpoint, 'Invalid mediaType', { mediaType, highlightId });
      return createErrorNextResponse(
        UploadErrorCode.INVALID_PARAMETER,
        'Invalid mediaType parameter',
        `MediaType must be one of: ${validMediaTypes.join(', ')}`,
        { supportedFormats: validMediaTypes }
      );
    }

    // Check if this is for a new highlight (temp ID)
    const isNewHighlight = highlightId === 'temp' || highlightId === 'new';
    
    // Validate path parameter for existing highlights
    if (!isNewHighlight) {
      const pathValidation = validatePathParameter(highlightId, 'highlightId');
      if (!pathValidation.valid && pathValidation.error) {
        logUploadError(endpoint, pathValidation.error, { highlightId, mediaType });
        return NextResponse.json(pathValidation.error, { status: 400 });
      }
    }

    // Get configuration for experience uploads (highlights use same config)
    const config = getFileConfig('experience');
    
    // Validate file
    const fileValidation = validateFile(file, config);
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        highlightId,
        mediaType
      });
      return NextResponse.json(fileValidation.error, {
        status: fileValidation.error.code === 'FILE_SIZE_EXCEEDED' ? 413 :
               fileValidation.error.code === 'FILE_TYPE_INVALID' ? 415 : 400
      });
    }

    // Create directory for this highlight with media type subdirectory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'highlights', highlightId, mediaType);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir, highlightId, mediaType });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (error) {
      const fsError = handleFileSystemError(error, 'file write');
      logUploadError(endpoint, error, { filePath, highlightId, mediaType });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Determine file type
    const isVideo = file.type.startsWith('video/');
    const fileType = isVideo ? 'video' : 'image';

    // Create public URL
    const publicUrl = `/uploads/highlights/${highlightId}/${mediaType}/${fileName}`;

    // For new highlights, we only save the file and return the URL
    // The media record will be created when the highlight is saved
    if (isNewHighlight) {
      console.log('Temporary highlight upload successful:', {
        endpoint,
        fileName: file.name,
        fileSize: file.size,
        mediaType,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        url: publicUrl,
        type: fileType,
        mediaType: mediaType,
        isTemporary: true
      });
    }

    // For existing highlights, save media record to database with appropriate relationship
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

    try {
      const media = await prisma.media.create({
        data: mediaData,
      });

      // Log successful upload for monitoring
      console.log('Highlight upload successful:', {
        endpoint,
        mediaId: media.id,
        fileName: file.name,
        fileSize: file.size,
        highlightId,
        mediaType,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        url: publicUrl,
        media: media,
        type: fileType,
        mediaType: mediaType
      });
    } catch (error) {
      const dbError = handleDatabaseError(error, 'media record creation');
      logUploadError(endpoint, error, { publicUrl, highlightId, mediaType });
      return NextResponse.json(dbError, { status: 500 });
    }
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in highlights upload handler' });
    
    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during highlight upload. Please try again.'
    );
  }
}
