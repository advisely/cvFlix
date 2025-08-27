'use client'

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Empty, Button, Space, Tag, Progress, Alert } from 'antd';
import { 
  LineChartOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SEOMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  averagePosition: number;
  keywordRankings: KeywordRanking[];
  topPages: PageMetric[];
  searchQueries: SearchQuery[];
}

interface KeywordRanking {
  keyword: string;
  position: number;
  change: number;
  clicks: number;
  impressions: number;
}

interface PageMetric {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const SEOAnalyticsPage = () => {
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchSEOAnalytics();
  }, [dateRange]);

  const fetchSEOAnalytics = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Google Search Console API
      // For now, we'll simulate the data
      const mockData: SEOMetrics = {
        totalClicks: 0,
        totalImpressions: 0,
        averageCTR: 0,
        averagePosition: 0,
        keywordRankings: [],
        topPages: [],
        searchQueries: []
      };

      setSeoMetrics(mockData);
    } catch (error) {
      console.error('Error fetching SEO analytics:', error);
      setSeoMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const keywordColumns = [
    {
      title: 'Keyword',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (keyword: string) => <Text strong>{keyword}</Text>
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position: number) => (
        <Tag color={position <= 10 ? 'green' : position <= 30 ? 'orange' : 'red'}>
          #{position}
        </Tag>
      )
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <span style={{ color: change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#666' }}>
          {change > 0 && <RiseOutlined />}
          {change < 0 && <FallOutlined />}
          {change !== 0 && ` ${Math.abs(change)}`}
          {change === 0 && '—'}
        </span>
      )
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      key: 'clicks'
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      key: 'impressions'
    }
  ];

  const pageColumns = [
    {
      title: 'Page',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Text code ellipsis style={{ maxWidth: '200px' }}>
          {url}
        </Text>
      )
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      key: 'clicks'
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      key: 'impressions'
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (ctr: number) => `${(ctr * 100).toFixed(2)}%`
    },
    {
      title: 'Avg Position',
      dataIndex: 'position',
      key: 'position',
      render: (position: number) => position.toFixed(1)
    }
  ];

  const queryColumns = [
    {
      title: 'Search Query',
      dataIndex: 'query',
      key: 'query',
      render: (query: string) => <Text strong>{query}</Text>
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      key: 'clicks'
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      key: 'impressions'
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (ctr: number) => `${(ctr * 100).toFixed(2)}%`
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position: number) => position.toFixed(1)
    }
  ];

  if (!seoMetrics) {
    return (
      <div className="seo-analytics">
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <div>
              <h2 style={{ margin: '0 0 8px 0' }}>SEO Analytics</h2>
              <Text type="secondary">
                Monitor your search engine performance and rankings
              </Text>
            </div>
          </Col>

          <Col span={24}>
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size="small">
                    <Text>No SEO analytics data available</Text>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Connect Google Search Console to view performance metrics
                    </Text>
                  </Space>
                }
              >
                <Alert
                  message="Google Search Console Integration Required"
                  description={
                    <div>
                      <p>To view SEO analytics, you need to:</p>
                      <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>
                        <li>Set up Google Search Console for your domain</li>
                        <li>Verify your website ownership</li>
                        <li>Configure API access in your application</li>
                        <li>Add your Search Console API credentials</li>
                      </ol>
                      <p>
                        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                          Get started with Google Search Console →
                        </a>
                      </p>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ textAlign: 'left' }}
                />
              </Empty>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="seo-analytics">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0' }}>SEO Analytics</h2>
              <Text type="secondary">
                Monitor your search engine performance and rankings
              </Text>
            </div>
            <Space>
              <Button onClick={() => fetchSEOAnalytics()} loading={loading}>
                <ReloadOutlined /> Refresh Data
              </Button>
            </Space>
          </div>
        </Col>

        {/* Key Metrics */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Clicks"
              value={seoMetrics.totalClicks}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Impressions"
              value={seoMetrics.totalImpressions}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average CTR"
              value={seoMetrics.averageCTR}
              suffix="%"
              precision={2}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Position"
              value={seoMetrics.averagePosition}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>

        {/* Performance Overview */}
        <Col span={24}>
          <Card title="Performance Overview">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={75}
                    format={() => 'Good'}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>SEO Health</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={60}
                    format={() => 'OK'}
                    strokeColor="#faad14"
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Click Rate</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={85}
                    format={() => 'Great'}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Visibility</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Keyword Rankings */}
        <Col span={24}>
          <Card title="Keyword Rankings" extra={<Text type="secondary">Top performing keywords</Text>}>
            <Table
              columns={keywordColumns}
              dataSource={seoMetrics.keywordRankings}
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No keyword data available yet' }}
            />
          </Card>
        </Col>

        {/* Top Pages */}
        <Col span={12}>
          <Card title="Top Pages" extra={<Text type="secondary">Best performing pages</Text>}>
            <Table
              columns={pageColumns}
              dataSource={seoMetrics.topPages}
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="small"
              locale={{ emptyText: 'No page data available yet' }}
            />
          </Card>
        </Col>

        {/* Search Queries */}
        <Col span={12}>
          <Card title="Search Queries" extra={<Text type="secondary">What users are searching for</Text>}>
            <Table
              columns={queryColumns}
              dataSource={seoMetrics.searchQueries}
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="small"
              locale={{ emptyText: 'No search query data available yet' }}
            />
          </Card>
        </Col>

        {/* SEO Recommendations */}
        <Col span={24}>
          <Card title="SEO Recommendations">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Improve Meta Descriptions"
                description="Several pages are missing meta descriptions. Add compelling descriptions to improve click-through rates."
                type="warning"
                showIcon
              />
              <Alert
                message="Optimize Page Titles"
                description="Some page titles are too long or not descriptive enough. Keep titles under 60 characters."
                type="info"
                showIcon
              />
              <Alert
                message="Add Structured Data"
                description="Implement JSON-LD structured data to help search engines understand your content better."
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SEOAnalyticsPage;
