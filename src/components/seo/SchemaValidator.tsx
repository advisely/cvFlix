'use client';

import React from 'react';
import { Card, List, Typography, Space, Button, Progress, Tag, Divider, Alert, Empty } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  BugOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { ValidationResult } from './utils/schema-utils';

const { Title, Text, Paragraph } = Typography;

interface SchemaValidatorProps {
  validation: ValidationResult | null;
  showDetails?: boolean;
  compact?: boolean;
}

const SchemaValidator: React.FC<SchemaValidatorProps> = ({ 
  validation, 
  showDetails = true, 
  compact = false 
}) => {
  if (!validation) {
    return (
      <Card size={compact ? 'small' : 'default'}>
        <Empty 
          description="No validation data available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const { errors, warnings, isValid, score } = validation;
  const hasIssues = errors.length > 0 || warnings.length > 0;

  // Determine overall status
  const getStatus = () => {
    if (errors.length > 0) return 'error';
    if (warnings.length > 0) return 'warning';
    return 'success';
  };

  const getStatusColor = () => {
    const status = getStatus();
    switch (status) {
      case 'error': return '#f5222d';
      case 'warning': return '#faad14';
      case 'success': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  const getScoreStatus = (): 'success' | 'normal' | 'exception' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'normal';
    return 'exception';
  };

  // Test structured data with Google's Rich Results Test
  const testWithGoogle = () => {
    const testUrl = 'https://search.google.com/test/rich-results';
    window.open(testUrl, '_blank');
  };

  // Test with Schema.org validator
  const testWithSchemaOrg = () => {
    const testUrl = 'https://validator.schema.org/';
    window.open(testUrl, '_blank');
  };

  if (compact) {
    return (
      <div className="schema-validator-compact">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              {getStatus() === 'success' ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : getStatus() === 'warning' ? (
                <WarningOutlined style={{ color: '#faad14' }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
              )}
              <Text strong>
                {isValid ? 'Valid JSON-LD' : 'Validation Issues'}
              </Text>
            </Space>
            <Tag color={getScoreColor()}>Score: {score}/100</Tag>
          </div>
          
          {hasIssues && (
            <Space size="small">
              {errors.length > 0 && (
                <Tag color="error">{errors.length} Error{errors.length > 1 ? 's' : ''}</Tag>
              )}
              {warnings.length > 0 && (
                <Tag color="warning">{warnings.length} Warning{warnings.length > 1 ? 's' : ''}</Tag>
              )}
            </Space>
          )}
        </Space>
      </div>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <BugOutlined />
          <Title level={4} style={{ margin: 0 }}>Schema Validation</Title>
        </Space>
      }
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<GlobalOutlined />}
            onClick={testWithGoogle}
            title="Test with Google Rich Results"
          >
            Google Test
          </Button>
          <Button 
            size="small" 
            icon={<InfoCircleOutlined />}
            onClick={testWithSchemaOrg}
            title="Test with Schema.org Validator"
          >
            Schema.org
          </Button>
        </Space>
      }
    >
      {/* Validation Score */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong>Validation Score</Text>
          <Space>
            <TrophyOutlined style={{ color: getScoreColor() }} />
            <Text strong style={{ color: getScoreColor() }}>{score}/100</Text>
          </Space>
        </div>
        <Progress 
          percent={score} 
          status={getScoreStatus()}
          strokeColor={getScoreColor()}
          showInfo={false}
        />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {score >= 90 && 'Excellent! Your structured data is well-optimized.'}
          {score >= 80 && score < 90 && 'Good! Minor improvements could enhance your schema.'}
          {score >= 60 && score < 80 && 'Needs improvement. Address warnings to optimize further.'}
          {score < 60 && 'Poor. Please fix errors and warnings to improve SEO impact.'}
        </Text>
      </div>

      {/* Overall Status */}
      <Alert
        message={
          <Space>
            {getStatus() === 'success' ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : getStatus() === 'warning' ? (
              <WarningOutlined style={{ color: '#faad14' }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
            )}
            <Text strong>
              {isValid 
                ? 'Valid JSON-LD Structure' 
                : 'JSON-LD Structure Has Issues'
              }
            </Text>
          </Space>
        }
        description={
          isValid 
            ? 'Your structured data follows JSON-LD specifications and should be recognized by search engines.'
            : 'There are issues that need to be addressed for optimal search engine recognition.'
        }
        type={getStatus()}
        style={{ marginBottom: 16 }}
        showIcon
      />

      {/* Errors Section */}
      {errors.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ color: '#f5222d' }}>
              <ExclamationCircleOutlined /> Errors ({errors.length})
            </Title>
            <Paragraph type="secondary">
              These issues must be fixed for valid structured data.
            </Paragraph>
            <List
              size="small"
              dataSource={errors}
              renderItem={(error, index) => (
                <List.Item key={index}>
                  <Space align="start" style={{ width: '100%' }}>
                    <ExclamationCircleOutlined style={{ color: '#f5222d', marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ color: '#f5222d' }}>{error.field}</Text>
                      <br />
                      <Text>{error.message}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ color: '#faad14' }}>
              <WarningOutlined /> Warnings ({warnings.length})
            </Title>
            <Paragraph type="secondary">
              These suggestions can improve your structured data quality and SEO performance.
            </Paragraph>
            <List
              size="small"
              dataSource={warnings}
              renderItem={(warning, index) => (
                <List.Item key={index}>
                  <Space align="start" style={{ width: '100%' }}>
                    <WarningOutlined style={{ color: '#faad14', marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ color: '#faad14' }}>{warning.field}</Text>
                      <br />
                      <Text>{warning.message}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </>
      )}

      {/* Success Message */}
      {!hasIssues && (
        <>
          <Divider />
          <Alert
            message="Perfect Structured Data!"
            description="Your JSON-LD is valid, well-formed, and follows best practices. It should work excellently with search engines."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        </>
      )}

      {/* SEO Impact Information */}
      {showDetails && (
        <>
          <Divider />
          <div>
            <Title level={5}>
              <InfoCircleOutlined /> SEO Impact
            </Title>
            <Paragraph type="secondary">
              Structured data helps search engines understand your content and can enable rich results 
              like enhanced snippets, knowledge panels, and specialized search features.
            </Paragraph>
            
            <Space wrap>
              <Tag color="blue">Rich Snippets</Tag>
              <Tag color="green">Knowledge Graph</Tag>
              <Tag color="purple">Featured Snippets</Tag>
              <Tag color="orange">Search Enhancements</Tag>
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default SchemaValidator;
