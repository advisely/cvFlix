'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  message, 
 
  Statistic, 
  Progress, 
  Tooltip,
  Alert,
  Typography,
  Row,
  Col,
  Divider,
  Switch,
  Badge
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';

import { 
  SitemapEntry, 
  SitemapSettings, 
  discoverSitePages,
  generateSitemapXML,
  validateSitemap,
  filterUrlsByPattern,
  sortSitemapEntries,
  getDefaultSitemapSettings 
} from './utils/sitemap-utils';
import { SitemapPreview } from './SitemapPreview';
import { SitemapSettings as SitemapSettingsComponent } from './SitemapSettings';

const { Title, Text } = Typography;

export interface SitemapGeneratorProps {
  onSitemapGenerated?: (sitemap: SitemapEntry[]) => void;
  onSettingsChange?: (settings: SitemapSettings) => void;
  initialSettings?: Partial<SitemapSettings>;
}

export const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({
  onSitemapGenerated,
  onSettingsChange,
  initialSettings = {}
}) => {
  const [sitemap, setSitemap] = useState<SitemapEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<SitemapSettings>({
    ...getDefaultSitemapSettings(),
    ...initialSettings
  });
  const [generationProgress, setGenerationProgress] = useState(0);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateSitemap> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);

  // Generate sitemap function - defined before useEffect to avoid hoisting issues
  const generateSitemap = useCallback(async () => {
    if (generating) {
      message.warning('Sitemap generation is already in progress...');
      return;
    }

    setGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Step 1: Discover pages (30%)
      setGenerationProgress(10);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const discovery = await discoverSitePages(baseUrl);
      setGenerationProgress(30);

      // Step 2: Combine and filter pages (20%)
      let allPages = [...discovery.staticPages, ...discovery.dynamicPages, ...discovery.mediaPages];
      
      // Apply exclusion filters
      if (settings.excludePatterns.length > 0) {
        allPages = filterUrlsByPattern(allPages, settings.excludePatterns);
      }
      setGenerationProgress(50);

      // Step 3: Sort and limit pages (20%)
      allPages = sortSitemapEntries(allPages, 'priority', 'desc');
      
      // Respect max URLs setting
      if (allPages.length > settings.maxUrls) {
        allPages = allPages.slice(0, settings.maxUrls);
        message.warning(`Sitemap limited to ${settings.maxUrls} URLs. Consider increasing the limit in settings.`);
      }
      setGenerationProgress(70);

      // Step 4: Generate and validate XML (20%)
      const xml = generateSitemapXML(allPages);
      const validation = validateSitemap(xml);
      setValidationResult(validation);
      setGenerationProgress(90);

      // Step 5: Save and finalize (10%)
      setSitemap(allPages);
      setLastGenerated(new Date());
      setGenerationProgress(100);

      if (validation.isValid) {
        message.success(`Sitemap generated successfully with ${allPages.length} URLs!`);
      } else {
        message.warning(`Sitemap generated with ${validation.errors.length} errors and ${validation.warnings.length} warnings.`);
      }

      // Callback for parent component
      onSitemapGenerated?.(allPages);

      // Auto-clear progress after success
      setTimeout(() => setGenerationProgress(0), 2000);

    } catch (error) {
      console.error('Error generating sitemap:', error);
      message.error('Failed to generate sitemap. Please try again.');
      setGenerationProgress(0);
    } finally {
      setGenerating(false);
    }
  }, [settings, onSitemapGenerated, generating]);

  // Load existing sitemap on component mount
  useEffect(() => {
    loadExistingSitemap();
  }, []);

  // Auto-generate sitemap when enabled
  useEffect(() => {
    if (autoGenerate && !sitemap.length) {
      generateSitemap();
    }
  }, [autoGenerate, generateSitemap, sitemap.length]);

  const loadExistingSitemap = async () => {
    try {
      const response = await fetch('/api/seo/sitemap');
      if (response.ok) {
        const data = await response.json();
        if (data.urls?.length > 0) {
          const entries: SitemapEntry[] = data.urls.map((url: {
            loc: string;
            lastmod?: string;
            changefreq?: SitemapEntry['changefreq'];
            priority?: number;
          }) => ({
            loc: url.loc,
            lastmod: url.lastmod || new Date().toISOString().split('T')[0],
            changefreq: url.changefreq || 'weekly',
            priority: url.priority || 0.5
          }));
          setSitemap(entries);
          setLastGenerated(data.generatedAt ? new Date(data.generatedAt) : new Date());
          
          // Validate loaded sitemap
          const xml = generateSitemapXML(entries);
          const validation = validateSitemap(xml);
          setValidationResult(validation);
        }
      }
    } catch (error) {
      console.error('Error loading existing sitemap:', error);
    }
  };


  const downloadSitemap = async () => {
    if (sitemap.length === 0) {
      message.error('No sitemap to download. Generate one first.');
      return;
    }

    setDownloading(true);
    try {
      const xml = generateSitemapXML(sitemap);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('Sitemap downloaded successfully!');
    } catch (error) {
      console.error('Error downloading sitemap:', error);
      message.error('Failed to download sitemap.');
    } finally {
      setDownloading(false);
    }
  };

  const uploadSitemap = async () => {
    if (sitemap.length === 0) {
      message.error('No sitemap to upload. Generate one first.');
      return;
    }

    if (validationResult && !validationResult.isValid) {
      message.error('Cannot upload sitemap with validation errors. Please fix them first.');
      return;
    }

    setUploading(true);
    try {
      const xml = generateSitemapXML(sitemap);
      const response = await fetch('/api/seo/sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xml,
          urls: sitemap.map(entry => ({
            loc: entry.loc,
            lastmod: entry.lastmod,
            changefreq: entry.changefreq,
            priority: entry.priority
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload sitemap');
      }

      message.success('Sitemap uploaded to server successfully!');
    } catch (error) {
      console.error('Error uploading sitemap:', error);
      message.error('Failed to upload sitemap to server.');
    } finally {
      setUploading(false);
    }
  };

  const clearSitemapCache = async () => {
    setClearing(true);
    try {
      const response = await fetch('/api/seo/sitemap', {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('Sitemap cache cleared successfully!');
        // Optionally reload the sitemap
        await loadExistingSitemap();
      } else {
        throw new Error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing sitemap cache:', error);
      message.error('Failed to clear sitemap cache.');
    } finally {
      setClearing(false);
    }
  };

  const handleSettingsChange = (newSettings: SitemapSettings) => {
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
    message.success('Settings updated successfully!');
  };

  const getValidationStatusColor = () => {
    if (!validationResult) return 'default';
    if (validationResult.isValid) return 'success';
    if (validationResult.errors.length > 0) return 'error';
    return 'warning';
  };

  const getValidationStatusText = () => {
    if (!validationResult) return 'Not validated';
    if (validationResult.isValid) return 'Valid';
    if (validationResult.errors.length > 0) return `${validationResult.errors.length} errors`;
    return `${validationResult.warnings.length} warnings`;
  };

  return (
    <div className="sitemap-generator">
      <Card
        title={
          <Space>
            <GlobalOutlined />
            <span>Advanced Sitemap Generator</span>
            {validationResult && (
              <Badge 
                status={getValidationStatusColor() as "success" | "error" | "default" | "processing" | "warning"} 
                text={getValidationStatusText()}
              />
            )}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Auto-generate on page changes">
              <Switch
                checked={autoGenerate}
                onChange={setAutoGenerate}
                size="small"
              />
              <Text type="secondary" style={{ marginLeft: 8 }}>Auto</Text>
            </Tooltip>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(!showSettings)}
              type={showSettings ? 'primary' : 'default'}
              size="small"
            >
              Settings
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={clearSitemapCache}
              loading={clearing}
              size="small"
              danger
            >
              Clear Cache
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {/* Generation Progress */}
          {generating && generationProgress > 0 && (
            <Col span={24}>
              <Alert
                message="Generating Sitemap"
                description={
                  <Progress 
                    percent={generationProgress} 
                    status={generationProgress === 100 ? 'success' : 'active'}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                }
                type="info"
                showIcon
              />
            </Col>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <Col span={24}>
              <Card size="small" title="Sitemap Generation Settings">
                <SitemapSettingsComponent
                  settings={settings}
                  onChange={handleSettingsChange}
                />
              </Card>
            </Col>
          )}

          {/* Statistics */}
          <Col span={24}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total URLs"
                  value={sitemap.length}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Last Generated"
                  value={lastGenerated ? lastGenerated.toLocaleString() : 'Never'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="File Size"
                  value={validationResult?.fileSize ? `${(validationResult.fileSize / 1024).toFixed(1)} KB` : '0 KB'}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Status"
                  value={getValidationStatusText()}
                  prefix={
                    validationResult?.isValid ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                  }
                />
              </Col>
            </Row>
          </Col>

          {/* Validation Alerts */}
          {validationResult && !validationResult.isValid && (
            <Col span={24}>
              {validationResult.errors.length > 0 && (
                <Alert
                  message="Validation Errors"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {validationResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                      {validationResult.errors.length > 5 && (
                        <li>... and {validationResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  }
                  type="error"
                  showIcon
                  style={{ marginBottom: 8 }}
                />
              )}

              {validationResult.warnings.length > 0 && (
                <Alert
                  message="Validation Warnings"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {validationResult.warnings.slice(0, 3).map((warning, index) => (
                        <li key={index}>{warning.message}</li>
                      ))}
                      {validationResult.warnings.length > 3 && (
                        <li>... and {validationResult.warnings.length - 3} more warnings</li>
                      )}
                    </ul>
                  }
                  type="warning"
                  showIcon
                />
              )}
            </Col>
          )}

          {/* Action Buttons */}
          <Col span={24}>
            <Space wrap>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={generating}
                onClick={generateSitemap}
                size="large"
              >
                Generate Sitemap
              </Button>

              {sitemap.length > 0 && (
                <>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadSitemap}
                    loading={downloading}
                  >
                    Download XML
                  </Button>

                  <Button
                    icon={<CloudUploadOutlined />}
                    onClick={uploadSitemap}
                    loading={uploading}
                    disabled={validationResult && !validationResult.isValid}
                  >
                    Upload to Server
                  </Button>
                </>
              )}
            </Space>
          </Col>

          {/* Sitemap Preview */}
          {sitemap.length > 0 && (
            <Col span={24}>
              <Divider orientation="left">Sitemap Preview</Divider>
              <SitemapPreview entries={sitemap} validationResult={validationResult} />
            </Col>
          )}

          {/* Empty State */}
          {sitemap.length === 0 && !generating && (
            <Col span={24}>
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#999'
              }}>
                <GlobalOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <Title level={4} type="secondary">No Sitemap Generated</Title>
                <Text type="secondary">
                  Click &quot;Generate Sitemap&quot; to discover and create a comprehensive XML sitemap for your site.
                </Text>
              </div>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};