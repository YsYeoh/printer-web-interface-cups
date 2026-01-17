'use client';

import { useEffect, useState } from 'react';
import { Select, Spin, Typography } from 'antd';
import { Printer } from '@/lib/types';
import { message } from 'antd';

const { Text } = Typography;

interface PrinterSelectorProps {
  onPrinterSelect: (printer: Printer) => void;
  selectedPrinter?: Printer;
}

export default function PrinterSelector({
  onPrinterSelect,
  selectedPrinter,
}: PrinterSelectorProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/printers');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch printers');
      }

      setPrinters(data.printers || []);
      
      // Auto-select first printer if available
      if (data.printers && data.printers.length > 0 && !selectedPrinter) {
        onPrinterSelect(data.printers[0]);
      }
    } catch (error) {
      message.error('Failed to load printers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Select
        value={selectedPrinter?.name}
        onChange={(value) => {
          const printer = printers.find((p) => p.name === value);
          if (printer) {
            onPrinterSelect(printer);
          }
        }}
        loading={loading}
        disabled={loading || printers.length === 0}
        placeholder="Select a printer"
        style={{ width: '100%' }}
        notFoundContent={loading ? <Spin size="small" /> : 'No printers available'}
      >
        {printers.map((printer) => (
          <Select.Option key={printer.name} value={printer.name}>
            {printer.name}
            {printer.description ? ` - ${printer.description}` : ''}
            {printer.status ? ` (${printer.status})` : ''}
          </Select.Option>
        ))}
      </Select>
      {!loading && printers.length === 0 && (
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Make sure CUPS is running and printers are configured
          </Text>
        </div>
      )}
    </div>
  );
}
