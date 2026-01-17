'use client';

import { useState } from 'react';
import { Upload, Button, message, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

const { Text } = Typography;

interface FileUploadProps {
  onFileUploaded: (file: {
    filePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => void;
  onFileReset?: () => void;
  hasFile?: boolean;
}

export default function FileUpload({ onFileUploaded, onFileReset, hasFile }: FileUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        message.error(data.error || 'Upload failed');
        setFileList([]);
        return false;
      }

      message.success('File uploaded successfully');
      onFileUploaded(data);
      setFileList([{
        uid: '-1',
        name: file.name,
        status: 'done',
      }]);
      return false; // Prevent default upload
    } catch (error) {
      message.error('An error occurred during upload');
      console.error(error);
      setFileList([]);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    if (onFileReset) {
      onFileReset();
    }
    return true;
  };

  return (
    <div style={{ width: '100%' }}>
      {hasFile && onFileReset && (
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            Clear File
          </Button>
        </div>
      )}
      <Upload
        fileList={fileList}
        beforeUpload={handleUpload}
        onRemove={handleRemove}
        maxCount={1}
        disabled={uploading || hasFile}
        accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.ps"
      >
        <Button
          icon={<UploadOutlined />}
          disabled={uploading || hasFile}
          loading={uploading}
        >
          {uploading ? 'Uploading...' : hasFile ? 'File Uploaded' : 'Click to Upload'}
        </Button>
      </Upload>
      {hasFile && (
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            File already uploaded. Click "Clear File" to upload a new one.
          </Text>
        </div>
      )}
      <div style={{ marginTop: '8px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Supported formats: PDF, Images (PNG, JPG, GIF, BMP, TIFF), PostScript (One file only)
        </Text>
      </div>
    </div>
  );
}
