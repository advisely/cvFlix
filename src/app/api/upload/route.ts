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
    const experienceId = formData.get('experienceId') as string | null;
    const bookId = formData.get('bookId') as string | null;
    const contributionId = formData.get('contributionId') as string | null;

    if (!experienceId && !bookId && !contributionId) {
      return createErrorNextResponse(
        UploadErrorCode.INVALID_PARAMETER,
        'Missing upload context',
        'A valid experienceId, bookId, or contributionId must be provided'
      );
    }

    const requiredParams = experienceId
      ? { file, experienceId }
      : bookId
        ? { file, bookId }
        : { file, contributionId };

    // Validate required parameters
    const paramValidation = validateRequiredParams(requiredParams);
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error, { experienceId, bookId, contributionId });
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message
      );
    }

    // Validate path parameter to prevent traversal attacks
    const targetId = experienceId ?? bookId ?? contributionId;
    if (!targetId) {
      return createErrorNextResponse(
        UploadErrorCode.INVALID_PARAMETER,
        'Invalid upload context',
        'A valid experienceId, bookId, or contributionId must be provided'
      );
    }
    const targetType = experienceId ? 'experienceId' : bookId ? 'bookId' : 'contributionId';

    const pathValidation = validatePathParameter(targetId, targetType);
    if (!pathValidation.valid && pathValidation.error) {
      logUploadError(endpoint, pathValidation.error, { experienceId, bookId, contributionId });
      return NextResponse.json(pathValidation.error, {
        status: 400
      });
    }

    // Get configuration for experience uploads
    const config = getFileConfig(experienceId ? 'experience' : bookId ? 'book' : 'contribution');
    
    // Validate file
    const fileValidation = validateFile(file, config);
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        experienceId,
        bookId,
        contributionId
      });
      return NextResponse.json(fileValidation.error, {
        status: fileValidation.error.code === 'FILE_SIZE_EXCEEDED' ? 413 :
               fileValidation.error.code === 'FILE_TYPE_INVALID' ? 415 : 400
      });
    }

    // Create upload directory
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      experienceId ? 'experiences' : bookId ? 'books' : 'contributions',
      targetId
    );
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir, experienceId, bookId, contributionId });
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
      logUploadError(endpoint, error, { filePath, experienceId, bookId, contributionId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Create public URL
    const publicUrl = experienceId
      ? `/uploads/experiences/${targetId}/${filename}`
      : bookId
        ? `/uploads/books/${targetId}/${filename}`
        : `/uploads/contributions/${targetId}/${filename}`;

    // Create Media record in database
    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';
    
    try {
      const mediaRecord = await prisma.media.create({
        data: {
          url: publicUrl,
          type: mediaType,
        }
      });

      // Log successful upload for monitoring
      console.log('Upload successful:', {
        endpoint,
        mediaId: mediaRecord.id,
        fileName: file.name,
        fileSize: file.size,
        experienceId,
        bookId,
        contributionId,
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
      logUploadError(endpoint, error, { publicUrl, experienceId, bookId, contributionId });
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
