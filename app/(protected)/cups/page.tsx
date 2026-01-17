'use client';

import { Layout, Typography, Space, Button } from 'antd';
import { LogoutOutlined, UserOutlined, PrinterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CUPSStatus from '@/components/CUPSStatus';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function CUPSPage() {
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
            <Button type="link" href="/admin/accounts" icon={<UserOutlined />}>
              Manage Accounts
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            CUPS Status
          </Title>
          <CUPSStatus />
        </div>
      </Content>
    </Layout>
  );
}

