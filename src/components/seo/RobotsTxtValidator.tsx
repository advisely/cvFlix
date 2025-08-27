'use client'

import React from 'react';
import { 
  Card, 
  Alert, 
  List, 
  Typography, 
  Space, 
  Tag, 
  Badge,
  Row,
  Col,
  Divider,
  Progress,
  Button,
  Collapse,
  Tooltip
} from 'antd';
import { 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { validateRobotsContent, ROBOTS_RECOMMENDATIONS, type RobotsValidationError } from './utils/robots-utils';

const { Text, Title, Paragraph } = Typography;
// Removed deprecated Panel import - using items API instead

interface RobotsTxtValidatorProps {
  content: string;
  onValidationChange?: (isValid: boolean, errors: RobotsValidationError[], warnings: RobotsValidationError[]) => void;
}

const RobotsTxtValidator: React.FC<RobotsTxtValidatorProps> = ({ 
  content, 
  onValidationChange 
}) => {
  const validationResult = validateRobotsContent(content);
  
  const errors = validationResult.detailedErrors.filter(e => e.severity === 'error');
  const warnings = validationResult.detailedErrors.filter(e => e.severity === 'warning');

  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationResult.isValid, errors, warnings);
    }
  }, [validationResult.isValid, errors, warnings, onValidationChange]);

  // Calculate validation score
  const calculateValidationScore = () => {
    const totalIssues = errors.length + warnings.length;
    const maxDeductions = 100;
    const errorWeight = 15; // Errors deduct more points
    const warningWeight = 5; // Warnings deduct fewer points
    
    const deductions = (errors.length * errorWeight) + (warnings.length * warningWeight);
    const score = Math.max(0, 100 - Math.min(deductions, maxDeductions));
    
    return score;
  };

  const validationScore = calculateValidationScore();

  // Get score status
  const getScoreStatus = (score: number) => {
    if (score >= 90) return { status: 'success' as const, text: 'Excellent' };
    if (score >= 70) return { status: 'normal' as const, text: 'Good' };
    if (score >= 50) return { status: 'warning' as const, text: 'Fair' };
    return { status: 'exception' as const, text: 'Poor' };
  };

  const scoreStatus = getScoreStatus(validationScore);

  // Group errors by type
  const groupErrorsByType = (errorList: RobotsValidationError[]) => {
    const groups: Record<string, RobotsValidationError[]> = {};
    errorList.forEach(error => {
      if (!groups[error.type]) groups[error.type] = [];
      groups[error.type].push(error);
    });
    return groups;
  };

  const errorGroups = groupErrorsByType(errors);
  const warningGroups = groupErrorsByType(warnings);

  // Get icon for error type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <SecurityScanOutlined style={{ color: '#ff4d4f' }} />;
      case 'syntax': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'seo': return <SearchOutlined style={{ color: '#faad14' }} />;
      case 'format': return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default: return <WarningOutlined />;
    }
  };

  // Get tag color for error type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'red';
      case 'syntax': return 'red';
      case 'seo': return 'orange';
      case 'format': return 'blue';
      default: return 'default';
    }
  };

  return (
    <div className="robots-txt-validator">
      <Row gutter={[16, 16]}>
        {/* Validation Score */}
        <Col span={24}>
          <Card size="small">
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Validation Score</Text>
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      Based on errors and warnings found
                    </Text>
                  </div>
                  <Progress 
                    percent={validationScore} 
                    status={scoreStatus.status}
                    format={() => `${validationScore}% ${scoreStatus.text}`}
                  />
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Issues</Text>
                  <Space>
                    <Badge count={errors.length} status="error" />
                    <Badge count={warnings.length} status="warning" />
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Overall Status */}
        <Col span={24}>
          {validationResult.isValid ? (
            <Alert
              type="success"
              message="Valid Robots.txt"
              description={
                warnings.length > 0 
                  ? `Your robots.txt is syntactically valid with ${warnings.length} recommendation${warnings.length > 1 ? 's' : ''} for improvement.`
                  : "Your robots.txt is valid and follows best practices!"
              }
              icon={<CheckCircleOutlined />}
              showIcon
            />
          ) : (
            <Alert
              type="error"
              message={`${errors.length} Error${errors.length > 1 ? 's' : ''} Found`}
              description={`Please fix the following issues before using this robots.txt file.${warnings.length > 0 ? ` Also found ${warnings.length} recommendation${warnings.length > 1 ? 's' : ''}.` : ''}`}
              icon={<ExclamationCircleOutlined />}
              showIcon
            />
          )}
        </Col>

        {/* Errors Section */}
        {errors.length > 0 && (
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  <Text strong>Errors ({errors.length})</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Must be fixed</Text>
                </Space>
              }
              size="small"
            >
              {Object.entries(errorGroups).map(([type, typeErrors]) => (
                <div key={type} style={{ marginBottom: '16px' }}>
                  <Space style={{ marginBottom: '8px' }}>
                    {getTypeIcon(type)}
                    <Text strong style={{ textTransform: 'capitalize' }}>{type} Issues</Text>
                    <Tag color={getTypeColor(type)}>{typeErrors.length}</Tag>
                  </Space>
                  <List
                    size="small"
                    dataSource={typeErrors}
                    renderItem={(error) => (
                      <List.Item style={{ paddingLeft: '24px' }}>
                        <List.Item.Meta
                          title={
                            <Space>
                              {error.line > 0 && <Tag>Line {error.line}</Tag>}
                              <Text type="danger">{error.message}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ))}
            </Card>
          </Col>
        )}

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <Text strong>Recommendations ({warnings.length})</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Consider addressing</Text>
                </Space>
              }
              size="small"
            >
              {Object.entries(warningGroups).map(([type, typeWarnings]) => (
                <div key={type} style={{ marginBottom: '16px' }}>
                  <Space style={{ marginBottom: '8px' }}>
                    {getTypeIcon(type)}
                    <Text strong style={{ textTransform: 'capitalize' }}>{type} Recommendations</Text>
                    <Tag color={getTypeColor(type)}>{typeWarnings.length}</Tag>
                  </Space>
                  <List
                    size="small"
                    dataSource={typeWarnings}
                    renderItem={(warning) => (
                      <List.Item style={{ paddingLeft: '24px' }}>
                        <List.Item.Meta
                          title={
                            <Space>
                              {warning.line > 0 && <Tag color="orange">Line {warning.line}</Tag>}
                              <Text>{warning.message}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ))}
            </Card>
          </Col>
        )}

        {/* Best Practices Recommendations */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <BulbOutlined style={{ color: '#1890ff' }} />
                <Text strong>Best Practices Guide</Text>
              </Space>
            }
            size="small"
          >
            <Collapse 
              size="small"
              items={[
                {
                  key: 'basic',
                  label: (
                    <Space>
                      <InfoCircleOutlined />
                      <Text>Basic Configuration</Text>
                    </Space>
                  ),
                  children: (
                    <List
                      size="small"
                      dataSource={ROBOTS_RECOMMENDATIONS.BASIC}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  )
                },
                {
                  key: 'security',
                  label: (
                    <Space>
                      <SecurityScanOutlined />
                      <Text>Security Recommendations</Text>
                    </Space>
                  ),
                  children: (
                    <List
                      size="small"
                      dataSource={ROBOTS_RECOMMENDATIONS.SECURITY}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  )
                },
                {
                  key: 'performance',
                  label: (
                    <Space>
                      <ThunderboltOutlined />
                      <Text>Performance Optimization</Text>
                    </Space>
                  ),
                  children: (
                    <List
                      size="small"
                      dataSource={ROBOTS_RECOMMENDATIONS.PERFORMANCE}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  )
                },
                {
                  key: 'seo',
                  label: (
                    <Space>
                      <SearchOutlined />
                      <Text>SEO Best Practices</Text>
                    </Space>
                  ),
                  children: (
                    <List
                      size="small"
                      dataSource={ROBOTS_RECOMMENDATIONS.SEO}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>

        {/* Content Analysis */}
        {content && (
          <Col span={24}>
            <Card title="Content Analysis" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Total Lines</Text>
                    <Text strong style={{ fontSize: '18px' }}>{content.split('\n').length}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Directives</Text>
                    <Text strong style={{ fontSize: '18px' }}>
                      {content.split('\n').filter(line => 
                        line.trim() && !line.trim().startsWith('#')
                      ).length}
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Characters</Text>
                    <Text strong style={{ fontSize: '18px' }}>{content.length}</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default RobotsTxtValidator;
