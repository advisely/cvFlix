'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Alert,
  Tooltip,
  Tag,
  Upload,
  message,
  Divider
} from 'antd';
import {
  InfoCircleOutlined,
  GlobalOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/lib/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// OpenGraph Types and Interfaces
interface OpenGraphTags {
  'og:title': string;
  'og:type': 'website' | 'article' | 'profile' | 'book' | 'music' | 'video';
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
  'article:modified_time'?: string;
  'article:section'?: string;
  'article:tag'?: string[];
  'profile:first_name'?: string;
  'profile:last_name'?: string;
  'profile:username'?: string;
  'profile:gender'?: 'male' | 'female';
}

interface OpenGraphManagerProps {
  initialTags?: Partial<OpenGraphTags>;
  onTagsChange?: (tags: OpenGraphTags) => void;
  page?: string;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

const OpenGraphManager: React.FC<OpenGraphManagerProps> = ({
  initialTags,
  onTagsChange,
  page
}) => {
  const [form] = Form.useForm();
  const [ogTags, setOgTags] = useState<OpenGraphTags>({
    'og:title': '',
    'og:type': 'website',
    'og:image': '',
    'og:url': '',
    'og:description': '',
    'og:site_name': '',
    'og:locale': 'en_US',
    ...initialTags
  });

  const [imageFile, setImageFile] = useState<UploadFile[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  // OpenGraph property configurations
  const OG_TYPES = [
    { value: 'website', label: 'Website', description: 'General website content' },
    { value: 'article', label: 'Article', description: 'Blog post or article' },
    { value: 'profile', label: 'Profile', description: 'Personal or business profile' },
    { value: 'book', label: 'Book', description: 'Book or publication' },
    { value: 'music', label: 'Music', description: 'Music content' },
    { value: 'video', label: 'Video', description: 'Video content' }
  ];

  const LOCALES = [
    { value: 'en_US', label: 'English (US)', flag: '🇺🇸' },
    { value: 'en_GB', label: 'English (UK)', flag: '🇬🇧' },
    { value: 'fr_FR', label: 'French (France)', flag: '🇫🇷' },
    { value: 'fr_CA', label: 'French (Canada)', flag: '🇨🇦' },
    { value: 'es_ES', label: 'Spanish (Spain)', flag: '🇪🇸' },
    { value: 'de_DE', label: 'German (Germany)', flag: '🇩🇪' },
    { value: 'it_IT', label: 'Italian (Italy)', flag: '🇮🇹' }
  ];

  // Validation functions
  const validateTitle = (title: string): ValidationResult => {
    if (!title) {
      return { isValid: false, message: 'Title is required', type: 'error' };
    }
    if (title.length > 95) {
      return { isValid: false, message: 'Title too long (max 95 characters)', type: 'error' };
    }
    if (title.length < 30) {
      return { isValid: true, message: 'Consider a longer, more descriptive title', type: 'warning' };
    }
    return { isValid: true, message: 'Title length is optimal', type: 'success' };
  };

  const validateDescription = (description: string): ValidationResult => {
    if (!description) {
      return { isValid: false, message: 'Description is required', type: 'error' };
    }
    if (description.length > 300) {
      return { isValid: false, message: 'Description too long (max 300 characters)', type: 'error' };
    }
    if (description.length < 120) {
      return { isValid: true, message: 'Consider a longer description for better engagement', type: 'warning' };
    }
    return { isValid: true, message: 'Description length is optimal', type: 'success' };
  };

  const validateImage = (imageUrl: string): ValidationResult => {
    if (!imageUrl) {
      return { isValid: true, message: 'Image recommended for better social sharing', type: 'warning' };
    }
    try {
      new URL(imageUrl);
      return { isValid: true, message: 'Valid image URL', type: 'success' };
    } catch {
      return { isValid: false, message: 'Invalid image URL format', type: 'error' };
    }
  };

  const validateUrl = (url: string): ValidationResult => {
    if (!url) {
      return { isValid: false, message: 'URL is required', type: 'error' };
    }
    try {
      new URL(url);
      return { isValid: true, message: 'Valid URL format', type: 'success' };
    } catch {
      return { isValid: false, message: 'Invalid URL format', type: 'error' };
    }
  };

  // Validate all fields
  const validateAllFields = (tags: OpenGraphTags) => {
    const results: Record<string, ValidationResult> = {
      title: validateTitle(tags['og:title']),
      description: validateDescription(tags['og:description']),
      image: validateImage(tags['og:image']),
      url: validateUrl(tags['og:url'])
    };
    setValidationResults(results);
    return results;
  };

  // Handle form changes
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const updatedTags: OpenGraphTags = {
      ...ogTags,
      ...values
    };
    setOgTags(updatedTags);
    validateAllFields(updatedTags);
    onTagsChange?.(updatedTags);
  };

  // Generate meta tags HTML
  const generateOpenGraphHTML = (tags: OpenGraphTags): string => {
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    return Object.entries(tags)
      .filter(([key, value]) => value !== undefined && value !== '')
      .map(([property, content]) => {
        if (Array.isArray(content)) {
          return content.map(c => `<meta property="${property}" content="${escapeHtml(c)}" />`).join('\n');
        }
        return `<meta property="${property}" content="${escapeHtml(String(content))}" />`;
      })
      .join('\n');
  };

  // Image upload handler
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      form.setFieldValue('og:image', imageUrl);
      handleFormChange();
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload behavior
  };

  // Character counter component
  const CharacterCounter: React.FC<{ value: string; limit: number; optimal?: number }> = ({ 
    value, 
    limit, 
    optimal 
  }) => {
    const count = value?.length || 0;
    const isOverLimit = count > limit;
    const isOptimal = optimal && count >= optimal && count <= limit;
    
    const color = isOverLimit ? '#ff4d4f' : isOptimal ? '#52c41a' : '#faad14';
    
    return (
      <div style={{ fontSize: '12px', color, textAlign: 'right' }}>
        {count}/{limit}
        {isOverLimit && <span style={{ marginLeft: '8px' }}>Too long!</span>}
        {isOptimal && <span style={{ marginLeft: '8px' }}>Optimal</span>}
      </div>
    );
  };

  // Validation indicator component
  const ValidationIndicator: React.FC<{ result?: ValidationResult }> = ({ result }) => {
    if (!result) return null;

    const icon = result.type === 'success' 
      ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
      : result.type === 'warning' 
      ? <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;

    return (
      <Tooltip title={result.message}>
        {icon}
      </Tooltip>
    );
  };

  // Initialize form with initial tags
  useEffect(() => {
    if (initialTags) {
      form.setFieldsValue(initialTags);
      handleFormChange();
    }
  }, [initialTags]);

  return (
    <Card
      title={
        <Space>
          <GlobalOutlined />
          <Title level={4} style={{ margin: 0 }}>
            OpenGraph Protocol Configuration
          </Title>
        </Space>
      }
      extra={
        <Space>
          <FacebookOutlined style={{ color: '#1877F2' }} />
          <LinkedinOutlined style={{ color: '#0A66C2' }} />
        </Space>
      }
    >
      <Alert
        message="OpenGraph Protocol"
        description="Configure how your content appears when shared on social media platforms like Facebook, LinkedIn, and other social networks."
        type="info"
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
        showIcon
      />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        autoComplete="off"
      >
        <Row gutter={16}>
          {/* Basic OpenGraph Properties */}
          <Col span={24}>
            <Title level={5}>Basic Properties</Title>
          </Col>

          <Col span={12}>
            <Form.Item
              name="og:title"
              label={
                <Space>
                  Title
                  <ValidationIndicator result={validationResults.title} />
                </Space>
              }
              rules={[{ required: true, message: 'OpenGraph title is required' }]}
            >
              <Input
                placeholder="Compelling title for social sharing"
                suffix={<CharacterCounter value={ogTags['og:title']} limit={95} optimal={30} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="og:type"
              label="Content Type"
              rules={[{ required: true, message: 'Content type is required' }]}
            >
              <Select placeholder="Select content type">
                {OG_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>
                    <div>
                      <div>{type.label}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {type.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="og:description"
              label={
                <Space>
                  Description
                  <ValidationIndicator result={validationResults.description} />
                </Space>
              }
              rules={[{ required: true, message: 'OpenGraph description is required' }]}
            >
              <TextArea
                rows={3}
                placeholder="Engaging description that encourages social sharing"
                suffix={<CharacterCounter value={ogTags['og:description']} limit={300} optimal={120} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="og:url"
              label={
                <Space>
                  Canonical URL
                  <ValidationIndicator result={validationResults.url} />
                </Space>
              }
              rules={[
                { required: true, message: 'Canonical URL is required' },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input
                placeholder="https://example.com/page"
                addonBefore={<GlobalOutlined />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="og:site_name"
              label="Site Name"
              rules={[{ required: true, message: 'Site name is required' }]}
            >
              <Input placeholder="Your site or brand name" />
            </Form.Item>
          </Col>

          {/* Image Configuration */}
          <Col span={24}>
            <Divider>Image Configuration</Divider>
          </Col>

          <Col span={24}>
            <Form.Item
              name="og:image"
              label={
                <Space>
                  Image URL
                  <ValidationIndicator result={validationResults.image} />
                  <Tooltip title="Recommended size: 1200x630px for best results">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 120px)' }}
                  placeholder="https://example.com/image.jpg"
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Input.Group>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="og:image:width"
              label="Image Width (px)"
            >
              <Input placeholder="1200" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="og:image:height"
              label="Image Height (px)"
            >
              <Input placeholder="630" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="og:image:alt"
              label="Image Alt Text"
            >
              <Input placeholder="Descriptive alt text" />
            </Form.Item>
          </Col>

          {/* Locale and Advanced Settings */}
          <Col span={24}>
            <Divider>Locale and Advanced</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              name="og:locale"
              label="Locale"
              rules={[{ required: true, message: 'Locale is required' }]}
            >
              <Select placeholder="Select locale">
                {LOCALES.map(locale => (
                  <Option key={locale.value} value={locale.value}>
                    <Space>
                      <span>{locale.flag}</span>
                      {locale.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="og:updated_time"
              label="Last Updated"
            >
              <Input 
                type="datetime-local"
                placeholder="When content was last updated"
              />
            </Form.Item>
          </Col>

          {/* Article-specific properties (conditional) */}
          {ogTags['og:type'] === 'article' && (
            <>
              <Col span={24}>
                <Divider>Article Properties</Divider>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="article:author"
                  label="Author"
                >
                  <Input placeholder="Article author name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="article:published_time"
                  label="Published Date"
                >
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="article:section"
                  label="Section"
                >
                  <Input placeholder="Article category/section" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="article:tag"
                  label="Article Tags"
                >
                  <Select
                    mode="tags"
                    placeholder="Enter article tags"
                    tokenSeparators={[',']}
                  />
                </Form.Item>
              </Col>
            </>
          )}

          {/* Profile-specific properties (conditional) */}
          {ogTags['og:type'] === 'profile' && (
            <>
              <Col span={24}>
                <Divider>Profile Properties</Divider>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="profile:first_name"
                  label="First Name"
                >
                  <Input placeholder="First name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="profile:last_name"
                  label="Last Name"
                >
                  <Input placeholder="Last name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="profile:username"
                  label="Username"
                >
                  <Input placeholder="@username" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="profile:gender"
                  label="Gender"
                >
                  <Select placeholder="Select gender">
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                  </Select>
                </Form.Item>
              </Col>
            </>
          )}
        </Row>

        {/* Generated HTML Preview */}
        <Card
          title="Generated HTML Tags"
          size="small"
          style={{ marginTop: 16 }}
        >
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px', 
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {generateOpenGraphHTML(ogTags)}
          </pre>
        </Card>

        {/* Validation Summary */}
        <Card
          title="Validation Summary"
          size="small"
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            {Object.entries(validationResults).map(([field, result]) => (
              <Col key={field} span={6}>
                <Tag 
                  color={result.type === 'success' ? 'green' : result.type === 'warning' ? 'orange' : 'red'}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  {field.toUpperCase()}: {result.type.toUpperCase()}
                </Tag>
              </Col>
            ))}
          </Row>
        </Card>
      </Form>
    </Card>
  );
};

export default OpenGraphManager;