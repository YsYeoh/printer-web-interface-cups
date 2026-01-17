'use client';

import { useRouter } from 'next/navigation';
import { Layout, Button, Space, Typography } from 'antd';
import { LogoutOutlined, PrinterOutlined, MonitorOutlined } from '@ant-design/icons';
import AccountManager from '@/components/AccountManager';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function AccountsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            CUPS Printer Interface
          </Title>
          <Space>
            <Button type="link" href="/print" icon={<PrinterOutlined />}>
              Print
            </Button>
            <Button type="link" href="/cups" icon={<MonitorOutlined />}>
              CUPS Status
            </Button>
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <AccountManager />
      </Content>
    </Layout>
  );
}
