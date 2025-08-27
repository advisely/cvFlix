'use client'

import { Row, Col, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import SEOHealthCard from '@/components/seo/SEOHealthCard';

const SEOOverview = () => {
  return (
    <div className="seo-overview">
      <Row gutter={[24, 24]}>
        {/* SEO Health Dashboard */}
        <Col span={24}>
          <SEOHealthCard />
        </Col>

        {/* SEO Tips */}
        <Col span={24}>
          <Alert
            message="SEO Optimization Tips"
            description={
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Ensure each page has unique meta titles and descriptions</li>
                <li>Use structured data to help search engines understand your content</li>
                <li>Keep your sitemap updated with all important pages</li>
                <li>Monitor your search engine rankings and click-through rates</li>
                <li>Optimize for both desktop and mobile search experiences</li>
                <li>Optimize title length (50-60 characters) and description length (150-160 characters)</li>
                <li>Use relevant keywords naturally in your content</li>
                <li>Ensure your site loads quickly and is mobile-friendly</li>
              </ul>
            }
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        </Col>
      </Row>
    </div>
  );
};

export default SEOOverview;
