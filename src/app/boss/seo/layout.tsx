'use client'

import { useState } from 'react';
import { Tabs, Card } from 'antd';
import { 
  DashboardOutlined,
  TagOutlined, 
  SettingOutlined, 
  NodeIndexOutlined, 
  BarChartOutlined 
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

interface SEOLayoutProps {
  children: React.ReactNode;
}

const SEOLayout = ({ children }: SEOLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const seoTabs = [
    {
      key: '/boss/seo',
      label: 'Overview',
      icon: <DashboardOutlined />
    },
    {
      key: '/boss/seo/meta-tags',
      label: 'Meta Tags',
      icon: <TagOutlined />
    },
    {
      key: '/boss/seo/technical',
      label: 'Technical',
      icon: <SettingOutlined />
    },
    {
      key: '/boss/seo/structured-data',
      label: 'Structured Data',
      icon: <NodeIndexOutlined />
    },
    {
      key: '/boss/seo/analytics',
      label: 'Analytics',
      icon: <BarChartOutlined />
    }
  ];

  const handleTabChange = (activeKey: string) => {
    router.push(activeKey);
  };

  return (
    <div className="seo-management">
      <div className="seo-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px 0', color: '#1f2937' }}>
          SEO Management
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Optimize your portfolio for search engines and improve visibility
        </p>
      </div>
      
      <Card>
        <Tabs
          activeKey={pathname}
          onChange={handleTabChange}
          items={seoTabs.map(tab => ({
            key: tab.key,
            label: (
              <span>
                {tab.icon}
                {tab.label}
              </span>
            )
          }))}
          tabBarStyle={{ marginBottom: '24px' }}
        />
        
        <div className="seo-content">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default SEOLayout;
