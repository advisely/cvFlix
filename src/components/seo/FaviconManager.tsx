'use client';

import React, { useState, useCallback } from 'react';
import { 
  Card,
  Upload,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Radio,
  Progress,
  message,
  Alert,
  Spin,
  Tooltip,
  Divider
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useSEOConfig } from './hooks/useSEOConfig';
import FaviconGenerator from './FaviconGenerator';
import FaviconPreview from './FaviconPreview';
import FaviconValidator from './FaviconValidator';
import { 
  FaviconSet, 
  generateFaviconSizes,
  extractDominantColor 
} from './utils/favicon-utils';

const { Title, Text } = Typography;
const { Dragger } = Upload;

type PreviewMode = 'browser' | 'mobile' | 'pwa';

const FaviconManager: React.FC = () => {
  const { config, updateConfig } = useSEOConfig();
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [faviconSet, setFaviconSet] = useState<FaviconSet>({});
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('browser');
  const [dominantColor, setDominantColor] = useState<string>('#ffffff');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle image upload and favicon generation
  const handleImageUpload = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Please upload a PNG, JPG, GIF, SVG, or WebP image');
      return false;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error('File size must be less than 10MB');
      return false;
    }

    setSourceImage(file);
    setGenerating(true);
    setUploadProgress(0);

    try {
      // Generate all favicon sizes
      message.info('Generating favicon sizes...');
      setUploadProgress(20);

      const generatedSet = await generateFaviconSizes(file);
      setUploadProgress(60);

      // Extract dominant color for theme
      const primaryFavicon = generatedSet['favicon-32x32'] || generatedSet['favicon-16x16'];
      if (primaryFavicon) {
        try {
          const color = await extractDominantColor(primaryFavicon);
          setDominantColor(color);
        } catch (error) {
          console.warn('Failed to extract dominant color:', error);
        }
      }

      setUploadProgress(80);
      setFaviconSet(generatedSet);

      // Auto-save the primary favicon URL to SEO config
      const primaryFaviconUrl = generatedSet['favicon-32x32'] || generatedSet['favicon-16x16'];
      if (primaryFaviconUrl && config) {
        try {
          await saveFaviconToServer(primaryFaviconUrl);
        } catch (error) {
          console.warn('Failed to save favicon to server:', error);
        }
      }

      setUploadProgress(100);
      message.success(`Generated ${Object.keys(generatedSet).length} favicon variants`);
    } catch (error) {
      console.error('Favicon generation error:', error);
      message.error('Failed to generate favicons. Please try again.');
    } finally {
      setGenerating(false);
      setUploadProgress(0);
    }

    return false; // Prevent default upload behavior
  }, [config]);

  // Save favicon to server (simplified - would integrate with existing upload system)
  const saveFaviconToServer = async (faviconDataUrl: string) => {
    try {
      // Convert data URL to blob
      const response = await fetch(faviconDataUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'favicon.png');
      formData.append('type', 'favicon');

      // Upload to server
      const uploadResponse = await fetch('/api/upload/favicon', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Update SEO config with favicon URL
      if (config && updateConfig) {
        await updateConfig({ faviconUrl: uploadData.url });
        message.success('Favicon saved and configured');
      }
    } catch (error) {
      console.error('Save favicon error:', error);
      throw error;
    }
  };

  // Handle favicon removal
  const handleRemoveFavicon = useCallback((faviconName: string) => {
    const updatedSet = { ...faviconSet };
    delete updatedSet[faviconName];
    setFaviconSet(updatedSet);
    message.success(`Removed ${faviconName}`);
  }, [faviconSet]);

  // Handle favicon preview
  const handlePreviewFavicon = useCallback((faviconName: string, dataUrl: string) => {
    // This could open a modal or navigate to a preview page
    message.info(`Previewing ${faviconName}`);
  }, []);

  // Clear all favicons
  const handleClearAll = useCallback(() => {
    setFaviconSet({});
    setSourceImage(null);
    setDominantColor('#ffffff');
    message.success('Cleared all favicons');
  }, []);

  // Regenerate favicons
  const handleRegenerate = useCallback(async () => {
    if (!sourceImage) {
      message.warning('Please upload an image first');
      return;
    }

    await handleImageUpload(sourceImage);
  }, [sourceImage, handleImageUpload]);

  // Upload props for Ant Design Upload component
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: handleImageUpload,
    showUploadList: false,
    accept: '.png,.jpg,.jpeg,.gif,.svg,.webp',
  };

  const hasGenerated = Object.keys(faviconSet).length > 0;
  const siteName = config?.siteName || 'Your Site';

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: '0 0 8px 0' }}>
          Favicon Manager
        </Title>
        <Text type="secondary">
          Upload an image to generate favicons for all devices and platforms
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Upload Section */}
        <Col span={hasGenerated ? 12 : 24}>
          <Card title="Upload & Generate" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Dragger {...uploadProps} style={{ padding: '20px' }}>
                {generating ? (
                  <div style={{ padding: '20px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                      <Text>Generating favicons...</Text>
                      {uploadProgress > 0 && (
                        <Progress 
                          percent={uploadProgress} 
                          size="small" 
                          style={{ marginTop: '8px' }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag image to upload
                    </p>
                    <p className="ant-upload-hint">
                      PNG, JPG, GIF, SVG, or WebP • Max 10MB<br />
                      Recommended: 512×512px or larger for best quality
                    </p>
                  </>
                )}
              </Dragger>

              {sourceImage && (
                <Alert
                  message="Source Image Loaded"
                  description={`${sourceImage.name} (${Math.round(sourceImage.size / 1024)}KB)`}
                  type="success"
                  showIcon
                  action={
                    <Space>
                      <Button 
                        size="small" 
                        icon={<SyncOutlined />}
                        onClick={handleRegenerate}
                        loading={generating}
                      >
                        Regenerate
                      </Button>
                      <Button 
                        size="small" 
                        icon={<DeleteOutlined />}
                        danger
                        onClick={handleClearAll}
                      >
                        Clear
                      </Button>
                    </Space>
                  }
                />
              )}

              {hasGenerated && (
                <Alert
                  message="Favicon Set Generated"
                  description={`${Object.keys(faviconSet).length} favicon variants created`}
                  type="info"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* Preview Section */}
        {hasGenerated && (
          <Col span={12}>
            <Card title="Real-time Preview" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Radio.Group 
                  value={previewMode} 
                  onChange={e => setPreviewMode(e.target.value)}
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="browser">
                    <EyeOutlined /> Browser
                  </Radio.Button>
                  <Radio.Button value="mobile">
                    <EyeOutlined /> Mobile
                  </Radio.Button>
                  <Radio.Button value="pwa">
                    <EyeOutlined /> PWA
                  </Radio.Button>
                </Radio.Group>

                <FaviconPreview 
                  faviconSet={faviconSet}
                  mode={previewMode}
                  siteName={siteName}
                />
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      {/* Generator Section */}
      {hasGenerated && (
        <div style={{ marginTop: '24px' }}>
          <FaviconGenerator 
            faviconSet={faviconSet}
            onRemoveFavicon={handleRemoveFavicon}
            onPreviewFavicon={handlePreviewFavicon}
          />
        </div>
      )}

      {/* Validation Section */}
      {hasGenerated && (
        <div style={{ marginTop: '24px' }}>
          <Card title="Validation & Quality Check" size="small">
            <FaviconValidator 
              faviconSet={faviconSet}
              showDetails={true}
            />
          </Card>
        </div>
      )}

      {/* Help Section */}
      <div style={{ marginTop: '24px' }}>
        <Card title="Best Practices" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📐</div>
                <Text strong>Size Recommendations</Text>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  • Source: 512×512px minimum<br />
                  • Square aspect ratio<br />
                  • High contrast design<br />
                  • Simple, recognizable icon
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
                <Text strong>Design Guidelines</Text>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  • Avoid fine details<br />
                  • Use solid colors<br />
                  • Test on light/dark backgrounds<br />
                  • Consider mobile visibility
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                <Text strong>Performance Tips</Text>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  • PNG format recommended<br />
                  • Optimize file sizes<br />
                  • Use progressive loading<br />
                  • Cache efficiently
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Theme Color Display */}
      {dominantColor !== '#ffffff' && (
        <div style={{ marginTop: '16px' }}>
          <Alert
            message={
              <Space>
                <span>Extracted theme color:</span>
                <div style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: dominantColor,
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  verticalAlign: 'middle'
                }} />
                <Text code>{dominantColor}</Text>
              </Space>
            }
            type="info"
            style={{ marginTop: '8px' }}
          />
        </div>
      )}
    </div>
  );
};

export default FaviconManager;
