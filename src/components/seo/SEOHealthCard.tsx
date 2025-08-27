'use client';

import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Typography, 
  Space, 
  Alert, 
  Button, 
  List,
  Tag,
  Statistic,
  Tooltip,
  Spin
} from 'antd';
import { 
  DashboardOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  TrophyOutlined,
  WarningOutlined,
  BugOutlined
} from '@ant-design/icons';
import { useSEOHealth } from './hooks/useSEOHealth';

const { Title, Text } = Typography;

const SEOHealthCard: React.FC = () => {
  const { score, recommendations, loading, error, refreshHealth } = useSEOHealth();

  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue >= 85) return '#52c41a'; // Green - Excellent
    if (scoreValue >= 70) return '#1890ff'; // Blue - Good
    if (scoreValue >= 50) return '#faad14'; // Orange - Fair
    return '#ff4d4f'; // Red - Poor
  };

  const getScoreStatus = (scoreValue: number): string => {
    if (scoreValue >= 85) return 'Excellent';
    if (scoreValue >= 70) return 'Good';
    if (scoreValue >= 50) return 'Fair';
    return 'Needs Work';
  };

  const getScoreIcon = (scoreValue: number) => {
    if (scoreValue >= 85) return <TrophyOutlined style={{ color: '#52c41a' }} />;
    if (scoreValue >= 70) return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
    if (scoreValue >= 50) return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    return <WarningOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getPriorityIcon = (priority: 'critical' | 'important' | 'suggested') => {
    switch (priority) {
      case 'critical':
        return <BugOutlined style={{ color: '#ff4d4f' }} />;
      case 'important':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'suggested':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getPriorityColor = (priority: 'critical' | 'important' | 'suggested'): string => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'important':
        return 'warning';
      case 'suggested':
        return 'processing';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Analyzing SEO health...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Failed to Load SEO Health"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refreshHealth}>
              Try Again
            </Button>
          }
        />
      </Card>
    );
  }

  const allRecommendations = [
    ...recommendations.critical.map(rec => ({ text: rec, priority: 'critical' as const })),
    ...recommendations.important.map(rec => ({ text: rec, priority: 'important' as const })),
    ...recommendations.suggested.map(rec => ({ text: rec, priority: 'suggested' as const }))
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Overall Health Score */}
      <Card>
        <Row gutter={24} align="middle">
          <Col span={16}>
            <div>
              <Title level={3} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DashboardOutlined />
                SEO Health Score
              </Title>
              <Space align="center" size="large">
                <div>
                  <Text type="secondary">Overall Status:</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {getScoreIcon(score.overall)}
                    <Text strong style={{ fontSize: '16px' }}>
                      {getScoreStatus(score.overall)}
                    </Text>
                  </div>
                </div>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={refreshHealth}
                  size="small"
                >
                  Refresh
                </Button>
              </Space>
            </div>
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              percent={score.overall}
              strokeColor={getScoreColor(score.overall)}
              size={120}
              format={(percent) => (
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{percent}%</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Health Score</div>
                </div>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* Score Breakdown */}
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={
                <Tooltip title="Completeness of meta titles, descriptions, and keywords">
                  Meta Tags
                </Tooltip>
              }
              value={score.breakdown.metaTags}
              suffix="%"
              valueStyle={{ color: getScoreColor(score.breakdown.metaTags) }}
            />
            <Progress 
              percent={score.breakdown.metaTags} 
              strokeColor={getScoreColor(score.breakdown.metaTags)}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={
                <Tooltip title="Implementation of structured data markup">
                  Structured Data
                </Tooltip>
              }
              value={score.breakdown.structuredData}
              suffix="%"
              valueStyle={{ color: getScoreColor(score.breakdown.structuredData) }}
            />
            <Progress 
              percent={score.breakdown.structuredData} 
              strokeColor={getScoreColor(score.breakdown.structuredData)}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={
                <Tooltip title="Technical SEO elements like sitemap, robots.txt, SSL">
                  Technical SEO
                </Tooltip>
              }
              value={score.breakdown.technicalSEO}
              suffix="%"
              valueStyle={{ color: getScoreColor(score.breakdown.technicalSEO) }}
            />
            <Progress 
              percent={score.breakdown.technicalSEO} 
              strokeColor={getScoreColor(score.breakdown.technicalSEO)}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={
                <Tooltip title="Content optimization including title and description length">
                  Content Quality
                </Tooltip>
              }
              value={score.breakdown.content}
              suffix="%"
              valueStyle={{ color: getScoreColor(score.breakdown.content) }}
            />
            <Progress 
              percent={score.breakdown.content} 
              strokeColor={getScoreColor(score.breakdown.content)}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Recommendations */}
      {allRecommendations.length > 0 && (
        <Card title="SEO Recommendations" extra={
          <Tag color={getPriorityColor('critical')}>
            {recommendations.critical.length + recommendations.important.length + recommendations.suggested.length} items
          </Tag>
        }>
          <List
            dataSource={allRecommendations}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={getPriorityIcon(item.priority)}
                  title={
                    <Space>
                      <Text>{item.text}</Text>
                      <Tag color={getPriorityColor(item.priority)} size="small">
                        {item.priority}
                      </Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">Great job! No recommendations at this time.</Text>
                  </div>
                </div>
              )
            }}
          />

          {recommendations.critical.length > 0 && (
            <Alert
              message="Critical Issues Found"
              description={`You have ${recommendations.critical.length} critical SEO issues that need immediate attention.`}
              type="error"
              showIcon
              style={{ marginTop: '16px' }}
              action={
                <Button type="link" href="/boss/seo/meta-tags">
                  Fix Now <RightOutlined />
                </Button>
              }
            />
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={16}>
          <Col span={8}>
            <Button 
              type="primary" 
              block 
              href="/boss/seo"
              size="large"
            >
              View Full SEO Dashboard
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              block 
              href="/boss/seo/meta-tags"
              size="large"
            >
              Manage Meta Tags
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              block 
              href="/boss/seo/structured-data"
              size="large"
            >
              Setup Structured Data
            </Button>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default SEOHealthCard;