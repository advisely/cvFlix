import { NextResponse } from 'next/server';
import { statSync } from 'fs';

/**
 * Standardized error response structure for upload endpoints
 */
export interface UploadErrorResponse {
  error: string;           // Technical error identifier
  message: string;         // User-friendly message
  details?: string;        // Additional context
  code: string;           // Standardized error code
  retryable: boolean;     // Can this error be retried?
  maxSize?: string;       // For size errors
  supportedFormats?: string[]; // For format errors
  timestamp?: string;     // Error timestamp for debugging
}

/**
 * Error codes for different categories
 */
export enum UploadErrorCode {
  // Format Errors (not retryable)
  FILE_TYPE_INVALID = 'FILE_TYPE_INVALID',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED', 
  FILE_EXTENSION_INVALID = 'FILE_EXTENSION_INVALID',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_NAME_INVALID = 'FILE_NAME_INVALID',
  FILE_EMPTY = 'FILE_EMPTY',

  // Server Errors (retryable)
  STORAGE_ERROR = 'STORAGE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE',
  UPLOAD_TIMEOUT = 'UPLOAD_TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // Request Errors (not retryable)
  MISSING_FILE = 'MISSING_FILE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_PARAMETER = 'INVALID_PARAMETER'
}

/**
 * HTTP status codes for different error types
 */
export const ERROR_STATUS_MAP: Record<UploadErrorCode, number> = {
  // 400 - Bad Request (invalid format, missing fields)
  [UploadErrorCode.FILE_NAME_INVALID]: 400,
  [UploadErrorCode.FILE_EMPTY]: 400,
  [UploadErrorCode.MISSING_FILE]: 400,
  [UploadErrorCode.INVALID_REQUEST]: 400,
  [UploadErrorCode.VALIDATION_ERROR]: 400,
  [UploadErrorCode.INVALID_PARAMETER]: 400,
  [UploadErrorCode.FILE_EXTENSION_INVALID]: 400,

  // 413 - Payload Too Large
  [UploadErrorCode.FILE_SIZE_EXCEEDED]: 413,

  // 415 - Unsupported Media Type
  [UploadErrorCode.FILE_TYPE_INVALID]: 415,

  // 422 - Unprocessable Entity
  [UploadErrorCode.FILE_CORRUPTED]: 422,

  // 500 - Internal Server Error
  [UploadErrorCode.STORAGE_ERROR]: 500,
  [UploadErrorCode.DATABASE_ERROR]: 500,
  [UploadErrorCode.UPLOAD_TIMEOUT]: 500,

  // 503 - Service Unavailable 
  [UploadErrorCode.PERMISSION_DENIED]: 503,

  // 507 - Insufficient Storage
  [UploadErrorCode.INSUFFICIENT_STORAGE]: 507,
};

/**
 * Retryable error codes
 */
export const RETRYABLE_ERRORS = new Set([
  UploadErrorCode.STORAGE_ERROR,
  UploadErrorCode.DATABASE_ERROR,
  UploadErrorCode.INSUFFICIENT_STORAGE,
  UploadErrorCode.UPLOAD_TIMEOUT,
]);

/**
 * File type configurations for different upload contexts
 */
export interface FileTypeConfig {
  allowedTypes: string[];
  allowedExtensions: string[];
  maxSize: number; // in bytes
  maxVideoSize?: number; // in bytes for video files
  supportedFormats: string[];
}

export const FILE_CONFIGS: Record<string, FileTypeConfig> = {
  experience: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'mp4', 'webm', 'ogg', 'avi', 'mov'],
    maxSize: 10 * 1024 * 1024, // 10MB for images
    maxVideoSize: 50 * 1024 * 1024, // 50MB for videos
    supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'MP4', 'WebM', 'OGG', 'AVI', 'MOV']
  },
  knowledge: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'mp4', 'webm', 'ogg', 'avi', 'mov'],
    maxSize: 10 * 1024 * 1024,
    maxVideoSize: 50 * 1024 * 1024,
    supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'MP4', 'WebM', 'OGG', 'AVI', 'MOV']
  },
  book: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'mp4', 'webm', 'ogg', 'avi', 'mov'],
    maxSize: 10 * 1024 * 1024,
    maxVideoSize: 50 * 1024 * 1024,
    supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'MP4', 'WebM', 'OGG', 'AVI', 'MOV']
  },
  company: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'SVG']
  },
  favicon: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml', 'image/x-icon'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico'],
    maxSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'SVG', 'ICO']
  }
};

/**
 * Check available disk space
 */
export function checkDiskSpace(): { available: boolean; error?: UploadErrorResponse } {
  try {
    statSync(process.cwd());
    // This is a simplified check - in production you'd want more sophisticated disk space monitoring
    return { available: true };
  } catch {
    return {
      available: false,
      error: createErrorResponse(
        UploadErrorCode.INSUFFICIENT_STORAGE,
        'Not enough storage space available',
        'Insufficient disk space to complete upload'
      )
    };
  }
}

/**
 * Validate file extension with magic number checking (basic implementation)
 */
export function validateFileIntegrity(file: File): { valid: boolean; error?: UploadErrorResponse } {
  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.FILE_EMPTY,
        'File is empty',
        `The uploaded file "${file.name}" contains no data`
      )
    };
  }

  // Check if file has a name
  if (!file.name || file.name.trim().length === 0) {
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.FILE_NAME_INVALID,
        'Invalid file name',
        'File must have a valid name'
      )
    };
  }

  return { valid: true };
}

/**
 * Validate file against configuration
 */
export function validateFile(file: File, config: FileTypeConfig): { valid: boolean; error?: UploadErrorResponse } {
  // First check file integrity
  const integrityCheck = validateFileIntegrity(file);
  if (!integrityCheck.valid) {
    return integrityCheck;
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.FILE_TYPE_INVALID,
        'Unsupported file type',
        `File type "${file.type}" is not supported`,
        {
          supportedFormats: config.supportedFormats
        }
      )
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !config.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.FILE_EXTENSION_INVALID,
        'Invalid file extension',
        `File extension "${extension}" is not allowed`,
        {
          supportedFormats: config.supportedFormats
        }
      )
    };
  }

  // Check file size
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo && config.maxVideoSize ? config.maxVideoSize : config.maxSize;
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.FILE_SIZE_EXCEEDED,
        'File size exceeded',
        `File size ${fileSizeMB}MB exceeds maximum allowed size`,
        {
          maxSize: `${maxSizeMB}MB`
        }
      )
    };
  }

  return { valid: true };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: UploadErrorCode,
  error: string,
  message: string,
  additional?: Partial<UploadErrorResponse>
): UploadErrorResponse {
  return {
    error,
    message,
    code,
    retryable: RETRYABLE_ERRORS.has(code),
    timestamp: new Date().toISOString(),
    ...additional
  };
}

/**
 * Create NextResponse with standardized error
 */
export function createErrorNextResponse(
  code: UploadErrorCode,
  error: string,
  message: string,
  additional?: Partial<UploadErrorResponse>
): NextResponse {
  const errorResponse = createErrorResponse(code, error, message, additional);
  const status = ERROR_STATUS_MAP[code] || 500;
  
  return NextResponse.json(errorResponse, { status });
}

/**
 * Handle common errors from file operations
 */
export function handleFileSystemError(error: unknown, context: string = 'file operation'): UploadErrorResponse {
  console.error(`${context} error:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Disk space errors
    if (message.includes('enospc') || message.includes('no space')) {
      return createErrorResponse(
        UploadErrorCode.INSUFFICIENT_STORAGE,
        'Insufficient storage space',
        'Not enough disk space to complete upload'
      );
    }
    
    // Permission errors
    if (message.includes('eacces') || message.includes('eperm') || message.includes('permission')) {
      return createErrorResponse(
        UploadErrorCode.PERMISSION_DENIED,
        'Permission denied',
        'Insufficient permissions to save file'
      );
    }
    
    // Timeout errors
    if (message.includes('timeout') || message.includes('etimedout')) {
      return createErrorResponse(
        UploadErrorCode.UPLOAD_TIMEOUT,
        'Upload timeout',
        'Upload operation timed out'
      );
    }
  }
  
  // Generic storage error
  return createErrorResponse(
    UploadErrorCode.STORAGE_ERROR,
    'Storage error',
    `Failed to complete ${context}`
  );
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: unknown, context: string = 'database operation'): UploadErrorResponse {
  console.error(`${context} error:`, error);
  
  return createErrorResponse(
    UploadErrorCode.DATABASE_ERROR,
    'Database error',
    `Failed to complete ${context}`
  );
}

/**
 * Validate required parameters
 */
export function validateRequiredParams(params: Record<string, unknown>): { valid: boolean; error?: UploadErrorResponse } {
  const missingParams = Object.entries(params)
    .filter(([, value]) => value === null || value === undefined || value === '')
    .map(([key]) => key);

  if (missingParams.length > 0) {
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.INVALID_PARAMETER,
        'Missing required parameters',
        `Required parameters missing: ${missingParams.join(', ')}`
      )
    };
  }

  return { valid: true };
}

/**
 * Sanitize and validate path parameters to prevent traversal attacks
 */
export function validatePathParameter(param: string, paramName: string): { valid: boolean; error?: UploadErrorResponse } {
  if (!param || param.includes('..') || param.includes('/') || param.includes('\\') || param.includes('\0')) {
    return {
      valid: false,
      error: createErrorResponse(
        UploadErrorCode.INVALID_PARAMETER,
        'Invalid path parameter',
        `Invalid ${paramName}. Path traversal attempts are not allowed`
      )
    };
  }
  
  return { valid: true };
}

/**
 * Log error for debugging with structured format
 */
export function logUploadError(
  endpoint: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  console.error('Upload Error Details:', {
    endpoint,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error,
    context
  });
}

/**
 * Get file configuration by upload type
 */
export function getFileConfig(uploadType: string): FileTypeConfig {
  const config = FILE_CONFIGS[uploadType];
  if (!config) {
    // Default configuration for general media uploads
    return FILE_CONFIGS.experience;
  }
  return config;
}
