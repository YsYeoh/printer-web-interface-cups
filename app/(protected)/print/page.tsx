'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Card, message, Typography, Space, Alert, Spin } from 'antd';
import { LogoutOutlined, UserOutlined, MonitorOutlined } from '@ant-design/icons';
import FileUpload from '@/components/FileUpload';
import PrinterSelector from '@/components/PrinterSelector';
import PrintConfig from '@/components/PrintConfig';
import PDFPreview from '@/components/PDFPreview';
import { Printer, PrintOptions } from '@/lib/types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function PrintPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<{
    filePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  } | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | undefined>();
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    copies: 1,
    color: 'color',
    paperSize: 'A4',
    orientation: 'portrait',
    scaling: 100,
    quality: 'normal',
    margins: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  });
  const [printing, setPrinting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [cupsOnline, setCupsOnline] = useState<boolean | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const handleFileUploaded = (file: {
    filePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => {
    setSelectedFile(file);
  };

  const handleFileReset = () => {
    setSelectedFile(null);
    message.info('File cleared. You can now upload a new file.');
  };

  const handlePrint = async () => {
    if (!selectedFile) {
      message.error('Please upload a file first');
      return;
    }

    if (!selectedPrinter) {
      message.error('Please select a printer');
      return;
    }

    if (!cupsOnline) {
      message.error('CUPS is not online. Cannot print. Please check CUPS status.');
      return;
    }

    setPrinting(true);

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: selectedFile.filePath,
          printerName: selectedPrinter.name,
          options: printOptions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.error(data.error || 'Print failed');
        return;
      }

      message.success(`Print job submitted successfully! Job ID: ${data.jobId}`);
      
      // Reset form
      setSelectedFile(null);
      setPrintOptions({
        copies: 1,
        color: 'color',
        paperSize: 'A4',
        orientation: 'portrait',
        scaling: 100,
        quality: 'normal',
        margins: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      });
    } catch (error) {
      message.error('An error occurred during printing');
      console.error(error);
    } finally {
      setPrinting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Check CUPS status
  useEffect(() => {
    let isInitialLoad = true;
    
    const checkCupsStatus = async () => {
      try {
        const response = await fetch('/api/printers/status');
        const data = await response.json();
        if (response.ok) {
          setCupsOnline(data.cupsOnline || false);
        } else {
          setCupsOnline(false);
        }
      } catch (error) {
        console.error('Failed to check CUPS status:', error);
        setCupsOnline(false);
      } finally {
        if (isInitialLoad) {
          setPageLoading(false);
          isInitialLoad = false;
        }
      }
    };

    checkCupsStatus();
    // Check every 10 seconds
    const interval = setInterval(checkCupsStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const container = document.getElementById('print-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  if (pageLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
            <Title level={3} style={{ margin: 0 }}>
              CUPS Printer Interface
            </Title>
            <Space>
              <Button type="link" href="/cups" icon={<MonitorOutlined />}>
                CUPS Status
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
        <Content style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">Initializing print page...</Text>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            CUPS Printer Interface
          </Title>
          <Space>
            <Button type="link" href="/cups" icon={<MonitorOutlined />}>
              CUPS Status
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

      <Content style={{ padding: '24px', height: 'calc(100vh - 64px)' }}>
        <div
          id="print-container"
          style={{
            display: 'flex',
            height: '100%',
            gap: 0,
          }}
        >
          {/* Left Column */}
          <div
            style={{
              width: `${leftWidth}%`,
              minWidth: '300px',
              overflowY: 'auto',
              paddingRight: '16px',
            }}
          >
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              {cupsOnline === false && (
                <Alert
                  title="CUPS is Offline"
                  description="CUPS service is not running. Printing is disabled. Please check CUPS status and ensure the service is running."
                  type="error"
                  showIcon
                  action={
                    <Button size="small" href="/cups">
                      Check Status
                    </Button>
                  }
                />
              )}
              <Card title="Upload File">
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  onFileReset={handleFileReset}
                  hasFile={!!selectedFile}
                />
                {selectedFile && (
                  <Alert
                    title={
                      <div>
                        <Text strong>File:</Text> {selectedFile.fileName}
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Size: {(selectedFile.fileSize / 1024).toFixed(2)} KB
                        </Text>
                      </div>
                    }
                    type="success"
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                )}
              </Card>

              <Card title="Printer Selection">
                <PrinterSelector
                  onPrinterSelect={setSelectedPrinter}
                  selectedPrinter={selectedPrinter}
                />
              </Card>

              <Card title="Print Configuration">
                <PrintConfig options={printOptions} onChange={setPrintOptions} />
              </Card>

              <Card>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handlePrint}
                  loading={printing}
                  disabled={!selectedFile || !selectedPrinter || !cupsOnline}
                >
                  {printing ? 'Printing...' : 'Print'}
                </Button>
                {cupsOnline === false && (
                  <Alert
                    title="Printing disabled"
                    description="CUPS must be online to print."
                    type="warning"
                    showIcon
                    style={{ marginTop: '12px' }}
                  />
                )}
              </Card>
            </Space>
          </div>

          {/* Splitter */}
          <div
            style={{
              width: '2px',
              height: '100%',
              backgroundColor: isDragging ? '#1890ff' : '#d9d9d9',
              cursor: 'col-resize',
              flexShrink: 0,
              transition: 'background-color 0.2s',
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={(e) => {
              if (!isDragging) {
                e.currentTarget.style.backgroundColor = '#1890ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDragging) {
                e.currentTarget.style.backgroundColor = '#d9d9d9';
              }
            }}
          />

          {/* Right Column */}
          <div
            style={{
              width: `${100 - leftWidth}%`,
              minWidth: '300px',
              overflowY: 'auto',
            }}
          >
            <Card title="Preview" style={{ height: '100%' }}>
              {selectedFile ? (
                <PDFPreview
                  filePath={selectedFile.filePath}
                  fileName={selectedFile.fileName}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <Text type="secondary">Upload a file to see preview</Text>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

