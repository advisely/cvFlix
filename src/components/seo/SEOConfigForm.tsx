'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Card, 
  Button, 
  Space, 
  Typography, 
  message, 
  Spin,
  Row,
  Col,
  Collapse,
  Divider
} from 'antd';
import { 
  SaveOutlined, 
  ReloadOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useSEOConfig } from './hooks/useSEOConfig';
import { useDebounced } from './hooks/useDebounced';
import { SEOConfigUpdateRequest } from '@/types/seo';
import { validateSEOText, SEO_CHARACTER_LIMITS, validateUrl } from './utils/seoUtils';
import MultilingualFormTabs from '../MultilingualFormTabs';
import FaviconManager from './FaviconManager';

const { Title, Text } = Typography;
const { TextArea } = Input;
// Removed deprecated Panel import - using items API instead

interface CharacterCounterProps {
  value: string | undefined;
  limit: number;
  label: string;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ value, limit, label }) => {
  const validation = validateSEOText(value, limit);
  const count = value?.length || 0;
  
  const getColor = () => {
    if (validation.type === 'error') return '#ff4d4f';
    if (validation.type === 'warning') return '#faad14';
    if (validation.type === 'success') return '#52c41a';
    return '#8c8c8c';
  };

  return (
    <div style={{ 
      fontSize: '12px', 
      color: getColor(),
      marginTop: '4px',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <span>{label}: {count}/{limit}</span>
      <span>{validation.message}</span>
    </div>
  );
};

const SEOConfigForm: React.FC = () => {
  const { config, loading, updateConfig, refreshConfig } = useSEOConfig();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debounced auto-save function
  const debouncedSave = useDebounced(async (values: SEOConfigUpdateRequest) => {
    setSaving(true);
    await updateConfig(values);
    setSaving(false);
    setHasUnsavedChanges(false);
  }, 2000);

  // Handle form changes with auto-save
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
    const formValues = form.getFieldsValue();
    
    // Only auto-save if form is valid
    form.validateFields({ validateOnly: true })
      .then(() => {
        debouncedSave(formValues);
      })
      .catch(() => {
        // Don't auto-save invalid forms
      });
  };

  // Manual save function
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const success = await updateConfig(values);
      if (success) {
        setHasUnsavedChanges(false);
      }
    } catch {
      message.error('Please fix form errors before saving');
    } finally {
      setSaving(false);
    }
  };

  // Initialize form with config data
  useEffect(() => {
    if (config) {
      form.setFieldsValue(config);
      setHasUnsavedChanges(false);
    }
  }, [config, form]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading SEO configuration...</div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GlobalOutlined />
            Global SEO Configuration
          </Title>
          <Text type="secondary">
            Configure default SEO settings that will be used across your portfolio
          </Text>
        </div>

        <Collapse 
          defaultActiveKey={['site-info', 'favicon']} 
          ghost
          expandIconPosition="start"
          items={[
            {
              key: 'site-info',
              label: (
                <Space>
                  <SettingOutlined />
                  <Text strong>Site Information</Text>
                </Space>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handleFormChange}
                  autoComplete="off"
                >
                  <MultilingualFormTabs
                    form={form}
                    englishFields={['siteName', 'defaultTitle', 'defaultDescription']}
                    frenchFields={['siteNameFr', 'defaultTitleFr', 'defaultDescriptionFr']}
                  >
                    {(language) => (
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {language === 'en' ? (
                          <>
                            <Form.Item
                              name="siteName"
                              label="Site Name (English)"
                              rules={[{ required: true, message: 'Site name is required' }]}
                              extra="Your site/brand name in English"
                            >
                              <Input placeholder="e.g., resumeflex" />
                            </Form.Item>

                            <Form.Item
                              name="defaultTitle"
                              label="Default Page Title (English)"
                              rules={[
                                { required: true, message: 'Default title is required' },
                                { max: SEO_CHARACTER_LIMITS.title, message: `Title should be under ${SEO_CHARACTER_LIMITS.title} characters` }
                              ]}
                              extra={<CharacterCounter value={form.getFieldValue('defaultTitle')} limit={SEO_CHARACTER_LIMITS.title} label="Title" />}
                            >
                              <Input placeholder="e.g., Professional Portfolio - resumeflex" />
                            </Form.Item>

                            <Form.Item
                              name="defaultDescription"
                              label="Default Meta Description (English)"
                              rules={[
                                { required: true, message: 'Default description is required' },
                                { max: SEO_CHARACTER_LIMITS.description, message: `Description should be under ${SEO_CHARACTER_LIMITS.description} characters` }
                              ]}
                              extra={<CharacterCounter value={form.getFieldValue('defaultDescription')} limit={SEO_CHARACTER_LIMITS.description} label="Description" />}
                            >
                              <TextArea 
                                rows={3}
                                placeholder="Professional portfolio showcasing experience, skills, and achievements."
                              />
                            </Form.Item>

                            <Form.Item
                              name="defaultKeywords"
                              label="Default Keywords (English)"
                              extra="Comma-separated keywords"
                            >
                              <Input placeholder="portfolio, professional, experience, skills, career" />
                            </Form.Item>
                          </>
                        ) : (
                          <>
                            <Form.Item
                              name="siteNameFr"
                              label="Site Name (French)"
                              rules={[{ required: true, message: 'Site name in French is required' }]}
                              extra="Your site/brand name in French"
                            >
                              <Input placeholder="e.g., resumeflex" />
                            </Form.Item>

                            <Form.Item
                              name="defaultTitleFr"
                              label="Default Page Title (French)"
                              rules={[
                                { required: true, message: 'Default title in French is required' },
                                { max: SEO_CHARACTER_LIMITS.title, message: `Title should be under ${SEO_CHARACTER_LIMITS.title} characters` }
                              ]}
                              extra={<CharacterCounter value={form.getFieldValue('defaultTitleFr')} limit={SEO_CHARACTER_LIMITS.title} label="Titre" />}
                            >
                              <Input placeholder="e.g., Portfolio Professionnel - resumeflex" />
                            </Form.Item>

                            <Form.Item
                              name="defaultDescriptionFr"
                              label="Default Meta Description (French)"
                              rules={[
                                { required: true, message: 'Default description in French is required' },
                                { max: SEO_CHARACTER_LIMITS.description, message: `Description should be under ${SEO_CHARACTER_LIMITS.description} characters` }
                              ]}
                              extra={<CharacterCounter value={form.getFieldValue('defaultDescriptionFr')} limit={SEO_CHARACTER_LIMITS.description} label="Description" />}
                            >
                              <TextArea 
                                rows={3}
                                placeholder="Portfolio professionnel présentant l'expérience, les compétences et les réalisations."
                              />
                            </Form.Item>

                            <Form.Item
                              name="defaultKeywordsFr"
                              label="Default Keywords (French)"
                              extra="Mots-clés séparés par des virgules"
                            >
                              <Input placeholder="portfolio, professionnel, expérience, compétences, carrière" />
                            </Form.Item>
                          </>
                        )}
                      </Space>
                    )}
                  </MultilingualFormTabs>

                  <Divider />

                  {/* Technical Configuration */}
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        name="canonicalUrl"
                        label="Canonical URL"
                        rules={[
                          { required: true, message: 'Canonical URL is required' },
                          { 
                            validator: (_, value) => {
                              if (value && !validateUrl(value)) {
                                return Promise.reject(new Error('Please enter a valid URL'));
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                        extra="The main URL of your portfolio (should start with https://)"
                      >
                        <Input 
                          placeholder="https://resumeflex.com"
                          addonBefore={<GlobalOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="robotsContent"
                    label="Robots.txt Content"
                    extra="Instructions for search engine crawlers"
                  >
                    <TextArea 
                      rows={6}
                      placeholder={`User-agent: *\nAllow: /\nDisallow: /boss/\nSitemap: https://resumeflex.com/sitemap.xml`}
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'favicon',
              label: (
                <Space>
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  <Text strong>Favicon Management</Text>
                </Space>
              ),
              children: <FaviconManager />
            }
          ]}
        />

        {/* Action Buttons */}
        <Card size="small" style={{ marginTop: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                >
                  Save Configuration
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={refreshConfig}
                  disabled={saving}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                {saving && (
                  <Text type="secondary">
                    <Spin size="small" style={{ marginRight: '8px' }} />
                    Auto-saving...
                  </Text>
                )}
                {hasUnsavedChanges && !saving && (
                  <Text type="warning">
                    <InfoCircleOutlined style={{ marginRight: '4px' }} />
                    Unsaved changes
                  </Text>
                )}
                {!hasUnsavedChanges && !saving && (
                  <Text type="success">All changes saved</Text>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      </Card>
    </div>
  );
};

export default SEOConfigForm;
