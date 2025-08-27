'use client'

import React, { useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Tooltip, 
  InputNumber, 
  Select, 
  Popover,
  Progress,
  message
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LinkOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';

import { SitemapEntry } from './utils/sitemap-utils';

const { Text, Link } = Typography;
const { Option } = Select;

interface UrlStatus {
  status: number;
  statusText: string;
  accessible: boolean;
  responseTime: number;
}

export interface SitemapTableViewProps {
  entries: SitemapEntry[];
  urlStatuses: Map<string, UrlStatus>;
  selectedEntries: string[];
  onSelectionChange: (selectedRowKeys: string[]) => void;
  onEntryUpdate?: (updatedEntry: SitemapEntry, index: number) => void;
  getPriorityColor: (priority: number) => string;
  getStatusDisplay: (url: string) => { color: string; text: string; icon: React.ReactNode };
}

export const SitemapTableView: React.FC<SitemapTableViewProps> = ({
  entries,
  urlStatuses,
  selectedEntries,
  onSelectionChange,
  onEntryUpdate,
  getPriorityColor,
  getStatusDisplay
}) => {
  const [editingKey, setEditingKey] = useState<string>('');
  const [editingValues, setEditingValues] = useState<Partial<SitemapEntry>>({});

  const isEditing = (record: SitemapEntry, index: number) => index.toString() === editingKey;

  const edit = (record: SitemapEntry, index: number) => {
    setEditingKey(index.toString());
    setEditingValues({
      priority: record.priority,
      changefreq: record.changefreq
    });
  };

  const save = async (record: SitemapEntry, index: number) => {
    try {
      if (editingValues.priority !== undefined && (editingValues.priority < 0 || editingValues.priority > 1)) {
        message.error('Priority must be between 0.0 and 1.0');
        return;
      }

      const updatedEntry: SitemapEntry = {
        ...record,
        priority: editingValues.priority ?? record.priority,
        changefreq: editingValues.changefreq ?? record.changefreq
      };

      onEntryUpdate?.(updatedEntry, index);
      setEditingKey('');
      setEditingValues({});
      message.success('Entry updated successfully');
    } catch {
      message.error('Failed to update entry');
    }
  };

  const cancel = () => {
    setEditingKey('');
    setEditingValues({});
  };

  const rowSelection: TableRowSelection<SitemapEntry> = {
    selectedRowKeys: selectedEntries,
    onChange: onSelectionChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'high-priority',
        text: 'Select High Priority (≥0.8)',
        onSelect: (changeableRowKeys) => {
          const highPriorityKeys = changeableRowKeys.filter((key, index) => {
            const entry = entries[parseInt(key)];
            return entry && entry.priority >= 0.8;
          });
          onSelectionChange(highPriorityKeys as string[]);
        }
      },
      {
        key: 'recent-updates',
        text: 'Select Recently Updated (7 days)',
        onSelect: (changeableRowKeys) => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const recentKeys = changeableRowKeys.filter((key, index) => {
            const entry = entries[parseInt(key)];
            return entry && new Date(entry.lastmod) >= sevenDaysAgo;
          });
          onSelectionChange(recentKeys as string[]);
        }
      }
    ]
  };

  const columns: ColumnsType<SitemapEntry> = [
    {
      title: 'URL',
      dataIndex: 'loc',
      key: 'loc',
      width: '40%',
      ellipsis: true,
      render: (url: string, record, index) => {
        const statusDisplay = getStatusDisplay(url);
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tooltip title={`Status: ${statusDisplay.text}`}>
                <span>{statusDisplay.icon}</span>
              </Tooltip>
              <Link 
                href={url} 
                target="_blank"
                ellipsis
                style={{ flex: 1, minWidth: 0 }}
              >
                {url}
              </Link>
            </div>
            
            {/* Additional URL info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px' }}>
              <Text type="secondary">
                {url.length} chars
              </Text>
              {url.includes('?') && (
                <Tag size="small" color="orange">Query params</Tag>
              )}
              {url.includes('#') && (
                <Tag size="small" color="blue">Fragment</Tag>
              )}
              {url.endsWith('/') && url !== new URL(url).origin + '/' && (
                <Tag size="small" color="green">Directory</Tag>
              )}
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: '12%',
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      render: (priority: number, record, index) => {
        const editing = isEditing(record, index);
        
        return editing ? (
          <InputNumber
            min={0}
            max={1}
            step={0.1}
            precision={1}
            value={editingValues.priority}
            onChange={(value) => setEditingValues({ ...editingValues, priority: value || 0 })}
            style={{ width: 80 }}
          />
        ) : (
          <Tooltip title={`Priority: ${priority} (${getPriorityLevel(priority)})`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tag color={getPriorityColor(priority)} style={{ minWidth: 45, textAlign: 'center' }}>
                {priority.toFixed(1)}
              </Tag>
              <div style={{ width: 40 }}>
                <Progress
                  percent={priority * 100}
                  showInfo={false}
                  size="small"
                  strokeColor={getPriorityProgressColor(priority)}
                />
              </div>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Change Freq',
      dataIndex: 'changefreq',
      key: 'changefreq',
      width: '12%',
      filters: [
        { text: 'Always', value: 'always' },
        { text: 'Hourly', value: 'hourly' },
        { text: 'Daily', value: 'daily' },
        { text: 'Weekly', value: 'weekly' },
        { text: 'Monthly', value: 'monthly' },
        { text: 'Yearly', value: 'yearly' },
        { text: 'Never', value: 'never' }
      ],
      onFilter: (value, record) => record.changefreq === value,
      render: (changefreq: SitemapEntry['changefreq'], record, index) => {
        const editing = isEditing(record, index);
        
        return editing ? (
          <Select
            value={editingValues.changefreq}
            onChange={(value) => setEditingValues({ ...editingValues, changefreq: value })}
            style={{ width: 100 }}
          >
            <Option value="always">Always</Option>
            <Option value="hourly">Hourly</Option>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="yearly">Yearly</Option>
            <Option value="never">Never</Option>
          </Select>
        ) : (
          <Tag color={getChangeFreqColor(changefreq)}>
            {changefreq}
          </Tag>
        );
      }
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastmod',
      key: 'lastmod',
      width: '15%',
      sorter: (a, b) => new Date(a.lastmod).getTime() - new Date(b.lastmod).getTime(),
      render: (lastmod: string) => {
        const date = new Date(lastmod);
        const isRecent = (Date.now() - date.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
        
        return (
          <Space direction="vertical" size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarOutlined style={{ fontSize: '12px', color: '#999' }} />
              <Text style={{ fontSize: '12px' }}>
                {date.toLocaleDateString()}
              </Text>
              {isRecent && <Tag size="small" color="green">Recent</Tag>}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatRelativeTime(lastmod)}
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: '12%',
      render: (_, record) => {
        const status = urlStatuses.get(record.loc);
        if (!status) {
          return <Tag color="default">Unchecked</Tag>;
        }

        const responseTime = status.responseTime;
        const isSlowResponse = responseTime > 3000; // 3 seconds

        return (
          <Popover
            content={
              <div style={{ maxWidth: 200 }}>
                <div><strong>Status:</strong> {status.status}</div>
                <div><strong>Response Time:</strong> {responseTime}ms</div>
                <div><strong>Accessible:</strong> {status.accessible ? 'Yes' : 'No'}</div>
                {status.statusText && (
                  <div><strong>Message:</strong> {status.statusText}</div>
                )}
              </div>
            }
            title="URL Status Details"
          >
            <div>
              <Tag 
                color={status.accessible ? 'success' : 'error'}
                style={{ marginBottom: 2 }}
              >
                {status.accessible ? 'OK' : 'Error'} {status.status}
              </Tag>
              <br />
              <Tag 
                color={isSlowResponse ? 'orange' : 'blue'} 
                size="small"
              >
                {responseTime}ms
              </Tag>
            </div>
          </Popover>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record, index) => {
        const editing = isEditing(record, index);
        
        return editing ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => save(record, index)}
              type="primary"
              size="small"
            />
            <Button
              icon={<CloseOutlined />}
              onClick={cancel}
              size="small"
            />
          </Space>
        ) : (
          <Space>
            <Tooltip title="Edit entry">
              <Button
                icon={<EditOutlined />}
                onClick={() => edit(record, index)}
                size="small"
                type="text"
                disabled={editingKey !== ''}
              />
            </Tooltip>
            <Tooltip title="Visit URL">
              <Button
                icon={<LinkOutlined />}
                onClick={() => window.open(record.loc, '_blank')}
                size="small"
                type="text"
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="sitemap-table-view">
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={entries.map((entry, index) => ({ ...entry, key: index.toString() }))}
        scroll={{ x: 800, y: 400 }}
        size="small"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} URLs`,
          pageSizeOptions: ['10', '25', '50', '100', '200']
        }}
        summary={(pageData) => {
          const totalUrls = pageData.length;
          const avgPriority = pageData.reduce((sum, record) => sum + (record.priority || 0), 0) / totalUrls;
          const accessibleUrls = pageData.filter(record => {
            const status = urlStatuses.get(record.loc);
            return status?.accessible;
          }).length;
          
          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <Text strong>Summary:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text>Avg: {avgPriority.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text>{new Set(pageData.map(r => r.changefreq)).size} types</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text>-</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text>{accessibleUrls}/{totalUrls} OK</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text>{totalUrls} entries</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
      
      {/* Table Footer with Statistics */}
      <div style={{ 
        marginTop: 8, 
        padding: '8px 12px', 
        background: '#fafafa', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
          <Text>
            <BarChartOutlined style={{ marginRight: 4 }} />
            {entries.length} total URLs
          </Text>
          <Text>
            {selectedEntries.length} selected
          </Text>
          <Text>
            Avg Priority: {(entries.reduce((sum, entry) => sum + entry.priority, 0) / entries.length).toFixed(2)}
          </Text>
          <Text>
            {Array.from(urlStatuses.values()).filter(s => s.accessible).length} accessible
          </Text>
        </Space>
      </div>
    </div>
  );
};

// Helper functions
const getPriorityLevel = (priority: number): string => {
  if (priority >= 0.8) return 'High';
  if (priority >= 0.5) return 'Medium';
  if (priority >= 0.3) return 'Low';
  return 'Very Low';
};

const getPriorityProgressColor = (priority: number): string => {
  if (priority >= 0.8) return '#ff4d4f';
  if (priority >= 0.5) return '#faad14';
  if (priority >= 0.3) return '#1890ff';
  return '#d9d9d9';
};

const getChangeFreqColor = (changefreq: string): string => {
  const colors: Record<string, string> = {
    'always': 'red',
    'hourly': 'orange',
    'daily': 'gold',
    'weekly': 'green',
    'monthly': 'blue',
    'yearly': 'purple',
    'never': 'default'
  };
  return colors[changefreq] || 'default';
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};