'use client'

import React, { useMemo } from 'react';
import { Tree, Tag, Space, Typography, Tooltip, Badge } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import { SitemapEntry } from './utils/sitemap-utils';

const { Text } = Typography;

interface UrlStatus {
  status: number;
  statusText: string;
  accessible: boolean;
  responseTime: number;
}

export interface SitemapTreeViewProps {
  entries: SitemapEntry[];
  urlStatuses: Map<string, UrlStatus>;
  expandedKeys: string[];
  onExpandedKeysChange: (keys: string[]) => void;
  getPriorityColor: (priority: number) => string;
  getStatusDisplay: (url: string) => { color: string; text: string; icon: React.ReactNode };
}

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  icon?: React.ReactNode;
  entry?: SitemapEntry;
}

export const SitemapTreeView: React.FC<SitemapTreeViewProps> = ({
  entries,
  urlStatuses,
  expandedKeys,
  onExpandedKeysChange,
  getPriorityColor,
  getStatusDisplay
}) => {
  // Build hierarchical tree structure from URLs
  const treeData = useMemo(() => {
    const root: TreeNode = {
      key: 'root',
      title: 'Site Root',
      children: [],
      icon: <GlobalOutlined />
    };

    const pathMap = new Map<string, TreeNode>();
    pathMap.set('root', root);

    // Sort entries by URL to ensure consistent tree structure
    const sortedEntries = [...entries].sort((a, b) => a.loc.localeCompare(b.loc));

    sortedEntries.forEach((entry, index) => {
      try {
        const url = new URL(entry.loc);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        
        let currentPath = 'root';
        let currentNode = root;

        // Build path hierarchy
        pathSegments.forEach((segment, segmentIndex) => {
          const segmentPath = `${currentPath}/${segment}`;
          
          if (!pathMap.has(segmentPath)) {
            const isLastSegment = segmentIndex === pathSegments.length - 1;
            const newNode: TreeNode = {
              key: segmentPath,
              title: isLastSegment ? (
                <SitemapEntryTitle 
                  entry={entry}
                  segment={segment}
                  url={entry.loc}
                  urlStatuses={urlStatuses}
                  getPriorityColor={getPriorityColor}
                  getStatusDisplay={getStatusDisplay}
                />
              ) : (
                <Space>
                  <span>{segment}</span>
                  <Text type="secondary" style={{ fontSize: '11px' }}>folder</Text>
                </Space>
              ),
              children: isLastSegment ? undefined : [],
              isLeaf: isLastSegment,
              icon: isLastSegment ? <FileOutlined /> : <FolderOutlined />,
              entry: isLastSegment ? entry : undefined
            };

            pathMap.set(segmentPath, newNode);
            currentNode.children?.push(newNode);
          }

          currentNode = pathMap.get(segmentPath)!;
          currentPath = segmentPath;
        });

        // Handle root path entries (like homepage)
        if (pathSegments.length === 0) {
          const homeNode: TreeNode = {
            key: `home-${index}`,
            title: (
              <SitemapEntryTitle 
                entry={entry}
                segment="Homepage"
                url={entry.loc}
                urlStatuses={urlStatuses}
                getPriorityColor={getPriorityColor}
                getStatusDisplay={getStatusDisplay}
              />
            ),
            isLeaf: true,
            icon: <FileOutlined />,
            entry
          };
          root.children?.push(homeNode);
        }

      } catch {
        // Handle invalid URLs gracefully
        const errorNode: TreeNode = {
          key: `error-${index}`,
          title: (
            <Space>
              <Text type="danger">Invalid URL: {entry.loc}</Text>
              <Tag color="red" size="small">Error</Tag>
            </Space>
          ),
          isLeaf: true,
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          entry
        };
        root.children?.push(errorNode);
      }
    });

    // Sort children at each level
    const sortNodeChildren = (node: TreeNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          // Folders first, then files
          if (!a.isLeaf && b.isLeaf) return -1;
          if (a.isLeaf && !b.isLeaf) return 1;
          
          // Within the same type, sort by key
          return a.key.localeCompare(b.key);
        });
        
        node.children.forEach(sortNodeChildren);
      }
    };

    sortNodeChildren(root);
    return [root];
  }, [entries, urlStatuses, getPriorityColor, getStatusDisplay]);

  const handleExpand = (expandedKeys: React.Key[]) => {
    onExpandedKeysChange(expandedKeys as string[]);
  };

  return (
    <div className="sitemap-tree-view">
      <Tree
        treeData={treeData}
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
        showIcon
        showLine={{ showLeafIcon: false }}
        defaultExpandAll={false}
        style={{ fontSize: '13px' }}
        height={400}
        virtual
      />
      
      {/* Legend */}
      <div style={{ 
        marginTop: 16, 
        padding: '12px 16px', 
        background: '#fafafa', 
        borderRadius: '6px',
        border: '1px solid #f0f0f0'
      }}>
        <Text strong style={{ fontSize: '12px', marginBottom: 8, display: 'block' }}>
          Legend:
        </Text>
        <Space wrap size="large">
          <Space size="small">
            <FolderOutlined style={{ color: '#1890ff' }} />
            <Text style={{ fontSize: '11px' }}>Directory</Text>
          </Space>
          <Space size="small">
            <FileOutlined style={{ color: '#52c41a' }} />
            <Text style={{ fontSize: '11px' }}>Page</Text>
          </Space>
          <Space size="small">
            <Tag color="red" size="small">High</Tag>
            <Tag color="orange" size="small">Medium</Tag>
            <Tag color="blue" size="small">Low</Tag>
            <Text style={{ fontSize: '11px' }}>Priority</Text>
          </Space>
          <Space size="small">
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <Text style={{ fontSize: '11px' }}>Status</Text>
          </Space>
        </Space>
      </div>
    </div>
  );
};

// Component for rendering individual sitemap entry titles
const SitemapEntryTitle: React.FC<{
  entry: SitemapEntry;
  segment: string;
  url: string;
  urlStatuses: Map<string, UrlStatus>;
  getPriorityColor: (priority: number) => string;
  getStatusDisplay: (url: string) => { color: string; text: string; icon: React.ReactNode };
}> = ({ entry, segment, url, getPriorityColor, getStatusDisplay }) => {
  const statusDisplay = getStatusDisplay(url);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{ fontSize: '13px' }}>
          {segment}
        </Text>
      </span>
      
      <Space size="small">
        {/* Priority Tag */}
        <Tag 
          color={getPriorityColor(entry.priority)} 
          size="small"
          style={{ minWidth: 35, textAlign: 'center', fontSize: '10px' }}
        >
          {entry.priority.toFixed(1)}
        </Tag>
        
        {/* Change Frequency */}
        <Tooltip title={`Change Frequency: ${entry.changefreq}`}>
          <Badge 
            count={entry.changefreq.slice(0, 1).toUpperCase()} 
            size="small"
            style={{ 
              backgroundColor: getChangeFreqColor(entry.changefreq),
              fontSize: '9px',
              minWidth: 16,
              height: 16,
              lineHeight: '16px'
            }}
          />
        </Tooltip>
        
        {/* Status Icon */}
        <Tooltip title={`Status: ${statusDisplay.text}`}>
          <span style={{ fontSize: '12px' }}>
            {statusDisplay.icon}
          </span>
        </Tooltip>
        
        {/* Last Modified */}
        <Tooltip title={`Last Modified: ${new Date(entry.lastmod).toLocaleDateString()}`}>
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '10px',
              width: 60,
              textAlign: 'right'
            }}
          >
            {formatRelativeDate(entry.lastmod)}
          </Text>
        </Tooltip>
      </Space>
    </div>
  );
};

// Helper function to get change frequency color
const getChangeFreqColor = (changefreq: string): string => {
  const colors: Record<string, string> = {
    'always': '#ff4d4f',
    'hourly': '#fa8c16',
    'daily': '#faad14',
    'weekly': '#52c41a',
    'monthly': '#1890ff',
    'yearly': '#722ed1',
    'never': '#8c8c8c'
  };
  return colors[changefreq] || '#d9d9d9';
};

// Helper function to format relative date
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};