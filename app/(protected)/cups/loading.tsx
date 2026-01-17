'use client';

import Link from 'next/link';
import { Layout, Spin, Typography, Space, Button } from 'antd';
import { LogoutOutlined, UserOutlined, PrinterOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function CUPSLoading() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            CUPS Printer Interface
          </Title>
          <Space>
            <Link href="/print">
              <Button type="link" icon={<PrinterOutlined />}>
                Print
              </Button>
            </Link>
            <Link href="/admin/accounts">
              <Button type="link" icon={<UserOutlined />}>
                Manage Accounts
              </Button>
            </Link>
            <Button type="primary" icon={<LogoutOutlined />} disabled>
              Logout
            </Button>
          </Space>
        </div>
      </Header>
      <Content style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Loading CUPS status...</Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

