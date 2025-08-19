'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Card, Form, Input, Button, message, Alert, Space } from 'antd';
import { RobotOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface AIOConfig {
  llmTxtContent: string;
  aiDatasetContent: string;
  websiteUrl: string;
  businessName: string;
  businessDescription: string;
  location: string;
  businessType: string;
  specialty: string;
  instructions: string;
}

const AIOPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AIOConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/aio-config');
        const data = await response.json();
        setConfig(data);
        form.setFieldsValue(data);
      } catch (error) {
        console.error('Failed to fetch AIO config:', error);
        message.error('Failed to load AIO configuration');
      }
    };

    fetchConfig();
  }, [form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const response = await fetch('/api/aio-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        message.success('AIO settings saved successfully! Files updated in public directory.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save AIO config:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save AIO configuration');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewLLM = () => {
    const llmContent = form.getFieldValue('llmTxtContent');
    if (llmContent) {
      const blob = new Blob([llmContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handlePreviewDataset = () => {
    const datasetContent = form.getFieldValue('aiDatasetContent');
    if (datasetContent) {
      try {
        const parsed = JSON.parse(datasetContent);
        const formatted = JSON.stringify(parsed, null, 2);
        const blob = new Blob([formatted], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch {
        message.error('Invalid JSON format in AI dataset');
      }
    }
  };

  const handleViewLiveLLM = () => {
    window.open('/llm.txt', '_blank');
  };

  const handleViewLiveDataset = () => {
    window.open('/ai-dataset.json', '_blank');
  };

  return (
    <div>
      <Title level={2}>
        <RobotOutlined style={{ marginRight: 8 }} />
        AIO (AI Optimization)
      </Title>
      <Paragraph style={{ fontSize: '16px', color: '#666' }}>
        Optimize your website for Large Language Models (ChatGPT, Claude, Perplexity, etc.) to ensure your restaurant appears in AI-generated responses when people ask about dining options.
      </Paragraph>

      <Alert
        message="Why AIO Matters"
        description="Traditional SEO targets Google search. AIO targets AI models that crawl your website and reference your business in chat responses. As AI search grows, this becomes essential for digital visibility."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        {/* LLM.TXT Configuration */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              LLM.TXT Configuration
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Paragraph style={{ marginBottom: 16, color: '#666' }}>
            This file tells AI crawlers how to index your website. It will be accessible at:{' '}
            <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              {config?.websiteUrl || 'https://your-domain.com'}/llm.txt
            </code>
          </Paragraph>

          <Form.Item
            name="llmTxtContent"
            label="LLM.TXT Content"
            rules={[{ required: true, message: 'Please enter LLM.TXT content' }]}
          >
            <TextArea
              rows={20}
              placeholder="Enter your LLM.TXT content..."
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Form.Item>
        </Card>

        {/* AI Dataset Configuration */}
        <Card
          title={
            <Space>
              <DatabaseOutlined />
              AI Dataset (JSON)
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Title level={4} style={{ marginTop: 0 }}>Structured Data for AI Models</Title>
          <Paragraph style={{ marginBottom: 16, color: '#666' }}>
            Provide clean, structured data about your restaurant that AI models can easily understand and reference. This will be accessible at:{' '}
            <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              {config?.websiteUrl || 'https://your-domain.com'}/ai-dataset.json
            </code>
          </Paragraph>

          <Form.Item
            name="aiDatasetContent"
            label="AI Dataset Content (JSON)"
            rules={[
              { required: true, message: 'Please enter AI dataset content' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error('Please enter valid JSON'));
                  }
                }
              }
            ]}
          >
            <TextArea
              rows={20}
              placeholder="Enter your AI dataset JSON content..."
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <Card>
          <Space size="middle" wrap>
            <Button
              type="primary"
              size="large"
              onClick={handleSave}
              loading={loading}
              style={{ minWidth: '140px' }}
            >
              Save AIO Settings
            </Button>

            <Button
              type="default"
              size="large"
              onClick={handlePreviewLLM}
              style={{ minWidth: '140px' }}
            >
              Preview LLM.TXT
            </Button>

            <Button
              type="default"
              size="large"
              onClick={handlePreviewDataset}
              style={{ minWidth: '140px' }}
            >
              Preview AI Dataset
            </Button>

            <Button
              type="link"
              size="large"
              onClick={handleViewLiveLLM}
              style={{ minWidth: '140px' }}
            >
              View Live LLM.TXT
            </Button>

            <Button
              type="link"
              size="large"
              onClick={handleViewLiveDataset}
              style={{ minWidth: '140px' }}
            >
              View Live AI Dataset
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

export default AIOPage;
