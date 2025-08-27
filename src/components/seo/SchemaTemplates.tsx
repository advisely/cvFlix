'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Select, 
  Tag, 
  Modal, 
  Tabs,
  Badge,
  Empty,
  message,
  Rate
} from 'antd';
import { 
  FileTextOutlined, 
  StarFilled,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { SCHEMA_TEMPLATES, SchemaTemplate, getSchemaTemplatesByCategory, getPopularTemplates } from './utils/schema-utils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SchemaTemplatesProps {
  onSelectTemplate: (template: SchemaTemplate) => void;
  onApplyTemplate?: (jsonContent: string, template: SchemaTemplate) => void;
  compact?: boolean;
}

const SchemaTemplates: React.FC<SchemaTemplatesProps> = ({ 
  onSelectTemplate, 
  onApplyTemplate,
  compact = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SchemaTemplate | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Get unique categories
  const categories = ['all', ...new Set(SCHEMA_TEMPLATES.map(t => t.category))];

  // Filter templates
  const filteredTemplates = SCHEMA_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = getPopularTemplates(3);

  const handleTemplateSelect = (template: SchemaTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    message.success(`Selected ${template.name} template`);
  };

  const handlePreviewTemplate = (template: SchemaTemplate) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  const handleApplyTemplate = (template: SchemaTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template.content, template);
    } else {
      onSelectTemplate(template);
    }
    setPreviewVisible(false);
    message.success(`Applied ${template.name} template`);
  };

  const copyTemplateToClipboard = async (template: SchemaTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      message.success('Template copied to clipboard');
    } catch (error) {
      message.error('Failed to copy template');
    }
  };

  const getPopularityStars = (popularity: number) => {
    const stars = Math.floor(popularity / 20); // Convert to 1-5 scale
    return (
      <Space size={2}>
        {[...Array(5)].map((_, i) => (
          i < stars ? <StarFilled key={i} style={{ color: '#faad14' }} /> : <StarOutlined key={i} style={{ color: '#d9d9d9' }} />
        ))}
      </Space>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Professional': 'blue',
      'Business': 'green',
      'Website': 'purple',
      'Content': 'orange',
      'Navigation': 'cyan',
      'Events': 'magenta'
    };
    return colors[category] || 'default';
  };

  const renderTemplateCard = (template: SchemaTemplate) => (
    <Card
      key={template.id}
      size="small"
      style={{ height: '100%' }}
      actions={[
        <Button
          key="preview"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handlePreviewTemplate(template)}
        >
          Preview
        </Button>,
        <Button
          key="select"
          type="text"
          icon={<FileTextOutlined />}
          onClick={() => handleTemplateSelect(template)}
        >
          Select
        </Button>,
        <Button
          key="copy"
          type="text"
          icon={<CopyOutlined />}
          onClick={() => copyTemplateToClipboard(template)}
        >
          Copy
        </Button>
      ]}
    >
      <Card.Meta
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>{template.name}</Text>
            <Badge count={`${template.popularity}%`} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        description={
          <div>
            <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '8px 0' }}>
              {template.description}
            </Paragraph>
            <Space style={{ marginTop: 8, width: '100%', justifyContent: 'space-between' }}>
              <Tag color={getCategoryColor(template.category)}>{template.category}</Tag>
              <Space size={4}>
                <Text type="secondary" style={{ fontSize: '12px' }}>@{template.type}</Text>
                {getPopularityStars(template.popularity)}
              </Space>
            </Space>
          </div>
        }
      />
    </Card>
  );

  if (compact) {
    return (
      <div className="schema-templates-compact">
        <Row gutter={[8, 8]}>
          {popularTemplates.map(template => (
            <Col span={8} key={template.id}>
              <Button
                block
                onClick={() => handleTemplateSelect(template)}
                title={template.description}
              >
                {template.name}
              </Button>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="schema-templates">
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <Title level={4} style={{ margin: 0 }}>Schema Templates</Title>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">{filteredTemplates.length} templates</Text>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'popular',
              label: (
                <Space>
                  <ThunderboltOutlined />
                  Popular
                </Space>
              ),
              children: (
                <div>
                  <Paragraph type="secondary">
                    Most commonly used templates for professional portfolios and business websites.
                  </Paragraph>
                  <Row gutter={[16, 16]}>
                    {popularTemplates.map(template => (
                      <Col xs={24} md={12} lg={8} key={template.id}>
                        {renderTemplateCard(template)}
                      </Col>
                    ))}
                  </Row>
                </div>
              )
            },
            {
              key: 'all',
              label: (
                <Space>
                  <FilterOutlined />
                  All Templates
                </Space>
              ),
              children: (
                <div>
                  {/* Search and Filter Controls */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12}>
                      <Input
                        placeholder="Search templates..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Select
                        placeholder="Filter by category"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        style={{ width: '100%' }}
                        suffixIcon={<FilterOutlined />}
                      >
                        {categories.map(category => (
                          <Option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>

                  {/* Templates Grid */}
                  {filteredTemplates.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {filteredTemplates.map(template => (
                        <Col xs={24} md={12} lg={8} key={template.id}>
                          {renderTemplateCard(template)}
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty
                      description="No templates match your search criteria"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Template Preview Modal */}
      <Modal
        title={
          selectedTemplate && (
            <Space>
              <FileTextOutlined />
              <span>{selectedTemplate.name}</span>
              <Tag color={getCategoryColor(selectedTemplate.category)}>
                {selectedTemplate.category}
              </Tag>
              <Rate disabled value={Math.floor(selectedTemplate.popularity / 20)} />
            </Space>
          )
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={
          selectedTemplate && [
            <Button key="cancel" onClick={() => setPreviewVisible(false)}>
              Cancel
            </Button>,
            <Button 
              key="copy" 
              icon={<CopyOutlined />}
              onClick={() => selectedTemplate && copyTemplateToClipboard(selectedTemplate)}
            >
              Copy
            </Button>,
            <Button
              key="apply"
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => selectedTemplate && handleApplyTemplate(selectedTemplate)}
            >
              Use This Template
            </Button>
          ]
        }
      >
        {selectedTemplate && (
          <div>
            <Paragraph>{selectedTemplate.description}</Paragraph>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>Schema Type:</Text>
                <Tag color="blue">@{selectedTemplate.type}</Tag>
                <Text strong>Popularity:</Text>
                <Tag color="green">{selectedTemplate.popularity}%</Tag>
              </Space>
            </div>
            
            <Title level={5}>Template Preview:</Title>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '6px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '400px',
              border: '1px solid #d9d9d9'
            }}>
              {selectedTemplate.content}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SchemaTemplates;
