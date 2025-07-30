
'use client'

import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { signOut } from 'next-auth/react';

const { Header, Sider, Content } = Layout;

const BossLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1">
            <span>Dashboard</span>
          </Menu.Item>
          <Menu.Item key="2">
            <span>Experiences</span>
          </Menu.Item>
          <Menu.Item key="3">
            <span>Education</span>
          </Menu.Item>
          <Menu.Item key="4">
            <span>Skills</span>
          </Menu.Item>
          <Menu.Item key="5">
            <span>Certifications</span>
          </Menu.Item>
          <Menu.Item key="99" onClick={() => signOut({ callbackUrl: '/' })}>
            <span>Logout</span>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '0 16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BossLayout;
