'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Card,
  Upload,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Alert,
  Progress,
  Tag,
  Tooltip,
  Modal,
  Slider,
  Select,
  message,
  Tabs,
  Table,
  Popover,
  Image as AntImage
} from 'antd';
import {
  UploadOutlined,
  PictureOutlined,
  ScissorOutlined,
  CompressOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/lib/upload/interface';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Platform specifications
interface PlatformSpec {
  name: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  maxSize: number; // in MB
  format: string[];
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface OptimizedImage {
  id: string;
  originalUrl: string;
  optimizedUrl: string;
  platform: string;
  dimensions: { width: number; height: number };
  fileSize: number;
  format: string;
  createdAt: Date;
}

interface SocialImageManagerProps {
  onImageSelect?: (imageUrl: string, platform: string) => void;
  currentImages?: Record<string, string>;
  maxImages?: number;
}

const SocialImageManager: React.FC<SocialImageManagerProps> = ({
  onImageSelect,
  currentImages = {},
  maxImages = 10
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);
  const [processingProgress, setProcessingProgress] = useState<Record<string, number>>({});
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');
  const [compressionLevel, setCompressionLevel] = useState(85);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Platform specifications
  const PLATFORM_SPECS: Record<string, PlatformSpec> = {
    facebook: {
      name: 'Facebook',
      dimensions: { width: 1200, height: 630 },
      aspectRatio: '1.91:1',
      maxSize: 8,
      format: ['JPEG', 'PNG'],
      description: 'Recommended for Facebook posts and ads',
      icon: <FacebookOutlined />,
      color: '#1877F2'
    },
    twitter: {
      name: 'Twitter',
      dimensions: { width: 1200, height: 600 },
      aspectRatio: '2:1',
      maxSize: 5,
      format: ['JPEG', 'PNG', 'WEBP'],
      description: 'Optimized for Twitter cards',
      icon: <TwitterOutlined />,
      color: '#1DA1F2'
    },
    linkedin: {
      name: 'LinkedIn',
      dimensions: { width: 1200, height: 627 },
      aspectRatio: '1.91:1',
      maxSize: 5,
      format: ['JPEG', 'PNG'],
      description: 'Professional posts and articles',
      icon: <LinkedinOutlined />,
      color: '#0A66C2'
    },
    'twitter-summary': {
      name: 'Twitter Summary',
      dimensions: { width: 144, height: 144 },
      aspectRatio: '1:1',
      maxSize: 1,
      format: ['JPEG', 'PNG'],
      description: 'Square image for Twitter summary cards',
      icon: <TwitterOutlined />,
      color: '#1DA1F2'
    },
    instagram: {
      name: 'Instagram',
      dimensions: { width: 1080, height: 1080 },
      aspectRatio: '1:1',
      maxSize: 8,
      format: ['JPEG', 'PNG'],
      description: 'Square format for Instagram posts',
      icon: <PictureOutlined />,
      color: '#E4405F'
    },
    og: {
      name: 'OpenGraph',
      dimensions: { width: 1200, height: 630 },
      aspectRatio: '1.91:1',
      maxSize: 8,
      format: ['JPEG', 'PNG'],
      description: 'General social media sharing',
      icon: <PictureOutlined />,
      color: '#52c41a'
    }
  };

  // Image optimization function
  const optimizeImageForPlatform = useCallback(async (
    file: File,
    platform: string,
    quality: number = 85
  ): Promise<{ url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      const spec = PLATFORM_SPECS[platform];
      
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = spec.dimensions.width;
        canvas.height = spec.dimensions.height;

        // Calculate scaling to maintain aspect ratio
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ url, size: blob.size });
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', quality / 100);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Handle file upload
  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      const uploadFile = file as File;
      const fileId = Date.now().toString();
      
      setProcessingProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Process for each selected platform
      const platforms = selectedPlatform === 'all' 
        ? Object.keys(PLATFORM_SPECS) 
        : [selectedPlatform];

      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        const progress = ((i + 1) / platforms.length) * 100;
        
        onProgress?.({ percent: progress });
        setProcessingProgress(prev => ({ ...prev, [fileId]: progress }));

        try {
          const { url, size } = await optimizeImageForPlatform(
            uploadFile, 
            platform, 
            compressionLevel
          );

          const optimizedImage: OptimizedImage = {
            id: `${fileId}-${platform}`,
            originalUrl: URL.createObjectURL(uploadFile),
            optimizedUrl: url,
            platform,
            dimensions: PLATFORM_SPECS[platform].dimensions,
            fileSize: size,
            format: 'JPEG',
            createdAt: new Date()
          };

          setOptimizedImages(prev => [...prev, optimizedImage]);
        } catch (error) {
          console.error(`Failed to optimize for ${platform}:`, error);
        }
      }

      setProcessingProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });

      onSuccess?.('Upload completed');
      message.success(`Image optimized for ${platforms.length} platform(s)`);
    } catch (error) {
      onError?.(error as Error);
      message.error('Failed to process image');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Download optimized image
  const downloadImage = (image: OptimizedImage) => {
    const link = document.createElement('a');
    link.href = image.optimizedUrl;
    link.download = `${image.platform}-optimized-${image.dimensions.width}x${image.dimensions.height}.jpg`;
    link.click();
  };

  // Delete image
  const deleteImage = (imageId: string) => {
    setOptimizedImages(prev => prev.filter(img => img.id !== imageId));
    message.success('Image deleted');
  };

  // Select image for platform
  const selectImageForPlatform = (imageUrl: string, platform: string) => {
    onImageSelect?.(imageUrl, platform);
    message.success(`Image selected for ${PLATFORM_SPECS[platform].name}`);
  };

  // Table columns for image management
  const tableColumns = [
    {
      title: 'Preview',
      dataIndex: 'optimizedUrl',
      key: 'preview',
      render: (url: string) => (
        <AntImage
          src={url}
          alt="Optimized preview"
          width={60}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => {
        const spec = PLATFORM_SPECS[platform];
        return (
          <Space>
            <span style={{ color: spec.color }}>{spec.icon}</span>
            <span>{spec.name}</span>
            <Tag color={spec.color} size="small">
              {spec.dimensions.width}×{spec.dimensions.height}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => (
        <span>{formatFileSize(size)}</span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: OptimizedImage) => (
        <Space>
          <Tooltip title="Use this image">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => selectImageForPlatform(record.optimizedUrl, record.platform)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadImage(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteImage(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <Card
        title={
          <Space>
            <PictureOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Social Media Image Optimizer
            </Title>
          </Space>
        }
      >
        <Alert
          message="Automatic Image Optimization"
          description="Upload your images and we'll automatically optimize them for different social media platforms with the correct dimensions and file sizes."
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
          showIcon
        />

        <Tabs defaultActiveKey="upload">
          <TabPane tab="Upload & Optimize" key="upload">
            <Row gutter={[16, 16]}>
              {/* Platform Selection */}
              <Col span={24}>
                <Card title="1. Select Target Platform(s)" size="small">
                  <Row gutter={[8, 8]}>
                    <Col span={6}>
                      <Select
                        value={selectedPlatform}
                        onChange={setSelectedPlatform}
                        style={{ width: '100%' }}
                      >
                        <Option value="all">All Platforms</Option>
                        {Object.entries(PLATFORM_SPECS).map(([key, spec]) => (
                          <Option key={key} value={key}>
                            <Space>
                              <span style={{ color: spec.color }}>{spec.icon}</span>
                              {spec.name}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={18}>
                      {selectedPlatform !== 'all' && PLATFORM_SPECS[selectedPlatform] && (
                        <Alert
                          message={PLATFORM_SPECS[selectedPlatform].description}
                          description={
                            <div>
                              <strong>Dimensions:</strong> {PLATFORM_SPECS[selectedPlatform].dimensions.width}×{PLATFORM_SPECS[selectedPlatform].dimensions.height} 
                              ({PLATFORM_SPECS[selectedPlatform].aspectRatio}) • 
                              <strong> Max Size:</strong> {PLATFORM_SPECS[selectedPlatform].maxSize}MB
                            </div>
                          }
                          type="info"
                          showIcon={false}
                          style={{ marginBottom: 0 }}
                        />
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Compression Settings */}
              <Col span={24}>
                <Card title="2. Quality Settings" size="small">
                  <Row gutter={16} align="middle">
                    <Col span={4}>
                      <Text strong>Compression Quality:</Text>
                    </Col>
                    <Col span={12}>
                      <Slider
                        min={50}
                        max={100}
                        value={compressionLevel}
                        onChange={setCompressionLevel}
                        marks={{
                          50: 'High Compression',
                          75: 'Balanced',
                          100: 'Best Quality'
                        }}
                      />
                    </Col>
                    <Col span={4}>
                      <Tag color={compressionLevel > 90 ? 'green' : compressionLevel > 70 ? 'orange' : 'red'}>
                        {compressionLevel}%
                      </Tag>
                    </Col>
                    <Col span={4}>
                      <Tooltip title="Higher quality = larger file size">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Upload Area */}
              <Col span={24}>
                <Card title="3. Upload Images" size="small">
                  <Upload.Dragger
                    customRequest={handleUpload}
                    multiple
                    accept="image/*"
                    showUploadList={false}
                    style={{ marginBottom: 16 }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">
                      <strong>Click or drag images here to upload</strong>
                    </p>
                    <p className="ant-upload-hint">
                      Supports PNG, JPG, WEBP formats. Images will be automatically optimized for selected platform(s).
                    </p>
                  </Upload.Dragger>

                  {/* Processing Progress */}
                  {Object.entries(processingProgress).map(([fileId, progress]) => (
                    <div key={fileId} style={{ marginBottom: 8 }}>
                      <Progress
                        percent={progress}
                        status="active"
                        format={() => `Optimizing... ${Math.round(progress)}%`}
                      />
                    </div>
                  ))}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={`Optimized Images (${optimizedImages.length})`} key="gallery">
            <Card>
              {optimizedImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">No optimized images yet</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Upload images to see them here</Text>
                  </div>
                </div>
              ) : (
                <Table
                  columns={tableColumns}
                  dataSource={optimizedImages}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab="Platform Guidelines" key="guidelines">
            <Row gutter={[16, 16]}>
              {Object.entries(PLATFORM_SPECS).map(([key, spec]) => (
                <Col key={key} span={12}>
                  <Card
                    title={
                      <Space>
                        <span style={{ color: spec.color }}>{spec.icon}</span>
                        {spec.name}
                      </Space>
                    }
                    size="small"
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Recommended Size:</Text>
                      <br />
                      <Tag>{spec.dimensions.width} × {spec.dimensions.height}</Tag>
                      <Tag>{spec.aspectRatio}</Tag>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Max File Size:</Text>
                      <br />
                      <Tag color="orange">{spec.maxSize} MB</Tag>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Supported Formats:</Text>
                      <br />
                      {spec.format.map(format => (
                        <Tag key={format} color="blue">{format}</Tag>
                      ))}
                    </div>
                    <Text type="secondary">{spec.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Crop Modal */}
      <Modal
        title="Crop Image"
        open={cropModalVisible}
        onCancel={() => setCropModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setCropModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="crop" type="primary" icon={<ScissorOutlined />}>
            Apply Crop
          </Button>
        ]}
      >
        {/* Crop interface would go here */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <ScissorOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Crop interface coming soon</Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SocialImageManager;