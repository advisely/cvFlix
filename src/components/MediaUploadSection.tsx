'use client'

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Button, 
  Row, 
  Col, 
  Form, 
  Alert, 
  Spin, 
  Progress, 
  Tooltip,
  Typography,
  Space
} from 'antd';
import { 
  UploadOutlined, 
  PictureOutlined, 
  CloseOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useUploadErrorHandler, validateUploadFile } from '@/hooks/useUploadErrorHandler';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  experienceId?: string;
}

interface MediaUploadSectionProps {
  title: string;
  media: MediaItem[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (url: string) => void;
  onGalleryOpen: () => void;
  disabled?: boolean;
  accept?: string;
  maxCount?: number;
  showProgress?: boolean;
}

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  title,
  media,
  onUpload,
  onRemove,
  onGalleryOpen,
  disabled = false,
  accept = "image/*,video/*",
  maxCount = 10,
  showProgress = true
}) => {
  const { t } = useLanguage();
  const {
    uploadState,
    handleUploadError,
    startUpload,
    completeUpload,
    retryUpload,
    clearError,
    canRetry,
    actionLabels
  } = useUploadErrorHandler();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Handle file upload with comprehensive error handling
  const handleFileUpload = useCallback(async (file: File): Promise<boolean> => {
    // Pre-upload validation
    const validation = validateUploadFile(file, t);
    if (!validation.isValid && validation.error) {
      handleUploadError(new Error(validation.error.message), file.name);
      return false;
    }

    // Check max count
    if (media.length >= maxCount) {
      handleUploadError(
        new Error(t('upload.maxFiles', `Maximum number of files (${maxCount}) reached. Please remove some files first.`)),
        file.name
      );
      return false;
    }

    try {
      startUpload();
      setPendingFile(file);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      await onUpload(file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        completeUpload();
        setPendingFile(null);
        setUploadProgress(0);
      }, 500);

      return false; // Prevent default upload behavior
    } catch (error) {
      setUploadProgress(0);
      handleUploadError(error, file.name);
      return false;
    }
  }, [media.length, maxCount, onUpload, startUpload, completeUpload, handleUploadError, t]);

  // Handle retry upload
  const handleRetry = useCallback(async () => {
    if (pendingFile && canRetry) {
      retryUpload();
      await handleFileUpload(pendingFile);
    }
  }, [pendingFile, canRetry, retryUpload, handleFileUpload]);

  // Handle error dismissal
  const handleDismissError = useCallback(() => {
    clearError();
    setPendingFile(null);
    setUploadProgress(0);
  }, [clearError]);

  // Render error alert with action buttons
  const renderErrorAlert = () => {
    if (!uploadState.error) return null;

    return (
      <Alert
        type="error"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message={uploadState.error.message}
        description={
          uploadState.error.details && (
            <div>
              {uploadState.error.details.fileName && (
                <Text type="secondary">File: {uploadState.error.details.fileName}</Text>
              )}
              {uploadState.error.details.currentSize && uploadState.error.details.maxSize && (
                <div>
                  <Text type="secondary">
                    Current size: {uploadState.error.details.currentSize.toFixed(2)}MB, 
                    Max allowed: {uploadState.error.details.maxSize}MB
                  </Text>
                </div>
              )}
            </div>
          )
        }
        action={
          <Space>
            {canRetry && (
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
                loading={uploadState.isUploading}
              >
                {actionLabels.retry}
              </Button>
            )}
            <Button size="small" onClick={handleDismissError}>
              {actionLabels.dismiss}
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
        closable
        onClose={handleDismissError}
      />
    );
  };

  // Render upload progress
  const renderUploadProgress = () => {
    if (!uploadState.isUploading || !showProgress) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <Progress
          percent={Math.round(uploadProgress)}
          status={uploadState.error ? 'exception' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {pendingFile ? `Uploading ${pendingFile.name}...` : 'Uploading...'}
        </Text>
      </div>
    );
  };

  // Render media preview with enhanced error handling
  const renderMediaPreview = (item: MediaItem, index: number) => {
    return (
      <Col key={`${title.toLowerCase().replace(/ /g, "-")}-${item.id || item.url}-${index}`} xs={12} sm={8} md={6} lg={4}>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt="Media"
              style={{ 
                width: '100%', 
                height: 100, 
                objectFit: 'cover', 
                borderRadius: 4,
                border: '1px solid #d9d9d9'
              }}
              onError={(e) => {
                // Fallback for broken images
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
          ) : (
            <video
              src={item.url}
              style={{ 
                width: '100%', 
                height: 100, 
                objectFit: 'cover', 
                borderRadius: 4,
                border: '1px solid #d9d9d9'
              }}
              muted
              onMouseEnter={(e) => {
                (e.target as HTMLVideoElement).play().catch(() => {});
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLVideoElement).pause();
                (e.target as HTMLVideoElement).currentTime = 0;
              }}
              onError={(e) => {
                // Fallback for broken videos
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
          )}
          
          {/* Fallback element for broken media */}
          <div 
            className="fallback"
            style={{
              display: 'none',
              width: '100%', 
              height: 100, 
              backgroundColor: '#f5f5f5', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: 4,
              border: '1px solid #d9d9d9',
              color: '#999'
            }}
          >
            <span style={{ fontSize: '24px' }}>
              {item.type === 'image' ? '📷' : '🎥'}
            </span>
          </div>

          <Tooltip title="Remove media">
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              size="small"
              style={{ 
                position: 'absolute', 
                top: 4, 
                right: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: 'none'
              }}
              onClick={() => onRemove(item.url)}
              disabled={disabled}
            />
          </Tooltip>
        </div>
      </Col>
    );
  };

  return (
    <Form.Item label={title}>
      <div>
        {/* Error Alert */}
        {renderErrorAlert()}
        
        {/* Upload Progress */}
        {renderUploadProgress()}
        
        {/* Upload Controls */}
        <Space style={{ marginBottom: 16 }}>
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            accept={accept}
            disabled={disabled || uploadState.isUploading || media.length >= maxCount}
          >
            <Button 
              icon={uploadState.isUploading ? <Spin size="small" /> : <UploadOutlined />}
              disabled={disabled || uploadState.isUploading || media.length >= maxCount}
              loading={uploadState.isUploading}
            >
              {uploadState.isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Upload>
          
          <Button
            icon={<PictureOutlined />}
            onClick={onGalleryOpen}
            disabled={disabled || uploadState.isUploading}
          >
            Gallery
          </Button>
          
          {media.length > 0 && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {media.length} / {maxCount} files
            </Text>
          )}
        </Space>

        {/* Success feedback */}
        {!uploadState.error && !uploadState.isUploading && media.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text type="success" style={{ fontSize: '12px' }}>
              <CheckCircleOutlined /> {media.length} file{media.length !== 1 ? 's' : ''} uploaded
            </Text>
          </div>
        )}
        
        {/* Media Preview Grid */}
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            {media.map(renderMediaPreview)}
          </Row>
        </div>
        
        {/* Help text */}
        {media.length === 0 && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
            Supported formats: Images (JPG, PNG, GIF, WebP, AVIF) up to 10MB, Videos (MP4, WebM, OGG, AVI, MOV) up to 50MB
          </Text>
        )}
      </div>
    </Form.Item>
  );
};

export default MediaUploadSection;
