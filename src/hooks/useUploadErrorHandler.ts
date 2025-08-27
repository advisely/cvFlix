'use client'

import { useState, useCallback } from 'react';
import { message } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

export interface UploadError {
  type: 'size' | 'format' | 'network' | 'server' | 'generic';
  message: string;
  code?: string;
  details?: {
    currentSize?: number;
    maxSize?: number;
    fileName?: string;
    fileType?: string;
  };
}

export interface UploadState {
  isUploading: boolean;
  error: UploadError | null;
  retryAttempts: number;
  canRetry: boolean;
}

const MAX_RETRY_ATTEMPTS = 3;

export const useUploadErrorHandler = () => {
  const { t } = useLanguage();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    retryAttempts: 0,
    canRetry: false
  });

  const parseUploadError = useCallback((error: unknown, fileName?: string): UploadError => {
    // Handle specific error cases
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // File size errors
      if (errorMessage.includes('file too large') || errorMessage.includes('max size')) {
        const sizeMatch = errorMessage.match(/(\d+\.?\d*)\s*mb/i);
        const currentSize = sizeMatch ? parseFloat(sizeMatch[1]) : undefined;
        
        const isVideo = fileName?.match(/\.(mp4|webm|ogg|avi|mov)$/i);
        const maxSize = isVideo ? 50 : 10;
        
        return {
          type: 'size',
          message: isVideo 
            ? t('upload.error.size.video', 'File too large. Maximum size for videos is 50MB.')
            : t('upload.error.size.image', 'File too large. Maximum size for images is 10MB.'),
          details: {
            currentSize,
            maxSize,
            fileName,
            fileType: isVideo ? 'video' : 'image'
          }
        };
      }
      
      // File format errors
      if (errorMessage.includes('invalid file type') || errorMessage.includes('file extension')) {
        return {
          type: 'format',
          message: t('upload.error.format.invalid', 'Invalid file format. Only images and videos are supported.'),
          details: { fileName }
        };
      }
      
      // Network errors
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        return {
          type: 'network',
          message: t('upload.error.network.generic', 'Network error occurred. Please try again.'),
          details: { fileName }
        };
      }
      
      // Server errors (status codes)
      if (errorMessage.includes('500') || errorMessage.includes('server error')) {
        return {
          type: 'server',
          message: t('upload.error.server.generic', 'Server error occurred. Please try again.'),
          details: { fileName }
        };
      }
      
      if (errorMessage.includes('403') || errorMessage.includes('permission')) {
        return {
          type: 'server',
          message: t('upload.error.server.permission', 'Permission denied. Please check your access rights.'),
          details: { fileName }
        };
      }
      
      if (errorMessage.includes('507') || errorMessage.includes('storage')) {
        return {
          type: 'server',
          message: t('upload.error.server.space', 'Not enough storage space. Please contact administrator.'),
          details: { fileName }
        };
      }
    }
    
    // Generic fallback
    return {
      type: 'generic',
      message: t('upload.error.generic.unknown', 'An unexpected error occurred. Please try again.'),
      details: { fileName }
    };
  }, [t]);

  const setError = useCallback((error: UploadError) => {
    setUploadState(prev => ({
      ...prev,
      error,
      canRetry: prev.retryAttempts < MAX_RETRY_ATTEMPTS && error.type !== 'format'
    }));
  }, []);

  const handleUploadError = useCallback((error: unknown, fileName?: string) => {
    const uploadError = parseUploadError(error, fileName);
    setError(uploadError);
    
    // Show user-friendly message with contextual guidance
    let displayMessage = uploadError.message;
    
    if (uploadError.type === 'size' && uploadError.details?.currentSize) {
      displayMessage += ` (${uploadError.details.currentSize.toFixed(2)}MB)`;
    }
    
    message.error({
      content: displayMessage,
      duration: 6, // Longer duration for error messages
      style: { marginTop: '10vh' }
    });
  }, [parseUploadError, setError]);

  const startUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      error: null
    }));
  }, []);

  const completeUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      error: null,
      retryAttempts: 0,
      canRetry: false
    });
    
    message.success(t('upload.success', 'File uploaded successfully!'));
  }, [t]);

  const retryUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
      retryAttempts: prev.retryAttempts + 1,
      canRetry: prev.retryAttempts + 1 < MAX_RETRY_ATTEMPTS
    }));
  }, []);

  const clearError = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      error: null,
      canRetry: false
    }));
  }, []);

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      error: null,
      retryAttempts: 0,
      canRetry: false
    });
  }, []);

  return {
    uploadState,
    handleUploadError,
    startUpload,
    completeUpload,
    retryUpload,
    clearError,
    resetUploadState,
    canRetry: uploadState.canRetry && uploadState.error?.type !== 'format',
    // Provide translated action labels
    actionLabels: {
      retry: t('upload.action.retry', 'Retry Upload'),
      cancel: t('upload.action.cancel', 'Cancel'),
      dismiss: t('upload.action.dismiss', 'Dismiss'),
    }
  };
};

// Utility function to validate file before upload
export const validateUploadFile = (file: File, t?: (key: string, fallback?: string) => string): { isValid: boolean; error?: UploadError } => {
  // File type validation
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: {
        type: 'format',
        message: t ? t('upload.error.format.invalid', 'Invalid file format. Only images and videos are supported.') 
                   : 'Invalid file format. Only images and videos are supported.',
        details: { fileName: file.name, fileType: file.type }
      }
    };
  }
  
  // File size validation
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for images
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: {
        type: 'size',
        message: t ? (isVideo 
          ? t('upload.error.size.video', 'File too large. Maximum size for videos is 50MB.')
          : t('upload.error.size.image', 'File too large. Maximum size for images is 10MB.'))
        : `File too large. Max size: ${isVideo ? '50MB' : '10MB'}. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        details: {
          currentSize: file.size / (1024 * 1024),
          maxSize: maxSize / (1024 * 1024),
          fileName: file.name,
          fileType: isVideo ? 'video' : 'image'
        }
      }
    };
  }
  
  return { isValid: true };
};
