'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PDFPreviewProps {
  filePath: string;
  fileName: string;
}

// Create a wrapper component that loads PDF.js from CDN
function PDFDocumentWrapper({ filePath, pageNumber, onLoadSuccess, onLoadError }: {
  filePath: string;
  pageNumber: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    // Load PDF.js from CDN via script tag
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      // Configure worker
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setReady(true);
      } else {
        setError('PDF.js library not loaded');
        onLoadError(new Error('PDF.js library not loaded'));
      }
    };

    script.onerror = () => {
      setError('Failed to load PDF.js');
      onLoadError(new Error('Failed to load PDF.js'));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onLoadError]);

  useEffect(() => {
    if (!ready || !canvasRef.current || !filePath) return;

    const loadPDF = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error('PDF.js not available');
        }

        // Load PDF
        const loadingTask = pdfjsLib.getDocument(`/api/preview?file=${encodeURIComponent(filePath)}`);
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;

        // Get page
        const page = await pdf.getPage(pageNumber);
        
        // Calculate scale to fit container width (larger preview)
        const containerWidth = canvasRef.current?.parentElement?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min((containerWidth - 40) / viewport.width, 2.5); // Max scale 2.5x
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        await page.render(renderContext).promise;

        // Notify parent of success
        onLoadSuccess({ numPages: pdf.numPages });
      } catch (err) {
        console.error('PDF render error:', err);
        setError('Failed to render PDF');
        onLoadError(err instanceof Error ? err : new Error('Failed to render PDF'));
      }
    };

    loadPDF();
  }, [ready, filePath, pageNumber, onLoadSuccess, onLoadError]);

  if (error) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <Text type="secondary">Loading PDF viewer...</Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #d9d9d9',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}

export default function PDFPreview({ filePath, fileName }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    setError('Failed to load PDF preview');
    setLoading(false);
    console.error('PDF load error:', error);
  }

  // For non-PDF files, show a placeholder
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    return (
      <Card style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <Text type="secondary">Preview not available for this file type</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{fileName}</Text>
        </div>
      </Card>
    );
  }

  // Don't render PDF components until mounted (client-side only)
  if (!mounted) {
    return (
      <Card style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <Text type="secondary">Loading preview...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{ width: '100%' }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>Preview</Text>
          {numPages && (
            <Space>
              <Button
                icon={<LeftOutlined />}
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
                size="small"
              >
                Previous
              </Button>
              <Text>
                Page {pageNumber} of {numPages}
              </Text>
              <Button
                icon={<RightOutlined />}
                onClick={() =>
                  setPageNumber((prev) => Math.min(numPages, prev + 1))
                }
                disabled={pageNumber >= numPages}
                size="small"
              >
                Next
              </Button>
            </Space>
          )}
        </div>
      </div>
      <div style={{ padding: '16px', overflow: 'auto', maxHeight: '800px', display: 'flex', justifyContent: 'center' }}>
        {loading && (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Text type="secondary">Loading preview...</Text>
          </div>
        )}
        {error && (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Text type="danger">{error}</Text>
          </div>
        )}
        <PDFDocumentWrapper
          filePath={filePath}
          pageNumber={pageNumber}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
        />
      </div>
    </Card>
  );
}
