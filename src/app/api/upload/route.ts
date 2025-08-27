import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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
  const endpoint = '/api/upload';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const experienceId = formData.get('experienceId') as string;

    // Validate required parameters
    const paramValidation = validateRequiredParams({ file, experienceId });
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error, { experienceId });
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message
      );
    }

    // Validate path parameter to prevent traversal attacks
    const pathValidation = validatePathParameter(experienceId, 'experienceId');
    if (!pathValidation.valid && pathValidation.error) {
      logUploadError(endpoint, pathValidation.error, { experienceId });
      return NextResponse.json(pathValidation.error, { 
        status: 400 
      });
    }

    // Get configuration for experience uploads
    const config = getFileConfig('experience');
    
    // Validate file
    const fileValidation = validateFile(file, config);
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        experienceId 
      });
      return NextResponse.json(fileValidation.error, {
        status: fileValidation.error.code === 'FILE_SIZE_EXCEEDED' ? 413 :
               fileValidation.error.code === 'FILE_TYPE_INVALID' ? 415 : 400
      });
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'experiences', experienceId);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir, experienceId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Generate unique filename with proper extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadDir, filename);

    // Save file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (error) {
      const fsError = handleFileSystemError(error, 'file write');
      logUploadError(endpoint, error, { filePath, experienceId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Create public URL
    const publicUrl = `/uploads/experiences/${experienceId}/${filename}`;

    // Create Media record in database
    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';
    
    try {
      const mediaRecord = await prisma.media.create({
        data: {
          url: publicUrl,
          type: mediaType,
          // Don't connect to experience yet - this will be done when saving the experience
        }
      });

      // Log successful upload for monitoring
      console.log('Upload successful:', {
        endpoint,
        mediaId: mediaRecord.id,
        fileName: file.name,
        fileSize: file.size,
        experienceId,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        id: mediaRecord.id,
        url: publicUrl,
        type: mediaType,
        filename,
        size: file.size,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error, 'media record creation');
      logUploadError(endpoint, error, { publicUrl, experienceId });
      return NextResponse.json(dbError, { status: 500 });
    }
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in upload handler' });
    
    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during upload. Please try again.'
    );
  }
}
