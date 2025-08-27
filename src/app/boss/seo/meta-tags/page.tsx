'use client'

import { Space, Alert, Card, Typography, Tabs } from 'antd';
import { InfoCircleOutlined, TagOutlined, ShareAltOutlined, GlobalOutlined } from '@ant-design/icons';
import MetaTagManager from '@/components/seo/MetaTagManager';
import SEOConfigForm from '@/components/seo/SEOConfigForm';
import SocialMediaManager from '@/components/seo/SocialMediaManager';

const { Title } = Typography;

const MetaTagsPage = () => {
  const tabItems = [
    {
      key: 'basic',
      label: (
        <span>
          <TagOutlined />
          Basic Meta Tags
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Page-Specific Meta Tags */}
          <MetaTagManager />

          {/* Meta Tags Best Practices */}
          <Alert
            message="Basic Meta Tags Best Practices"
            description={
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li><strong>Title Tags:</strong> Keep under 60 characters, include primary keywords, make each title unique</li>
                <li><strong>Meta Descriptions:</strong> Keep under 160 characters, write compelling summaries, include call-to-action</li>
                <li><strong>Keywords:</strong> Use relevant keywords naturally, avoid keyword stuffing</li>
                <li><strong>Canonical URLs:</strong> Use to prevent duplicate content issues</li>
                <li><strong>Regular Updates:</strong> Review and update meta tags regularly to maintain relevance</li>
              </ul>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </Space>
      )
    },
    {
      key: 'social',
      label: (
        <span>
          <ShareAltOutlined />
          Social Media Tags
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Social Media Meta Tags Management */}
          <SocialMediaManager />

          {/* Social Media Best Practices */}
          <Alert
            message="Social Media Optimization Best Practices"
            description={
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li><strong>OpenGraph Tags:</strong> Essential for Facebook, LinkedIn, and other social platforms</li>
                <li><strong>Twitter Cards:</strong> Optimize for Twitter sharing with proper card types</li>
                <li><strong>Images:</strong> Use high-quality images (1200x630px for most platforms)</li>
                <li><strong>Titles:</strong> Keep OpenGraph titles under 95 characters, Twitter titles under 70</li>
                <li><strong>Descriptions:</strong> OpenGraph descriptions under 300 characters, Twitter under 200</li>
                <li><strong>Testing:</strong> Use social media debuggers to test your tags before publishing</li>
              </ul>
            }
            type="success"
            showIcon
            icon={<GlobalOutlined />}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="meta-tags-management">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Global SEO Configuration */}
        <SEOConfigForm />

        {/* Main Meta Tags Management */}
        <Tabs 
          defaultActiveKey="basic" 
          type="card" 
          size="large"
          items={tabItems}
        />
      </Space>
    </div>
  );
};

export default MetaTagsPage;
