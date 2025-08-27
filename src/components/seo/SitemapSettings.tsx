'use client'

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  InputNumber, 
  Switch, 
  Select, 
  Button, 
  Space, 
  Divider, 
  Typography, 
  Alert, 
  Input, 
  Tag, 
  Tooltip,
  Row,
  Col,
  Collapse,
  message
} from 'antd';
import {
  PlusOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';

import { SitemapSettings as SitemapSettingsType, getDefaultSitemapSettings } from './utils/sitemap-utils';

const { Text, Paragraph } = Typography;
const { Option } = Select;
// Removed deprecated Panel import - using items API instead

export interface SitemapSettingsProps {
  settings: SitemapSettingsType;
  onChange: (settings: SitemapSettingsType) => void;
  onReset?: () => void;
  loading?: boolean;
}

export const SitemapSettings: React.FC<SitemapSettingsProps> = ({
  settings,
  onChange,
  onReset,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const [newExcludePattern, setNewExcludePattern] = useState('');

  useEffect(() => {
    form.setFieldsValue(settings);
  }, [settings, form]);

  const handleFormChange = () => {
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedSettings: SitemapSettingsType = {
        ...settings,
        ...values
      };
      onChange(updatedSettings);
      setIsDirty(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleReset = () => {
    const defaultSettings = getDefaultSitemapSettings();
    form.setFieldsValue(defaultSettings);
    onChange(defaultSettings);
    setIsDirty(false);
    onReset?.();
    message.success('Settings reset to defaults');
  };

  const addExcludePattern = () => {
    if (!newExcludePattern.trim()) return;
    
    const currentPatterns = form.getFieldValue('excludePatterns') || [];
    if (currentPatterns.includes(newExcludePattern.trim())) {
      message.warning('Pattern already exists');
      return;
    }

    const updatedPatterns = [...currentPatterns, newExcludePattern.trim()];
    form.setFieldValue('excludePatterns', updatedPatterns);
    setNewExcludePattern('');
    setIsDirty(true);
  };

  const removeExcludePattern = (patternToRemove: string) => {
    const currentPatterns = form.getFieldValue('excludePatterns') || [];
    const updatedPatterns = currentPatterns.filter((pattern: string) => pattern !== patternToRemove);
    form.setFieldValue('excludePatterns', updatedPatterns);
    setIsDirty(true);
  };


  const getAdvancedHelp = () => (
    <Collapse 
      ghost
      items={[
        {
          key: 'help',
          label: 'Advanced Settings Help',
          children: (
            <div>
              <Paragraph>
                <Text strong>Max URLs:</Text> Maximum number of URLs to include in the sitemap. 
                Search engines recommend keeping sitemaps under 50,000 URLs.
              </Paragraph>
              
              <Paragraph>
                <Text strong>Include Images:</Text> Add image sitemap entries for images found on pages.
                This can significantly increase sitemap size.
              </Paragraph>
              
              <Paragraph>
                <Text strong>Include Videos:</Text> Add video sitemap entries for videos found on pages.
                Requires video metadata to be available.
              </Paragraph>
              
              <Paragraph>
                <Text strong>Include Alternates:</Text> Add hreflang alternate URLs for multi-language sites.
                Enable this if you have content in multiple languages.
              </Paragraph>
              
              <Paragraph>
                <Text strong>Exclude Patterns:</Text> Regular expressions or simple patterns to exclude URLs.
                Examples:
                <ul>
                  <li><code>/admin/</code> - Excludes all admin pages</li>
                  <li><code>\.pdf$</code> - Excludes all PDF files</li>
                  <li><code>/private/</code> - Excludes private sections</li>
                </ul>
              </Paragraph>
              
              <Paragraph>
                <Text strong>Default Priority:</Text> Priority value (0.0-1.0) assigned to pages without specific priority.
                Higher values indicate more important pages.
              </Paragraph>
              
              <Paragraph>
                <Text strong>Default Change Frequency:</Text> How often pages are expected to change.
                This helps search engines plan their crawling schedule.
              </Paragraph>
              
              <Paragraph>
                <Text strong>Cache Duration:</Text> How long (in minutes) to cache the generated sitemap.
                Longer cache improves performance but may serve outdated data.
              </Paragraph>
            </div>
          )
        }
      ]}
    />
  );

  return (
    <div className="sitemap-settings">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        initialValues={settings}
      >
        {/* Basic Settings */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Max URLs"
              name="maxUrls"
              tooltip="Maximum number of URLs to include in sitemap (1-50000)"
            >
              <InputNumber
                min={1}
                max={50000}
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Cache Duration (minutes)"
              name="cacheDuration"
              tooltip="How long to cache the generated sitemap"
            >
              <InputNumber
                min={0}
                max={1440}
                style={{ width: '100%' }}
                addonAfter="minutes"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Default Priority"
              name="defaultPriority"
              tooltip="Default priority for pages without specific priority (0.0-1.0)"
            >
              <InputNumber
                min={0}
                max={1}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              label="Default Change Frequency"
              name="defaultChangeFreq"
              tooltip="How often pages typically change"
            >
              <Select style={{ width: '100%' }}>
                <Option value="always">Always</Option>
                <Option value="hourly">Hourly</Option>
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="yearly">Yearly</Option>
                <Option value="never">Never</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Content Inclusion</Divider>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="includeImages"
              valuePropName="checked"
              tooltip="Include image sitemap entries for better image SEO"
            >
              <Switch 
                checkedChildren="Images" 
                unCheckedChildren="No Images"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="includeVideos"
              valuePropName="checked"
              tooltip="Include video sitemap entries for better video SEO"
            >
              <Switch 
                checkedChildren="Videos" 
                unCheckedChildren="No Videos"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="includeAlternates"
              valuePropName="checked"
              tooltip="Include hreflang alternates for multi-language sites"
            >
              <Switch 
                checkedChildren="Alternates" 
                unCheckedChildren="No Alternates"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="autoGenerate"
              valuePropName="checked"
              tooltip="Automatically regenerate sitemap when content changes"
            >
              <Switch 
                checkedChildren="Auto" 
                unCheckedChildren="Manual"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Exclusion Patterns</Divider>

        <Form.Item
          label={
            <Space>
              <span>URL Exclusion Patterns</span>
              <Tooltip title="Regular expressions or simple patterns to exclude URLs from sitemap">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          name="excludePatterns"
        >
          <div>
            {/* Add new pattern */}
            <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
              <Input
                placeholder="Enter exclusion pattern (e.g., /admin/ or \.pdf$)"
                value={newExcludePattern}
                onChange={(e) => setNewExcludePattern(e.target.value)}
                onPressEnter={addExcludePattern}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={addExcludePattern}
                disabled={!newExcludePattern.trim()}
              >
                Add
              </Button>
            </Space.Compact>

            {/* Display existing patterns */}
            <div style={{ minHeight: 32 }}>
              {(form.getFieldValue('excludePatterns') || []).map((pattern: string, index: number) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => removeExcludePattern(pattern)}
                  style={{ marginBottom: 4 }}
                >
                  <code>{pattern}</code>
                </Tag>
              ))}
              
              {(!form.getFieldValue('excludePatterns') || form.getFieldValue('excludePatterns').length === 0) && (
                <Text type="secondary">No exclusion patterns defined</Text>
              )}
            </div>
          </div>
        </Form.Item>

        {/* Common exclusion patterns */}
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Common patterns: 
          </Text>
          {['/admin/', '/api/', '/boss/', '\\.pdf$', '/private/', '/temp/'].map(pattern => (
            <Tag
              key={pattern}
              style={{ cursor: 'pointer', fontSize: '11px', margin: '2px' }}
              onClick={() => {
                const currentPatterns = form.getFieldValue('excludePatterns') || [];
                if (!currentPatterns.includes(pattern)) {
                  form.setFieldValue('excludePatterns', [...currentPatterns, pattern]);
                  setIsDirty(true);
                }
              }}
            >
              {pattern}
            </Tag>
          ))}
        </div>

        {/* Performance Warning */}
        {(form.getFieldValue('includeImages') || form.getFieldValue('includeVideos')) && (
          <Alert
            message="Performance Impact"
            description="Including images and videos can significantly increase sitemap generation time and file size. Consider limiting the number of URLs or using sitemap index files for large sites."
            type="warning"
            showIcon
            style={{ margin: '16px 0' }}
          />
        )}

        {/* Advanced Help */}
        <div style={{ marginTop: 16 }}>
          {getAdvancedHelp()}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          marginTop: 24, 
          padding: '16px 0',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'right' 
        }}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}
            >
              Reset to Defaults
            </Button>
            
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
              disabled={!isDirty}
            >
              Apply Settings
            </Button>
          </Space>
          
          {isDirty && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                You have unsaved changes
              </Text>
            </div>
          )}
        </div>

        {/* Settings Summary */}
        <Card size="small" title="Current Settings Summary" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: '12px' }}>
                <li>Max URLs: <Text strong>{form.getFieldValue('maxUrls')?.toLocaleString()}</Text></li>
                <li>Default Priority: <Text strong>{form.getFieldValue('defaultPriority')}</Text></li>
                <li>Default Frequency: <Text strong>{form.getFieldValue('defaultChangeFreq')}</Text></li>
                <li>Cache Duration: <Text strong>{form.getFieldValue('cacheDuration')} minutes</Text></li>
              </ul>
            </Col>
            <Col span={12}>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: '12px' }}>
                <li>Include Images: <Text strong>{form.getFieldValue('includeImages') ? 'Yes' : 'No'}</Text></li>
                <li>Include Videos: <Text strong>{form.getFieldValue('includeVideos') ? 'Yes' : 'No'}</Text></li>
                <li>Include Alternates: <Text strong>{form.getFieldValue('includeAlternates') ? 'Yes' : 'No'}</Text></li>
                <li>Auto Generate: <Text strong>{form.getFieldValue('autoGenerate') ? 'Yes' : 'No'}</Text></li>
                <li>Exclusion Patterns: <Text strong>{(form.getFieldValue('excludePatterns') || []).length}</Text></li>
              </ul>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};