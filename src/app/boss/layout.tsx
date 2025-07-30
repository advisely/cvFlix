
'use client'

import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  LaptopOutlined,
  ReadOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/boss', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/boss/experiences', icon: <LaptopOutlined />, label: 'Experiences' },
  { key: '/boss/education', icon: <ReadOutlined />, label: 'Education' },
  { key: '/boss/skills', icon: <ToolOutlined />, label: 'Skills' },
  { key: '/boss/certifications', icon: <SafetyCertificateOutlined />, label: 'Certifications' },
];

const BossLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="h-8 m-4 bg-gray-700/50 rounded" />
        <Menu theme="dark" selectedKeys={[pathname]} mode="inline">
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link href={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => signOut({ callbackUrl: '/' })}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 'calc(100vh - 112px)', background: '#fff', borderRadius: '8px' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BossLayout;
