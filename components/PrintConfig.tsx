'use client';

import { Form, InputNumber, Radio, Select, Slider, Row, Col, Typography } from 'antd';
import { useEffect } from 'react';
import { PrintOptions } from '@/lib/types';

const { Title } = Typography;

interface PrintConfigProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
}

export default function PrintConfig({ options, onChange }: PrintConfigProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(options);
  }, [options, form]);

  const handleValuesChange = (_: any, allValues: PrintOptions) => {
    onChange(allValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={options}
      onValuesChange={handleValuesChange}
    >
      <Title level={4} style={{ marginBottom: '16px' }}>Print Settings</Title>

      <Form.Item label="Copies" name="copies">
        <InputNumber
          min={1}
          max={999}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item label="Color Mode" name="color">
        <Radio.Group>
          <Radio value="color">Color</Radio>
          <Radio value="monochrome">Black & White</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Paper Size" name="paperSize">
        <Select>
          <Select.Option value="A4">A4</Select.Option>
          <Select.Option value="Letter">Letter</Select.Option>
          <Select.Option value="Legal">Legal</Select.Option>
          <Select.Option value="A3">A3</Select.Option>
          <Select.Option value="A5">A5</Select.Option>
          <Select.Option value="B4">B4</Select.Option>
          <Select.Option value="B5">B5</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Orientation" name="orientation">
        <Radio.Group>
          <Radio value="portrait">Portrait</Radio>
          <Radio value="landscape">Landscape</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label={`Scaling (${options.scaling || 100}%)`} name="scaling">
        <Slider
          min={25}
          max={200}
          step={5}
          marks={{
            25: '25%',
            100: '100%',
            200: '200%',
          }}
        />
      </Form.Item>

      <Form.Item label="Quality" name="quality">
        <Select>
          <Select.Option value="draft">Draft</Select.Option>
          <Select.Option value="normal">Normal</Select.Option>
          <Select.Option value="high">High</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Margins (mm)">
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item name={['margins', 'top']} noStyle>
              <InputNumber min={0} placeholder="Top" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={['margins', 'right']} noStyle>
              <InputNumber min={0} placeholder="Right" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={['margins', 'bottom']} noStyle>
              <InputNumber min={0} placeholder="Bottom" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={['margins', 'left']} noStyle>
              <InputNumber min={0} placeholder="Left" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
}
