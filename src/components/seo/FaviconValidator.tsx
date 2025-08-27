'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card,
  Alert,
  List,
  Typography,
  Progress,
  Row,
  Col,
  Space,
  Tag,
  Button,
  Collapse,
  Divider,
  Tooltip
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  BugOutlined,
  EyeOutlined,
  SafetyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { 
  FaviconSet,
  validateFavicon,
  checkFaviconAccessibility,
  FaviconValidationResult
} from './utils/favicon-utils';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface FaviconValidatorProps {
  faviconSet: FaviconSet;
  onFixIssue?: (issue: string) => void;
  showDetails?: boolean;
}

interface AccessibilityResult {
  hasGoodContrast: boolean;
  contrastRatio: number;
  recommendations: string[];
}

const FaviconValidator: React.FC<FaviconValidatorProps> = ({ 
  faviconSet, 
  onFixIssue,
  showDetails = true 
}) => {
  const [validation, setValidation] = useState<FaviconValidationResult | null>(null);
  const [accessibilityResults, setAccessibilityResults] = useState<Record<string, AccessibilityResult>>({});
  const [validating, setValidating] = useState(false);

  // Validate favicons whenever faviconSet changes
  useEffect(() => {
    const runValidation = async () => {
      setValidating(true);
      
      try {
        // Basic validation
        const basicValidation = validateFavicon(faviconSet);
        setValidation(basicValidation);

        // Accessibility validation for key icons
        const accessibilityChecks: Record<string, AccessibilityResult> = {};
        const keyIcons = ['favicon-32x32', 'apple-touch-icon-180x180', 'android-chrome-192x192'];
        
        for (const iconName of keyIcons) {
          if (faviconSet[iconName]) {
            try {
              const accessibilityResult = await checkFaviconAccessibility(faviconSet[iconName]);
              accessibilityChecks[iconName] = accessibilityResult;
            } catch (error) {
              console.warn(`Failed to check accessibility for ${iconName}:`, error);
            }
          }
        }
        
        setAccessibilityResults(accessibilityChecks);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setValidating(false);
      }
    };

    if (Object.keys(faviconSet).length > 0) {
      runValidation();
    }
  }, [faviconSet]);

  // Calculate overall health score
  const calculateHealthScore = (): number => {
    if (!validation) return 0;

    const totalIssues = validation.errors.length + validation.warnings.length;
    const totalChecks = 10; // Base number of checks we perform
    const score = Math.max(0, Math.round(((totalChecks - totalIssues) / totalChecks) * 100));
    
    return score;
  };

  // Get health status color
  const getHealthColor = (score: number): string => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  // Performance analysis
  const analyzePerformance = () => {
    const totalSize = Object.values(faviconSet).reduce((acc, dataUrl) => {
      return acc + (dataUrl.length * 0.75); // Rough base64 size estimate
    }, 0);

    const averageSize = totalSize / Object.keys(faviconSet).length;
    
    return {
      totalSize: Math.round(totalSize / 1024), // KB
      averageSize: Math.round(averageSize / 1024), // KB
      iconCount: Object.keys(faviconSet).length,
      isOptimal: totalSize < 500000 && averageSize < 50000 // 500KB total, 50KB average
    };
  };

  const performanceStats = analyzePerformance();
  const healthScore = calculateHealthScore();

  if (validating) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Progress type="circle" percent={100} status="active" />
          <div style={{ marginTop: '16px' }}>
            <Text>Validating favicon set...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!validation) {
    return (
      <Card>
        <Alert 
          message="No Validation Data"
          description="Upload a favicon to begin validation"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Overall Health Score */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24} align="middle">
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={healthScore}
                strokeColor={getHealthColor(healthScore)}
                width={80}
              />
              <div style={{ marginTop: '8px' }}>
                <Text strong>Health Score</Text>
              </div>
            </div>
          </Col>
          <Col span={18}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: '16px' }}>
                  Favicon Validation Summary
                </Text>
              </div>
              <Row gutter={16}>
                <Col span={8}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>
                      <Text strong>{Object.keys(faviconSet).length}</Text> icons generated
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space>
                    <CloseCircleOutlined style={{ color: validation.errors.length > 0 ? '#ff4d4f' : '#d9d9d9' }} />
                    <Text>
                      <Text strong>{validation.errors.length}</Text> errors
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space>
                    <WarningOutlined style={{ color: validation.warnings.length > 0 ? '#faad14' : '#d9d9d9' }} />
                    <Text>
                      <Text strong>{validation.warnings.length}</Text> warnings
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Critical Errors */}
      {validation.errors.length > 0 && (
        <Alert
          message="Critical Issues Found"
          description={`${validation.errors.length} critical issues need to be resolved for proper favicon functionality.`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" danger>
              Fix Issues
            </Button>
          }
        />
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert
          message="Optimization Opportunities"
          description={`${validation.warnings.length} recommendations to improve favicon performance and compatibility.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {showDetails && (
        <Row gutter={16}>
          {/* Detailed Validation Results */}
          <Col span={12}>
            <Card title="Validation Details" size="small">
              <Collapse size="small">
                {/* Errors */}
                {validation.errors.length > 0 && (
                  <Panel 
                    header={
                      <Space>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        <Text strong>Critical Errors ({validation.errors.length})</Text>
                      </Space>
                    }
                    key="errors"
                  >
                    <List
                      size="small"
                      dataSource={validation.errors}
                      renderItem={(error) => (
                        <List.Item 
                          actions={onFixIssue ? [
                            <Button 
                              key="fix"
                              type="link" 
                              size="small"
                              onClick={() => onFixIssue(error)}
                            >
                              Fix
                            </Button>
                          ] : []}
                        >
                          <List.Item.Meta
                            avatar={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                            description={error}
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                  <Panel 
                    header={
                      <Space>
                        <WarningOutlined style={{ color: '#faad14' }} />
                        <Text strong>Warnings ({validation.warnings.length})</Text>
                      </Space>
                    }
                    key="warnings"
                  >
                    <List
                      size="small"
                      dataSource={validation.warnings}
                      renderItem={(warning) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<WarningOutlined style={{ color: '#faad14' }} />}
                            description={warning}
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                )}

                {/* Recommendations */}
                {validation.recommendations.length > 0 && (
                  <Panel 
                    header={
                      <Space>
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                        <Text strong>Recommendations ({validation.recommendations.length})</Text>
                      </Space>
                    }
                    key="recommendations"
                  >
                    <List
                      size="small"
                      dataSource={validation.recommendations}
                      renderItem={(recommendation) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
                            description={recommendation}
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                )}
              </Collapse>
            </Card>
          </Col>

          {/* Performance & Accessibility */}
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Performance Stats */}
              <Card title="Performance Analysis" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Total Size</Text>
                      <div>
                        <Text strong style={{ fontSize: '18px' }}>
                          {performanceStats.totalSize}KB
                        </Text>
                      </div>
                      <Tag color={performanceStats.totalSize < 500 ? 'green' : 'orange'}>
                        {performanceStats.totalSize < 500 ? 'Optimal' : 'Large'}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Average Size</Text>
                      <div>
                        <Text strong style={{ fontSize: '18px' }}>
                          {performanceStats.averageSize}KB
                        </Text>
                      </div>
                      <Tag color={performanceStats.averageSize < 50 ? 'green' : 'orange'}>
                        {performanceStats.averageSize < 50 ? 'Good' : 'Heavy'}
                      </Tag>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Accessibility Results */}
              {Object.keys(accessibilityResults).length > 0 && (
                <Card title="Accessibility Check" size="small">
                  <List
                    size="small"
                    dataSource={Object.entries(accessibilityResults)}
                    renderItem={([iconName, result]) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              {faviconSet[iconName] && (
                                <img 
                                  src={faviconSet[iconName]} 
                                  alt={iconName} 
                                  width="24" 
                                  height="24"
                                />
                              )}
                            </div>
                          }
                          title={
                            <Space>
                              <Text style={{ fontSize: '12px' }}>{iconName}</Text>
                              <Tag 
                                color={result.hasGoodContrast ? 'green' : 'red'}
                                icon={result.hasGoodContrast ? <CheckCircleOutlined /> : <EyeOutlined />}
                              >
                                {result.hasGoodContrast ? 'Good Contrast' : 'Poor Contrast'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <div>
                              <Text style={{ fontSize: '11px' }}>
                                Contrast Ratio: {result.contrastRatio.toFixed(1)}:1
                              </Text>
                              {result.recommendations.length > 0 && (
                                <div style={{ marginTop: '4px' }}>
                                  {result.recommendations.map((rec, index) => (
                                    <div key={index}>
                                      <Text type="secondary" style={{ fontSize: '10px' }}>
                                        • {rec}
                                      </Text>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      )}

      {/* Success State */}
      {validation.errors.length === 0 && validation.warnings.length === 0 && (
        <Alert
          message="All Good!"
          description="Your favicon set passes all validation checks and is ready for deployment."
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default FaviconValidator;
