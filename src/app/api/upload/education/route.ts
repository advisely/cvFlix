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
  const endpoint = '/api/upload/education';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const educationId = formData.get('educationId') as string;

    // Validate required parameters
    const paramValidation = validateRequiredParams({ file, educationId });
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error, { educationId });
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message
      );
    }

    // Validate path parameter to prevent traversal attacks
    const pathValidation = validatePathParameter(educationId, 'educationId');
    if (!pathValidation.valid && pathValidation.error) {
      logUploadError(endpoint, pathValidation.error, { educationId });
      return NextResponse.json(pathValidation.error, { status: 400 });
    }

    // Get configuration for experience uploads (education uses same config)
    const config = getFileConfig('experience');
    
    // Validate file
    const fileValidation = validateFile(file, config);
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        educationId
      });
      return NextResponse.json(fileValidation.error, {
        status: fileValidation.error.code === 'FILE_SIZE_EXCEEDED' ? 413 :
               fileValidation.error.code === 'FILE_TYPE_INVALID' ? 415 : 400
      });
    }

    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'education', educationId);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation');
      logUploadError(endpoint, error, { uploadDir, educationId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Generate unique filename with proper extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const filename = `${uuidv4()}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    // Write file to disk
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
    } catch (error) {
      const fsError = handleFileSystemError(error, 'file write');
      logUploadError(endpoint, error, { filepath, educationId });
      return NextResponse.json(fsError, { status: 500 });
    }

    // Return relative URL for Next.js static serving
    const url = `/uploads/education/${educationId}/${filename}`;

    // Log successful upload for monitoring
    console.log('Education upload successful:', {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      educationId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      url,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      filename,
      size: file.size
    });
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in education upload handler' });
    
    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during education upload. Please try again.'
    );
  }
}
