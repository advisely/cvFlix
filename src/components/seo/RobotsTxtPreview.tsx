'use client'

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button, 
  Alert, 
  List, 
  Tag,
  Collapse,
  Tooltip,
  Switch,
  Input,
  Divider,
  Badge
} from 'antd';
import { 
  EyeOutlined,
  FileTextOutlined,
  GlobalOutlined,
  RobotOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

interface RobotsTxtPreviewProps {
  content: string;
  siteUrl?: string;
}

interface ParsedDirective {
  userAgent: string;
  rules: {
    type: 'Allow' | 'Disallow';
    path: string;
  }[];
  crawlDelay?: number;
  other: {
    directive: string;
    value: string;
  }[];
}

interface ParsedRobots {
  directives: ParsedDirective[];
  sitemaps: string[];
  comments: string[];
  globalRules: {
    directive: string;
    value: string;
  }[];
}

const RobotsTxtPreview: React.FC<RobotsTxtPreviewProps> = ({
  content,
  siteUrl = 'https://yoursite.com'
}) => {
  const [parsedRobots, setParsedRobots] = useState<ParsedRobots | null>(null);
  const [showRawContent, setShowRawContent] = useState(false);
  const [testUrl, setTestUrl] = useState('/');
  const [testResults, setTestResults] = useState<{ userAgent: string; allowed: boolean; reason: string }[]>([]);

  // Parse robots.txt content
  const parseRobotsContent = (robotsContent: string): ParsedRobots => {
    const lines = robotsContent.split('\n').map(line => line.trim());
    const directives: ParsedDirective[] = [];
    const sitemaps: string[] = [];
    const comments: string[] = [];
    const globalRules: { directive: string; value: string }[] = [];
    
    let currentDirective: ParsedDirective | null = null;

    for (const line of lines) {
      if (!line || line.startsWith('#')) {
        if (line.startsWith('#')) {
          comments.push(line);
        }
        continue;
      }

      const lowerLine = line.toLowerCase();
      
      if (lowerLine.startsWith('user-agent:')) {
        // Save previous directive if exists
        if (currentDirective) {
          directives.push(currentDirective);
        }
        
        // Start new directive
        const userAgent = line.substring(11).trim();
        currentDirective = {
          userAgent,
          rules: [],
          other: []
        };
      } else if (lowerLine.startsWith('sitemap:')) {
        const sitemapUrl = line.substring(8).trim();
        if (sitemapUrl) {
          sitemaps.push(sitemapUrl);
        }
      } else if (currentDirective) {
        // Rules for current user-agent
        if (lowerLine.startsWith('allow:')) {
          const path = line.substring(6).trim();
          currentDirective.rules.push({ type: 'Allow', path });
        } else if (lowerLine.startsWith('disallow:')) {
          const path = line.substring(9).trim();
          currentDirective.rules.push({ type: 'Disallow', path });
        } else if (lowerLine.startsWith('crawl-delay:')) {
          const delay = parseInt(line.substring(12).trim());
          if (!isNaN(delay)) {
            currentDirective.crawlDelay = delay;
          }
        } else {
          // Other directives
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            const directive = line.substring(0, colonIndex);
            const value = line.substring(colonIndex + 1).trim();
            currentDirective.other.push({ directive, value });
          }
        }
      } else {
        // Global rules (not associated with a user-agent)
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const directive = line.substring(0, colonIndex);
          const value = line.substring(colonIndex + 1).trim();
          globalRules.push({ directive, value });
        }
      }
    }

    // Don't forget the last directive
    if (currentDirective) {
      directives.push(currentDirective);
    }

    return { directives, sitemaps, comments, globalRules };
  };

  // Test if a URL is allowed for a specific user-agent
  const testUrlAccess = (url: string, userAgent: string, robots: ParsedRobots) => {
    const relevantDirectives = robots.directives.filter(d => 
      d.userAgent === '*' || d.userAgent.toLowerCase() === userAgent.toLowerCase()
    );

    if (relevantDirectives.length === 0) {
      return { allowed: true, reason: 'No specific rules found' };
    }

    // Check rules in order - most specific first
    const sortedDirectives = relevantDirectives.sort((a, b) => {
      if (a.userAgent === userAgent && b.userAgent === '*') return -1;
      if (a.userAgent === '*' && b.userAgent === userAgent) return 1;
      return 0;
    });

    for (const directive of sortedDirectives) {
      for (const rule of directive.rules) {
        if (pathMatches(url, rule.path)) {
          return {
            allowed: rule.type === 'Allow',
            reason: `${rule.type}: ${rule.path} (${directive.userAgent})`
          };
        }
      }
    }

    return { allowed: true, reason: 'No matching rules (default allow)' };
  };

  // Check if a path matches a robots.txt pattern
  const pathMatches = (url: string, pattern: string): boolean => {
    if (pattern === '' || pattern === '/') {
      return url === '/' || (pattern === '' && url.length > 0);
    }

    // Convert robots.txt pattern to regex
    const regexPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\\\*/g, '.*') // Convert * to .*
      .replace(/\\\$/g, '$'); // $ means end of string

    const regex = new RegExp('^' + regexPattern);
    return regex.test(url);
  };

  // Update parsed robots when content changes
  useEffect(() => {
    if (content) {
      try {
        const parsed = parseRobotsContent(content);
        setParsedRobots(parsed);
      } catch (error) {
        console.error('Error parsing robots.txt:', error);
        setParsedRobots(null);
      }
    } else {
      setParsedRobots(null);
    }
  }, [content]);

  // Test URL access
  useEffect(() => {
    if (parsedRobots && testUrl) {
      const commonUserAgents = ['*', 'Googlebot', 'Bingbot', 'facebookexternalhit', 'Twitterbot'];
      const results = commonUserAgents.map(userAgent => {
        const result = testUrlAccess(testUrl, userAgent, parsedRobots);
        return {
          userAgent,
          allowed: result.allowed,
          reason: result.reason
        };
      });
      setTestResults(results);
    }
  }, [parsedRobots, testUrl]);

  if (!content) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">No robots.txt content to preview</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="robots-txt-preview">
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card size="small">
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <EyeOutlined style={{ fontSize: '16px' }} />
                  <Title level={4} style={{ margin: 0 }}>Robots.txt Preview</Title>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Text type="secondary">View:</Text>
                  <Switch
                    checkedChildren="Raw"
                    unCheckedChildren="Parsed"
                    checked={showRawContent}
                    onChange={setShowRawContent}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {showRawContent ? (
          /* Raw Content View */
          <Col span={24}>
            <Card title="Raw Content" size="small">
              <pre style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '4px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.4',
                overflow: 'auto',
                maxHeight: '500px',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {content}
              </pre>
            </Card>
          </Col>
        ) : (
          /* Parsed Content View */
          parsedRobots && (
            <>
              {/* URL Tester */}
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <GlobalOutlined />
                      <Text strong>URL Access Tester</Text>
                    </Space>
                  } 
                  size="small"
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Text>Test URL:</Text>
                      <Input
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        placeholder="/path/to/test"
                        style={{ width: '300px' }}
                        addonBefore={siteUrl}
                      />
                    </Space>
                    
                    {testResults.length > 0 && (
                      <List
                        size="small"
                        dataSource={testResults}
                        renderItem={(result) => (
                          <List.Item>
                            <Space>
                              <Tag color={result.userAgent === '*' ? 'blue' : 'default'}>
                                {result.userAgent}
                              </Tag>
                              <Badge
                                status={result.allowed ? 'success' : 'error'}
                                text={result.allowed ? 'Allowed' : 'Blocked'}
                              />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {result.reason}
                              </Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    )}
                  </Space>
                </Card>
              </Col>

              {/* User-Agent Directives */}
              {parsedRobots.directives.length > 0 && (
                <Col span={24}>
                  <Card 
                    title={
                      <Space>
                        <RobotOutlined />
                        <Text strong>User-Agent Directives</Text>
                      </Space>
                    }
                    size="small"
                  >
                    <Collapse size="small">
                      {parsedRobots.directives.map((directive, index) => (
                        <Panel 
                          key={index}
                          header={
                            <Space>
                              <Tag color={directive.userAgent === '*' ? 'blue' : 'default'}>
                                {directive.userAgent || 'Unknown'}
                              </Tag>
                              <Text type="secondary">
                                {directive.rules.length} rule{directive.rules.length !== 1 ? 's' : ''}
                                {directive.crawlDelay && (
                                  <span>, {directive.crawlDelay}s delay</span>
                                )}
                              </Text>
                            </Space>
                          }
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {/* Allow/Disallow Rules */}
                            {directive.rules.length > 0 && (
                              <div>
                                <Text strong style={{ fontSize: '12px' }}>Access Rules:</Text>
                                <List
                                  size="small"
                                  dataSource={directive.rules}
                                  renderItem={(rule) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                      <Space>
                                        <Badge
                                          status={rule.type === 'Allow' ? 'success' : 'error'}
                                          text={rule.type}
                                        />
                                        <Text code>{rule.path || '/'}</Text>
                                      </Space>
                                    </List.Item>
                                  )}
                                />
                              </div>
                            )}

                            {/* Crawl Delay */}
                            {directive.crawlDelay && (
                              <div>
                                <Space>
                                  <ClockCircleOutlined />
                                  <Text strong style={{ fontSize: '12px' }}>Crawl Delay:</Text>
                                  <Text>{directive.crawlDelay} second{directive.crawlDelay !== 1 ? 's' : ''}</Text>
                                </Space>
                              </div>
                            )}

                            {/* Other Directives */}
                            {directive.other.length > 0 && (
                              <div>
                                <Text strong style={{ fontSize: '12px' }}>Other Directives:</Text>
                                <List
                                  size="small"
                                  dataSource={directive.other}
                                  renderItem={(item) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                      <Space>
                                        <Text strong>{item.directive}:</Text>
                                        <Text>{item.value}</Text>
                                      </Space>
                                    </List.Item>
                                  )}
                                />
                              </div>
                            )}
                          </Space>
                        </Panel>
                      ))}
                    </Collapse>
                  </Card>
                </Col>
              )}

              {/* Sitemaps */}
              {parsedRobots.sitemaps.length > 0 && (
                <Col span={24}>
                  <Card 
                    title={
                      <Space>
                        <LinkOutlined />
                        <Text strong>Sitemaps</Text>
                        <Tag>{parsedRobots.sitemaps.length}</Tag>
                      </Space>
                    }
                    size="small"
                  >
                    <List
                      size="small"
                      dataSource={parsedRobots.sitemaps}
                      renderItem={(sitemap) => (
                        <List.Item>
                          <Space>
                            <LinkOutlined />
                            <Text code>{sitemap}</Text>
                            {sitemap.startsWith('http') ? (
                              <Button 
                                type="link" 
                                size="small"
                                onClick={() => window.open(sitemap, '_blank')}
                              >
                                Open
                              </Button>
                            ) : (
                              <Tag color="orange">Relative URL</Tag>
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              )}

              {/* Comments */}
              {parsedRobots.comments.length > 0 && (
                <Col span={24}>
                  <Card 
                    title={
                      <Space>
                        <InfoCircleOutlined />
                        <Text strong>Comments</Text>
                        <Tag>{parsedRobots.comments.length}</Tag>
                      </Space>
                    }
                    size="small"
                  >
                    <List
                      size="small"
                      dataSource={parsedRobots.comments}
                      renderItem={(comment) => (
                        <List.Item>
                          <Text type="secondary" style={{ fontFamily: 'monospace' }}>
                            {comment}
                          </Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              )}

              {/* Global Rules */}
              {parsedRobots.globalRules.length > 0 && (
                <Col span={24}>
                  <Alert
                    type="warning"
                    message="Global Rules Detected"
                    description={
                      <div>
                        <Text>The following directives are not associated with a User-agent and may not be processed correctly by crawlers:</Text>
                        <List
                          size="small"
                          dataSource={parsedRobots.globalRules}
                          renderItem={(rule) => (
                            <List.Item>
                              <Text code>{rule.directive}: {rule.value}</Text>
                            </List.Item>
                          )}
                        />
                      </div>
                    }
                    showIcon
                  />
                </Col>
              )}
            </>
          )
        )}
      </Row>
    </div>
  );
};

export default RobotsTxtPreview;
