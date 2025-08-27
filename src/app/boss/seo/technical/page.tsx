'use client'

import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, message, Row, Col, Divider, List, Tabs, Switch } from 'antd';
import { 
  FileOutlined, 
  GlobalOutlined, 
  DownloadOutlined, 
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  EyeOutlined,
  FileTextOutlined,
  BulbOutlined
} from '@ant-design/icons';

import { 
  RobotsTxtEditor,
  RobotsTxtValidator,
  RobotsTxtTemplates,
  RobotsTxtPreview,
  SitemapGenerator
} from '@/components/seo';
import { type RobotsValidationError } from '@/components/seo/utils/robots-utils';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface SitemapStatus {
  exists: boolean;
  lastGenerated?: string;
  urlCount: number;
  isValid: boolean;
}

interface RobotsStatus {
  exists: boolean;
  content: string;
  isValid: boolean;
  lastModified?: string;
}

const TechnicalSEOPage = () => {
  const [sitemapStatus, setSitemapStatus] = useState<SitemapStatus>({
    exists: false,
    urlCount: 0,
    isValid: false
  });
  const [robotsStatus, setRobotsStatus] = useState<RobotsStatus>({
    exists: false,
    content: '',
    isValid: false
  });
  const [robotsContent, setRobotsContent] = useState('');
  const [loading, setLoading] = useState({
    sitemap: false,
    robots: false,
    generating: false,
    saving: false
  });
  const [activeTab, setActiveTab] = useState('sitemap');
  const [robotsValidationErrors, setRobotsValidationErrors] = useState<RobotsValidationError[]>([]);
  const [currentSiteUrl, setCurrentSiteUrl] = useState('');

  useEffect(() => {
    fetchTechnicalSEOStatus();
    // Get current site URL for templates
    if (typeof window !== 'undefined') {
      setCurrentSiteUrl(window.location.origin);
    }
  }, []);

  const fetchTechnicalSEOStatus = async () => {
    setLoading(prev => ({ ...prev, robots: true, sitemap: true }));
    try {
      // Fetch sitemap status using existing sitemap endpoint
      const sitemapResponse = await fetch('/api/seo/sitemap?format=json').catch(() => null);
      if (sitemapResponse && sitemapResponse.ok) {
        const sitemapData = await sitemapResponse.json();
        setSitemapStatus({
          exists: true,
          urlCount: sitemapData.urls?.length || 0,
          lastGenerated: sitemapData.generatedAt || new Date().toISOString(),
          isValid: true
        });
      } else {
        setSitemapStatus({
          exists: false,
          urlCount: 0,
          lastGenerated: undefined,
          isValid: false
        });
      }

      // Fetch robots.txt status - it returns text content, not JSON
      const robotsResponse = await fetch('/api/seo/robots').catch(() => null);
      if (robotsResponse && robotsResponse.ok) {
        const robotsText = await robotsResponse.text(); // Get as text, not JSON
        setRobotsStatus({
          exists: true,
          content: robotsText,
          isValid: robotsText.includes('User-agent:'),
          lastModified: new Date().toISOString()
        });
        setRobotsContent(robotsText);
      } else {
        // Default robots.txt content
        const defaultContent = getDefaultRobotsContent();
        setRobotsContent(defaultContent);
        setRobotsStatus({
          exists: false,
          content: '',
          isValid: false,
          lastModified: undefined
        });
      }
    } catch (error) {
      console.error('Error fetching technical SEO status:', error);
    } finally {
      setLoading(prev => ({ ...prev, robots: false, sitemap: false }));
    }
  };

  const getDefaultRobotsContent = () => {
    const siteUrl = currentSiteUrl || 'https://yoursite.com';
    return `User-agent: *
Allow: /
Disallow: /boss/
Disallow: /api/
Disallow: /login

# Allow social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml`;
  };


  const saveRobotsFile = async (content: string) => {
    if (robotsValidationErrors.length > 0) {
      message.error('Please fix validation errors before saving');
      return;
    }

    const response = await fetch('/api/seo/robots', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ robotsContent: content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save robots.txt');
    }

    setRobotsStatus({
      exists: true,
      content,
      isValid: true
    });

    message.success('Robots.txt saved successfully');
  };

  const handleApplyTemplate = (content: string) => {
    setRobotsContent(content);
    message.success('Template applied successfully. Don\&apos;t forget to save!');
    setActiveTab('editor');
  };


  return (
    <div className="technical-seo-management">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div>
            <h2 style={{ margin: '0 0 8px 0' }}>Technical SEO Configuration</h2>
            <Text type="secondary">
              Manage sitemap generation and robots.txt configuration with advanced editor features
            </Text>
          </div>
        </Col>

        {/* Advanced Sitemap Management */}
        <Col span={24}>
          <SitemapGenerator
            onSitemapGenerated={(sitemap) => {
              setSitemapStatus({
                exists: true,
                lastGenerated: new Date().toISOString(),
                urlCount: sitemap.length,
                isValid: true
              });
            }}
            onSettingsChange={(settings) => {
              // Handle settings change if needed
              console.log('Sitemap settings updated:', settings);
            }}
          />
        </Col>

        {/* Advanced Robots.txt Management */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <FileOutlined />
                Advanced Robots.txt Configuration
                {robotsValidationErrors.length > 0 && (
                  <Text type="danger" style={{ fontSize: '12px' }}>
                    ({robotsValidationErrors.filter(e => e.severity === 'error').length} errors, {robotsValidationErrors.filter(e => e.severity === 'warning').length} warnings)
                  </Text>
                )}
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                {robotsStatus.exists ? (
                  <Alert
                    message="Robots.txt Status"
                    description={
                      <Text>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        Robots.txt file is configured and accessible at /robots.txt
                      </Text>
                    }
                    type="success"
                    showIcon={false}
                  />
                ) : (
                  <Alert
                    message="No Robots.txt Found"
                    description="Configure robots.txt to provide instructions to search engine crawlers."
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                  />
                )}
              </Col>

              <Col span={24}>
                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  items={[
                    {
                      key: 'editor',
                      label: (
                        <Space>
                          <FileTextOutlined />
                          Editor
                        </Space>
                      ),
                      children: (
                        <RobotsTxtEditor
                          initialContent={robotsContent}
                          onSave={saveRobotsFile}
                          onValidate={(errors) => setRobotsValidationErrors(errors)}
                          loading={loading.robots || loading.saving}
                          height={500}
                        />
                      )
                    },
                    {
                      key: 'templates',
                      label: (
                        <Space>
                          <BulbOutlined />
                          Templates
                        </Space>
                      ),
                      children: (
                        <RobotsTxtTemplates
                          onApplyTemplate={handleApplyTemplate}
                          currentSiteUrl={currentSiteUrl}
                        />
                      )
                    },
                    {
                      key: 'validator',
                      label: (
                        <Space>
                          <SettingOutlined />
                          Validator
                        </Space>
                      ),
                      children: (
                        <RobotsTxtValidator
                          content={robotsContent}
                          onValidationChange={(isValid, errors, warnings) => {
                            setRobotsValidationErrors([...errors, ...warnings]);
                          }}
                        />
                      )
                    },
                    {
                      key: 'preview',
                      label: (
                        <Space>
                          <EyeOutlined />
                          Preview
                        </Space>
                      ),
                      children: (
                        <RobotsTxtPreview
                          content={robotsContent}
                          siteUrl={currentSiteUrl}
                        />
                      )
                    }
                  ]}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* SEO Best Practices */}
        <Col span={24}>
          <Card title="Technical SEO Best Practices">
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Title level={4}>Sitemap Optimization</Title>
                <ul>
                  <li>Keep sitemaps under 50,000 URLs and 50MB</li>
                  <li>Update sitemaps when content changes</li>
                  <li>Use priority and changefreq attributes wisely</li>
                  <li>Submit sitemap to search engines</li>
                </ul>
              </Col>
              <Col span={12}>
                <Title level={4}>Robots.txt Best Practices</Title>
                <ul>
                  <li>Keep the file simple and readable</li>
                  <li>Test your robots.txt with search console tools</li>
                  <li>Don&apos;t block CSS or JavaScript files</li>
                  <li>Include sitemap location in robots.txt</li>
                  <li>Use specific user-agent rules when needed</li>
                  <li>Validate syntax before deployment</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TechnicalSEOPage;
