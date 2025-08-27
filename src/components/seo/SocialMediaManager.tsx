'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Button,
  Space,
  Typography,
  Alert,
  Radio,
  Divider,
  message,
  Modal,
  Form,
  Select,
  Tag,
  Tooltip,
  Badge
} from 'antd';
import {
  GlobalOutlined,
  TwitterOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  EyeOutlined,
  SaveOutlined,
  SettingOutlined,
  PictureOutlined,
  CodeOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import OpenGraphManager from './OpenGraphManager';
import TwitterCardManager from './TwitterCardManager';
import SocialMediaPreviews from './SocialMediaPreviews';
import SocialImageManager from './SocialImageManager';
import { useSEOMetaTags } from './hooks/useSEOMetaTags';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Social Media Configuration Interface
interface SocialMediaConfig {
  page: string;
  openGraph: {
    'og:title': string;
    'og:type': string;
    'og:image': string;
    'og:url': string;
    'og:description': string;
    'og:site_name': string;
    'og:locale': string;
    'og:image:width'?: string;
    'og:image:height'?: string;
    'og:image:alt'?: string;
    'og:updated_time'?: string;
    'article:author'?: string;
    'article:published_time'?: string;
    'article:section'?: string;
    'article:tag'?: string[];
    'profile:first_name'?: string;
    'profile:last_name'?: string;
    'profile:username'?: string;
    'profile:gender'?: 'male' | 'female';
  };
  twitter: {
    'twitter:card': string;
    'twitter:site': string;
    'twitter:creator': string;
    'twitter:title': string;
    'twitter:description': string;
    'twitter:image': string;
    'twitter:image:alt': string;
    'twitter:app:name:iphone'?: string;
    'twitter:app:id:iphone'?: string;
    'twitter:app:url:iphone'?: string;
    'twitter:player'?: string;
    'twitter:player:width'?: string;
    'twitter:player:height'?: string;
  };
}

interface SocialMediaManagerProps {
  page?: string;
  initialConfig?: Partial<SocialMediaConfig>;
  onConfigSave?: (config: SocialMediaConfig) => void;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  page = '/',
  initialConfig,
  onConfigSave
}) => {
  const { metaTags, updateMetaTag } = useSEOMetaTags();
  const [activeTab, setActiveTab] = useState('opengraph');
  const [previewMode, setPreviewMode] = useState<'facebook' | 'twitter' | 'linkedin' | 'all'>('all');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({});
  
  // Social media configuration state
  const [socialConfig, setSocialConfig] = useState<SocialMediaConfig>({
    page,
    openGraph: {
      'og:title': '',
      'og:type': 'website',
      'og:image': '',
      'og:url': '',
      'og:description': '',
      'og:site_name': '',
      'og:locale': 'en_US',
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:site': '',
      'twitter:creator': '',
      'twitter:title': '',
      'twitter:description': '',
      'twitter:image': '',
      'twitter:image:alt': '',
    },
    ...initialConfig
  });

  // Validation function
  const validateSocialConfig = (config: SocialMediaConfig): Record<string, boolean> => {
    const validation: Record<string, boolean> = {};

    // OpenGraph validation
    validation.ogTitle = !!config.openGraph['og:title'] && config.openGraph['og:title'].length <= 95;
    validation.ogDescription = !!config.openGraph['og:description'] && config.openGraph['og:description'].length <= 300;
    validation.ogImage = !!config.openGraph['og:image'];
    validation.ogUrl = !!config.openGraph['og:url'];

    // Twitter validation
    validation.twitterTitle = !!config.twitter['twitter:title'] && config.twitter['twitter:title'].length <= 70;
    validation.twitterDescription = !!config.twitter['twitter:description'] && config.twitter['twitter:description'].length <= 200;
    validation.twitterImage = !!config.twitter['twitter:image'];

    return validation;
  };

  // Handle OpenGraph changes
  const handleOpenGraphChange = (ogTags: Record<string, unknown>) => {
    setSocialConfig(prev => ({
      ...prev,
      openGraph: { ...prev.openGraph, ...ogTags }
    }));
  };

  // Handle Twitter Card changes
  const handleTwitterCardChange = (twitterTags: Record<string, unknown>) => {
    setSocialConfig(prev => ({
      ...prev,
      twitter: { ...prev.twitter, ...twitterTags }
    }));
  };

  // Handle image selection from Social Image Manager
  const handleImageSelect = (imageUrl: string, platform: string) => {
    if (platform.includes('twitter') || platform === 'twitter') {
      setSocialConfig(prev => ({
        ...prev,
        twitter: { ...prev.twitter, 'twitter:image': imageUrl }
      }));
    } else {
      setSocialConfig(prev => ({
        ...prev,
        openGraph: { ...prev.openGraph, 'og:image': imageUrl }
      }));
    }
  };

  // Save configuration
  const handleSaveConfig = async () => {
    try {
      // Convert social config to meta tag format
      const metaTagData = {
        page: socialConfig.page,
        ogTitle: socialConfig.openGraph['og:title'],
        ogDescription: socialConfig.openGraph['og:description'],
        ogImage: socialConfig.openGraph['og:image'],
        // Add other fields as needed for the existing meta tag structure
      };

      // Find existing meta tag for this page or create new
      const existingTag = metaTags.find(tag => tag.page === page);
      
      if (existingTag) {
        await updateMetaTag(existingTag.id, metaTagData);
      }

      onConfigSave?.(socialConfig);
      message.success('Social media configuration saved successfully!');
    } catch (error) {
      message.error('Failed to save configuration. Please try again.');
      console.error('Save error:', error);
    }
  };

  // Generate meta tags HTML
  const generateMetaTagsHTML = () => {
    const { openGraph, twitter } = socialConfig;
    
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const ogTags = Object.entries(openGraph)
      .filter(([key, value]) => value !== undefined && value !== '')
      .map(([property, content]) => {
        if (Array.isArray(content)) {
          return content.map(c => `<meta property="${property}" content="${escapeHtml(c)}" />`).join('\n');
        }
        return `<meta property="${property}" content="${escapeHtml(String(content))}" />`;
      })
      .join('\n');

    const twitterTags = Object.entries(twitter)
      .filter(([key, value]) => value !== undefined && value !== '')
      .map(([name, content]) => `<meta name="${name}" content="${escapeHtml(String(content))}" />`)
      .join('\n');

    return `${ogTags}\n${twitterTags}`;
  };

  // Update validation status when config changes
  useEffect(() => {
    const validation = validateSocialConfig(socialConfig);
    setValidationStatus(validation);
  }, [socialConfig]);

  // Initialize config from existing meta tags
  useEffect(() => {
    const existingTag = metaTags.find(tag => tag.page === page);
    if (existingTag) {
      setSocialConfig(prev => ({
        ...prev,
        openGraph: {
          ...prev.openGraph,
          'og:title': existingTag.ogTitle || '',
          'og:description': existingTag.ogDescription || '',
          'og:image': existingTag.ogImage || '',
          'og:url': existingTag.canonicalUrl || '',
          'og:site_name': 'ResumeFlex Portfolio', // Could come from global config
        },
        twitter: {
          ...prev.twitter,
          'twitter:title': existingTag.ogTitle || existingTag.title || '',
          'twitter:description': existingTag.ogDescription || existingTag.description || '',
          'twitter:image': existingTag.ogImage || '',
        }
      }));
    }
  }, [metaTags, page]);

  // Calculate overall completion percentage
  const validationValues = Object.values(validationStatus);
  const completionPercentage = validationValues.length > 0 
    ? Math.round((validationValues.filter(Boolean).length / validationValues.length) * 100)
    : 0;

  return (
    <div className="social-media-manager">
      <Card
        title={
          <Space>
            <ShareAltOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Social Media Meta Tags
            </Title>
            <Badge 
              count={`${completionPercentage}%`} 
              color={completionPercentage >= 80 ? 'green' : completionPercentage >= 60 ? 'orange' : 'red'}
            />
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<SaveOutlined />} 
              type="primary" 
              onClick={handleSaveConfig}
              disabled={completionPercentage < 50}
            >
              Save Configuration
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setConfigModalVisible(true)}
            >
              Advanced
            </Button>
          </Space>
        }
      >
        <Alert
          message="Social Media Optimization"
          description={
            <div>
              Configure how your content appears when shared on social media platforms. 
              Complete all required fields to maximize social engagement.
              <div style={{ marginTop: 8 }}>
                <Text strong>Page:</Text> <Tag>{page}</Tag>
                <Text strong>Completion:</Text> 
                <Tag color={completionPercentage >= 80 ? 'green' : completionPercentage >= 60 ? 'orange' : 'red'}>
                  {completionPercentage}% Complete
                </Tag>
              </div>
            </div>
          }
          type="info"
          icon={<ShareAltOutlined />}
          style={{ marginBottom: 24 }}
          showIcon
        />

        <Row gutter={24}>
          {/* Configuration Panel */}
          <Col span={12}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane 
                tab={
                  <Space>
                    <GlobalOutlined />
                    OpenGraph
                    {validationStatus.ogTitle && validationStatus.ogDescription && validationStatus.ogImage && validationStatus.ogUrl ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    }
                  </Space>
                } 
                key="opengraph"
              >
                <OpenGraphManager
                  initialTags={socialConfig.openGraph}
                  onTagsChange={handleOpenGraphChange}
                  page={page}
                />
              </TabPane>

              <TabPane 
                tab={
                  <Space>
                    <TwitterOutlined />
                    Twitter Cards
                    {validationStatus.twitterTitle && validationStatus.twitterDescription && validationStatus.twitterImage ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    }
                  </Space>
                } 
                key="twitter"
              >
                <TwitterCardManager
                  initialConfig={socialConfig.twitter}
                  onConfigChange={handleTwitterCardChange}
                  page={page}
                />
              </TabPane>

              <TabPane 
                tab={
                  <Space>
                    <PictureOutlined />
                    Image Manager
                  </Space>
                } 
                key="images"
              >
                <SocialImageManager
                  onImageSelect={handleImageSelect}
                  currentImages={{
                    opengraph: socialConfig.openGraph['og:image'],
                    twitter: socialConfig.twitter['twitter:image']
                  }}
                />
              </TabPane>

              <TabPane 
                tab={
                  <Space>
                    <CodeOutlined />
                    HTML Output
                  </Space>
                } 
                key="html"
              >
                <Card title="Generated Meta Tags" size="small">
                  <pre style={{
                    background: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    lineHeight: 1.4,
                    overflow: 'auto',
                    maxHeight: '400px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {generateMetaTagsHTML()}
                  </pre>
                  <div style={{ marginTop: 12 }}>
                    <Button 
                      size="small" 
                      onClick={() => {
                        navigator.clipboard.writeText(generateMetaTagsHTML());
                        message.success('Meta tags copied to clipboard!');
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </Col>

          {/* Preview Panel */}
          <Col span={12}>
            <Card
              title={
                <Space>
                  <EyeOutlined />
                  Social Media Preview
                </Space>
              }
              extra={
                <Space>
                  <Radio.Group 
                    value={previewMode} 
                    onChange={e => setPreviewMode(e.target.value)}
                    size="small"
                  >
                    <Radio.Button value="facebook">
                      <FacebookOutlined /> Facebook
                    </Radio.Button>
                    <Radio.Button value="twitter">
                      <TwitterOutlined /> Twitter
                    </Radio.Button>
                    <Radio.Button value="linkedin">
                      <LinkedinOutlined /> LinkedIn
                    </Radio.Button>
                    <Radio.Button value="all">All</Radio.Button>
                  </Radio.Group>
                </Space>
              }
            >
              <SocialMediaPreviews
                ogTags={socialConfig.openGraph}
                twitterTags={socialConfig.twitter}
                mode={previewMode}
                showEngagement={true}
              />
            </Card>
          </Col>
        </Row>

        {/* Validation Summary */}
        <Card 
          title="Configuration Status" 
          size="small" 
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: completionPercentage >= 80 ? '#52c41a' : '#faad14' }}>
                  {completionPercentage}%
                </div>
                <Text type="secondary">Complete</Text>
              </div>
            </Col>
            <Col span={18}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <Tag color={validationStatus.ogTitle ? 'green' : 'red'}>
                    OG Title {validationStatus.ogTitle ? '✓' : '✗'}
                  </Tag>
                  <Tag color={validationStatus.ogDescription ? 'green' : 'red'}>
                    OG Description {validationStatus.ogDescription ? '✓' : '✗'}
                  </Tag>
                  <Tag color={validationStatus.ogImage ? 'green' : 'red'}>
                    OG Image {validationStatus.ogImage ? '✓' : '✗'}
                  </Tag>
                  <Tag color={validationStatus.ogUrl ? 'green' : 'red'}>
                    OG URL {validationStatus.ogUrl ? '✓' : '✗'}
                  </Tag>
                  <Tag color={validationStatus.twitterTitle ? 'green' : 'red'}>
                    Twitter Title {validationStatus.twitterTitle ? '✓' : '✗'}
                  </Tag>
                  <Tag color={validationStatus.twitterDescription ? 'green' : 'red'}>
                    Twitter Description {validationStatus.twitterDescription ? '✓' : '✗'}
                  </Tag>
                  <Tag color={validationStatus.twitterImage ? 'green' : 'red'}>
                    Twitter Image {validationStatus.twitterImage ? '✓' : '✗'}
                  </Tag>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* Advanced Configuration Modal */}
      <Modal
        title="Advanced Social Media Settings"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary">
            Save Settings
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Default Site Twitter Account">
            <Select placeholder="@yoursitehandle">
              <Option value="@resumeflex">@resumeflex</Option>
              <Option value="@portfolio">@portfolio</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Default Content Creator">
            <Select placeholder="@creatorhandle">
              <Option value="@johndoe">@johndoe</Option>
              <Option value="@developer">@developer</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Site Name">
            <Select placeholder="Your site name">
              <Option value="ResumeFlex Portfolio">ResumeFlex Portfolio</Option>
              <Option value="Professional Portfolio">Professional Portfolio</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SocialMediaManager;