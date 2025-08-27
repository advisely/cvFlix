'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Row,
  Col,
  Statistic,
  Progress,
  message,
  Tooltip,
  Switch
} from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CodeOutlined
} from '@ant-design/icons';

import { SitemapEntry, generateSitemapXML, ValidationResult } from './utils/sitemap-utils';

const { Text, Title } = Typography;

export interface SitemapXmlViewProps {
  entries: SitemapEntry[];
  validationResult?: ValidationResult | null;
  onCopyXml?: (xml: string) => void;
  maxPreviewLength?: number;
}

export const SitemapXmlView: React.FC<SitemapXmlViewProps> = ({
  entries,
  validationResult,
  onCopyXml,
  maxPreviewLength = 10000
}) => {
  const [xmlContent, setXmlContent] = useState('');
  const [showFullXml, setShowFullXml] = useState(false);
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [xmlStats, setXmlStats] = useState({
    size: 0,
    lines: 0,
    urls: 0,
    compressed: false
  });

  // Generate XML content
  useEffect(() => {
    if (entries.length > 0) {
      const xml = generateSitemapXML(entries);
      setXmlContent(xml);
      
      // Calculate statistics
      const lines = xml.split('\n').length;
      const size = new Blob([xml]).size;
      
      setXmlStats({
        size,
        lines,
        urls: entries.length,
        compressed: false
      });
    } else {
      setXmlContent('');
      setXmlStats({ size: 0, lines: 0, urls: 0, compressed: false });
    }
  }, [entries]);

  // Memoized XML display (truncated or full)
  const displayXml = useMemo(() => {
    if (!xmlContent) return '';
    
    if (!showFullXml && xmlContent.length > maxPreviewLength) {
      const truncated = xmlContent.substring(0, maxPreviewLength);
      const lastCompleteTag = truncated.lastIndexOf('</url>') + 6;
      return truncated.substring(0, lastCompleteTag) + '\n  <!-- ... truncated ... -->\n</urlset>';
    }
    
    return xmlContent;
  }, [xmlContent, showFullXml, maxPreviewLength]);

  // Syntax highlighting function
  const highlightXml = (xml: string): string => {
    if (!syntaxHighlighting) return xml;
    
    return xml
      .replace(/(&lt;[^&]*&gt;)/g, '<span style="color: #1890ff; font-weight: bold;">$1</span>')
      .replace(/(xmlns[^=]*="[^"]*")/g, '<span style="color: #722ed1;">$1</span>')
      .replace(/(&amp;[^;]*;)/g, '<span style="color: #fa8c16;">$1</span>')
      .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color: #999; font-style: italic;">$1</span>')
      .replace(/(&lt;\?xml.*?\?&gt;)/g, '<span style="color: #52c41a; font-weight: bold;">$1</span>');
  };

  const handleCopyXml = async () => {
    if (!xmlContent) {
      message.warning('No XML content to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(xmlContent);
      message.success('XML content copied to clipboard!');
      onCopyXml?.(xmlContent);
    } catch {
      message.error('Failed to copy XML content');
    }
  };

  const handleDownloadXml = () => {
    if (!xmlContent) {
      message.warning('No XML content to download');
      return;
    }

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitemap-${new Date().getTime()}.xml`;
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    message.success('XML sitemap downloaded!');
  };

  const getValidationIcon = () => {
    if (!validationResult) return <FileTextOutlined />;
    if (validationResult.isValid) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (validationResult.errors.length > 0) return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
  };

  const getValidationStatus = () => {
    if (!validationResult) return { type: 'info', message: 'Not validated' };
    if (validationResult.isValid) return { type: 'success', message: 'Valid XML sitemap' };
    if (validationResult.errors.length > 0) {
      return { 
        type: 'error', 
        message: `${validationResult.errors.length} errors found` 
      };
    }
    return { 
      type: 'warning', 
      message: `${validationResult.warnings.length} warnings found` 
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getSizeColor = (size: number): string => {
    if (size > 45 * 1024 * 1024) return '#ff4d4f'; // Red if > 45MB
    if (size > 30 * 1024 * 1024) return '#faad14'; // Orange if > 30MB
    if (size > 10 * 1024 * 1024) return '#1890ff'; // Blue if > 10MB
    return '#52c41a'; // Green
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="sitemap-xml-view">
      {/* Header with Controls */}
      <Card 
        size="small" 
        title={
          <Space>
            <CodeOutlined />
            <span>XML Sitemap Source</span>
            {getValidationIcon()}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Toggle syntax highlighting">
              <Switch
                checked={syntaxHighlighting}
                onChange={setSyntaxHighlighting}
                size="small"
                checkedChildren="Syntax"
                unCheckedChildren="Plain"
              />
            </Tooltip>
            
            <Button
              icon={showFullXml ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowFullXml(!showFullXml)}
              size="small"
            >
              {showFullXml ? 'Collapse' : 'Show Full'}
            </Button>
            
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopyXml}
              size="small"
              type="primary"
              ghost
              disabled={!xmlContent}
            >
              Copy XML
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadXml}
              size="small"
              disabled={!xmlContent}
            >
              Download
            </Button>
          </Space>
        }
      >
        {/* Statistics Row */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Statistic
              title="File Size"
              value={formatFileSize(xmlStats.size)}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: getSizeColor(xmlStats.size), fontSize: '16px' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Lines"
              value={xmlStats.lines}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="URLs"
              value={xmlStats.urls}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Status"
              value={validationStatus.message}
              prefix={getValidationIcon()}
              valueStyle={{ 
                fontSize: '14px',
                color: validationStatus.type === 'success' ? '#52c41a' : 
                       validationStatus.type === 'error' ? '#ff4d4f' : '#faad14'
              }}
            />
          </Col>
          <Col span={6}>
            {xmlStats.size > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Size limit progress
                </Text>
                <Progress
                  percent={Math.min((xmlStats.size / (50 * 1024 * 1024)) * 100, 100)}
                  strokeColor={getSizeColor(xmlStats.size)}
                  size="small"
                  format={(percent) => `${percent?.toFixed(1)}% of 50MB`}
                />
              </div>
            )}
          </Col>
        </Row>

        {/* Validation Results */}
        {validationResult && !validationResult.isValid && (
          <Alert
            message={`Validation ${validationResult.errors.length > 0 ? 'Errors' : 'Warnings'}`}
            description={
              <div>
                {validationResult.errors.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <Text type="danger" strong>Errors:</Text>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {validationResult.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>
                          <Text type="danger">{error.message}</Text>
                        </li>
                      ))}
                      {validationResult.errors.length > 3 && (
                        <li>...and {validationResult.errors.length - 3} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <div>
                    <Text type="warning" strong>Warnings:</Text>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {validationResult.warnings.slice(0, 3).map((warning, index) => (
                        <li key={index}>
                          <Text type="warning">{warning.message}</Text>
                        </li>
                      ))}
                      {validationResult.warnings.length > 3 && (
                        <li>...and {validationResult.warnings.length - 3} more warnings</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            }
            type={validationResult.errors.length > 0 ? 'error' : 'warning'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </Card>

      {/* XML Content Display */}
      <Card size="small" style={{ marginTop: 8 }}>
        {xmlContent ? (
          <div>
            <pre
              style={{
                background: '#f6f8fa',
                border: '1px solid #e1e4e8',
                borderRadius: '6px',
                padding: '16px',
                overflow: 'auto',
                maxHeight: showFullXml ? 'none' : '400px',
                fontSize: '12px',
                lineHeight: '1.4',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
              dangerouslySetInnerHTML={{
                __html: syntaxHighlighting ? 
                  highlightXml(displayXml.replace(/</g, '&lt;').replace(/>/g, '&gt;')) :
                  displayXml.replace(/</g, '&lt;').replace(/>/g, '&gt;')
              }}
            />
            
            {!showFullXml && xmlContent.length > maxPreviewLength && (
              <div style={{ 
                marginTop: 8, 
                textAlign: 'center',
                padding: '8px',
                background: '#fafafa',
                borderRadius: '4px',
                border: '1px dashed #d9d9d9'
              }}>
                <Text type="secondary">
                  Content truncated. Showing {maxPreviewLength.toLocaleString()} of {xmlContent.length.toLocaleString()} characters.
                </Text>
                <br />
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => setShowFullXml(true)}
                >
                  Show full content ({formatFileSize(xmlStats.size)})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#999'
          }}>
            <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Title level={4} type="secondary">No XML Content</Title>
            <Text type="secondary">
              Generate a sitemap to view the XML source code.
            </Text>
          </div>
        )}
      </Card>

      {/* XML Best Practices */}
      <Card size="small" title="XML Sitemap Guidelines" style={{ marginTop: 8 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>File Limits</Title>
            <ul style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <li>Maximum 50,000 URLs per sitemap</li>
              <li>Maximum 50MB uncompressed size</li>
              <li>UTF-8 encoding required</li>
              <li>Use sitemap index for larger sites</li>
            </ul>
          </Col>
          <Col span={12}>
            <Title level={5}>URL Requirements</Title>
            <ul style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <li>All URLs must be absolute (include https://)</li>
              <li>URLs must be properly XML-escaped</li>
              <li>Priority values between 0.0 and 1.0</li>
              <li>lastmod in ISO 8601 format (YYYY-MM-DD)</li>
            </ul>
          </Col>
        </Row>
      </Card>

      {/* File size warning */}
      {xmlStats.size > 40 * 1024 * 1024 && (
        <Alert
          message="Large Sitemap Warning"
          description={`Your sitemap is ${formatFileSize(xmlStats.size)}, approaching the 50MB limit. Consider splitting into multiple sitemaps using a sitemap index.`}
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
};