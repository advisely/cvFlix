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
  Divider,
  InputNumber
} from 'antd';
import {
  InfoCircleOutlined,
  TwitterOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  MobileOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Twitter Card Types and Interfaces
interface TwitterCardConfig {
  'twitter:card': 'summary' | 'summary_large_image' | 'app' | 'player';
  'twitter:site': string;
  'twitter:creator': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:image:alt': string;
  
  // App card specific
  'twitter:app:name:iphone'?: string;
  'twitter:app:id:iphone'?: string;
  'twitter:app:url:iphone'?: string;
  'twitter:app:name:ipad'?: string;
  'twitter:app:id:ipad'?: string;
  'twitter:app:url:ipad'?: string;
  'twitter:app:name:googleplay'?: string;
  'twitter:app:id:googleplay'?: string;
  'twitter:app:url:googleplay'?: string;
  
  // Player card specific
  'twitter:player'?: string;
  'twitter:player:width'?: string;
  'twitter:player:height'?: string;
  'twitter:player:stream'?: string;
  'twitter:player:stream:content_type'?: string;
}

interface TwitterCardManagerProps {
  initialConfig?: Partial<TwitterCardConfig>;
  onConfigChange?: (config: TwitterCardConfig) => void;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

interface CardRequirement {
  imageSize: string;
  minSize: string;
  maxSize?: string;
  aspectRatio?: string;
  description: string;
}

const TwitterCardManager: React.FC<TwitterCardManagerProps> = ({
  initialConfig,
  onConfigChange
}) => {
  const [form] = Form.useForm();
  const [twitterConfig, setTwitterConfig] = useState<TwitterCardConfig>({
    'twitter:card': 'summary_large_image',
    'twitter:site': '',
    'twitter:creator': '',
    'twitter:title': '',
    'twitter:description': '',
    'twitter:image': '',
    'twitter:image:alt': '',
    ...initialConfig
  });

  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [selectedCard, setSelectedCard] = useState<string>('summary_large_image');

  // Twitter Card configurations
  const CARD_TYPES = [
    {
      value: 'summary',
      label: 'Summary Card',
      icon: '📝',
      description: 'Default card with title, description, and thumbnail image'
    },
    {
      value: 'summary_large_image',
      label: 'Large Image Summary',
      icon: '🖼️',
      description: 'Similar to summary but with prominently featured image'
    },
    {
      value: 'app',
      label: 'App Card',
      icon: '📱',
      description: 'Card for mobile app promotion with download links'
    },
    {
      value: 'player',
      label: 'Player Card',
      icon: '▶️',
      description: 'Card that displays video/audio and other rich media'
    }
  ];

  const CARD_REQUIREMENTS: Record<string, CardRequirement> = {
    summary: {
      imageSize: '144x144',
      minSize: '120x120',
      maxSize: '1MB',
      aspectRatio: '1:1',
      description: 'Square image, will be cropped to fit'
    },
    summary_large_image: {
      imageSize: '1200x600',
      minSize: '300x157',
      maxSize: '5MB',
      aspectRatio: '2:1',
      description: 'Large rectangular image for prominent display'
    },
    app: {
      imageSize: '120x120',
      minSize: '120x120',
      maxSize: '1MB',
      aspectRatio: '1:1',
      description: 'App icon image, square format'
    },
    player: {
      imageSize: '1200x600',
      minSize: '300x157',
      maxSize: '5MB',
      aspectRatio: '2:1',
      description: 'Player thumbnail image'
    }
  };

  // Validation functions
  const validateTitle = (title: string): ValidationResult => {
    if (!title) {
      return { isValid: false, message: 'Title is required', type: 'error' };
    }
    if (title.length > 70) {
      return { isValid: false, message: 'Title too long (max 70 characters)', type: 'error' };
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
    if (description.length > 200) {
      return { isValid: false, message: 'Description too long (max 200 characters)', type: 'error' };
    }
    if (description.length < 120) {
      return { isValid: true, message: 'Consider a longer description', type: 'warning' };
    }
    return { isValid: true, message: 'Description length is optimal', type: 'success' };
  };

  const validateTwitterHandle = (handle: string): ValidationResult => {
    if (!handle) {
      return { isValid: true, message: 'Twitter handle recommended', type: 'warning' };
    }
    if (!handle.startsWith('@')) {
      return { isValid: false, message: 'Handle must start with @', type: 'error' };
    }
    if (handle.length < 2 || handle.length > 16) {
      return { isValid: false, message: 'Handle must be 1-15 characters (plus @)', type: 'error' };
    }
    if (!/^@[A-Za-z0-9_]+$/.test(handle)) {
      return { isValid: false, message: 'Handle can only contain letters, numbers, and underscores', type: 'error' };
    }
    return { isValid: true, message: 'Valid Twitter handle', type: 'success' };
  };

  const validateImage = (imageUrl: string, cardType: string): ValidationResult => {
    if (!imageUrl) {
      return { isValid: false, message: 'Image is required for Twitter Cards', type: 'error' };
    }
    try {
      new URL(imageUrl);
      const requirement = CARD_REQUIREMENTS[cardType];
      return { 
        isValid: true, 
        message: `Image should be ${requirement.imageSize} (${requirement.aspectRatio})`, 
        type: 'success' 
      };
    } catch {
      return { isValid: false, message: 'Invalid image URL format', type: 'error' };
    }
  };

  // Validate all fields based on card type
  const validateAllFields = (config: TwitterCardConfig) => {
    const results: Record<string, ValidationResult> = {
      title: validateTitle(config['twitter:title']),
      description: validateDescription(config['twitter:description']),
      site: validateTwitterHandle(config['twitter:site']),
      creator: validateTwitterHandle(config['twitter:creator']),
      image: validateImage(config['twitter:image'], config['twitter:card'])
    };

    // App card specific validation
    if (config['twitter:card'] === 'app') {
      if (!config['twitter:app:name:iphone'] && !config['twitter:app:name:googleplay']) {
        results.app = {
          isValid: false,
          message: 'At least one app platform is required',
          type: 'error'
        };
      } else {
        results.app = { isValid: true, message: 'App configuration valid', type: 'success' };
      }
    }

    // Player card specific validation
    if (config['twitter:card'] === 'player') {
      if (!config['twitter:player']) {
        results.player = {
          isValid: false,
          message: 'Player URL is required for player cards',
          type: 'error'
        };
      } else {
        results.player = { isValid: true, message: 'Player configuration valid', type: 'success' };
      }
    }

    setValidationResults(results);
    return results;
  };

  // Handle form changes
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const updatedConfig: TwitterCardConfig = {
      ...twitterConfig,
      ...values
    };
    setTwitterConfig(updatedConfig);
    validateAllFields(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Handle card type change
  const handleCardTypeChange = (cardType: string) => {
    setSelectedCard(cardType);
    form.setFieldValue('twitter:card', cardType);
    handleFormChange();
  };

  // Generate Twitter Card HTML
  const generateTwitterCardHTML = (config: TwitterCardConfig): string => {
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    return Object.entries(config)
      .filter(([key, value]) => value !== undefined && value !== '')
      .map(([name, content]) => {
        if (Array.isArray(content)) {
          return content.map(c => `<meta name="${name}" content="${escapeHtml(c)}" />`).join('\n');
        }
        return `<meta name="${name}" content="${escapeHtml(String(content))}" />`;
      })
      .join('\n');
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

  // Initialize form with initial config
  useEffect(() => {
    if (initialConfig) {
      form.setFieldsValue(initialConfig);
      setSelectedCard(initialConfig['twitter:card'] || 'summary_large_image');
      handleFormChange();
    }
  }, [initialConfig]);

  const currentRequirement = CARD_REQUIREMENTS[selectedCard];

  return (
    <Card
      title={
        <Space>
          <TwitterOutlined style={{ color: '#1DA1F2' }} />
          <Title level={4} style={{ margin: 0 }}>
            Twitter Card Configuration
          </Title>
        </Space>
      }
      extra={
        <Tag color="blue">{CARD_TYPES.find(t => t.value === selectedCard)?.label}</Tag>
      }
    >
      <Alert
        message="Twitter Card Optimization"
        description="Configure how your content appears when shared on Twitter. Different card types provide different presentation formats for your content."
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
        {/* Card Type Selection */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="twitter:card"
              label="Twitter Card Type"
              rules={[{ required: true, message: 'Card type is required' }]}
            >
              <Select 
                value={selectedCard} 
                onChange={handleCardTypeChange}
                size="large"
              >
                {CARD_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>
                    <div style={{ padding: '8px 0' }}>
                      <div>
                        <Space>
                          <span style={{ fontSize: '16px' }}>{type.icon}</span>
                          <strong>{type.label}</strong>
                        </Space>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {type.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Image Requirements Info */}
          <Col span={24}>
            <Alert
              message={`Image Requirements for ${CARD_TYPES.find(t => t.value === selectedCard)?.label}`}
              description={
                <div>
                  <p><strong>Recommended size:</strong> {currentRequirement.imageSize}</p>
                  <p><strong>Minimum size:</strong> {currentRequirement.minSize}</p>
                  <p><strong>Aspect ratio:</strong> {currentRequirement.aspectRatio}</p>
                  <p><strong>Max file size:</strong> {currentRequirement.maxSize}</p>
                  <p>{currentRequirement.description}</p>
                </div>
              }
              type="warning"
              style={{ marginBottom: 16 }}
              showIcon
            />
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Basic Twitter Card Properties */}
          <Col span={24}>
            <Title level={5}>Basic Properties</Title>
          </Col>

          <Col span={12}>
            <Form.Item
              name="twitter:title"
              label={
                <Space>
                  Title
                  <ValidationIndicator result={validationResults.title} />
                </Space>
              }
              rules={[{ required: true, message: 'Title is required' }]}
            >
              <Input
                placeholder="Compelling title for Twitter sharing"
                suffix={<CharacterCounter value={twitterConfig['twitter:title']} limit={70} optimal={30} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="twitter:description"
              label={
                <Space>
                  Description
                  <ValidationIndicator result={validationResults.description} />
                </Space>
              }
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <TextArea
                rows={2}
                placeholder="Engaging description for Twitter"
                suffix={<CharacterCounter value={twitterConfig['twitter:description']} limit={200} optimal={120} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="twitter:site"
              label={
                <Space>
                  Site Twitter Account
                  <ValidationIndicator result={validationResults.site} />
                  <Tooltip title="Your site's main Twitter account">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Input
                placeholder="@yoursitehandle"
                prefix="@"
                onChange={(e) => {
                  let value = e.target.value;
                  if (!value.startsWith('@') && value.length > 0) {
                    value = '@' + value;
                  }
                  form.setFieldValue('twitter:site', value);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="twitter:creator"
              label={
                <Space>
                  Content Creator
                  <ValidationIndicator result={validationResults.creator} />
                  <Tooltip title="Twitter account of content creator">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Input
                placeholder="@creatorhandle"
                prefix="@"
                onChange={(e) => {
                  let value = e.target.value;
                  if (!value.startsWith('@') && value.length > 0) {
                    value = '@' + value;
                  }
                  form.setFieldValue('twitter:creator', value);
                }}
              />
            </Form.Item>
          </Col>

          {/* Image Configuration */}
          <Col span={24}>
            <Divider>Image Configuration</Divider>
          </Col>

          <Col span={18}>
            <Form.Item
              name="twitter:image"
              label={
                <Space>
                  Image URL
                  <ValidationIndicator result={validationResults.image} />
                </Space>
              }
              rules={[{ required: true, message: 'Image is required' }]}
            >
              <Input placeholder="https://example.com/twitter-image.jpg" />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label=" ">
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} block>
                  Upload Image
                </Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="twitter:image:alt"
              label="Image Alt Text"
              rules={[{ required: true, message: 'Alt text is required for accessibility' }]}
            >
              <Input placeholder="Descriptive alt text for the image" />
            </Form.Item>
          </Col>
        </Row>

        {/* App Card Specific Fields */}
        {selectedCard === 'app' && (
          <div>
            <Divider>App Store Information</Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Title level={5}>
                  <Space>
                    <MobileOutlined />
                    Mobile App Details
                  </Space>
                </Title>
              </Col>

              {/* iPhone App */}
              <Col span={8}>
                <Form.Item
                  name="twitter:app:name:iphone"
                  label="iPhone App Name"
                >
                  <Input placeholder="Your App Name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="twitter:app:id:iphone"
                  label="iPhone App ID"
                >
                  <Input placeholder="123456789" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="twitter:app:url:iphone"
                  label="iPhone App URL"
                >
                  <Input placeholder="myapp://action" />
                </Form.Item>
              </Col>

              {/* Google Play App */}
              <Col span={8}>
                <Form.Item
                  name="twitter:app:name:googleplay"
                  label="Google Play App Name"
                >
                  <Input placeholder="Your App Name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="twitter:app:id:googleplay"
                  label="Google Play App ID"
                >
                  <Input placeholder="com.yourcompany.app" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="twitter:app:url:googleplay"
                  label="Google Play App URL"
                >
                  <Input placeholder="myapp://action" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {/* Player Card Specific Fields */}
        {selectedCard === 'player' && (
          <div>
            <Divider>Media Player Configuration</Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Title level={5}>
                  <Space>
                    <PlayCircleOutlined />
                    Media Player Details
                  </Space>
                </Title>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="twitter:player"
                  label="Player URL"
                  rules={[{ required: selectedCard === 'player', message: 'Player URL is required' }]}
                >
                  <Input placeholder="https://example.com/player.html" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="twitter:player:width"
                  label="Player Width (px)"
                >
                  <InputNumber 
                    placeholder="720" 
                    min={280} 
                    max={1920}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="twitter:player:height"
                  label="Player Height (px)"
                >
                  <InputNumber 
                    placeholder="405" 
                    min={200} 
                    max={1080}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="twitter:player:stream"
                  label="Stream URL (optional)"
                >
                  <Input placeholder="https://example.com/video.mp4" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="twitter:player:stream:content_type"
                  label="Stream Content Type"
                >
                  <Select placeholder="Select content type">
                    <Option value="video/mp4">MP4 Video</Option>
                    <Option value="video/webm">WebM Video</Option>
                    <Option value="audio/mp3">MP3 Audio</Option>
                    <Option value="audio/ogg">OGG Audio</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {/* Generated HTML Preview */}
        <Card
          title="Generated Twitter Card Tags"
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
            {generateTwitterCardHTML(twitterConfig)}
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

export default TwitterCardManager;