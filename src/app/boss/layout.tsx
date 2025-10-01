"use client";

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Layout, Menu, Button, Spin } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  SkinOutlined,
  StarOutlined,
  LaptopOutlined,
  ReadOutlined,
  FileImageOutlined,
  SearchOutlined,
  RobotOutlined,
  LogoutOutlined,
  BankOutlined,
} from '@ant-design/icons';
import AdminFooter from '@/components/AdminFooter';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/boss', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/boss/appearance', icon: <SkinOutlined />, label: 'Appearance' },
  { key: '/boss/companies', icon: <BankOutlined />, label: 'Companies' },
  { key: '/boss/highlights', icon: <StarOutlined />, label: 'Highlights' },
  { key: '/boss/experiences', icon: <LaptopOutlined />, label: 'Experiences' },
  { key: '/boss/contributions', icon: <LaptopOutlined />, label: 'Contributions' },
  { key: '/boss/recommended-books', icon: <ReadOutlined />, label: 'Recommended Books' },
  { key: '/boss/knowledge', icon: <ReadOutlined />, label: 'Knowledge' },
  { key: '/boss/media', icon: <FileImageOutlined />, label: 'Media' },
  { key: '/boss/seo', icon: <SearchOutlined />, label: 'SEO' },
  { key: '/boss/aio', icon: <RobotOutlined />, label: 'AIO' },
];

type BossLayoutProps = {
  children: ReactNode;
};

const AuthenticatedShell = ({ children }: BossLayoutProps) => {
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
          zIndex: 1000,
        }}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: '32px',
            margin: '16px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          resumeFlex
        </div>
        <Menu
          theme="dark"
          selectedKeys={[pathname]}
          mode="inline"
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.key}>{item.label}</Link>,
          }))}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: 'margin-left 0.2s',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          <div />
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
        <Content
          style={{
            margin: '16px',
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: 24,
              background: '#fff',
              borderRadius: '8px',
              flex: 1,
              overflow: 'auto',
            }}
          >
            {children}
          </div>
        </Content>
        <AdminFooter />
      </Layout>
    </Layout>
  );
};

const BossLayoutInner = ({ children }: BossLayoutProps) => {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <>{children}</>;
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
};

const BossLayout = ({ children }: BossLayoutProps) => (
  <SessionProviderWrapper>
    <BossLayoutInner>{children}</BossLayoutInner>
  </SessionProviderWrapper>
);

export default BossLayout;
