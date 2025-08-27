'use client';

import React, { useState, useMemo } from 'react';
import { Card, Space, Typography, Switch, Row, Col, Tabs, Tag } from 'antd';
import { 
  GoogleOutlined, 
  FacebookOutlined, 
  TwitterOutlined, 
  MobileOutlined,
  DesktopOutlined,
  LinkOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { SEOConfig, SEOMetaTag } from '@/types/seo';
import { generatePreviewData } from './utils/seoUtils';

const { Title, Text } = Typography;

interface SEOPreviewProps {
  config: SEOConfig;
  metaTag?: SEOMetaTag | null;
  showBothLanguages?: boolean;
}

interface GooglePreviewProps {
  title: string;
  description: string;
  displayUrl: string;
  canonicalUrl: string;
}

interface FacebookPreviewProps {
  title: string;
  description: string;
  siteName: string;
  canonicalUrl: string;
  ogImage?: string;
}

interface TwitterPreviewProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
}

const GooglePreview: React.FC<GooglePreviewProps> = ({ title, description, displayUrl }) => (
  <div style={{ 
    fontFamily: 'arial, sans-serif',
    backgroundColor: '#fff',
    padding: '16px',
    border: '1px solid #e8eaed',
    borderRadius: '8px',
    maxWidth: '600px'
  }}>
    <div style={{ marginBottom: '4px' }}>
      <Text style={{ color: '#1a0dab', fontSize: '20px', fontWeight: 400, cursor: 'pointer' }}>
        {title}
      </Text>
    </div>
    <div style={{ marginBottom: '4px' }}>
      <Text style={{ color: '#006621', fontSize: '14px' }}>
        {displayUrl} › ...
      </Text>
    </div>
    <div>
      <Text style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.58' }}>
        {description}
      </Text>
    </div>
  </div>
);

const FacebookPreview: React.FC<FacebookPreviewProps> = ({ title, description, canonicalUrl, ogImage }) => (
  <div style={{ 
    border: '1px solid #dddfe2',
    borderRadius: '8px',
    backgroundColor: '#fff',
    maxWidth: '500px',
    overflow: 'hidden'
  }}>
    {ogImage && (
      <div style={{ 
        height: '261px',
        backgroundImage: `url(${ogImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f0f0f0'
      }} />
    )}
    <div style={{ padding: '12px 16px' }}>
      <div style={{ marginBottom: '4px' }}>
        <Text style={{ color: '#8a8d91', fontSize: '12px', textTransform: 'uppercase' }}>
          {new URL(canonicalUrl).hostname}
        </Text>
      </div>
      <div style={{ marginBottom: '4px' }}>
        <Text style={{ color: '#1d2129', fontSize: '16px', fontWeight: 600, lineHeight: '1.2' }}>
          {title}
        </Text>
      </div>
      <div>
        <Text style={{ color: '#606770', fontSize: '14px', lineHeight: '1.33' }}>
          {description}
        </Text>
      </div>
    </div>
  </div>
);

const TwitterPreview: React.FC<TwitterPreviewProps> = ({ title, description, canonicalUrl, ogImage }) => (
  <div style={{ 
    border: '1px solid #e1e8ed',
    borderRadius: '16px',
    backgroundColor: '#fff',
    maxWidth: '500px',
    overflow: 'hidden'
  }}>
    {ogImage && (
      <div style={{ 
        height: '250px',
        backgroundImage: `url(${ogImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f0f0f0'
      }} />
    )}
    <div style={{ padding: '12px 16px' }}>
      <div style={{ marginBottom: '4px' }}>
        <Text style={{ color: '#536471', fontSize: '15px' }}>
          {new URL(canonicalUrl).hostname}
        </Text>
      </div>
      <div style={{ marginBottom: '4px' }}>
        <Text style={{ color: '#0f1419', fontSize: '15px', fontWeight: 700, lineHeight: '1.3' }}>
          {title}
        </Text>
      </div>
      <div>
        <Text style={{ color: '#536471', fontSize: '15px', lineHeight: '1.3' }}>
          {description}
        </Text>
      </div>
    </div>
  </div>
);

const SEOPreview: React.FC<SEOPreviewProps> = ({ 
  config, 
  metaTag = null, 
  showBothLanguages = false 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr'>('en');
  const [isMobileView, setIsMobileView] = useState(false);

  const previewDataEn = useMemo(() => 
    generatePreviewData(config, metaTag, 'en'), 
    [config, metaTag]
  );

  const previewDataFr = useMemo(() => 
    generatePreviewData(config, metaTag, 'fr'), 
    [config, metaTag]
  );

  const currentPreview = selectedLanguage === 'en' ? previewDataEn : previewDataFr;

  if (!currentPreview) {
    return (
      <Card>
        <Text type="secondary">No preview data available</Text>
      </Card>
    );
  }

  const previewTabs = [
    {
      key: 'google',
      label: (
        <Space>
          <GoogleOutlined style={{ color: '#4285f4' }} />
          Google Search
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <GooglePreview
            title={currentPreview.title}
            description={currentPreview.description}
            displayUrl={currentPreview.displayUrl}
            canonicalUrl={currentPreview.canonicalUrl}
          />
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              This is how your page will appear in Google search results
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'facebook',
      label: (
        <Space>
          <FacebookOutlined style={{ color: '#1877f2' }} />
          Facebook
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <FacebookPreview
            title={currentPreview.ogTitle || currentPreview.title}
            description={currentPreview.ogDescription || currentPreview.description}
            siteName={currentPreview.siteName}
            canonicalUrl={currentPreview.canonicalUrl}
            ogImage={currentPreview.ogImage}
          />
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Preview when shared on Facebook, LinkedIn, and other OpenGraph platforms
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'twitter',
      label: (
        <Space>
          <TwitterOutlined style={{ color: '#1da1f2' }} />
          Twitter/X
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <TwitterPreview
            title={currentPreview.ogTitle || currentPreview.title}
            description={currentPreview.ogDescription || currentPreview.description}
            canonicalUrl={currentPreview.canonicalUrl}
            ogImage={currentPreview.ogImage}
          />
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Twitter Card preview for social media sharing
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'meta',
      label: (
        <Space>
          <LinkOutlined />
          Meta Tags
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Card size="small">
            <pre style={{ 
              fontSize: '12px', 
              fontFamily: 'monospace',
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
{`<title>${currentPreview.title}</title>
<meta name="description" content="${currentPreview.description}" />
<meta name="canonical" href="${currentPreview.canonicalUrl}" />

<!-- OpenGraph Meta Tags -->
<meta property="og:title" content="${currentPreview.ogTitle}" />
<meta property="og:description" content="${currentPreview.ogDescription}" />
<meta property="og:url" content="${currentPreview.canonicalUrl}" />
<meta property="og:site_name" content="${currentPreview.siteName}" />
<meta property="og:type" content="website" />
${currentPreview.ogImage ? `<meta property="og:image" content="${currentPreview.ogImage}" />` : ''}

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${currentPreview.ogTitle}" />
<meta name="twitter:description" content="${currentPreview.ogDescription}" />
${currentPreview.ogImage ? `<meta name="twitter:image" content="${currentPreview.ogImage}" />` : ''}`}
            </pre>
          </Card>
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              HTML meta tags that will be added to your page &lt;head&gt;
            </Text>
          </div>
        </div>
      )
    }
  ];

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOutlined />
              SEO Preview
            </Title>
            <Text type="secondary">
              {metaTag ? `Preview for ${metaTag.page}` : 'Default SEO preview'}
            </Text>
          </Col>
          <Col>
            <Space>
              {showBothLanguages && (
                <Space>
                  <Text>Language:</Text>
                  <Switch
                    checkedChildren="FR"
                    unCheckedChildren="EN"
                    checked={selectedLanguage === 'fr'}
                    onChange={(checked) => setSelectedLanguage(checked ? 'fr' : 'en')}
                  />
                </Space>
              )}
              <Space>
                <Text>View:</Text>
                <Switch
                  checkedChildren={<MobileOutlined />}
                  unCheckedChildren={<DesktopOutlined />}
                  checked={isMobileView}
                  onChange={setIsMobileView}
                />
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Character Count Summary */}
      <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}>
        <Row gutter={16}>
          <Col span={8}>
            <div>
              <Text strong>Title Length:</Text>
              <div>
                <Tag color={currentPreview.title.length <= 60 ? 'green' : 'red'}>
                  {currentPreview.title.length}/60
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Text strong>Description Length:</Text>
              <div>
                <Tag color={currentPreview.description.length <= 160 ? 'green' : 'red'}>
                  {currentPreview.description.length}/160
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div>
              <Text strong>Language:</Text>
              <div>
                <Tag color="blue">{selectedLanguage.toUpperCase()}</Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <div style={isMobileView ? { maxWidth: '375px', margin: '0 auto' } : {}}>
        <Tabs
          items={previewTabs}
          defaultActiveKey="google"
          size={isMobileView ? 'small' : 'default'}
        />
      </div>
    </Card>
  );
};

export default SEOPreview;