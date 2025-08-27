import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  validateFile,
  validateRequiredParams,
  validatePathParameter,
  handleFileSystemError,
  createErrorNextResponse,
  getFileConfig,
  logUploadError,
  UploadErrorCode
} from '@/utils/uploadErrorHandler';

export async function POST(request: NextRequest) {
  const endpoint = '/api/upload/certifications';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const certificationId = formData.get('certificationId') as string;

    // Validate required parameters
    const paramValidation = validateRequiredParams({ file });
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error, { certificationId });
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message
      );
    }

    // Validate path parameter to prevent traversal attacks (if certificationId is provided)
    if (certificationId) {
      const pathValidation = validatePathParameter(certificationId, 'certificationId');
      if (!pathValidation.valid && pathValidation.error) {
        logUploadError(endpoint, pathValidation.error, { certificationId });
        return NextResponse.json(pathValidation.error, { status: 400 });
      }
    }

    // Get configuration for experience uploads (certifications use same config)
    const config = getFileConfig('experience');
    
    // Validate file
    const fileValidation = validateFile(file, config);
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        certificationId
      });
      return NextResponse.json(fileValidation.error, {
        status: fileValidation.error.code === 'FILE_SIZE_EXCEEDED' ? 413 :
               fileValidation.error.code === 'FILE_TYPE_INVALID' ? 415 : 400
      });
    }

    // Create upload directory (use 'general' if no certificationId provided)
    const uploadPath = certificationId || 'general';
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'certifications', uploadPath);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir, certificationId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Generate unique filename with proper extension validation
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
      logUploadError(endpoint, error, { filePath, certificationId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Return the relative URL - Next.js will serve from public directory
    const publicUrl = `/uploads/certifications/${uploadPath}/${filename}`;

    // Log successful upload for monitoring
    console.log('Certifications upload successful:', {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      certificationId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type.startsWith('video/') ? 'video' : 'image',
    });
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in certifications upload handler' });
    
    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during certifications upload. Please try again.'
    );
  }
}
