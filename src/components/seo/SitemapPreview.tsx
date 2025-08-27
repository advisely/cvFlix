'use client'

import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Radio, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Progress, 
  Alert,
  message,
  Badge,
  Descriptions,
  Collapse,
  Row,
  Col
} from 'antd';
import {
  CopyOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  EyeOutlined,
  ExpandOutlined,
  CompressOutlined
} from '@ant-design/icons';

import { SitemapEntry, ValidationResult, checkUrlStatus } from './utils/sitemap-utils';
import { SitemapTreeView } from './SitemapTreeView';
import { SitemapTableView } from './SitemapTableView';
import { SitemapXmlView } from './SitemapXmlView';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface UrlStatus {
  status: number;
  statusText: string;
  accessible: boolean;
  responseTime: number;
}

export interface SitemapPreviewProps {
  entries: SitemapEntry[];
  validationResult?: ValidationResult | null;
  onEntryUpdate?: (updatedEntry: SitemapEntry, index: number) => void;
  onBulkUpdate?: (updatedEntries: SitemapEntry[]) => void;
  onValidationRequest?: () => void;
}

export type ViewMode = 'tree' | 'table' | 'xml' | 'validation';

export const SitemapPreview: React.FC<SitemapPreviewProps> = ({
  entries,
  validationResult,
  onEntryUpdate,
  onBulkUpdate,
  onValidationRequest
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [changefreqFilter, setChangefreqFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'url' | 'lastmod' | 'changefreq'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [urlStatuses, setUrlStatuses] = useState<Map<string, UrlStatus>>(new Map());
  const [checkingUrls, setCheckingUrls] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.loc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      if (priorityFilter === 'high') {
        filtered = filtered.filter(entry => (entry.priority || 0) >= 0.8);
      } else if (priorityFilter === 'medium') {
        filtered = filtered.filter(entry => (entry.priority || 0) >= 0.5 && (entry.priority || 0) < 0.8);
      } else if (priorityFilter === 'low') {
        filtered = filtered.filter(entry => (entry.priority || 0) < 0.5);
      }
    }

    // Apply change frequency filter
    if (changefreqFilter !== 'all') {
      filtered = filtered.filter(entry => entry.changefreq === changefreqFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => {
        const status = urlStatuses.get(entry.loc);
        if (!status) return statusFilter === 'unknown';
        if (statusFilter === 'success') return status.accessible;
        if (statusFilter === 'error') return !status.accessible && status.status !== 0;
        if (statusFilter === 'timeout') return status.status === 0;
        return false;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = (a.priority || 0) - (b.priority || 0);
          break;
        case 'url':
          comparison = a.loc.localeCompare(b.loc);
          break;
        case 'lastmod':
          comparison = new Date(a.lastmod).getTime() - new Date(b.lastmod).getTime();
          break;
        case 'changefreq':
          const freqOrder = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
          comparison = freqOrder.indexOf(a.changefreq) - freqOrder.indexOf(b.changefreq);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [entries, searchTerm, priorityFilter, changefreqFilter, statusFilter, sortBy, sortOrder, urlStatuses]);

  // URL status checking
  const checkUrlStatuses = async () => {
    if (entries.length === 0) return;
    
    setCheckingUrls(true);
    const newStatuses = new Map();
    const batchSize = 10;
    
    try {
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const promises = batch.map(async (entry) => {
          const status = await checkUrlStatus(entry.loc);
          newStatuses.set(entry.loc, status);
          return status;
        });
        
        await Promise.allSettled(promises);
        
        // Update state with batch results
        setUrlStatuses(new Map(newStatuses));
      }
      
      const successCount = Array.from(newStatuses.values()).filter(s => s.accessible).length;
      message.success(`URL status check completed! ${successCount}/${entries.length} URLs are accessible.`);
    } catch {
      console.error('Error checking URL statuses');
      message.error('Failed to check URL statuses.');
    } finally {
      setCheckingUrls(false);
    }
  };

  // Copy operations
  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success(`${type} copied to clipboard!`);
    } catch (error) {
      message.error(`Failed to copy ${type.toLowerCase()}.`);
    }
  };

  const copyAllUrls = () => {
    const urls = filteredEntries.map(entry => entry.loc).join('\n');
    copyToClipboard(urls, 'All URLs');
  };

  const copySelectedUrls = () => {
    const selectedUrls = entries
      .filter((_, index) => selectedEntries.includes(index.toString()))
      .map(entry => entry.loc)
      .join('\n');
    copyToClipboard(selectedUrls, 'Selected URLs');
  };

  // Bulk operations
  const bulkUpdatePriority = (priority: number) => {
    if (selectedEntries.length === 0) {
      message.warning('Please select entries to update.');
      return;
    }

    const updatedEntries = entries.map((entry, index) => {
      if (selectedEntries.includes(index.toString())) {
        return { ...entry, priority };
      }
      return entry;
    });

    onBulkUpdate?.(updatedEntries);
    message.success(`Updated priority for ${selectedEntries.length} entries.`);
    setSelectedEntries([]);
  };

  const bulkUpdateChangeFreq = (changefreq: SitemapEntry['changefreq']) => {
    if (selectedEntries.length === 0) {
      message.warning('Please select entries to update.');
      return;
    }

    const updatedEntries = entries.map((entry, index) => {
      if (selectedEntries.includes(index.toString())) {
        return { ...entry, changefreq };
      }
      return entry;
    });

    onBulkUpdate?.(updatedEntries);
    message.success(`Updated change frequency for ${selectedEntries.length} entries.`);
    setSelectedEntries([]);
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    if (priority >= 0.8) return 'red';
    if (priority >= 0.5) return 'orange';
    if (priority >= 0.3) return 'blue';
    return 'default';
  };

  // Get status color and icon
  const getStatusDisplay = (url: string) => {
    const status = urlStatuses.get(url);
    if (!status) {
      return { color: 'default', text: 'Unknown', icon: null };
    }
    
    if (status.accessible) {
      return { 
        color: 'success', 
        text: `${status.status} OK`, 
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      };
    }
    
    if (status.status === 0) {
      return { 
        color: 'error', 
        text: 'Timeout', 
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      };
    }
    
    return { 
      color: 'error', 
      text: `${status.status} Error`, 
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    };
  };

  // Statistics
  const stats = useMemo(() => {
    const total = entries.length;
    const highPriority = entries.filter(e => (e.priority || 0) >= 0.8).length;
    const mediumPriority = entries.filter(e => (e.priority || 0) >= 0.5 && (e.priority || 0) < 0.8).length;
    const lowPriority = entries.filter(e => (e.priority || 0) < 0.5).length;
    
    const accessible = Array.from(urlStatuses.values()).filter(s => s.accessible).length;
    const errors = Array.from(urlStatuses.values()).filter(s => !s.accessible && s.status !== 0).length;
    const timeouts = Array.from(urlStatuses.values()).filter(s => s.status === 0).length;
    
    return {
      total,
      highPriority,
      mediumPriority,
      lowPriority,
      accessible,
      errors,
      timeouts,
      checked: urlStatuses.size
    };
  }, [entries, urlStatuses]);

  return (
    <div className={`sitemap-preview ${isFullscreen ? 'fullscreen' : ''}`}>
      <Card
        title={
          <Space>
            <EyeOutlined />
            <span>Sitemap Preview</span>
            <Badge count={entries.length} showZero />
            {filteredEntries.length !== entries.length && (
              <Text type="secondary">({filteredEntries.length} filtered)</Text>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="small"
            />
            <Radio.Group 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              size="small"
            >
              <Radio.Button value="table">Table</Radio.Button>
              <Radio.Button value="tree">Tree</Radio.Button>
              <Radio.Button value="xml">XML</Radio.Button>
              {validationResult && <Radio.Button value="validation">Validation</Radio.Button>}
            </Radio.Group>
          </Space>
        }
      >
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Total URLs">{stats.total}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={5}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Priority Distribution">
                <Space>
                  <Tag color="red">High: {stats.highPriority}</Tag>
                  <Tag color="orange">Med: {stats.mediumPriority}</Tag>
                  <Tag color="blue">Low: {stats.lowPriority}</Tag>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={5}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Status Check">
                {stats.checked > 0 ? (
                  <Space>
                    <Tag color="green">OK: {stats.accessible}</Tag>
                    <Tag color="red">Errors: {stats.errors}</Tag>
                    <Tag color="orange">Timeout: {stats.timeouts}</Tag>
                  </Space>
                ) : (
                  <Text type="secondary">Not checked</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                icon={<LinkOutlined />}
                onClick={checkUrlStatuses}
                loading={checkingUrls}
                size="small"
              >
                Check URLs
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={copyAllUrls}
                size="small"
              >
                Copy URLs
              </Button>
              {selectedEntries.length > 0 && (
                <Button
                  icon={<CopyOutlined />}
                  onClick={copySelectedUrls}
                  type="primary"
                  size="small"
                >
                  Copy Selected ({selectedEntries.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Filters and Controls */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={3}>
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Priorities</Option>
              <Option value="high">High (≥0.8)</Option>
              <Option value="medium">Medium (0.5-0.8)</Option>
              <Option value="low">Low (&lt;0.5)</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={changefreqFilter}
              onChange={setChangefreqFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Frequencies</Option>
              <Option value="always">Always</Option>
              <Option value="hourly">Hourly</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
              <Option value="never">Never</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="all">All Status</Option>
              <Option value="success">Accessible</Option>
              <Option value="error">Errors</Option>
              <Option value="timeout">Timeouts</Option>
              <Option value="unknown">Unchecked</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as 'priority' | 'url' | 'lastmod' | 'changefreq');
                setSortOrder(order as 'asc' | 'desc');
              }}
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="priority-desc">Priority (High→Low)</Option>
              <Option value="priority-asc">Priority (Low→High)</Option>
              <Option value="url-asc">URL (A→Z)</Option>
              <Option value="url-desc">URL (Z→A)</Option>
              <Option value="lastmod-desc">Last Modified (New→Old)</Option>
              <Option value="lastmod-asc">Last Modified (Old→New)</Option>
              <Option value="changefreq-asc">Change Frequency</Option>
            </Select>
          </Col>
          <Col span={3}>
            {selectedEntries.length > 0 && (
              <Space.Compact style={{ width: '100%' }}>
                <Select
                  placeholder="Bulk Actions"
                  style={{ width: '100%' }}
                  onSelect={(value) => {
                    if (value.startsWith('priority-')) {
                      bulkUpdatePriority(parseFloat(value.split('-')[1]));
                    } else if (value.startsWith('changefreq-')) {
                      bulkUpdateChangeFreq(value.split('-')[1] as SitemapEntry['changefreq']);
                    }
                  }}
                  size="middle"
                >
                  <Select.OptGroup label="Set Priority">
                    <Option value="priority-1.0">High (1.0)</Option>
                    <Option value="priority-0.8">High (0.8)</Option>
                    <Option value="priority-0.5">Medium (0.5)</Option>
                    <Option value="priority-0.3">Low (0.3)</Option>
                  </Select.OptGroup>
                  <Select.OptGroup label="Set Change Frequency">
                    <Option value="changefreq-daily">Daily</Option>
                    <Option value="changefreq-weekly">Weekly</Option>
                    <Option value="changefreq-monthly">Monthly</Option>
                    <Option value="changefreq-yearly">Yearly</Option>
                  </Select.OptGroup>
                </Select>
              </Space.Compact>
            )}
          </Col>
        </Row>

        {/* View Content */}
        {viewMode === 'table' && (
          <SitemapTableView
            entries={filteredEntries}
            urlStatuses={urlStatuses}
            selectedEntries={selectedEntries}
            onSelectionChange={setSelectedEntries}
            onEntryUpdate={onEntryUpdate}
            getPriorityColor={getPriorityColor}
            getStatusDisplay={getStatusDisplay}
          />
        )}

        {viewMode === 'tree' && (
          <SitemapTreeView
            entries={filteredEntries}
            urlStatuses={urlStatuses}
            expandedKeys={expandedKeys}
            onExpandedKeysChange={setExpandedKeys}
            getPriorityColor={getPriorityColor}
            getStatusDisplay={getStatusDisplay}
          />
        )}

        {viewMode === 'xml' && (
          <SitemapXmlView
            entries={filteredEntries}
            validationResult={validationResult}
            onCopyXml={(xml) => copyToClipboard(xml, 'XML Sitemap')}
          />
        )}

        {viewMode === 'validation' && validationResult && (
          <div>
            <Alert
              message={`Validation ${validationResult.isValid ? 'Passed' : 'Failed'}`}
              description={
                validationResult.isValid 
                  ? 'Your sitemap passes all validation checks.' 
                  : `Found ${validationResult.errors.length} errors and ${validationResult.warnings.length} warnings.`
              }
              type={validationResult.isValid ? 'success' : 'error'}
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" onClick={onValidationRequest}>
                  Re-validate
                </Button>
              }
            />

            <Collapse>
              {validationResult.errors.length > 0 && (
                <Panel header={`Errors (${validationResult.errors.length})`} key="errors">
                  <ul>
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>
                        <Text type="danger">{error.message}</Text>
                        {error.line && <Text type="secondary"> (Line {error.line})</Text>}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {validationResult.warnings.length > 0 && (
                <Panel header={`Warnings (${validationResult.warnings.length})`} key="warnings">
                  <ul>
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>
                        <Text type="warning">{warning.message}</Text>
                        {warning.line && <Text type="secondary"> (Line {warning.line})</Text>}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </Collapse>
          </div>
        )}

        {/* Empty State */}
        {filteredEntries.length === 0 && entries.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#999'
          }}>
            <FilterOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Title level={4} type="secondary">No Results Found</Title>
            <Text type="secondary">
              Try adjusting your filters or search terms.
            </Text>
            <br />
            <Button 
              type="link" 
              onClick={() => {
                setSearchTerm('');
                setPriorityFilter('all');
                setChangefreqFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Progress indicator for URL checking */}
        {checkingUrls && (
          <Progress 
            percent={Math.round((urlStatuses.size / entries.length) * 100)} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};