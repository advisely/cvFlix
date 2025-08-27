'use client'

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Divider,
  Modal,
  Alert,
  Collapse,
  Tooltip,
  Badge
} from 'antd';
import { 
  FileTextOutlined,
  EyeOutlined,
  CopyOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  ROBOTS_TEMPLATES, 
  getTemplateCategories, 
  getTemplatesByCategory, 
  searchTemplates,
  generateRobotsFromTemplate,
  type RobotsTemplate 
} from './utils/robots-utils';

const { Text, Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface RobotsTxtTemplatesProps {
  onApplyTemplate: (content: string) => void;
  currentSiteUrl?: string;
}

interface TemplateCustomization {
  siteUrl: string;
  additionalDisallows: string[];
  crawlDelay: number;
  blockAggressive: boolean;
}

const RobotsTxtTemplates: React.FC<RobotsTxtTemplatesProps> = ({
  onApplyTemplate,
  currentSiteUrl = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<RobotsTemplate | null>(null);
  const [customizationModal, setCustomizationModal] = useState<RobotsTemplate | null>(null);
  const [customization, setCustomization] = useState<TemplateCustomization>({
    siteUrl: currentSiteUrl || 'https://yoursite.com',
    additionalDisallows: [],
    crawlDelay: 5,
    blockAggressive: false
  });
  const [newDisallowPath, setNewDisallowPath] = useState('');

  const categories = getTemplateCategories();
  const allTemplates = Object.values(ROBOTS_TEMPLATES);

  // Filter templates based on search and category
  const getFilteredTemplates = () => {
    let filtered = allTemplates;

    if (searchQuery) {
      filtered = searchTemplates(searchQuery);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();

  // Handle template preview
  const handlePreview = (template: RobotsTemplate) => {
    setPreviewTemplate(template);
  };

  // Handle template customization
  const handleCustomize = (template: RobotsTemplate) => {
    setCustomizationModal(template);
    setCustomization({
      siteUrl: currentSiteUrl || 'https://yoursite.com',
      additionalDisallows: [],
      crawlDelay: 5,
      blockAggressive: false
    });
  };

  // Apply template directly
  const handleApplyTemplate = (template: RobotsTemplate) => {
    const content = generateRobotsFromTemplate(template, {
      siteUrl: currentSiteUrl || undefined
    });
    onApplyTemplate(content);
  };

  // Apply customized template
  const handleApplyCustomized = () => {
    if (!customizationModal) return;

    const content = generateRobotsFromTemplate(customizationModal, customization);
    onApplyTemplate(content);
    setCustomizationModal(null);
  };

  // Add additional disallow path
  const handleAddDisallowPath = () => {
    if (newDisallowPath && !customization.additionalDisallows.includes(newDisallowPath)) {
      setCustomization(prev => ({
        ...prev,
        additionalDisallows: [...prev.additionalDisallows, newDisallowPath]
      }));
      setNewDisallowPath('');
    }
  };

  // Remove disallow path
  const handleRemoveDisallowPath = (path: string) => {
    setCustomization(prev => ({
      ...prev,
      additionalDisallows: prev.additionalDisallows.filter(p => p !== path)
    }));
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Personal': 'blue',
      'Business': 'green',
      'Content': 'purple',
      'Security': 'red',
      'Open': 'orange'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="robots-txt-templates">
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <Text strong>Robots.txt Templates</Text>
            <Badge count={filteredTemplates.length} showZero style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              size="small"
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {filteredTemplates.map((template) => (
            <Col key={template.id} xs={24} sm={12} lg={8}>
              <Card
                size="small"
                title={
                  <Space>
                    <Text strong>{template.name}</Text>
                    <Tag color={getCategoryColor(template.category)} size="small">
                      {template.category}
                    </Tag>
                  </Space>
                }
                extra={
                  <Space>
                    <Tooltip title="Preview">
                      <Button 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(template)}
                      />
                    </Tooltip>
                    <Tooltip title="Customize">
                      <Button 
                        size="small" 
                        icon={<SettingOutlined />}
                        onClick={() => handleCustomize(template)}
                      />
                    </Tooltip>
                  </Space>
                }
                actions={[
                  <Button
                    key="apply"
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleApplyTemplate(template)}
                  >
                    Apply
                  </Button>
                ]}
              >
                <div style={{ height: '80px', overflow: 'hidden' }}>
                  <Paragraph 
                    ellipsis={{ rows: 2 }}
                    type="secondary"
                    style={{ fontSize: '12px' }}
                  >
                    {template.description}
                  </Paragraph>
                  <Space wrap style={{ marginTop: '8px' }}>
                    {template.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} size="small">{tag}</Tag>
                    ))}
                    {template.tags.length > 3 && (
                      <Tag size="small">+{template.tags.length - 3}</Tag>
                    )}
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">
              No templates found matching your search criteria.
            </Text>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            {previewTemplate?.name}
            <Tag color={getCategoryColor(previewTemplate?.category || '')}>
              {previewTemplate?.category}
            </Tag>
          </Space>
        }
        open={!!previewTemplate}
        onCancel={() => setPreviewTemplate(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewTemplate(null)}>
            Close
          </Button>,
          <Button
            key="customize"
            icon={<SettingOutlined />}
            onClick={() => {
              if (previewTemplate) {
                setPreviewTemplate(null);
                handleCustomize(previewTemplate);
              }
            }}
          >
            Customize
          </Button>,
          <Button
            key="apply"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              if (previewTemplate) {
                handleApplyTemplate(previewTemplate);
                setPreviewTemplate(null);
              }
            }}
          >
            Apply Template
          </Button>
        ]}
      >
        {previewTemplate && (
          <div>
            <Alert
              message={previewTemplate.description}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <Text strong>Template Content:</Text>
            <pre style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '12px',
              marginTop: '8px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {previewTemplate.content}
            </pre>

            <Space wrap style={{ marginTop: '16px' }}>
              <Text strong>Tags:</Text>
              {previewTemplate.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </div>
        )}
      </Modal>

      {/* Customization Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            Customize Template: {customizationModal?.name}
          </Space>
        }
        open={!!customizationModal}
        onCancel={() => setCustomizationModal(null)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setCustomizationModal(null)}>
            Cancel
          </Button>,
          <Button
            key="apply"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApplyCustomized}
          >
            Apply Customized Template
          </Button>
        ]}
      >
        {customizationModal && (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Customization Options" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Site URL</Text>
                    <Input
                      value={customization.siteUrl}
                      onChange={(e) => setCustomization(prev => ({ ...prev, siteUrl: e.target.value }))}
                      placeholder="https://yoursite.com"
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <Text strong>Crawl Delay (seconds)</Text>
                    <Input
                      type="number"
                      min={0}
                      max={3600}
                      value={customization.crawlDelay}
                      onChange={(e) => setCustomization(prev => ({ ...prev, crawlDelay: parseInt(e.target.value) || 0 }))}
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={customization.blockAggressive}
                        onChange={(e) => setCustomization(prev => ({ ...prev, blockAggressive: e.target.checked }))}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Block aggressive crawlers (AhrefsBot, MJ12bot, etc.)</Text>
                    </label>
                  </div>

                  <Divider />

                  <div>
                    <Text strong>Additional Disallow Paths</Text>
                    <Space.Compact style={{ width: '100%', marginTop: '4px' }}>
                      <Input
                        value={newDisallowPath}
                        onChange={(e) => setNewDisallowPath(e.target.value)}
                        placeholder="/path/to/block"
                        onPressEnter={handleAddDisallowPath}
                      />
                      <Button onClick={handleAddDisallowPath}>Add</Button>
                    </Space.Compact>

                    {customization.additionalDisallows.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <Space wrap>
                          {customization.additionalDisallows.map(path => (
                            <Tag
                              key={path}
                              closable
                              onClose={() => handleRemoveDisallowPath(path)}
                            >
                              {path}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Preview" size="small">
                <pre style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '12px',
                  maxHeight: '400px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {generateRobotsFromTemplate(customizationModal, customization)}
                </pre>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default RobotsTxtTemplates;
