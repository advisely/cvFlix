'use client';

import React, { useMemo } from 'react';
import { Card, Typography, Space, Avatar, Tag, Rate, Button, Divider, Empty } from 'antd';
import { 
  UserOutlined, 
  GlobalOutlined, 
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkOutlined,
  StarFilled,
  PlayCircleOutlined,
  ShopOutlined,
  BookOutlined
} from '@ant-design/icons';
import { generateRichResultsPreview } from './utils/schema-utils';

const { Title, Text, Paragraph } = Typography;

interface RichResultsPreviewProps {
  jsonData: string | object;
  showMultipleViews?: boolean;
}

const RichResultsPreview: React.FC<RichResultsPreviewProps> = ({ 
  jsonData, 
  showMultipleViews = true 
}) => {
  const parsedData = useMemo(() => {
    try {
      if (typeof jsonData === 'string') {
        return JSON.parse(jsonData);
      }
      return jsonData;
    } catch (error) {
      return null;
    }
  }, [jsonData]);

  const previewData = useMemo(() => {
    if (!parsedData) return null;
    return generateRichResultsPreview(parsedData);
  }, [parsedData]);

  if (!parsedData || !previewData) {
    return (
      <Card title="Rich Results Preview">
        <Empty 
          description="Invalid JSON data - cannot generate preview"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const renderPersonPreview = () => (
    <div className="rich-result person-result">
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: '8px', 
        padding: '16px', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {previewData.image ? (
            <Avatar size={64} src={previewData.image} />
          ) : (
            <Avatar size={64} icon={<UserOutlined />} />
          )}
          
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a0dab' }}>
              {previewData.name}
            </Title>
            
            {previewData.jobTitle && (
              <Text strong style={{ color: '#5f6368', display: 'block', marginBottom: '4px' }}>
                {previewData.jobTitle}
                {previewData.company && <span> at {previewData.company}</span>}
              </Text>
            )}
            
            {previewData.url && (
              <div style={{ color: '#006621', fontSize: '14px', marginBottom: '8px' }}>
                {new URL(previewData.url).hostname}
              </div>
            )}
            
            {previewData.description && (
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ margin: '0 0 8px 0', color: '#545454' }}
              >
                {previewData.description}
              </Paragraph>
            )}
            
            {previewData.social && previewData.social.length > 0 && (
              <Space wrap size="small">
                {previewData.social.map((link: string, index: number) => (
                  <Button key={index} size="small" type="link" icon={<LinkOutlined />}>
                    {new URL(link).hostname.replace('www.', '')}
                  </Button>
                ))}
              </Space>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganizationPreview = () => (
    <div className="rich-result organization-result">
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: '8px', 
        padding: '16px', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {previewData.logo ? (
            <Avatar size={64} src={previewData.logo} shape="square" />
          ) : (
            <Avatar size={64} icon={<ShopOutlined />} shape="square" />
          )}
          
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a0dab' }}>
              {previewData.name}
            </Title>
            
            {previewData.url && (
              <div style={{ color: '#006621', fontSize: '14px', marginBottom: '8px' }}>
                {new URL(previewData.url).hostname}
              </div>
            )}
            
            {previewData.description && (
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ margin: '0 0 8px 0', color: '#545454' }}
              >
                {previewData.description}
              </Paragraph>
            )}
            
            <Space wrap>
              {previewData.contact && (
                <Tag icon={<PhoneOutlined />} color="blue">
                  {previewData.contact}
                </Tag>
              )}
              {previewData.address && (
                <Tag icon={<EnvironmentOutlined />} color="green">
                  {previewData.address.addressLocality || 'Location'}
                </Tag>
              )}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebsitePreview = () => (
    <div className="rich-result website-result">
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: '8px', 
        padding: '16px', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a0dab' }}>
          {previewData.name}
        </Title>
        
        {previewData.url && (
          <div style={{ color: '#006621', fontSize: '14px', marginBottom: '8px' }}>
            {new URL(previewData.url).hostname}
          </div>
        )}
        
        {previewData.description && (
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            style={{ margin: '0 0 8px 0', color: '#545454' }}
          >
            {previewData.description}
          </Paragraph>
        )}
        
        <Space wrap>
          {previewData.hasSearch && (
            <Tag icon={<GlobalOutlined />} color="blue">
              Site Search Available
            </Tag>
          )}
          {previewData.author && (
            <Tag icon={<UserOutlined />} color="green">
              By {previewData.author}
            </Tag>
          )}
        </Space>
      </div>
    </div>
  );

  const renderArticlePreview = () => (
    <div className="rich-result article-result">
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: '8px', 
        padding: '16px', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a0dab' }}>
              {previewData.headline}
            </Title>
            
            <Space style={{ marginBottom: '8px', fontSize: '13px', color: '#70757a' }}>
              {previewData.publisher && (
                <span>{previewData.publisher}</span>
              )}
              {previewData.publishDate && (
                <span>• {new Date(previewData.publishDate).toLocaleDateString()}</span>
              )}
            </Space>
            
            {previewData.description && (
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ margin: '0 0 8px 0', color: '#545454' }}
              >
                {previewData.description}
              </Paragraph>
            )}
            
            {previewData.author && (
              <Text type="secondary" style={{ fontSize: '13px' }}>
                By {previewData.author}
              </Text>
            )}
          </div>
          
          {previewData.image && (
            <div style={{ width: '120px', height: '80px', overflow: 'hidden', borderRadius: '4px' }}>
              <img 
                src={previewData.image} 
                alt={previewData.headline}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEventPreview = () => (
    <div className="rich-result event-result">
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: '8px', 
        padding: '16px', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a0dab' }}>
              {previewData.name}
            </Title>
            
            <Space wrap style={{ marginBottom: '8px' }}>
              {previewData.startDate && (
                <Tag icon={<CalendarOutlined />} color="blue">
                  {new Date(previewData.startDate).toLocaleDateString()}
                </Tag>
              )}
              {previewData.location && (
                <Tag icon={<EnvironmentOutlined />} color="green">
                  {previewData.location}
                </Tag>
              )}
              {previewData.price && (
                <Tag color="orange">
                  ${previewData.price}
                </Tag>
              )}
            </Space>
            
            {previewData.description && (
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ margin: '0 0 8px 0', color: '#545454' }}
              >
                {previewData.description}
              </Paragraph>
            )}
            
            {previewData.organizer && (
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Organized by {previewData.organizer}
              </Text>
            )}
          </div>
          
          {previewData.image && (
            <div style={{ width: '120px', height: '80px', overflow: 'hidden', borderRadius: '4px' }}>
              <img 
                src={previewData.image} 
                alt={previewData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGenericPreview = () => (
    <div className="rich-result generic-result">
      <div style={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: '8px', 
        padding: '16px', 
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={4} style={{ margin: '0 0 4px 0', color: '#1a0dab' }}>
          {previewData.name}
        </Title>
        
        <Tag color="blue" style={{ marginBottom: '8px' }}>
          @{previewData.type}
        </Tag>
        
        {previewData.url && (
          <div style={{ color: '#006621', fontSize: '14px', marginBottom: '8px' }}>
            {new URL(previewData.url).hostname}
          </div>
        )}
        
        {previewData.description && (
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            style={{ margin: '0', color: '#545454' }}
          >
            {previewData.description}
          </Paragraph>
        )}
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (previewData.type) {
      case 'Person':
        return renderPersonPreview();
      case 'Organization':
        return renderOrganizationPreview();
      case 'WebSite':
        return renderWebsitePreview();
      case 'Article':
        return renderArticlePreview();
      case 'Event':
        return renderEventPreview();
      default:
        return renderGenericPreview();
    }
  };

  return (
    <Card 
      title="Rich Results Preview"
      extra={
        <Space>
          <Tag color="blue">@{previewData.type}</Tag>
          <Button 
            size="small" 
            type="link" 
            href="https://search.google.com/test/rich-results" 
            target="_blank"
          >
            Test with Google
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          This is how your structured data might appear in Google search results:
        </Text>
      </div>
      
      {renderPreview()}
      
      <Divider />
      
      <div>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <strong>Note:</strong> This is a simulation. Actual appearance in search results may vary 
          and depends on Google's algorithms, competing content, and other factors.
        </Text>
      </div>
    </Card>
  );
};

export default RichResultsPreview;
