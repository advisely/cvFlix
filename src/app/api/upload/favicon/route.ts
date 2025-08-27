import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  validateFile,
  validateRequiredParams,
  handleFileSystemError,
  createErrorNextResponse,
  getFileConfig,
  logUploadError,
  UploadErrorCode
} from '@/utils/uploadErrorHandler';

export async function POST(request: NextRequest) {
  const endpoint = '/api/upload/favicon';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate required parameters
    const paramValidation = validateRequiredParams({ file });
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error);
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message
      );
    }

    // Get configuration for favicon uploads
    const config = getFileConfig('favicon');
    
    // Validate file
    const fileValidation = validateFile(file, config);
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      return NextResponse.json(fileValidation.error, {
        status: fileValidation.error.code === 'FILE_SIZE_EXCEEDED' ? 413 :
               fileValidation.error.code === 'FILE_TYPE_INVALID' ? 415 : 400
      });
    }

    // Create favicon upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'favicons');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Generate unique filename with proper extension handling
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let finalExtension = fileExtension;
    
    // For favicon files, ensure valid extension or default to png
    const validFaviconExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico'];
    if (!fileExtension || !validFaviconExtensions.includes(fileExtension)) {
      // Default to png for unknown extensions
      finalExtension = 'png';
    }

    const filename = `favicon-${uuidv4()}.${finalExtension}`;
    const filePath = join(uploadDir, filename);

    // Save file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (error) {
      const fsError = handleFileSystemError(error, 'file write');
      logUploadError(endpoint, error, { filePath });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Return the relative URL - Next.js will serve from public directory
    const publicUrl = `/uploads/favicons/${filename}`;

    // Log successful upload for monitoring
    console.log('Favicon upload successful:', {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      finalExtension,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
      message: 'Favicon uploaded successfully'
    });
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in favicon upload handler' });
    
    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during favicon upload. Please try again.'
    );
  }
}
