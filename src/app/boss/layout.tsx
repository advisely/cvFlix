'use client'

import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminFooter from '@/components/AdminFooter';
import {
  DashboardOutlined,
  SkinOutlined,
  StarOutlined,
  LaptopOutlined,
  ReadOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  FileImageOutlined,
  SearchOutlined,
  RobotOutlined,
  LogoutOutlined,
  BankOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/boss', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/boss/appearance', icon: <SkinOutlined />, label: 'Appearance' },
  { key: '/boss/companies', icon: <BankOutlined />, label: 'Companies' },
  { key: '/boss/highlights', icon: <StarOutlined />, label: 'Highlights' },
  { key: '/boss/experiences', icon: <LaptopOutlined />, label: 'Experiences' },
  { key: '/boss/education', icon: <ReadOutlined />, label: 'Education' },
  { key: '/boss/skills', icon: <ToolOutlined />, label: 'Skills' },
  { key: '/boss/certifications', icon: <SafetyCertificateOutlined />, label: 'Certifications' },
  { key: '/boss/media', icon: <FileImageOutlined />, label: 'Media' },
  { key: '/boss/seo', icon: <SearchOutlined />, label: 'SEO' },
  { key: '/boss/aio', icon: <RobotOutlined />, label: 'AIO' },
];

const BossLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        style={{ 
          overflow: 'auto', 
          height: '100vh', 
          position: 'fixed', 
          left: 0, 
          top: 0, 
          bottom: 0,
          zIndex: 1000
        }}
      >
        <div className="demo-logo-vertical" style={{ height: '32px', margin: '16px', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          resumeFlex
        </div>
        <Menu
          theme="dark"
          selectedKeys={[pathname]}
          mode="inline"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.key}>{item.label}</Link>,
          }))}
        />
      </Sider>
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'margin-left 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0
        }}>
          <div></div>
          <div>
            <Button
              type="default"
              onClick={() => window.open('/', '_blank')}
              style={{ marginRight: '12px' }}
            >
              Preview
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => signOut({ callbackUrl: '/' })}
              icon={<LogoutOutlined />}
            >
              Logout
            </Button>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '16px', 
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: 24, 
            background: '#fff', 
            borderRadius: '8px',
            flex: 1,
            overflow: 'auto'
          }}>
            {children}
          </div>
        </Content>
        
        <AdminFooter />
      </Layout>
    </Layout>
  );
};

export default BossLayout;
