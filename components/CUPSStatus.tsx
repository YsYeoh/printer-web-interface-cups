'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Typography, Space, Spin, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { message } from 'antd';

const { Text, Title } = Typography;

interface PrinterStatus {
  name: string;
  status: string;
  description?: string;
}

interface CUPSStatusData {
  cupsOnline: boolean;
  printers: PrinterStatus[];
  totalPrinters: number;
  onlinePrinters: number;
}

export default function CUPSStatus() {
  const [status, setStatus] = useState<CUPSStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/printers/status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch CUPS status');
      }

      setStatus(data);
    } catch (error) {
      message.error('Failed to load CUPS status');
      console.error(error);
      setStatus({
        cupsOnline: false,
        printers: [],
        totalPrinters: 0,
        onlinePrinters: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
          <div style={{ marginTop: '12px' }}>
            <Text type="secondary">Loading CUPS status...</Text>
          </div>
        </div>
      </Card>
    );
  }

  const cupsStatus = status?.cupsOnline ?? false;
  const printers = status?.printers ?? [];
  const totalPrinters = status?.totalPrinters ?? 0;
  const onlinePrinters = status?.onlinePrinters ?? 0;

  return (
    <Card
      title={
        <Space>
          <PrinterOutlined />
          <span>CUPS Status</span>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={fetchStatus}
          loading={loading}
        >
          Refresh
        </Button>
      }
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        {/* CUPS Online Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>CUPS Service:</Text>
          <Badge
            status={cupsStatus ? 'success' : 'error'}
            text={
              <Space>
                {cupsStatus ? (
                  <>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text type="success">Online</Text>
                  </>
                ) : (
                  <>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <Text type="danger">Offline</Text>
                  </>
                )}
              </Space>
            }
          />
        </div>

        {/* Printer Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Printers:</Text>
          <Space>
            <Text>
              {onlinePrinters} / {totalPrinters} available
            </Text>
            {totalPrinters > 0 && (
              <Badge
                status={onlinePrinters > 0 ? 'success' : 'warning'}
                text={
                  onlinePrinters > 0 ? (
                    <Text type="success">{onlinePrinters} online</Text>
                  ) : (
                    <Text type="warning">None online</Text>
                  )
                }
              />
            )}
          </Space>
        </div>

        {/* Printer List */}
        {printers.length > 0 && (
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Printer Details:
            </Text>
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
              {printers.map((printer) => {
                const isOnline = printer.status === 'idle' || printer.status === 'printing';
                return (
                  <div
                    key={printer.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: '#fafafa',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Text strong>{printer.name}</Text>
                      {printer.description && (
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {printer.description}
                          </Text>
                        </div>
                      )}
                    </div>
                    <Badge
                      status={isOnline ? 'success' : 'default'}
                      text={
                        <Text type={isOnline ? 'success' : 'secondary'} style={{ fontSize: '12px' }}>
                          {printer.status || 'unknown'}
                        </Text>
                      }
                    />
                  </div>
                );
              })}
            </Space>
          </div>
        )}

        {printers.length === 0 && cupsStatus && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            No printers configured. Please configure printers in CUPS.
          </Text>
        )}

        {!cupsStatus && (
          <Text type="danger" style={{ fontSize: '12px' }}>
            CUPS service is not running. Please start CUPS service to enable printing.
          </Text>
        )}
      </Space>
    </Card>
  );
}

