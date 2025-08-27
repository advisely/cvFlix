'use client';

import React, { useState, useCallback } from 'react';
import { 
  Card,
  Button,
  Table,
  Space,
  Tag,
  Progress,
  Alert,
  Tooltip,
  Typography,
  Row,
  Col,
  Image,
  message,
  Popover
} from 'antd';
import {
  DownloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { 
  FaviconSet, 
  FAVICON_SIZES,
  generatePWAManifestIcons,
  generateFaviconMetaTags,
  FaviconSize
} from './utils/favicon-utils';

const { Text, Title } = Typography;

interface FaviconGeneratorProps {
  faviconSet: FaviconSet;
  onRemoveFavicon?: (faviconName: string) => void;
  onPreviewFavicon?: (faviconName: string, dataUrl: string) => void;
  showActions?: boolean;
}

const FaviconGenerator: React.FC<FaviconGeneratorProps> = ({ 
  faviconSet, 
  onRemoveFavicon,
  onPreviewFavicon,
  showActions = true
}) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedFavicons, setSelectedFavicons] = useState<string[]>([]);

  // Helper function to get file size estimate
  const getFileSizeEstimate = (dataUrl: string): string => {
    const sizeBytes = dataUrl.length * 0.75; // Base64 overhead estimate
    if (sizeBytes < 1024) {
      return `${Math.round(sizeBytes)} B`;
    } else if (sizeBytes < 1024 * 1024) {
      return `${Math.round(sizeBytes / 1024)} KB`;
    } else {
      return `${Math.round(sizeBytes / (1024 * 1024))} MB`;
    }
  };

  // Get purpose color for display
  const getPurposeColor = (purpose: string): string => {
    switch (purpose) {
      case 'favicon': return 'blue';
      case 'apple-touch-icon': return 'orange';
      case 'android-chrome': return 'green';
      case 'mstile': return 'purple';
      case 'safari-pinned-tab': return 'cyan';
      default: return 'default';
    }
  };

  // Get status based on availability
  const getStatusTag = (faviconName: string, config: FaviconSize) => {
    const hasIcon = !!faviconSet[faviconName];
    const isEssential = ['favicon-16x16', 'favicon-32x32', 'apple-touch-icon-180x180', 'android-chrome-192x192'].includes(faviconName);
    const isRecommended = ['android-chrome-512x512', 'apple-touch-icon-152x152'].includes(faviconName);

    if (!hasIcon) {
      if (isEssential) {
        return <Tag color="error" icon={<WarningOutlined />}>Missing (Essential)</Tag>;
      } else if (isRecommended) {
        return <Tag color="warning" icon={<InfoCircleOutlined />}>Missing (Recommended)</Tag>;
      } else {
        return <Tag color="default">Not Generated</Tag>;
      }
    }

    return <Tag color="success" icon={<CheckCircleOutlined />}>Generated</Tag>;
  };

  // Download single favicon
  const downloadFavicon = useCallback(async (faviconName: string, dataUrl: string) => {
    try {
      const config = FAVICON_SIZES[faviconName];
      const extension = config.format === 'ico' ? 'ico' : 'png';
      const filename = `${faviconName}.${extension}`;

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      message.error(`Failed to download ${faviconName}`);
    }
  }, []);

  // Download all favicons as ZIP (simplified - download individually)
  const downloadAllFavicons = useCallback(async () => {
    setDownloading(true);
    try {
      const availableFavicons = Object.entries(faviconSet);
      
      for (const [faviconName, dataUrl] of availableFavicons) {
        await downloadFavicon(faviconName, dataUrl);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      message.success(`Downloaded ${availableFavicons.length} favicons`);
    } catch (error) {
      console.error('Bulk download error:', error);
      message.error('Failed to download all favicons');
    } finally {
      setDownloading(false);
    }
  }, [faviconSet, downloadFavicon]);

  // Generate HTML meta tags
  const generateAndCopyMetaTags = useCallback(async () => {
    try {
      const metaTags = generateFaviconMetaTags(faviconSet);
      const htmlContent = metaTags.join('\n');
      
      await navigator.clipboard.writeText(htmlContent);
      message.success('HTML meta tags copied to clipboard');
    } catch (error) {
      message.error('Failed to copy meta tags');
    }
  }, [faviconSet]);

  // Generate PWA manifest
  const generateAndCopyPWAManifest = useCallback(async () => {
    try {
      const icons = generatePWAManifestIcons(faviconSet);
      const manifest = {
        name: "Your App Name",
        short_name: "App",
        description: "Your app description",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: icons
      };
      
      const jsonContent = JSON.stringify(manifest, null, 2);
      await navigator.clipboard.writeText(jsonContent);
      message.success('PWA manifest copied to clipboard');
    } catch (error) {
      message.error('Failed to copy PWA manifest');
    }
  }, [faviconSet]);

  // Table columns
  const columns = [
    {
      title: 'Preview',
      dataIndex: 'preview',
      key: 'preview',
      width: 80,
      render: (_, record: { name: string; config: FaviconSize }) => {
        const dataUrl = faviconSet[record.name];
        if (!dataUrl) {
          return <div style={{ width: 32, height: 32, backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9' }} />;
        }
        
        return (
          <Image
            src={dataUrl}
            alt={record.config.description}
            width={32}
            height={32}
            style={{ border: '1px solid #d9d9d9' }}
            preview={{
              mask: <EyeOutlined style={{ fontSize: 12 }} />
            }}
          />
        );
      }
    },
    {
      title: 'Name & Size',
      dataIndex: 'info',
      key: 'info',
      render: (_, record: { name: string; config: FaviconSize }) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.config.width} × {record.config.height}px
          </Text>
        </div>
      )
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      render: (_, record: { name: string; config: FaviconSize }) => (
        <Tag color={getPurposeColor(record.config.purpose)}>
          {record.config.purpose}
        </Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_, record: { name: string; config: FaviconSize }) => (
        <Text style={{ fontSize: '12px' }}>{record.config.description}</Text>
      )
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (_, record: { name: string; config: FaviconSize }) => (
        <Tag>{record.config.format.toUpperCase()}</Tag>
      )
    },
    {
      title: 'File Size',
      dataIndex: 'size',
      key: 'size',
      render: (_, record: { name: string; config: FaviconSize }) => {
        const dataUrl = faviconSet[record.name];
        if (!dataUrl) return <Text type="secondary">-</Text>;
        
        return <Text style={{ fontSize: '12px' }}>{getFileSizeEstimate(dataUrl)}</Text>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record: { name: string; config: FaviconSize }) => 
        getStatusTag(record.name, record.config)
    }
  ];

  // Add actions column if showActions is true
  if (showActions) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: { name: string; config: FaviconSize }) => {
        const dataUrl = faviconSet[record.name];
        if (!dataUrl) return null;

        return (
          <Space size="small">
            <Tooltip title="Download">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadFavicon(record.name, dataUrl)}
              />
            </Tooltip>
            {onPreviewFavicon && (
              <Tooltip title="Preview">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onPreviewFavicon(record.name, dataUrl)}
                />
              </Tooltip>
            )}
            {onRemoveFavicon && (
              <Tooltip title="Remove">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => onRemoveFavicon(record.name)}
                />
              </Tooltip>
            )}
          </Space>
        );
      }
    } as any);
  }

  // Prepare table data
  const tableData = Object.entries(FAVICON_SIZES).map(([name, config]) => ({
    key: name,
    name,
    config
  }));

  // Calculate statistics
  const totalFavicons = Object.keys(FAVICON_SIZES).length;
  const generatedFavicons = Object.keys(faviconSet).length;
  const completionPercentage = Math.round((generatedFavicons / totalFavicons) * 100);

  const essentialFavicons = ['favicon-16x16', 'favicon-32x32', 'apple-touch-icon-180x180', 'android-chrome-192x192'];
  const essentialGenerated = essentialFavicons.filter(name => faviconSet[name]).length;

  return (
    <div>
      {/* Summary Card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={completionPercentage}
                width={60}
                format={() => `${generatedFavicons}/${totalFavicons}`}
              />
              <div style={{ marginTop: 8, fontSize: '12px' }}>
                <Text type="secondary">Total Generated</Text>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round((essentialGenerated / essentialFavicons.length) * 100)}
                width={60}
                format={() => `${essentialGenerated}/4`}
                strokeColor={essentialGenerated === 4 ? '#52c41a' : '#faad14'}
              />
              <div style={{ marginTop: 8, fontSize: '12px' }}>
                <Text type="secondary">Essential Icons</Text>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                size="small" 
                icon={<DownloadOutlined />}
                onClick={downloadAllFavicons}
                loading={downloading}
                disabled={generatedFavicons === 0}
                block
              >
                Download All
              </Button>
              <Popover
                content={
                  <Space direction="vertical" size="small">
                    <Button size="small" onClick={generateAndCopyMetaTags}>
                      Copy HTML Meta Tags
                    </Button>
                    <Button size="small" onClick={generateAndCopyPWAManifest}>
                      Copy PWA Manifest
                    </Button>
                  </Space>
                }
                title="Export Options"
                trigger="click"
              >
                <Button size="small" block>
                  Export Code
                </Button>
              </Popover>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Alerts for missing essential favicons */}
      {essentialGenerated < essentialFavicons.length && (
        <Alert
          message="Missing Essential Favicons"
          description={`${essentialFavicons.length - essentialGenerated} essential favicon sizes are missing. These are required for proper display across devices.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Favicon Table */}
      <Card title="Generated Favicons" size="small">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="small"
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default FaviconGenerator;
