'use client';

import { Layout, Spin, Typography } from 'antd';

const { Content } = Layout;
const { Text } = Typography;

export default function Loading() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Loading...</Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

