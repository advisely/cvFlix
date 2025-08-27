'use client';

import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Card, 
  Button, 
  Space, 
  Typography, 
  Select, 
  Table, 
  Modal,
  message, 
  Spin,
  Row,
  Col,
  Popconfirm,
  Tag,
  Tooltip
} from 'antd';
import { 
  SaveOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  EyeOutlined,
  TagOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useSEOMetaTags } from './hooks/useSEOMetaTags';
import { useSEOConfig } from './hooks/useSEOConfig';
import { SEOMetaTagCreateRequest, SEOMetaTagUpdateRequest } from '@/types/seo';
import { validateSEOText, SEO_CHARACTER_LIMITS, commonSitePages } from './utils/seoUtils';
import MultilingualFormTabs from '../MultilingualFormTabs';
import SEOPreview from './SEOPreview';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

const MetaTagManager: React.FC = () => {
  const { metaTags, loading, createMetaTag, updateMetaTag, deleteMetaTag } = useSEOMetaTags();
  const { config } = useSEOConfig();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTag = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTag = (tagId: string) => {
    const tag = metaTags.find(t => t.id === tagId);
    if (tag) {
      setEditingTag(tagId);
      form.setFieldsValue({
        page: tag.page,
        title: tag.title,
        titleFr: tag.titleFr,
        description: tag.description,
        descriptionFr: tag.descriptionFr,
        keywords: tag.keywords,
        keywordsFr: tag.keywordsFr,
        ogTitle: tag.ogTitle,
        ogTitleFr: tag.ogTitleFr,
        ogDescription: tag.ogDescription,
        ogDescriptionFr: tag.ogDescriptionFr,
        ogImage: tag.ogImage,
        canonicalUrl: tag.canonicalUrl
      });
      setIsModalVisible(true);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    await deleteMetaTag(tagId);
  };

  const handlePreview = (tag: unknown) => {
    setPreviewData(tag);
    setPreviewVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let success = false;
      if (editingTag) {
        success = await updateMetaTag(editingTag, values as SEOMetaTagUpdateRequest);
      } else {
        success = await createMetaTag(values as SEOMetaTagCreateRequest);
      }

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
        setEditingTag(null);
      }
    } catch {
      message.error('Please fix form errors before saving');
    } finally {
      setSubmitting(false);
    }
  };

  const getPageIcon = (page: string) => {
    const pageInfo = commonSitePages.find(p => p.value === page);
    return pageInfo?.icon || '📄';
  };

  const getPageLabel = (page: string) => {
    const pageInfo = commonSitePages.find(p => p.value === page);
    return pageInfo?.label || page;
  };

  const columns = [
    {
      title: 'Page',
      dataIndex: 'page',
      key: 'page',
      render: (page: string) => (
        <Space>
          <span style={{ fontSize: '16px' }}>{getPageIcon(page)}</span>
          <div>
            <div style={{ fontWeight: 500 }}>{getPageLabel(page)}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{page}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Title (EN)',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            {title ? (
              <Tooltip title={title}>
                <Text ellipsis style={{ maxWidth: '200px', display: 'block' }}>
                  {title}
                </Text>
              </Tooltip>
            ) : (
              <Text type="secondary">No title</Text>
            )}
          </div>
          {title && (
            <Tag color={title.length <= 60 ? 'green' : 'red'} size="small">
              {title.length}/60
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Description (EN)',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            {description ? (
              <Tooltip title={description}>
                <Text ellipsis style={{ maxWidth: '250px', display: 'block' }}>
                  {description}
                </Text>
              </Tooltip>
            ) : (
              <Text type="secondary">No description</Text>
            )}
          </div>
          {description && (
            <Tag color={description.length <= 160 ? 'green' : 'red'} size="small">
              {description.length}/160
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record: { title: string; titleFr: string; description: string; descriptionFr: string; ogTitle?: string; ogDescription?: string }) => {
        const hasBasicMeta = record.title && record.titleFr && record.description && record.descriptionFr;
        const hasOpenGraph = record.ogTitle || record.ogDescription;
        const hasOptimizedLength = 
          record.title?.length <= 60 && 
          record.titleFr?.length <= 60 && 
          record.description?.length <= 160 && 
          record.descriptionFr?.length <= 160;

        return (
          <Space direction="vertical" size="small">
            <Tag color={hasBasicMeta ? 'green' : 'orange'}>
              {hasBasicMeta ? 'Complete' : 'Incomplete'}
            </Tag>
            {hasOpenGraph && <Tag color="blue">OpenGraph</Tag>}
            {!hasOptimizedLength && <Tag color="red">Length Issues</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: { id: string; page: string; title: string; titleFr: string; description: string; descriptionFr: string; keywords?: string; ogTitle?: string; ogDescription?: string }) => (
        <Space>
          <Tooltip title="Preview">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditTag(record.id)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Meta Tag"
            description="Are you sure you want to delete this meta tag?"
            onConfirm={() => handleDeleteTag(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading meta tags...</div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={3} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TagOutlined />
              Meta Tag Management
            </Title>
            <Text type="secondary">
              Create and manage page-specific meta tags for better SEO performance
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateTag}
          >
            Add Meta Tags
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={metaTags}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <TagOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">No meta tags configured</Text>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Button type="primary" onClick={handleCreateTag}>
                    Add Your First Meta Tag
                  </Button>
                </div>
              </div>
            )
          }}
        />
      </Card>

      {/* Meta Tag Form Modal */}
      <Modal
        title={
          <Space>
            <TagOutlined />
            {editingTag ? 'Edit Meta Tags' : 'Add New Meta Tags'}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingTag(null);
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={handleSubmit}
          >
            {editingTag ? 'Update Meta Tags' : 'Create Meta Tags'}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="page"
            label="Page"
            rules={[{ required: true, message: 'Please select a page' }]}
          >
            <Select 
              placeholder="Select a page"
              showSearch
              optionFilterProp="children"
            >
              {commonSitePages.map(page => (
                <Select.Option key={page.value} value={page.value}>
                  <Space>
                    <span>{page.icon}</span>
                    {page.label}
                    <Text type="secondary">({page.value})</Text>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <MultilingualFormTabs
            englishContent={
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="title"
                  label="Page Title (English)"
                  rules={[
                    { required: true, message: 'Title is required' },
                    { max: SEO_CHARACTER_LIMITS.title, message: `Title should be under ${SEO_CHARACTER_LIMITS.title} characters` }
                  ]}
                  extra={<CharacterCounter value={form.getFieldValue('title')} limit={SEO_CHARACTER_LIMITS.title} label="Title" />}
                >
                  <Input placeholder="Unique, descriptive page title" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Meta Description (English)"
                  rules={[
                    { required: true, message: 'Description is required' },
                    { max: SEO_CHARACTER_LIMITS.description, message: `Description should be under ${SEO_CHARACTER_LIMITS.description} characters` }
                  ]}
                  extra={<CharacterCounter value={form.getFieldValue('description')} limit={SEO_CHARACTER_LIMITS.description} label="Description" />}
                >
                  <TextArea 
                    rows={3}
                    placeholder="Compelling description that summarizes the page content"
                  />
                </Form.Item>

                <Form.Item
                  name="keywords"
                  label="Keywords (English)"
                  extra="Comma-separated keywords relevant to this page"
                >
                  <Input placeholder="keyword1, keyword2, keyword3" />
                </Form.Item>

                <Form.Item
                  name="ogTitle"
                  label="OpenGraph Title (English)"
                  extra="Title for social media sharing (optional, uses page title if empty)"
                >
                  <Input placeholder="Leave empty to use page title" />
                </Form.Item>

                <Form.Item
                  name="ogDescription"
                  label="OpenGraph Description (English)"
                  extra="Description for social media sharing (optional, uses meta description if empty)"
                >
                  <TextArea rows={2} placeholder="Leave empty to use meta description" />
                </Form.Item>
              </Space>
            }
            frenchContent={
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="titleFr"
                  label="Page Title (French)"
                  rules={[
                    { required: true, message: 'French title is required' },
                    { max: SEO_CHARACTER_LIMITS.title, message: `Title should be under ${SEO_CHARACTER_LIMITS.title} characters` }
                  ]}
                  extra={<CharacterCounter value={form.getFieldValue('titleFr')} limit={SEO_CHARACTER_LIMITS.title} label="Titre" />}
                >
                  <Input placeholder="Titre de page unique et descriptif" />
                </Form.Item>

                <Form.Item
                  name="descriptionFr"
                  label="Meta Description (French)"
                  rules={[
                    { required: true, message: 'French description is required' },
                    { max: SEO_CHARACTER_LIMITS.description, message: `Description should be under ${SEO_CHARACTER_LIMITS.description} characters` }
                  ]}
                  extra={<CharacterCounter value={form.getFieldValue('descriptionFr')} limit={SEO_CHARACTER_LIMITS.description} label="Description" />}
                >
                  <TextArea 
                    rows={3}
                    placeholder="Description attrayante qui résume le contenu de la page"
                  />
                </Form.Item>

                <Form.Item
                  name="keywordsFr"
                  label="Keywords (French)"
                  extra="Mots-clés pertinents pour cette page, séparés par des virgules"
                >
                  <Input placeholder="mot-clé1, mot-clé2, mot-clé3" />
                </Form.Item>

                <Form.Item
                  name="ogTitleFr"
                  label="OpenGraph Title (French)"
                  extra="Titre pour le partage sur les réseaux sociaux (optionnel)"
                >
                  <Input placeholder="Laisser vide pour utiliser le titre de la page" />
                </Form.Item>

                <Form.Item
                  name="ogDescriptionFr"
                  label="OpenGraph Description (French)"
                  extra="Description pour le partage sur les réseaux sociaux (optionnel)"
                >
                  <TextArea rows={2} placeholder="Laisser vide pour utiliser la méta-description" />
                </Form.Item>
              </Space>
            }
          />

          <Card title="Advanced Settings" size="small" style={{ marginTop: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ogImage"
                  label="OpenGraph Image"
                  extra="URL of image for social media sharing"
                >
                  <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="canonicalUrl"
                  label="Custom Canonical URL"
                  extra="Override default canonical URL for this page"
                >
                  <Input 
                    placeholder="https://example.com/page"
                    addonBefore={<GlobalOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Meta Tags Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
      >
        {previewData && config && (
          <SEOPreview
            config={config}
            metaTag={previewData}
            showBothLanguages={true}
          />
        )}
      </Modal>
    </>
  );
};

export default MetaTagManager;