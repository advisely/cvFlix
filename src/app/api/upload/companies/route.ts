import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
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
  const endpoint = '/api/upload/companies';
  
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

    // Check if file is actually a file object
    if (!(file instanceof File)) {
      logUploadError(endpoint, 'Invalid file object', { fileType: typeof file });
      return createErrorNextResponse(
        UploadErrorCode.INVALID_REQUEST,
        'Invalid file object',
        'The uploaded item is not a valid file'
      );
    }

    // Get configuration for company uploads (logo images only)
    const config = getFileConfig('company');
    
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

    // Create companies upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'companies');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Generate unique filename with proper extension validation
    const fileExtension = extname(file.name).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer and save
    try {
      const bytes = await file.arrayBuffer();
      
      // Additional check for empty file content after reading
      if (bytes.byteLength === 0) {
        logUploadError(endpoint, 'File content is empty', { fileName: file.name });
        return createErrorNextResponse(
          UploadErrorCode.FILE_EMPTY,
          'File is empty',
          'File content is empty. Please select a valid image file.'
        );
      }

      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (error) {
      const fsError = handleFileSystemError(error, 'file write');
      logUploadError(endpoint, error, { filePath });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Create public URL that can be used in company logoUrl field
    const publicUrl = `/uploads/companies/${fileName}`;

    // Log successful upload for monitoring
    console.log('Company logo upload successful:', {
      endpoint,
      fileName,
      publicUrl,
      fileSize: file.size,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      url: publicUrl,
      type: 'image',
      fileName,
      size: file.size
    });
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in company logo upload handler' });
    
    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during company logo upload. Please try again.'
    );
  }
}
